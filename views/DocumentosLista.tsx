
import React from 'react';
import { Files, Trash2, Eye, Calendar, Tag, FileText, Search, Download, Printer } from 'lucide-react';
import { useApp } from '../AppContext';
import { useNavigation } from '../NavigationContext';
import { DocumentTemplate } from '../types';

export const DocumentosListaView: React.FC = () => {
  const { templates, deleteTemplate } = useApp();
  const { setActiveView } = useNavigation();

  const handleDownload = (template: DocumentTemplate) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>${template.name}</title>
          <style>
            @page { size: A4; margin: 2cm; }
            body { font-family: 'Serif', 'Times New Roman'; line-height: 1.6; color: #333; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 1px solid #000; padding-bottom: 20px; font-weight: bold; text-transform: uppercase; font-size: 12px; }
            .title { text-align: center; margin-bottom: 30px; font-weight: bold; text-decoration: underline; text-transform: uppercase; font-size: 14px; }
            .content { text-align: justify; margin-bottom: 50px; white-space: pre-wrap; font-size: 12px; }
            .footer { text-align: center; margin-top: auto; font-size: 11px; font-style: italic; }
            .signature-line { margin-top: 40px; border-top: 1px solid #000; width: 300px; margin-left: auto; margin-right: auto; padding-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">${template.header.replace(/\n/g, '<br>')}</div>
          <div class="title">${template.name}</div>
          <div class="content">${template.content}</div>
          <div class="footer">${template.footer.replace(/\n/g, '<br>')}</div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Documentos Cadastrados</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Repositório de modelos oficiais da associação</p>
        </div>
        <div className="flex items-center gap-2 bg-white border rounded-2xl px-4 py-2 w-full md:w-80 shadow-sm">
          <Search size={16} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar modelos..." 
            className="bg-transparent border-none outline-none text-xs w-full py-1 font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
                <FileText size={24} />
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => handleDownload(template)}
                  title="Imprimir/Baixar"
                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                >
                  <Printer size={18} />
                </button>
                <button 
                  onClick={() => {
                    if(confirm('Deseja realmente excluir este modelo?')) deleteTemplate(template.id);
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-black text-slate-800 uppercase leading-tight mb-4 group-hover:text-blue-600 transition-colors">
              {template.name}
            </h3>

            <div className="space-y-3 border-t border-slate-50 pt-6">
              <div className="flex items-center gap-3">
                <Tag size={14} className="text-slate-300" />
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{template.category || 'Sem Categoria'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={14} className="text-slate-300" />
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Modelo Base</span>
              </div>
            </div>

            <button 
              onClick={() => setActiveView('documentos-modelos')}
              className="w-full mt-8 bg-slate-50 text-slate-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
            >
              Editar Modelo
            </button>
          </div>
        ))}

        {templates.length === 0 && (
          <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white border-2 border-dashed border-slate-200 rounded-[48px] text-slate-300">
            <Files size={64} className="mb-6 opacity-20" />
            <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Nenhum documento cadastrado ainda</p>
            <button 
              onClick={() => setActiveView('documentos-modelos')}
              className="mt-6 bg-blue-600 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-blue-600/20"
            >
              Criar Primeiro Modelo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
