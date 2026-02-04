
import React, { useState } from 'react';
import { 
  Users, UserPlus, MessageSquare, MapPin, FileText, 
  Settings, ChevronDown, ChevronRight, X,
  AlertCircle, BarChart2, LogOut,
  UserCheck, Fish, ShieldAlert, Landmark, Tags, Receipt, Wallet, 
  CalendarDays, BookOpen, ShieldCheck as ShieldIcon,
  Moon, Sun,
  FileSignature, Files,
  Calculator, ClipboardList
} from 'lucide-react';
import { useNavigation } from '../NavigationContext';
import { useApp } from '../AppContext';
import { MenuItem } from '../types';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, isSidebarOpen, setSidebarOpen, isDarkMode, toggleDarkMode } = useNavigation();
  const { session, logout } = useApp();
  const [expanded, setExpanded] = useState<string[]>(['cadastro', 'documentos', 'previdencias', 'recebimentos', 'financeiro', 'contabil']);

  const toggleExpand = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const MENU_STRUCTURE: MenuItem[] = session.user?.role === 'SUPER_ADMIN' 
    ? [
        { id: 'admin-panel', label: 'Gestão de Licenças', icon: ShieldIcon },
        { id: 'relatorios', label: 'Estatísticas Globais', icon: BarChart2 },
        { id: 'docs', label: 'Documentação', icon: BookOpen },
        { id: 'sair', label: 'Sair do Sistema', icon: LogOut },
      ]
    : [
        { id: 'home', label: 'Painel Inicial', icon: Settings },
        { id: 'cadastro-socios', label: 'Sócios', icon: UserPlus },
        {
          id: 'cadastro',
          label: 'Auxiliares',
          icon: Users,
          children: [
            { id: 'cadastro-assunto', label: 'Assunto do Atendimento', icon: MessageSquare },
            { id: 'cadastro-atendente', label: 'Usuário Atendente', icon: UserCheck },
            { id: 'cadastro-pescado', label: 'Pescado', icon: Fish },
            { id: 'cadastro-localidade', label: 'Localidade', icon: MapPin },
            { id: 'cadastro-categorias', label: 'Categorias', icon: Tags },
          ]
        },
        {
          id: 'contabil',
          label: 'Contábil',
          icon: Calculator,
          children: [
            { id: 'cadastro-contas', label: 'Contas e Subcontas', icon: Receipt },
          ]
        },
        {
          id: 'recebimentos',
          label: 'Recebimentos',
          icon: Wallet,
          children: [
            { id: 'recebimentos-mensalidades', label: 'Mensalidades', icon: CalendarDays },
            { id: 'recebimentos-filiacoes', label: 'Filiações', icon: UserCheck },
            { id: 'recebimentos-sindical', label: 'Contribuição Sindical', icon: Landmark },
          ]
        },
        { 
          id: 'previdencias', 
          label: 'Previdências', 
          icon: AlertCircle,
          children: [
            { id: 'previdencias-requerimento', label: 'Requerimento ao INSS', icon: ClipboardList },
            { id: 'previdencias-auto-declaracao', label: 'Auto Declaração', icon: FileSignature },
            { id: 'previdencias-declaracao', label: 'Declaração', icon: FileText },
            { id: 'previdencias-recurso', label: 'Recurso', icon: MessageSquare },
          ]
        },
        { 
          id: 'documentos', 
          label: 'Documentos', 
          icon: FileText,
          children: [
            { id: 'documentos-modelos', label: 'Editor de Modelos', icon: Settings },
            { id: 'documentos-lista', label: 'Documentos Cadastrados', icon: Files },
          ]
        },
        { id: 'relatorios', label: 'Relatórios Diversos', icon: BarChart2 },
        { id: 'sair', label: 'Sair do Sistema', icon: LogOut },
      ];

  const handleAction = (item: MenuItem) => {
    if (item.id === 'sair') {
      if(confirm('Deseja sair da sessão?')) logout();
      return;
    }
    setActiveView(item.id);
    setSidebarOpen(false);
  };

  const renderItems = (items: MenuItem[], level = 0) => {
    return items.map(item => {
      const isExpanded = expanded.includes(item.id);
      const isActive = activeView === item.id;
      const hasChildren = item.children && item.children.length > 0;

      return (
        <div key={item.id} className="w-full">
          <button
            onClick={() => hasChildren ? toggleExpand(item.id) : handleAction(item)}
            style={{ paddingLeft: `${(level * 16) + 16}px` }}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
              isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon && <item.icon size={16} />}
              <span className="truncate">{item.label}</span>
            </div>
            {hasChildren && (isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />)}
          </button>
          {hasChildren && isExpanded && (
            <div className="mt-1 space-y-1 mb-2">
              {renderItems(item.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <aside className={`w-[360px] bg-slate-950 dark:bg-black text-slate-400 flex flex-col fixed inset-y-0 left-0 z-[70] transition-transform duration-500 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full shadow-2xl'}`}>
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-600/20"><Users size={20} /></div>
          <div className="flex flex-col">
            <span className="font-black text-white text-xs uppercase tracking-[0.2em]">SGA</span>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{session.user?.role === 'SUPER_ADMIN' ? 'Painel Master' : 'Gestão Integrada'}</span>
          </div>
        </div>
        <button className="lg:hidden text-slate-600" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-hide">
        {renderItems(MENU_STRUCTURE)}
      </nav>
      <div className="p-6 border-t border-white/5 space-y-4">
        <button 
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-4 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800 text-amber-400 group-hover:scale-110 transition-transform">
            {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">
            {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
          </span>
        </button>

        <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4 border border-white/5">
          <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center text-white font-black text-[10px]">
            {session.user?.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-white text-[9px] font-black uppercase tracking-widest truncate">{session.user?.cityName || session.user?.username}</span>
            <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-tighter">Sessão Ativa</span>
          </div>
          <button onClick={() => logout()} className="ml-auto text-slate-500 hover:text-red-400 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
