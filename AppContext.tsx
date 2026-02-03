
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { Member, DocumentTemplate, Tenant, AuthSession, Category, Locality, Mensalidade } from './types';
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
  mensalidades: Mensalidade[];
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
  importMensalidades: (newList: Mensalidade[]) => Mensalidade[];
  clearDatabase: () => void;
  isOnline: boolean;
  lastSync: string | null;
  syncData: (overrideMembers?: Member[], overrideCategories?: Category[], overrideLocalities?: Locality[], overrideMensalidades?: Mensalidade[]) => Promise<SyncResult>;
  cloudConnected: boolean;
  cloudKeys: { url: string; key: string };
  updateCloudKeys: (url: string, key: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DB_NAME = 'SGA_DATABASE_V7'; 
const STORE_MEMBERS = 'members';
const STORE_CATEGORIES = 'categories';
const STORE_LOCALITIES = 'localities';
const STORE_MENSALIDADES = 'mensalidades';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_MEMBERS)) db.createObjectStore(STORE_MEMBERS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_CATEGORIES)) db.createObjectStore(STORE_CATEGORIES, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_LOCALITIES)) db.createObjectStore(STORE_LOCALITIES, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_MENSALIDADES)) db.createObjectStore(STORE_MENSALIDADES, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const cleanNumeric = (val: any) => {
    const s = String(val || "0").replace(/[^\d,.-]/g, '').replace(',', '.');
    return isNaN(parseFloat(s)) ? 0 : parseFloat(s);
};

const cleanDate = (val: any) => {
    if (!val) return null;
    const s = String(val).trim().split(' ')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    return null;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allLocalities, setAllLocalities] = useState<Locality[]>([]);
  const [allMensalidades, setAllMensalidades] = useState<Mensalidade[]>([]);
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
    const handleStatusChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  useEffect(() => {
    const boot = async () => {
      try {
        const db = await openDB();
        const tx = db.transaction([STORE_MEMBERS, STORE_CATEGORIES, STORE_LOCALITIES, STORE_MENSALIDADES], 'readonly');
        setAllMembers((await tx.objectStore(STORE_MEMBERS).getAll()).result || []);
        setAllCategories((await tx.objectStore(STORE_CATEGORIES).getAll()).result || []);
        setAllLocalities((await tx.objectStore(STORE_LOCALITIES).getAll()).result || []);
        setAllMensalidades((await tx.objectStore(STORE_MENSALIDADES).getAll()).result || []);
        
        const st = localStorage.getItem('sga_templates_v2');
        const sn = localStorage.getItem('sga_tenants_v1');
        if (st) setTemplates(JSON.parse(st));
        if (sn) setTenants(JSON.parse(sn));
        setIsAppReady(true);
      } catch (e) { setIsAppReady(true); }
    };
    boot();
  }, []);

  // SINCRONIZAÇÃO AUTOMÁTICA AO LOGAR OU VOLTAR ONLINE
  useEffect(() => {
    if (isAppReady && session.user && isOnline) {
      syncData();
    }
  }, [session.user, isOnline, isAppReady]);

  useEffect(() => {
    if (!isAppReady) return;
    const save = async () => {
      try {
        const db = await openDB();
        const tx = db.transaction([STORE_MEMBERS, STORE_CATEGORIES, STORE_LOCALITIES, STORE_MENSALIDADES], 'readwrite');
        const stores = [
          { name: STORE_MEMBERS, data: allMembers },
          { name: STORE_CATEGORIES, data: allCategories },
          { name: STORE_LOCALITIES, data: allLocalities },
          { name: STORE_MENSALIDADES, data: allMensalidades }
        ];
        for (const s of stores) {
          const store = tx.objectStore(s.name);
          await store.clear();
          (s.data || []).forEach(item => store.put(item));
        }
      } catch (e) {}
    };
    save();
    localStorage.setItem('sga_templates_v2', JSON.stringify(templates || []));
    localStorage.setItem('sga_tenants_v1', JSON.stringify(tenants || []));
    localStorage.setItem('sga_session', JSON.stringify(session));
  }, [allMembers, allCategories, allLocalities, allMensalidades, templates, tenants, session, isAppReady]);

  const syncData = async (overrideMembers?: Member[], overrideCategories?: Category[], overrideLocalities?: Locality[], overrideMensalidades?: Mensalidade[]): Promise<SyncResult> => {
    if (!navigator.onLine || !supabase) return { success: false, count: 0, tenants: tenants || [] };
    setCloudConnected(true);
    try {
      const { data: dbTenants } = await supabase.from('tenants').select('*').order('name');
      let freshTenants = dbTenants ? dbTenants.map(t => ({ id: t.id, name: t.name, adminUsername: t.admin_username, adminPassword: t.admin_password, isActive: t.is_active !== false, createdAt: t.created_at, updatedAt: t.updated_at || t.created_at })) : (tenants || []);
      setTenants(freshTenants);
      
      if (!session.user) return { success: true, count: 0, tenants: freshTenants };
      
      const isSuper = session.user.role === 'SUPER_ADMIN';
      const currentTid = session.user.tenantId;
      let totalSynced = 0;

      // Sync Categorias
      const catsToSync = overrideCategories || allCategories || [];
      const unsyncedCats = catsToSync.filter(c => !c.isSynced && (isSuper || c.tenant_id === currentTid));
      if (unsyncedCats.length > 0) {
        const { error } = await supabase.from('categories').upsert(unsyncedCats.map(({isSynced, ...c}) => c));
        if (!error) totalSynced += unsyncedCats.length;
      }

      // Sync Localidades
      const locsToSync = overrideLocalities || allLocalities || [];
      const unsyncedLocs = locsToSync.filter(l => !l.isSynced && (isSuper || l.tenant_id === currentTid));
      if (unsyncedLocs.length > 0) {
        const { error } = await supabase.from('localities').upsert(unsyncedLocs.map(({isSynced, ...l}) => l));
        if (!error) totalSynced += unsyncedLocs.length;
      }

      // Sync Mensalidades
      const payToSync = overrideMensalidades || allMensalidades || [];
      const unsyncedPay = payToSync.filter(p => !p.isSynced && (isSuper || p.tenant_id === currentTid));
      if (unsyncedPay.length > 0) {
        const sanitizedPay = unsyncedPay.map(({isSynced, ...p}) => ({
          ...p,
          data: cleanDate(p.data),
          data_ultimo_mes_pago: cleanDate(p.data_ultimo_mes_pago),
          data_ate_quando_pagar: cleanDate(p.data_ate_quando_pagar),
          valor: cleanNumeric(p.valor),
          desconto_valor: cleanNumeric(p.desconto_valor),
          desconto_percentual: cleanNumeric(p.desconto_percentual),
          valor_desconto_percentual: cleanNumeric(p.valor_desconto_percentual),
          valor_total: cleanNumeric(p.valor_total),
          quantidade_meses: isNaN(parseInt(p.quantidade_meses)) ? 1 : parseInt(p.quantidade_meses)
        }));
        const { error: payError } = await supabase.from('mensalidades').upsert(sanitizedPay);
        if (!payError) totalSynced += unsyncedPay.length;
      }

      // Sync Sócios
      const membersToSync = overrideMembers || allMembers || [];
      const unsyncedMembers = membersToSync.filter(m => !m.isSynced && (isSuper || m.tenant_id === currentTid));
      if (unsyncedMembers.length > 0) {
        const { error: mError } = await supabase.from('socios').upsert(unsyncedMembers.map(({isSynced, photoUrl, ...m}) => m));
        if (!mError) totalSynced += unsyncedMembers.length;
      }

      // Refresh Local Data from Cloud (Syncing is bidirectional)
      if (!isSuper && currentTid) {
        const { data: remotePay } = await supabase.from('mensalidades').select('*').eq('tenant_id', currentTid);
        if (remotePay) setAllMensalidades(prev => {
            const syncedIds = new Set(remotePay.map(r => r.id));
            return [...prev.filter(p => !syncedIds.has(p.id) && p.tenant_id !== currentTid), ...remotePay.map(r => ({...r, isSynced: true}))];
        });

        const { data: remoteSocios } = await supabase.from('socios').select('*').eq('tenant_id', currentTid);
        if (remoteSocios) setAllMembers(prev => {
            const syncedIds = new Set(remoteSocios.map(r => r.id));
            return [...prev.filter(m => !syncedIds.has(m.id) && m.tenant_id !== currentTid), ...remoteSocios.map(r => ({...r, isSynced: true}))];
        });

        const { data: remoteCats } = await supabase.from('categories').select('*').eq('tenant_id', currentTid);
        if (remoteCats) setAllCategories(prev => {
            const syncedIds = new Set(remoteCats.map(r => r.id));
            return [...prev.filter(c => !syncedIds.has(c.id) && c.tenant_id !== currentTid), ...remoteCats.map(r => ({...r, isSynced: true}))];
        });

        const { data: remoteLocs } = await supabase.from('localities').select('*').eq('tenant_id', currentTid);
        if (remoteLocs) setAllLocalities(prev => {
            const syncedIds = new Set(remoteLocs.map(r => r.id));
            return [...prev.filter(l => !syncedIds.has(l.id) && l.tenant_id !== currentTid), ...remoteLocs.map(r => ({...r, isSynced: true}))];
        });
      }

      const now = new Date().toLocaleString('pt-BR');
      setLastSync(now);
      localStorage.setItem('sga_last_sync', now);
      return { success: true, count: totalSynced, tenants: freshTenants };
    } catch (e: any) { 
        console.error("Erro Crítico Sincronização:", e);
        return { success: false, count: 0, tenants: tenants || [] }; 
    } finally { setCloudConnected(false); }
  };

  const login = async (username: string, pass: string, tenantList?: Tenant[]): Promise<boolean> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('system_admins').select('*').eq('username', username).eq('password', pass).single();
        if (data && !error) { setSession({ user: { id: data.id, username: data.username, role: 'SUPER_ADMIN' } }); return true; }
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
    mensalidades: useMemo(() => {
      if (!session.user) return [];
      const list = allMensalidades || [];
      return session.user.role === 'SUPER_ADMIN' ? list : list.filter(p => p.tenant_id === session.user?.tenantId);
    }, [allMensalidades, session.user]),
    templates: templates || [],
    tenants: tenants || [],
    session, isAppReady, login,
    logout: () => { setSession({ user: null }); localStorage.removeItem('sga_session'); },
    addTenant: async (name: string, username: string, pass: string) => {
      if (!supabase) throw new Error("Cloud desconectada");
      const { error } = await supabase.from('tenants').insert({ name, admin_username: username, admin_password: pass });
      if (error) throw error;
      syncData();
    },
    toggleTenantStatus: async (id: string) => {
       if (!supabase) return;
       const t = tenants.find(x => x.id === id);
       await supabase.from('tenants').update({ is_active: !t?.isActive }).eq('id', id);
       syncData();
    },
    deleteTenant: async (id: string) => {
       if (!supabase) return;
       await supabase.from('tenants').delete().eq('id', id);
       syncData();
    },
    addMember: (m: Member) => {
      const next = [...(allMembers || []), { ...m, id: m.id || crypto.randomUUID(), isSynced: false, tenant_id: session.user?.tenantId || '' }];
      setAllMembers(next); syncData(next);
    },
    updateMember: (index: number, m: Member) => {
      const next = [...(allMembers || [])]; next[index] = { ...m, isSynced: false };
      setAllMembers(next); syncData(next);
    },
    deleteMember: async (index: number) => setAllMembers(prev => prev.filter((_, i) => i !== index)),
    addTemplate: (t: DocumentTemplate) => setTemplates(prev => [...prev, { ...t, tenantId: session.user?.tenantId || '' }]),
    deleteTemplate: (id: string) => setTemplates(prev => prev.filter(x => x.id !== id)),
    addCategory: (c: Omit<Category, 'isSynced'>) => {
      const next = [...(allCategories || []), { ...c, id: c.id || crypto.randomUUID(), isSynced: false, tenant_id: session.user?.tenantId || '' }];
      setAllCategories(next); syncData(undefined, next);
    },
    updateCategory: (id: string, c: Omit<Category, 'isSynced'>) => {
      const next = allCategories.map(x => x.id === id ? { ...c, id, isSynced: false, tenant_id: session.user?.tenantId || '' } : x);
      setAllCategories(next); syncData(undefined, next);
    },
    deleteCategory: async (id: string) => {
      setAllCategories(prev => prev.filter(x => x.id !== id));
      if (supabase && navigator.onLine) await supabase.from('categories').delete().eq('id', id);
    },
    addLocality: (l: Omit<Locality, 'isSynced'>) => {
      const next = [...(allLocalities || []), { ...l, id: l.id || crypto.randomUUID(), isSynced: false, tenant_id: session.user?.tenantId || '' }];
      setAllLocalities(next); syncData(undefined, undefined, next);
    },
    updateLocality: (id: string, l: Omit<Locality, 'isSynced'>) => {
      const next = allLocalities.map(x => x.id === id ? { ...l, id, isSynced: false, tenant_id: session.user?.tenantId || '' } : x);
      setAllLocalities(next); syncData(undefined, undefined, next);
    },
    deleteLocality: async (id: string) => {
      setAllLocalities(prev => prev.filter(x => x.id !== id));
      if (supabase && navigator.onLine) await supabase.from('localities').delete().eq('id', id);
    },
    importMembers: (list: Member[]) => {
      const next = [...(allMembers || []), ...(list || []).map(m => ({ ...m, isSynced: false }))];
      setAllMembers(next); return list;
    },
    importMensalidades: (list: Mensalidade[]) => {
      const next = [...(allMensalidades || []), ...(list || []).map(p => ({ ...p, isSynced: false }))];
      setAllMensalidades(next); return list;
    },
    clearDatabase: () => {
      setAllMembers([]); setAllCategories([]); setAllLocalities([]); setAllMensalidades([]); setTemplates([]); setTenants([]);
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
