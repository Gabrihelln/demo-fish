
import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Globe, Trash2, Server, Key, Upload, RefreshCw, CheckCircle, X, 
  ChevronRight, AlertTriangle, Database, Loader2, DollarSign, Users as UsersIcon, 
  ArrowLeft, Check, Clipboard, Settings2, ShieldCheck, DatabaseZap, PartyPopper
} from 'lucide-react';
import { useApp } from '../AppContext';
import { Member, Mensalidade, Tenant } from '../types';
import { EMPTY_MEMBER } from '../constants';

type AdminStep = 'LIST' | 'CREATE' | 'MIGRATE';

interface MigrationFeedback {
  isOpen: boolean;
  success: boolean;
  count: number;
  tenantName: string;
  type: 'socios' | 'mensalidades';
}

const SOCIO_FIELD_MAP: Record<string, string[]> = {
  codigo_socio: ["Codigo do Socio", "matricula", "inscricao"],
  data_admissao: ["Data de Admissao"],
  codigo_antigo: ["Codigo Antigo"],
  recadastro: ["Recadastro"],
  codigo_delegacia: ["Codigo Delegacia"],
  codigo_comunidade: ["Cod Comunidade", "Comunidade"],
  data_nascimento: ["Data de Nascimentos", "Nascimento"],
  nome: ["Nome", "Associado"],
  apelido: ["Apelido"],
  nome_pai: ["Pai", "Nome do Pai"],
  nome_mae: ["Mae", "Nome da Mae"],
  estado_civil: ["Estado Civil"],
  conjuge: ["Conjuge"],
  nacionalidade: ["Nacionalidade"],
  naturalidade: ["Naturalidade"],
  uf_naturalidade: ["UF Naturalidade"],
  endereco: ["Endereço", "Endereco"],
  numero: ["Num", "Numero"],
  bairro: ["Bairro"],
  cidade: ["Cidade"],
  uf: ["Uf"],
  cep: ["CEP"],
  complemento: ["Complemento"],
  ponto_referencia: ["Pt de Referencia", "Ponto de Referencia"],
  telefone: ["Telefone", "Celular"],
  profissao: ["Profissao"],
  empregador: ["Empregador"],
  local_trabalho: ["Loc Trabalho", "Local de Trabalho"],
  alfabetizado: ["Alfabetizado"],
  escolaridade: ["Escolaridade"],
  rg: ["RG"],
  orgao_expedidor_rg: ["SSP", "Orgao Expedidor"],
  data_expedicao_rg: ["Dt Expedição Rg", "Data Expedicao RG"],
  cpf: ["CPF", "c.p.f", "C P F"],
  ctps: ["Ctps"],
  serie_ctps: ["Série", "Serie CTPS"],
  data_expedicao_ctps: ["Expedição CTPS", "Data Expedicao CTPS"],
  titulo_eleitor: ["Titulo", "Titulo de Eleitor"],
  zona_eleitoral: ["Zona"],
  secao_eleitoral: ["Seção", "Secao"],
  cir: ["CIR"],
  embarcacao: ["Embarcacao"],
  embarcacao_rgp: ["Emb_RGP"],
  rgp_uf: ["RGP_UF"],
  ab: ["AB"],
  numero_tripulantes: ["NR_tripulantes"],
  cpf_proprietario: ["CPF_proprietario"],
  quantidade_membros_familia: ["Qtd de Memb na Familia"],
  renda_familiar: ["Renda Familiar"],
  inscricao_incra: ["Insc incra"],
  area_fazenda: ["Area_da_Fazenda"],
  livro: ["Livro"],
  folha: ["Folha"],
  numero_termo: ["Num Termo"],
  nit: ["NIT"],
  pis: ["PIS"],
  cei: ["CEI"],
  caepf: ["CAEPF"],
  numero_propriedade_receita_federal: ["Nº prop Rec Federal"],
  data_emissao_rgp: ["Emissao_RGP"],
  codigo_categoria: ["Cod Categoria"],
  situacao: ["Situação", "Situacao"],
  ultimo_mes_pago: ["Ult Mes Pago"],
  numero_beneficio: ["Num Beneficio"],
  especie: ["especie"],
  data_transferencia: ["Data Transferencia"],
  data_falecimento: ["Dt de Falicimento", "Data Falecimento"],
  observacao: ["Observação", "Observacao"],
  foto: ["Foto"],
  local_foto: ["local_Foto"],
  webcam: ["webcan"],
  sexo: ["Sexo"],
  data_ultimo_pagamento: ["Data do Ult pagamento"],
  primeira_data_pagamento: ["1a_Data_pag"],
  ultimo_dia_pago: ["Ult_dia_pago"],
  destino_transferencia: ["Pra onde foi transferido"],
  data_ultimo_movimento: ["Data Ult Movimento"],
  pasta_socios: ["Pasta_Socios"],
  pasta_embarcacao: ["Pasta_Embarcacao"],
  email: ["Email"],
  id_defeso: ["ID_Defeso"],
  numero_dap: ["NR_DAP"],
  grupo_dap: ["GRUPO_DAP"],
  validade_dap: ["Validade_DAP"],
  tem_defeso: ["Tem_Defeso"],
  tipo_sanguineo: ["Tipo_Sangue"],
  sus: ["SUS"],
  outros_documentos: ["OutrosDocumentos"],
  situacao_mpa: ["Situacao_MPA"],
  codigo_gps_mpa: ["CodGPS_MPA"],
  senha_gps_mpa: ["SenhaGPS_MPA"],
  senha_inss_mpa: ["SenhaINSS_MPA"]
};

