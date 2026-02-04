
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  UserPlus, Save, Trash2, ChevronLeft, ChevronRight, 
  Upload, Printer, X, FileSignature, Table as TableIcon,
  FileText, Download, Search, User as UserIcon, Edit3, Eye,
  ArrowLeft, FileDown, Loader2
} from 'lucide-react';
import { Member, TabType, DocumentTemplate } from '../types';
import { useApp } from '../AppContext';
import { useNavigation } from '../NavigationContext';
import { 
  UF_OPTIONS, MARITAL_STATUS_OPTIONS, BLOOD_TYPE_OPTIONS, 
  SEX_OPTIONS, STATUS_OPTIONS, YES_NO_OPTIONS,
  EMPTY_MEMBER 
} from '../constants';
import { Input, Select, TextArea } from '../components/FormField';
import { Section } from '../components/Section';

export const SociosView: React.FC = () => {
  const { members, deleteMember, templates, session, saveReceipt, getTenantDetails } = useApp();
  const { setMemberModalOpen, setMemberModalMode, setSelectedMemberId } = useNavigation();
  
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentMember, setCurrentMember] = useState<Member>(EMPTY_MEMBER);
  const [activeViewTab, setActiveViewTab] = useState<TabType>('frente');
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  // Estados para Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (viewMode === 'details' && currentIndex >= 0 && members[currentIndex]) {
      setCurrentMember(members[currentIndex]);
    }
  }, [members, currentIndex, viewMode]);

  const handleOpenAdd = () => {
    setMemberModalMode('add');
    setSelectedMemberId(null);
    setMemberModalOpen(true);
  };

  const handleOpenEdit = () => {
    if (currentIndex === -1) return alert("Nenhum sócio selecionado para editar.");
    setMemberModalMode('edit');
    setSelectedMemberId(currentMember.id);
    setMemberModalOpen(true);
  };

  const navigate = (dir: 'prev' | 'next') => {
    const list = members || [];
    if (list.length === 0) return;
    let nextIdx = dir === 'prev' 
      ? (currentIndex > 0 ? currentIndex - 1 : list.length - 1)
      : (currentIndex < list.length - 1 ? currentIndex + 1 : 0);
    setCurrentIndex(nextIdx);
  };

  const handleExibirSocio = (index: number) => {
    setCurrentIndex(index);
    setViewMode('details');
  };

  const filteredMembers = useMemo(() => {
    return (members || []).filter(m => 
      (m.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (m.codigo_socio || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [members, searchTerm]);

  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMembers, currentPage]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);

  const generateFullListPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const now = new Date().toLocaleString('pt-BR');
    
    const html = `
      <html>
        <head>
          <title>Relatório de Associados</title>
          <style>
            @page { size: A4; margin: 1.5cm; }
            body { font-family: 'Inter', sans-serif; color: #1e293b; line-height: 1.5; }
            .header { border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .header-info h1 { margin: 0; font-size: 16px; text-transform: uppercase; color: #0f172a; }
            .header-info p { margin: 2px 0 0 0; font-size: 9px; color: #64748b; font-weight: bold; text-transform: uppercase; }
            .meta { text-align: right; font-size: 8px; color: #94a3b8; font-weight: bold; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
            th { background: #f8fafc; padding: 10px 8px; text-align: left; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; color: #475569; font-weight: 800; }
            td { padding: 8px; border-bottom: 1px solid #f1f5f9; }
            .badge { padding: 2px 6px; border-radius: 4px; background: #f1f5f9; font-size: 8px; font-weight: 800; text-transform: uppercase; }
            .footer { margin-top: 30px; text-align: center; font-size: 8px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-info">
              <h1>Relatório de Associados</h1>
              <p>Unidade: ${session.user?.cityName || 'SGA Global'} | Operador: ${session.user?.username}</p>
            </div>
            <div class="meta">
              Gerado em: ${now}<br>
              Total de Registros: ${filteredMembers.length}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 80px;">Matrícula</th>
                <th>Nome do Associado</th>
                <th style="width: 120px;">CPF</th>
                <th style="width: 100px;">Situação</th>
              </tr>
            </thead>
            <tbody>
              ${filteredMembers.map(m => `
                <tr>
                  <td style="font-weight: bold; color: #2563eb;">${m.codigo_socio || '---'}</td>
                  <td style="text-transform: uppercase; font-weight: 500;">${m.nome}</td>
                  <td style="font-family: monospace;">${m.cpf || '---'}</td>
                  <td><span class="badge">${m.situacao || 'ATIVO'}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">SGA - Sistema de Gestão de Associados | Orbio Tech &copy; 2026</div>
          <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); };</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const generateMemberDoc = async (template: DocumentTemplate) => {
    setIsGenerating(true);
    
    const receiptNum = await saveReceipt({
      member_id: currentMember.id,
      template_id: template.id,
      template_name: template.name,
      member_name: currentMember.nome,
      content_snapshot: template.content
    });

    // Busca detalhes da unidade para pegar mensalidade e filiação configurados com os NOVOS NOMES DE CAMPO
    let monthlyFee = '0,00';
    let affiliationFee = '0,00';
    if (session.user?.tenantId) {
      try {
        const details = await getTenantDetails(session.user.tenantId);
        if (details) {
          monthlyFee = details.valor_mensalidade || '0,00';
          affiliationFee = details.valor_filiacao || '0,00';
        }
      } catch (e) { console.error("Erro ao buscar detalhes da unidade para o recibo", e); }
    }

    const now = new Date();
    // Colocando os valores em negrito (HTML <b>) para que se destaquem no texto do recibo
    const replacements: Record<string, string> = {
      '{{nome}}': `<b>${currentMember.nome || '____________________'}</b>`,
      '{{cpf}}': `<b>${currentMember.cpf || '____________________'}</b>`,
      '{{rg}}': `<b>${currentMember.rg || '____________________'}</b>`,
      '{{cidade}}': `<b>${currentMember.cidade || '____________________'}</b>`,
      '{{inscricao}}': `<b>${currentMember.codigo_socio || '____________________'}</b>`,
      '{{hoje}}': `<b>${now.toLocaleDateString('pt-BR')}</b>`,
      '{{dia_semana}}': `<b>${now.toLocaleDateString('pt-BR', { weekday: 'long' })}</b>`,
      '{{num_recibo}}': `<b>${receiptNum ? String(receiptNum).padStart(6, '0') : '______'}</b>`,
      '{{vlr_mensalidade}}': `<b>R$ ${monthlyFee}</b>`,
      '{{vlr_filiacao}}': `<b>R$ ${affiliationFee}</b>`
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
    if (!printWindow) {
      setIsGenerating(false);
      return;
    }

    const isThermal = template.printFormat === 'THERMAL';

    const html = `
      <html>
        <head>
          <title>${template.name} - ${currentMember.nome}</title>
          <style>
            @page { 
              /* Se for térmico, deixamos a altura como auto para o driver da impressora cortar no fim */
              size: ${isThermal ? '80mm auto' : 'A4'}; 
              margin: ${isThermal ? '2mm' : '2cm'}; 
            }
            body { 
              font-family: ${isThermal ? '"Courier New", Courier, monospace' : '"Serif", "Times New Roman"'}; 
              line-height: 1.3; 
              color: #000; 
              margin: 0;
              padding: ${isThermal ? '5px' : '0'};
              width: ${isThermal ? '74mm' : 'auto'};
            }
            .header { text-align: center; margin-bottom: 10px; font-weight: bold; text-transform: uppercase; font-size: ${isThermal ? '9px' : '11px'}; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .title { text-align: center; margin-bottom: 15px; font-weight: bold; text-decoration: underline; text-transform: uppercase; font-size: ${isThermal ? '10px' : '14px'}; }
            .content { text-align: justify; margin-bottom: 20px; white-space: pre-wrap; font-size: ${isThermal ? '9px' : '12px'}; }
            .footer { text-align: center; margin-top: 10px; font-size: ${isThermal ? '8px' : '11px'}; font-style: italic; }
            .signature { margin-top: ${isThermal ? '20px' : '60px'}; text-align: center; }
            .signature-line { border-top: 1px solid #000; width: ${isThermal ? '100%' : '300px'}; margin: 0 auto 3px auto; }
            b { font-weight: 900; }
          </style>
        </head>
        <body>
          <div class="header">${filledHeader.replace(/\n/g, '<br>')}</div>
          <div class="divider"></div>
          <div class="title">${template.name} Nº ${replacements['{{num_recibo}}']}</div>
          <div class="content">${filledContent}</div>
          <div class="footer">${filledFooter.replace(/\n/g, '<br>')}</div>
          <div class="signature">
            <div class="signature-line"></div>
            <div style="font-size: 9px; font-weight: bold;">RECEBEDOR</div>
          </div>
          <script>window.onload = () => { window.print(); setTimeout(() => window.close(), 500); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    setIsDocModalOpen(false);
    setIsGenerating(false);
  };

  const renderMemberView = (data: Member) => {
    const tab = activeViewTab;
    const readOnlyClass = 'pointer-events-none opacity-80';
    
    return (
      <div className="space-y-8">
        {tab === 'frente' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Section title="Identificação">
              <Input label="Inscrição" name="codigo_socio" value={data.codigo_socio} onChange={()=>{}} className={readOnlyClass} />
              <Input label="Insc. Antiga" name="codigo_antigo" value={data.codigo_antigo} onChange={()=>{}} className={readOnlyClass} />
              <Select label="Localidade" name="codigo_comunidade" options={['BAIRRO PORTELINHA', 'CENTRO', 'RURAL']} value={data.codigo_comunidade} onChange={()=>{}} className={readOnlyClass} />
              <Input type="date" label="Dt. Recadastr." name="recadastro" value={data.recadastro} onChange={()=>{}} className={readOnlyClass} />
              <Input type="date" label="Dt. Cadastro" name="data_admissao" value={data.data_admissao} onChange={()=>{}} className={readOnlyClass} />
            </Section>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              <div className="lg:col-span-3 space-y-6">
                <Section title="Dados do Sócio">
                  <Input className={`lg:col-span-2 ${readOnlyClass}`} label="Nome" name="nome" value={data.nome} onChange={()=>{}} />
                  <Input label="Apelido" name="apelido" value={data.apelido} onChange={()=>{}} className={readOnlyClass} />
                  <Input type="date" label="Dt. Nasc." name="data_nascimento" value={data.data_nascimento} onChange={()=>{}} className={readOnlyClass} />
                  <Input className={`lg:col-span-2 ${readOnlyClass}`} label="Pai" name="nome_pai" value={data.nome_pai} onChange={()=>{}} />
                  <Input className={`lg:col-span-2 ${readOnlyClass}`} label="Mãe" name="nome_mae" value={data.nome_mae} onChange={()=>{}} />
                  <Input label="Nacionalidade" name="nacionalidade" value={data.nacionalidade} onChange={()=>{}} className={readOnlyClass} />
                  <Input label="Naturalidade" name="naturalidade" value={data.naturalidade} onChange={()=>{}} className={readOnlyClass} />
                  <Select label="UF" name="uf_naturalidade" options={UF_OPTIONS} value={data.uf_naturalidade} onChange={()=>{}} className={readOnlyClass} />
                  <Input className={`lg:col-span-2 ${readOnlyClass}`} label="Profissão" name="profissao" value={data.profissao} onChange={()=>{}} />
                </Section>
                <Section title="Local de Trabalho e Email">
                  <Input className={`lg:col-span-2 ${readOnlyClass}`} label="Local de Trabalho" name="local_trabalho" value={data.local_trabalho} onChange={()=>{}} />
                  <Input className={`lg:col-span-2 ${readOnlyClass}`} label="Email" name="email" value={data.email} onChange={()=>{}} />
                </Section>
              </div>
              
              <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 flex flex-col items-center gap-4 shadow-sm h-[400px]">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foto do Titular</h3>
                <div className="w-full max-w-[300px] aspect-square bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex items-center justify-center overflow-hidden relative group shadow-inner">
                  {data.photoUrl ? (
                    <img src={data.photoUrl} className="w-full h-full object-cover" alt="Sócio" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-300">
                      <UserIcon size={32} />
                      <span className="text-[8px] font-bold uppercase">Sem Foto</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Section title="Endereço">
              <Input className={`lg:col-span-2 ${readOnlyClass}`} label="Logradouro" name="endereco" value={data.endereco} onChange={()=>{}} />
              <Input label="Número" name="numero" value={data.numero} onChange={()=>{}} className={readOnlyClass} />
              <Input label="Bairro\Distrito" name="bairro" value={data.bairro} onChange={()=>{}} className={readOnlyClass} />
              <Input label="Cidade" name="cidade" value={data.cidade} onChange={()=>{}} className={readOnlyClass} />
              <Select label="UF" name="uf" options={UF_OPTIONS} value={data.uf} onChange={()=>{}} className={readOnlyClass} />
              <Input label="CEP" name="cep" value={data.cep} onChange={()=>{}} className={readOnlyClass} />
              <Input label="Telefone" name="telefone" value={data.telefone} onChange={()=>{}} className={readOnlyClass} />
            </Section>
          </div>
        )}

        {tab === 'outros' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Section title="Outros Dados">
              <Select label="Estado Civil" name="estado_civil" options={MARITAL_STATUS_OPTIONS} value={data.estado_civil} onChange={()=>{}} className={readOnlyClass} />
              <Select label="Alfabetizado" name="alfabetizado" options={YES_NO_OPTIONS} value={data.alfabetizado} onChange={()=>{}} className={readOnlyClass} />
              <Input label="RG" name="rg" value={data.rg} onChange={()=>{}} className={readOnlyClass} />
              <Select label="UF RG" name="uf_rg" options={UF_OPTIONS} value={data.uf_rg || ''} onChange={()=>{}} className={readOnlyClass} />
              <Input type="date" label="Expedição" name="data_expedicao_rg" value={data.data_expedicao_rg} onChange={()=>{}} className={readOnlyClass} />
              <Input label="CPF" name="cpf" value={data.cpf} onChange={()=>{}} className={readOnlyClass} />
              <Input label="CTPS" name="ctps" value={data.ctps} onChange={()=>{}} className={readOnlyClass} />
              <Input label="Série" name="serie_ctps" value={data.serie_ctps} onChange={()=>{}} className={readOnlyClass} />
              <Input type="date" label="Expedição" name="data_expedicao_ctps" value={data.data_expedicao_ctps} onChange={()=>{}} className={readOnlyClass} />
              <Input label="Título" name="titulo_eleitor" value={data.titulo_eleitor} onChange={()=>{}} className={readOnlyClass} />
              <Input label="Zona" name="zona_eleitoral" value={data.zona_eleitoral} onChange={()=>{}} className={readOnlyClass} />
              <Input label="Seção" name="secao_eleitoral" value={data.secao_eleitoral} onChange={()=>{}} className={readOnlyClass} />
              <Input label="CIR" name="cir" value={data.cir} onChange={()=>{}} className={readOnlyClass} />
              <Input label="CAEPF" name="caepf" value={data.caepf} onChange={()=>{}} className={readOnlyClass} />
              <Select label="Sexo" name="sexo" options={SEX_OPTIONS} value={data.sexo} onChange={()=>{}} className={readOnlyClass} />
              <Input label="PIS" name="pis" value={data.pis} onChange={()=>{}} className={readOnlyClass} />
              <Input label="CEI" name="cei" value={data.cei} onChange={()=>{}} className={readOnlyClass} />
              <Input label="NIT" name="nit" value={data.nit} onChange={()=>{}} className={readOnlyClass} />
              <Input label="RGP (M.M.A.)" name="embarcacao_rgp" value={data.embarcacao_rgp} onChange={()=>{}} className={readOnlyClass} />
              <Input type="date" label="Emissão RGP" name="data_emissao_rgp" value={data.data_emissao_rgp} onChange={()=>{}} className={readOnlyClass} />
            </Section>

            <Section title="Dados da Embarcação">
              <Input className="lg:col-span-2" label="Embarcação" name="embarcacao" value={data.embarcacao} onChange={()=>{}} />
              <Input label="Nº RGP" name="embarcacao_rgp_nr" value={data.embarcacao_rgp} onChange={()=>{}} className={readOnlyClass} />
              <Select label="UF" name="rgp_uf" options={UF_OPTIONS} value={data.rgp_uf} onChange={()=>{}} className={readOnlyClass} />
              {/* Fix: Converted ab and numero_tripulantes to strings to match Input component value prop type */}
              <Input label="AB" name="ab" value={String(data.ab || '')} onChange={()=>{}} className={readOnlyClass} />
              <Input label="Nº de Tripulantes" name="numero_tripulantes" value={String(data.numero_tripulantes || '')} onChange={()=>{}} className={readOnlyClass} />
              <Input label="CPF do Proprietário" name="cpf_proprietario" value={data.cpf_proprietario} onChange={()=>{}} className={readOnlyClass} />
            </Section>

            <Section title="Controle da Situação">
              <Select label="Situação" name="situacao" options={STATUS_OPTIONS} value={data.situacao} onChange={()=>{}} className={readOnlyClass} />
              <Input type="date" label="Ult Mês Pago" name="ultimo_mes_pago" value={data.ultimo_mes_pago} onChange={()=>{}} className={readOnlyClass} />
              <Input label="Num Beneficio" name="numero_beneficio" value={data.numero_beneficio} onChange={()=>{}} className={readOnlyClass} />
              <Input label="Espécie" name="especie" value={data.especie} onChange={()=>{}} className={readOnlyClass} />
              <Input type="date" label="Data Falec." name="data_falecimento" value={data.data_falecimento} onChange={()=>{}} className={readOnlyClass} />
              <Input type="date" label="Dt. Transf." name="data_transferencia" value={data.data_transferencia} onChange={()=>{}} className={readOnlyClass} />
              <Input label="Pra onde foi transferido" name="destino_transferencia" value={data.destino_transferencia} onChange={()=>{}} className={readOnlyClass} />
              <Input type="date" label="1º Mês Pago" name="primeira_data_pagamento" value={data.primeira_data_pagamento} onChange={()=>{}} className={readOnlyClass} />
              <Select label="Situação no MPA" name="situacao_mpa" options={['ATIVO', 'SUSPENSO', 'CANCELADO']} value={data.situacao_mpa} onChange={()=>{}} className={readOnlyClass} />
              <Input label="Cód. GPS" name="codigo_gps_mpa" value={data.codigo_gps_mpa} onChange={()=>{}} className={readOnlyClass} />
              <Input label="Senha no GPS" name="senha_gps_mpa" value={data.senha_gps_mpa} onChange={()=>{}} className={readOnlyClass} />
              <Input label="Senha no INSS" name="senha_inss_mpa" value={data.senha_inss_mpa} onChange={()=>{}} className={readOnlyClass} />
            </Section>
          </div>
        )}

        {tab === 'verso' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Section title="Facultativo">
              <Input label="Nº Pasta do Associado" name="pasta_socios" value={data.pasta_socios} onChange={()=>{}} className={readOnlyClass} />
              <Input label="Nº Pasta de Embarcação" name="pasta_embarcacao" value={data.pasta_embarcacao} onChange={()=>{}} className={readOnlyClass} />
              <Select label="Pescado de Defeso" name="id_defeso" options={['CARANGUEJO', 'CAMARÃO', 'OUTROS']} value={data.id_defeso} onChange={()=>{}} className={readOnlyClass} />
              <Input label="Outros Documentos" name="outros_documentos" value={data.outros_documentos} onChange={()=>{}} className={readOnlyClass} />
            </Section>

            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-[32px] shadow-sm overflow-hidden">
              <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border-b dark:border-slate-800 flex flex-col items-center">
                <h3 className="text-sm font-black uppercase text-slate-700 dark:text-slate-200 flex items-center gap-2 underline tracking-widest"><TableIcon size={18} /> LISTA DOS DEPENDENTES DO ASSOCIADO</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                    <tr><th className="px-8 py-4 text-left">Dependente</th><th className="px-8 py-4 text-left">Dt. Nascimento</th><th className="px-8 py-4 text-left">Parentesco</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(data.dependents || []).map(d => (
                      <tr key={d.id}>
                        <td className="px-8 py-3 text-slate-800 dark:text-white font-bold">{d.name}</td>
                        <td className="px-8 py-3 text-slate-500">{d.birthDate}</td>
                        <td className="px-8 py-3 text-slate-500">{d.relationship}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Section title="Observações Gerais">
              <TextArea className={`lg:col-span-4 ${readOnlyClass}`} label="" name="observacao" value={data.observacao} onChange={()=>{}} />
            </Section>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-32">
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
              {isGenerating ? (
                 <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                    <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Salvando Recibo e Gerando Numeração...</p>
                 </div>
              ) : (
                <>
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
                </>
              )}
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button onClick={() => setIsDocModalOpen(false)} className="px-8 py-3 rounded-xl text-[10px] font-black uppercase text-slate-400">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'list' ? (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white dark:bg-slate-900 p-4 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm relative z-[60]">
            <div className="md:col-span-3 flex items-center gap-4 pl-4">
              <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-600/20">
                <UserPlus size={18} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Socios</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md uppercase tracking-widest">{filteredMembers.length} Registrados</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 relative" ref={searchRef}>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
                  <Search size={18} />
                </div>
                <input 
                  type="text" 
                  placeholder="Pesquisar por Inscrição ou Nome..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 pl-14 pr-6 text-xs font-bold uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 text-slate-900 dark:text-white transition-all"
                />
              </div>
            </div>

            <div className="md:col-span-4 flex justify-end items-center gap-2 pr-4">
              <button 
                onClick={generateFullListPDF}
                className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-5 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
              >
                <FileDown size={14} /> Gerar PDF
              </button>
              <button onClick={handleOpenAdd} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:-translate-y-1 transition-all shadow-lg shadow-blue-600/20">
                <UserPlus size={14} /> Novo
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400 tracking-widest">
                  <tr>
                    <th className="px-8 py-6">Inscrição</th>
                    <th className="px-8 py-6">Nome do Sócio</th>
                    <th className="px-8 py-6">Situação</th>
                    <th className="px-8 py-6">Ult Mês Pago</th>
                    <th className="px-8 py-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-8 py-5">
                        <span className="font-mono text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-lg">
                          {m.codigo_socio}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-xs font-black text-slate-800 dark:text-slate-200 uppercase truncate max-w-[300px]">
                        {m.nome}
                      </td>
                      <td className="px-8 py-5">
                        <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase border ${m.situacao === 'Ativo' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                          {m.situacao || 'Pendente'}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-[10px] font-bold text-slate-500">
                        {m.ultimo_mes_pago || '---'}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => handleExibirSocio(members.indexOf(m))}
                          className="px-6 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all border border-blue-100 dark:border-blue-900/30 flex items-center gap-2 ml-auto"
                        >
                          <Eye size={14} /> Exibir
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredMembers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-slate-300 uppercase text-[10px] font-black tracking-widest">Nenhum associado encontrado</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase">Total: {filteredMembers.length} registros</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30"><ChevronLeft size={16} /></button>
                  <div className="px-4 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px] font-black text-blue-600">PAG {currentPage} / {totalPages}</div>
                  <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 disabled:opacity-30"><ChevronRight size={16} /></button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setViewMode('list')}
                className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-blue-600 transition-all flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Voltar para Lista</span>
              </button>
              <div className="h-10 w-[1px] bg-slate-100 dark:bg-slate-800" />
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate max-w-[200px] md:max-w-none">{currentMember.nome}</h2>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Código: {currentMember.codigo_socio} | {(members || []).length} Sócios Totais</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => navigate('prev')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"><ChevronLeft size={20} /></button>
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {currentIndex + 1} / {(members || []).length}
              </div>
              <button onClick={() => navigate('next')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400"><ChevronRight size={20} /></button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1 bg-slate-200/50 dark:bg-slate-900/50 p-1 rounded-2xl w-fit border border-slate-200 dark:border-slate-800">
              {(['frente', 'outros', 'verso'] as TabType[]).map((tab) => (
                <button key={tab} onClick={() => setActiveViewTab(tab)} className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeViewTab === tab ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            
            <div className="bg-blue-50/50 dark:bg-blue-900/10 px-6 py-3 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex items-center gap-3">
              <Eye size={16} className="text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Visualização de Cadastro</span>
            </div>
          </div>

          <div className="mt-8 bg-slate-50/30 dark:bg-slate-900/30 p-2 rounded-[40px] border border-slate-100 dark:border-slate-800/50">
            {renderMemberView(currentMember)}
          </div>

          <footer className="fixed bottom-0 left-0 lg:left-[360px] right-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 p-6 z-[100] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-3 w-full md:w-auto">
              <button onClick={handleOpenEdit} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:-translate-y-1 transition-all shadow-lg shadow-blue-600/20">
                <Edit3 size={18} /> Editar Cadastro
              </button>
              <button onClick={() => setIsDocModalOpen(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-700 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:-translate-y-1 transition-all shadow-lg shadow-slate-900/20">
                <FileSignature size={18} /> Imprimir Documento
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => window.print()} title="Imprimir" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 p-4 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"><Printer size={20} /></button>
              <button onClick={() => { if(confirm('Excluir este sócio permanentemente?')) deleteMember(currentIndex); }} title="Excluir" className="bg-red-50 dark:bg-red-900/20 text-red-500 p-4 rounded-2xl border border-red-100 dark:border-red-900 hover:bg-red-100 transition-all"><Trash2 size={20} /></button>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
};
