
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { Member, DocumentTemplate, Tenant, AuthSession } from './types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = (process.env as any).SUPABASE_URL || 'https://jqwsjwiuqtbqezsxnzxj.supabase.co';
const DEFAULT_SUPABASE_KEY = (process.env as any).SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impxd3Nqd2l1cXRicWV6c3huenhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4OTYzNTEsImV4cCI6MjA4NTQ3MjM1MX0.tozJMzcTcILYxN6awBp3o4rSAKNUqf_CzgJ8Swc6FTI';

interface AppContextType {
  members: Member[];
  templates: DocumentTemplate[];
  tenants: Tenant[];
  session: AuthSession;
  login: (username: string, pass: string) => boolean;
  logout: () => void;
  addTenant: (name: string, username: string, pass: string) => void;
  toggleTenantStatus: (id: string) => void;
  deleteTenant: (id: string) => void;
  addMember: (member: Member) => void;
  updateMember: (index: number, member: Member) => void;
  deleteMember: (index: number) => void;
  addTemplate: (template: DocumentTemplate) => void;
  deleteTemplate: (id: string) => void;
  importMembers: (newMembers: Member[]) => void;
  clearDatabase: () => void;
  isOnline: boolean;
  lastSync: string | null;
  syncData: () => Promise<boolean>;
  cloudConnected: boolean;
  cloudKeys: { url: string; key: string };
  updateCloudKeys: (url: string, key: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_SOCIOS = 'sga_socios_v2';
const STORAGE_TEMPLATES = 'sga_templates_v2';
const STORAGE_TENANTS = 'sga_tenants_v1';
const STORAGE_SESSION = 'sga_session';
const STORAGE_CLOUD_URL = 'sga_cloud_url';
const STORAGE_CLOUD_KEY = 'sga_cloud_key';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [session, setSession] = useState<AuthSession>({ user: null });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cloudConnected, setCloudConnected] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(localStorage.getItem('sga_last_sync'));
  
  const [cloudKeys, setCloudKeys] = useState({
    url: localStorage.getItem(STORAGE_CLOUD_URL) || DEFAULT_SUPABASE_URL,
    key: localStorage.getItem(STORAGE_CLOUD_KEY) || DEFAULT_SUPABASE_KEY
  });

  const supabase = useMemo(() => {
    if (!cloudKeys.url || !cloudKeys.key) return null;
    try {
      return createClient(cloudKeys.url, cloudKeys.key);
    } catch (e) {
      return null;
    }
  }, [cloudKeys.url, cloudKeys.key]);

