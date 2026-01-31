
import React, { useState } from 'react';
import { 
  BarChart2, Search, Printer, FileDown, 
  Users, MapPin, CheckCircle2, AlertCircle, 
  DollarSign, Filter, ChevronRight
} from 'lucide-react';
import { useApp } from '../AppContext';

type ReportType = 'socios' | 'localidades' | 'financeiro' | 'recebimentos' | '';

export const RelatoriosView: React.FC = () => {
  const { members } = useApp();
  const [selectedReport, setSelectedReport] = useState<ReportType>('');

  const reportOptions = [
    { id: 'socios', label: 'Relatório Geral de Sócios', icon: Users, desc: 'Lista completa de todos os associados ativos e inativos.' },
    { id: 'localidades', label: 'Sócios por Localidade', icon: MapPin, desc: 'Agrupamento de associados por distrito ou bairro.' },
    { id: 'financeiro', label: 'Quites ou Inadimplentes', icon: CheckCircle2, desc: 'Status financeiro atualizado dos pagamentos.' },
    { id: 'recebimentos', label: 'Resumo de Recebimentos', icon: DollarSign, desc: 'Fluxo detalhado de mensalidades e serviços.' },
  ];

  const renderReportContent = () => {
    if (!selectedReport) return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-300">
        <BarChart2 size={64} className="mb-6 opacity-20" />
        <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Selecione um tipo de relatório acima para visualizar</p>
      </div>
    );

    // Simulação de filtros/conteúdo baseado na seleção
    return (
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">
              {reportOptions.find(r => r.id === selectedReport)?.label}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total de registros encontrados: {members.length}</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-slate-100 text-slate-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
              <Printer size={16} /> Imprimir
            </button>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg hover:shadow-blue-600/20 transition-all">
              <FileDown size={16} /> Gerar PDF
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Sócio</th>
                  {selectedReport === 'localidades' && <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Localidade</th>}
                  {selectedReport === 'financeiro' && <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Último Pagamento</th>}
                  {selectedReport === 'financeiro' && <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Situação</th>}
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">CPF</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {members.length > 0 ? members.map((member, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs">
                          {member.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{member.fullName}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{member.registration}</p>
                        </div>
                      </div>
                    </td>
                    {selectedReport === 'localidades' && <td className="px-8 py-5 text-xs font-bold text-slate-500">{member.locality || 'N/A'}</td>}
                    {selectedReport === 'financeiro' && <td className="px-8 py-5 text-xs font-bold text-slate-500">{member.lastMonthPaid || 'Jan/2024'}</td>}
                    {selectedReport === 'financeiro' && (
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${idx % 3 === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {idx % 3 === 0 ? 'Quite' : 'Pendente'}
                        </span>
                      </td>
                    )}
                    <td className="px-8 py-5 text-xs font-medium text-slate-500 font-mono">{member.cpf || '000.000.000-00'}</td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhum dado cadastrado para este relatório.</p>
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

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Relatórios Diversos</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Extração de dados e análise operacional</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[40px] p-10 shadow-sm">
        <div className="max-w-md mx-auto mb-12">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block text-center">Busca de Relatório</label>
          <div className="relative">
            <select 
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value as ReportType)}
              className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-700 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all cursor-pointer"
            >
              <option value="">Selecione o tipo de relatório...</option>
              {reportOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <Filter size={18} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {reportOptions.map((opt) => (
            <button 
              key={opt.id}
              onClick={() => setSelectedReport(opt.id as ReportType)}
              className={`p-6 rounded-[32px] border-2 transition-all text-left flex flex-col gap-4 group ${selectedReport === opt.id ? 'border-blue-600 bg-blue-50/20' : 'border-slate-50 hover:border-slate-200 bg-slate-50/30'}`}
            >
              <div className={`p-3 rounded-2xl w-fit transition-colors ${selectedReport === opt.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 shadow-sm group-hover:text-blue-600'}`}>
                <opt.icon size={20} />
              </div>
              <div>
                <h4 className="text-[11px] font-black uppercase text-slate-800 tracking-tight">{opt.label}</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase leading-tight mt-1">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="pt-8 border-t border-slate-50">
          {renderReportContent()}
        </div>
      </div>
    </div>
  );
};
