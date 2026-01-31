
import React, { useState, useRef, useEffect } from 'react';
import { 
  UserPlus, Save, Trash2, ChevronLeft, ChevronRight, 
  Upload, Printer, X, FileSignature, Table as TableIcon,
  FileText, Download, Check, Search, User as UserIcon
} from 'lucide-react';
import { Member, TabType, DocumentTemplate } from '../types';
import { useApp } from '../AppContext';
import { 
  UF_OPTIONS, MARITAL_STATUS_OPTIONS, BLOOD_TYPE_OPTIONS, 
  CATEGORY_OPTIONS, YES_NO_OPTIONS, SEX_OPTIONS, STATUS_OPTIONS,
  EMPTY_MEMBER 
} from '../constants';
import { Input, Select, TextArea } from '../components/FormField';
import { Section } from '../components/Section';

export const SociosView: React.FC = () => {
  const { members, addMember, updateMember, deleteMember, templates } = useApp();
  const [currentIndex, setCurrentIndex] = useState(members.length > 0 ? 0 : -1);
  const [currentMember, setCurrentMember] = useState<Member>(currentIndex >= 0 ? members[currentIndex] : EMPTY_MEMBER);
  const [activeTab, setActiveTab] = useState<TabType>('frente');
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  
  // Estados para Busca/Autocomplete
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentMember(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!currentMember.fullName) return alert("Nome completo é obrigatório.");
    if (currentIndex === -1) {
      addMember(currentMember);
      setCurrentIndex(members.length);
    } else {
      updateMember(currentIndex, currentMember);
    }
    alert("Dados salvos com sucesso!");
  };

  const handleNew = () => {
    setCurrentMember({ ...EMPTY_MEMBER, id: crypto.randomUUID(), registration: '', fullName: '' });
    setCurrentIndex(-1);
    setActiveTab('frente');
  };

  const navigate = (dir: 'prev' | 'next') => {
    if (members.length === 0) return;
    let nextIdx = dir === 'prev' 
      ? (currentIndex > 0 ? currentIndex - 1 : members.length - 1)
      : (currentIndex < members.length - 1 ? currentIndex + 1 : 0);
    setCurrentIndex(nextIdx);
    setCurrentMember(members[nextIdx]);
  };

  const handleSelectSuggestion = (member: Member) => {
    const idx = members.findIndex(m => m.id === member.id);
    if (idx !== -1) {
      setCurrentIndex(idx);
      setCurrentMember(members[idx]);
      setSearchTerm('');
      setShowSuggestions(false);
    }
  };

  const filteredSuggestions = searchTerm.trim() === '' ? [] : members.filter(m => 
    m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.registration.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 8);

  const generateMemberDoc = (template: DocumentTemplate) => {
    const replacements: Record<string, string> = {
      '{{nome}}': currentMember.fullName || '____________________',
      '{{cpf}}': currentMember.cpf || '____________________',
      '{{rg}}': currentMember.rg || '____________________',
      '{{cidade}}': currentMember.city || '____________________',
      '{{inscricao}}': currentMember.registration || '____________________',
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
          <title>${template.name} - ${currentMember.fullName}</title>
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
            <div style="font-size: 10px; font-weight: bold;">${currentMember.fullName}</div>
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-32">
      {/* Modal de Documentos oculto por brevidade */}
      {isDocModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Gerar Documento</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Selecione o modelo para: <span className="text-blue-600">{currentMember.fullName || 'Novo'}</span></p>
              </div>
              <button onClick={() => setIsDocModalOpen(false)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto space-y-3">
              {templates.length > 0 ? templates.map(t => (
                <button 
                  key={t.id}
                  onClick={() => generateMemberDoc(t)}
                  className="w-full flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-blue-600 hover:bg-blue-50/30 transition-all text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 group-hover:border-blue-200 group-hover:text-blue-600 transition-colors">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{t.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.category || 'Secretaria'}</p>
                    </div>
                  </div>
                  <Download size={18} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                </button>
              )) : (
                <div className="py-12 text-center text-slate-300">Nenhum modelo disponível.</div>
              )}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setIsDocModalOpen(false)} className="px-8 py-3 rounded-xl text-[10px] font-black uppercase text-slate-400">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Barra de Busca e Navegação Superior */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white p-4 rounded-[32px] border border-slate-200 shadow-sm relative z-[60]">
        {/* Título */}
        <div className="md:col-span-3 flex items-center gap-4 pl-4">
          <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-600/20">
            <UserPlus size={18} />
          </div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Sócios</h2>
        </div>

        {/* Autocomplete de Busca */}
        <div className="md:col-span-6 relative" ref={searchRef}>
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Pesquisar por Inscrição ou Nome do Sócio..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-14 pr-6 text-xs font-bold uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all"
            />
          </div>

          {/* Lista de Sugestões */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-72 overflow-y-auto">
                {filteredSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0 group"
                  >
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-400 group-hover:bg-white group-hover:text-blue-600 transition-colors">
                      <UserIcon size={16} />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{suggestion.fullName}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Inscrição: {suggestion.registration || 'Pendente'}</span>
                    </div>
                    <ChevronRight size={14} className="ml-auto text-slate-300 group-hover:text-blue-600 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navegação de Registros */}
        <div className="md:col-span-3 flex justify-end items-center gap-2 pr-2">
          <button onClick={() => navigate('prev')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><ChevronLeft size={20} /></button>
          <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest">
            {currentIndex + 1} / {members.length}
          </div>
          <button onClick={() => navigate('next')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"><ChevronRight size={20} /></button>
          <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border ml-2 ${currentMember.status === 'Ativo' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
            {currentMember.status || 'STATUS'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-200/50 p-1 rounded-2xl w-fit border border-slate-200">
        {(['frente', 'outros', 'verso'] as TabType[]).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {activeTab === 'frente' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Section title="1. Identificação Administrativa">
              <Input label="Inscrição" name="registration" value={currentMember.registration} onChange={handleInputChange} />
              <Input label="Inscrição Antiga" name="oldRegistration" value={currentMember.oldRegistration} onChange={handleInputChange} />
              <Input label="Localidade" name="locality" value={currentMember.locality} onChange={handleInputChange} />
              <Input type="date" label="Data Recadastramento" name="reRegistrationDate" value={currentMember.reRegistrationDate} onChange={handleInputChange} />
              <Input type="date" label="Data Cadastro" name="registrationDate" value={currentMember.registrationDate} onChange={handleInputChange} />
              <Input type="date" label="Data Nascimento" name="birthDate" value={currentMember.birthDate} onChange={handleInputChange} />
            </Section>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              <div className="lg:col-span-3 space-y-6">
                <Section title="2. Dados Pessoais">
                  <Input className="lg:col-span-2" label="Nome Completo" name="fullName" value={currentMember.fullName} onChange={handleInputChange} />
                  <Input label="Apelido" name="nickname" value={currentMember.nickname} onChange={handleInputChange} />
                  <Input label="Nacionalidade" name="nationality" value={currentMember.nationality} onChange={handleInputChange} />
                  <Input className="lg:col-span-2" label="Nome do Pai" name="fatherName" value={currentMember.fatherName} onChange={handleInputChange} />
                  <Input className="lg:col-span-2" label="Nome da Mãe" name="motherName" value={currentMember.motherName} onChange={handleInputChange} />
                  <Input label="Naturalidade" name="naturalness" value={currentMember.naturalness} onChange={handleInputChange} />
                  <Select label="UF" name="uf" options={UF_OPTIONS} value={currentMember.uf} onChange={handleInputChange} />
                  <Input label="Profissão" name="profession" value={currentMember.profession} onChange={handleInputChange} />
                </Section>
                <Section title="3. Trabalho e Contato">
                  <Input label="Local de Trabalho" name="workplace" value={currentMember.workplace} onChange={handleInputChange} />
                  <Input className="lg:col-span-2" label="Email" name="email" value={currentMember.email} onChange={handleInputChange} />
                  <Input label="Telefone" name="phone" value={currentMember.phone} onChange={handleInputChange} />
                </Section>
              </div>
              
              <div className="lg:col-span-1 bg-white border border-slate-200 rounded-[32px] p-6 flex flex-col items-center gap-4 shadow-sm h-fit lg:sticky lg:top-28">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foto do Sócio</h3>
                <div className="w-full max-w-[180px] aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center overflow-hidden relative group shadow-inner transition-all hover:border-blue-300">
                  {currentMember.photoUrl ? (
                    <img src={currentMember.photoUrl} className="w-full h-full object-cover" alt="Sócio" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-300">
                      <Upload size={32} />
                      <span className="text-[8px] font-bold uppercase tracking-tighter">Clique p/ enviar</span>
                    </div>
                  )}
                  <label className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity backdrop-blur-[2px]">
                    <Upload className="text-white" size={24} />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const reader = new FileReader();
                        reader.onloadend = () => setCurrentMember(p => ({...p, photoUrl: reader.result as string}));
                        reader.readAsDataURL(f);
                      }
                    }} />
                  </label>
                  {currentMember.photoUrl && (
                    <button 
                      onClick={() => setCurrentMember(p => ({...p, photoUrl: ''}))}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <Section title="4. Localização Residencial">
              <Input className="lg:col-span-2" label="Logradouro" name="street" value={currentMember.street} onChange={handleInputChange} />
              <Input label="Número" name="number" value={currentMember.number} onChange={handleInputChange} />
              <Input label="Bairro/Distrito" name="neighborhood" value={currentMember.neighborhood} onChange={handleInputChange} />
              <Input label="Cidade" name="city" value={currentMember.city} onChange={handleInputChange} />
              <Select label="UF" name="addressUf" options={UF_OPTIONS} value={currentMember.addressUf} onChange={handleInputChange} />
              <Input label="CEP" name="cep" value={currentMember.cep} onChange={handleInputChange} />
            </Section>

            <Section title="5. Outras Informações">
              <Input label="Nº DAP" name="dapNumber" value={currentMember.dapNumber} onChange={handleInputChange} />
              <Input label="Grupo" name="group" value={currentMember.group} onChange={handleInputChange} />
              <Input type="date" label="Validade" name="validityDate" value={currentMember.validityDate} onChange={handleInputChange} />
              <Select label="Categoria" name="category" options={CATEGORY_OPTIONS} value={currentMember.category} onChange={handleInputChange} />
              <Input label="SUS" name="sus" value={currentMember.sus} onChange={handleInputChange} />
              <Select label="Fator Sanguíneo" name="bloodType" options={BLOOD_TYPE_OPTIONS} value={currentMember.bloodType} onChange={handleInputChange} />
            </Section>
          </div>
        )}

        {activeTab === 'outros' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Section title="1. Documentação Civil">
              <Select label="Estado Civil" name="maritalStatus" options={MARITAL_STATUS_OPTIONS} value={currentMember.maritalStatus} onChange={handleInputChange} />
              <Select label="Alfabetizado" name="literate" options={YES_NO_OPTIONS} value={currentMember.literate} onChange={handleInputChange} />
              <Input label="RG" name="rg" value={currentMember.rg} onChange={handleInputChange} />
              <Select label="UF RG" name="rgUf" options={UF_OPTIONS} value={currentMember.rgUf} onChange={handleInputChange} />
              <Input type="date" label="Expedição RG" name="rgExpeditionDate" value={currentMember.rgExpeditionDate} onChange={handleInputChange} />
              <Input label="CPF" name="cpf" value={currentMember.cpf} onChange={handleInputChange} />
              <Input label="CTPS" name="ctps" value={currentMember.ctps} onChange={handleInputChange} />
              <Input label="Série CTPS" name="ctpsSeries" value={currentMember.ctpsSeries} onChange={handleInputChange} />
              <Input type="date" label="Expedição CTPS" name="ctpsExpeditionDate" value={currentMember.ctpsExpeditionDate} onChange={handleInputChange} />
              <Input label="Título de Eleitor" name="voterId" value={currentMember.voterId} onChange={handleInputChange} />
              <Input label="Zona" name="voterZone" value={currentMember.voterZone} onChange={handleInputChange} />
              <Input label="Seção" name="voterSection" value={currentMember.voterSection} onChange={handleInputChange} />
              <Input label="CAEPF" name="caepf" value={currentMember.caepf} onChange={handleInputChange} />
            </Section>

            <Section title="2. Documentos Complementares">
              <Select label="Sexo" name="sex" options={SEX_OPTIONS} value={currentMember.sex} onChange={handleInputChange} />
              <Input label="PIS" name="pis" value={currentMember.pis} onChange={handleInputChange} />
              <Input label="CEI" name="cei" value={currentMember.cei} onChange={handleInputChange} />
              <Input label="NIT" name="nit" value={currentMember.nit} onChange={handleInputChange} />
              <Input label="RGP (M.M.A.)" name="rgpMma" value={currentMember.rgpMma} onChange={handleInputChange} />
              <Input type="date" label="Emissão RGP" name="rgpEmissionDate" value={currentMember.rgpEmissionDate} onChange={handleInputChange} />
            </Section>

            <Section title="3. Dados da Embarcação">
              <Input className="lg:col-span-2" label="Nome da Embarcação" name="boatName" value={currentMember.boatName} onChange={handleInputChange} />
              <Input label="Nº RGP" name="boatRgp" value={currentMember.boatRgp} onChange={handleInputChange} />
              <Select label="UF Embarcação" name="boatUf" options={UF_OPTIONS} value={currentMember.boatUf} onChange={handleInputChange} />
              <Input label="AB" name="boatAb" value={currentMember.boatAb} onChange={handleInputChange} />
              <Input label="Nº Tripulantes" name="boatCrewCount" value={currentMember.boatCrewCount} onChange={handleInputChange} />
              <Input label="CPF Proprietário" name="ownerCpf" value={currentMember.ownerCpf} onChange={handleInputChange} />
            </Section>

            <Section title="4. Controle da Situação">
              <Select label="Situação" name="status" options={STATUS_OPTIONS} value={currentMember.status} onChange={handleInputChange} />
              <Input label="Último Mês Pago" name="lastMonthPaid" value={currentMember.lastMonthPaid} onChange={handleInputChange} />
              <Input label="Nº Benefício" name="benefitNumber" value={currentMember.benefitNumber} onChange={handleInputChange} />
              <Input label="Espécie" name="species" value={currentMember.species} onChange={handleInputChange} />
              <Input type="date" label="Falecimento" name="deathDate" value={currentMember.deathDate} onChange={handleInputChange} />
              <Input type="date" label="Transferência" name="transferDate" value={currentMember.transferDate} onChange={handleInputChange} />
              <Input label="Situação MPA" name="mpaStatus" value={currentMember.mpaStatus} onChange={handleInputChange} />
              <Input label="Código GPS" name="gpsCode" value={currentMember.gpsCode} onChange={handleInputChange} />
              <Input label="Senha INSS" name="inssPassword" value={currentMember.inssPassword} onChange={handleInputChange} />
            </Section>
          </div>
        )}

        {activeTab === 'verso' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Section title="Arquivamento">
              <Input label="Nº Pasta Associado" name="associateFolder" value={currentMember.associateFolder} onChange={handleInputChange} />
              <Input label="Nº Pasta Embarcação" name="boatFolder" value={currentMember.boatFolder} onChange={handleInputChange} />
              <Input label="Pescado Defesa" name="defenseFish" value={currentMember.defenseFish} onChange={handleInputChange} />
              <Input label="Outros Documentos" name="otherDocs" value={currentMember.otherDocs} onChange={handleInputChange} />
            </Section>

            <div className="bg-white border rounded-[32px] shadow-sm overflow-hidden">
              <div className="p-8 bg-slate-50 border-b flex justify-between items-center">
                <h3 className="text-sm font-black uppercase text-slate-700 flex items-center gap-2"><TableIcon size={18} /> Dependentes do Associado</h3>
                <button onClick={() => setCurrentMember(p => ({...p, dependents: [...p.dependents, {id: Date.now().toString(), name: '', birthDate: '', relationship: ''}]}))} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest">+ Adicionar</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b text-[9px] font-black uppercase text-slate-400">
                    <tr><th className="px-8 py-4 text-left">Nome Dependente</th><th className="px-8 py-4 text-left">Nascimento</th><th className="px-8 py-4 text-left">Parentesco</th><th className="px-8 py-4 text-right">Ação</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentMember.dependents.map(d => (
                      <tr key={d.id}>
                        <td className="px-6 py-3"><input className="w-full p-2 bg-transparent focus:bg-white rounded border border-transparent focus:border-blue-200 outline-none" value={d.name} onChange={e => setCurrentMember(p => ({...p, dependents: p.dependents.map(x => x.id === d.id ? {...x, name: e.target.value} : x)}))} /></td>
                        <td className="px-6 py-3">
                          <input 
                            type="date" 
                            className="w-full p-2 bg-transparent outline-none cursor-pointer" 
                            value={d.birthDate} 
                            onChange={e => setCurrentMember(p => ({...p, dependents: p.dependents.map(x => x.id === d.id ? {...x, birthDate: e.target.value} : x)}))} 
                          />
                        </td>
                        <td className="px-6 py-3"><input className="w-full p-2 bg-transparent outline-none" value={d.relationship} onChange={e => setCurrentMember(p => ({...p, dependents: p.dependents.map(x => x.id === d.id ? {...x, relationship: e.target.value} : x)}))} /></td>
                        <td className="px-8 py-3 text-right"><button onClick={() => setCurrentMember(p => ({...p, dependents: p.dependents.filter(x => x.id !== d.id)}))} className="text-red-400 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button></td>
                      </tr>
                    ))}
                    {currentMember.dependents.length === 0 && <tr><td colSpan={4} className="px-8 py-12 text-center text-slate-400 italic">Nenhum dependente cadastrado.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <Section title="Observações Administrativas">
              <TextArea className="lg:col-span-4" label="Anotações Gerais" name="observations" value={currentMember.observations} onChange={handleInputChange} placeholder="Descreva aqui o histórico do sócio, pendências ou informações relevantes..." />
            </Section>
          </div>
        )}
      </div>

      <footer className="fixed bottom-0 left-0 lg:left-[360px] right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 p-6 z-[100] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={handleNew} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:-translate-y-1 transition-all shadow-lg shadow-blue-600/20"><UserPlus size={18} /> Incluir</button>
          <button onClick={handleSave} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:-translate-y-1 transition-all shadow-lg shadow-emerald-600/20"><Save size={18} /> Salvar</button>
          <button onClick={() => setIsDocModalOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:-translate-y-1 transition-all shadow-lg shadow-slate-900/20"><FileSignature size={18} /> Gerar Documento</button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} title="Imprimir Ficha" className="bg-slate-100 text-slate-600 p-4 rounded-2xl hover:bg-slate-200 transition-all"><Printer size={20} /></button>
          <button onClick={() => { if(confirm('Excluir este sócio?')) deleteMember(currentIndex); }} title="Excluir Registro" className="bg-red-50 text-red-500 p-4 rounded-2xl border border-red-100 hover:bg-red-100 transition-all"><Trash2 size={20} /></button>
        </div>
      </footer>
    </div>
  );
};
