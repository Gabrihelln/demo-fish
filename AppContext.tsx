
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { Member, DocumentTemplate, Tenant, AuthSession } from './types';
import { createClient } from '@supabase/supabase-js';
import { EMPTY_MEMBER } from './constants';

const DEFAULT_SUPABASE_URL = (process.env as any).SUPABASE_URL || 'https://jqwsjwiuqtbqezsxnzxj.supabase.co';
const DEFAULT_SUPABASE_KEY = (process.env as any).SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impxd3Nqd2l1cXRicWV6c3huenhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4OTYzNTEsImV4cCI6MjA4NTQ3MjM1MX0.tozJMzcTcILYxN6awBp3o4rSAKNUqf_CzgJ8Swc6FTI';

interface SyncResult {
  success: boolean;
  count: number;
  tenants: Tenant[];
}

interface AppContextType {
  members: Member[];
  templates: DocumentTemplate[];
  tenants: Tenant[];
  session: AuthSession;
  isAppReady: boolean;
  login: (username: string, pass: string, tenantList?: Tenant[]) => boolean;
  logout: () => void;
  addTenant: (name: string, username: string, pass: string) => Promise<void>;
  toggleTenantStatus: (id: string) => Promise<void>;
  deleteTenant: (id: string) => Promise<void>;
  addMember: (member: Member) => void;
  updateMember: (index: number, member: Member) => void;
  deleteMember: (index: number) => void;
  addTemplate: (template: DocumentTemplate) => void;
  deleteTemplate: (id: string) => void;
  importMembers: (newMembers: Member[]) => void;
  clearDatabase: () => void;
  isOnline: boolean;
  lastSync: string | null;
  syncData: () => Promise<SyncResult>;
  cloudConnected: boolean;
  cloudKeys: { url: string; key: string };
  updateCloudKeys: (url: string, key: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_TEMPLATES = 'sga_templates_v2';
const STORAGE_TENANTS = 'sga_tenants_v1';
const STORAGE_SESSION = 'sga_session';
const STORAGE_CLOUD_URL = 'sga_cloud_url';
const STORAGE_CLOUD_KEY = 'sga_cloud_key';
const DB_NAME = 'SGA_DATABASE_V3';
const STORE_NAME = 'members';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [session, setSession] = useState<AuthSession>({ user: null });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAppReady, setIsAppReady] = useState(false);
  const [cloudConnected, setCloudConnected] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(localStorage.getItem('sga_last_sync'));
  
  const [cloudKeys, setCloudKeys] = useState({
    url: localStorage.getItem(STORAGE_CLOUD_URL) || DEFAULT_SUPABASE_URL,
    key: localStorage.getItem(STORAGE_CLOUD_KEY) || DEFAULT_SUPABASE_KEY
  });

  const supabase = useMemo(() => {
    if (!cloudKeys.url || !cloudKeys.key) return null;
    try { return createClient(cloudKeys.url, cloudKeys.key); } catch (e) { return null; }
  }, [cloudKeys.url, cloudKeys.key]);

