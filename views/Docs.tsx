
import React, { useState } from 'react';
import { 
  BookOpen, ChevronRight, Layout, Database, 
  Users, FileText, Settings, ShieldCheck, 
  RefreshCw, Cloud, Upload, Code, Info, UserPlus,
  MapPin, Tags, FileSignature, Files, BarChart2,
  CheckCircle2, Zap, Sun, Moon, Palette, Terminal,
  MousePointer2, AlertTriangle, MessageSquare, 
  Layers, Sparkles, CheckCircle, X, ShieldAlert,
  ChevronDown, Type, Box, Grid, Smartphone
} from 'lucide-react';
import { Section } from '../components/Section';

export const DocsView: React.FC = () => {
  const [activeDocTab, setActiveDocTab] = useState('introducao');

  const menu = [
    { id: 'introducao', label: 'Visão Geral', icon: Info },
    { id: 'design-ui', label: 'Design & Componentes', icon: Palette },
    { id: 'arquitetura', label: 'Arquitetura Técnica', icon: Code },
    { id: 'usuario', label: 'Manual Operacional', icon: Users },
    { id: 'admin', label: 'Painel Master', icon: ShieldCheck },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-10 animate-in fade-in duration-500 pb-20">
      {/* SIDE NAV DOCS */}
      <aside className="w-full lg:w-80 shrink-0 space-y-2 lg:sticky lg:top-32 h-fit">
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 px-4 flex items-center gap-3">
          <BookOpen className="text-blue-600" size={24} />
          Documentação
        </h2>
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveDocTab(item.id)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeDocTab === item.id 
                ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xl shadow-slate-900/10' 
                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200'
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
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[48px] p-10 lg:p-16 shadow-sm overflow-hidden min-h-[70vh]">
        
        {activeDocTab === 'introducao' && (
          <article className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4">
              <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-600/20">
                <Sparkles size={32} />
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter m-0 leading-none">Sistema de Gestão<br/>de Associados (SGA)</h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
                Plataforma Local-First desenvolvida para máxima performance. Uma solução robusta que garante a operação em campo com ou sem conectividade, unindo estética moderna e engenharia de precisão.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100 dark:border-slate-800">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                  <Zap size={14} /> Core Features
                </h4>
                <ul className="space-y-3 m-0 p-0 list-none">
                  {[
                    'Sincronização Ativa & Reativa',
                    'Persistence Local via IndexedDB V6',
                    'Sanitização Automática de Dados',
                    'Multi-Tenancy por TenantID',
                    'Interface Adaptativa (Dark/Light)'
                  ].map((text, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <CheckCircle size={14} className="text-emerald-500" /> {text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-[32px] border border-blue-100 dark:border-blue-900/30">
                <h4 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2"><ShieldCheck size={14}/> Integridade Local</h4>
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed m-0 uppercase tracking-tight">
                  Priorizamos a experiência "Zero Latency". Cada alteração é persistida localmente antes de qualquer tentativa de rede, assegurando que o trabalho nunca seja interrompido.
                </p>
              </div>
            </div>
          </article>
        )}

        {activeDocTab === 'design-ui' && (
          <article className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Design System & UI Components</h1>
            
            <div className="space-y-10">
              {/* TIPOGRAFIA */}
              <section className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                  <Type size={18} /> Tipografia & Texto
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <p className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Inter Black</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Headers Principais & Títulos</p>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                      Utilizamos a fonte <strong>Inter</strong> em toda a interface. Títulos usam <code>font-black</code> com <code>tracking-tighter</code> para um aspecto editorial e tecnológico. Subtítulos e rótulos utilizam <code>tracking-widest</code> para máxima legibilidade em tamanhos pequenos.
                    </p>
                  </div>
                </div>
              </section>

              {/* CONTAINERS & GRIDS */}
              <section className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <Box size={18} /> Containers & Grids
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[48px] shadow-sm">
                    <Grid size={24} className="text-blue-600 mb-4" />
                    <h4 className="text-[10px] font-black uppercase text-slate-800 dark:text-white mb-2">Grid Adaptativo</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed">Layouts baseados em colunas flexíveis (1 a 4 colunas) usando <code>grid-cols</code> do Tailwind CSS.</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[48px] shadow-sm">
                    <Layout size={24} className="text-blue-600 mb-4" />
                    <h4 className="text-[10px] font-black uppercase text-slate-800 dark:text-white mb-2">Border Radius</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed">Padronização de curvas extremas (<code>rounded-[48px]</code>) para containers e (<code>rounded-2xl</code>) para inputs.</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[48px] shadow-sm">
                    <Smartphone size={24} className="text-blue-600 mb-4" />
                    <h4 className="text-[10px] font-black uppercase text-slate-800 dark:text-white mb-2">Containers</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed">Seções delimitadas com <code>max-w-[1600px]</code> e padding responsivo (<code>p-8</code> a <code>p-12</code>).</p>
                  </div>
                </div>
              </section>

              {/* COMPONENTES DE FORMULÁRIO */}
              <section className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <Layers size={18} /> Componentes de Formulário
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Input Style</label>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-xs font-bold text-slate-300">Exemplo de Digitação...</div>
                      </div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed">
                        <code>Input</code>: Bordas suaves, background contrastante e <code>focus:ring-4</code> para acessibilidade visual.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Style</label>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-xs font-bold text-slate-300 flex justify-between items-center">
                          Opções de Lista <ChevronDown size={14}/>
                        </div>
                      </div>
                      <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed">
                        <code>Select</code>: Custom dropdown removendo o estilo nativo (<code>appearance-none</code>) e injetando ícones Lucide.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* BOTÕES E ALERTAS */}
              <section className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <MousePointer2 size={18} /> Interações, Botões & Alertas
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[40px] space-y-6">
                    <h4 className="text-[10px] font-black uppercase text-blue-600 mb-4 tracking-widest">Hierarchy of Actions</h4>
                    <div className="flex flex-wrap gap-4">
                      <button className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-600/20 hover:-translate-y-1 transition-all">Primary Action</button>
                      <button className="bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:-translate-y-1 transition-all">Success</button>
                      <button className="bg-white dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700 px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest">Outline</button>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[40px] space-y-4 shadow-sm border-l-4 border-l-red-500">
                    <div className="flex items-center gap-4">
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-2xl text-red-600"><AlertTriangle size={20}/></div>
                      <h4 className="text-[11px] font-black uppercase text-slate-800 dark:text-white">Alertas de Segurança</h4>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase m-0">
                      Modais de erro e confirmação utilizam <code>backdrop-blur-md</code> e animações <code>zoom-in</code> para garantir foco total do usuário em decisões críticas.
                    </p>
                  </div>
                </div>
              </section>

              {/* CORES E TEMAS */}
              <section className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <Palette size={18} /> Paleta & Tematização
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="h-32 bg-blue-600 rounded-3xl flex flex-col justify-end p-4 text-white shadow-xl shadow-blue-600/20">
                    <span className="text-[8px] font-black uppercase opacity-60">Brand</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">#2563EB</span>
                  </div>
                  <div className="h-32 bg-slate-900 rounded-3xl flex flex-col justify-end p-4 text-white">
                    <span className="text-[8px] font-black uppercase opacity-60">Background Dark</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">#0F172A</span>
                  </div>
                  <div className="h-32 bg-emerald-600 rounded-3xl flex flex-col justify-end p-4 text-white">
                    <span className="text-[8px] font-black uppercase opacity-60">Success</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">#059669</span>
                  </div>
                  <div className="h-32 bg-white border border-slate-200 rounded-3xl flex flex-col justify-end p-4 text-slate-400">
                    <span className="text-[8px] font-black uppercase opacity-40">Surface Light</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">#FFFFFF</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-6 px-4">
                  <div className="flex items-center gap-2">
                    <Sun size={14} className="text-amber-500" />
                    <span className="text-[9px] font-black uppercase text-slate-400">Light Mode (Base)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Moon size={14} className="text-blue-500" />
                    <span className="text-[9px] font-black uppercase text-slate-400">Dark Mode (Elevated)</span>
                  </div>
                </div>
              </section>
            </div>
          </article>
        )}

        {activeDocTab === 'arquitetura' && (
          <article className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Arquitetura Técnica</h1>
            
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="bg-slate-900 dark:bg-blue-600 p-4 rounded-2xl text-white shadow-lg"><Database size={24} /></div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-slate-800 dark:text-slate-100">IndexedDB (Local-First)</h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    O sistema utiliza o IndexedDB para persistência persistente no navegador. O banco <strong>SGA_DATABASE_V6</strong> gerencia stores isoladas para Sócios, Categorias e Localidades, garantindo que o app inicie instantaneamente.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg"><RefreshCw size={24} /></div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-slate-800 dark:text-slate-100">Sincronização Reativa</h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Implementamos um gatilho reativo no <code>AppContext</code>. Ao detectar que o usuário logou, o sistema inicia automaticamente o <code>syncData()</code>, buscando atualizações da nuvem e enviando alterações locais pendentes.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="bg-emerald-600 p-4 rounded-2xl text-white shadow-lg"><Terminal size={24} /></div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-slate-800 dark:text-slate-100">Sanitização de Dados</h3>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Nossa camada de serviço limpa CPFs (remove pontuação) e Datas (remove timestamps) antes de exibir ou salvar, mantendo a integridade semântica dos dados entre sistemas legados e o Supabase.
                  </p>
                </div>
              </div>
            </div>
          </article>
        )}

        {activeDocTab === 'usuario' && (
          <article className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Manual Operacional</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Guia Prático para o dia a dia</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: UserPlus, label: 'Cadastro de Sócios', desc: 'Preencha as três abas (Frente, Outros, Verso) para um perfil completo.' },
                { icon: Tags, label: 'Categorias', desc: 'Organize associados por modalidade de pesca ou tipo de sócio.' },
                { icon: MapPin, label: 'Localidades', desc: 'Mapeie as comunidades para gerar relatórios geográficos precisos.' },
                { icon: FileSignature, label: 'Gerador de Documentos', desc: 'Use variáveis como {{nome}} para preenchimento automático.' },
              ].map((item, i) => (
                <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex gap-4">
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm h-fit text-blue-600"><item.icon size={20} /></div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase text-slate-800 dark:text-slate-100">{item.label}</h4>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed uppercase mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-8 rounded-[32px] border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-6">
              <div className="bg-emerald-600 text-white p-4 rounded-2xl"><CheckCircle2 size={24}/></div>
              <p className="text-[11px] font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-tight leading-relaxed">
                Toda alteração feita é salva LOCALMENTE no momento da digitação. Não se preocupe em perder dados se a conexão cair!
              </p>
            </div>
          </article>
        )}

        {activeDocTab === 'admin' && (
          <article className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Manual do Administrador Mestre</h1>
            
            <Section title="Migração de Dados Legados">
              <div className="col-span-full space-y-4">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                  O SGA permite importar arquivos JSON de sistemas antigos. Nosso motor de mapeamento identifica colunas similares e aplica sanitização em massa:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <h5 className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200 mb-2">Sanitização de Datas</h5>
                    <p className="text-[9px] font-bold text-slate-500">Converte "1990-01-01 00:00:00" em "1990-01-01" automaticamente.</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <h5 className="text-[10px] font-black uppercase text-slate-800 dark:text-slate-200 mb-2">Limpeza de CPF</h5>
                    <p className="text-[9px] font-bold text-slate-500">Remove pontos e traços para evitar duplicidade e erro de busca.</p>
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Isolamento de Unidades">
              <div className="col-span-full space-y-4">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                  Ao criar uma Unidade no Painel Admin, o sistema gera um identificador único (Tenant ID). Todos os dados criados pelos usuários dessa unidade serão marcados com esse ID, garantindo que colônias diferentes nunca vejam dados uma da outra.
                </p>
              </div>
            </Section>
          </article>
        )}
      </div>
    </div>
  );
};
