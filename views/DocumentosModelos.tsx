
import React, { useState, useRef } from 'react';
import { 
  Save, Plus, Copy, Trash2, FileText, Info, Layout, 
  Image as ImageIcon, AlignCenter, Type, FileSignature, 
  Eye, Download, Settings, ChevronRight
} from 'lucide-react';
import { DocumentTemplate } from '../types';
import { useApp } from '../AppContext';
import { Input } from '../components/FormField';

export const DocumentosModelosView: React.FC = () => {
  const { templates, addTemplate, deleteTemplate } = useApp();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  // Fixed: Added missing tenantId property to satisfy DocumentTemplate interface
  const [newTemplate, setNewTemplate] = useState<DocumentTemplate>({ 
    id: '', tenantId: '', name: '', category: '', header: '', content: '', footer: '' 
  });
  const [focusedPart, setFocusedPart] = useState<'header' | 'content' | 'footer'>('content');

  const headerRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const footerRef = useRef<HTMLTextAreaElement>(null);

  const variables = [
    { key: '{{nome}}', label: 'Nome' },
    { key: '{{cpf}}', label: 'CPF' },
    { key: '{{rg}}', label: 'RG' },
    { key: '{{cidade}}', label: 'Cidade' },
    { key: '{{inscricao}}', label: 'Inscrição' },
    { key: '{{hoje}}', label: 'Data Atual' },
  ];

  const insertVariable = (variable: string) => {
    const refs = { header: headerRef, content: contentRef, footer: footerRef };
    const targetRef = refs[focusedPart];
    if (targetRef.current) {
      const start = targetRef.current.selectionStart;
      const end = targetRef.current.selectionEnd;
      const text = newTemplate[focusedPart];
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

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUNA ESQUERDA: EDITOR */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-[32px] shadow-sm p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-600/20">
                  <Settings size={20} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">Editor de Papel Timbrado</h3>
              </div>
              <button 
                onClick={() => {
                  if (!newTemplate.name) return alert("Título é obrigatório.");
                  addTemplate({...newTemplate, id: Date.now().toString()});
                  alert("Modelo salvo!");
                }}
                className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:-translate-y-0.5 transition-all shadow-lg shadow-emerald-600/20"
              >
                <Save size={16} /> Salvar Modelo
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <Input label="Título do Modelo" name="name" value={newTemplate.name} onChange={e => setNewTemplate({...newTemplate, name: e.target.value})} placeholder="Ex: Declaração de Filiação" />
              <Input label="Categoria" name="category" value={newTemplate.category} onChange={e => setNewTemplate({...newTemplate, category: e.target.value})} placeholder="Ex: Secretaria" />
            </div>

            <div className="space-y-4">
              {/* Seção Cabeçalho */}
              <div className={`p-5 rounded-2xl border-2 transition-all ${focusedPart === 'header' ? 'border-blue-600 bg-blue-50/20' : 'border-slate-100'}`}>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-black uppercase text-slate-400">1. Cabeçalho & Logo</label>
                  <div className="flex gap-2">
                    <label className="cursor-pointer p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                      <ImageIcon size={14} />
                      <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                    </label>
                  </div>
                </div>
                <textarea 
                  ref={headerRef} 
                  className="w-full h-20 bg-transparent outline-none text-center font-bold text-xs resize-none placeholder:font-normal" 
                  value={newTemplate.header} 
                  onFocus={() => setFocusedPart('header')}
                  onChange={e => setNewTemplate({...newTemplate, header: e.target.value})}
                  placeholder="Nome da Associação, Endereço e Dados de Contato..."
                />
              </div>

              {/* Seção Corpo */}
              <div className={`p-5 rounded-2xl border-2 transition-all ${focusedPart === 'content' ? 'border-blue-600 bg-blue-50/20' : 'border-slate-100'}`}>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-black uppercase text-slate-400">2. Corpo do Documento</label>
                  <Type size={14} className="text-slate-300" />
                </div>
                <textarea 
                  ref={contentRef} 
                  className="w-full h-64 bg-transparent outline-none text-sm leading-relaxed resize-none font-serif" 
                  value={newTemplate.content} 
                  onFocus={() => setFocusedPart('content')}
                  onChange={e => setNewTemplate({...newTemplate, content: e.target.value})}
                  placeholder="Atestamos para os devidos fins que o Sr(a) {{nome}}..."
                />
              </div>

              {/* Seção Rodapé */}
              <div className={`p-5 rounded-2xl border-2 transition-all ${focusedPart === 'footer' ? 'border-blue-600 bg-blue-50/20' : 'border-slate-100'}`}>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-[10px] font-black uppercase text-slate-400">3. Rodapé & Assinaturas</label>
                  <FileSignature size={14} className="text-slate-300" />
                </div>
                <textarea 
                  ref={footerRef} 
                  className="w-full h-24 bg-transparent outline-none text-center text-xs text-slate-500 italic resize-none" 
                  value={newTemplate.footer} 
                  onFocus={() => setFocusedPart('footer')}
                  onChange={e => setNewTemplate({...newTemplate, footer: e.target.value})}
                  placeholder="Local, Data e campo para assinatura da diretoria..."
                />
              </div>
            </div>
          </div>

          {/* Variáveis e Sugestões */}
          <div className="bg-slate-900 rounded-[32px] p-8 text-white shadow-xl shadow-slate-900/20">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-50 flex items-center gap-2">
              <Plus size={16} /> Inserir Atributo Dinâmico
            </h3>
            <div className="flex flex-wrap gap-2">
              {variables.map(v => (
                <button 
                  key={v.key} 
                  onClick={() => insertVariable(v.key)}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-[10px] font-bold tracking-wider"
                >
                  {v.label} <span className="opacity-30 ml-1">{v.key}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: PREVIEW DINÂMICO */}
        <div className="hidden lg:block">
          <div className="sticky top-28 space-y-4">
            <div className="flex justify-between items-center px-4">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-blue-600" />
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Preview em Tempo Real</span>
              </div>
              <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md uppercase">Folha A4 Simulação</span>
            </div>

            {/* Simulação da Folha A4 */}
            <div className="bg-white shadow-2xl rounded-sm aspect-[1/1.414] w-full max-w-[500px] mx-auto border border-slate-100 flex flex-col p-[10%] relative overflow-hidden transition-all">
              
              {/* Marca d'água (opcional decorativo) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                <FileText size={200} />
              </div>

              {/* Cabeçalho do Preview */}
              <div className="flex flex-col items-center text-center mb-12 relative z-10">
                {logoUrl ? (
                  <img src={logoUrl} className="h-16 w-auto mb-4 grayscale" alt="Logo" />
                ) : (
                  <div className="w-12 h-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center mb-4 text-slate-200">
                    <ImageIcon size={20} />
                  </div>
                )}
                <div className="whitespace-pre-line text-[10px] font-bold text-slate-800 leading-tight uppercase">
                  {newTemplate.header || "NOME DA ENTIDADE INSTITUCIONAL\nEndereço Completo, Cidade - UF\nCNPJ: 00.000.000/0001-00"}
                </div>
                <div className="w-full h-[1px] bg-slate-800 mt-6" />
              </div>

              {/* Título do Documento no Preview */}
              <div className="text-center mb-8 relative z-10">
                <h4 className="text-xs font-black uppercase underline tracking-wider">
                  {newTemplate.name || "Título do Documento"}
                </h4>
              </div>

              {/* Conteúdo do Preview */}
              <div className="flex-1 relative z-10">
                <div className="text-[11px] font-serif text-slate-700 leading-relaxed text-justify whitespace-pre-wrap italic opacity-80">
                  {newTemplate.content || "O texto principal do documento aparecerá aqui conforme você digita no editor à esquerda. Utilize as variáveis para personalizar automaticamente para cada sócio."}
                </div>
              </div>

              {/* Rodapé do Preview */}
              <div className="mt-auto pt-8 border-t border-slate-100 relative z-10">
                <div className="text-[10px] text-center font-medium text-slate-500 whitespace-pre-line leading-relaxed">
                  {newTemplate.footer || "Localidade - UF, {{hoje}}\n\n__________________________________\nAssinatura do Responsável"}
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 transition-colors">
                <Download size={14} /> Baixar PDF
              </button>
              <div className="w-1 h-1 bg-slate-200 rounded-full my-auto" />
              <button className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 transition-colors">
                <Plus size={14} /> Imprimir Cópia
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