  useEffect(() => {
    const savedMembers = localStorage.getItem(STORAGE_SOCIOS);
    const savedTemplates = localStorage.getItem(STORAGE_TEMPLATES);
    const savedTenants = localStorage.getItem(STORAGE_TENANTS);
    const savedSession = localStorage.getItem(STORAGE_SESSION);

    if (savedMembers) setMembers(JSON.parse(savedMembers));
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
    if (savedTenants) setTenants(JSON.parse(savedTenants));
    if (savedSession) setSession(JSON.parse(savedSession));

    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_SOCIOS, JSON.stringify(members));
    localStorage.setItem(STORAGE_TEMPLATES, JSON.stringify(templates));
    localStorage.setItem(STORAGE_TENANTS, JSON.stringify(tenants));
    localStorage.setItem(STORAGE_SESSION, JSON.stringify(session));
  }, [members, templates, tenants, session]);

  const updateCloudKeys = (url: string, key: string) => {
    setCloudKeys({ url, key });
    localStorage.setItem(STORAGE_CLOUD_URL, url);
    localStorage.setItem(STORAGE_CLOUD_KEY, key);
  };

  const syncData = async (): Promise<boolean> => {
    if (!navigator.onLine || !supabase) return false;
    
    setCloudConnected(true);
    try {
      // 1. Sincronizar Unidades
      const { data: dbTenants } = await supabase.from('tenants').select('*');
      if (dbTenants) {
        setTenants(dbTenants.map(t => ({
          id: t.id,
          name: t.name,
          adminUsername: t.admin_username,
          adminPassword: t.admin_password,
          isActive: t.is_active !== false,
          createdAt: t.created_at,
          updatedAt: t.updated_at || t.created_at
        })));
      }

      // 2. Enviar Sócios não sincronizados
      const unsynced = members.filter(m => !m.isSynced);
      if (unsynced.length > 0) {
        const payload = unsynced.map(m => {
          const { isSynced, photoUrl, dependents, ...rest } = m;
          const cleaned: any = {};
          Object.entries(rest).forEach(([k, v]) => {
            cleaned[k] = (v === "" || v === undefined) ? null : v;
          });
          return cleaned;
        });

        const { error } = await supabase.from('socios').upsert(payload, { onConflict: 'id' });
        if (error) throw error;
        
        setMembers(prev => prev.map(m => unsynced.some(u => u.id === m.id) ? { ...m, isSynced: true } : m));
      }

      // 3. Baixar Sócios da Unidade logada
      if (session.user?.tenantId) {
        const { data: remote } = await supabase.from('socios').select('*').eq('tenant_id', session.user.tenantId);
        if (remote) {
          const mapped = remote.map(rm => ({
            ...rm,
            isSynced: true,
            photoUrl: rm.foto,
            dependents: [] 
          } as Member));
          
          setMembers(prev => {
            const otherTenants = prev.filter(m => m.tenant_id !== session.user?.tenantId);
            return [...otherTenants, ...mapped];
          });
        }
      }

      const now = new Date().toLocaleString('pt-BR');
      setLastSync(now);
      localStorage.setItem('sga_last_sync', now);
      return true;
    } catch (error) {
      console.error("Erro na sincronização:", error);
      return false;
    } finally {
      setCloudConnected(false);
    }
  };

  const login = (username: string, pass: string): boolean => {
    if (username === 'admin' && pass === 'admin') {
      setSession({ user: { id: 'master', username: 'admin', role: 'SUPER_ADMIN' } });
      return true;
    }
    const tenant = tenants.find(t => t.adminUsername === username && t.adminPassword === pass);
    if (tenant) {
      if (!tenant.isActive) return (alert("Unidade Bloqueada."), false);
      setSession({ user: { id: tenant.id, username: tenant.adminUsername, role: 'REGION_USER', tenantId: tenant.id, cityName: tenant.name } });
      return true;
    }
    return false;
  };

  const logout = () => { setSession({ user: null }); localStorage.removeItem(STORAGE_SESSION); };

  const addMember = (m: Member) => {
    if (!session.user?.tenantId) return;
    const newM = { ...m, id: m.id || crypto.randomUUID(), tenant_id: session.user.tenantId, updated_at: new Date().toISOString(), isSynced: false };
    setMembers(prev => [...prev, newM]);
  };

  const updateMember = (index: number, m: Member) => {
    setMembers(prev => {
      const idx = prev.findIndex(item => item.id === m.id);
      if (idx === -1) return prev;
      const copy = [...prev];
      copy[idx] = { ...m, updated_at: new Date().toISOString(), isSynced: false };
      return copy;
    });
  };

  const deleteMember = (index: number) => {
    const list = getFilteredMembers();
    const toDelete = list[index];
    if (toDelete) {
      setMembers(prev => prev.filter(m => m.id !== toDelete.id));
      if (supabase) supabase.from('socios').delete().eq('id', toDelete.id).then();
    }
  };

  const importMembers = (newList: Member[]) => setMembers(prev => [...prev, ...newList]);
  const clearDatabase = () => { if (confirm('Limpar?')) setMembers([]); };

  const addTenant = async (name: string, username: string, pass: string) => {
    const newT: Tenant = { id: crypto.randomUUID(), name, adminUsername: username, adminPassword: pass, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    setTenants(prev => [...prev, newT]);
    if (supabase) await supabase.from('tenants').insert([{ id: newT.id, name: newT.name, admin_username: newT.adminUsername, admin_password: newT.adminPassword, is_active: true }]);
  };

  const toggleTenantStatus = async (id: string) => {
    const t = tenants.find(x => x.id === id);
    if (!t) return;
    const ns = !t.isActive;
    setTenants(prev => prev.map(x => x.id === id ? { ...x, isActive: ns } : x));
    if (supabase) await supabase.from('tenants').update({ is_active: ns }).eq('id', id);
  };

  const deleteTenant = async (id: string) => {
    setTenants(prev => prev.filter(x => x.id !== id));
    if (supabase) await supabase.from('tenants').delete().eq('id', id);
  };

  const addTemplate = (t: DocumentTemplate) => {
    if (!session.user?.tenantId) return;
    const nt = { ...t, tenantId: session.user.tenantId, id: t.id || crypto.randomUUID() };
    setTemplates([...templates, nt]);
    if (supabase) supabase.from('document_templates').upsert([{ id: nt.id, tenant_id: nt.tenantId, name: nt.name, category: nt.category, header: nt.header, content: nt.content, footer: nt.footer }]).then();
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(x => x.id !== id));
    if (supabase) supabase.from('document_templates').delete().eq('id', id).then();
  };

  const getFilteredMembers = () => {
    if (!session.user) return [];
    if (session.user.role === 'SUPER_ADMIN') return members;
    return members.filter(m => m.tenant_id === session.user?.tenantId);
  };

  return (
    <AppContext.Provider value={{ 
      members: getFilteredMembers(), 
      templates: session.user?.role === 'SUPER_ADMIN' ? templates : templates.filter(t => t.tenantId === session.user?.tenantId),
      tenants, session, login, logout, addTenant, toggleTenantStatus, deleteTenant,
      addMember, updateMember, deleteMember, addTemplate, deleteTemplate,
      importMembers, clearDatabase, isOnline, lastSync, syncData, cloudConnected,
      cloudKeys, updateCloudKeys
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp error');
  return context;
};
