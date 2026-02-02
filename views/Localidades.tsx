
import React, { useState, useMemo } from 'react';
import { 
  MapPin, Search, Plus, Edit3, Trash2, X, Save, 
  Hash, List as ListIcon, AlertTriangle 
} from 'lucide-react';
import { useApp } from '../AppContext';
import { Locality } from '../types';
import { Input } from '../components/FormField';

export const LocalidadesView: React.FC = () => {
  const { localities, addLocality, updateLocality, deleteLocality } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingLocality, setEditingLocality] = useState<Locality | null>(null);
  const [localityToDelete, setLocalityToDelete] = useState<Locality | null>(null);
  const [formData, setFormData] = useState({ codigo: '', nome: '' });
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredLocalities = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return localities;
    return localities.filter(l => 
      l.nome.toLowerCase().includes(term) || 
      l.codigo.toLowerCase().includes(term)
    );
  }, [localities, searchTerm]);

  const handleOpenAdd = () => {
    setEditingLocality(null);
    setFormData({ codigo: '', nome: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (loc: Locality) => {
    setEditingLocality(loc);
    setFormData({ codigo: loc.codigo, nome: loc.nome });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.codigo || !formData.nome) return alert("Código e Nome são obrigatórios.");
    
    if (editingLocality) {
      updateLocality(editingLocality.id, { 
        ...formData, 
        id: editingLocality.id, 
        tenant_id: editingLocality.tenant_id 
      });
    } else {
      addLocality({ ...formData, id: '', tenant_id: '' });
    }
    
    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!localityToDelete) return;
    setIsDeleting(true);
    try {
      await deleteLocality(localityToDelete.id);
      setIsDeleteModalOpen(false);
      setLocalityToDelete(null);
    } catch (e) {
      alert("Erro ao excluir registro.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-xl shadow-blue-600/20">
            <MapPin size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Localidades</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Gestão de comunidades, distritos e bairros</p>
          </div>
        </div>

        <button onClick={handleOpenAdd} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:-translate-y-1 transition-all shadow-xl shadow-blue-600/20 w-full md:w-auto">
          <Plus size={18} /> Nova Localidade
        </button>
      </header>

      {/* SEARCH BAR */}
      <div className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Pesquise por Nome ou Código"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] py-5 pl-16 pr-8 text-xs font-black uppercase tracking-widest outline-none focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600 text-slate-900 dark:text-white transition-all shadow-sm"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"><X size={18}/></button>
        )}
      </div>

      {/* LISTAGEM EM TABELA */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
        <div className="px-8 py-5 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/20">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
            <ListIcon size={14} /> Lista de Localidades
          </h3>
          <span className="text-[9px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full uppercase">{filteredLocalities.length} registros</span>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-widest">Código</th>
              <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-widest">Nome da Localidade</th>
              <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLocalities.map(loc => (
              <tr key={loc.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group">
                <td className="px-8 py-5 w-48">
                  <span className="font-mono text-xs text-blue-600 font-bold bg-blue-50 dark:bg-blue-900/40 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/50">{loc.codigo}</span>
                </td>
                <td className="px-8 py-5">
                   <p className="font-black text-xs uppercase text-slate-800 dark:text-slate-200">{loc.nome}</p>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleOpenEdit(loc)} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-900"><Edit3 size={16}/></button>
                    <button onClick={() => { setLocalityToDelete(loc); setIsDeleteModalOpen(true); }} className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredLocalities.length === 0 && (
              <tr>
                <td colSpan={3} className="px-8 py-20 text-center">
                   <MapPin size={40} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nenhuma localidade encontrada</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL ADICIONAR/EDITAR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[48px] shadow-2xl relative z-10 overflow-hidden border border-white/10">
            <header className="p-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                  {editingLocality ? 'Editar Localidade' : 'Nova Localidade'}
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Informe os dados da região geográfica</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X size={24}/></button>
            </header>
            
            <div className="p-10 space-y-6">
              <Input 
                label="Código da Localidade" 
                name="codigo" 
                value={formData.codigo} 
                onChange={e => setFormData({...formData, codigo: e.target.value})} 
                placeholder="Ex: LOC-01" 
              />
              <Input 
                label="Nome da Localidade" 
                name="nome" 
                value={formData.nome} 
                onChange={e => setFormData({...formData, nome: e.target.value})} 
                placeholder="Ex: Comunidade São Pedro" 
              />
            </div>

            <footer className="p-10 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-[10px] font-black uppercase text-slate-400">Descartar</button>
              <button onClick={handleSave} className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:-translate-y-1 transition-all shadow-xl shadow-blue-600/20">
                <Save size={18}/> Salvar Localidade
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => !isDeleting && setIsDeleteModalOpen(false)} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden border border-red-100 dark:border-red-900/30">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Excluir Localidade?</h3>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
                Você está prestes a remover <span className="text-red-600 font-black">"{localityToDelete?.nome}"</span>. Esta ação removerá o registro localmente e no banco de dados sincronizado.
              </p>
            </div>
            
            <footer className="p-8 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                disabled={isDeleting}
                className="px-6 py-4 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
              >
                Manter Registro
              </button>
              <button 
                onClick={handleConfirmDelete} 
                disabled={isDeleting}
                className="bg-red-600 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 disabled:opacity-50"
              >
                {isDeleting ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
