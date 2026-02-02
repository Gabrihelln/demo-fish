
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
  isOfflineReady: boolean; // Novo: indica se o cache do PWA terminou
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

const DATE_FIELDS = [
  'data_admissao', 'recadastro', 'data_nascimento', 'data_expedicao_rg', 
  'data_expedicao_ctps', 'data_emissao_rgp', 'data_transferencia', 
  'data_falecimento', 'data_ultimo_pagamento', 'primeira_data_pagamento', 
  'ultimo_dia_pago', 'data_ultimo_movimento', 'validade_dap'
];

const SAFE_COLUMNS = [
  'id', 'tenant_id', 'codigo_socio', 'data_admissao', 'codigo_antigo', 'recadastro', 'codigo_delegacia', 'codigo_comunidade', 
  'data_nascimento', 'nome', 'apelido', 'nome_pai', 'nome_mae', 'estado_civil', 'conjuge', 'nacionalidade', 'naturalidade', 
  'uf_naturalidade', 'sexo', 'alfabetizado', 'escolaridade', 'tipo_sanguineo', 'endereco', 'numero', 'bairro', 'cidade', 
  'uf', 'cep', 'complemento', 'ponto_referencia', 'telefone', 'email', 'profissao', 'empregador', 'local_trabalho', 
  'inscricao_incra', 'area_fazenda', 'renda_familiar', 'quantidade_membros_familia', 'rg', 'orgao_expedidor_rg', 
  'data_expedicao_rg', 'cpf', 'ctps', 'serie_ctps', 'data_expedicao_ctps', 'titulo_eleitor', 'zona_eleitoral', 
  'secao_eleitoral', 'cir', 'nit', 'pis', 'cei', 'caepf', 'sus', 'numero_dap', 'grupo_dap', 'validade_dap', 
  'outros_documentos', 'embarcacao', 'embarcacao_rgp', 'rgp_uf', 'ab', 'numero_tripulantes', 'cpf_proprietario', 
  'numero_propriedade_receita_federal', 'data_emissao_rgp', 'codigo_categoria', 'situacao', 'ultimo_mes_pago', 
  'numero_beneficio', 'especie', 'data_transferencia', 'data_falecimento', 'destino_transferencia', 'id_defeso', 
  'tem_defeso', 'situacao_mpa', 'codigo_gps_mpa', 'senha_gps_mpa', 'senha_inss_mpa', 'data_ultimo_pagamento', 
  'primeira_data_pagamento', 'ultimo_dia_pago', 'data_ultimo_movimento', 'livro', 'folha', 'numero_termo', 
  'pasta_socios', 'pasta_embarcacao', 'foto', 'local_foto', 'webcam', 'observacao'
];

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

