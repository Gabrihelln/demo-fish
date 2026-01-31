
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Member, DocumentTemplate, Tenant, AuthSession, UserRole } from './types';

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
  isOnline: boolean;
  lastSync: string | null;
  syncData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_MEMBERS = 'sga_members_v2';
const STORAGE_TEMPLATES = 'sga_templates_v2';
const STORAGE_TENANTS = 'sga_tenants_v1';
const STORAGE_SESSION = 'sga_session';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [session, setSession] = useState<AuthSession>({ user: null });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<string | null>(localStorage.getItem('sga_last_sync'));

  useEffect(() => {
    const savedMembers = localStorage.getItem(STORAGE_MEMBERS);
    const savedTemplates = localStorage.getItem(STORAGE_TEMPLATES);
    const savedTenants = localStorage.getItem(STORAGE_TENANTS);
    const savedSession = localStorage.getItem(STORAGE_SESSION);

    if (savedMembers) setMembers(JSON.parse(savedMembers));
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
    
    // Seeding inicial se não houver tenants
    if (savedTenants) {
      setTenants(JSON.parse(savedTenants));
    } else {
      const demoTenant: Tenant = {
        id: 'demo-tenant',
        name: 'Colônia de Teste (Demo)',
        adminUsername: 'demo',
        adminPassword: 'demo',
        isActive: true,
        createdAt: new Date().toISOString()
      };
      setTenants([demoTenant]);
    }

    if (savedSession) setSession(JSON.parse(savedSession));

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_MEMBERS, JSON.stringify(members));
    localStorage.setItem(STORAGE_TEMPLATES, JSON.stringify(templates));
    localStorage.setItem(STORAGE_TENANTS, JSON.stringify(tenants));
    localStorage.setItem(STORAGE_SESSION, JSON.stringify(session));
  }, [members, templates, tenants, session]);

  const login = (username: string, pass: string): boolean => {
    // Login Super Admin
    if (username === 'admin' && pass === 'admin') {
      const newSession: AuthSession = { user: { id: 'master', username: 'admin', role: 'SUPER_ADMIN' } };
      setSession(newSession);
      return true;
    }

    // Login Cliente Regional com verificação de senha
    const tenant = tenants.find(t => t.adminUsername === username && t.adminPassword === pass);
    if (tenant) {
      if (tenant.isActive) {
        const newSession: AuthSession = { 
          user: { id: tenant.id, username: tenant.adminUsername, role: 'REGION_USER', tenantId: tenant.id, cityName: tenant.name } 
        };
        setSession(newSession);
        return true;
      } else {
        alert("Esta conta foi bloqueada pelo administrador do sistema.");
        return false;
      }
    }

    return false;
  };

  const logout = () => {
    setSession({ user: null });
    localStorage.removeItem(STORAGE_SESSION);
  };

  const addTenant = (name: string, username: string, pass: string) => {
    const newTenant: Tenant = {
      id: Date.now().toString(),
      name,
      adminUsername: username,
      adminPassword: pass,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    setTenants([...tenants, newTenant]);
  };

  const toggleTenantStatus = (id: string) => {
    setTenants(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
    if (session.user?.tenantId === id) logout();
  };

  const deleteTenant = (id: string) => setTenants(tenants.filter(t => t.id !== id));

  const addMember = (m: Member) => {
    if (!session.user?.tenantId) return;
    setMembers([...members, { ...m, id: Date.now().toString(), tenantId: session.user.tenantId }]);
  };
  
  const updateMember = (idx: number, m: Member) => {
    const globalIdx = members.findIndex(orig => orig.id === m.id);
    if (globalIdx !== -1) {
      const newMembers = [...members];
      newMembers[globalIdx] = m;
      setMembers(newMembers);
    }
  };

  const deleteMember = (idx: number) => {
    const filtered = getFilteredMembers();
    const item = filtered[idx];
    if (item) setMembers(members.filter(m => m.id !== item.id));
  };
  
  const addTemplate = (t: DocumentTemplate) => {
    if (!session.user?.tenantId) return;
    setTemplates([...templates, { ...t, tenantId: session.user.tenantId }]);
  };

  const deleteTemplate = (id: string) => setTemplates(templates.filter(t => t.id !== id));

  const getFilteredMembers = () => {
    if (!session.user) return [];
    if (session.user.role === 'SUPER_ADMIN') return members;
    return members.filter(m => m.tenantId === session.user?.tenantId);
  };

  const getFilteredTemplates = () => {
    if (!session.user) return [];
    if (session.user.role === 'SUPER_ADMIN') return templates;
    return templates.filter(t => t.tenantId === session.user?.tenantId);
  };

  const syncData = async () => {
    if (!navigator.onLine) return alert("Offline!");
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const now = new Date().toLocaleString('pt-BR');
        setLastSync(now);
        localStorage.setItem('sga_last_sync', now);
        alert("Sincronização concluída!");
        resolve();
      }, 1000);
    });
  };

  return (
    <AppContext.Provider value={{ 
      members: getFilteredMembers(), 
      templates: getFilteredTemplates(),
      tenants, session, login, logout, addTenant, toggleTenantStatus, deleteTenant,
      addMember, updateMember, deleteMember, addTemplate, deleteTemplate, 
      isOnline, lastSync, syncData 
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
