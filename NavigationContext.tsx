
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface NavigationContextType {
  activeView: string;
  setActiveView: (view: string) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState('home');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // Inicializa como falso (Modo Claro) por padrão
  // Só ativa o Dark se o usuário já tiver clicado explicitamente no botão antes (valor salvo no localStorage)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('sga_theme');
    return saved === 'dark'; 
  });

  // Efeito para aplicar a classe no HTML e persistir
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
      activeView, setActiveView, isSidebarOpen, setSidebarOpen, isDarkMode, toggleDarkMode 
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
