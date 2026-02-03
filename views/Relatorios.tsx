
import React, { useState } from 'react';
import { 
  BarChart2, Printer, FileDown, 
  Users, MapPin, CheckCircle2, 
  DollarSign, Filter, ChevronRight
} from 'lucide-react';
import { useApp } from '../AppContext';

type ReportType = 'socios' | 'localidades' | 'financeiro' | 'recebimentos' | '';

export const RelatoriosView: React.FC = () => {
  const { members, session } = useApp();
  const [selectedReport, setSelectedReport] = useState<ReportType>('');

  const reportOptions = [
    { id: 'socios', label: 'Relatório Geral de Sócios', icon: Users, desc: 'Lista completa de todos os associados.' },
    { id: 'localidades', label: 'Sócios por Localidade', icon: MapPin, desc: 'Agrupamento por cidade/bairro.' },
    { id: 'financeiro', label: 'Quites ou Inadimplentes', icon: CheckCircle2, desc: 'Status financeiro atualizado.' },
    { id: 'recebimentos', label: 'Resumo de Recebimentos', icon: DollarSign, desc: 'Fluxo detalhado de mensalidades.' },
  ];

  const generatePDF = () => {
    if (!selectedReport) return;

    const reportLabel = reportOptions.find(r => r.id === selectedReport)?.label || 'Relatório';
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const now = new Date().toLocaleString('pt-BR');
    
    const html = `
      <html>
        <head>
          <title>${reportLabel}</title>
          <style>
            @page { size: A4 landscape; margin: 1cm; }
            body { font-family: 'Inter', sans-serif; color: #333; margin: 0; padding: 20px; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .header-info h1 { margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; color: #1e293b; }
            .header-info p { margin: 5px 0 0 0; font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; }
            .meta { text-align: right; font-size: 9px; color: #94a3b8; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10px; }
            th { background: #f8fafc; padding: 12px 8px; text-align: left; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; color: #64748b; }
            td { padding: 10px 8px; border-bottom: 1px solid #f1f5f9; color: #334155; }
            tr:nth-child(even) { background: #fcfcfc; }
            .footer { margin-top: 30px; text-align: center; font-size: 8px; color: #cbd5e1; border-top: 1px solid #f1f5f9; padding-top: 10px; }
            .badge { padding: 2px 6px; border-radius: 4px; background: #f1f5f9; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-info">
              <h1>${reportLabel}</h1>
              <p>Unidade: ${session.user?.cityName || 'SGA Global'} | Operador: ${session.user?.username}</p>
            </div>
            <div class="meta">
              Gerado em: ${now}<br>
              Total de Registros: ${(members || []).length}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Matrícula</th>
                <th>Nome do Associado</th>
                <th>CPF</th>
                <th>Cidade / Localidade</th>
                <th>Situação</th>
              </tr>
            </thead>
            <tbody>
              ${(members || []).map(m => `
                <tr>
                  <td style="font-weight: bold; color: #2563eb;">${m.codigo_socio || '---'}</td>
                  <td style="font-weight: 800; text-transform: uppercase;">${m.nome}</td>
                  <td>${m.cpf || '---'}</td>
                  <td>${m.cidade || '---'}</td>
                  <td><span class="badge">${m.situacao || 'ATIVO'}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            SGA - Sistema de Gestão de Associados | Desenvolvido por Orbio Tech
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

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
            <button 
              onClick={generatePDF}
              className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-6 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all"
            >
              Imprimir
            </button>
            <button 
              onClick={generatePDF}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
            >
              Gerar PDF
            </button>
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
