import React, { useState } from 'react';
import { 
  ShieldAlert, Plus, MapPin, User, CheckCircle2, 
  XCircle, Trash2, Calendar, Globe, Search, Lock
} from 'lucide-react';
import { useApp } from '../AppContext';

export const AdminPanelView: React.FC = () => {
  const { tenants, addTenant, toggleTenantStatus, deleteTenant } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', username: '', password: '' });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.password) return alert("Preencha todos os campos, incluindo a senha.");
    addTenant(formData.name, formData.username, formData.password);
    setIsAdding(false);
    setFormData({ name: '', username: '', password: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Painel de Licenciamento</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Gestão de instâncias e clientes regionais</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:-translate-y-1 transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus size={18} /> Novo Cliente / Cidade
        </button>
      </div>

      {isAdding && (
        <div className="bg-white border border-blue-100 p-8 rounded-[40px] shadow-sm animate-in slide-in-from-top-4 duration-300">
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Cidade / Associação</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-blue-300"
                placeholder="Ex: Colônia Z-10 Manaus"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Usuário (Login)</label>
              <input 
                type="text" 
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-blue-300"
                placeholder="Ex: colonia_z10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Senha de Acesso</label>
              <input 
                type="password" 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-bold outline-none focus:border-blue-300"
                placeholder="••••••••"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald-700 transition-colors">Confirmar</button>
              <button type="button" onClick={() => setIsAdding(false)} className="px-6 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] hover:bg-slate-200">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-[48px] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
            <Globe size={18} className="text-blue-600" /> Clientes Ativos na Plataforma
          </h3>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total: {tenants.length}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Cidade / Associação</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Acesso (Login)</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Data de Início</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Status de Licença</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Ações de Controle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                        <MapPin size={18} />
                      </div>
                      <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-blue-600">
                        <User size={14} />
                        <span className="text-xs font-bold font-mono">{t.adminUsername}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Lock size={12} />
                        <span className="text-[10px] font-bold">••••••••</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(t.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="px-8 py-6">
                    {t.isActive ? (
                      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit border border-emerald-100">
                        <CheckCircle2 size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Ativo</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-500 bg-red-50 px-3 py-1.5 rounded-lg w-fit border border-red-100">
                        <XCircle size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Bloqueado</span>
                      </div>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right space-x-2">
                    <button 
                      onClick={() => toggleTenantStatus(t.id)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${t.isActive ? 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-600 hover:text-white'}`}
                    >
                      {t.isActive ? "Bloquear" : "Ativar"}
                    </button>
                    <button 
                      onClick={() => { if(confirm('Excluir cliente permanentemente?')) deleteTenant(t.id); }}
                      className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-300">
                    <ShieldAlert size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Nenhum cliente cadastrado no painel.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};