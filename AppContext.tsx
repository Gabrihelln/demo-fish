
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { Member, DocumentTemplate, Tenant, AuthSession, Category, Locality, Mensalidade, GeneratedReceipt, TenantDetails, TenantRepresentatives } from './types';
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
  saveTenantDetails: (details: TenantDetails) => Promise<void>;
  getTenantDetails: (tenantId: string) => Promise<TenantDetails | null>;
  saveTenantRepresentatives: (reps: TenantRepresentatives) => Promise<void>;
  getTenantRepresentatives: (tenantId: string) => Promise<TenantRepresentatives | null>;
  addMember: (member: Member) => void;
  updateMember: (index: number, member: Member) => void;
  deleteMember: (index: number) => void;
  addTemplate: (template: DocumentTemplate) => void;
  deleteTemplate: (id: string) => void;
  saveReceipt: (receipt: Partial<GeneratedReceipt>) => Promise<number | undefined>;
  addCategory: (category: Omit<Category, 'isSynced'>) => void;
  updateCategory: (id: string, category: Omit<Category, 'isSynced'>) => void;
  deleteCategory: (id: string) => Promise<void>;
  addLocality: (locality: Omit<Locality, 'isSynced'>) => void;
  updateLocality: (id: string, locality: Omit<Locality, 'isSynced'>) => void;
  deleteLocality: (id: string) => Promise<void>;
  importMembers: (newMembers: Member[]) => Promise<void>;
  importMensalidades: (newList: Mensalidade[]) => Promise<void>;
  addMensalidade: (mensalidade: Mensalidade) => void;
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
        
        const membersReq = tx.objectStore(STORE_MEMBERS).getAll();
        const catsReq = tx.objectStore(STORE_CATEGORIES).getAll();
        const locsReq = tx.objectStore(STORE_LOCALITIES).getAll();
        const payReq = tx.objectStore(STORE_MENSALIDADES).getAll();

        membersReq.onsuccess = () => setAllMembers(membersReq.result || []);
        catsReq.onsuccess = () => setAllCategories(catsReq.result || []);
        locsReq.onsuccess = () => setAllLocalities(locsReq.result || []);
        payReq.onsuccess = () => setAllMensalidades(payReq.result || []);
        
        const st = localStorage.getItem('sga_templates_v2');
        const sn = localStorage.getItem('sga_tenants_v1');
        if (st) setTemplates(JSON.parse(st));
        if (sn) setTenants(JSON.parse(sn));
        
        tx.oncomplete = () => setIsAppReady(true);
      } catch (e) { setIsAppReady(true); }
    };
    boot();
  }, []);

  const syncData = async (overrideMembers?: Member[], overrideCategories?: Category[], overrideLocalities?: Locality[], overrideMensalidades?: Mensalidade[]): Promise<SyncResult> => {
    if (!navigator.onLine || !supabase) return { success: false, count: 0, tenants: tenants || [] };
    setCloudConnected(true);
    try {
      const { data: dbTenants } = await supabase.from('tenants').select('*').order('name');
      let freshTenants = dbTenants ? dbTenants.map(t => ({ id: t.id, name: t.name, adminUsername: t.admin_username, adminPassword: t.admin_password, isActive: t.is_active !== false, createdAt: t.created_at, updatedAt: t.updated_at || t.created_at })) : (tenants || []);
      setTenants(freshTenants);
      localStorage.setItem('sga_tenants_v1', JSON.stringify(freshTenants));

      if (!session.user) return { success: true, count: 0, tenants: freshTenants };
      
      const currentTid = session.user.tenantId;

      const { data: remoteTemplates } = await supabase.from('document_templates').select('*').eq('tenant_id', currentTid);
      if (remoteTemplates) {
        const formatted = remoteTemplates.map(rt => ({
          id: rt.id,
          tenantId: rt.tenant_id,
          name: rt.name,
          category: rt.category,
          header: rt.header,
          content: rt.content,
          footer: rt.footer,
          type: rt.type,
          printFormat: rt.print_format,
          updatedAt: rt.updated_at
        }));
        setTemplates(formatted);
        localStorage.setItem('sga_templates_v2', JSON.stringify(formatted));
      }

      const { data: remoteSocios } = await supabase.from('socios').select('*').eq('tenant_id', currentTid);
      if (remoteSocios) {
        const formatted = remoteSocios.map(rs => ({ ...rs, isSynced: true }));
        setAllMembers(formatted);
        persistLocally(formatted);
      }

      const { data: remoteMensalidades } = await supabase.from('mensalidades').select('*').eq('tenant_id', currentTid);
      if (remoteMensalidades) {
        const formatted = remoteMensalidades.map(rm => ({ ...rm, isSynced: true }));
        setAllMensalidades(formatted);
        persistLocally(undefined, undefined, undefined, formatted);
      }

      const now = new Date().toLocaleString('pt-BR');
      setLastSync(now);
      localStorage.setItem('sga_last_sync', now);
      return { success: true, count: 0, tenants: freshTenants };
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

  const value = {
    members: useMemo(() => {
      if (!session.user) return [];
      const list = allMembers || [];
      return list.filter(m => m.tenant_id === (session.user?.tenantId || ''));
    }, [allMembers, session.user]),
    categories: useMemo(() => {
      if (!session.user) return [];
      const list = allCategories || [];
      return list.filter(c => c.tenant_id === (session.user?.tenantId || ''));
    }, [allCategories, session.user]),
    localities: useMemo(() => {
      if (!session.user) return [];
      const list = allLocalities || [];
      return list.filter(l => l.tenant_id === (session.user?.tenantId || ''));
    }, [allLocalities, session.user]),
    mensalidades: useMemo(() => {
      if (!session.user) return [];
      const list = allMensalidades || [];
      return list.filter(p => p.tenant_id === (session.user?.tenantId || ''));
    }, [allMensalidades, session.user]),
    templates, tenants, session, isAppReady, 
    login: async (username: string, pass: string, tenantList?: Tenant[]): Promise<boolean> => {
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
    },
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
    saveTenantDetails: async (details: TenantDetails) => {
      if (!supabase) return;
      const { error } = await supabase.from('tenant_details').upsert(details);
      if (error) throw error;
    },
    getTenantDetails: async (tenantId: string) => {
      if (!supabase) return null;
      const { data, error } = await supabase.from('tenant_details').select('*').eq('tenant_id', tenantId).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    saveTenantRepresentatives: async (reps: TenantRepresentatives) => {
      if (!supabase) return;
      const { error } = await supabase.from('tenant_representatives').upsert(reps);
      if (error) throw error;
    },
    getTenantRepresentatives: async (tenantId: string) => {
      if (!supabase) return null;
      const { data, error } = await supabase.from('tenant_representatives').select('*').eq('tenant_id', tenantId).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    addMember: async (m: Member) => {
      const nextMember = { ...m, id: m.id || crypto.randomUUID(), isSynced: false, tenant_id: session.user?.tenantId || '' };
      setAllMembers(prev => {
        const next = [...prev, nextMember];
        persistLocally(next);
        return next;
      });
      if (supabase && navigator.onLine) {
        const { isSynced, dependents, photoUrl, ...payload } = nextMember;
        const { error } = await supabase.from('socios').insert(payload);
        if (!error) syncData();
      }
    },
    updateMember: async (index: number, m: Member) => {
      setAllMembers(prev => {
        const next = [...prev];
        next[index] = { ...m, isSynced: false };
        persistLocally(next);
        return next;
      });
      if (supabase && navigator.onLine && m.id) {
        const { isSynced, dependents, photoUrl, ...payload } = m;
        const { error } = await supabase.from('socios').update(payload).eq('id', m.id);
        if (!error) syncData();
      }
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
    addTemplate: async (t: DocumentTemplate) => {
        const isUpdate = !!t.id;
        const payload = {
          name: t.name,
          category: t.category,
          header: t.header,
          content: t.content,
          footer: t.footer,
          type: t.type,
          print_format: t.printFormat,
          tenant_id: session.user?.tenantId,
          updated_at: new Date().toISOString()
        };

        if (supabase && navigator.onLine) {
          if (isUpdate) {
            await supabase.from('document_templates').update(payload).eq('id', t.id);
          } else {
            await supabase.from('document_templates').insert(payload);
          }
          await syncData();
        } else {
          setTemplates(prev => {
            const exists = prev.findIndex(x => x.id === t.id);
            let next;
            if (exists !== -1) {
              next = [...prev];
              next[exists] = { ...t, updatedAt: new Date().toISOString() };
            } else {
              next = [...prev, { ...t, id: t.id || crypto.randomUUID(), tenantId: session.user?.tenantId || '', updatedAt: new Date().toISOString() }];
            }
            localStorage.setItem('sga_templates_v2', JSON.stringify(next));
            return next;
          });
        }
    },
    deleteTemplate: async (id: string) => {
        if (supabase && navigator.onLine) {
          await supabase.from('document_templates').delete().eq('id', id);
          await syncData();
        } else {
          const next = templates.filter(x => x.id !== id);
          setTemplates(next);
          localStorage.setItem('sga_templates_v2', JSON.stringify(next));
        }
    },
    saveReceipt: async (r: Partial<GeneratedReceipt>) => {
      if (supabase && navigator.onLine) {
        const { data, error } = await supabase.from('generated_receipts').insert({
          tenant_id: session.user?.tenantId,
          member_id: r.member_id,
          template_id: r.template_id,
          template_name: r.template_name,
          member_name: r.member_name,
          content_snapshot: r.content_snapshot
        }).select('receipt_number').single();
        
        if (error) return undefined;
        return data.receipt_number;
      }
      return Math.floor(Math.random() * 99999);
    },
    addCategory: async (c: Omit<Category, 'isSynced'>) => {
      const nextCat = { ...c, id: c.id || crypto.randomUUID(), isSynced: false, tenant_id: session.user?.tenantId || '' };
      setAllCategories(prev => {
          const next = [...prev, nextCat];
          persistLocally(undefined, next);
          return next;
      });
      if (supabase && navigator.onLine) {
        const { isSynced, ...payload } = nextCat as any;
        await supabase.from('categories').insert(payload);
      }
    },
    updateCategory: async (id: string, c: Omit<Category, 'isSynced'>) => {
      setAllCategories(prev => {
        const next = prev.map(x => x.id === id ? { ...c, id, isSynced: false, tenant_id: session.user?.tenantId || '' } as Category : x);
        persistLocally(undefined, next);
        return next;
      });
      if (supabase && navigator.onLine) {
        await supabase.from('categories').update(c).eq('id', id);
      }
    },
    deleteCategory: async (id: string) => {
      setAllCategories(prev => {
          const next = prev.filter(x => x.id !== id);
          persistLocally(undefined, next);
          return next;
      });
      if (supabase && navigator.onLine) await supabase.from('categories').delete().eq('id', id);
    },
    addLocality: async (l: Omit<Locality, 'isSynced'>) => {
      const nextLoc = { ...l, id: l.id || crypto.randomUUID(), isSynced: false, tenant_id: session.user?.tenantId || '' };
      setAllLocalities(prev => {
          const next = [...prev, nextLoc];
          persistLocally(undefined, undefined, next);
          return next;
      });
      if (supabase && navigator.onLine) {
        const { isSynced, ...payload } = nextLoc as any;
        await supabase.from('localities').insert(payload);
      }
    },
    updateLocality: async (id: string, l: Omit<Locality, 'isSynced'>) => {
      setAllLocalities(prev => {
        const next = prev.map(x => x.id === id ? { ...l, id, isSynced: false, tenant_id: session.user?.tenantId || '' } as Locality : x);
        persistLocally(undefined, undefined, next);
        return next;
      });
      if (supabase && navigator.onLine) {
        await supabase.from('localities').update(l).eq('id', id);
      }
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
      if (supabase && navigator.onLine) {
        const dbList = list.map(({ isSynced, dependents, photoUrl, ...rest }) => rest);
        const { error } = await supabase.from('socios').insert(dbList);
        if (error) {
          console.error("Erro no insert socios:", error);
          throw error;
        }
      }
      setAllMembers(prev => {
        const next = [...prev, ...list.map(m => ({ ...m, isSynced: true }))];
        persistLocally(next);
        return next;
      });
    },
    importMensalidades: async (list: Mensalidade[]) => {
      if (supabase && navigator.onLine) {
        const dbList = list.map(({ isSynced, ...rest }) => rest);
        const { error } = await supabase.from('mensalidades').insert(dbList);
        if (error) {
          console.error("Erro no insert mensalidades:", error);
          throw error;
        }
      }
      setAllMensalidades(prev => {
        const next = [...prev, ...list.map(p => ({ ...p, isSynced: true }))];
        persistLocally(undefined, undefined, undefined, next);
        return next;
      });
    },
    addMensalidade: async (m: Mensalidade) => {
      const nextMensalidade = { ...m, id: m.id || crypto.randomUUID(), isSynced: false, tenant_id: session.user?.tenantId || '' };
      setAllMensalidades(prev => {
        const next = [...prev, nextMensalidade];
        persistLocally(undefined, undefined, undefined, next);
        return next;
      });
      if (supabase && navigator.onLine) {
        const { isSynced, ...payload } = nextMensalidade;
        await supabase.from('mensalidades').insert(payload);
      }
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
