
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useRef } from 'react';
import { Member, DocumentTemplate, Tenant, AuthSession } from './types';
import { createClient } from '@supabase/supabase-js';
import { EMPTY_MEMBER } from './constants';

const DEFAULT_SUPABASE_URL = (process.env as any).SUPABASE_URL || 'https://jqwsjwiuqtbqezsxnzxj.supabase.co';
const DEFAULT_SUPABASE_KEY = (process.env as any).SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impxd3Nqd2l1cXRicWV6c3huenhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4OTYzNTEsImV4cCI6MjA4NTQ3MjM1MX0.tozJMzcTcILYxN6awBp3o4rSAKNUqf_CzgJ8Swc6FTI';

interface SyncResult {
  success: boolean;
  count: number;
  tenants?: Tenant[];
}

interface AppContextType {
  members: Member[];
  templates: DocumentTemplate[];
  tenants: Tenant[];
  session: AuthSession;
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
const DB_VERSION = 1;
const STORE_NAME = 'members';

const DATE_FIELDS = [
  'data_admissao', 'recadastro', 'data_nascimento', 'validade_dap', 
  'data_expedicao_rg', 'data_expedicao_ctps', 'data_emissao_rgp', 
  'data_falecimento', 'data_transferencia', 'data_ultimo_pagamento',
  'primeira_data_pagamento', 'ultimo_dia_pago', 'data_ultimo_movimento'
];

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
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

const saveMembersToDB = async (members: Member[]) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  store.clear();
  members.forEach(m => {
    if (m && m.id) store.put(m);
  });
  return new Promise((resolve) => { tx.oncomplete = resolve; });
};

