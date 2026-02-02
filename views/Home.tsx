
import React from 'react';
import { 
  Layout as LayoutIcon, Cloud, Users, 
  Database, ShieldCheck, Globe, Clock 
} from 'lucide-react';
import { useApp } from '../AppContext';

export const HomeView: React.FC = () => {
  const { members, lastSync, isOnline } = useApp();

  const stats = [
    { label: 'Associados', value: members.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Status Base', value: isOnline ? 'Online' : 'Offline', icon: Database, color: isOnline ? 'text-emerald-600' : 'text-amber-600', bg: isOnline ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Última Sinc.', value: lastSync ? lastSync.split(',')[0] : 'N/A', icon: Clock, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-slate-800' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 dark:bg-slate-800 p-12 rounded-[48px] text-white flex flex-col justify-between relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Cloud size={160} />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-4">
              Arquitetura<br/><span className="text-blue-500">Local-First</span>
            </h2>
            <p className="text-slate-400 text-sm font-medium max-w-sm mb-8">
              Este sistema foi projetado para funcionar perfeitamente em áreas com internet instável. 
              Todos os seus dados são salvos localmente e sincronizados automaticamente quando houver conexão.
            </p>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 w-fit px-6 py-3 rounded-2xl">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Dados Protegidos Localmente</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-[48px] shadow-sm flex flex-col justify-center items-center text-center">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <Globe size={40} className="text-slate-200 dark:text-slate-700" />
          </div>
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Pronto para Operar</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 max-w-xs leading-relaxed">
            Selecione uma opção no menu lateral para começar a gerenciar seus associados.
          </p>
        </div>
      </div>
    </div>
  );
};
