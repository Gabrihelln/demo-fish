
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { Member, DocumentTemplate, Tenant, AuthSession, Category, Locality } from './types';
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
  categories: Category[];
  localities: Locality[];
  session: AuthSession;
  isAppReady: boolean;
  login: (username: string, pass: string, tenantList?: Tenant[]) => Promise<boolean>;
  logout: () => void;
  addTenant: (name: string, username: string, pass: string) => Promise<void>;
  toggleTenantStatus: (id: string) => Promise<void>;
  deleteTenant: (id: string) => Promise<void>;
  addMember: (member: Member) => void;
  updateMember: (index: number, member: Member) => void;
  deleteMember: (index: number) => void;
  addTemplate: (template: DocumentTemplate) => void;
  deleteTemplate: (id: string) => void;
  addCategory: (category: Omit<Category, 'isSynced'>) => void;
  updateCategory: (id: string, category: Omit<Category, 'isSynced'>) => void;
  deleteCategory: (id: string) => Promise<void>;
  addLocality: (locality: Omit<Locality, 'isSynced'>) => void;
  updateLocality: (id: string, locality: Omit<Locality, 'isSynced'>) => void;
  deleteLocality: (id: string) => Promise<void>;
  importMembers: (newMembers: Member[]) => Member[];
  clearDatabase: () => void;
  isOnline: boolean;
  lastSync: string | null;
  syncData: (overrideMembers?: Member[], overrideCategories?: Category[], overrideLocalities?: Locality[]) => Promise<SyncResult>;
  cloudConnected: boolean;
  cloudKeys: { url: string; key: string };
  updateCloudKeys: (url: string, key: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DB_NAME = 'SGA_DATABASE_V6'; 
const STORE_MEMBERS = 'members';
const STORE_CATEGORIES = 'categories';
const STORE_LOCALITIES = 'localities';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_MEMBERS)) db.createObjectStore(STORE_MEMBERS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_CATEGORIES)) db.createObjectStore(STORE_CATEGORIES, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_LOCALITIES)) db.createObjectStore(STORE_LOCALITIES, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allLocalities, setAllLocalities] = useState<Locality[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [session, setSession] = useState<AuthSession>(() => {
    const saved = localStorage.getItem('sga_session');
    return saved ? JSON.parse(saved) : { user: null };
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAppReady, setIsAppReady] = useState(false);
  const [cloudConnected, setCloudConnected] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(localStorage.getItem('sga_last_sync'));
  
  const [cloudKeys, setCloudKeys] = useState({
    url: localStorage.getItem('sga_cloud_url') || DEFAULT_SUPABASE_URL,
    key: localStorage.getItem('sga_cloud_key') || DEFAULT_SUPABASE_KEY
  });

  const supabase = useMemo(() => {
    if (!cloudKeys.url || !cloudKeys.key) return null;
    try { return createClient(cloudKeys.url, cloudKeys.key); } catch (e) { return null; }
  }, [cloudKeys.url, cloudKeys.key]);

  useEffect(() => {
    const boot = async () => {
      try {
        const db = await openDB();
        const tx = db.transaction([STORE_MEMBERS, STORE_CATEGORIES, STORE_LOCALITIES], 'readonly');
        
        const mReq = tx.objectStore(STORE_MEMBERS).getAll();
        const cReq = tx.objectStore(STORE_CATEGORIES).getAll();
        const lReq = tx.objectStore(STORE_LOCALITIES).getAll();

        mReq.onsuccess = () => {
          setAllMembers(mReq.result || []);
          cReq.onsuccess = () => {
            setAllCategories(cReq.result || []);
            lReq.onsuccess = () => {
              setAllLocalities(lReq.result || []);
              const st = localStorage.getItem('sga_templates_v2');
              const sn = localStorage.getItem('sga_tenants_v1');
              if (st) setTemplates(JSON.parse(st));
              if (sn) setTenants(JSON.parse(sn));
              setIsAppReady(true);
            };
          };
        };
      } catch (e) { setIsAppReady(true); }
    };
    boot();
  }, []);

  useEffect(() => {
    if (!isAppReady) return;
    const save = async () => {
      try {
        const db = await openDB();
        const tx = db.transaction([STORE_MEMBERS, STORE_CATEGORIES, STORE_LOCALITIES], 'readwrite');
        
        const mStore = tx.objectStore(STORE_MEMBERS);
        await mStore.clear();
        (allMembers || []).forEach(m => mStore.put(m));

        const cStore = tx.objectStore(STORE_CATEGORIES);
        await cStore.clear();
        (allCategories || []).forEach(c => cStore.put(c));

        const lStore = tx.objectStore(STORE_LOCALITIES);
        await lStore.clear();
        (allLocalities || []).forEach(l => lStore.put(l));
      } catch (e) {}
    };
    save();
    localStorage.setItem('sga_templates_v2', JSON.stringify(templates || []));
    localStorage.setItem('sga_tenants_v1', JSON.stringify(tenants || []));
    localStorage.setItem('sga_session', JSON.stringify(session));
  }, [allMembers, allCategories, allLocalities, templates, tenants, session, isAppReady]);

  const syncData = async (overrideMembers?: Member[], overrideCategories?: Category[], overrideLocalities?: Locality[]): Promise<SyncResult> => {
    if (!navigator.onLine || !supabase) return { success: false, count: 0, tenants: tenants || [] };
    setCloudConnected(true);
    try {
      const { data: dbTenants } = await supabase.from('tenants').select('*').order('name');
      let freshTenants = [...(tenants || [])];
      if (dbTenants) {
        freshTenants = dbTenants.map(t => ({ id: t.id, name: t.name, adminUsername: t.admin_username, adminPassword: t.admin_password, isActive: t.is_active !== false, createdAt: t.created_at, updatedAt: t.updated_at || t.created_at }));
        setTenants(freshTenants);
      }
      if (!session.user) return { success: true, count: 0, tenants: freshTenants };
      const currentTid = session.user.tenantId;

      // Sync Categorias
      const catsToSync = overrideCategories || allCategories || [];
      const unsyncedCats = catsToSync.filter(c => !c.isSynced && c.tenant_id === currentTid);
      if (unsyncedCats.length > 0) {
        await supabase.from('categories').upsert(unsyncedCats.map(({isSynced, ...c}) => c));
      }
      const { data: remoteCats } = await supabase.from('categories').select('*').eq('tenant_id', currentTid);
      if (remoteCats) {
        const mappedCats = remoteCats.map(rc => ({ ...rc, isSynced: true }));
        setAllCategories(prev => [...(prev || []).filter(p => p.tenant_id !== currentTid), ...mappedCats]);
      }

      // Sync Localidades
      const locsToSync = overrideLocalities || allLocalities || [];
      const unsyncedLocs = locsToSync.filter(l => !l.isSynced && l.tenant_id === currentTid);
      if (unsyncedLocs.length > 0) {
        await supabase.from('localities').upsert(unsyncedLocs.map(({isSynced, ...l}) => l));
      }
      const { data: remoteLocs } = await supabase.from('localities').select('*').eq('tenant_id', currentTid);
      if (remoteLocs) {
        const mappedLocs = remoteLocs.map(rl => ({ ...rl, isSynced: true }));
        setAllLocalities(prev => [...(prev || []).filter(p => p.tenant_id !== currentTid), ...mappedLocs]);
      }

      // Sync Sócios
      const membersToSync = overrideMembers || allMembers || [];
      const unsynced = membersToSync.filter(m => !m.isSynced && m.tenant_id === currentTid);
      if (unsynced.length > 0) {
        await supabase.from('socios').upsert(unsynced.map(({isSynced, ...m}) => {
          const { photoUrl, ...rest } = m as any;
          return rest;
        }));
      }
      const { data: remoteSocios } = await supabase.from('socios').select('*').eq('tenant_id', currentTid);
      if (remoteSocios) {
        setAllMembers(prev => [...(prev || []).filter(p => p.tenant_id !== currentTid), ...remoteSocios.map(rm => ({ ...rm, isSynced: true }))]);
      }

      const now = new Date().toLocaleString('pt-BR');
      setLastSync(now);
      localStorage.setItem('sga_last_sync', now);
      return { success: true, count: unsynced.length + unsyncedCats.length + unsyncedLocs.length, tenants: freshTenants };
    } catch (e: any) { return { success: false, count: 0, tenants: tenants || [] }; } finally { setCloudConnected(false); }
  };

  // Gatilho de Sincronização Automática ao Logar ou Carregar Logado
  useEffect(() => {
    if (session.user && isAppReady && navigator.onLine) {
      syncData();
    }
  }, [session.user?.id, isAppReady]);

  const login = async (username: string, pass: string, tenantList?: Tenant[]): Promise<boolean> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('system_admins').select('*').eq('username', username).eq('password', pass).single();
        if (data && !error) {
          setSession({ user: { id: data.id, username: data.username, role: 'SUPER_ADMIN' } });
          return true;
        }
      } catch (e) {}
    }
    const list = tenantList || tenants || [];
    const t = list.find(x => x.adminUsername === username && x.adminPassword === pass);
    if (t && t.isActive) {
      setSession({ user: { id: t.id, username: t.adminUsername, role: 'REGION_USER', tenantId: t.id, cityName: t.name } });
      return true;
    }
    return false;
  };

  const value = {
    members: useMemo(() => {
      if (!session.user) return [];
      const list = allMembers || [];
      return session.user.role === 'SUPER_ADMIN' ? list : list.filter(m => m.tenant_id === session.user?.tenantId);
    }, [allMembers, session.user]),
    categories: useMemo(() => {
      if (!session.user) return [];
      const list = allCategories || [];
      return session.user.role === 'SUPER_ADMIN' ? list : list.filter(c => c.tenant_id === session.user?.tenantId);
    }, [allCategories, session.user]),
    localities: useMemo(() => {
      if (!session.user) return [];
      const list = allLocalities || [];
      return session.user.role === 'SUPER_ADMIN' ? list : list.filter(l => l.tenant_id === session.user?.tenantId);
    }, [allLocalities, session.user]),
    templates: templates || [],
    tenants: tenants || [],
    session, isAppReady, login,
    logout: () => { setSession({ user: null }); localStorage.removeItem('sga_session'); },
    addTenant: async () => {}, toggleTenantStatus: async () => {}, deleteTenant: async () => {},
    addMember: (m: Member) => {
      const newM = { ...m, id: m.id || crypto.randomUUID(), isSynced: false, tenant_id: session.user?.tenantId || '' };
      const next = [...(allMembers || []), newM]; setAllMembers(next);
      if (navigator.onLine) syncData(next);
    },
    updateMember: (index: number, m: Member) => {
      const next = [...(allMembers || [])]; next[index] = { ...m, isSynced: false };
      setAllMembers(next);
      if (navigator.onLine) syncData(next);
    },
    deleteMember: async (index: number) => setAllMembers(prev => (prev || []).filter((_, i) => i !== index)),
    addTemplate: (t: DocumentTemplate) => setTemplates(prev => [...(prev || []), { ...t, tenantId: session.user?.tenantId || '' }]),
    deleteTemplate: (id: string) => setTemplates(prev => (prev || []).filter(x => x.id !== id)),
    addCategory: (c: Omit<Category, 'isSynced'>) => {
      const newC = { ...c, id: c.id || crypto.randomUUID(), isSynced: false, tenant_id: session.user?.tenantId || '' };
      const next = [...(allCategories || []), newC]; setAllCategories(next);
      if (navigator.onLine) syncData(undefined, next);
    },
    updateCategory: (id: string, c: Omit<Category, 'isSynced'>) => {
      const next = (allCategories || []).map(x => x.id === id ? { ...c, id, isSynced: false, tenant_id: session.user?.tenantId || '' } : x);
      setAllCategories(next);
      if (navigator.onLine) syncData(undefined, next);
    },
    deleteCategory: async (id: string) => {
      setAllCategories(prev => (prev || []).filter(x => x.id !== id));
      if (supabase && navigator.onLine) await supabase.from('categories').delete().eq('id', id);
    },
    addLocality: (l: Omit<Locality, 'isSynced'>) => {
      const newL = { ...l, id: l.id || crypto.randomUUID(), isSynced: false, tenant_id: session.user?.tenantId || '' };
      const next = [...(allLocalities || []), newL]; setAllLocalities(next);
      if (navigator.onLine) syncData(undefined, undefined, next);
    },
    updateLocality: (id: string, l: Omit<Locality, 'isSynced'>) => {
      const next = (allLocalities || []).map(x => x.id === id ? { ...l, id, isSynced: false, tenant_id: session.user?.tenantId || '' } : x);
      setAllLocalities(next);
      if (navigator.onLine) syncData(undefined, undefined, next);
    },
    deleteLocality: async (id: string) => {
      setAllLocalities(prev => (prev || []).filter(x => x.id !== id));
      if (supabase && navigator.onLine) await supabase.from('localities').delete().eq('id', id);
    },
    importMembers: (list: Member[]) => {
      const next = [...(allMembers || []), ...(list || []).map(m => ({ ...m, isSynced: false }))];
      setAllMembers(next); return list;
    },
    clearDatabase: () => {
      setAllMembers([]); setAllCategories([]); setAllLocalities([]); setTemplates([]); setTenants([]);
      localStorage.clear(); indexedDB.deleteDatabase(DB_NAME); window.location.reload();
    },
    isOnline, lastSync, syncData, cloudConnected, cloudKeys, 
    updateCloudKeys: (url: string, key: string) => { 
      setCloudKeys({ url, key }); localStorage.setItem('sga_cloud_url', url); localStorage.setItem('sga_cloud_key', key); 
    }
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
