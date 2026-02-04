
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ClipboardList, Search, Plus, Save, X, Trash2, 
  Printer, ChevronRight, User as UserIcon,
  Filter, FileText, AlertCircle, RefreshCw,
  ChevronLeft, Layout, Ship, Calendar
} from 'lucide-react';
import { useApp } from '../AppContext';
import { RequerimentoINSS, Member } from '../types';
import { Input, Select } from '../components/FormField';
import { Section } from '../components/Section';
import { UF_OPTIONS, STATUS_OPTIONS } from '../constants';

export const RequerimentoINSSView: React.FC = () => {
  const { members, session } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'requerente' | 'embarcacao' | 'periodo'>('requerente');
  
  const [requerimentos, setRequerimentos] = useState<RequerimentoINSS[]>([]);
  const [form, setForm] = useState<Partial<RequerimentoINSS>>({});

  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [showMemberSuggestions, setShowMemberSuggestions] = useState(false);
  const memberSearchRef = useRef<HTMLDivElement>(null);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return requerimentos.filter(r => 
      r.nome.toLowerCase().includes(term) || r.codigo.toLowerCase().includes(term)
    );
  }, [requerimentos, searchTerm]);

  const memberSuggestions = useMemo(() => {
    if (!memberSearchTerm.trim()) return [];
    const term = memberSearchTerm.toLowerCase();
    return members.filter(m => 
      m.nome.toLowerCase().includes(term) || m.codigo_socio.toLowerCase().includes(term)
    ).slice(0, 5);
  }, [members, memberSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (memberSearchRef.current && !memberSearchRef.current.contains(event.target as Node)) {
        setShowMemberSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenAdd = () => {
    setForm({
      id: crypto.randomUUID(),
      data: new Date().toISOString().split('T')[0],
      uf: 'MA',
      situacao_mpa: 'ATIVO',
      nr_rgp: '',
      uf_rg: 'MA',
      ab: '',
      nr_tripulantes: '',
      cpf_proprietario: '',
      nr_publicacao: '',
      dt_publicacao: '',
      area: '',
      p1_inicio: '',
      p1_fim: '',
      p2_inicio: '',
      p2_fim: '',
      especies_proibidas: ''
    });
    setMemberSearchTerm('');
    setActiveTab('requerente');
    setIsModalOpen(true);
  };

  const selectMember = (m: Member) => {
    setForm(prev => ({
      ...prev,
      codigo: m.codigo_socio,
      nome: m.nome,
      data_nascimento: m.data_nascimento,
      nome_mae: m.nome_mae,
      cpf: m.cpf,
      rg: m.rg,
      pis: m.pis,
      nit: m.nit,
      endereco: m.endereco,
      numero: m.numero,
      bairro_complemento: m.bairro,
      municipio: m.cidade,
      uf: m.uf || 'MA',
      telefone: m.telefone,
      cep: m.cep,
      cei: m.cei,
      situacao_mpa: m.situacao_mpa || 'ATIVO',
      nr_rgp: m.embarcacao_rgp || '',
      uf_rg: m.rgp_uf || 'MA',
      // Fix: Ensured m.ab and m.numero_tripulantes are converted to strings
      ab: String(m.ab || ''),
      nr_tripulantes: String(m.numero_tripulantes || ''),
      cpf_proprietario: m.cpf_proprietario || ''
    }));
    setMemberSearchTerm(m.nome);
    setShowMemberSuggestions(false);
  };

  const handleSave = () => {
    if (!form.nome) return alert("Selecione um requerente.");
    setRequerimentos(prev => [...prev, form as RequerimentoINSS]);
    setIsModalOpen(false);
  };

  const updateField = (field: keyof RequerimentoINSS, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-32">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 dark:bg-blue-600 p-3 rounded-2xl text-white shadow-xl">
            <ClipboardList size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Requerimento ao INSS</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Gestão de Benefícios e Previdência Social</p>
          </div>
        </div>

        <button onClick={handleOpenAdd} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:-translate-y-1 transition-all shadow-xl shadow-blue-600/20">
          <Plus size={18} /> Novo Requerimento
        </button>
      </header>

      <div className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Pesquise Requerimento por Nome ou Código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] py-5 pl-16 pr-8 text-xs font-black uppercase tracking-widest outline-none focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600 text-slate-900 dark:text-white transition-all shadow-sm"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400 tracking-widest">
              <tr>
                <th className="px-8 py-6">Código</th>
                <th className="px-8 py-6">Data</th>
                <th className="px-8 py-6">Requerente</th>
                <th className="px-8 py-6">Município</th>
                <th className="px-8 py-6">CPF</th>
                <th className="px-8 py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredData.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-8 py-5 font-mono text-xs font-bold text-blue-600">{req.codigo}</td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-500">{new Date(req.data).toLocaleDateString('pt-BR')}</td>
                  <td className="px-8 py-5 text-xs font-black text-slate-800 dark:text-white uppercase">{req.nome}</td>
                  <td className="px-8 py-5 text-xs text-slate-500 uppercase">{req.municipio} - {req.uf}</td>
                  <td className="px-8 py-5 font-mono text-xs text-slate-500">{req.cpf}</td>
                  <td className="px-8 py-5 text-right flex justify-end gap-2">
                    <button className="p-2 text-slate-400 hover:text-blue-600"><Printer size={16}/></button>
                    <button className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-[10px] font-black uppercase text-slate-300 tracking-widest">Nenhum requerimento encontrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-[48px] shadow-2xl relative z-10 overflow-hidden border border-white/10 flex flex-col max-h-[90vh]">
            <header className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="bg-blue-600 p-4 rounded-3xl text-white shadow-xl">
                  <ClipboardList size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Requerimento do INSS</h3>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Código:</span>
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{form.codigo || '------'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Data:</span>
                      <span className="text-[10px] font-black text-slate-600">{form.data}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X size={24}/></button>
            </header>

            <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1.5 gap-1 border-b border-slate-100 dark:border-slate-800">
              <button onClick={() => setActiveTab('requerente')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'requerente' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                <UserIcon size={14} /> Requerente
              </button>
              <button onClick={() => setActiveTab('embarcacao')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'embarcacao' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                <Ship size={14} /> Embarcação
              </button>
              <button onClick={() => setActiveTab('periodo')} className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'periodo' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                <Calendar size={14} /> Período e Atividade
              </button>
            </div>

            <div className="p-10 overflow-y-auto scrollbar-hide flex-1">
              {activeTab === 'requerente' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" ref={memberSearchRef}>
                     <Input label="Código" name="codigo" value={form.codigo || ''} onChange={e => updateField('codigo', e.target.value)} className="bg-amber-50 dark:bg-amber-900/10" />
                     <Input type="date" label="Data" name="data" value={form.data || ''} onChange={e => updateField('data', e.target.value)} />
                     <Input label="Insc. Sindical" name="insc_sindical" value={form.insc_sindical || ''} onChange={e => updateField('insc_sindical', e.target.value)} />
                  </div>

                  <Section title="Dados do Requerente">
                    <div className="md:col-span-3 relative">
                       <Input label="Nome Completo" name="nome" value={memberSearchTerm} onChange={e => {setMemberSearchTerm(e.target.value); setShowMemberSuggestions(true);}} placeholder="Pesquise the associado..." />
                       {showMemberSuggestions && memberSuggestions.length > 0 && (
                         <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden">
                           {memberSuggestions.map((m) => (
                             <button key={m.id} onClick={() => selectMember(m)} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-blue-50 dark:hover:bg-blue-900/10 border-b border-slate-50 dark:border-slate-800 last:border-0 text-left">
                               <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-400"><UserIcon size={16} /></div>
                               <div className="flex flex-col">
                                 <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase">{m.nome}</span>
                                 <span className="text-[8px] font-bold text-slate-400">MATRÍCULA: {m.codigo_socio}</span>
                               </div>
                             </button>
                           ))}
                         </div>
                       )}
                    </div>
                    <Input label="CEI" name="cei" value={form.cei || ''} onChange={e => updateField('cei', e.target.value)} />
                    
                    <Input type="date" label="Data de Nascimento" name="data_nascimento" value={form.data_nascimento || ''} onChange={e => updateField('data_nascimento', e.target.value)} />
                    <Input className="md:col-span-3" label="Nome da Mãe" name="nome_mae" value={form.nome_mae || ''} onChange={e => updateField('nome_mae', e.target.value)} />

                    <Input label="CPF" name="cpf" value={form.cpf || ''} onChange={e => updateField('cpf', e.target.value)} />
                    <Input label="RG" name="rg" value={form.rg || ''} onChange={e => updateField('rg', e.target.value)} />
                    <Input label="PIS" name="pis" value={form.pis || ''} onChange={e => updateField('pis', e.target.value)} />
                    <Input label="NIT" name="nit" value={form.nit || ''} onChange={e => updateField('nit', e.target.value)} />

                    <Input className="md:col-span-2" label="Endereço" name="endereco" value={form.endereco || ''} onChange={e => updateField('endereco', e.target.value)} />
                    <Input label="Nº" name="numero" value={form.numero || ''} onChange={e => updateField('numero', e.target.value)} />
                    <Input label="Bairro ou Complemento" name="bairro_complemento" value={form.bairro_complemento || ''} onChange={e => updateField('bairro_complemento', e.target.value)} />

                    <Input label="Município" name="municipio" value={form.municipio || ''} onChange={e => updateField('municipio', e.target.value)} />
                    <Select label="UF" name="uf" options={UF_OPTIONS} value={form.uf || ''} onChange={e => updateField('uf', e.target.value)} />
                    <Input label="Telefone" name="telefone" value={form.telefone || ''} onChange={e => updateField('telefone', e.target.value)} />

                    <Input label="CEP" name="cep" value={form.cep || ''} onChange={e => updateField('cep', e.target.value)} />
                    <Select label="Situação no MPA" name="situacao_mpa" options={STATUS_OPTIONS} value={form.situacao_mpa || ''} onChange={e => updateField('situacao_mpa', e.target.value)} />
                  </Section>
                </div>
              )}

              {activeTab === 'embarcacao' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <Section title="Embarcação [Caso embarcação, apresentar documentação do barco]">
                    <Input label="Nº do RGP" name="nr_rgp" value={form.nr_rgp || ''} onChange={e => updateField('nr_rgp', e.target.value)} />
                    <Select label="UF RG" name="uf_rg" options={UF_OPTIONS} value={form.uf_rg || ''} onChange={e => updateField('uf_rg', e.target.value)} />
                    <Input label="AB" name="ab" value={form.ab || ''} onChange={e => updateField('ab', e.target.value)} />
                    <Input label="Nº de tripulantes" name="nr_tripulantes" value={form.nr_tripulantes || ''} onChange={e => updateField('nr_tripulantes', e.target.value)} />
                    <Input className="md:col-span-2" label="CPF de Proprietário" name="cpf_proprietario" value={form.cpf_proprietario || ''} onChange={e => updateField('cpf_proprietario', e.target.value)} />
                  </Section>
                </div>
              )}

              {activeTab === 'periodo' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <Section title="Periodo de Defeso e atividade do Requerente">
                    <Input label="Nº da Publicação" name="nr_publicacao" value={form.nr_publicacao || ''} onChange={e => updateField('nr_publicacao', e.target.value)} />
                    <Input type="date" label="Data da Publicação" name="dt_publicacao" value={form.dt_publicacao || ''} onChange={e => updateField('dt_publicacao', e.target.value)} />
                    <Input className="md:col-span-2" label="Área" name="area" value={form.area || ''} onChange={e => updateField('area', e.target.value)} placeholder="TURIAÇU, PINDARE E OUTROS" />
                    
                    <Input type="date" label="1º Período - Início" name="p1_inicio" value={form.p1_inicio || ''} onChange={e => updateField('p1_inicio', e.target.value)} />
                    <Input type="date" label="1º Período - Fim" name="p1_fim" value={form.p1_fim || ''} onChange={e => updateField('p1_fim', e.target.value)} />
                    <Input type="date" label="2º Período - Início" name="p2_inicio" value={form.p2_inicio || ''} onChange={e => updateField('p2_inicio', e.target.value)} />
                    <Input type="date" label="2º Período - Fim" name="p2_fim" value={form.p2_fim || ''} onChange={e => updateField('p2_fim', e.target.value)} />

                    <div className="md:col-span-4 mt-4">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Espécie capturadas proibidas</label>
                      <textarea 
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all resize-none"
                        rows={3}
                        value={form.especies_proibidas || ''}
                        onChange={e => updateField('especies_proibidas', e.target.value)}
                        placeholder="TRAÍRA, ACAUÃ, BAGRE, PIABA E OUTROS NATIVOS DO RIO"
                      />
                    </div>
                  </Section>
                </div>
              )}
            </div>

            <footer className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-wrap justify-between gap-4">
              <div className="flex gap-2">
                <button onClick={handleOpenAdd} className="px-6 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center gap-2">
                  <Plus size={16} /> Novo
                </button>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">Fechar</button>
                <button className="px-8 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Printer size={16} /> Imprimir
                </button>
                <button onClick={handleSave} className="bg-emerald-600 text-white px-12 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:-translate-y-1 transition-all shadow-xl shadow-emerald-600/20">
                  <Save size={18}/> Salvar Requerimento
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
