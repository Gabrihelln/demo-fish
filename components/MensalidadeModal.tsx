
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  X, DollarSign, Search, User as UserIcon, ArrowLeftRight, Save, CheckCircle2 
} from 'lucide-react';
import { useApp } from '../AppContext';
import { useNavigation } from '../NavigationContext';
import { Mensalidade, Member } from '../types';
import { Input } from './FormField';

export const MensalidadeModal: React.FC = () => {
  const { isMensalidadeModalOpen, setMensalidadeModalOpen } = useNavigation();
  // Fix: addMensalidade now exists on useApp() context
  const { members, mensalidades, addMensalidade, importMensalidades } = useApp();
  
  const [editingItem, setEditingItem] = useState<Partial<Mensalidade> | null>(null);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [showMemberSuggestions, setShowMemberSuggestions] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const memberSearchRef = useRef<HTMLDivElement>(null);

  // Helper para converter para YYYY-MM-DD
  const toInputDate = (dateStr: string | undefined) => {
    if (!dateStr || dateStr === '---') return '';
    const clean = dateStr.trim().split(' ')[0];
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(clean)) {
      const [d, m, y] = clean.split('/');
      return `${y}-${m}-${d}`;
    }
    return clean.substring(0, 10);
  };

  useEffect(() => {
    if (isMensalidadeModalOpen) {
      setMemberSearchTerm('');
      setShowSuccess(false);
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
    }
  }, [isMensalidadeModalOpen]);

  // Cálculos automáticos
  useEffect(() => {
    if (editingItem && isMensalidadeModalOpen && !showSuccess) {
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
  }, [editingItem?.valor, editingItem?.quantidade_meses, editingItem?.desconto_valor, editingItem?.desconto_percentual, isMensalidadeModalOpen, showSuccess]);

  const modalMemberSuggestions = useMemo(() => {
    if (!memberSearchTerm.trim()) return [];
    const term = memberSearchTerm.toLowerCase();
    return members.filter(m => 
      m.nome.toLowerCase().includes(term) || 
      m.codigo_socio.toLowerCase().includes(term)
    ).slice(0, 5);
  }, [members, memberSearchTerm]);

  const selectMemberForPayment = (member: Member) => {
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

  const handleSave = async () => {
    if (!editingItem?.codigo_socio) return alert("Selecione um associado.");
    
    const newItem = {
      ...editingItem,
      id: crypto.randomUUID(),
      isSynced: false,
      tenant_id: members.find(m => m.codigo_socio === editingItem.codigo_socio)?.tenant_id || ''
    } as Mensalidade;

    // Fix: Using the newly added addMensalidade method instead of importMensalidades
    addMensalidade(newItem);
    setShowSuccess(true);
    setTimeout(() => {
      setMensalidadeModalOpen(false);
      setShowSuccess(false);
    }, 2000);
  };

  if (!isMensalidadeModalOpen) return null;

  return (
    <div className="fixed inset-0 w-screen h-screen z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="fixed inset-0 w-full h-full bg-slate-950/80 backdrop-blur-3xl" onClick={() => !showSuccess && setMensalidadeModalOpen(false)} />
      
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[48px] shadow-2xl relative z-10 overflow-hidden border border-white/10 flex flex-col max-h-[90vh]">
        {showSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter text-center">Recebimento Registrado!</h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Mensalidade processada com sucesso no sistema</p>
          </div>
        ) : (
          <>
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
              <button onClick={() => setMensalidadeModalOpen(false)} className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-all"><X size={24}/></button>
            </header>

            <div className="p-10 overflow-y-auto space-y-10 scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

              <div className="bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-[40px] p-10 space-y-8 shadow-sm">
                 <h4 className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em] flex items-center gap-3">
                   <ArrowLeftRight size={16} /> Composição de Valores
                 </h4>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Input label="Valor Bruto" name="valor" value={editingItem?.valor || ''} onChange={e => setEditingItem({...editingItem, valor: e.target.value})} placeholder="0,00" />
                    <Input label="Desc. em R$" name="desconto_valor" value={editingItem?.desconto_valor || ''} onChange={e => setEditingItem({...editingItem, desconto_valor: e.target.value})} placeholder="0,00" />
                    <Input label="Desc. em %" name="desconto_percentual" value={editingItem?.desconto_percentual || ''} onChange={e => setEditingItem({...editingItem, desconto_percentual: e.target.value})} placeholder="0" />
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
              <button onClick={() => setMensalidadeModalOpen(false)} className="px-10 py-4 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">Cancelar</button>
              <button onClick={handleSave} className="bg-emerald-600 text-white px-12 py-4 rounded-[24px] font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:-translate-y-1 transition-all shadow-xl shadow-emerald-600/20">
                <Save size={18}/> Salvar Recebimento
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};
