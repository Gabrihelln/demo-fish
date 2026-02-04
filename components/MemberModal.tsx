
import React, { useState, useEffect } from 'react';
import { X, UserPlus, Edit3, Save, Upload, Table as TableIcon } from 'lucide-react';
import { Member, TabType } from '../types';
import { useApp } from '../AppContext';
import { useNavigation } from '../NavigationContext';
import { 
  EMPTY_MEMBER, UF_OPTIONS, MARITAL_STATUS_OPTIONS, BLOOD_TYPE_OPTIONS, 
  SEX_OPTIONS, STATUS_OPTIONS, YES_NO_OPTIONS 
} from '../constants';
import { Input, Select, TextArea } from './FormField';
import { Section } from './Section';

export const MemberModal: React.FC = () => {
  const { isMemberModalOpen, setMemberModalOpen, memberModalMode, selectedMemberId, setSelectedMemberId } = useNavigation();
  const { members, addMember, updateMember } = useApp();
  
  const [formMember, setFormMember] = useState<Member>(EMPTY_MEMBER);
  const [activeModalTab, setActiveModalTab] = useState<TabType>('frente');

  useEffect(() => {
    if (isMemberModalOpen) {
      if (memberModalMode === 'edit' && selectedMemberId) {
        const m = members.find(x => x.id === selectedMemberId);
        if (m) setFormMember({ ...m });
      } else {
        setFormMember({ ...EMPTY_MEMBER, id: crypto.randomUUID(), dependents: [] });
      }
      setActiveModalTab('frente');
    }
  }, [isMemberModalOpen, memberModalMode, selectedMemberId, members]);

  if (!isMemberModalOpen) return null;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormMember(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formMember.nome) return alert("Nome completo é obrigatório.");
    if (memberModalMode === 'add') {
      addMember(formMember);
    } else {
      const idx = members.findIndex(m => m.id === formMember.id);
      if (idx !== -1) updateMember(idx, formMember);
    }
    setMemberModalOpen(false);
    setSelectedMemberId(null);
    alert("Dados processados com sucesso!");
  };

  const renderMemberForm = (data: Member, onChange: any) => {
    const tab = activeModalTab;
    return (
      <div className="space-y-8">
        {tab === 'frente' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Section title="Identificação">
              <Input label="Inscrição" name="codigo_socio" value={data.codigo_socio} onChange={onChange} />
              <Input label="Insc. Antiga" name="codigo_antigo" value={data.codigo_antigo} onChange={onChange} />
              <Select label="Localidade" name="codigo_comunidade" options={['BAIRRO PORTELINHA', 'CENTRO', 'RURAL']} value={data.codigo_comunidade} onChange={onChange} />
              <Input type="date" label="Dt. Recadastr." name="recadastro" value={data.recadastro} onChange={onChange} />
              <Input type="date" label="Dt. Cadastro" name="data_admissao" value={data.data_admissao} onChange={onChange} />
            </Section>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              <div className="lg:col-span-3 space-y-6">
                <Section title="Dados do Sócio">
                  <Input className="lg:col-span-2" label="Nome" name="nome" value={data.nome} onChange={onChange} />
                  <Input label="Apelido" name="apelido" value={data.apelido} onChange={onChange} />
                  <Input type="date" label="Dt. Nasc." name="data_nascimento" value={data.data_nascimento} onChange={onChange} />
                  <Input className="lg:col-span-2" label="Pai" name="nome_pai" value={data.nome_pai} onChange={onChange} />
                  <Input className="lg:col-span-2" label="Mãe" name="nome_mae" value={data.nome_mae} onChange={onChange} />
                  <Input label="Nacionalidade" name="nacionalidade" value={data.nacionalidade} onChange={onChange} />
                  <Input label="Naturalidade" name="naturalidade" value={data.naturalidade} onChange={onChange} />
                  <Select label="UF" name="uf_naturalidade" options={UF_OPTIONS} value={data.uf_naturalidade} onChange={onChange} />
                  <Input className="lg:col-span-2" label="Profissão" name="profissao" value={data.profissao} onChange={onChange} />
                </Section>
                <Section title="Local de Trabalho e Email">
                  <Input className="lg:col-span-2" label="Local de Trabalho" name="local_trabalho" value={data.local_trabalho} onChange={onChange} />
                  <Input className="lg:col-span-2" label="Email" name="email" value={data.email} onChange={onChange} />
                </Section>
              </div>
              
              <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 flex flex-col items-center gap-4 shadow-sm h-[400px]">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foto do Titular</h3>
                <div className="w-full max-w-[300px] aspect-square bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex items-center justify-center overflow-hidden relative group shadow-inner transition-all hover:border-blue-300">
                  {data.photoUrl ? (
                    <img src={data.photoUrl} className="w-full h-full object-cover" alt="Sócio" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-300 dark:text-slate-600">
                      <Upload size={32} />
                      <span className="text-[8px] font-bold uppercase tracking-tighter">Webcam</span>
                    </div>
                  )}
                  <label className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity backdrop-blur-[2px]">
                    <Upload className="text-white" size={24} />
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const reader = new FileReader();
                        reader.onloadend = () => handleFormChange({ target: { name: 'photoUrl', value: reader.result as string } } as any);
                        reader.readAsDataURL(f);
                      }
                    }} />
                  </label>
                </div>
              </div>
            </div>

            <Section title="Endereço">
              <Input className="lg:col-span-2" label="Logradouro" name="endereco" value={data.endereco} onChange={onChange} />
              <Input label="Número" name="numero" value={data.numero} onChange={onChange} />
              <Input label="Bairro\Distrito" name="bairro" value={data.bairro} onChange={onChange} />
              <Input label="Cidade" name="cidade" value={data.cidade} onChange={onChange} />
              <Select label="UF" name="uf" options={UF_OPTIONS} value={data.uf} onChange={onChange} />
              <Input label="CEP" name="cep" value={data.cep} onChange={onChange} />
              <Input label="Telefone" name="telefone" value={data.telefone} onChange={onChange} />
            </Section>

            <Section title="Outras informações">
              <Input label="Número da DAP" name="numero_dap" value={data.numero_dap} onChange={onChange} />
              <Input label="Grupo" name="grupo_dap" value={data.grupo_dap} onChange={onChange} />
              <Input type="date" label="Data de Validade" name="validade_dap" value={data.validade_dap} onChange={onChange} />
              <Select label="Categoria" name="codigo_categoria" options={['SEGURADO ESPECIAL', 'PESCADOR ARTESANAL']} value={data.codigo_categoria} onChange={onChange} />
              <Input label="SUS" name="sus" value={data.sus} onChange={onChange} />
              <Select label="Fator Sanguíneo" name="tipo_sanguineo" options={BLOOD_TYPE_OPTIONS} value={data.tipo_sanguineo} onChange={onChange} />
            </Section>
          </div>
        )}

        {tab === 'outros' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Section title="Outros Dados">
              <Select label="Estado Civil" name="estado_civil" options={MARITAL_STATUS_OPTIONS} value={data.estado_civil} onChange={onChange} />
              <Select label="Alfabetizado" name="alfabetizado" options={YES_NO_OPTIONS} value={data.alfabetizado} onChange={onChange} />
              <Input label="RG" name="rg" value={data.rg} onChange={onChange} />
              <Select label="UF RG" name="uf_rg" options={UF_OPTIONS} value={data.uf_rg || ''} onChange={onChange} />
              <Input type="date" label="Expedição" name="data_expedicao_rg" value={data.data_expedicao_rg} onChange={onChange} />
              <Input label="CPF" name="cpf" value={data.cpf} onChange={onChange} />
              <Input label="CTPS" name="ctps" value={data.ctps} onChange={onChange} />
              <Input label="Série" name="serie_ctps" value={data.serie_ctps} onChange={onChange} />
              <Input type="date" label="Expedição" name="data_expedicao_ctps" value={data.data_expedicao_ctps} onChange={onChange} />
              <Input label="Título" name="titulo_eleitor" value={data.titulo_eleitor} onChange={onChange} />
              <Input label="Zona" name="zona_eleitoral" value={data.zona_eleitoral} onChange={onChange} />
              <Input label="Seção" name="secao_eleitoral" value={data.secao_eleitoral} onChange={onChange} />
              <Input label="CIR" name="cir" value={data.cir} onChange={onChange} />
              <Input label="CAEPF" name="caepf" value={data.caepf} onChange={onChange} />
              <Select label="Sexo" name="sexo" options={SEX_OPTIONS} value={data.sexo} onChange={onChange} />
              <Input label="PIS" name="pis" value={data.pis} onChange={onChange} />
              <Input label="CEI" name="cei" value={data.cei} onChange={onChange} />
              <Input label="NIT" name="nit" value={data.nit} onChange={onChange} />
              <Input label="RGP (M.M.A.)" name="embarcacao_rgp" value={data.embarcacao_rgp} onChange={onChange} />
              <Input type="date" label="Emissão RGP" name="data_emissao_rgp" value={data.data_emissao_rgp} onChange={onChange} />
            </Section>

            <Section title="Dados da Embarcação">
              <Input className="lg:col-span-2" label="Embarcação" name="embarcacao" value={data.embarcacao} onChange={onChange} />
              <Input label="Nº RGP" name="embarcacao_rgp_nr" value={data.embarcacao_rgp} onChange={onChange} />
              <Select label="UF" name="rgp_uf" options={UF_OPTIONS} value={data.rgp_uf} onChange={onChange} />
              {/* Fix: Converted ab and numero_tripulantes to strings to match Input component value prop type */}
              <Input label="AB" name="ab" value={String(data.ab || '')} onChange={onChange} />
              <Input label="Nº de Tripulantes" name="numero_tripulantes" value={String(data.numero_tripulantes || '')} onChange={onChange} />
              <Input label="CPF do Proprietário" name="cpf_proprietario" value={data.cpf_proprietario} onChange={onChange} />
            </Section>

            <Section title="Controle da Situação">
              <Select label="Situação" name="situacao" options={STATUS_OPTIONS} value={data.situacao} onChange={onChange} />
              <Input type="date" label="Ult Mês Pago" name="ultimo_mes_pago" value={data.ultimo_mes_pago} onChange={onChange} />
              <Input label="Num Beneficio" name="numero_beneficio" value={data.numero_beneficio} onChange={onChange} />
              <Input label="Espécie" name="especie" value={data.especie} onChange={onChange} />
              <Input type="date" label="Data Falec." name="data_falecimento" value={data.data_falecimento} onChange={onChange} />
              <Input type="date" label="Dt. Transf." name="data_transferencia" value={data.data_transferencia} onChange={onChange} />
              <Input label="Pra onde foi transferido" name="destino_transferencia" value={data.destino_transferencia} onChange={onChange} />
              <Input type="date" label="1º Mês Pago" name="primeira_data_pagamento" value={data.primeira_data_pagamento} onChange={onChange} />
              <Select label="Situação no MPA" name="situacao_mpa" options={['ATIVO', 'SUSPENSO', 'CANCELADO']} value={data.situacao_mpa} onChange={onChange} />
              <Input label="Cód. GPS" name="codigo_gps_mpa" value={data.codigo_gps_mpa} onChange={onChange} />
              <Input label="Senha no GPS" name="senha_gps_mpa" value={data.senha_gps_mpa} onChange={onChange} />
              <Input label="Senha no INSS" name="senha_inss_mpa" value={data.senha_inss_mpa} onChange={onChange} />
            </Section>
          </div>
        )}

        {tab === 'verso' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <Section title="Facultativo">
              <Input label="Nº Pasta do Associado" name="pasta_socios" value={data.pasta_socios} onChange={onChange} />
              <Input label="Nº Pasta de Embarcação" name="pasta_embarcacao" value={data.pasta_embarcacao} onChange={onChange} />
              <Select label="Pescado de Defeso" name="id_defeso" options={['CARANGUEJO', 'CAMARÃO', 'OUTROS']} value={data.id_defeso} onChange={onChange} />
              <Input label="Outros Documentos" name="outros_documentos" value={data.outros_documentos} onChange={onChange} />
            </Section>

            <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-[32px] shadow-sm overflow-hidden">
              <div className="p-8 bg-slate-50 dark:bg-slate-800/30 border-b dark:border-slate-800 flex flex-col items-center">
                <h3 className="text-sm font-black uppercase text-slate-700 dark:text-slate-200 flex items-center gap-2 underline tracking-widest"><TableIcon size={18} /> LISTA DOS DEPENDENTES DO ASSOCIADO</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                    <tr><th className="px-8 py-4 text-left">Dependente</th><th className="px-8 py-4 text-left">Dt. Nascimento</th><th className="px-8 py-4 text-left">Parentesco</th><th className="px-8 py-4 text-right">Ação</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(data.dependents || []).map(d => (
                      <tr key={d.id}>
                        <td className="px-6 py-3"><input className="w-full p-2 bg-transparent focus:bg-white dark:focus:bg-slate-800 rounded border border-transparent focus:border-blue-200 outline-none text-slate-900 dark:text-white" value={d.name} onChange={e => handleFormChange({ target: { name: 'dependents', value: data.dependents.map(x => x.id === d.id ? {...x, name: e.target.value} : x) } } as any)} /></td>
                        <td className="px-6 py-3"><input type="date" className="w-full p-2 bg-transparent outline-none cursor-pointer text-slate-900 dark:text-white" value={d.birthDate} onChange={e => handleFormChange({ target: { name: 'dependents', value: data.dependents.map(x => x.id === d.id ? {...x, birthDate: e.target.value} : x) } } as any)} /></td>
                        <td className="px-6 py-3"><input className="w-full p-2 bg-transparent outline-none text-slate-900 dark:text-white" value={d.relationship} onChange={e => handleFormChange({ target: { name: 'dependents', value: data.dependents.map(x => x.id === d.id ? {...x, relationship: e.target.value} : x) } } as any)} /></td>
                        <td className="px-8 py-3 text-right"><button onClick={() => handleFormChange({ target: { name: 'dependents', value: data.dependents.filter(x => x.id !== d.id) } } as any)} className="text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">Excluir</button></td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={4} className="p-4 text-center">
                        <button onClick={() => handleFormChange({ target: { name: 'dependents', value: [...(data.dependents || []), {id: Date.now().toString(), name: '', birthDate: '', relationship: ''}] } } as any)} className="text-blue-600 text-[10px] font-black uppercase tracking-widest">+ Adicionar Novo Dependente</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <Section title="Observações Gerais">
              <TextArea className="lg:col-span-4" label="" name="observacao" value={data.observacao} onChange={onChange} placeholder="Histórico, pendências ou observações..." />
            </Section>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[250] flex flex-col p-4 md:p-10 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl mx-auto rounded-[48px] shadow-2xl overflow-hidden flex flex-col flex-1 border border-white/10">
        <header className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-6">
            <div className={`p-4 rounded-[24px] text-white shadow-xl ${memberModalMode === 'add' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
              {memberModalMode === 'add' ? <UserPlus size={24} /> : <Edit3 size={24} />}
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                {memberModalMode === 'add' ? 'Inscrição de Sócio' : `Editando Inscrição: ${formMember.nome || 'Associado'}`}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestão de Cadastros Físicos e Digitais</p>
            </div>
          </div>
          <button onClick={() => setMemberModalOpen(false)} className="p-3 hover:bg-white dark:hover:bg-slate-800 rounded-2xl text-slate-400 hover:text-red-500 transition-all">
            <X size={24} />
          </button>
        </header>

        <div className="p-8 flex-1 overflow-y-auto scrollbar-hide">
          <div className="flex gap-1 bg-slate-200/50 dark:bg-slate-900/50 p-1.5 rounded-2xl w-fit border border-slate-200 dark:border-slate-800 mb-8 mx-auto">
            {(['frente', 'outros', 'verso'] as TabType[]).map((tab) => (
              <button key={tab} onClick={() => setActiveModalTab(tab)} className={`px-12 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeModalTab === tab ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-md border border-slate-200 dark:border-slate-700' : 'text-slate-500'}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          {renderMemberForm(formMember, handleFormChange)}
        </div>

        <footer className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-4">
          <button onClick={() => setMemberModalOpen(false)} className="px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400">Cancelar</button>
          <button onClick={handleSave} className="bg-emerald-600 text-white px-12 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:-translate-y-1 transition-all shadow-xl shadow-emerald-600/20">
            <Save size={18} /> Salvar Cadastro
          </button>
        </footer>
      </div>
    </div>
  );
};