  useEffect(() => {
    const boot = async () => {
      try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = () => {
          const dbMembers = request.result || [];
          const st = localStorage.getItem(STORAGE_TEMPLATES);
          const sn = localStorage.getItem(STORAGE_TENANTS);
          const ss = localStorage.getItem(STORAGE_SESSION);

          if (dbMembers.length > 0) setAllMembers(dbMembers);
          if (st) setTemplates(JSON.parse(st));
          if (sn) setTenants(JSON.parse(sn));
          if (ss) setSession(JSON.parse(ss));
          
          setIsAppReady(true);
        };
      } catch (e) {
        setIsAppReady(true);
      }
    };
    boot();
  }, []);

  useEffect(() => {
    if (!isAppReady) return;
    const save = async () => {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      await store.clear();
      allMembers.forEach(m => { if (m.id) store.put(m); });
    };
    save();
    localStorage.setItem(STORAGE_TEMPLATES, JSON.stringify(templates));
    localStorage.setItem(STORAGE_TENANTS, JSON.stringify(tenants));
    localStorage.setItem(STORAGE_SESSION, JSON.stringify(session));
  }, [allMembers, templates, tenants, session, isAppReady]);

  const sanitize = (m: any, forcedTenantId?: string): Member => {
    const member = { ...EMPTY_MEMBER };
    const tid = m.tenant_id || m.tenantId || forcedTenantId || session.user?.tenantId || "";
    
    Object.keys(EMPTY_MEMBER).forEach(key => {
      let val = m[key] !== undefined ? m[key] : "";
      if (key === 'dependents') {
        let deps = val;
        if (typeof deps === 'string' && deps !== "") {
            try { deps = JSON.parse(deps); } catch(e) { deps = []; }
        }
        member.dependents = Array.isArray(deps) ? deps : [];
      } else {
        member[key] = (val === null || val === undefined) ? "" : String(val);
      }
    });

    if (!member.id) member.id = crypto.randomUUID();
    member.tenantId = tid;
    member.tenant_id = tid;
    member.isSynced = m.isSynced === true;
    
    return member as Member;
  };

  const syncData = async (): Promise<SyncResult> => {
    if (!navigator.onLine || !supabase) return { success: false, count: 0, tenants };
    setCloudConnected(true);
    
    try {
      const { data: dbTenants, error: tError } = await supabase.from('tenants').select('*');
      let freshTenants = tenants;
      if (dbTenants && !tError) {
        freshTenants = dbTenants.map(t => ({
          id: t.id, name: t.name, adminUsername: t.admin_username,
          adminPassword: t.admin_password, isActive: t.is_active !== false,
          createdAt: t.created_at, updatedAt: t.updated_at || t.created_at
        }));
        setTenants(freshTenants);
      }

      if (!session.user) return { success: true, count: 0, tenants: freshTenants };

      const isSuperAdmin = session.user.role === 'SUPER_ADMIN';
      const currentTid = session.user.tenantId;

      // PUSH: Envia dados locais não sincronizados
      const unsynced = allMembers.filter(m => {
        const syncStatus = !m.isSynced;
        if (isSuperAdmin) return syncStatus;
        return syncStatus && m.tenantId === currentTid;
      });

      if (unsynced.length > 0) {
        const payload = unsynced.map(m => {
          // EXCLUÍMOS 'dependents' e 'foto' do payload porque a coluna não existe no Supabase
          const { isSynced, photoUrl, tenantId, updatedAt, dependents, foto, ...rest } = m;
          const cleaned: any = {};
          
          Object.entries(rest).forEach(([k, v]) => { 
            cleaned[k] = v === "" ? null : v; 
          });
          
          // Garante o ID da unidade
          cleaned.tenant_id = m.tenant_id || m.tenantId || currentTid;
          return cleaned;
        });

        const { error: upsertError } = await supabase.from('socios').upsert(payload, { onConflict: 'id' });
        
        if (upsertError) {
          console.error("Erro no Upsert:", upsertError);
          throw new Error(upsertError.message);
        }

        // Se deu certo, marca localmente como sincronizado
        const syncedIds = unsynced.map(m => m.id);
        setAllMembers(prev => prev.map(m => 
          syncedIds.includes(m.id) ? { ...m, isSynced: true } : m
        ));
      }

      // PULL: Baixa dados atualizados
      let pullQuery = supabase.from('socios').select('*');
      if (!isSuperAdmin && currentTid) {
        pullQuery = pullQuery.eq('tenant_id', currentTid);
      }

      const { data: remote, error: pullError } = await pullQuery;
      if (!pullError && remote) {
        const mappedRemote = remote.map(rm => sanitize(rm));
        setAllMembers(prev => {
          const map = new Map(prev.map(p => [p.id, p]));
          mappedRemote.forEach(r => { 
            r.isSynced = true; 
            map.set(r.id, r); 
          });
          return Array.from(map.values());
        });
      }

      const now = new Date().toLocaleString('pt-BR');
      setLastSync(now);
      localStorage.setItem('sga_last_sync', now);
      return { success: true, count: unsynced.length, tenants: freshTenants };
    } catch (e: any) {
      console.error("Erro na Sincronização:", e.message);
      return { success: false, count: 0, tenants };
    } finally {
      setCloudConnected(false);
    }
  };

  const login = (username: string, pass: string, tenantList?: Tenant[]): boolean => {
    const list = tenantList || tenants;
    if (username === 'admin' && pass === 'admin') {
      setSession({ user: { id: 'master', username: 'admin', role: 'SUPER_ADMIN' } });
      return true;
    }
    const t = list.find(x => x.adminUsername === username && x.adminPassword === pass);
    if (t && t.isActive) {
      setSession({ user: { id: t.id, username: t.adminUsername, role: 'REGION_USER', tenantId: t.id, cityName: t.name } });
      return true;
    }
    return false;
  };

  const currentMembers = useMemo(() => {
    if (!session.user || !isAppReady) return [];
    if (session.user.role === 'SUPER_ADMIN') return allMembers;
    const tid = session.user.tenantId;
    return allMembers.filter(m => m.tenantId === tid || m.tenant_id === tid);
  }, [allMembers, session.user, isAppReady]);

  const value = {
    members: currentMembers, templates, tenants, session, isAppReady, login,
    logout: () => setSession({ user: null }),
    addTenant: async (name: string, user: string, pass: string) => {
      const id = crypto.randomUUID();
      const payload = { id, name, admin_username: user, admin_password: pass, is_active: true, created_at: new Date().toISOString() };
      if (supabase) await supabase.from('tenants').insert([payload]);
      setTenants(prev => [...prev, { id, name, adminUsername: user, adminPassword: pass, isActive: true, createdAt: payload.created_at, updatedAt: payload.created_at }]);
    },
    toggleTenantStatus: async (id: string) => {
      const t = tenants.find(x => x.id === id);
      if (!t) return;
      if (supabase) await supabase.from('tenants').update({ is_active: !t.isActive }).eq('id', id);
      setTenants(prev => prev.map(x => x.id === id ? { ...x, isActive: !x.isActive } : x));
    },
    deleteTenant: async (id: string) => {
      if (supabase) await supabase.from('tenants').delete().eq('id', id);
      setTenants(prev => prev.filter(x => x.id !== id));
    },
    addMember: (m: Member) => setAllMembers(prev => [...prev, sanitize(m)]),
    updateMember: (index: number, m: Member) => {
      const target = currentMembers[index];
      if (target) setAllMembers(prev => prev.map(p => p.id === target.id ? sanitize(m) : p));
    },
    deleteMember: (index: number) => {
      const target = currentMembers[index];
      if (target) setAllMembers(prev => prev.filter(p => p.id !== target.id));
    },
    addTemplate: (t: DocumentTemplate) => setTemplates(prev => [...prev, { ...t, tenantId: session.user?.tenantId || '' }]),
    deleteTemplate: (id: string) => setTemplates(prev => prev.filter(x => x.id !== id)),
    importMembers: (list: Member[]) => setAllMembers(prev => {
      const map = new Map(prev.map(p => [p.id, p]));
      list.forEach(l => { 
        const s = sanitize({...l, isSynced: false}); 
        map.set(s.id, s); 
      });
      return Array.from(map.values());
    }),
    clearDatabase: () => { setAllMembers([]); setTemplates([]); setTenants([]); },
    isOnline, lastSync, syncData, cloudConnected, cloudKeys, 
    updateCloudKeys: (url: string, key: string) => { setCloudKeys({ url, key }); localStorage.setItem(STORAGE_CLOUD_URL, url); localStorage.setItem(STORAGE_CLOUD_KEY, key); }
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
