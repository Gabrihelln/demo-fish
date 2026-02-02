
import React, { useState, useRef, useEffect } from 'react';
import { 
  UserPlus, Save, Trash2, ChevronLeft, ChevronRight, 
  Upload, Printer, X, FileSignature, Table as TableIcon,
  FileText, Download, Search, User as UserIcon, Edit3, Eye
} from 'lucide-react';
import { Member, TabType, DocumentTemplate } from '../types';
import { useApp } from '../AppContext';
import { 
  UF_OPTIONS, MARITAL_STATUS_OPTIONS, BLOOD_TYPE_OPTIONS, 
  SEX_OPTIONS, STATUS_OPTIONS, YES_NO_OPTIONS,
  EMPTY_MEMBER 
} from '../constants';
import { Input, Select, TextArea } from '../components/FormField';
import { Section } from '../components/Section';

export const SociosView: React.FC = () => {
  const { members, addMember, updateMember, deleteMember, templates } = useApp();
  const [currentIndex, setCurrentIndex] = useState((members || []).length > 0 ? 0 : -1);
  const [currentMember, setCurrentMember] = useState<Member>(currentIndex >= 0 ? members[currentIndex] : EMPTY_MEMBER);
  
  // Estados do Modal de Edição/Inclusão
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [formMember, setFormMember] = useState<Member>(EMPTY_MEMBER);
  const [activeModalTab, setActiveModalTab] = useState<TabType>('frente');
  const [activeViewTab, setActiveViewTab] = useState<TabType>('frente');

  // Estado do Modal de Documentos
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentIndex >= 0 && members && members[currentIndex]) {
      setCurrentMember(members[currentIndex]);
    }
  }, [members, currentIndex]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormMember(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formMember.nome) return alert("Nome completo é obrigatório.");
    if (modalMode === 'add') {
      addMember(formMember);
      setCurrentIndex((members || []).length); 
    } else {
      updateMember(currentIndex, formMember);
    }
    setIsEditModalOpen(false);
    alert("Dados processados com sucesso!");
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setFormMember({ ...EMPTY_MEMBER, id: crypto.randomUUID() });
    setActiveModalTab('frente');
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (currentIndex === -1) return alert("Nenhum sócio selecionado para editar.");
    setModalMode('edit');
    setFormMember({ ...currentMember });
    setActiveModalTab('frente');
    setIsEditModalOpen(true);
  };

  const navigate = (dir: 'prev' | 'next') => {
    const list = members || [];
    if (list.length === 0) return;
    let nextIdx = dir === 'prev' 
      ? (currentIndex > 0 ? currentIndex - 1 : list.length - 1)
      : (currentIndex < list.length - 1 ? currentIndex + 1 : 0);
    setCurrentIndex(nextIdx);
  };

  const handleSelectSuggestion = (member: Member) => {
    const idx = (members || []).findIndex(m => m.id === member.id);
    if (idx !== -1) {
      setCurrentIndex(idx);
      setSearchTerm('');
      setShowSuggestions(false);
    }
  };

  const filteredSuggestions = searchTerm.trim() === '' ? [] : (members || []).filter(m => 
    (m.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.codigo_socio || "").toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 8);

  const generateMemberDoc = (template: DocumentTemplate) => {
    const replacements: Record<string, string> = {
      '{{nome}}': currentMember.nome || '____________________',
      '{{cpf}}': currentMember.cpf || '____________________',
      '{{rg}}': currentMember.rg || '____________________',
      '{{cidade}}': currentMember.cidade || '____________________',
      '{{inscricao}}': currentMember.codigo_socio || '____________________',
      '{{hoje}}': new Date().toLocaleDateString('pt-BR'),
    };

    let filledContent = template.content;
    let filledHeader = template.header;
    let filledFooter = template.footer;

    Object.entries(replacements).forEach(([key, value]) => {
      filledContent = filledContent.split(key).join(value);
      filledHeader = filledHeader.split(key).join(value);
      filledFooter = filledFooter.split(key).join(value);
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>${template.name} - ${currentMember.nome}</title>
          <style>
            @page { size: A4; margin: 2cm; }
            body { font-family: 'Serif', 'Times New Roman'; line-height: 1.6; color: #333; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 1px solid #000; padding-bottom: 20px; font-weight: bold; text-transform: uppercase; font-size: 11px; }
            .title { text-align: center; margin-bottom: 30px; font-weight: bold; text-decoration: underline; text-transform: uppercase; font-size: 14px; }
            .content { text-align: justify; margin-bottom: 50px; white-space: pre-wrap; font-size: 12px; }
            .footer { text-align: center; margin-top: auto; font-size: 11px; font-style: italic; }
            .signature { margin-top: 60px; text-align: center; }
            .signature-line { border-top: 1px solid #000; width: 300px; margin: 0 auto 5px auto; }
          </style>
        </head>
        <body>
          <div class="header">${filledHeader.replace(/\n/g, '<br>')}</div>
          <div class="title">${template.name}</div>
          <div class="content">${filledContent}</div>
          <div class="footer">${filledFooter.replace(/\n/g, '<br>')}</div>
          <div class="signature">
            <div class="signature-line"></div>
            <div style="font-size: 10px; font-weight: bold;">${currentMember.nome}</div>
            <div style="font-size: 9px;">Associado(a)</div>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    setIsDocModalOpen(false);
  };

  const renderMemberForm = (data: Member, onChange: any, isReadOnly: boolean = false) => {
    const tab = isReadOnly ? activeViewTab : activeModalTab;
    
    return (
      <div className="space-y-8">
        {tab === 'frente' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Section title="1. Identificação Administrativa">
              <Input label="Código Sócio" name="codigo_socio" value={data.codigo_socio} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input label="Código Antigo" name="codigo_antigo" value={data.codigo_antigo} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input label="Comunidade" name="codigo_comunidade" value={data.codigo_comunidade} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input type="date" label="Recadastro" name="recadastro" value={data.recadastro} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input type="date" label="Admissão" name="data_admissao" value={data.data_admissao} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input type="date" label="Nascimento" name="data_nascimento" value={data.data_nascimento} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
            </Section>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              <div className="lg:col-span-3 space-y-6">
                <Section title="2. Dados Pessoais">
                  <Input className={`lg:col-span-2 ${isReadOnly ? 'pointer-events-none opacity-80' : ''}`} label="Nome Completo" name="nome" value={data.nome} onChange={onChange} />
                  <Input label="Apelido" name="apelido" value={data.apelido} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
                  <Input label="Nacionalidade" name="nacionalidade" value={data.nacionalidade} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
                  <Input className={`lg:col-span-2 ${isReadOnly ? 'pointer-events-none opacity-80' : ''}`} label="Nome do Pai" name="nome_pai" value={data.nome_pai} onChange={onChange} />
                  <Input className={`lg:col-span-2 ${isReadOnly ? 'pointer-events-none opacity-80' : ''}`} label="Nome da Mãe" name="nome_mae" value={data.nome_mae} onChange={onChange} />
                  <Input label="Naturalidade" name="naturalidade" value={data.naturalidade} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
                  <Select label="UF Natural" name="uf_naturalidade" options={UF_OPTIONS} value={data.uf_naturalidade} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
                  <Input label="Profissão" name="profissao" value={data.profissao} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
                </Section>
                <Section title="3. Trabalho e Contato">
                  <Input label="Local de Trabalho" name="local_trabalho" value={data.local_trabalho} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
                  <Input className={`lg:col-span-2 ${isReadOnly ? 'pointer-events-none opacity-80' : ''}`} label="Email" name="email" value={data.email} onChange={onChange} />
                  <Input label="Telefone" name="telefone" value={data.telefone} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
                </Section>
              </div>
              
              <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 flex flex-col items-center gap-4 shadow-sm h-fit">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foto do Sócio</h3>
                <div className="w-full max-w-[180px] aspect-square bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex items-center justify-center overflow-hidden relative group shadow-inner transition-all hover:border-blue-300">
                  {data.photoUrl ? (
                    <img src={data.photoUrl} className="w-full h-full object-cover" alt="Sócio" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-300 dark:text-slate-600">
                      <Upload size={32} />
                      <span className="text-[8px] font-bold uppercase tracking-tighter">{isReadOnly ? 'Sem Foto' : 'Clique p/ enviar'}</span>
                    </div>
                  )}
                  {!isReadOnly && (
                    <label className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity backdrop-blur-[2px]">
                      <Upload className="text-white" size={24} />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const reader = new FileReader();
                          reader.onloadend = () => onChange({ target: { name: 'photoUrl', value: reader.result as string } });
                          reader.readAsDataURL(f);
                        }
                      }} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <Section title="4. Localização Residencial">
              <Input className={`lg:col-span-2 ${isReadOnly ? 'pointer-events-none opacity-80' : ''}`} label="Endereço" name="endereco" value={data.endereco} onChange={onChange} />
              <Input label="Número" name="numero" value={data.numero} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input label="Bairro" name="bairro" value={data.bairro} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input label="Cidade" name="cidade" value={data.cidade} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Select label="UF" name="uf" options={UF_OPTIONS} value={data.uf} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input label="CEP" name="cep" value={data.cep} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
            </Section>
          </div>
        )}

        {tab === 'outros' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Section title="1. Documentação Civil">
              <Select label="Estado Civil" name="estado_civil" options={MARITAL_STATUS_OPTIONS} value={data.estado_civil} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Select label="Alfabetizado" name="alfabetizado" options={YES_NO_OPTIONS} value={data.alfabetizado} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input label="RG" name="rg" value={data.rg} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input label="Órgão Expedidor" name="orgao_expedidor_rg" value={data.orgao_expedidor_rg} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input type="date" label="Expedição RG" name="data_expedicao_rg" value={data.data_expedicao_rg} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input label="CPF" name="cpf" value={data.cpf} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input label="CTPS" name="ctps" value={data.ctps} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input label="Série CTPS" name="serie_ctps" value={data.serie_ctps} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input type="date" label="Expedição CTPS" name="data_expedicao_ctps" value={data.data_expedicao_ctps} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input label="Título de Eleitor" name="titulo_eleitor" value={data.titulo_eleitor} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input label="Zona" name="zona_eleitoral" value={data.zona_eleitoral} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input label="Seção" name="secao_eleitoral" value={data.secao_eleitoral} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input label="CAEPF" name="caepf" value={data.caepf} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
            </Section>

            <Section title="2. Dados Adicionais">
              <Select label="Sexo" name="sexo" options={SEX_OPTIONS} value={data.sexo} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input label="PIS" name="pis" value={data.pis} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input label="CEI" name="cei" value={data.cei} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input label="NIT" name="nit" value={data.nit} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input label="CIR" name="cir" value={data.cir} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input type="date" label="Emissão RGP" name="data_emissao_rgp" value={data.data_emissao_rgp} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
            </Section>

            <Section title="3. Dados da Embarcação">
              <Input className={`lg:col-span-2 ${isReadOnly ? 'pointer-events-none opacity-80' : ''}`} label="Embarcação" name="embarcacao" value={data.embarcacao} onChange={onChange} />
              <Input label="Embarcação RGP" name="embarcacao_rgp" value={data.embarcacao_rgp} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Select label="RGP UF" name="rgp_uf" options={UF_OPTIONS} value={data.rgp_uf} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input label="AB" name="ab" value={data.ab} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input label="Nº Tripulantes" name="numero_tripulantes" value={data.numero_tripulantes} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input label="CPF Proprietário" name="cpf_proprietario" value={data.cpf_proprietario} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
            </Section>
          </div>
        )}

        {tab === 'verso' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Section title="Arquivamento">
              <Input label="Pasta Associado" name="pasta_socios" value={data.pasta_socios} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input label="Pasta Embarcação" name="pasta_embarcacao" value={data.pasta_embarcacao} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input label="ID Defeso" name="id_defeso" value={data.id_defeso} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
              <Input label="Outros Documentos" name="outros_documentos" value={data.outros_documentos} onChange={onChange} className={isReadOnly ? 'pointer-events-none opacity-80' : ''} />
            </Section>

            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-[32px] shadow-sm overflow-hidden">
              <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border-b dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-sm font-black uppercase text-slate-700 dark:text-slate-200 flex items-center gap-2"><TableIcon size={18} /> Dependentes do Associado</h3>
                {!isReadOnly && (
                  <button onClick={() => onChange({ target: { name: 'dependents', value: [...(data.dependents || []), {id: Date.now().toString(), name: '', birthDate: '', relationship: ''}] } })} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest">+ Adicionar</button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                    <tr><th className="px-8 py-4 text-left">Nome Dependente</th><th className="px-8 py-4 text-left">Nascimento</th><th className="px-8 py-4 text-left">Parentesco</th>{!isReadOnly && <th className="px-8 py-4 text-right">Ação</th>}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(data.dependents || []).map(d => (
                      <tr key={d.id}>
                        <td className="px-6 py-3"><input className={`w-full p-2 bg-transparent focus:bg-white dark:focus:bg-slate-800 rounded border border-transparent focus:border-blue-200 outline-none text-slate-900 dark:text-white ${isReadOnly ? 'pointer-events-none' : ''}`} value={d.name} onChange={e => onChange({ target: { name: 'dependents', value: data.dependents.map(x => x.id === d.id ? {...x, name: e.target.value} : x) } })} /></td>
                        <td className="px-6 py-3"><input type="date" className={`w-full p-2 bg-transparent outline-none cursor-pointer text-slate-900 dark:text-white ${isReadOnly ? 'pointer-events-none' : ''}`} value={d.birthDate} onChange={e => onChange({ target: { name: 'dependents', value: data.dependents.map(x => x.id === d.id ? {...x, birthDate: e.target.value} : x) } })} /></td>
                        <td className="px-6 py-3"><input className={`w-full p-2 bg-transparent outline-none text-slate-900 dark:text-white ${isReadOnly ? 'pointer-events-none' : ''}`} value={d.relationship} onChange={e => onChange({ target: { name: 'dependents', value: data.dependents.map(x => x.id === d.id ? {...x, relationship: e.target.value} : x) } })} /></td>
                        {!isReadOnly && (
                          <td className="px-8 py-3 text-right"><button onClick={() => onChange({ target: { name: 'dependents', value: data.dependents.filter(x => x.id !== d.id) } })} className="text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={18} /></button></td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Section title="Observações">
              <TextArea className={`lg:col-span-4 ${isReadOnly ? 'pointer-events-none opacity-80' : ''}`} label="Anotações Gerais" name="observacao" value={data.observacao} onChange={onChange} placeholder="Histórico, pendências ou observações..." />
            </Section>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-32">
      {/* MODAL DE EDIÇÃO / INCLUSÃO */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[250] flex flex-col p-4 md:p-10 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-6xl mx-auto rounded-[48px] shadow-2xl overflow-hidden flex flex-col flex-1 border border-white/10">
            <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center gap-6">
                <div className={`p-4 rounded-[24px] text-white shadow-xl ${modalMode === 'add' ? 'bg-blue-600 shadow-blue-600/20' : 'bg-emerald-600 shadow-emerald-600/20'}`}>
                  {modalMode === 'add' ? <UserPlus size={24} /> : <Edit3 size={24} />}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                    {modalMode === 'add' ? 'Incluir Novo Sócio' : `Editando: ${formMember.nome || 'Associado'}`}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Preencha os dados abaixo com atenção
                  </p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-all">
                <X size={24} />
              </button>
            </header>

            <div className="p-8 flex-1 overflow-y-auto scrollbar-hide">
              <div className="flex gap-1 bg-slate-200/50 dark:bg-slate-900/50 p-1.5 rounded-2xl w-fit border border-slate-200 dark:border-slate-800 mb-8 mx-auto">
                {(['frente', 'outros', 'verso'] as TabType[]).map((tab) => (
                  <button key={tab} onClick={() => setActiveModalTab(tab)} className={`px-12 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeModalTab === tab ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md border border-slate-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                    {tab}
                  </button>
                ))}
              </div>
              {renderMemberForm(formMember, handleFormChange, false)}
            </div>

            <footer className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-4">
              <button onClick={() => setIsEditModalOpen(false)} className="px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Cancelar</button>
              <button onClick={handleSave} className="bg-emerald-600 text-white px-12 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:-translate-y-1 transition-all shadow-xl shadow-emerald-600/20">
                <Save size={18} /> Salvar Alterações
              </button>
            </footer>
          </div>
        </div>
      )}

      {isDocModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/10">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">Gerar Documento</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Selecione o modelo para: <span className="text-blue-600">{currentMember.nome || 'Novo'}</span></p>
              </div>
              <button onClick={() => setIsDocModalOpen(false)} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-3">
              {(templates || []).length > 0 ? templates.map(t => (
                <button 
                  key={t.id}
                  onClick={() => generateMemberDoc(t)}
                  className="w-full flex items-center justify-between p-5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-600 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 group-hover:border-blue-200 group-hover:text-blue-600 transition-colors">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{t.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.category || 'Secretaria'}</p>
                    </div>
                  </div>
                  <Download size={18} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                </button>
              )) : (
                <div className="py-12 text-center text-slate-300">Nenhum modelo disponível.</div>
              )}
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button onClick={() => setIsDocModalOpen(false)} className="px-8 py-3 rounded-xl text-[10px] font-black uppercase text-slate-400">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER DE PESQUISA E NAVEGAÇÃO */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm relative z-[60]">
        <div className="md:col-span-3 flex items-center gap-4 pl-4">
          <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-600/20">
            <UserPlus size={18} />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Sócios</h2>
        </div>

        <div className="md:col-span-6 relative" ref={searchRef}>
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Pesquisar por Código ou Nome..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 pl-14 pr-6 text-xs font-bold uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 text-slate-900 dark:text-white transition-all"
            />
          </div>

          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-72 overflow-y-auto">
                {filteredSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0 group"
                  >
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:text-blue-600 transition-colors">
                      <UserIcon size={16} />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">{suggestion.nome}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Código: {suggestion.codigo_socio || 'Pendente'}</span>
                    </div>
                    <ChevronRight size={14} className="ml-auto text-slate-300 group-hover:text-blue-600 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-3 flex justify-end items-center gap-2 pr-2">
          <button onClick={() => navigate('prev')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"><ChevronLeft size={20} /></button>
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            {currentIndex + 1} / {(members || []).length}
          </div>
          <button onClick={() => navigate('next')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"><ChevronRight size={20} /></button>
          <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border ml-2 ${currentMember.situacao === 'Ativo' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
            {currentMember.situacao || 'STATUS'}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-slate-200/50 dark:bg-slate-900/50 p-1 rounded-2xl w-fit border border-slate-200 dark:border-slate-800">
          {(['frente', 'outros', 'verso'] as TabType[]).map((tab) => (
            <button key={tab} onClick={() => setActiveViewTab(tab)} className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeViewTab === tab ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
              {tab}
            </button>
          ))}
        </div>
        
        <div className="bg-blue-50/50 dark:bg-blue-900/10 px-6 py-3 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-3">
          <Eye size={16} className="text-blue-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Modo Visualização</span>
        </div>
      </div>

      {/* VIEW PRINCIPAL (READ-ONLY) */}
      <div className="mt-8 bg-slate-50/30 dark:bg-slate-900/30 p-2 rounded-[40px] border border-slate-100 dark:border-slate-800/50">
        {renderMemberForm(currentMember, () => {}, true)}
      </div>

      {/* FOOTER DE AÇÕES */}
      <footer className="fixed bottom-0 left-0 lg:left-[360px] right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 p-6 z-[100] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={handleOpenAdd} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:-translate-y-1 transition-all shadow-lg shadow-blue-600/20">
            <UserPlus size={18} /> Incluir Novo
          </button>
          <button onClick={handleOpenEdit} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:-translate-y-1 transition-all shadow-lg shadow-emerald-600/20">
            <Edit3 size={18} /> Editar Cadastro
          </button>
          <button onClick={() => setIsDocModalOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-700 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:-translate-y-1 transition-all shadow-lg shadow-slate-900/20">
            <FileSignature size={18} /> Gerar Documento
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} title="Imprimir" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 p-4 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"><Printer size={20} /></button>
          <button onClick={() => { if(confirm('Excluir este sócio permanentemente?')) deleteMember(currentIndex); }} title="Excluir" className="bg-red-50 dark:bg-red-900/20 text-red-500 p-4 rounded-2xl border border-red-100 dark:border-red-900 hover:bg-red-100 transition-all"><Trash2 size={20} /></button>
        </div>
      </footer>
    </div>
  );
};
