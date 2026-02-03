
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
  addTenant: (name: string, username: string, pass: string) => Promise<string | undefined>;
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
  importMembers: (newMembers: Member[]) => Promise<void>;
  importMensalidades: (newList: Mensalidade[]) => Promise<void>;
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

const cleanNumeric = (val: any): number => {
    if (typeof val === 'number') return val;
    if (!val || String(val).trim() === "") return 0;
    const s = String(val).replace(/[^\d,.-]/g, '').replace(',', '.');
    const parsed = parseFloat(s);
    return isNaN(parsed) ? 0 : parsed;
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

  const persistLocally = async (members?: Member[], categories?: Category[], localities?: Locality[], mensalidades?: Mensalidade[]) => {
    try {
      const db = await openDB();
      const tx = db.transaction([STORE_MEMBERS, STORE_CATEGORIES, STORE_LOCALITIES, STORE_MENSALIDADES], 'readwrite');
      if (members) {
        const store = tx.objectStore(STORE_MEMBERS);
        members.forEach(m => store.put(m));
      }
      if (categories) {
        const store = tx.objectStore(STORE_CATEGORIES);
        categories.forEach(c => store.put(c));
      }
      if (localities) {
        const store = tx.objectStore(STORE_LOCALITIES);
        localities.forEach(l => store.put(l));
      }
      if (mensalidades) {
        const store = tx.objectStore(STORE_MENSALIDADES);
        mensalidades.forEach(m => store.put(m));
      }
    } catch (e) { console.error("Erro na persistência local:", e); }
  };

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

  const syncData = async (overrideMembers?: Member[], overrideCategories?: Category[], overrideLocalities?: Locality[], overrideMensalidades?: Mensalidade[]): Promise<SyncResult> => {
    if (!navigator.onLine || !supabase) return { success: false, count: 0, tenants: tenants || [] };
    setCloudConnected(true);
    try {
      // 1. Sincronizar Tenants (Unidades)
      const { data: dbTenants } = await supabase.from('tenants').select('*').order('name');
      let freshTenants = dbTenants ? dbTenants.map(t => ({ id: t.id, name: t.name, adminUsername: t.admin_username, adminPassword: t.admin_password, isActive: t.is_active !== false, createdAt: t.created_at, updatedAt: t.updated_at || t.created_at })) : (tenants || []);
      setTenants(freshTenants);
      localStorage.setItem('sga_tenants_v1', JSON.stringify(freshTenants));

      if (!session.user) return { success: true, count: 0, tenants: freshTenants };
      
      const isSuper = session.user.role === 'SUPER_ADMIN';
      const currentTid = session.user.tenantId;
      let totalSynced = 0;

      // --- 2. BUSCAR DADOS DA NUVEM (PULL) ---
      // Sócios
      const { data: remoteSocios } = await supabase.from('socios').select('*').eq('tenant_id', currentTid);
      if (remoteSocios) {
        const mergedMembers = [...allMembers];
        remoteSocios.forEach(rs => {
          const idx = mergedMembers.findIndex(m => m.id === rs.id);
          const formatted = { ...rs, isSynced: true };
          if (idx !== -1) mergedMembers[idx] = formatted;
          else mergedMembers.push(formatted);
        });
        setAllMembers(mergedMembers);
        persistLocally(mergedMembers);
      }

      // Mensalidades
      const { data: remoteMensalidades } = await supabase.from('mensalidades').select('*').eq('tenant_id', currentTid);
      if (remoteMensalidades) {
        const mergedPay = [...allMensalidades];
        remoteMensalidades.forEach(rm => {
          const idx = mergedPay.findIndex(p => p.id === rm.id);
          const formatted = { ...rm, isSynced: true };
          if (idx !== -1) mergedPay[idx] = formatted;
          else mergedPay.push(formatted);
        });
        setAllMensalidades(mergedPay);
        persistLocally(undefined, undefined, undefined, mergedPay);
      }

      // Categorias
      const { data: remoteCats } = await supabase.from('categories').select('*').eq('tenant_id', currentTid);
      if (remoteCats) {
        const mergedCats = [...allCategories];
        remoteCats.forEach(rc => {
          const idx = mergedCats.findIndex(c => c.id === rc.id);
          if (idx !== -1) mergedCats[idx] = { ...rc, isSynced: true };
          else mergedCats.push({ ...rc, isSynced: true });
        });
        setAllCategories(mergedCats);
        persistLocally(undefined, mergedCats);
      }

      // Localidades
      const { data: remoteLocs } = await supabase.from('localities').select('*').eq('tenant_id', currentTid);
      if (remoteLocs) {
        const mergedLocs = [...allLocalities];
        remoteLocs.forEach(rl => {
          const idx = mergedLocs.findIndex(l => l.id === rl.id);
          if (idx !== -1) mergedLocs[idx] = { ...rl, isSynced: true };
          else mergedLocs.push({ ...rl, isSynced: true });
        });
        setAllLocalities(mergedLocs);
        persistLocally(undefined, undefined, mergedLocs);
      }

      // --- 3. ENVIAR DADOS LOCAIS PENDENTES (PUSH) ---
      // Sócios
      const membersToSync = overrideMembers || allMembers || [];
      const unsyncedMembers = membersToSync.filter(m => !m.isSynced && (isSuper || m.tenant_id === currentTid));
      if (unsyncedMembers.length > 0) {
        const sanitizedMembers = unsyncedMembers.map(({ isSynced, photoUrl, dependents, ...rest }) => rest);
        const { error: mError } = await supabase.from('socios').upsert(sanitizedMembers);
        if (!mError) {
          totalSynced += unsyncedMembers.length;
          setAllMembers(prev => prev.map(m => unsyncedMembers.find(um => um.id === m.id) ? { ...m, isSynced: true } : m));
        }
      }

      // Mensalidades
      const payToSync = overrideMensalidades || allMensalidades || [];
      const unsyncedPay = payToSync.filter(p => !p.isSynced && (isSuper || p.tenant_id === currentTid));
      if (unsyncedPay.length > 0) {
        const sanitizedPay = unsyncedPay.map(({ isSynced, ...p }) => ({
          ...p,
          data: cleanDate(p.data),
          data_ultimo_mes_pago: cleanDate(p.data_ultimo_mes_pago),
          data_ate_quando_pagar: cleanDate(p.data_ate_quando_pagar),
          quantidade_meses: Math.max(1, Math.round(cleanNumeric(p.quantidade_meses))),
          valor: cleanNumeric(p.valor),
          desconto_valor: cleanNumeric(p.desconto_valor),
          desconto_percentual: cleanNumeric(p.desconto_percentual),
          valor_desconto_percentual: cleanNumeric(p.valor_desconto_percentual),
          valor_total: cleanNumeric(p.valor_total)
        }));
        const { error: payError } = await supabase.from('mensalidades').upsert(sanitizedPay);
        if (!payError) {
           totalSynced += unsyncedPay.length;
           setAllMensalidades(prev => prev.map(p => unsyncedPay.find(up => up.id === p.id) ? { ...p, isSynced: true } : p));
        }
      }

      const now = new Date().toLocaleString('pt-BR');
      setLastSync(now);
      localStorage.setItem('sga_last_sync', now);
      return { success: true, count: totalSynced, tenants: freshTenants };
    } catch (e: any) { 
        console.error("Falha na sincronização:", e);
        return { success: false, count: 0, tenants: tenants || [] }; 
    } finally { setCloudConnected(false); }
  };

  useEffect(() => {
    if (session.user && isAppReady) {
      syncData();
    }
  }, [session.user?.id, isAppReady]);

  const login = async (username: string, pass: string, tenantList?: Tenant[]): Promise<boolean> => {
    let newSession: AuthSession | null = null;
    
    if (supabase) {
      try {
        const { data, error } = await supabase.from('system_admins').select('*').eq('username', username).eq('password', pass).single();
        if (data && !error) { 
          newSession = { user: { id: data.id, username: data.username, role: 'SUPER_ADMIN' } };
        }
      } catch (e) {}
    }

    if (!newSession) {
      const list = tenantList || tenants || [];
      const t = list.find(x => x.adminUsername === username && x.adminPassword === pass);
      if (t && t.isActive) {
        newSession = { user: { id: t.id, username: t.adminUsername, role: 'REGION_USER', tenantId: t.id, cityName: t.name } };
      }
    }

    if (newSession) {
      setSession(newSession);
      localStorage.setItem('sga_session', JSON.stringify(newSession));
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
    templates, tenants, session, isAppReady, login,
    logout: () => { setSession({ user: null }); localStorage.removeItem('sga_session'); },
    addTenant: async (name: string, username: string, pass: string) => {
      if (!supabase) throw new Error("Cloud desconectada");
      const { data, error } = await supabase.from('tenants').insert({ name, admin_username: username, admin_password: pass }).select('id').single();
      if (error) throw error;
      await syncData();
      return data?.id;
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
      const nextMember = { ...m, id: m.id || crypto.randomUUID(), isSynced: false, tenant_id: session.user?.tenantId || '' };
      setAllMembers(prev => {
        const next = [...prev, nextMember];
        persistLocally(next);
        syncData(next);
        return next;
      });
    },
    updateMember: (index: number, m: Member) => {
      setAllMembers(prev => {
        const next = [...prev];
        next[index] = { ...m, isSynced: false };
        persistLocally(next);
        syncData(next);
        return next;
      });
    },
    deleteMember: async (index: number) => {
        const memberToDelete = allMembers[index];
        setAllMembers(prev => {
            const next = prev.filter((_, i) => i !== index);
            persistLocally(next);
            return next;
        });
        if (supabase && memberToDelete.id) await supabase.from('socios').delete().eq('id', memberToDelete.id);
    },
    addTemplate: (t: DocumentTemplate) => {
        const next = [...templates, { ...t, tenantId: session.user?.tenantId || '' }];
        setTemplates(next);
        localStorage.setItem('sga_templates_v2', JSON.stringify(next));
    },
    deleteTemplate: (id: string) => {
        const next = templates.filter(x => x.id !== id);
        setTemplates(next);
        localStorage.setItem('sga_templates_v2', JSON.stringify(next));
    },
    addCategory: (c: Omit<Category, 'isSynced'>) => {
      const nextCat = { ...c, id: c.id || crypto.randomUUID(), isSynced: false, tenant_id: session.user?.tenantId || '' };
      setAllCategories(prev => {
          const next = [...prev, nextCat];
          persistLocally(undefined, next);
          syncData(undefined, next);
          return next;
      });
    },
    updateCategory: (id: string, c: Omit<Category, 'isSynced'>) => {
      setAllCategories(prev => {
        const next = prev.map(x => x.id === id ? { ...c, id, isSynced: false, tenant_id: session.user?.tenantId || '' } : x);
        persistLocally(undefined, next);
        syncData(undefined, next);
        return next;
      });
    },
    deleteCategory: async (id: string) => {
      setAllCategories(prev => {
          const next = prev.filter(x => x.id !== id);
          persistLocally(undefined, next);
          return next;
      });
      if (supabase && navigator.onLine) await supabase.from('categories').delete().eq('id', id);
    },
    addLocality: (l: Omit<Locality, 'isSynced'>) => {
      const nextLoc = { ...l, id: l.id || crypto.randomUUID(), isSynced: false, tenant_id: session.user?.tenantId || '' };
      setAllLocalities(prev => {
          const next = [...prev, nextLoc];
          persistLocally(undefined, undefined, next);
          syncData(undefined, undefined, next);
          return next;
      });
    },
    updateLocality: (id: string, l: Omit<Locality, 'isSynced'>) => {
      setAllLocalities(prev => {
        const next = prev.map(x => x.id === id ? { ...l, id, isSynced: false, tenant_id: session.user?.tenantId || '' } : x);
        persistLocally(undefined, undefined, next);
        syncData(undefined, undefined, next);
        return next;
      });
    },
    deleteLocality: async (id: string) => {
      setAllLocalities(prev => {
          const next = prev.filter(x => x.id !== id);
          persistLocally(undefined, undefined, next);
          return next;
      });
      if (supabase && navigator.onLine) await supabase.from('localities').delete().eq('id', id);
    },
    importMembers: async (list: Member[]) => {
      setAllMembers(prev => {
        const next = [...prev, ...list.map(m => ({ ...m, isSynced: false }))];
        persistLocally(next);
        return next;
      });
    },
    importMensalidades: async (list: Mensalidade[]) => {
      setAllMensalidades(prev => {
        const next = [...prev, ...list.map(p => ({ ...p, isSynced: false }))];
        persistLocally(undefined, undefined, undefined, next);
        return next;
      });
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
