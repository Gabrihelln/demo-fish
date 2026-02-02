
import React, { useState } from 'react';
import { 
  BookOpen, ChevronRight, Layout, Database, 
  Users, FileText, Settings, ShieldCheck, 
  RefreshCw, Cloud, Upload, Code, Info, UserPlus,
  MessageSquare, MapPin, Fish, Tags, Receipt, Wallet,
  CalendarDays, Landmark, FileSignature, Files, BarChart2,
  ShieldAlert, UserCheck, Type, MousePointer2, Palette,
  Box, Terminal, Layers, Sparkles
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
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter mb-8 px-4 flex items-center gap-3">
          <BookOpen className="text-blue-600" size={24} />
          Guia do Sistema
        </h2>
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
                <Sparkles size={32} />
              </div>
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter m-0">Visão Geral do SGA</h1>
              <p className="text-lg text-slate-500 font-medium leading-relaxed">
                O Sistema de Gestão de Associados (SGA) é uma plataforma "Offline-First" projetada para operar em cenários de conectividade instável, mantendo a integridade dos dados e a produtividade administrativa em campo.
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
                <div className="bg-slate-900 p-4 rounded-2xl text-white shadow-lg"><Database size={24} /></div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">Camada de Persistência Local (Local-First)</h3>
                  <p className="text-xs font-medium text-slate-500 mt-2 leading-relaxed">
                    O SGA utiliza <strong>IndexedDB</strong> (via SGA_DATABASE_V3) para armazenar membros, templates e sessões no navegador do usuário. Isso permite que o sistema seja recarregado e utilizado sem internet, garantindo latência zero.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg"><RefreshCw size={24} /></div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-slate-800">Lógica de Sincronização</h3>
                  <p className="text-xs font-medium text-slate-500 mt-2 leading-relaxed">
                    A sincronização funciona em dois estágios: 
                    <br/><strong>1. Push:</strong> Identifica registros locais com flag `isSynced: false` e envia para o Supabase via operações em lote.
                    <br/><strong>2. Pull:</strong> Recupera registros remotos filtrados pelo `tenant_id` da sessão ativa para manter o estado local atualizado.
                  </p>
                </div>
              </div>
            </div>
          </article>
        )}

        {activeDocTab === 'usuario' && (
          <article className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Manual Operacional</h1>
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
                  <div key={i} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all flex gap-4 group">
                    <div className="bg-white p-3 rounded-2xl shadow-sm h-fit group-hover:bg-blue-600 group-hover:text-white transition-colors"><item.icon size={20} className={item.iconColor || 'text-slate-600'} /></div>
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
                <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 group hover:bg-emerald-50 transition-colors">
                  <CalendarDays size={20} className="text-emerald-600 mb-3" />
                  <h4 className="text-[10px] font-black uppercase text-slate-800">Mensalidades</h4>
                  <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase mt-1">Lançamento e baixa de parcelas mensais dos sócios com histórico de pagamentos.</p>
                </div>
                <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 group hover:bg-emerald-50 transition-colors">
                  <UserCheck size={20} className="text-emerald-600 mb-3" />
                  <h4 className="text-[10px] font-black uppercase text-slate-800">Filiações</h4>
                  <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase mt-1">Taxas de adesão para novos associados no momento da matrícula.</p>
                </div>
                <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 group hover:bg-emerald-50 transition-colors">
                  <Landmark size={20} className="text-emerald-600 mb-3" />
                  <h4 className="text-[10px] font-black uppercase text-slate-800">Contribuição Sindical</h4>
                  <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase mt-1">Gestão de tributos e taxas anuais obrigatórias por lei.</p>
                </div>
              </div>
            </div>

            {/* MÓDULO DOCUMENTOS */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-amber-600 flex items-center gap-3">
                <FileText size={18} /> Módulo 03: Documentação e Pendências
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-white border border-slate-200 rounded-3xl flex gap-4 hover:border-amber-200 transition-all">
                  <div className="bg-amber-50 p-3 rounded-2xl text-amber-600"><FileSignature size={20} /></div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase text-slate-800">Declarações e Recursos</h4>
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase mt-1">Gestão de pendências administrativas, defesos e recursos de segurados.</p>
                  </div>
                </div>
                <div className="p-6 bg-white border border-slate-200 rounded-3xl flex gap-4 hover:border-blue-200 transition-all">
                  <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><Files size={20} /></div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase text-slate-800">Editor de Papel Timbrado</h4>
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase mt-1">Criação de modelos dinâmicos que puxam dados automáticos do associado.</p>
                  </div>
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
                  Como Super Admin, você controla a expansão do sistema através da criação de novas Unidades. Cada unidade representa um isolamento lógico de dados.
                </p>
                <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="p-3 bg-white rounded-xl shadow-sm"><ShieldCheck size={20} className="text-blue-600"/></div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                    Acesso Restrito: Apenas usuários com role MASTER podem visualizar o painel de licenças.
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Migração de Dados JSON">
              <div className="col-span-full space-y-4">
                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                  O importador utiliza um <strong>Mapeamento Inteligente</strong>:
                  <br/>1. Correspondência direta de cabeçalhos.
                  <br/>2. Busca por sinônimos (ex: "Sócio" &rarr; "Nome").
                  <br/>3. Busca inclusiva (ex: "End" &rarr; "Endereco").
                </p>
              </div>
            </Section>
          </article>
        )}

        {activeDocTab === 'componentes' && ( activeDocTab === 'componentes' && (
          <article className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Design System & Componentes</h1>
              <p className="text-sm font-medium text-slate-500 leading-relaxed">
                Nossa interface segue os princípios do "Neobrutalismo Moderno": alta legibilidade, bordas suaves de grande raio e sombras projetadas que definem a hierarquia visual.
              </p>
            </div>

            {/* GUIA DE ESTILO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-10 rounded-[48px] border border-slate-100 shadow-inner">
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <Palette size={16} /> Paleta de Cores Mestra
                </h3>
                <div className="flex flex-wrap gap-4">
                  {[
                    { bg: 'bg-blue-600', label: 'Primary', hex: '#2563eb' },
                    { bg: 'bg-slate-900', label: 'Accent', hex: '#0f172a' },
                    { bg: 'bg-emerald-500', label: 'Success', hex: '#10b981' },
                    { bg: 'bg-amber-500', label: 'Alert', hex: '#f59e0b' },
                  ].map((color, i) => (
                    <div key={i} className="group flex flex-col items-center gap-2">
                      <div className={`w-16 h-16 ${color.bg} rounded-3xl shadow-lg transition-transform hover:scale-110 cursor-pointer`} />
                      <span className="text-[8px] font-black uppercase text-slate-500">{color.label}</span>
                      <span className="text-[7px] font-mono text-slate-400">{color.hex}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <Type size={16} /> Tipografia (Font: Inter)
                </h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-600 pl-4">
                    <p className="text-2xl font-black uppercase tracking-tighter text-slate-900">Black 900</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Títulos & Headings</p>
                  </div>
                  <div className="border-l-4 border-slate-200 pl-4">
                    <p className="text-base font-bold text-slate-700">Bold 700</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Labels & Destaques</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FORM COMPONENTS */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Box size={20} className="text-blue-600" />
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">Entradas de Dados (FormFields)</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">Galeria de Inputs</h4>
                  <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
                    <Input label="Input Texto Padrão" name="ex1" value="" onChange={() => {}} placeholder="Ex: Nome Completo" />
                    <Select label="Select Personalizado" name="ex2" options={['Opção A', 'Opção B']} value="" onChange={() => {}} />
                    <TextArea label="Área de Texto" name="ex3" value="" onChange={() => {}} placeholder="Descrição longa..." />
                  </div>
                </div>
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2 flex items-center gap-2">
                    <Terminal size={14} /> Exemplo de Uso (React)
                  </h4>
                  <div className="bg-slate-950 p-8 rounded-[40px] text-emerald-400 font-mono text-[11px] overflow-x-auto shadow-2xl relative group">
                    <div className="absolute top-4 right-4 text-slate-700"><Code size={20}/></div>
                    <pre>{`import { Input } from './components/FormField';

<Input 
  label="Nome Completo"
  name="nome"
  value={member.nome}
  onChange={handleChange}
  placeholder="Digite o nome..."
/>`}</pre>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <MousePointer2 size={20} className="text-blue-600" />
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">Botões de Ação</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Primário', bg: 'bg-blue-600', text: 'text-white', shadow: 'shadow-blue-600/20' },
                  { label: 'Sucesso', bg: 'bg-emerald-600', text: 'text-white', shadow: 'shadow-emerald-600/20' },
                  { label: 'Escuro', bg: 'bg-slate-900', text: 'text-white', shadow: 'shadow-slate-900/10' },
                  { label: 'Alerta', bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100' },
                ].map((btn, i) => (
                  <div key={i} className="flex flex-col gap-3 group">
                    <button className={`${btn.bg} ${btn.text} ${btn.border || ''} p-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg ${btn.shadow || ''} transition-transform hover:-translate-y-1`}>
                      {btn.label}
                    </button>
                    <span className="text-[8px] font-black uppercase text-center text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">Componente Button</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CARDS & SECTIONS */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Layers size={20} className="text-blue-600" />
                <h2 className="text-xl font-black uppercase tracking-tight text-slate-800">Containers & Grid</h2>
              </div>
              
              <div className="bg-slate-50 p-10 rounded-[48px] border border-slate-100">
                <Section title="Section: Agrupamento Lógico">
                  <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[32px] bg-white group hover:border-blue-400 transition-colors">
                    <Layout className="text-slate-200 mb-4 group-hover:text-blue-200" size={48} />
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Layout Flexível com Grid de 4 Colunas</span>
                    <span className="text-[8px] font-bold text-slate-300 mt-2 uppercase tracking-tighter">Responsivo: 1 col (Mob) &rarr; 2 col (Tab) &rarr; 4 col (Desk)</span>
                  </div>
                </Section>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
