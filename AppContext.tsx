
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
  isOfflineReady: boolean;
  swFailed: boolean;
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
  importMembers: (newMembers: Member[]) => Member[];
  clearDatabase: () => void;
  isOnline: boolean;
  lastSync: string | null;
  syncData: (overrideMembers?: Member[]) => Promise<SyncResult>;
  cloudConnected: boolean;
  cloudKeys: { url: string; key: string };
  updateCloudKeys: (url: string, key: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DB_NAME = 'SGA_DATABASE_V4'; 
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
  const [session, setSession] = useState<AuthSession>(() => {
    const saved = localStorage.getItem('sga_session');
    return saved ? JSON.parse(saved) : { user: null };
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isAppReady, setIsAppReady] = useState(false);
  const [isOfflineReady, setIsOfflineReady] = useState(() => localStorage.getItem('sga_offline_ready') === 'true');
  const [swFailed, setSwFailed] = useState(false);
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
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OFFLINE_READY') {
        setIsOfflineReady(true);
        localStorage.setItem('sga_offline_ready', 'true');
      }
      if (event.data?.type === 'SW_REGISTRATION_FAILED') {
        setSwFailed(true);
      }
    };
    window.addEventListener('message', handleMessage);
    navigator.serviceWorker?.addEventListener('message', handleMessage);
    
    // Timeout de segurança para falha silenciosa do SW
    const timer = setTimeout(() => {
      if (!isOfflineReady) setSwFailed(true);
    }, 10000);

    return () => {
      window.removeEventListener('message', handleMessage);
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
      clearTimeout(timer);
    };
  }, [isOfflineReady]);

  useEffect(() => {
    const boot = async () => {
      try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => {
          const dbMembers = request.result || [];
          const st = localStorage.getItem('sga_templates_v2');
          const sn = localStorage.getItem('sga_tenants_v1');
          if (dbMembers.length > 0) setAllMembers(dbMembers);
          if (st) setTemplates(JSON.parse(st));
          if (sn) setTenants(JSON.parse(sn));
          setIsAppReady(true);
        };
      } catch (e) { setIsAppReady(true); }
    };
    boot();
  }, []);

  const syncData = async (overrideMembers?: Member[]): Promise<SyncResult> => {
    if (!navigator.onLine || !supabase) return { success: false, count: 0, tenants };
    setCloudConnected(true);
    try {
      const { data: dbTenants, error: tError } = await supabase.from('tenants').select('*').order('name');
      let freshTenants = [...tenants];
      if (dbTenants && !tError) {
        freshTenants = dbTenants.map(t => ({ id: t.id, name: t.name, adminUsername: t.admin_username, adminPassword: t.admin_password, isActive: t.is_active !== false, createdAt: t.created_at, updatedAt: t.updated_at || t.created_at }));
        setTenants(freshTenants);
      }
      const now = new Date().toLocaleString('pt-BR');
      setLastSync(now);
      localStorage.setItem('sga_last_sync', now);
      return { success: true, count: 0, tenants: freshTenants };
    } catch (e: any) { return { success: false, count: 0, tenants }; } finally { setCloudConnected(false); }
  };

  const login = async (username: string, pass: string, tenantList?: Tenant[]): Promise<boolean> => {
    if (supabase) {
      const { data } = await supabase.from('system_admins').select('*').eq('username', username).eq('password', pass).single();
      if (data) {
        setSession({ user: { id: data.id, username: data.username, role: 'SUPER_ADMIN' } });
        return true;
      }
    }
    const list = tenantList || tenants;
    const t = list.find(x => x.adminUsername === username && x.adminPassword === pass);
    if (t && t.isActive) {
      setSession({ user: { id: t.id, username: t.adminUsername, role: 'REGION_USER', tenantId: t.id, cityName: t.name } });
      return true;
    }
    return false;
  };

  const value = {
    members: allMembers,
    templates, tenants, session, isAppReady, isOfflineReady, swFailed, login,
    logout: () => { setSession({ user: null }); localStorage.removeItem('sga_session'); },
    addTenant: async () => {}, toggleTenantStatus: async () => {}, deleteTenant: async () => {},
    addMember: () => {}, updateMember: () => {}, deleteMember: () => {},
    addTemplate: () => {}, deleteTemplate: () => {}, importMembers: () => [], clearDatabase: () => {},
    isOnline, lastSync, syncData, cloudConnected, cloudKeys, updateCloudKeys: () => {}
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
