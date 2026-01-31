
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Member, DocumentTemplate, Tenant, AuthSession } from './types';
import { createClient } from '@supabase/supabase-js';

// NOTA: Em produção, estas chaves devem vir de variáveis de ambiente seguras.
// Assumindo que o ambiente proverá SUPABASE_URL e SUPABASE_ANON_KEY ou similar.
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
  syncData: () => Promise<void>;
  cloudConnected: boolean;
  // Fix: Added missing properties to satisfy AdminPanel.tsx requirements
  cloudKeys: { url: string; key: string };
  updateCloudKeys: (url: string, key: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_MEMBERS = 'sga_members_v2';
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
  
  // Fix: Initialize cloudKeys from localStorage or defaults
  const [cloudKeys, setCloudKeys] = useState({
    url: localStorage.getItem(STORAGE_CLOUD_URL) || DEFAULT_SUPABASE_URL,
    key: localStorage.getItem(STORAGE_CLOUD_KEY) || DEFAULT_SUPABASE_KEY
  });

  useEffect(() => {
    const savedMembers = localStorage.getItem(STORAGE_MEMBERS);
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
    localStorage.setItem(STORAGE_MEMBERS, JSON.stringify(members));
    localStorage.setItem(STORAGE_TEMPLATES, JSON.stringify(templates));
    localStorage.setItem(STORAGE_TENANTS, JSON.stringify(tenants));
    localStorage.setItem(STORAGE_SESSION, JSON.stringify(session));
  }, [members, templates, tenants, session]);

  // Fix: Helper to get a dynamic Supabase client instance using current cloudKeys
  const getSupabase = () => {
    if (!cloudKeys.url || !cloudKeys.key) return null;
    try {
      return createClient(cloudKeys.url, cloudKeys.key);
    } catch (e) {
      console.error("Supabase client initialization failed", e);
      return null;
    }
  };

  const updateCloudKeys = (url: string, key: string) => {
    setCloudKeys({ url, key });
    localStorage.setItem(STORAGE_CLOUD_URL, url);
    localStorage.setItem(STORAGE_CLOUD_KEY, key);
  };

  const syncData = async () => {
    if (!navigator.onLine) return alert("Você está offline.");
    const supabase = getSupabase();
    if (!supabase) return alert("Supabase não configurado corretamente. Verifique as chaves no Painel Admin.");
    
    setCloudConnected(true);
    try {
      // 1. Sincronizar Tenants
      const { data: dbTenants } = await supabase.from('tenants').select('*');
      if (dbTenants) setTenants(dbTenants);

      // 2. Enviar Sócios não sincronizados
      const unsyncedMembers = members.filter(m => !m.isSynced);
      if (unsyncedMembers.length > 0) {
        const payload = unsyncedMembers.map(m => ({
          id: m.id.includes('migrated_') ? undefined : m.id,
          tenant_id: m.tenantId,
          full_name: m.fullName,
          registration: m.registration,
          cpf: m.cpf,
          status: m.status,
          updated_at: m.updatedAt,
          data_raw: m // Salva o objeto completo no JSONB para redundância
        }));
        
        const { error: mError } = await supabase.from('members').upsert(payload);
        if (mError) throw mError;
      }

      // 3. Baixar Sócios novos
      if (session.user?.tenantId) {
        const { data: remoteMembers } = await supabase
          .from('members')
          .select('*')
          .eq('tenant_id', session.user?.tenantId);
        
        if (remoteMembers) {
          const merged = remoteMembers.map(rm => ({
            ...rm.data_raw,
            id: rm.id,
            tenantId: rm.tenant_id,
            isSynced: true
          }));
          setMembers(merged);
        }
      }

      const now = new Date().toLocaleString('pt-BR');
      setLastSync(now);
      localStorage.setItem('sga_last_sync', now);
      setCloudConnected(false);
      alert("Nuvem Supabase atualizada com sucesso!");
    } catch (error: any) {
      console.error("Sync Error:", error);
      alert("Erro na sincronização: " + error.message);
      setCloudConnected(false);
    }
  };

  const login = (username: string, pass: string): boolean => {
    if (username === 'admin' && pass === 'admin') {
      setSession({ user: { id: 'master', username: 'admin', role: 'SUPER_ADMIN' } });
      return true;
    }
    const tenant = tenants.find(t => t.adminUsername === username && t.adminPassword === pass);
    if (tenant?.isActive) {
      setSession({ user: { id: tenant.id, username: tenant.adminUsername, role: 'REGION_USER', tenantId: tenant.id, cityName: tenant.name } });
      return true;
    }
    return false;
  };

  const logout = () => {
    setSession({ user: null });
    localStorage.removeItem(STORAGE_SESSION);
  };

  const addMember = (m: Member) => {
    if (!session.user?.tenantId) return;
    setMembers([...members, { 
      ...m, 
      id: m.id || crypto.randomUUID(), 
      tenantId: session.user.tenantId, 
      updatedAt: new Date().toISOString(),
      isSynced: false 
    }]);
  };

  const updateMember = (index: number, m: Member) => {
    const newMembers = [...members];
    const globalIdx = members.findIndex(orig => orig.id === m.id);
    if (globalIdx !== -1) {
      newMembers[globalIdx] = { ...m, updatedAt: new Date().toISOString(), isSynced: false };
      setMembers(newMembers);
    }
  };

  const deleteMember = (index: number) => {
    const filtered = getFilteredMembers();
    const item = filtered[index];
    if (item) {
      setMembers(members.filter(m => m.id !== item.id));
      const supabase = getSupabase();
      if (supabase && !item.id.includes('migrated')) {
         supabase.from('members').delete().eq('id', item.id).then();
      }
    }
  };

  const importMembers = (newMembers: Member[]) => {
    setMembers(prev => [...prev, ...newMembers]);
  };

  const clearDatabase = () => {
    if (confirm('Deseja apagar TUDO da base local?')) setMembers([]);
  };

  const addTenant = (name: string, username: string, pass: string) => {
    const newTenant: Tenant = { 
        id: crypto.randomUUID(), 
        name, 
        adminUsername: username, 
        adminPassword: pass, 
        isActive: true, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
    };
    setTenants([...tenants, newTenant]);
    const supabase = getSupabase();
    if (supabase) {
        supabase.from('tenants').insert([{
            id: newTenant.id,
            name: newTenant.name,
            admin_username: newTenant.adminUsername,
            admin_password: newTenant.adminPassword,
            is_active: newTenant.isActive
        }]).then();
    }
  };

  const toggleTenantStatus = (id: string) => {
    const updated = tenants.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t);
    setTenants(updated);
    const supabase = getSupabase();
    if (supabase) {
        const tenant = updated.find(t => t.id === id);
        supabase.from('tenants').update({ is_active: tenant?.isActive }).eq('id', id).then();
    }
  };

  const deleteTenant = (id: string) => {
    setTenants(tenants.filter(t => t.id !== id));
    const supabase = getSupabase();
    if (supabase) supabase.from('tenants').delete().eq('id', id).then();
  };

  const addTemplate = (t: DocumentTemplate) => {
    if (!session.user?.tenantId) return;
    const nt = { ...t, tenantId: session.user.tenantId, id: t.id || crypto.randomUUID() };
    setTemplates([...templates, nt]);
    const supabase = getSupabase();
    if (supabase) {
        supabase.from('document_templates').upsert([{
            id: nt.id,
            tenant_id: nt.tenantId,
            name: nt.name,
            category: nt.category,
            header: nt.header,
            content: nt.content,
            footer: nt.footer
        }]).then();
    }
  };

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    const supabase = getSupabase();
    if (supabase) supabase.from('document_templates').delete().eq('id', id).then();
  };

  const getFilteredMembers = () => {
    if (!session.user) return [];
    if (session.user.role === 'SUPER_ADMIN') return members;
    return members.filter(m => m.tenantId === session.user?.tenantId);
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
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
