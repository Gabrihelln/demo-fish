
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  FileSignature, Search, Plus, Save, X, Trash2, 
  Printer, User as UserIcon, Users, Ship, 
  Calendar, CheckCircle2, ChevronRight, AlertCircle,
  Hash, Layout, Table as TableIcon, Info, MessageSquare
} from 'lucide-react';
import { useApp } from '../AppContext';
import { AutoDeclaracao, Member } from '../types';
import { Input, Select } from '../components/FormField';
import { Section } from '../components/Section';
import { UF_OPTIONS, YES_NO_OPTIONS, MARITAL_STATUS_OPTIONS } from '../constants';

type TabId = 'segurado' | 'familiar' | 'item3' | 'item34' | 'item41';

export const AutoDeclaracaoView: React.FC = () => {
  const { members, session } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('segurado');
  
  const [declaracoes, setDeclaracoes] = useState<AutoDeclaracao[]>([]);
  const [form, setForm] = useState<Partial<AutoDeclaracao>>({});

  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [showMemberSuggestions, setShowMemberSuggestions] = useState(false);
  const memberSearchRef = useRef<HTMLDivElement>(null);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return declaracoes.filter(d => 
      d.nome_segurado.toLowerCase().includes(term) || d.id.toLowerCase().includes(term)
    );
  }, [declaracoes, searchTerm]);

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
      id: (declaracoes.length + 1).toString(),
      data_auto_declaracao: new Date().toISOString().split('T')[0],
      atividades_pesca: [{id: '1', dt_inicio: '', dt_fim: '', local: '', situacao: ''}],
      grupo_familiar_membros: Array.from({length: 4}).map((_, i) => ({id: i.toString(), nome: '', dt_nascimento: '', cpf: '', estado_civil: '', parentesco: ''})),
      condicoes_embarcacao: [{id: '1', dt_inicio: '', dt_fim: '', condicao: '', ab: ''}],
      arrendamentos: [{id: '1', dt_inicio: '', dt_fim: ''}],
      titulares_embarcacao: [{id: '1', nome: '', cpf: '', dt_inicio: '', dt_fim: ''}],
      atividades_pesqueiras_detalhe: [{id: '1', atividade: '', subsistencia_venda: '', valor_anual: '0,00'}],
      processos_industrializacao: [{id: '1', dt_inicio: '', dt_fim: ''}],
      lista_empregados: [{id: '1', nome: '', cpf: '', dt_inicio: '', dt_fim: ''}],
      outras_atividades: [{id: '1', atividade: '', local: '', dt_inicio: '', dt_fim: ''}],
      lista_outras_rendas: [{id: '1', atividade: '', dt_inicio: '', dt_fim: '', renda: '0,00', outras_infos: ''}],
      ipi_recolhimento: 'NÃO',
      possui_empregados: 'NÃO',
      outras_rendas_atividades: 'NÃO',
      participa_cooperativa: 'NÃO',
      cooperativa_agropecuaria: 'AGROPECUÁRIA'
    });
    setMemberSearchTerm('');
    setActiveTab('segurado');
    setIsModalOpen(true);
  };

  const selectMember = (m: Member) => {
    setForm(prev => ({
      ...prev,
      insc_sindical: m.codigo_socio,
      nome_segurado: m.nome,
      apelido: m.apelido,
      data_nascimento: m.data_nascimento,
      local_nascimento: m.naturalidade,
      logradouro: m.endereco,
      numero: m.numero,
      uf: m.uf || 'MA',
      bairro_distrito: m.bairro,
      municipio: m.cidade,
      rg: m.rg,
      data_expedicao_rg: m.data_expedicao_rg,
      local_expedicao_rg: m.orgao_expedidor_rg,
      cpf: m.cpf,
      rgp: m.embarcacao_rgp,
      cei_caepf: m.cei || m.caepf
    }));
    setMemberSearchTerm(m.nome);
    setShowMemberSuggestions(false);
  };

  const updateField = (field: keyof AutoDeclaracao, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-32">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 dark:bg-blue-600 p-3 rounded-2xl text-white shadow-xl">
            <FileSignature size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Auto Declaração</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Declaração para fins previdenciários</p>
          </div>
        </div>

        <button onClick={handleOpenAdd} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:-translate-y-1 transition-all shadow-xl shadow-blue-600/20">
          <Plus size={18} /> Nova Auto Declaração
        </button>
      </header>

      <div className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Pesquisar por Nome ou Código do Segurado..."
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
                <th className="px-8 py-6">ID</th>
                <th className="px-8 py-6">Data</th>
                <th className="px-8 py-6">Segurado</th>
                <th className="px-8 py-6">Insc. Sindical</th>
                <th className="px-8 py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredData.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-8 py-5 font-mono text-xs font-bold text-blue-600">{d.id}</td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-500">{new Date(d.data_auto_declaracao).toLocaleDateString('pt-BR')}</td>
                  <td className="px-8 py-5 text-xs font-black text-slate-800 dark:text-white uppercase">{d.nome_segurado}</td>
                  <td className="px-8 py-5 text-xs text-slate-500">{d.insc_sindical}</td>
                  <td className="px-8 py-5 text-right flex justify-end gap-2">
                    <button className="p-2 text-slate-400 hover:text-blue-600"><Printer size={16}/></button>
                    <button className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-[10px] font-black uppercase text-slate-300 tracking-widest">Nenhuma declaração encontrada</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-[48px] shadow-2xl relative z-10 overflow-hidden border border-white/10 flex flex-col max-h-[95vh]">
            <header className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="bg-blue-600 p-4 rounded-3xl text-white shadow-xl">
                  <FileSignature size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Auto Declaração do Segurado Especial</h3>
                  <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ID Auto Declaração:</span>
                      <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{form.id || '---'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Data:</span>
                      <span className="text-[10px] font-black text-slate-600">{form.data_auto_declaracao}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X size={24}/></button>
            </header>

            <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1.5 gap-1 border-b border-slate-100 dark:border-slate-800 overflow-x-auto scrollbar-hide">
              {[
                {id: 'segurado', label: 'Segurado', icon: UserIcon},
                {id: 'familiar', label: 'Grupo Familiar', icon: Users},
                {id: 'item3', label: 'Item 3 ao 3.3', icon: Ship},
                {id: 'item34', label: 'Item 3.4 ao 4', icon: TableIcon},
                {id: 'item41', label: 'Item 4.1 ao 4.2', icon: MessageSquare},
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)} 
                  className={`flex-1 min-w-[140px] flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <tab.icon size={14} /> {tab.label}
                </button>
              ))}
            </div>

            <div className="p-10 overflow-y-auto scrollbar-hide flex-1">
              {activeTab === 'segurado' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="md:col-span-3 relative mb-6" ref={memberSearchRef}>
                     <Input label="Pesquisar Sócio para Importação de Dados" name="search" value={memberSearchTerm} onChange={e => {setMemberSearchTerm(e.target.value); setShowMemberSuggestions(true);}} placeholder="Digite nome ou código do associado..." />
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

                  <Section title="1. Dados do Segurado">
                    <Input label="Insc. Sindical" name="insc_sindical" value={form.insc_sindical || ''} onChange={e => updateField('insc_sindical', e.target.value)} />
                    <Input className="md:col-span-2" label="Segurado" name="nome_segurado" value={form.nome_segurado || ''} onChange={e => updateField('nome_segurado', e.target.value)} />
                    <Input label="Apelido" name="apelido" value={form.apelido || ''} onChange={e => updateField('apelido', e.target.value)} />
                    
                    <Input type="date" label="Dt. Nasc." name="data_nascimento" value={form.data_nascimento || ''} onChange={e => updateField('data_nascimento', e.target.value)} />
                    <Input className="md:col-span-3" label="Local de Nascimento" name="local_nascimento" value={form.local_nascimento || ''} onChange={e => updateField('local_nascimento', e.target.value)} />

                    <Input className="md:col-span-2" label="Logradouro" name="logradouro" value={form.logradouro || ''} onChange={e => updateField('logradouro', e.target.value)} />
                    <Input label="Número" name="numero" value={form.numero || ''} onChange={e => updateField('numero', e.target.value)} />
                    <Select label="UF" name="uf" options={UF_OPTIONS} value={form.uf || 'MA'} onChange={e => updateField('uf', e.target.value)} />

                    <Input className="md:col-span-2" label="Bairro/Distrito" name="bairro_distrito" value={form.bairro_distrito || ''} onChange={e => updateField('bairro_distrito', e.target.value)} />
                    <Input className="md:col-span-2" label="Município" name="municipio" value={form.municipio || ''} onChange={e => updateField('municipio', e.target.value)} />

                    <Input label="RG" name="rg" value={form.rg || ''} onChange={e => updateField('rg', e.target.value)} />
                    <Input type="date" label="Dt. Expedição" name="data_expedicao_rg" value={form.data_expedicao_rg || ''} onChange={e => updateField('data_expedicao_rg', e.target.value)} />
                    <Input label="Local da Expedição do RG" name="local_expedicao_rg" value={form.local_expedicao_rg || ''} onChange={e => updateField('local_expedicao_rg', e.target.value)} />
                    <Input label="CPF" name="cpf" value={form.cpf || ''} onChange={e => updateField('cpf', e.target.value)} />

                    <Input className="md:col-span-2" label="RGP" name="rgp" value={form.rgp || ''} onChange={e => updateField('rgp', e.target.value)} />
                    <Input className="md:col-span-2" label="MATRÍCULA CEI/CAEPF" name="cei_caepf" value={form.cei_caepf || ''} onChange={e => updateField('cei_caepf', e.target.value)} />
                  </Section>

                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] overflow-hidden">
                    <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">2. Período(s) de atividade de pesca (dia/mês/ano)</h4>
                      <button onClick={() => updateField('atividades_pesca', [...(form.atividades_pesca || []), {id: Date.now().toString(), dt_inicio: '', dt_fim: '', local: '', situacao: ''}])} className="text-blue-600 text-[10px] font-black uppercase">+ Adicionar Linha</button>
                    </div>
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                        <tr>
                          <th className="px-6 py-3 text-left">Data Inicial</th>
                          <th className="px-6 py-3 text-left">Data Final</th>
                          <th className="px-6 py-3 text-left">Local onde exerce a atividade</th>
                          <th className="px-6 py-3 text-left">Situação</th>
                          <th className="px-6 py-3 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {(form.atividades_pesca || []).map((atv, i) => (
                          <tr key={atv.id}>
                            <td className="px-4 py-2"><input type="date" className="bg-transparent w-full outline-none" value={atv.dt_inicio} onChange={e => {
                              const list = [...form.atividades_pesca!];
                              list[i].dt_inicio = e.target.value;
                              updateField('atividades_pesca', list);
                            }} /></td>
                            <td className="px-4 py-2"><input type="date" className="bg-transparent w-full outline-none" value={atv.dt_fim} onChange={e => {
                              const list = [...form.atividades_pesca!];
                              list[i].dt_fim = e.target.value;
                              updateField('atividades_pesca', list);
                            }} /></td>
                            <td className="px-4 py-2"><input className="bg-transparent w-full outline-none" value={atv.local} onChange={e => {
                              const list = [...form.atividades_pesca!];
                              list[i].local = e.target.value;
                              updateField('atividades_pesca', list);
                            }} placeholder="Ex: Rio, Pov. Vaca (Rural)" /></td>
                            <td className="px-4 py-2"><input className="bg-transparent w-full outline-none" value={atv.situacao} onChange={e => {
                              const list = [...form.atividades_pesca!];
                              list[i].situacao = e.target.value;
                              updateField('atividades_pesca', list);
                            }} placeholder="Regime de economia familiar" /></td>
                            <td className="px-4 py-2 text-right"><button onClick={() => updateField('atividades_pesca', form.atividades_pesca!.filter(x => x.id !== atv.id))} className="text-red-400"><Trash2 size={14}/></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'familiar' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                   <Section title="2.1. No caso de exercício de atividade em regime de economia familiar, informe sua condição no grupo">
                      <Select label="Condição no Grupo" name="grupo_familiar_condicao" options={['Titular', 'Cônjuge/Companheiro', 'Filho(a)']} value={form.grupo_familiar_condicao || 'Titular'} onChange={e => updateField('grupo_familiar_condicao', e.target.value)} />
                   </Section>

                   <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] overflow-hidden">
                    <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                      <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest">2.2. Grupo Familiar, se exerceu ou exerce a atividade em regime de economia familiar, informe os componentes do grupo familiar</h4>
                    </div>
                    <div className="p-8 space-y-8">
                       {(form.grupo_familiar_membros || []).map((m, i) => (
                         <div key={m.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 border-b border-slate-50 dark:border-slate-800 pb-6 last:border-0">
                            <Input className="md:col-span-2" label={`${i+2}º Membro - Nome`} name="nome" value={m.nome} onChange={e => {
                              const list = [...form.grupo_familiar_membros!];
                              list[i].nome = e.target.value;
                              updateField('grupo_familiar_membros', list);
                            }} />
                            <Input type="date" label="Dt. Nasc." name="dt_nascimento" value={m.dt_nascimento} onChange={e => {
                              const list = [...form.grupo_familiar_membros!];
                              list[i].dt_nascimento = e.target.value;
                              updateField('grupo_familiar_membros', list);
                            }} />
                            <Input label="Nº CPF" name="cpf" value={m.cpf} onChange={e => {
                              const list = [...form.grupo_familiar_membros!];
                              list[i].cpf = e.target.value;
                              updateField('grupo_familiar_membros', list);
                            }} />
                            <Select label="Estado Civil" name="estado_civil" options={MARITAL_STATUS_OPTIONS} value={m.estado_civil} onChange={e => {
                              const list = [...form.grupo_familiar_membros!];
                              list[i].estado_civil = e.target.value;
                              updateField('grupo_familiar_membros', list);
                            }} />
                            <Input label="Parentesco" name="parentesco" value={m.parentesco} onChange={e => {
                              const list = [...form.grupo_familiar_membros!];
                              list[i].parentesco = e.target.value;
                              updateField('grupo_familiar_membros', list);
                            }} placeholder="FILHO(A), ESPOSA, etc" />
                         </div>
                       ))}
                    </div>
                   </div>
                </div>
              )}

              {activeTab === 'item3' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <Section title="3. Informe a condição de pescador em relação à embarcação onde exerce/exerceu a atividade">
                    <div className="col-span-full bg-slate-50 dark:bg-slate-800/20 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                      <table className="w-full text-xs">
                        <thead className="bg-white dark:bg-slate-900 text-[9px] font-black uppercase text-slate-400">
                          <tr>
                            <th className="px-6 py-3 text-left">Data Inicial</th>
                            <th className="px-6 py-3 text-left">Data Final</th>
                            <th className="px-6 py-3 text-left">Condição em relação à embarcação</th>
                            <th className="px-6 py-3 text-left">Arqueação Bruta (AB)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white dark:divide-slate-900">
                          {(form.condicoes_embarcacao || []).map((c, i) => (
                            <tr key={c.id}>
                              <td className="px-4 py-2"><input type="date" className="bg-transparent w-full" value={c.dt_inicio} onChange={e => {
                                const list = [...form.condicoes_embarcacao!];
                                list[i].dt_inicio = e.target.value;
                                updateField('condicoes_embarcacao', list);
                              }} /></td>
                              <td className="px-4 py-2"><input type="date" className="bg-transparent w-full" value={c.dt_fim} onChange={e => {
                                const list = [...form.condicoes_embarcacao!];
                                list[i].dt_fim = e.target.value;
                                updateField('condicoes_embarcacao', list);
                              }} /></td>
                              <td className="px-4 py-2"><input className="bg-transparent w-full" value={c.condicao} onChange={e => {
                                const list = [...form.condicoes_embarcacao!];
                                list[i].condicao = e.target.value;
                                updateField('condicoes_embarcacao', list);
                              }} placeholder="Ex: Pescador Artesanal sem embarcação" /></td>
                              <td className="px-4 py-2"><input className="bg-transparent w-full" value={c.ab} onChange={e => {
                                const list = [...form.condicoes_embarcacao!];
                                list[i].ab = e.target.value;
                                updateField('condicoes_embarcacao', list);
                              }} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Section>

                  <Section title="3.1. Se o segurado for proprietário e houve arrendamento da embarcação, informar">
                    <div className="col-span-full bg-slate-50 dark:bg-slate-800/20 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                      <table className="w-full text-xs">
                        <thead className="bg-white dark:bg-slate-900 text-[9px] font-black uppercase text-slate-400">
                          <tr><th className="px-6 py-3 text-left">Data Inicial</th><th className="px-6 py-3 text-left">Data Final</th></tr>
                        </thead>
                        <tbody>
                          {(form.arrendamentos || []).map((a, i) => (
                             <tr key={a.id}>
                               <td className="px-4 py-2"><input type="date" className="bg-transparent w-full" value={a.dt_inicio} onChange={e => {
                                 const list = [...form.arrendamentos!];
                                 list[i].dt_inicio = e.target.value;
                                 updateField('arrendamentos', list);
                               }} /></td>
                               <td className="px-4 py-2"><input type="date" className="bg-transparent w-full" value={a.dt_fim} onChange={e => {
                                 const list = [...form.arrendamentos!];
                                 list[i].dt_fim = e.target.value;
                                 updateField('arrendamentos', list);
                               }} /></td>
                             </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Section>

                  <Section title="3.2. Qual o nome e CPF do(s) titular(es) da embarcação">
                    <div className="col-span-full bg-slate-50 dark:bg-slate-800/20 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                      <table className="w-full text-xs">
                        <thead className="bg-white dark:bg-slate-900 text-[9px] font-black uppercase text-slate-400">
                          <tr>
                            <th className="px-6 py-3 text-left">NOME</th>
                            <th className="px-6 py-3 text-left">CPF</th>
                            <th className="px-6 py-3 text-left">Data Inicial</th>
                            <th className="px-6 py-3 text-left">Data Final</th>
                          </tr>
                        </thead>
                        <tbody>
                           {(form.titulares_embarcacao || []).map((t, i) => (
                             <tr key={t.id}>
                               <td className="px-4 py-2"><input className="bg-transparent w-full" value={t.nome} onChange={e => {
                                 const list = [...form.titulares_embarcacao!];
                                 list[i].nome = e.target.value;
                                 updateField('titulares_embarcacao', list);
                               }} /></td>
                               <td className="px-4 py-2"><input className="bg-transparent w-full" value={t.cpf} onChange={e => {
                                 const list = [...form.titulares_embarcacao!];
                                 list[i].cpf = e.target.value;
                                 updateField('titulares_embarcacao', list);
                               }} /></td>
                               <td className="px-4 py-2"><input type="date" className="bg-transparent w-full" value={t.dt_inicio} onChange={e => {
                                 const list = [...form.titulares_embarcacao!];
                                 list[i].dt_inicio = e.target.value;
                                 updateField('titulares_embarcacao', list);
                               }} /></td>
                               <td className="px-4 py-2"><input type="date" className="bg-transparent w-full" value={t.dt_fim} onChange={e => {
                                 const list = [...form.titulares_embarcacao!];
                                 list[i].dt_fim = e.target.value;
                                 updateField('titulares_embarcacao', list);
                               }} /></td>
                             </tr>
                           ))}
                        </tbody>
                      </table>
                    </div>
                  </Section>

                  <Section title="3.3. Informe a atividade pesqueira (pescador de tambaqui, pescador de ostra etc.)">
                    <div className="col-span-full bg-slate-50 dark:bg-slate-800/20 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                      <table className="w-full text-xs">
                        <thead className="bg-white dark:bg-slate-900 text-[9px] font-black uppercase text-slate-400">
                          <tr>
                            <th className="px-6 py-3 text-left">ATIVIDADE</th>
                            <th className="px-6 py-3 text-left">SUBSISTÊNCIA/VENDA</th>
                            <th className="px-6 py-3 text-right">VALOR ANUAL (em caso de venda)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(form.atividades_pesqueiras_detalhe || []).map((p, i) => (
                            <tr key={p.id}>
                              <td className="px-4 py-2"><input className="bg-transparent w-full" value={p.atividade} onChange={e => {
                                 const list = [...form.atividades_pesqueiras_detalhe!];
                                 list[i].atividade = e.target.value;
                                 updateField('atividades_pesqueiras_detalhe', list);
                               }} placeholder="Ex: Pesca Artesanal" /></td>
                              <td className="px-4 py-2"><input className="bg-transparent w-full" value={p.subsistencia_venda} onChange={e => {
                                 const list = [...form.atividades_pesqueiras_detalhe!];
                                 list[i].subsistencia_venda = e.target.value;
                                 updateField('atividades_pesqueiras_detalhe', list);
                               }} placeholder="VENDA E SUBSISTÊNCIA" /></td>
                              <td className="px-4 py-2 text-right"><input className="bg-transparent w-full text-right" value={p.valor_anual} onChange={e => {
                                 const list = [...form.atividades_pesqueiras_detalhe!];
                                 list[i].valor_anual = e.target.value;
                                 updateField('atividades_pesqueiras_detalhe', list);
                               }} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Section>
                </div>
              )}

              {activeTab === 'item34' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                   <Section title="3.4. Informe se houve recolhimento de Imposto Sobre Produtos Industrializados - IPI sobre a venda da produção">
                      <div className="col-span-full flex items-center gap-6 mb-4">
                        <Select label="Houve Recolhimento de IPI?" name="ipi_recolhimento" options={YES_NO_OPTIONS} value={form.ipi_recolhimento || 'NÃO'} onChange={e => updateField('ipi_recolhimento', e.target.value)} />
                      </div>
                      <div className="col-span-full bg-slate-50 dark:bg-slate-800/20 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                        <div className="px-6 py-2 bg-white dark:bg-slate-900 text-[9px] font-black uppercase text-slate-400">LISTA DE PROCESSO DE BENEFICIAMENTO/INDUSTRIALIZAÇÃO ARTESANAL</div>
                        <table className="w-full text-xs">
                           <thead className="bg-slate-50 dark:bg-slate-800/50 text-[9px] font-black uppercase text-slate-400">
                             <tr><th className="px-6 py-3 text-left">Data Inicial</th><th className="px-6 py-3 text-left">Data Final</th></tr>
                           </thead>
                           <tbody>
                             {(form.processos_industrializacao || []).map((p, i) => (
                               <tr key={p.id}>
                                  <td className="px-4 py-2"><input type="date" className="bg-transparent w-full" value={p.dt_inicio} onChange={e => {
                                    const list = [...form.processos_industrializacao!];
                                    list[i].dt_inicio = e.target.value;
                                    updateField('processos_industrializacao', list);
                                  }} /></td>
                                  <td className="px-4 py-2"><input type="date" className="bg-transparent w-full" value={p.dt_fim} onChange={e => {
                                    const list = [...form.processos_industrializacao!];
                                    list[i].dt_fim = e.target.value;
                                    updateField('processos_industrializacao', list);
                                  }} /></td>
                               </tr>
                             ))}
                           </tbody>
                        </table>
                      </div>
                   </Section>

                   <Section title="3.5. Possui empregado(s) ou prestador(es) de serviço">
                      <div className="col-span-full flex items-center gap-6 mb-4">
                        <Select label="Possui Empregados?" name="possui_empregados" options={YES_NO_OPTIONS} value={form.possui_empregados || 'NÃO'} onChange={e => updateField('possui_empregados', e.target.value)} />
                      </div>
                      <div className="col-span-full bg-slate-50 dark:bg-slate-800/20 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                        <div className="px-6 py-2 bg-white dark:bg-slate-900 text-[9px] font-black uppercase text-slate-400">LISTA DE EMPREGADO(S) OU PRESTADOR(ES) DE SERVIÇO</div>
                        <table className="w-full text-xs">
                           <thead className="bg-slate-50 dark:bg-slate-800/50 text-[9px] font-black uppercase text-slate-400">
                             <tr><th className="px-6 py-3 text-left">NOME</th><th className="px-6 py-3 text-left">CPF</th><th className="px-6 py-3 text-left">Data Inicial</th><th className="px-6 py-3 text-left">Data Final</th></tr>
                           </thead>
                           <tbody>
                             {(form.lista_empregados || []).map((p, i) => (
                               <tr key={p.id}>
                                  <td className="px-4 py-2"><input className="bg-transparent w-full" value={p.nome} onChange={e => {
                                    const list = [...form.lista_empregados!];
                                    list[i].nome = e.target.value;
                                    updateField('lista_empregados', list);
                                  }} /></td>
                                  <td className="px-4 py-2"><input className="bg-transparent w-full" value={p.cpf} onChange={e => {
                                    const list = [...form.lista_empregados!];
                                    list[i].cpf = e.target.value;
                                    updateField('lista_empregados', list);
                                  }} /></td>
                                  <td className="px-4 py-2"><input type="date" className="bg-transparent w-full" value={p.dt_inicio} onChange={e => {
                                    const list = [...form.lista_empregados!];
                                    list[i].dt_inicio = e.target.value;
                                    updateField('lista_empregados', list);
                                  }} /></td>
                                  <td className="px-4 py-2"><input type="date" className="bg-transparent w-full" value={p.dt_fim} onChange={e => {
                                    const list = [...form.lista_empregados!];
                                    list[i].dt_fim = e.target.value;
                                    updateField('lista_empregados', list);
                                  }} /></td>
                               </tr>
                             ))}
                           </tbody>
                        </table>
                      </div>
                   </Section>

                   <Section title="4. Informe se exerce ou exerceu outra atividade e/ou recebe/recebeu outra renda">
                      <div className="col-span-full bg-slate-50 dark:bg-slate-800/20 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                        <div className="px-6 py-2 bg-white dark:bg-slate-900 text-[9px] font-black uppercase text-slate-400">LISTA DE OUTRAS ATIVIDADES EXERCIDAS</div>
                        <table className="w-full text-xs">
                           <thead className="bg-slate-50 dark:bg-slate-800/50 text-[9px] font-black uppercase text-slate-400">
                             <tr><th className="px-6 py-3 text-left">ATIVIDADE*</th><th className="px-6 py-3 text-left">LOCAL</th><th className="px-6 py-3 text-left">Data Inicial</th><th className="px-6 py-3 text-left">Data Final</th></tr>
                           </thead>
                           <tbody>
                             {(form.outras_atividades || []).map((p, i) => (
                               <tr key={p.id}>
                                  <td className="px-4 py-2"><input className="bg-transparent w-full" value={p.atividade} onChange={e => {
                                    const list = [...form.outras_atividades!];
                                    list[i].atividade = e.target.value;
                                    updateField('outras_atividades', list);
                                  }} placeholder="NENHUMA" /></td>
                                  <td className="px-4 py-2"><input className="bg-transparent w-full" value={p.local} onChange={e => {
                                    const list = [...form.outras_atividades!];
                                    list[i].local = e.target.value;
                                    updateField('outras_atividades', list);
                                  }} /></td>
                                  <td className="px-4 py-2"><input type="date" className="bg-transparent w-full" value={p.dt_inicio} onChange={e => {
                                    const list = [...form.outras_atividades!];
                                    list[i].dt_inicio = e.target.value;
                                    updateField('outras_atividades', list);
                                  }} /></td>
                                  <td className="px-4 py-2"><input type="date" className="bg-transparent w-full" value={p.dt_fim} onChange={e => {
                                    const list = [...form.outras_atividades!];
                                    list[i].dt_fim = e.target.value;
                                    updateField('outras_atividades', list);
                                  }} /></td>
                               </tr>
                             ))}
                           </tbody>
                        </table>
                      </div>
                      <p className="col-span-full text-[9px] font-bold text-slate-400 uppercase mt-4">* Pedreiro, carpinteiro, pintor, entre outros.</p>
                   </Section>
                </div>
              )}

              {activeTab === 'item41' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <Section title="4.1. Informe se recebe/recebeu outra renda nas seguintes atividades: atividade turística, artística, artesanal, dirigentesindical ou de cooperativa, mandato de vereador">
                     <div className="col-span-full flex items-center gap-6 mb-4">
                        <Select label="Recebe Outra Renda?" name="outras_rendas_atividades" options={YES_NO_OPTIONS} value={form.outras_rendas_atividades || 'NÃO'} onChange={e => updateField('outras_rendas_atividades', e.target.value)} />
                     </div>
                     <div className="col-span-full bg-slate-50 dark:bg-slate-800/20 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                        <div className="px-6 py-2 bg-white dark:bg-slate-900 text-[9px] font-black uppercase text-slate-400">LISTA DE OUTRAS RENDAS DE ATIVIDADE</div>
                        <table className="w-full text-xs">
                           <thead className="bg-slate-50 dark:bg-slate-800/50 text-[9px] font-black uppercase text-slate-400">
                             <tr><th className="px-6 py-3 text-left">ATIVIDADE</th><th className="px-6 py-3 text-left">Data Inicial</th><th className="px-6 py-3 text-left">Data Final</th><th className="px-6 py-3 text-right">RENDA (R$)</th><th className="px-6 py-3 text-left">OUTRAS INFORMAÇÕES*</th></tr>
                           </thead>
                           <tbody>
                             {(form.lista_outras_rendas || []).map((p, i) => (
                               <tr key={p.id}>
                                  <td className="px-4 py-2"><input className="bg-transparent w-full" value={p.atividade} onChange={e => {
                                    const list = [...form.lista_outras_rendas!];
                                    list[i].atividade = e.target.value;
                                    updateField('lista_outras_rendas', list);
                                  }} placeholder="Nunca Recebeu" /></td>
                                  <td className="px-4 py-2"><input type="date" className="bg-transparent w-full" value={p.dt_inicio} onChange={e => {
                                    const list = [...form.lista_outras_rendas!];
                                    list[i].dt_inicio = e.target.value;
                                    updateField('lista_outras_rendas', list);
                                  }} /></td>
                                  <td className="px-4 py-2"><input type="date" className="bg-transparent w-full" value={p.dt_fim} onChange={e => {
                                    const list = [...form.lista_outras_rendas!];
                                    list[i].dt_fim = e.target.value;
                                    updateField('lista_outras_rendas', list);
                                  }} /></td>
                                  <td className="px-4 py-2 text-right"><input className="bg-transparent w-full text-right" value={p.renda} onChange={e => {
                                    const list = [...form.lista_outras_rendas!];
                                    list[i].renda = e.target.value;
                                    updateField('lista_outras_rendas', list);
                                  }} /></td>
                                  <td className="px-4 py-2"><input className="bg-transparent w-full" value={p.outras_infos} onChange={e => {
                                    const list = [...form.lista_outras_rendas!];
                                    list[i].outras_infos = e.target.value;
                                    updateField('lista_outras_rendas', list);
                                  }} /></td>
                               </tr>
                             ))}
                           </tbody>
                        </table>
                     </div>
                     <div className="col-span-full space-y-1 mt-4">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">* Para atividade artesanal, informar a origem da matéria-prima.</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">  Para mandato de vereador, informar o Município.</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">  Para exploração de atividade turística na propriedade, indicar os dias de hospedagem por exercício.</p>
                     </div>
                  </Section>

                  <Section title="4.2. Informe se participa de cooperativa">
                     <div className="col-span-full flex items-center gap-6 mb-4">
                        <Select label="Participa de Cooperativa?" name="participa_cooperativa" options={YES_NO_OPTIONS} value={form.participa_cooperativa || 'NÃO'} onChange={e => updateField('participa_cooperativa', e.target.value)} />
                     </div>
                     <Input className="md:col-span-2" label="Entidade" name="cooperativa_entidade" value={form.cooperativa_entidade || 'SINPECAMPER'} onChange={e => updateField('cooperativa_entidade', e.target.value)} />
                     <Input label="CNPJ" name="cooperativa_cnpj" value={form.cooperativa_cnpj || '07.172.301/0001-35'} onChange={e => updateField('cooperativa_cnpj', e.target.value)} />
                     <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">INFORMAR SE É AGROPECUÁRIA OU DE CRÉDITO RURAL</label>
                        <Select label="" name="cooperativa_agropecuaria" options={['AGROPECUÁRIA', 'CRÉDITO RURAL']} value={form.cooperativa_agropecuaria || 'AGROPECUÁRIA'} onChange={e => updateField('cooperativa_agropecuaria', e.target.value)} />
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
                <button onClick={() => { setDeclaracoes(prev => [...prev, form as AutoDeclaracao]); setIsModalOpen(false); }} className="bg-emerald-600 text-white px-12 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:-translate-y-1 transition-all shadow-xl shadow-emerald-600/20">
                  <Save size={18}/> Salvar Auto Declaração
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};