const normalizeToInputDate = (value: any): string => {
  if (!value || value === "") return "";
  try {
    const str = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    let date: Date;
    if (/^\d{2}[\/-]\d{2}[\/-]\d{4}/.test(str)) {
      const parts = str.split(/[\/-]/);
      date = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    } else {
      date = new Date(str);
    }
    if (isNaN(date.getTime())) return "";
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } catch (e) { return ""; }
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
    // Escuta mensagens do Service Worker
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OFFLINE_READY') {
        setIsOfflineReady(true);
        localStorage.setItem('sga_offline_ready', 'true');
      }
    };
    navigator.serviceWorker?.addEventListener('message', handleSWMessage);
    return () => navigator.serviceWorker?.removeEventListener('message', handleSWMessage);
  }, []);

  useEffect(() => {
    const handleStatusChange = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      if (online && isAppReady && session.user) {
        syncData();
      }
    };
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, [isAppReady, session.user]);

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

  useEffect(() => {
    if (isAppReady && session.user && isOnline && supabase) {
      syncData();
    }
  }, [session.user?.id, isAppReady]);

  useEffect(() => {
    if (!isAppReady) return;
    const save = async () => {
      try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        await store.clear();
        allMembers.forEach(m => { if (m.id) store.put(m); });
      } catch (e) {}
    };
    save();
    localStorage.setItem('sga_templates_v2', JSON.stringify(templates));
    localStorage.setItem('sga_tenants_v1', JSON.stringify(tenants));
    localStorage.setItem('sga_session', JSON.stringify(session));
  }, [allMembers, templates, tenants, session, isAppReady]);

  const generateId = () => {
    try { return crypto.randomUUID(); } catch (e) { return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36); }
  };

  const sanitize = (m: any, forcedTenantId?: string): Member => {
    const member = { ...EMPTY_MEMBER };
    const tid = m.tenant_id || forcedTenantId || session.user?.tenantId || "";
    Object.keys(EMPTY_MEMBER).forEach(key => {
      let val = m[key] !== undefined && m[key] !== null ? m[key] : "";
      if (DATE_FIELDS.includes(key)) val = normalizeToInputDate(val);
      if (key === 'dependents') {
        let deps = val;
        if (typeof deps === 'string' && deps !== "") { try { deps = JSON.parse(deps); } catch(e) { deps = []; } }
        member.dependents = (Array.isArray(deps) ? deps : []).map((d: any) => ({ 
          id: d.id || generateId(),
          name: d.name || "",
          birthDate: normalizeToInputDate(d.birthDate),
          relationship: d.relationship || ""
        }));
      } else { member[key] = String(val); }
    });
    if (!member.id) member.id = generateId();
    member.tenant_id = tid;
    return member as Member;
  };

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
      if (!session.user) return { success: true, count: 0, tenants: freshTenants };
      const isSuperAdmin = session.user.role === 'SUPER_ADMIN';
      const currentTid = session.user.tenantId;
      const membersToSync = overrideMembers || allMembers;
      
      const unsynced = membersToSync.filter(m => !m.isSynced && (isSuperAdmin || m.tenant_id === currentTid));
      if (unsynced.length > 0) {
        const payload = unsynced.map(m => {
          const cleaned: any = {};
          SAFE_COLUMNS.forEach(col => { if (col === 'tenant_id') cleaned[col] = m.tenant_id || currentTid; else cleaned[col] = (m as any)[col] || null; });
          return cleaned;
        });
        await supabase.from('socios').upsert(payload);
      }

      let pullQuery = supabase.from('socios').select('*');
      if (!isSuperAdmin && currentTid) pullQuery = pullQuery.eq('tenant_id', currentTid);
      
      const { data: remote, error: pullError } = await pullQuery;
      if (!pullError && remote) {
        const mappedRemote = remote.map(rm => ({ ...sanitize(rm), isSynced: true }));
        setAllMembers(prev => {
          const otherTenantsOrUnsynced = prev.filter(p => {
            const isTargetScope = isSuperAdmin || p.tenant_id === currentTid;
            return !isTargetScope || !p.isSynced;
          });
          return [...otherTenantsOrUnsynced, ...mappedRemote];
        });
      }
      
      const now = new Date().toLocaleString('pt-BR');
      setLastSync(now);
      localStorage.setItem('sga_last_sync', now);
      return { success: true, count: unsynced.length, tenants: freshTenants };
    } catch (e: any) { return { success: false, count: 0, tenants }; } finally { setCloudConnected(false); }
  };

  const login = async (username: string, pass: string, tenantList?: Tenant[]): Promise<boolean> => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('system_admins').select('*').eq('username', username).eq('password', pass).single();
        if (data && !error) {
          const masterSession: AuthSession = { user: { id: data.id, username: data.username, role: 'SUPER_ADMIN' } };
          setSession(masterSession);
          return true;
        }
      } catch (e) {}
    }
    const list = tenantList || tenants;
    const t = list.find(x => x.adminUsername === username && x.adminPassword === pass);
    if (t && t.isActive) {
      const userSession: AuthSession = { user: { id: t.id, username: t.adminUsername, role: 'REGION_USER', tenantId: t.id, cityName: t.name } };
      setSession(userSession);
      return true;
    }
    return false;
  };

  const value = {
    members: useMemo(() => {
      if (!session.user) return [];
      if (session.user.role === 'SUPER_ADMIN') return allMembers;
      return allMembers.filter(m => m.tenant_id === session.user?.tenantId);
    }, [allMembers, session.user?.tenantId]),
    templates, tenants, session, isAppReady, isOfflineReady, login,
    logout: () => {
      setSession({ user: null });
      localStorage.removeItem('sga_session');
    },
    addTenant: async (name: string, user: string, pass: string) => {
      const id = generateId();
      const createdAt = new Date().toISOString();
      const payload = { id, name, admin_username: user, admin_password: pass, is_active: true, created_at: createdAt };
      if (supabase) {
        const { data, error } = await supabase.from('tenants').insert([payload]).select();
        if (error) throw new Error(error.message);
        if (data && data[0]) {
          const t = data[0];
          setTenants(prev => [...prev, { id: t.id, name: t.name, adminUsername: t.admin_username, adminPassword: t.admin_password, isActive: t.is_active !== false, createdAt: t.created_at, updatedAt: t.updated_at || t.created_at }]);
          return;
        }
      }
      setTenants(prev => [...prev, { id, name, adminUsername: user, adminPassword: pass, isActive: true, createdAt, updatedAt: createdAt }]);
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
    addMember: (m: Member) => {
      const newM = { ...sanitize(m), isSynced: false };
      const newList = [...allMembers, newM];
      setAllMembers(newList);
      if (navigator.onLine) syncData(newList);
    },
    updateMember: (index: number, m: Member) => {
      const filtered = allMembers.filter(x => x.tenant_id === session.user?.tenantId);
      const target = filtered[index];
      if (target) {
        const updated = { ...sanitize(m), isSynced: false };
        const newList = allMembers.map(p => p.id === target.id ? updated : p);
        setAllMembers(newList);
        if (navigator.onLine) syncData(newList);
      }
    },
    deleteMember: async (index: number) => {
      const filtered = allMembers.filter(x => x.tenant_id === session.user?.tenantId);
      const target = filtered[index];
      if (target) {
        if (supabase && target.isSynced) {
          try { await supabase.from('socios').delete().eq('id', target.id); } catch(e) {}
        }
        const newList = allMembers.filter(p => p.id !== target.id);
        setAllMembers(newList);
      }
    },
    addTemplate: (t: DocumentTemplate) => setTemplates(prev => [...prev, { ...t, tenantId: session.user?.tenantId || '' }]),
    deleteTemplate: (id: string) => setTemplates(prev => prev.filter(x => x.id !== id)),
    importMembers: (list: Member[]) => {
      const sanitizedList = list.map(l => ({ ...sanitize(l), isSynced: false }));
      setAllMembers(prev => {
        const map = new Map(prev.map(p => [p.id, p]));
        sanitizedList.forEach(s => map.set(s.id, s));
        return Array.from(map.values());
      });
      return sanitizedList;
    },
    clearDatabase: () => {
      setAllMembers([]); setTemplates([]); setTenants([]);
      localStorage.removeItem('sga_last_sync'); localStorage.removeItem('sga_session');
      localStorage.removeItem('sga_offline_ready');
      indexedDB.deleteDatabase(DB_NAME);
      window.location.reload();
    },
    isOnline, lastSync, syncData, cloudConnected, cloudKeys, 
    updateCloudKeys: (url: string, key: string) => { 
      setCloudKeys({ url, key }); 
      localStorage.setItem('sga_cloud_url', url); localStorage.setItem('sga_cloud_key', key); 
    }
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
