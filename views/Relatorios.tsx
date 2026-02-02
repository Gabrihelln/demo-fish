
import React, { useState } from 'react';
import { 
  BarChart2, Printer, FileDown, 
  Users, MapPin, CheckCircle2, 
  DollarSign, Filter, ChevronRight
} from 'lucide-react';
import { useApp } from '../AppContext';

type ReportType = 'socios' | 'localidades' | 'financeiro' | 'recebimentos' | '';

export const RelatoriosView: React.FC = () => {
  const { members } = useApp();
  const [selectedReport, setSelectedReport] = useState<ReportType>('');

  const reportOptions = [
    { id: 'socios', label: 'Relatório Geral de Sócios', icon: Users, desc: 'Lista completa de todos os associados.' },
    { id: 'localidades', label: 'Sócios por Localidade', icon: MapPin, desc: 'Agrupamento por cidade/bairro.' },
    { id: 'financeiro', label: 'Quites ou Inadimplentes', icon: CheckCircle2, desc: 'Status financeiro atualizado.' },
    { id: 'recebimentos', label: 'Resumo de Recebimentos', icon: DollarSign, desc: 'Fluxo detalhado de mensalidades.' },
  ];

  const renderReportContent = () => {
    if (!selectedReport) return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-300 dark:text-slate-700">
        <BarChart2 size={64} className="mb-6 opacity-20" />
        <p className="text-sm font-black uppercase tracking-widest opacity-40">Selecione um relatório</p>
      </div>
    );

    return (
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase">{reportOptions.find(r => r.id === selectedReport)?.label}</h3>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total: {(members || []).length}</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-6 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all">Imprimir</button>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">Gerar PDF</button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">Sócio</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">Cidade</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500">CPF</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {(members || []).map((m, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-8 py-5">
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase">{m.nome}</p>
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Matrícula: {m.codigo_socio}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-500 dark:text-slate-400">{m.cidade || 'N/A'}</td>
                  <td className="px-8 py-5 text-xs font-mono text-slate-500 dark:text-slate-400">{m.cpf}</td>
                  <td className="px-8 py-5 text-right">
                    <ChevronRight size={18} className="text-slate-300 dark:text-slate-600" />
                  </td>
                </tr>
              ))}
              {(members || []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-slate-400 uppercase text-[10px] font-black">Nenhum registro encontrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Relatórios Diversos</h2>
      </div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] p-10 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {reportOptions.map((opt) => (
            <button key={opt.id} onClick={() => setSelectedReport(opt.id as ReportType)} className={`p-6 rounded-[32px] border-2 text-left flex flex-col gap-4 transition-all hover:scale-105 ${selectedReport === opt.id ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20' : 'border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20'}`}>
              <div className={`p-3 rounded-2xl w-fit ${selectedReport === opt.id ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}><opt.icon size={20} /></div>
              <h4 className="text-[11px] font-black uppercase text-slate-800 dark:text-white leading-tight">{opt.label}</h4>
            </button>
          ))}
        </div>
        {renderReportContent()}
      </div>
    </div>
  );
};
