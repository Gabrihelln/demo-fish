
import React, { useState, useRef, useEffect } from 'react';
import { 
  Save, Plus, Copy, Trash2, FileText, Info, Layout, 
  Image as ImageIcon, AlignCenter, Type, FileSignature, 
  Eye, Download, Settings, ChevronRight, Printer, Scissors,
  Zap, FileCheck, ArrowLeft
} from 'lucide-react';
import { DocumentTemplate, DocumentType, PrintFormat } from '../types';
import { useApp } from '../AppContext';
import { useNavigation } from '../NavigationContext';
import { Input, Select } from '../components/FormField';

export const DocumentosModelosView: React.FC = () => {
  const { templates, addTemplate, deleteTemplate } = useApp();
  const { selectedTemplateId, setSelectedTemplateId, setActiveView } = useNavigation();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  const initialTemplate: DocumentTemplate = { 
    id: '', 
    tenantId: '', 
    name: '', 
    category: '', 
    header: 'SINPECAMPER\nRUA NOVA, Nº 85\nPEDRO DO ROSÁRIO\nCNPJ: 07.172.381/0001-35', 
    content: '', 
    footer: 'PEDRO DO ROSÁRIO\n{{dia_semana}}, {{hoje}}\n\n__________________________________\nRECEBEDOR',
    type: 'RECEIPT',
    printFormat: 'THERMAL'
  };

  const [newTemplate, setNewTemplate] = useState<DocumentTemplate>(initialTemplate);
  
  const [focusedPart, setFocusedPart] = useState<'header' | 'content' | 'footer'>('content');

  const headerRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const footerRef = useRef<HTMLTextAreaElement>(null);

  // Carrega o modelo se estivermos em modo de edição
  useEffect(() => {
    if (selectedTemplateId) {
      const existing = templates.find(t => t.id === selectedTemplateId);
      if (existing) {
        setNewTemplate({ ...existing });
      }
    } else {
      setNewTemplate(initialTemplate);
    }
  }, [selectedTemplateId, templates]);

  const variables = [
    { key: '{{nome}}', label: 'Nome Sócio', cat: 'Geral' },
    { key: '{{inscricao}}', label: 'Matrícula', cat: 'Geral' },
    { key: '{{cpf}}', label: 'CPF', cat: 'Geral' },
    { key: '{{hoje}}', label: 'Data Atual', cat: 'Geral' },
    { key: '{{dia_semana}}', label: 'Dia da Semana', cat: 'Geral' },
    { key: '{{valor}}', label: 'Valor (R$)', cat: 'Financeiro' },
    { key: '{{valor_extenso}}', label: 'Vlr Extenso', cat: 'Financeiro' },
    { key: '{{quantidade}}', label: 'Qtd Meses', cat: 'Mensalidade' },
    { key: '{{vlr_mensalidade}}', label: 'Vlr. Mensalidade (Config)', cat: 'Configuração' },
    { key: '{{vlr_filiacao}}', label: 'Vlr. Filiação (Config)', cat: 'Configuração' },
    { key: '{{periodo_de}}', label: 'Período De', cat: 'Mensalidade' },
    { key: '{{periodo_ate}}', label: 'Período Até', cat: 'Mensalidade' },
    { key: '{{num_recibo}}', label: 'Nº Recibo', cat: 'Financeiro' },
    { key: '{{servico_desc}}', label: 'Descr. Serviço', cat: 'Serviço' },
  ];

  const insertVariable = (variable: string) => {
    const refs = { header: headerRef, content: contentRef, footer: footerRef };
    const targetRef = refs[focusedPart];
    if (targetRef.current) {
      const start = targetRef.current.selectionStart;
      const end = targetRef.current.selectionEnd;
      const text = (newTemplate as any)[focusedPart];
      const newText = text.substring(0, start) + variable + text.substring(end);
      setNewTemplate(prev => ({ ...prev, [focusedPart]: newText }));
      setTimeout(() => {
        targetRef.current?.focus();
        targetRef.current?.setSelectionRange(start + variable.length, start + variable.length);
      }, 10);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const PreviewSheet = ({ template, isDuplicate = false }: { template: DocumentTemplate, isDuplicate?: boolean }) => {
    const isThermal = template.printFormat === 'THERMAL';
    
    // Simula o efeito de negrito nas variáveis na visualização
    const formatPreviewText = (text: string) => {
      let formatted = text;
      variables.forEach(v => {
        formatted = formatted.split(v.key).join(`<strong class="text-blue-600">${v.key}</strong>`);
      });
      return formatted;
    };

    return (
      <div className={`bg-white shadow-2xl border border-slate-200 flex flex-col relative overflow-hidden transition-all mx-auto ${
        isThermal 
          ? 'w-[320px] h-fit p-4 font-mono' 
          : 'aspect-[1/1.414] w-full p-[10%] font-serif'
      } ${isDuplicate ? 'mt-4 border-t-4 border-dashed border-slate-300' : ''}`}>
        
        {isDuplicate && (
          <div className="absolute top-[-10px] left-0 right-0 flex justify-center pointer-events-none">
            <div className="bg-slate-100 px-2 py-1 text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Scissors size={10} /> Recorte aqui
            </div>
          </div>
        )}

        {/* Cabeçalho */}
        <div className={`flex flex-col items-center text-center relative z-10 ${isThermal ? 'mb-2' : 'mb-12'}`}>
          {logoUrl ? (
            <img src={logoUrl} className={`${isThermal ? 'h-8' : 'h-16'} w-auto mb-2 grayscale`} alt="Logo" />
          ) : (
            <div className={`${isThermal ? 'w-6 h-6' : 'w-12 h-12'} bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mb-2 text-slate-200`}>
              <ImageIcon size={isThermal ? 12 : 20} />
            </div>
          )}
          <div className={`whitespace-pre-line font-bold text-slate-800 leading-tight uppercase ${isThermal ? 'text-[8px]' : 'text-[12px]'}`}
               dangerouslySetInnerHTML={{ __html: formatPreviewText(template.header) }} />
          <div className={`w-full bg-slate-400 mt-2 ${isThermal ? 'h-[1px]' : 'h-[2px]'}`} />
        </div>

        {/* Título do Recibo */}
        <div className={`text-center relative z-10 ${isThermal ? 'mb-4' : 'mb-8'}`}>
          <h4 className={`${isThermal ? 'text-[9px]' : 'text-sm'} font-black uppercase underline tracking-tighter`}>
            {template.name || "RECIBO"}
          </h4>
        </div>

        {/* Conteúdo Dinâmico */}
        <div className="flex-1 relative z-10">
          <div className={`text-slate-800 leading-relaxed text-justify whitespace-pre-wrap ${isThermal ? 'text-[9px] space-y-1' : 'text-[12px]'}`}
               dangerouslySetInnerHTML={{ __html: formatPreviewText(template.content || "Texto do recibo...") }} />
        </div>

        {/* Rodapé e Assinaturas */}
        <div className={`mt-4 pt-4 relative z-10 ${!isThermal && 'border-t border-slate-200'}`}>
          <div className={`${isThermal ? 'text-[8px]' : 'text-[12px]'} text-center font-bold text-slate-700 whitespace-pre-line leading-relaxed`}
               dangerouslySetInnerHTML={{ __html: formatPreviewText(template.footer) }} />
          <div className="mt-4 flex flex-col items-center gap-2">
             <div className="w-full border-t border-slate-400 mt-2" />
             <span className="text-[8px] font-black uppercase text-slate-400">RECEBEDOR</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* COLUNA ESQUERDA: EDITOR */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-[40px] shadow-sm p-10">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { setSelectedTemplateId(null); setActiveView('documentos-lista'); }}
                  className="bg-slate-100 p-3 rounded-2xl text-slate-500 hover:bg-slate-200 transition-all"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tighter text-slate-800 leading-none">
                    {selectedTemplateId ? 'Editando Modelo' : 'Novo Modelo'}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configure o layout das impressões</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (!newTemplate.name) return alert("Título é obrigatório.");
                  addTemplate(newTemplate);
                  alert("Modelo salvo com sucesso!");
                  setSelectedTemplateId(null);
                  setActiveView('documentos-lista');
                }}
                className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:-translate-y-1 transition-all shadow-xl shadow-emerald-600/20"
              >
                <Save size={18} /> Salvar Alterações
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Input label="Título do Recibo" name="name" value={newTemplate.name} onChange={e => setNewTemplate({...newTemplate, name: e.target.value})} />
              <Input label="Categoria" name="category" value={newTemplate.category} onChange={e => setNewTemplate({...newTemplate, category: e.target.value})} />
              <Select 
                label="Papel / Formato" 
                name="printFormat" 
                options={['A4', 'THERMAL', 'A4_DUAL']} 
                value={newTemplate.printFormat} 
                onChange={e => setNewTemplate({...newTemplate, printFormat: e.target.value as PrintFormat})} 
              />
              <Select 
                label="Tipo de Doc." 
                name="type" 
                options={['DECLARATION', 'RECEIPT', 'OTHER']} 
                value={newTemplate.type} 
                onChange={e => setNewTemplate({...newTemplate, type: e.target.value as DocumentType})} 
              />
            </div>

            <div className="space-y-6">
              <div className={`p-6 rounded-3xl border-2 transition-all ${focusedPart === 'header' ? 'border-blue-600 bg-blue-50/20' : 'border-slate-100'}`}>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">1. Cabeçalho (Fixo)</label>
                  <label className="cursor-pointer p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-all border border-slate-100">
                    <ImageIcon size={14} />
                    <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                  </label>
                </div>
                <textarea 
                  ref={headerRef} 
                  className="w-full h-24 bg-transparent outline-none text-center font-bold text-xs resize-none placeholder:font-normal" 
                  value={newTemplate.header} 
                  onFocus={() => setFocusedPart('header')}
                  onChange={e => setNewTemplate({...newTemplate, header: e.target.value})}
                  placeholder="Dados da Instituição..."
                />
              </div>

              <div className={`p-6 rounded-3xl border-2 transition-all ${focusedPart === 'content' ? 'border-blue-600 bg-blue-50/20' : 'border-slate-100'}`}>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">2. Corpo do Texto (Variável)</label>
                  <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                    <Zap size={10} /> Auto-Preenchimento Ativo
                  </div>
                </div>
                <textarea 
                  ref={contentRef} 
                  className="w-full h-64 bg-transparent outline-none text-sm leading-relaxed resize-none font-mono" 
                  value={newTemplate.content} 
                  onFocus={() => setFocusedPart('content')}
                  onChange={e => setNewTemplate({...newTemplate, content: e.target.value})}
                  placeholder="Recebi de {{nome}}, matrícula {{inscricao}} a importância de..."
                />
              </div>

              <div className={`p-6 rounded-3xl border-2 transition-all ${focusedPart === 'footer' ? 'border-blue-600 bg-blue-50/20' : 'border-slate-100'}`}>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">3. Rodapé e Datas</label>
                  <FileSignature size={14} className="text-slate-300" />
                </div>
                <textarea 
                  ref={footerRef} 
                  className="w-full h-24 bg-transparent outline-none text-center text-xs text-slate-800 font-bold resize-none" 
                  value={newTemplate.footer} 
                  onFocus={() => setFocusedPart('footer')}
                  onChange={e => setNewTemplate({...newTemplate, footer: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-950 rounded-[40px] p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12">
               <FileCheck size={200} />
            </div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-blue-400 flex items-center gap-3">
              <Plus size={18} /> Variáveis do Sistema
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 relative z-10">
              {variables.map(v => (
                <button 
                  key={v.key} 
                  onClick={() => insertVariable(v.key)}
                  className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-blue-600 hover:border-blue-600 transition-all text-left group"
                >
                  <p className="text-[8px] font-black text-slate-500 group-hover:text-blue-200 uppercase tracking-widest mb-1">{v.cat}</p>
                  <p className="text-[10px] font-bold text-white mb-1">{v.label}</p>
                  <p className="text-[9px] font-mono text-blue-400 group-hover:text-white">{v.key}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:block relative">
          <div className="sticky top-28 space-y-6">
            <div className="flex justify-between items-center px-6">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><Eye size={16}/></div>
                <span className="text-[11px] font-black uppercase text-slate-900 tracking-widest">
                  Preview de Impressão
                </span>
              </div>
              <div className="flex gap-2">
                 <div className="bg-slate-900 text-white px-4 py-2 rounded-full text-[9px] font-black uppercase flex items-center gap-2 shadow-lg">
                    <Printer size={12}/> {newTemplate.printFormat === 'THERMAL' ? 'Bobina Térmica 80mm' : 'Folha A4 210mm'}
                 </div>
              </div>
            </div>

            <div className="max-h-[80vh] overflow-y-auto scrollbar-hide pb-10 px-4">
              <div className={`w-full max-w-[400px] mx-auto ${newTemplate.printFormat === 'A4_DUAL' && 'space-y-4'}`}>
                <PreviewSheet template={newTemplate} />
                {newTemplate.printFormat === 'A4_DUAL' && (
                  <PreviewSheet template={newTemplate} isDuplicate={true} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
