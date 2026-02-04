
import React from 'react';
import { 
  Users, Database, Clock, PlusCircle, 
  DollarSign, ClipboardList, FileSignature, 
  BarChart2, MapPin, ChevronRight, Zap
} from 'lucide-react';
import { useApp } from '../AppContext';
import { useNavigation } from '../NavigationContext';

export const HomeView: React.FC = () => {
  const { members, lastSync, isOnline } = useApp();
  const { setActiveView, setMemberModalOpen, setMemberModalMode, setMensalidadeModalOpen } = useNavigation();

  const stats = [
    { label: 'Associados', value: members.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Status Base', value: isOnline ? 'Online' : 'Offline', icon: Database, color: isOnline ? 'text-emerald-600' : 'text-amber-600', bg: isOnline ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Última Sinc.', value: lastSync ? lastSync.split(',')[0] : 'N/A', icon: Clock, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' },
  ];

  const quickActions = [
    { id: 'cadastro-socios', label: 'Cadastrar Sócio', desc: 'Inclusão de novos associados', icon: PlusCircle, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', isModalAction: true },
    { id: 'recebimentos-mensalidades', label: 'Lançar Mensalidade', desc: 'Controle de pagamentos', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', isModalAction: true },
    { id: 'previdencias-requerimento', label: 'Requerimento INSS', desc: 'Novo processo previdenciário', icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { id: 'previdencias-auto-declaracao', label: 'Auto Declaração', desc: 'Emissão de documentos legais', icon: FileSignature, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { id: 'relatorios', label: 'Gerar Relatórios', desc: 'Estatísticas e listagens', icon: BarChart2, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { id: 'cadastro-localidade', label: 'Localidades', desc: 'Gestão de comunidades', icon: MapPin, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  ];

  const handleAction = (action: any) => {
    if (action.isModalAction) {
      if (action.id === 'cadastro-socios') {
        setMemberModalMode('add');
        setMemberModalOpen(true);
      } else if (action.id === 'recebimentos-mensalidades') {
        setMensalidadeModalOpen(true);
      }
    } else {
      setActiveView(action.id);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6 group hover:-translate-y-1 transition-all">
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS SECTION */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-4">
          <Zap className="text-blue-600" size={20} />
          <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Ações Rápidas do Sistema</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action) => (
            <button 
              key={action.id}
              onClick={() => handleAction(action)}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[40px] shadow-sm hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900 transition-all group flex flex-col text-left relative overflow-hidden"
            >
              <div className={`w-12 h-12 ${action.bg} ${action.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <action.icon size={20} />
              </div>
              
              <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight group-hover:text-blue-600 transition-colors">
                {action.label}
              </h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                {action.desc}
              </p>

              <div className="absolute bottom-8 right-8 text-slate-200 dark:text-slate-800 group-hover:text-blue-500 group-hover:translate-x-2 transition-all">
                <ChevronRight size={24} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
