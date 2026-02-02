
import React, { useState } from 'react';
import { Users, Lock, User, ShieldCheck, ChevronRight, RefreshCw } from 'lucide-react';
import { useApp } from '../AppContext';
import { useNavigation } from '../NavigationContext';

export const LoginView: React.FC = () => {
  const { login, syncData } = useApp();
  const { isDarkMode } = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const syncResult = await syncData();
      const success = login(username, password, syncResult.tenants);
      if (!success) {
        alert("Credenciais inválidas ou acesso bloqueado.");
      }
    } catch (err) {
      const success = login(username, password);
      if (!success) {
        alert("Não foi possível conectar à nuvem e as credenciais locais falharam.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md animate-in zoom-in-95 duration-500">
        <div className="bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl p-10 lg:p-14 relative z-10 border border-slate-100 dark:border-slate-800">
          <div className="text-center mb-12">
            <div className="bg-blue-600 w-16 h-16 rounded-[24px] flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-600/30">
              <Users size={32} />
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
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-3xl py-4 pl-14 pr-6 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  placeholder="Seu nome de usuário"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-4">Senha</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-3xl py-4 pl-14 pr-6 text-sm font-semibold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-slate-900 dark:bg-blue-600 text-white py-5 rounded-[28px] font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-600 dark:hover:bg-blue-500 hover:-translate-y-1 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="animate-spin" size={16} /> Verificando Unidades...
                </>
              ) : (
                <>
                  Entrar no Sistema <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          {/*<div className="mt-12 flex items-center justify-center gap-3 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Conexão Segura e Criptografada</span> 
          </div> */}
        </div>

        <p className="text-center text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-widest mt-8">
          Desenvolvido por Orbio Tech &copy; 2026
        </p>
      </div>
    </div>
  );
};