const MENSALIDADE_FIELD_MAP: Record<string, string[]> = {
  id: ["id_Mensalidade", "id_mensalidade"],
  codigo_mensalidade: ["Codigo da Mensalidade", "codigo_mensalidade"],
  data: ["Dat", "data"],
  codigo_socio: ["Codigo do Socio", "codigo_socio"],
  data_ultimo_mes_pago: ["Data do Ultimo Mes Pago", "data_ultimo_mes_pago"],
  quantidade_meses: ["Qtd mes", "quantidade_meses"],
  data_ate_quando_pagar: ["Data ate Qd quer Pagar", "data_ate_quando_pagar"],
  valor: ["Valor", "valor"],
  desconto_valor: ["Desconto em Real", "desconto_valor"],
  desconto_percentual: ["Desconto em Percentual", "desconto_percentual"],
  valor_desconto_percentual: ["Vlr Desc Perc", "valor_desconto_percentual"],
  valor_total: ["Valor Total", "valor total", "valor_total"]
};

const SOCIO_DATE_FIELDS = [
  'data_admissao', 'recadastro', 'data_nascimento', 'data_expedicao_rg', 
  'data_expedicao_ctps', 'data_emissao_rgp', 'data_falecimento', 
  'data_transferencia', 'validade_dap', 'data_ultimo_pagamento', 
  'primeira_data_pagamento', 'ultimo_dia_pago', 'data_ultimo_movimento'
];

const MENSALIDADE_DATE_FIELDS = [
  'data', 'data_ultimo_mes_pago', 'data_ate_quando_pagar'
];

const CURRENCY_FIELDS = [
  'valor', 'desconto_valor', 'valor_desconto_percentual', 'valor_total', 'quantidade_meses'
];