const getMembersFromDB = async (): Promise<Member[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
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
  const [cloudConnected, setCloudConnected] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(localStorage.getItem('sga_last_sync'));
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  
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

  // Carregamento inicial de dados
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const dbMembers = await getMembersFromDB();
        if (dbMembers && dbMembers.length > 0) {
          setAllMembers(dbMembers);
        }
      } catch (e) { console.error("Erro IDB:", e); }

      try {
        const st = localStorage.getItem(STORAGE_TEMPLATES);
        const sn = localStorage.getItem(STORAGE_TENANTS);
        const ss = localStorage.getItem(STORAGE_SESSION);
        if (st) setTemplates(JSON.parse(st));
        if (sn) setTenants(JSON.parse(sn));
        if (ss) setSession(JSON.parse(ss));
      } catch (e) { console.error("Erro LS:", e); }
      
      setIsInitialLoadComplete(true);
    };
    loadInitialData();
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  // Persistência automática no IndexedDB quando 'allMembers' muda
  useEffect(() => {
    // IMPORTANTE: Só salva se o carregamento inicial terminou, 
    // para evitar que o estado inicial vazio [] limpe o banco de dados.
    if (isInitialLoadComplete) {
      saveMembersToDB(allMembers).catch(console.error);
    }
  }, [allMembers, isInitialLoadComplete]);

  useEffect(() => {
    if (isInitialLoadComplete) {
      localStorage.setItem(STORAGE_TEMPLATES, JSON.stringify(templates));
      localStorage.setItem(STORAGE_TENANTS, JSON.stringify(tenants));
      localStorage.setItem(STORAGE_SESSION, JSON.stringify(session));
    }
  }, [templates, tenants, session, isInitialLoadComplete]);

  const updateCloudKeys = (url: string, key: string) => {
    setCloudKeys({ url, key });
    localStorage.setItem(STORAGE_CLOUD_URL, url);
    localStorage.setItem(STORAGE_CLOUD_KEY, key);
  };

  const sanitize = (m: any): Member => {
    const member: any = { ...EMPTY_MEMBER };
    if (m && typeof m === 'object') {
      Object.keys(EMPTY_MEMBER).forEach(key => {
        let val = m[key] !== undefined ? m[key] : (m[key === 'tenantId' ? 'tenant_id' : (key === 'tenant_id' ? 'tenantId' : key)]);
        
        if (key === 'dependents') {
          let deps = val;
          if (typeof deps === 'string') {
            try { deps = JSON.parse(deps); } catch(e) { deps = []; }
          }
          member.dependents = Array.isArray(deps) ? deps : [];
        } else if (key === 'isSynced') {
          member.isSynced = !!val;
        } else if (DATE_FIELDS.includes(key)) {
          if (val && typeof val === 'string' && val !== "" && val !== "null") {
            const match = val.match(/^(\d{4}-\d{2}-\d{2})/);
            member[key] = match ? match[1] : val;
          } else {
            member[key] = "";
          }
        } else {
          member[key] = (val === null || val === undefined || val === 'null' || val === 'undefined') ? "" : String(val);
        }
      });
    }
    if (!member.id || member.id === "") member.id = crypto.randomUUID();
    
    // Sincroniza tenantId e tenant_id
    if (!member.tenantId || member.tenantId === "" || member.tenantId === "undefined") {
        member.tenantId = m.tenant_id || session.user?.tenantId || "";
    }
    member.tenant_id = member.tenantId;
    
    return member as Member;
  };

  const syncData = async (): Promise<SyncResult> => {
    if (!navigator.onLine || !supabase) return { success: false, count: 0 };
    setCloudConnected(true);
    let syncedCount = 0;
    let freshTenants: Tenant[] = [];
    
    try {
      // 1. Sincroniza Unidades (Tenants)
      const { data: dbTenants } = await supabase.from('tenants').select('*');
      if (dbTenants) {
        freshTenants = dbTenants.map(t => ({
          id: t.id, name: t.name, adminUsername: t.admin_username,
          adminPassword: t.admin_password, isActive: t.is_active !== false,
          createdAt: t.created_at, updatedAt: t.updated_at || t.created_at
        }));
        setTenants(freshTenants);
      }

      if (!session.user) return { success: true, count: 0, tenants: freshTenants };

      const currentTid = session.user.tenantId;

      // 2. Push: Envia dados locais novos/alterados para a nuvem
      const unsynced = allMembers.filter(m => {
        const matchesTenant = session.user?.role === 'SUPER_ADMIN' || m.tenant_id === currentTid || m.tenantId === currentTid;
        return !m.isSynced && matchesTenant;
      });

      if (unsynced.length > 0) {
        const payload = unsynced.map(m => {
          const { isSynced, photoUrl, tenantId, updatedAt, updated_at, dependents, ...rest } = m;
          const cleaned: any = {};
          Object.entries(rest).forEach(([k, v]) => {
            cleaned[k] = (v === "" || v === null || v === undefined) ? null : v;
          });
          cleaned.tenant_id = m.tenantId || m.tenant_id || currentTid;
          return cleaned;
        }).filter(p => p.tenant_id && p.id);

        if (payload.length > 0) {
          const { error: upsertError } = await supabase.from('socios').upsert(payload, { onConflict: 'id' });
          if (upsertError) throw upsertError;
          syncedCount = payload.length;
        }
      }

      // 3. Pull: Baixa dados da nuvem
      let query = supabase.from('socios').select('*');
      if (session.user.role !== 'SUPER_ADMIN' && currentTid) {
        query = query.eq('tenant_id', currentTid);
      }

      const { data: remote, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      if (remote && Array.isArray(remote)) {
        const mappedRemote = remote.map(rm => sanitize({...rm, isSynced: true}));
        
        setAllMembers(prev => {
          // No Super Admin, os dados remotos são a verdade absoluta para visualização global
          if (session.user?.role === 'SUPER_ADMIN') return mappedRemote;
          
          // No usuário de região, mantemos os registros de outros tenants e 
          // mesclamos os remotos com os locais que ainda não foram sincronizados
          const others = prev.filter(m => m.tenant_id !== currentTid && m.tenantId !== currentTid);
          const localUnsynced = prev.filter(m => (m.tenant_id === currentTid || m.tenantId === currentTid) && !m.isSynced);
          
          // Evita duplicatas se um item sincronizado localmente acabou de vir do remote
          const unsyncedToKeep = localUnsynced.filter(lu => !mappedRemote.some(rm => rm.id === lu.id));
          
          return [...others, ...mappedRemote, ...unsyncedToKeep];
        });
      }

      const now = new Date().toLocaleString('pt-BR');
      setLastSync(now);
      localStorage.setItem('sga_last_sync', now);
      return { success: true, count: syncedCount, tenants: freshTenants };
    } catch (e: any) {
      console.error("Erro Sincronização:", e);
      return { success: false, count: 0 };
    } finally {
      setCloudConnected(false);
    }
  };

  const login = (username: string, pass: string, tenantList?: Tenant[]): boolean => {
    const listToSearch = tenantList || tenants;
    if (username === 'admin' && pass === 'admin') {
      const newSession: AuthSession = { user: { id: 'master', username: 'admin', role: 'SUPER_ADMIN' } };
      setSession(newSession);
      return true;
    }
    const t = listToSearch.find(x => x.adminUsername === username && x.adminPassword === pass);
    if (t && t.isActive) {
      const newSession: AuthSession = { user: { id: t.id, username: t.adminUsername, role: 'REGION_USER', tenantId: t.id, cityName: t.name } };
      setSession(newSession);
      return true;
    }
    return false;
  };

  const logout = () => { setSession({ user: null }); };

  const currentMembers = useMemo(() => {
    if (!session.user) return [];
    if (session.user.role === 'SUPER_ADMIN') return allMembers;
    const tid = session.user.tenantId;
    return allMembers.filter(m => m && (m.tenant_id === tid || m.tenantId === tid));
  }, [allMembers, session.user]);

  const addTenant = async (name: string, username: string, pass: string) => {
    const newId = crypto.randomUUID();
    const newTenantData: any = {
      id: newId,
      name,
      admin_username: username,
      admin_password: pass,
      is_active: true,
      created_at: new Date().toISOString()
    };

    if (supabase) {
        const { error } = await supabase.from('tenants').insert([newTenantData]);
        if (error) {
            console.error("Erro ao criar tenant na nuvem:", error);
            alert("Erro ao salvar unidade no servidor.");
            return;
        }
    }

    const localTenant: Tenant = {
        id: newId,
        name,
        adminUsername: username,
        adminPassword: pass,
        isActive: true,
        createdAt: newTenantData.created_at,
        updatedAt: newTenantData.created_at
    };

    setTenants(prev => [...prev, localTenant]);
  };

  const toggleTenantStatus = async (id: string) => {
    const target = tenants.find(t => t.id === id);
    if (!target) return;
    const newStatus = !target.isActive;

    if (supabase) {
        const { error } = await supabase.from('tenants').update({ is_active: newStatus }).eq('id', id);
        if (error) {
            alert("Erro ao atualizar status no servidor.");
            return;
        }
    }
    
    setTenants(prev => prev.map(t => t.id === id ? { ...t, isActive: newStatus, updatedAt: new Date().toISOString() } : t));
  };

  const deleteTenant = async (id: string) => {
    if (supabase) {
        const { error } = await supabase.from('tenants').delete().eq('id', id);
        if (error) {
            alert("Erro ao excluir unidade no servidor.");
            return;
        }
    }
    setTenants(prev => prev.filter(t => t.id !== id));
  };

  const addMember = (m: Member) => {
    const newM = sanitize({ ...m, isSynced: false, updatedAt: new Date().toISOString() });
    setAllMembers(prev => [...prev, newM]);
  };

  const updateMember = (index: number, m: Member) => {
    const target = currentMembers[index];
    if (!target) return;
    setAllMembers(prev => prev.map(item => item.id === target.id ? sanitize({ ...m, isSynced: false, updatedAt: new Date().toISOString() }) : item));
  };

  const deleteMember = (index: number) => {
    const target = currentMembers[index];
    if (!target) return;
    setAllMembers(prev => prev.filter(item => item.id !== target.id));
  };

  const addTemplate = (template: DocumentTemplate) => {
    setTemplates(prev => [...prev, { ...template, tenantId: session.user?.tenantId || '', updatedAt: new Date().toISOString() }]);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const importMembers = (newMembers: Member[]) => {
    const sanitized = newMembers.map(m => sanitize(m));
    setAllMembers(prev => [...prev, ...sanitized]);
  };

  const clearDatabase = () => {
    setAllMembers([]);
    setTemplates([]);
    setTenants([]);
    openDB().then(db => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
    });
  };

  const value = {
    members: currentMembers, templates, tenants, session, login, logout,
    addTenant, toggleTenantStatus, deleteTenant, addMember, updateMember,
    deleteMember, addTemplate, deleteTemplate, importMembers, clearDatabase,
    isOnline, lastSync, syncData, cloudConnected, cloudKeys, updateCloudKeys
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
