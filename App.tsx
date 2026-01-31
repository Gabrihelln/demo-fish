import React, { useEffect } from 'react';
import { AppProvider, useApp } from './AppContext';
import { NavigationProvider, useNavigation } from './NavigationContext';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './views/Home';
import { SociosView } from './views/Socios';
import { DocumentosModelosView } from './views/DocumentosModelos';
import { DocumentosListaView } from './views/DocumentosLista';
import { RelatoriosView } from './views/Relatorios';
import { LoginView } from './views/Login';
import { AdminPanelView } from './views/AdminPanel';
import { 
  Menu as MenuIcon, Settings, Wallet, Landmark, 
  Wifi, WifiOff, RefreshCw, ShieldCheck
} from 'lucide-react';

const HeaderStatus: React.FC = () => {
  const { isOnline, lastSync, syncData, session } = useApp();
  
  return (
    <div className="flex items-center gap-4">
      {session.user?.cityName && (
        <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 hidden md:flex items-center gap-2">
          <ShieldCheck size={14} className="text-blue-600" />
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{session.user.cityName}</span>
        </div>
      )}

      <div className="hidden lg:flex flex-col text-right pr-4 border-r border-slate-200">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sincronização</p>
        <p className="text-[10px] font-bold text-slate-600">{lastSync || 'Pendente'}</p>
      </div>

      <button 
        onClick={syncData}
        className={`p-2.5 rounded-xl transition-all ${isOnline ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-slate-100 text-slate-400'}`}
      >
        <RefreshCw size={18} />
      </button>

      <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all ${isOnline ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
        {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
        <span className="text-[10px] font-black uppercase tracking-widest">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  );
};

const MainLayout: React.FC = () => {
  const { session } = useApp();
  const { activeView, setActiveView, setSidebarOpen } = useNavigation();

  // Resetar view ao trocar de role
  useEffect(() => {
    if (session.user?.role === 'SUPER_ADMIN') {
      setActiveView('admin-panel');
    } else {
      setActiveView('home');
    }
  }, [session.user?.role]);

  if (!session.user) return <LoginView />;

  const renderActiveView = () => {
    // Rotas de Admin
    if (session.user?.role === 'SUPER_ADMIN') {
      switch (activeView) {
        case 'admin-panel': return <AdminPanelView />;
        case 'relatorios': return <RelatoriosView />;
        default: return <AdminPanelView />;
      }
    }

    // Rotas de Usuário Normal
    switch (activeView) {
      case 'home': return <HomeView />;
      case 'cadastro-socios': return <SociosView />;
      case 'documentos-modelos': return <DocumentosModelosView />;
      case 'documentos-lista': return <DocumentosListaView />;
      case 'relatorios': return <RelatoriosView />;
      default: return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-inter text-slate-900">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen lg:ml-[360px] transition-all">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 lg:px-12 sticky top-0 z-[50]">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-3 text-slate-600 hover:bg-slate-100 rounded-2xl" onClick={() => setSidebarOpen(true)}>
              <MenuIcon size={24} />
            </button>
            <div className="flex flex-col">
              <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                SGA - {session.user.role === 'SUPER_ADMIN' ? 'PAINEL MASTER' : 'GESTÃO DE ASSOCIADOS'}
              </h2>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-5">
                {session.user.role === 'SUPER_ADMIN' ? 'Controle de Plataforma' : session.user.cityName}
              </span>
            </div>
          </div>
          
          <HeaderStatus />
        </header>

        <div className="p-8 lg:p-12">
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <NavigationProvider>
        <MainLayout />
      </NavigationProvider>
    </AppProvider>
  );
};

export default App;