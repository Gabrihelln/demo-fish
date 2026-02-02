
import React, { useState } from 'react';
import { 
  BookOpen, ChevronRight, Layout, Database, 
  Users, FileText, Settings, ShieldCheck, 
  RefreshCw, Cloud, Upload, Code, Info, UserPlus,
  MessageSquare, MapPin, Fish, Tags, Receipt, Wallet,
  CalendarDays, Landmark, FileSignature, Files, BarChart2,
  ShieldAlert, UserCheck, Type, MousePointer2, Palette,
  Box, Terminal
} from 'lucide-react';
import { Section } from '../components/Section';
import { Input, Select, TextArea } from '../components/FormField';

export const DocsView: React.FC = () => {
  const [activeDocTab, setActiveDocTab] = useState('introducao');

  const menu = [
    { id: 'introducao', label: 'Visão Geral', icon: Info },
    { id: 'arquitetura', label: 'Arquitetura Técnica', icon: Code },
    { id: 'usuario', label: 'Manual do Usuário', icon: Users },
    { id: 'admin', label: 'Manual do Administrador', icon: ShieldCheck },
    { id: 'componentes', label: 'Componentes UI', icon: Layout },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-10 animate-in fade-in duration-500 pb-20">
      {/* SIDE NAV DOCS */}
      <aside className="w-full lg:w-80 shrink-0 space-y-2 lg:sticky lg:top-32 h-fit">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-8 px-4">Guia do Sistema</h2>
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveDocTab(item.id)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeDocTab === item.id 
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' 
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={16} />
              {item.label}
            </div>
            {activeDocTab === item.id && <ChevronRight size={14} />}
          </button>
        ))}
      </aside>

      {/* CONTENT AREA */}
      <div className="flex-1 bg-white border border-slate-200 rounded-[48px] p-10 lg:p-16 shadow-sm overflow-hidden min-h-[70vh]">
        {activeDocTab === 'introducao' && (
          <article className="prose prose-slate max-w-none space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-600/20">
                <BookOpen size={32} />
              </div>
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter m-0">Visão Geral do SGA</h1>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                O Sistema de Gestão de Associados (SGA) é uma plataforma "Offline-First" projetada para operar em cenários de conectividade instável, mantendo a integridade dos dados e a produtividade administrativa.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
              <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-4">Principais Funcionalidades</h4>
                <ul className="space-y-3 m-0 p-0 list-none">
                  {[
                    'Cadastro completo de associados e dependentes',
                    'Gestão de embarcações e dados de pesca',
                    'Editor de modelos de documentos timbrados',
                    'Sincronização bidirecional com a nuvem',
                    'Importação inteligente de dados legados'
                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-emerald-50 p-8 rounded-[32px] border border-emerald-100">
                <h4 className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-4">Segurança e Multi-Tenancy</h4>
                <p className="text-[11px] font-bold text-slate-600 leading-relaxed m-0">
                  O sistema isola os dados por "Unidades" (Tenants). Cada colônia, sindicato ou prefeitura possui seu próprio espaço de dados, acessível apenas por usuários autorizados daquela região.
                </p>
              </div>
            </div>
          </article>
        )}

        {activeDocTab === 'arquitetura' && (
          <article className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Arquitetura Técnica</h1>
            
            <div className="space-y-6">
              <div className="flex gap-6 items-start">
                <div className="bg-slate-900 p-4 rounded-2xl text-white"><Database size={24} /></div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">Camada de Persistência Local (Local-First)</h3>
                  <p className="text-xs font-medium text-slate-500 mt-2 leading-relaxed">
                    O SGA utiliza <strong>IndexedDB</strong> (via SGA_DATABASE_V3) para armazenar membros, templates e sessões no navegador do usuário. Isso permite que o sistema seja recarregado e utilizado sem internet.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="bg-blue-600 p-4 rounded-2xl text-white"><RefreshCw size={24} /></div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">Lógica de Sincronização</h3>
                  <p className="text-xs font-medium text-slate-500 mt-2 leading-relaxed">
                    A sincronização funciona em dois estágios: 
                    <br/><strong>1. Push:</strong> Envia registros locais com `isSynced: false` para o Supabase.
                    <br/><strong>2. Pull:</strong> Baixa registros remotos que pertencem ao `tenant_id` da sessão ativa.
                  </p>
                </div>
              </div>
            </div>
          </article>
        )}

        {activeDocTab === 'usuario' && (
          <article className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Manual do Usuário Operacional</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Sumário de Menus e Funcionalidades do Painel Padrão</p>
            </div>

            {/* MÓDULO CADASTRO */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-3">
                <Users size={18} /> Módulo 01: Cadastros Base
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: UserPlus, label: 'Sócios', desc: 'Gestão completa do dossiê do associado, incluindo fotos, documentos e dependentes.' },
                  { icon: MessageSquare, label: 'Assuntos', desc: 'Categorização de tipos de atendimentos realizados na unidade.' },
                  { icon: UserCheck, label: 'Atendentes', desc: 'Controle de usuários que operam o sistema naquela unidade específica.' },
                  { icon: Fish, label: 'Pescados', iconColor: 'text-blue-400', desc: 'Catálogo de espécies de peixes para relatórios de produção.' },
                  { icon: MapPin, label: 'Localidades', desc: 'Cadastro de comunidades, portos e bairros de atuação.' },
                  { icon: Tags, label: 'Categorias', desc: 'Definição de classes (Ex: Marisqueira, Pescador Artesanal).' },
                  { icon: Receipt, label: 'Contas', desc: 'Estruturação do plano de contas para movimentações financeiras.' },
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all flex gap-4">
                    <div className="bg-white p-3 rounded-2xl shadow-sm h-fit"><item.icon size={20} className={item.iconColor || 'text-slate-600'} /></div>
                    <div>
                      <h4 className="text-[11px] font-black uppercase text-slate-800">{item.label}</h4>
                      <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* MÓDULO FINANCEIRO */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-3">
                <Wallet size={18} /> Módulo 02: Recebimentos e Finanças
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100">
                  <CalendarDays size={20} className="text-emerald-600 mb-3" />
                  <h4 className="text-[10px] font-black uppercase text-slate-800">Mensalidades</h4>
                  <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase mt-1">Lançamento e baixa de parcelas mensais dos sócios.</p>
                </div>
                <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100">
                  <UserCheck size={20} className="text-emerald-600 mb-3" />
                  <h4 className="text-[10px] font-black uppercase text-slate-800">Filiações</h4>
                  <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase mt-1">Taxas de entrada de novos membros no sistema.</p>
                </div>
                <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100">
                  <Landmark size={20} className="text-emerald-600 mb-3" />
                  <h4 className="text-[10px] font-black uppercase text-slate-800">Contribuição Sindical</h4>
                  <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase mt-1">Gestão das taxas anuais e sindicais obrigatórias.</p>
                </div>
              </div>
            </div>

            {/* MÓDULO DOCUMENTOS E PENDENCIAS */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-600 flex items-center gap-3">
                <FileText size={18} /> Módulo 03: Documentação e Pendências
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-white border border-slate-200 rounded-3xl flex gap-4">
                  <div className="bg-amber-50 p-3 rounded-2xl text-amber-600"><FileSignature size={20} /></div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase text-slate-800">Declarações e Recursos</h4>
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase mt-1">Gestão de processos pendentes, defesos e recursos administrativos.</p>
                  </div>
                </div>
                <div className="p-6 bg-white border border-slate-200 rounded-3xl flex gap-4">
                  <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><Files size={20} /></div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase text-slate-800">Editor de Papel Timbrado</h4>
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase mt-1">Criação de modelos oficiais (Declarações, Atestados) com preenchimento automático.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* MÓDULO RELATORIOS */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-3">
                <BarChart2 size={18} /> Módulo 04: Inteligência e Relatórios
              </h3>
              <div className="bg-slate-900 p-8 rounded-[40px] text-white">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 leading-relaxed">
                  Exportação de listas completas em formato PDF ou Impressão direta. O usuário pode filtrar por categoria, localidade ou status de pagamento para gerar relatórios gerenciais precisos.
                </p>
                <div className="flex gap-4">
                  <div className="bg-white/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase">Relatório de Inadimplência</div>
                  <div className="bg-white/10 px-4 py-2 rounded-xl text-[9px] font-black uppercase">Ficha Individual do Sócio</div>
                </div>
              </div>
            </div>
          </article>
        )}

        {activeDocTab === 'admin' && (
          <article className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Manual do Administrador</h1>
            
            <Section title="Gestão de Unidades (Tenants)">
              <div className="col-span-full space-y-4">
                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                  No painel de licenças, você pode criar novas unidades geográficas. Cada unidade tem seu próprio login e senha. Ao criar uma unidade, ela é persistida imediatamente no Supabase.
                </p>
                <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="p-3 bg-white rounded-xl shadow-sm"><ShieldCheck size={20} className="text-blue-600"/></div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                    Acesso Restrito: Apenas usuários com role SUPER_ADMIN podem ver este painel.
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Migração de Dados JSON">
              <div className="col-span-full space-y-4">
                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                  O importador utiliza um <strong>Mapeamento de Três Passos</strong>:
                  <br/>1. Correspondência exata de nomes de campos (ex: "CPF").
                  <br/>2. Busca por sinônimos normalizados (ex: "Sócio -> Nome").
                  <br/>3. Busca inclusiva (ex: "End -> Endereco").
                </p>
              </div>
            </Section>
          </article>
        )}

        {activeDocTab === 'componentes' && (
          <article className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Design System & Componentes</h1>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                O SGA utiliza uma estética baseada no "Neobrutalismo Moderno", caracterizada por bordas extremamente arredondadas, contrastes nítidos e sombras suaves que conferem profundidade e clareza.
              </p>
            </div>

            {/* GUIA DE ESTILO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-10 rounded-[48px] border border-slate-100 shadow-inner">
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <Palette size={16} /> Paleta de Cores
                </h3>
                <div className="flex gap-3">
                  <div className="group flex flex-col gap-2">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20" />
                    <span className="text-[8px] font-black uppercase text-center text-slate-400">Blue-600</span>
                  </div>
                  <div className="group flex flex-col gap-2">
                    <div className="w-14 h-14 bg-slate-900 rounded-2xl shadow-lg shadow-slate-900/20" />
                    <span className="text-[8px] font-black uppercase text-center text-slate-400">Slate-900</span>
                  </div>
                  <div className="group flex flex-col gap-2">
                    <div className="w-14 h-14 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20" />
                    <span className="text-[8px] font-black uppercase text-center text-slate-400">Emerald-500</span>
                  </div>
                  <div className="group flex flex-col gap-2">
                    <div className="w-14 h-14 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/20" />
                    <span className="text-[8px] font-black uppercase text-center text-slate-400">Amber-500</span>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <Type size={16} /> Tipografia
                </h3>
                <div className="space-y-2">
                  <p className="text-lg font-black uppercase tracking-tighter text-slate-800">Inter Black 900</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Inter Bold 700 (Labels)</p>
                  <p className="text-xs font-medium text-slate-400">Inter Medium 500 (Textos)</p>
                </div>
              </div>
            </div>

            {/* COMPONENTES FORM */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Box size={20} className="text-blue-600" />
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">Entradas de Dados (Forms)</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Preview Interativo</h4>
                  <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
                    <Input label="Nome Completo" name="ex_input" value="" onChange={() => {}} placeholder="Ex: João da Silva" />
                    <Select label="UF" name="ex_select" options={['PA', 'MA', 'CE']} value="" onChange={() => {}} />
                    <TextArea label="Observações" name="ex_area" value="" onChange={() => {}} placeholder="Descreva aqui..." />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2 flex items-center gap-2">
                    <Terminal size={14} /> Implementação Code
                  </h4>
                  <div className="bg-slate-900 p-6 rounded-[32px] text-emerald-400 font-mono text-[10px] overflow-x-auto shadow-2xl">
                    <pre>{`<Input 
  label="Nome" 
  name="nome" 
  value={value} 
  onChange={handle} 
/>`}</pre>
                    <div className="mt-4 border-t border-white/5 pt-4 text-slate-500 italic">
                      // Componentes exportados de FormField.tsx
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTIONS E CONTAINERS */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Layout size={20} className="text-blue-600" />
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">Containers & Layout</h2>
              </div>
              
              <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                <Section title="Exemplo de Section">
                  <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
                    <MousePointer2 className="text-slate-200 mb-2" size={32} />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Grid Auto-Responsivo (4 Colunas Desktop)</span>
                  </div>
                </Section>
                <div className="mt-6 p-4 bg-slate-900 rounded-2xl text-slate-400 font-mono text-[9px] flex items-center justify-between">
                  <span>Usage: &lt;Section title="Título"&gt; ...content &lt;/Section&gt;</span>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* BOTÕES */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <MousePointer2 size={20} className="text-blue-600" />
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">Ações (Buttons)</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-3">
                  <button className="bg-blue-600 text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-600/20">Primário</button>
                  <span className="text-[8px] font-black uppercase text-center text-slate-400">Main Action</span>
                </div>
                <div className="flex flex-col gap-3">
                  <button className="bg-emerald-600 text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-600/20">Sucesso</button>
                  <span className="text-[8px] font-black uppercase text-center text-slate-400">Save / Approve</span>
                </div>
                <div className="flex flex-col gap-3">
                  <button className="bg-slate-900 text-white p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-slate-900/10">Escuro</button>
                  <span className="text-[8px] font-black uppercase text-center text-slate-400">Global Settings</span>
                </div>
                <div className="flex flex-col gap-3">
                  <button className="bg-red-50 text-red-600 border border-red-100 p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest">Perigo</button>
                  <span className="text-[8px] font-black uppercase text-center text-slate-400">Delete / Reset</span>
                </div>
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  );
};