export const AdminPainelView: React.FC = () => {
  const { 
    members, mensalidades, tenants, addTenant, deleteTenant, syncData, importMembers, importMensalidades 
  } = useApp();

  const [currentStep, setCurrentStep] = useState<AdminStep>('LIST');
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tenantForm, setTenantForm] = useState({ name: '', username: '', password: '' });
  
  const [activeTab, setActiveTab] = useState<'socios' | 'mensalidades'>('socios');
  const [pendingData, setPendingData] = useState<any[] | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isImporting, setIsImporting] = useState(false);

  const [feedback, setFeedback] = useState<MigrationFeedback>({
    isOpen: false, success: false, count: 0, tenantName: '', type: 'socios'
  });

  const normalize = (str: string) => 
    String(str || "").toLowerCase().trim()
       .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

  const analyzeFile = (sample: any) => {
    const newMapping: Record<string, string> = {};
    const keys = Object.keys(sample);
    const currentMap = activeTab === 'socios' ? SOCIO_FIELD_MAP : MENSALIDADE_FIELD_MAP;
    
    keys.forEach(key => {
      const normalizedKey = normalize(key);
      for (const [field, synonyms] of Object.entries(currentMap)) {
        if (synonyms.some(syn => normalize(syn) === normalizedKey)) {
          newMapping[key] = field;
          break;
        }
      }
    });
    setMapping(newMapping);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const dataArray = Array.isArray(json) ? json : [json];
        setPendingData(dataArray);
        analyzeFile(dataArray[0]);
      } catch (err) { 
        alert("Arquivo JSON inválido."); 
      }
    };
    reader.readAsText(file);
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newId = await addTenant(tenantForm.name, tenantForm.username, tenantForm.password);
      const newTenant = { id: newId || '', name: tenantForm.name, adminUsername: tenantForm.username, isActive: true, createdAt: '', updatedAt: '' };
      setActiveTenant(newTenant);
      setCurrentStep('MIGRATE');
    } catch (err) {
      alert("Erro ao criar unidade.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const finalizeMigration = async () => {
    if (!pendingData || !activeTenant) return;
    setIsImporting(true);
    try {
      if (activeTab === 'socios') {
        const converted = pendingData.map(oldItem => {
          const newItem: any = { 
            ...EMPTY_MEMBER, 
            id: crypto.randomUUID(), 
            isSynced: false 
          };
          
          Object.keys(mapping).forEach(oldKey => {
            const targetField = mapping[oldKey];
            let value = oldItem[oldKey];

            if (targetField === 'cpf' && typeof value === 'string') {
                value = value.replace(/\D/g, '');
            }
            if (SOCIO_DATE_FIELDS.includes(targetField) && typeof value === 'string' && value.trim()) {
                value = value.split(' ')[0].substring(0, 10);
                if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) value = "";
            }

            newItem[targetField] = String(value || "");
          });
          
          newItem.tenant_id = activeTenant.id;
          return newItem as Member;
        });

        await importMembers(converted);
        await syncData([...members, ...converted]);
      } else {
        const converted = pendingData.map(item => {
          const newItem: any = { 
            id: crypto.randomUUID(), 
            tenant_id: activeTenant.id,
            isSynced: false,
            codigo_mensalidade: '',
            data: '',
            codigo_socio: '',
            data_ultimo_mes_pago: '',
            quantidade_meses: '1',
            data_ate_quando_pagar: '',
            valor: '0',
            desconto_valor: '0',
            desconto_percentual: '0',
            valor_desconto_percentual: '0',
            valor_total: '0',
            observacao: ''
          };

          Object.keys(mapping).forEach(oldKey => {
            const targetField = mapping[oldKey];
            let value = item[oldKey];

            // Limpeza de campos de data para mensalidades
            if (MENSALIDADE_DATE_FIELDS.includes(targetField) && typeof value === 'string' && value.trim()) {
                value = value.split(' ')[0].substring(0, 10);
                if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) value = "";
            }

            // Limpeza de campos monetários e inteiros
            if (CURRENCY_FIELDS.includes(targetField) && typeof value === 'string') {
                value = value.replace(/[^\d,.-]/g, '').replace(',', '.');
            }

            // CORREÇÃO UUID (PGRST204 / 22P02):
            if (targetField === 'id' && value) {
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value));
                if (isUuid) {
                  newItem.id = String(value);
                } else {
                  if (!newItem.codigo_mensalidade || newItem.codigo_mensalidade === '') {
                    newItem.codigo_mensalidade = String(value);
                  }
                }
            } else {
                newItem[targetField] = String(value || "");
            }
          });

          return newItem as Mensalidade;
        });
        
        await importMensalidades(converted);
        await syncData(undefined, undefined, undefined, [...mensalidades, ...converted]);
      }
      
      setFeedback({ isOpen: true, success: true, count: pendingData.length, tenantName: activeTenant.name, type: activeTab });
      setPendingData(null);
    } catch (e) {
      console.error(e);
      setFeedback({ isOpen: true, success: false, count: 0, tenantName: activeTenant.name, type: activeTab });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* FEEDBACK MODAL */}
      {feedback.isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setFeedback(prev => ({...prev, isOpen: false}))} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[48px] shadow-2xl relative z-10 overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300">
            <div className="p-12 text-center">
              <div className={`w-24 h-24 ${feedback.success ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'} rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner animate-in slide-in-from-top-4`}>
                {feedback.success ? <PartyPopper size={48} /> : <AlertTriangle size={48} />}
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">
                {feedback.success ? 'Migração Concluída' : 'Falha na Migração'}
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed uppercase tracking-tight">
                {feedback.success ? (
                  <>Foram processados <span className="text-blue-600 font-black">{feedback.count}</span> registros de {feedback.type} para a unidade <span className="text-slate-900 dark:text-white font-black">{feedback.tenantName}</span>.</>
                ) : (
                  <>Ocorreu um erro durante o processamento dos dados. Verifique o console para detalhes técnicos.</>
                )}
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => setFeedback(prev => ({...prev, isOpen: false}))}
                  className="w-full bg-slate-900 dark:bg-blue-600 text-white py-5 rounded-[28px] font-black uppercase text-[11px] tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-900/10"
                >
                  Continuar no Painel
                </button>
                {feedback.success && (
                  <button 
                    onClick={() => { setFeedback(prev => ({...prev, isOpen: false})); setCurrentStep('LIST'); }}
                    className="w-full bg-slate-50 dark:bg-slate-800 text-slate-400 py-5 rounded-[28px] font-black uppercase text-[10px] tracking-widest hover:text-blue-600 transition-all"
                  >
                    Voltar para Listagem
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP INDICATOR */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1 w-full">
          {[
            { id: 'LIST', label: 'Unidades', icon: Globe },
            { id: 'CREATE', label: 'Nova Unidade', icon: Plus },
            { id: 'MIGRATE', label: 'Migração & Dados', icon: DatabaseZap }
          ].map((s, idx) => (
            <div key={s.id} className="flex items-center flex-1">
              <button 
                disabled={s.id === 'MIGRATE' && !activeTenant}
                onClick={() => setCurrentStep(s.id as AdminStep)}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${
                  currentStep === s.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                } disabled:opacity-30`}
              >
                <s.icon size={16} /> {s.label}
              </button>
              {idx < 2 && <ChevronRight size={14} className="mx-2 text-slate-200" />}
            </div>
          ))}
        </div>
      </div>

      {/* VIEW: LISTAGEM */}
      {currentStep === 'LIST' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Gerenciamento de Unidades</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Todas as colônias e regionais cadastradas</p>
            </div>
            <button onClick={() => setCurrentStep('CREATE')} className="bg-slate-900 dark:bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform">
              Adicionar Nova Regional
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map(t => (
              <div key={t.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[40px] shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <ShieldCheck size={120} />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl text-blue-600">
                      <Globe size={24} />
                    </div>
                    <button onClick={() => deleteTenant(t.id)} className="text-slate-200 hover:text-red-500 transition-colors p-2"><Trash2 size={18} /></button>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {t.id.split('-')[0]}...</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setActiveTenant(t); setCurrentStep('MIGRATE'); }}
                      className="flex-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                    >
                      Gerenciar Dados
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: CRIAÇÃO */}
      {currentStep === 'CREATE' && (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[48px] shadow-2xl overflow-hidden animate-in zoom-in-95">
          <div className="p-12 text-center border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/20">
              <Plus size={36} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Nova Unidade Regional</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Crie o acesso para uma nova colônia ou entidade</p>
          </div>
          <form onSubmit={handleCreateTenant} className="p-12 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome da Unidade</label>
              <input 
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-600/5"
                placeholder="Ex: Colônia de Pescadores Z-10"
                value={tenantForm.name}
                onChange={e => setTenantForm({...tenantForm, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Usuário de Acesso</label>
                <input 
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-600/5"
                  placeholder="admin.z10"
                  value={tenantForm.username}
                  onChange={e => setTenantForm({...tenantForm, username: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Senha Mestre</label>
                <input 
                  required
                  type="password"
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-600/5"
                  placeholder="••••••••"
                  value={tenantForm.password}
                  onChange={e => setTenantForm({...tenantForm, password: e.target.value})}
                />
              </div>
            </div>
            <button 
              disabled={isSubmitting}
              type="submit" 
              className="w-full bg-blue-600 text-white py-6 rounded-[28px] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <><Check size={18}/> Criar e Avançar</>}
            </button>
          </form>
        </div>
      )}

      {/* VIEW: MIGRAÇÃO */}
      {currentStep === 'MIGRATE' && activeTenant && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="bg-slate-900 text-white p-12 rounded-[48px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Settings2 size={120} />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">Unidade Ativa</span>
                  <span className="text-slate-500 font-mono text-[10px]">{activeTenant.id}</span>
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{activeTenant.name}</h2>
                <p className="text-slate-400 text-sm font-medium mt-4 max-w-lg uppercase tracking-widest text-[10px]">Prepare a base de dados importando arquivos JSON de sistemas anteriores</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setCurrentStep('LIST')} className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Voltar p/ Lista</button>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[48px] p-12 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                <button onClick={() => { setActiveTab('socios'); setPendingData(null); }} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'socios' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-400'}`}>Importar Sócios</button>
                <button onClick={() => { setActiveTab('mensalidades'); setPendingData(null); }} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'mensalidades' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Importar Mensalidades</button>
              </div>
            </div>

            {!pendingData ? (
              <div className="border-4 border-dashed border-slate-50 dark:border-slate-800 rounded-[40px] p-24 text-center group hover:border-blue-600 transition-all relative cursor-pointer">
                <input type="file" accept=".json" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 group-hover:text-blue-600 transition-colors">
                  <Upload size={32} />
                </div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Arraste seu arquivo JSON aqui</p>
                <p className="text-[10px] font-bold text-slate-300 uppercase mt-2">Os dados serão automaticamente vinculados a {activeTenant.name}</p>
              </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-bottom-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Object.entries(mapping).map(([oldKey, newKey]) => (
                    <div key={oldKey} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col">
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate" title={oldKey}>{oldKey}</span>
                      <span className="text-[9px] font-black text-blue-600 uppercase flex items-center gap-1 truncate">
                        <Check size={10} /> {newKey}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4">
                  <button 
                    disabled={isImporting}
                    onClick={finalizeMigration}
                    className="flex-1 bg-emerald-600 text-white py-6 rounded-[28px] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                  >
                    {isImporting ? <Loader2 className="animate-spin" /> : <><Database size={18}/> Processar {pendingData.length} Registros</>}
                  </button>
                  <button onClick={() => setPendingData(null)} className="px-10 py-6 rounded-[28px] border border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">Cancelar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
