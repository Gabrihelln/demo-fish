
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  CalendarDays, Search, Plus, Save, X, Trash2, 
  Printer, ChevronRight, DollarSign, User as UserIcon,
  Filter, ArrowLeftRight, FileText, AlertCircle, RefreshCw,
  ChevronLeft, Check
} from 'lucide-react';
import { useApp } from '../AppContext';
import { useNavigation } from '../NavigationContext';
import { Mensalidade, Member } from '../types';
import { Input, Select, TextArea } from '../components/FormField';

export const MensalidadesView: React.FC = () => {
  const { mensalidades, members, syncData, session } = useApp();
  const { setActiveView } = useNavigation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Mensalidade> | null>(null);
  
  // Estados para Busca de Sócio no Modal
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [showMemberSuggestions, setShowMemberSuggestions] = useState(false);
  const memberSearchRef = useRef<HTMLDivElement>(null);

  // Estados para Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // SINCRONIZAÇÃO AUTOMÁTICA AO ENTRAR NA TELA
  useEffect(() => {
    syncData();
  }, []);

  // Helper para converter qualquer formato de data para YYYY-MM-DD (compatível com input date)
  const toInputDate = (dateStr: string | undefined) => {
    if (!dateStr || dateStr === '---') return '';
    const clean = dateStr.trim().split(' ')[0];
    
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(clean)) {
      const [d, m, y] = clean.split('/');
      return `${y}-${m}-${d}`;
    }
    
    if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
      return clean.substring(0, 10);
    }
    
    return clean.substring(0, 10);
  };

  // Helper para formatar datas no padrão brasileiro DD/MM/AAAA para exibição na tabela
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr || dateStr === '---') return '---';
    try {
      const s = dateStr.trim().split(' ')[0];
      if (s.includes('-')) {
        const [y, m, d] = s.split('-');
        if (!y || !m || !d) return dateStr;
        return `${d}/${m}/${y}`;
      }
      return dateStr;
    } catch (e) {
      return dateStr;
    }
  };

  // CÁLCULO AUTOMÁTICO DE VALORES EM TEMPO REAL
  useEffect(() => {
    if (editingItem && isModalOpen) {
      const brute = parseFloat(String(editingItem.valor || '0').replace(',', '.'));
      const months = parseInt(String(editingItem.quantidade_meses || '1'));
      const discR = parseFloat(String(editingItem.desconto_valor || '0').replace(',', '.'));
      const discP = parseFloat(String(editingItem.desconto_percentual || '0').replace(',', '.'));

      const subtotal = (isNaN(brute) ? 0 : brute) * (isNaN(months) || months < 1 ? 1 : months);
      const discount = (isNaN(discR) ? 0 : discR) + (subtotal * ((isNaN(discP) ? 0 : discP) / 100));
      const total = Math.max(0, subtotal - discount);
      
      const totalStr = total.toFixed(2).replace('.', ',');
      
      if (editingItem.valor_total !== totalStr) {
        setEditingItem(prev => prev ? { ...prev, valor_total: totalStr } : null);
      }
    }
  }, [editingItem?.valor, editingItem?.quantidade_meses, editingItem?.desconto_valor, editingItem?.desconto_percentual, isModalOpen]);

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (memberSearchRef.current && !memberSearchRef.current.contains(event.target as Node)) {
        setShowMemberSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allFilteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return mensalidades.map(m => {
      const socio = members.find(s => s.codigo_socio === m.codigo_socio);
      return { ...m, nome_socio: socio ? socio.nome : 'Sócio não encontrado' };
    }).filter(item => {
      return item.codigo_socio.toLowerCase().includes(term) || 
             item.nome_socio.toLowerCase().includes(term);
    });
  }, [mensalidades, members, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return allFilteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [allFilteredData, currentPage]);

  const totalPages = Math.ceil(allFilteredData.length / itemsPerPage);

  const modalMemberSuggestions = useMemo(() => {
    if (!memberSearchTerm.trim()) return [];
    const term = memberSearchTerm.toLowerCase();
    return members.filter(m => 
      m.nome.toLowerCase().includes(term) || 
      m.codigo_socio.toLowerCase().includes(term)
    ).slice(0, 5);
  }, [members, memberSearchTerm]);

  const handleOpenAdd = () => {
    setMemberSearchTerm('');
    setEditingItem({
      codigo_socio: '',
      valor: '0',
      desconto_valor: '0,00',
      desconto_percentual: '0',
      valor_total: '0,00',
      quantidade_meses: '1',
      data: toInputDate(new Date().toISOString()),
      data_ultimo_mes_pago: '',
      data_ate_quando_pagar: ''
    });
    setIsModalOpen(true);
  };

  const selectMemberForPayment = (member: Member) => {
    // Busca a última mensalidade deste sócio para preencher o valor bruto automaticamente
    const lastPayment = [...mensalidades]
      .filter(m => m.codigo_socio === member.codigo_socio)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0];

    setEditingItem(prev => ({
      ...prev,
      codigo_socio: member.codigo_socio,
      valor: lastPayment ? lastPayment.valor : '0',
      data_ultimo_mes_pago: toInputDate(member.data_ultimo_pagamento || member.ultimo_mes_pago),
      data_ate_quando_pagar: toInputDate(member.ultimo_dia_pago)
    }));
    setMemberSearchTerm(member.nome);
    setShowMemberSuggestions(false);
  };

  const formatCurrency = (val: string | number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(String(val || 0).replace(',', '.')));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-32">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-xl shadow-emerald-600/20">
            <CalendarDays size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Mensalidades</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Controle de Recebimentos e Fluxo Financeiro</p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={handleOpenAdd} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:-translate-y-1 transition-all shadow-xl shadow-blue-600/20 flex-1 md:flex-none">
            <Plus size={18} /> Novo Recebimento
          </button>
        </div>
      </header>

      {/* LISTAGEM PRINCIPAL */}
      <div className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">
          <Search size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Pesquisar por Código ou Nome do Sócio..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] py-5 pl-16 pr-8 text-xs font-black uppercase tracking-widest outline-none focus:ring-8 focus:ring-emerald-600/5 focus:border-emerald-600 text-slate-900 dark:text-white transition-all shadow-sm"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400 tracking-widest">
              <tr>
                <th className="px-8 py-6">Cód. Sócio</th>
                <th className="px-8 py-6">Nome do Sócio</th>
                <th className="px-8 py-6">Últ. Pagamento</th>
                <th className="px-8 py-6">Pagar Até</th>
                <th className="px-8 py-6">Vlr. Bruto</th>
                <th className="px-8 py-6">Desc. R$</th>
                <th className="px-8 py-6">Desc. %</th>
                <th className="px-8 py-6">Total</th>
                <th className="px-8 py-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-8 py-5">
                    <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
                      {item.codigo_socio}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-xs font-black text-slate-800 dark:text-slate-200 uppercase truncate max-w-[200px]">
                    {item.nome_socio}
                  </td>
                  <td className="px-8 py-5 text-[10px] font-bold text-slate-500">
                    {formatDateDisplay(item.data_ultimo_mes_pago)}
                  </td>
                  <td className="px-8 py-5 text-[10px] font-bold text-emerald-600">
                    {formatDateDisplay(item.data_ate_quando_pagar)}
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-600">
                    {formatCurrency(item.valor)}
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-red-500">
                    {formatCurrency(item.desconto_valor)}
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-amber-500">
                    {item.desconto_percentual}%
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                      {formatCurrency(item.valor_total)}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right flex justify-end gap-2">
                    <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Printer size={16}/></button>
                    <button className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase">Total: {allFilteredData.length} registros</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30"><ChevronLeft size={16} /></button>
              <div className="px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black text-blue-600">PAG {currentPage} / {totalPages}</div>
              <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE NOVO RECEBIMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 w-screen h-screen z-[999] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="fixed inset-0 w-full h-full bg-slate-950/80 backdrop-blur-3xl" onClick={() => setIsModalOpen(false)} />
          
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[48px] shadow-2xl relative z-10 overflow-hidden border border-white/10 flex flex-col max-h-[90vh]">
            <header className="p-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="bg-emerald-600 p-4 rounded-3xl text-white shadow-xl shadow-emerald-600/20">
                  <DollarSign size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Novo Recebimento</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lançamento de Mensalidade do Associado</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X size={24}/></button>
            </header>

            <div className="p-10 overflow-y-auto space-y-10 scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* BUSCA DE SÓCIO */}
                <div className="space-y-6" ref={memberSearchRef}>
                  <h4 className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] border-l-4 border-blue-600 pl-4">Dados do Associado</h4>
                  
                  <div className="relative">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-1 block">Pesquisar por Nome ou Código</label>
                    <div className="relative">
                      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Digite o nome ou matrícula..." 
                        value={memberSearchTerm}
                        onChange={(e) => { setMemberSearchTerm(e.target.value); setShowMemberSuggestions(true); }}
                        onFocus={() => setShowMemberSuggestions(true)}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-6 text-xs font-bold uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 text-slate-900 dark:text-white transition-all"
                      />
                    </div>

                    {showMemberSuggestions && modalMemberSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden">
                        {modalMemberSuggestions.map((m) => (
                          <button key={m.id} onClick={() => selectMemberForPayment(m)} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0 text-left">
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

                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm text-slate-400"><UserIcon size={20}/></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Sócio Selecionado</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white uppercase mt-0.5">
                        {members.find(m => m.codigo_socio === editingItem?.codigo_socio)?.nome || 'Aguardando Código...'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* DATAS E PERÍODOS */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.2em] border-l-4 border-emerald-600 pl-4">Período e Prazos</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      type="date" 
                      label="Último Mês Pago" 
                      name="data_ultimo_mes_pago" 
                      value={toInputDate(editingItem?.data_ultimo_mes_pago)} 
                      onChange={e => setEditingItem({...editingItem, data_ultimo_mes_pago: e.target.value})} 
                    />
                    <Input 
                      type="date" 
                      label="Pagar Até" 
                      name="data_ate_quando_pagar" 
                      value={toInputDate(editingItem?.data_ate_quando_pagar)} 
                      onChange={e => setEditingItem({...editingItem, data_ate_quando_pagar: e.target.value})} 
                    />
                  </div>
                  <Input label="Qtd. de Meses" name="quantidade_meses" value={editingItem?.quantidade_meses || ''} onChange={e => setEditingItem({...editingItem, quantidade_meses: e.target.value})} type="number" />
                </div>
              </div>

              {/* COMPOSIÇÃO DE VALORES */}
              <div className="bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-[40px] p-10 space-y-8 shadow-sm">
                 <h4 className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] flex items-center gap-3">
                   <ArrowLeftRight size={16} /> Composição de Valores
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Input 
                      label="Valor Bruto" 
                      name="valor" 
                      value={editingItem?.valor || ''} 
                      onChange={e => setEditingItem({...editingItem, valor: e.target.value})} 
                      placeholder="0,00"
                    />
                    <Input 
                      label="Desc. em R$" 
                      name="desconto_valor" 
                      value={editingItem?.desconto_valor || ''} 
                      onChange={e => setEditingItem({...editingItem, desconto_valor: e.target.value})} 
                      placeholder="0,00"
                    />
                    <Input 
                      label="Desc. em %" 
                      name="desconto_percentual" 
                      value={editingItem?.desconto_percentual || ''} 
                      onChange={e => setEditingItem({...editingItem, desconto_percentual: e.target.value})} 
                      placeholder="0"
                    />
                    <div className="flex flex-col space-y-1">
                      <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1 mb-1 block">Valor Total</label>
                      <div className="bg-blue-600 text-white rounded-2xl px-5 py-4 text-xl font-black tracking-tighter flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 transition-all min-h-[50px]">
                        <span className="text-[10px] opacity-60 font-bold">R$</span> {editingItem?.valor_total || '0,00'}
                      </div>
                    </div>
                 </div>
              </div>
            </div>

            <footer className="p-10 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-4">
              <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">Cancelar</button>
              <button onClick={() => { alert('Lançamento salvo!'); setIsModalOpen(false); }} className="bg-emerald-600 text-white px-12 py-4 rounded-[24px] font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:-translate-y-1 transition-all shadow-xl shadow-emerald-600/20">
                <Save size={18}/> Salvar Recebimento
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* BARRA DE AÇÕES FIXA */}
      <footer className="fixed bottom-0 left-0 lg:left-[360px] right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 p-6 z-[100] shadow-2xl flex justify-between items-center px-12">
        <div className="flex gap-4">
          <button onClick={handleOpenAdd} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:-translate-y-1 transition-all shadow-lg shadow-blue-600/20">
            <Plus size={18} /> Novo Recebimento
          </button>
          <button onClick={() => setActiveView('home')} className="bg-slate-900 dark:bg-slate-700 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:-translate-y-1 transition-all">
            Voltar ao Início
          </button>
        </div>
        
        <div className="flex items-center gap-8">
           <div className="flex flex-col text-right">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Sincronizado</span>
             <span className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">{formatCurrency(mensalidades.reduce((acc, curr) => acc + Number(String(curr.valor_total || 0).replace(',', '.')), 0))}</span>
           </div>
           <button onClick={() => syncData()} className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all shadow-sm">
             <RefreshCw size={20} />
           </button>
        </div>
      </footer>
    </div>
  );
};
