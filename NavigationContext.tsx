
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface NavigationContextType {
  activeView: string;
  setActiveView: (view: string) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  // Estados do Modal de Sócio
  isMemberModalOpen: boolean;
  setMemberModalOpen: (open: boolean) => void;
  memberModalMode: 'add' | 'edit';
  setMemberModalMode: (mode: 'add' | 'edit') => void;
  selectedMemberId: string | null;
  setSelectedMemberId: (id: string | null) => void;
  // Estados do Modal de Mensalidade
  isMensalidadeModalOpen: boolean;
  setMensalidadeModalOpen: (open: boolean) => void;
  // Estado para Edição de Documentos
  selectedTemplateId: string | null;
  setSelectedTemplateId: (id: string | null) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState('home');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMemberModalOpen, setMemberModalOpen] = useState(false);
  const [memberModalMode, setMemberModalMode] = useState<'add' | 'edit'>('add');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isMensalidadeModalOpen, setMensalidadeModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('sga_theme');
    return saved === 'dark'; 
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('sga_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('sga_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <NavigationContext.Provider value={{ 
      activeView, setActiveView, isSidebarOpen, setSidebarOpen, isDarkMode, toggleDarkMode,
      isMemberModalOpen, setMemberModalOpen, memberModalMode, setMemberModalMode,
      selectedMemberId, setSelectedMemberId,
      isMensalidadeModalOpen, setMensalidadeModalOpen,
      selectedTemplateId, setSelectedTemplateId
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigation must be used within NavigationProvider');
  return context;
};
