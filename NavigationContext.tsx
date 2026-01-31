
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  activeView: string;
  setActiveView: (view: string) => void;
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState('home');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <NavigationContext.Provider value={{ activeView, setActiveView, isSidebarOpen, setSidebarOpen }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigation must be used within NavigationProvider');
  return context;
};
