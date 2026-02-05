
import React, { useState, useMemo, useEffect } from 'react';
import { 
  CalendarDays, Search, Plus, Trash2, 
  Printer, ChevronRight, RefreshCw,
  ChevronLeft
} from 'lucide-react';
import { useApp } from '../AppContext';
import { useNavigation } from '../NavigationContext';

export const MensalidadesView: React.FC = () => {
  const { mensalidades, members, syncData } = useApp();
  const { setActiveView, setMensalidadeModalOpen } = useNavigation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    syncData();
  }, []);

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

  const allFilteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    const NOT_FOUND_LABEL = 'Sócio não encontrado';
    
    // Criamos um mapa de sócios para busca O(1) e maior performance
    const membersMap = new Map();
    members.forEach(m => {
      if (m.codigo_socio) {
        membersMap.set(String(m.codigo_socio).trim(), m.nome);
      }
    });

    return mensalidades
      .map(m => {
        const cleanCode = String(m.codigo_socio || "").trim();
        const nomeSocio = membersMap.get(cleanCode) || NOT_FOUND_LABEL;
        return { ...m, nome_socio: nomeSocio };
      })
      .sort((a, b) => {
        // Lógica de ordenação: Prioriza quem TEM sócio vinculado
        const aNotFound = a.nome_socio === NOT_FOUND_LABEL;
        const bNotFound = b.nome_socio === NOT_FOUND_LABEL;
        
        if (aNotFound && !bNotFound) return 1;
        if (!aNotFound && bNotFound) return -1;
        return 0; // Mantém ordem original entre os do mesmo grupo
      })
      .filter(item => {
        return (item.codigo_socio || "").toLowerCase().includes(term) || 
               (item.nome_socio || "").toLowerCase().includes(term);
      });
  }, [mensalidades, members, searchTerm]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return allFilteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [allFilteredData, currentPage]);

  const totalPages = Math.ceil(allFilteredData.length / itemsPerPage);

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
          <button onClick={() => setMensalidadeModalOpen(true)} className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:-translate-y-1 transition-all shadow-xl shadow-blue-600/20 flex-1 md:flex-none">
            <Plus size={18} /> Novo Recebimento
          </button>
        </div>
      </header>

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
                    <span className={item.nome_socio === 'Sócio não encontrado' ? 'text-slate-400 italic' : ''}>
                      {item.nome_socio}
                    </span>
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

      <footer className="fixed bottom-0 left-0 lg:left-[360px] right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 p-6 z-[100] shadow-2xl flex justify-between items-center px-12">
        <div className="flex gap-4">
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
