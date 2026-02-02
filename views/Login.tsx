
import React, { useState } from 'react';
import { Users, Lock, User, ChevronRight, RefreshCw } from 'lucide-react';
import { useApp } from '../AppContext';
import { useNavigation } from '../NavigationContext';

export const LoginView: React.FC = () => {
  const { login, syncData } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      // 1. Sincroniza unidades (tenants) para validar credenciais regionais atualizadas
      const syncResult = await syncData();
      
      // 2. Tenta o login
      const success = await login(username, password, syncResult.tenants);
      
      if (!success) {
        alert("Credenciais inválidas. Verifique seu usuário e senha.");
      }
      // A sincronização de dados da unidade ocorrerá automaticamente via AppContext useEffect
    } catch (err) {
      // Fallback local se o Supabase falhar
      const success = await login(username, password);
      if (!success) {
        alert("Falha no acesso. Verifique sua conexão ou credenciais.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-600 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 dark:from-slate-950 dark:via-blue-950 dark:to-slate-950 opacity-100 transition-all duration-700" />
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-400 dark:bg-blue-600 rounded-full blur-[140px] opacity-40 animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-400 dark:bg-emerald-600 rounded-full blur-[140px] opacity-30 animate-pulse" />
      </div>

      <div className="w-full max-w-md animate-in zoom-in-95 duration-500 relative z-10">
        <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl rounded-[48px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] p-10 lg:p-14 border border-white/20 dark:border-white/5">
          <div className="text-center mb-10">
            <div className="bg-blue-600 w-20 h-20 rounded-[28px] flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-blue-600/40 border-4 border-white/20">
              <Users size={36} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Acesso ao SGA</h1>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-2">Plataforma de Gestão de Associados</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">Usuário</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-blue-600 transition-colors">
                  <User size={18} />
                </div>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl py-4 pl-14 pr-6 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all" placeholder="Seu usuário" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">Senha</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl py-4 pl-14 pr-6 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all" placeholder="••••••••" required />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-5 rounded-[28px] font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-600/30 disabled:opacity-50">
              {isLoading ? <RefreshCw className="animate-spin" size={16} /> : <><ChevronRight size={16} /> Entrar no Sistema</>}
            </button>
          </form>
        </div>
        <p className="text-center text-white/40 dark:text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-8">Desenvolvido por Orbio Tech &copy; 2026</p>
      </div>
    </div>
  );
};
