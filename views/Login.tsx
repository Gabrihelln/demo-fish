
import React, { useState } from 'react';
import { Users, Lock, User, ShieldCheck, ChevronRight } from 'lucide-react';
import { useApp } from '../AppContext';

export const LoginView: React.FC = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const success = login(username, password);
      if (!success) {
        alert("Credenciais inválidas ou acesso bloqueado.");
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorativo */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md animate-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[48px] shadow-2xl p-10 lg:p-14 relative z-10 border border-white/10">
          <div className="text-center mb-12">
            <div className="bg-blue-600 w-16 h-16 rounded-[24px] flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-600/30">
              <Users size={32} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Acesso ao SGA</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Plataforma de Gestão de Associados</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Usuário</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-4 pl-14 pr-6 text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all"
                  placeholder="Seu nome de usuário"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Senha</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-3xl py-4 pl-14 pr-6 text-sm font-semibold outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-slate-900 text-white py-5 rounded-[28px] font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-600 hover:-translate-y-1 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
            >
              {isLoading ? "Autenticando..." : (
                <>
                  Entrar no Sistema <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 flex items-center justify-center gap-3 py-4 bg-slate-50 rounded-2xl border border-slate-100">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Conexão Segura e Criptografada</span>
          </div>
        </div>

        <p className="text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-8">
          Desenvolvido por SGA Tech &copy; 2024
        </p>
      </div>
    </div>
  );
};
