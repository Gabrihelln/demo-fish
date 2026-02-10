
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Globe, Trash2, Upload, ChevronRight, AlertTriangle, 
  Database, Loader2, Save, Settings2, ShieldCheck, 
  DatabaseZap, PartyPopper, Check, Landmark, User as UserIcon,
  FileText, Settings, Briefcase, Printer, Archive, Users, DollarSign, PenTool, Layout, Search, X
} from 'lucide-react';
import { useApp } from '../AppContext';
import { Member, Mensalidade, Tenant, TenantDetails, TenantRepresentatives } from '../types';
import { EMPTY_MEMBER } from '../constants';
import { Input, Select } from '../components/FormField';
import { Section } from '../components/Section';
import { UF_OPTIONS, MARITAL_STATUS_OPTIONS } from '../constants';

type AdminStep = 'LIST' | 'CREATE' | 'MIGRATE';

interface MigrationFeedback {
  isOpen: boolean;
  success: boolean;
  count: number;
  tenantName: string;
  type: 'socios' | 'mensalidades' | 'config' | 'import-config';
}

const SOCIO_FIELD_MAP: Record<string, string[]> = {
  codigo_socio: ["Codigo", "Socio", "Matricula", "codigo_socio", "Inscricao"],
  nome: ["Nome", "Associado", "nome", "Nome_Socio"],
  cpf: ["Cpf", "CPF", "cpf"],
  rg: ["Rg", "RG", "rg"],
  data_nascimento: ["Nascimento", "Dt_Nasc", "data_nascimento", "Data_Nasc"],
  cidade: ["Cidade", "municipio", "cidade"],
  uf: ["UF", "uf"],
  bairro: ["Bairro", "bairro"],
  endereco: ["Endereco", "endereco"],
  telefone: ["Telefone", "Fone", "telefone"],
  codigo_comunidade: ["Localidade", "Comunidade", "codigo_comunidade"]
};

const MENSALIDADE_FIELD_MAP: Record<string, string[]> = {
  codigo_socio: ["Codigo", "Socio", "Matricula", "codigo_socio", "Inscricao"],
  valor: ["Valor", "Mensalidade", "valor"],
  data: ["Data", "Pagamento", "data"],
  quantidade_meses: ["Quantidade", "Meses", "quantidade_meses"],
  valor_total: ["Total", "valor_total"]
};

const CONFIG_FIELD_MAP: Record<string, string[]> = {
  nome_entidade: ["Nome Entidade", "Entidade", "nome_entidade"],
  nome_abreviado: ["Nome Abreviado", "nome_abreviado"],
  endereco: ["Endereco", "Enreceço", "endereco"],
  bairro: ["Bairro", "bairro"],
  cidade: ["Cidade", "cidade"],
  uf: ["Uf", "uf"],
  cep: ["CEP", "cep"],
  telefone_1: ["Fone01", "Telefone 1", "telefone_1"],
  telefone_2: ["Fone02", "Telefone 2", "telefone_2"],
  cnpj: ["Cnpj", "cnpj"],
  federacao: ["Federação", "federacao"],
  confederacao: ["Confederação", "confederacao"],
  polo: ["Polo", "polo"],
  modelo_carteira: ["Mod_carteira", "modelo_carteira"],
  valor_mensalidade: ["Valor Mensalidade", "mensalidade", "valor_mensalidade"],
  valor_filiacao: ["Valor Filiação", "filiacao", "valor_filiacao"],
  quantidade_meses_pagar: ["Qtd de Mes a Pagar", "quantidade_meses_pagar"],
  logotipo: ["Logotipo", "logotipo"],
  logotipo_endereco: ["Logotipo_End", "logotipo_endereco"],
  tipo_impressao: ["Tipo de Impressão", "tipo_impressao"],
  impressora: ["impressora", "impressora"],
  considerar_inativo_apos: ["Considerar como inatico apos", "considerar_inativo_apos"],
  data_fundacao: ["Fundação", "data_fundacao"],
  email: ["E_mail", "email"],
  banco: ["Banco", "banco"],
  agencia: ["Agencia", "agencia"],
  conta_corrente: ["Conta corrente", "conta_corrente"],
  comarca: ["Comarca", "comarca"],
  profissao: ["Profissao", "profissao"],
  registro_federal: ["Registro federal", "registro_federal"],
  data_filiado_nao_pode_votar: ["Data Filiado nao pode votar", "data_filiado_nao_pode_votar"],
  quantidade_vias_declaracao: ["Qtd Vias na Declaração", "quantidade_vias_declaracao"],
  ano: ["Ano", "ano"],
  nome_presidente: ["Nome Presidente", "nome_presidente"],
  endereco_presidente: ["End Presidente", "endereco_presidente"],
  bairro_presidente: ["Bairro Presidente", "bairro_presidente"],
  cidade_presidente: ["Cidade Presidente", "cidade_presidente"],
  uf_presidente: ["Uf Presidente", "uf_presidente"],
  rg_presidente: ["Rg Presidente", "rg_presidente"],
  cpf_presidente: ["Cpf Presidente", "cpf_presidente"],
  estado_civil_presidente: ["Est Civil Presidente", "estado_civil_presidente"],
  profissao_presidente: ["Profissao_Presidente", "profissao_presidente"],
  inicio_mandato: ["Inicio do mandato", "inicio_mandato"],
  fim_mandato: ["Fim do mandato", "fim_mandato"],
  cartorio: ["Cartorio", "cartorio"],
  rc_posse_livro: ["Rc da posse_lv", "rc_posse_livro"],
  rc_posse_folha: ["Rc da posse_fls", "rc_posse_folha"],
  rc_posse_numero_termo: ["Rc da posse_n termo", "rc_posse_numero_termo"],
  data_ata: ["Data_ATA", "data_ata"]
};

const INITIAL_TENANT_DETAILS: TenantDetails = {
  tenant_id: '',
  nome_entidade: '',
  nome_abreviado: '',
  endereco: '',
  bairro: '',
  cidade: '',
  uf: 'MA',
  cep: '',
  telefone_1: '',
  telefone_2: '',
  cnpj: '',
  federacao: '',
  confederacao: '',
  polo: '',
  modelo_carteira: 'Modelo2020',
  valor_mensalidade: '30,00',
  valor_filiacao: '150,00',
  quantidade_meses_pagar: '12',
  logotipo: '',
  logotipo_endereco: '',
  tipo_impressao: 'Fiscal 8Cm 2 Vias',
  impressora: 'Padrão',
  considerar_inativo_apos: '12',
  data_fundacao: '',
  email: '',
  banco: '',
  agencia: '',
  conta_corrente: '',
  comarca: '',
  profissao: 'PESCADOR(A) ARTESANAL',
  registro_federal: '',
  data_filiado_nao_pode_votar: '',
  quantidade_vias_declaracao: '1 via',
  ano: new Date().getFullYear().toString(),
  nome_presidente: '',
  endereco_presidente: '',
  bairro_presidente: '',
  cidade_presidente: '',
  uf_presidente: 'MA',
  rg_presidente: '',
  cpf_presidente: '',
  estado_civil_presidente: 'Casado(a)',
  profissao_presidente: 'PESCADOR(A)',
  inicio_mandato: '',
  fim_mandato: '',
  cartorio: '',
  rc_posse_livro: '',
  rc_posse_folha: '',
  rc_posse_numero_termo: '',
  data_ata: ''
};

const INITIAL_REPRESENTATIVES: TenantRepresentatives = {
  tenant_id: '',
  nome_representante_02: '', endereco_representante_02: '', rg_representante_02: '', cpf_representante_02: '', estado_civil_representante_02: 'Casado(a)', bairro_representante_02: '', cidade_representante_02: '', uf_representante_02: 'MA', funcao_representante_02: '', inicio_mandato_representante_02: '', fim_mandato_representante_02: '', cartorio_representante_02: '', livro_representante_02: '', folha_representante_02: '', termo_representante_02: '',
  nome_representante_03: '', endereco_representante_03: '', rg_representante_03: '', cpf_representante_03: '', estado_civil_representante_03: 'Casado(a)', bairro_representante_03: '', cidade_representante_03: '', uf_representante_03: 'MA', funcao_representante_03: '', inicio_mandato_representante_03: '', fim_mandato_representante_03: '', cartorio_representante_03: '', livro_representante_03: '', folha_representante_03: '', termo_representante_03: '',
  nome_representante_04: '', endereco_representante_04: '', rg_representante_04: '', cpf_representante_04: '', estado_civil_representante_04: 'Casado(a)', bairro_representante_04: '', cidade_representante_04: '', uf_representante_04: 'MA', funcao_representante_04: '', inicio_mandato_representante_04: '', fim_mandato_representante_04: '', cartorio_representante_04: '', livro_representante_04: '', folha_representante_04: '', termo_representante_04: ''
};

export const AdminPainelView: React.FC = () => {
  const { tenants, addTenant, deleteTenant, syncData, importMembers, importMensalidades, saveTenantDetails, getTenantDetails, saveTenantRepresentatives, getTenantRepresentatives } = useApp();

  const [currentStep, setCurrentStep] = useState<AdminStep>('LIST');
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'socios' | 'mensalidades' | 'config' | 'import-config'>('config');
  const [pendingData, setPendingData] = useState<any[] | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isImporting, setIsImporting] = useState(false);
  const [unitDetails, setUnitDetails] = useState<TenantDetails>(INITIAL_TENANT_DETAILS);
  const [unitReps, setUnitReps] = useState<TenantRepresentatives>(INITIAL_REPRESENTATIVES);
  const [configSubTab, setConfigSubTab] = useState<'entidade' | 'presidente' | 'geral' | 'representantes'>('entidade');
  const [feedback, setFeedback] = useState<MigrationFeedback>({
    isOpen: false, success: false, count: 0, tenantName: '', type: 'config'
  });

  // Busca de unidades
  const [tenantSearchTerm, setTenantSearchTerm] = useState('');

  // Estado para criação de nova unidade
  const [newTenantData, setNewTenantData] = useState({ name: '', username: '', password: '' });
  const [showCreationSuccess, setShowCreationSuccess] = useState(false);
  const [lastCreatedName, setLastCreatedName] = useState('');

  useEffect(() => {
    if (activeTenant && activeTab === 'config') {
      const load = async () => {
        try {
          const [details, reps] = await Promise.all([
            getTenantDetails(activeTenant.id),
            getTenantRepresentatives(activeTenant.id)
          ]);
          
          if (details) {
            const { created_at, updated_at, ...rest } = details as any;
            setUnitDetails({ ...INITIAL_TENANT_DETAILS, ...rest });
          } else {
            setUnitDetails({ ...INITIAL_TENANT_DETAILS, tenant_id: activeTenant.id });
          }
          
          if (reps) {
            const { created_at, updated_at, ...rest } = reps as any;
            setUnitReps({ ...INITIAL_REPRESENTATIVES, ...rest });
          } else {
            setUnitReps({ ...INITIAL_REPRESENTATIVES, tenant_id: activeTenant.id });
          }
          
        } catch (e) {
          setUnitDetails({ ...INITIAL_TENANT_DETAILS, tenant_id: activeTenant.id });
          setUnitReps({ ...INITIAL_REPRESENTATIVES, tenant_id: activeTenant.id });
        }
      };
      load();
    }
  }, [activeTenant, activeTab, getTenantDetails, getTenantRepresentatives]);

  const normalize = (str: string) => 
    String(str || "").toLowerCase().trim()
       .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

  const sanitizeData = (obj: any, allowedKeys: string[]) => {
    const clean: any = {};
    allowedKeys.forEach(key => {
      const value = obj[key];
      if (typeof value === 'string' && value.trim() === '') {
        clean[key] = null;
      } else {
        clean[key] = value;
      }
    });
    return clean;
  };

  const filteredTenants = useMemo(() => {
    const term = tenantSearchTerm.toLowerCase().trim();
    if (!term) return tenants;
    return tenants.filter(t => t.name.toLowerCase().includes(term));
  }, [tenants, tenantSearchTerm]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const dataArray = Array.isArray(json) ? json : [json];
        setPendingData(dataArray);
        
        const newMapping: Record<string, string> = {};
        const keys = Object.keys(dataArray[0]);
        const currentMap = activeTab === 'socios' ? SOCIO_FIELD_MAP : (activeTab === 'mensalidades' ? MENSALIDADE_FIELD_MAP : CONFIG_FIELD_MAP);
        
        keys.forEach(key => {
          const nKey = normalize(key);
          for (const [field, synonyms] of Object.entries(currentMap) as [string, string[]][]) {
            if (synonyms.some(syn => normalize(syn) === nKey)) {
              newMapping[key] = field;
              break;
            }
          }
        });
        setMapping(newMapping);
      } catch (err) { alert("Arquivo JSON inválido."); }
    };
    reader.readAsText(file);
  };

  const finalizeConfigMigration = async () => {
    if (!pendingData || !activeTenant) return;
    setIsImporting(true);
    try {
      const oldItem = pendingData[0];
      const newDetails: any = { ...INITIAL_TENANT_DETAILS, tenant_id: activeTenant.id };
      Object.keys(mapping).forEach(oldKey => {
        const target = mapping[oldKey];
        let value = oldItem[oldKey];
        if (target.includes('data') || target.includes('inicio') || target.includes('fim')) {
            if (typeof value === 'string' && value.trim()) value = value.split(' ')[0].substring(0, 10);
        }
        newDetails[target] = value ?? "";
      });
      
      const cleanDetails = sanitizeData(newDetails, Object.keys(INITIAL_TENANT_DETAILS));
      await saveTenantDetails(cleanDetails);
      setFeedback({ isOpen: true, success: true, count: 1, tenantName: activeTenant.name, type: 'import-config' });
      setPendingData(null);
    } catch (e: any) { alert(`Erro na migração: ${e.message}`); }
    finally { setIsImporting(false); }
  };

  const handleSaveFullConfig = async () => {
    if (!activeTenant) return;
    setIsSubmitting(true);
    try {
      const allowedDetailsKeys = Object.keys(INITIAL_TENANT_DETAILS);
      const allowedRepsKeys = Object.keys(INITIAL_REPRESENTATIVES);

      const cleanDetails = sanitizeData({ ...unitDetails, tenant_id: activeTenant.id }, allowedDetailsKeys);
      const cleanReps = sanitizeData({ ...unitReps, tenant_id: activeTenant.id }, allowedRepsKeys);
      
      await Promise.all([
        saveTenantDetails(cleanDetails),
        saveTenantRepresentatives(cleanReps)
      ]);
      
      setFeedback({ isOpen: true, success: true, count: 0, tenantName: activeTenant.name, type: 'config' });
    } catch (err: any) { 
      alert(`Erro ao salvar: ${err.message}`); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantData.name || !newTenantData.username || !newTenantData.password) return alert("Preencha todos os campos.");
    setIsSubmitting(true);
    try {
      await addTenant(newTenantData.name, newTenantData.username, newTenantData.password);
      setLastCreatedName(newTenantData.name);
      setShowCreationSuccess(true);
      setNewTenantData({ name: '', username: '', password: '' });
    } catch (err: any) {
      alert("Erro ao criar unidade: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRepFields = (num: '02' | '03' | '04') => {
    const r = `_representante_${num}`;
    return (
      <Section title={`Dados do Representante ${num}`}>
        <Input className="md:col-span-3" label="Nome" name={`nome${r}`} value={(unitReps as any)[`nome${r}`]} onChange={e => setUnitReps({...unitReps, [`nome${r}`]: e.target.value})} />
        <Input className="md:col-span-2" label="Endereço" name={`endereco${r}`} value={(unitReps as any)[`endereco${r}`]} onChange={e => setUnitReps({...unitReps, [`endereco${r}`]: e.target.value})} />
        <Input label="Bairro" name={`bairro${r}`} value={(unitReps as any)[`bairro${r}`]} onChange={e => setUnitReps({...unitReps, [`bairro${r}`]: e.target.value})} />
        <Input label="Cidade" name={`cidade${r}`} value={(unitReps as any)[`cidade${r}`]} onChange={e => setUnitReps({...unitReps, [`cidade${r}`]: e.target.value})} />
        <Select label="UF" name={`uf${r}`} options={UF_OPTIONS} value={(unitReps as any)[`uf${r}`]} onChange={e => setUnitReps({...unitReps, [`uf${r}`]: e.target.value})} />
        <Input label="RG" name={`rg${r}`} value={(unitReps as any)[`rg${r}`]} onChange={e => setUnitReps({...unitReps, [`rg${r}`]: e.target.value})} />
        <Input label="CPF" name={`cpf${r}`} value={(unitReps as any)[`cpf${r}`]} onChange={e => setUnitReps({...unitReps, [`cpf${r}`]: e.target.value})} />
        <Select label="Est. Civil" name={`estado_civil${r}`} options={MARITAL_STATUS_OPTIONS} value={(unitReps as any)[`estado_civil${r}`]} onChange={e => setUnitReps({...unitReps, [`estado_civil${r}`]: e.target.value})} />
        <Input label="Função / Cargo" name={`funcao${r}`} value={(unitReps as any)[`funcao${r}`]} onChange={e => setUnitReps({...unitReps, [`funcao${r}`]: e.target.value})} />
        <Input type="date" label="Início Mandato" name={`inicio_mandato${r}`} value={(unitReps as any)[`inicio_mandato${r}`]} onChange={e => setUnitReps({...unitReps, [`inicio_mandato${r}`]: e.target.value})} />
        <Input type="date" label="Fim Mandato" name={`fim_mandato${r}`} value={(unitReps as any)[`fim_mandato${r}`]} onChange={e => setUnitReps({...unitReps, [`fim_mandato${r}`]: e.target.value})} />
        <Input className="md:col-span-2" label="Cartório" name={`cartorio${r}`} value={(unitReps as any)[`cartorio${r}`]} onChange={e => setUnitReps({...unitReps, [`cartorio${r}`]: e.target.value})} />
        <Input label="Livro" name={`livro${r}`} value={(unitReps as any)[`livro${r}`]} onChange={e => setUnitReps({...unitReps, [`livro${r}`]: e.target.value})} />
        <Input label="Folha" name={`folha${r}`} value={(unitReps as any)[`folha${r}`]} onChange={e => setUnitReps({...unitReps, [`folha${r}`]: e.target.value})} />
        <Input label="Nº Termo" name={`termo${r}`} value={(unitReps as any)[`termo${r}`]} onChange={e => setUnitReps({...unitReps, [`termo${r}`]: e.target.value})} />
      </Section>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Feedback Modal for General Updates/Migrations */}
      {feedback.isOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={() => setFeedback(prev => ({...prev, isOpen: false}))} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[48px] shadow-2xl relative z-10 border border-white/10 p-12 text-center">
            <div className={`w-24 h-24 ${feedback.success ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner`}>
              {feedback.success ? <PartyPopper size={48} /> : <AlertTriangle size={48} />}
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Configuração Atualizada</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 uppercase tracking-tight">Os parâmetros da unidade <span className="text-blue-600 font-black">{feedback.tenantName}</span> foram persistidos.</p>
            <button onClick={() => setFeedback(prev => ({...prev, isOpen: false}))} className="w-full bg-slate-900 dark:bg-blue-600 text-white py-5 rounded-[28px] font-black uppercase text-[11px] tracking-widest">Continuar</button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for New Unit Creation */}
      {showCreationSuccess && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" />
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[48px] shadow-2xl relative z-10 border border-white/10 p-12 text-center">
            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <PartyPopper size={48} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Unidade Criada!</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 uppercase tracking-tight">
              A unidade <span className="text-blue-600 font-black">{lastCreatedName}</span> foi registrada com sucesso e já está disponível para acesso.
            </p>
            <button 
              onClick={() => {
                setShowCreationSuccess(false);
                setCurrentStep('LIST');
              }} 
              className="w-full bg-blue-600 text-white py-5 rounded-[28px] font-black uppercase text-[11px] tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30"
            >
              Ir para Lista de Unidades
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1 w-full">
          {[
            { id: 'LIST', label: 'Unidades', icon: Globe },
            { id: 'CREATE', label: 'Nova Unidade', icon: Plus },
            { id: 'MIGRATE', label: 'Gestão de Dados', icon: DatabaseZap }
          ].map((s, idx) => (
            <div key={s.id} className="flex items-center flex-1">
              <button 
                disabled={s.id === 'MIGRATE' && !activeTenant}
                onClick={() => setCurrentStep(s.id as AdminStep)}
                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-wider transition-all ${
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

      {currentStep === 'LIST' && (
        <div className="space-y-6">
          <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Search size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Pesquisar Unidade por Nome..."
              value={tenantSearchTerm}
              onChange={(e) => setTenantSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] py-5 pl-16 pr-8 text-xs font-black uppercase tracking-widest outline-none focus:ring-8 focus:ring-blue-600/5 focus:border-blue-600 text-slate-900 dark:text-white transition-all shadow-sm"
            />
            {tenantSearchTerm && (
              <button onClick={() => setTenantSearchTerm('')} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"><X size={18}/></button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTenants.map(t => (
              <div key={t.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-8 rounded-[40px] shadow-sm hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl text-blue-600"><Globe size={24} /></div>
                  <button onClick={() => {if(confirm('Excluir unidade?')) deleteTenant(t.id)}} className="text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ID: {t.id.split('-')[0]}...</p>
                <button onClick={() => { setActiveTenant(t); setCurrentStep('MIGRATE'); }} className="w-full mt-6 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Configurar Unidade</button>
              </div>
            ))}
            <button onClick={() => setCurrentStep('CREATE')} className="border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[40px] p-8 flex flex-col items-center justify-center gap-4 text-slate-300 hover:border-blue-600 hover:text-blue-600 transition-all min-h-[240px]">
              <Plus size={48} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Adicionar Unidade</span>
            </button>
          </div>
        </div>
      )}

      {currentStep === 'CREATE' && (
        <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[48px] p-12 shadow-sm">
            <div className="flex items-center gap-6 mb-10">
              <div className="bg-blue-600 p-4 rounded-3xl text-white shadow-xl shadow-blue-600/20">
                <Plus size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Nova Unidade</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configuração de Acesso Regional</p>
              </div>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-6">
              <Input label="Nome da Unidade / Cidade" name="name" value={newTenantData.name} onChange={e => setNewTenantData({...newTenantData, name: e.target.value})} placeholder="Ex: Colônia Z-XX - Cidade" />
              <Input label="Usuário Administrador" name="username" value={newTenantData.username} onChange={e => setNewTenantData({...newTenantData, username: e.target.value})} placeholder="Ex: admin_cidade" />
              <Input type="password" label="Senha de Acesso" name="password" value={newTenantData.password} onChange={e => setNewTenantData({...newTenantData, password: e.target.value})} placeholder="••••••••" />

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setCurrentStep('LIST')} className="flex-1 px-8 py-4 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="flex-[2] bg-blue-600 text-white py-5 rounded-[28px] font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-600/30 disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <><Plus size={18}/> Criar Unidade</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {currentStep === 'MIGRATE' && activeTenant && (
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[48px] p-12 shadow-sm">
            <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-10 w-fit overflow-x-auto scrollbar-hide">
              <button onClick={() => {setActiveTab('config'); setPendingData(null);}} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'config' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-400'}`}>Configuração Manual</button>
              <button onClick={() => {setActiveTab('import-config'); setPendingData(null);}} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'import-config' ? 'bg-white dark:bg-slate-900 text-amber-600 shadow-sm' : 'text-slate-400'}`}>Importar Config (JSON)</button>
              <button onClick={() => {setActiveTab('socios'); setPendingData(null);}} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'socios' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-400'}`}>Migrar Sócios</button>
              <button onClick={() => {setActiveTab('mensalidades'); setPendingData(null);}} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'mensalidades' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Migrar Mensalidades</button>
            </div>

            {activeTab === 'config' ? (
              <div className="space-y-10 relative">
                <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 mb-8 pb-4 overflow-x-auto scrollbar-hide">
                  <button onClick={() => setConfigSubTab('entidade')} className={`flex items-center gap-3 px-6 py-2 text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${configSubTab === 'entidade' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}><Landmark size={16}/> Dados da Entidade</button>
                  <button onClick={() => setConfigSubTab('presidente')} className={`flex items-center gap-3 px-6 py-2 text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${configSubTab === 'presidente' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}><UserIcon size={16}/> Presidente e Mandato</button>
                  <button onClick={() => setConfigSubTab('geral')} className={`flex items-center gap-3 px-6 py-2 text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${configSubTab === 'geral' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}><Settings size={16}/> Parâmetros Gerais</button>
                  <button onClick={() => setConfigSubTab('representantes')} className={`flex items-center gap-3 px-6 py-2 text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${configSubTab === 'representantes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}><Users size={16}/> Representantes</button>
                </div>

                <div className="pb-32">
                  {configSubTab === 'entidade' && (
                    <div className="space-y-10 animate-in slide-in-from-left-4">
                      <Section title="Informações de Identificação">
                        <Input className="md:col-span-3" label="Nome da Entidade" name="nome_entidade" value={unitDetails.nome_entidade} onChange={e => setUnitDetails({...unitDetails, nome_entidade: e.target.value})} />
                        <Input label="Nome Abreviado" name="nome_abreviado" value={unitDetails.nome_abreviado} onChange={e => setUnitDetails({...unitDetails, nome_abreviado: e.target.value})} />
                        <Input className="md:col-span-2" label="Logradouro / Endereço" name="endereco" value={unitDetails.endereco} onChange={e => setUnitDetails({...unitDetails, endereco: e.target.value})} />
                        <Input label="Bairro" name="bairro" value={unitDetails.bairro} onChange={e => setUnitDetails({...unitDetails, bairro: e.target.value})} />
                        <Input label="Cidade" name="cidade" value={unitDetails.cidade} onChange={e => setUnitDetails({...unitDetails, cidade: e.target.value})} />
                        <Select label="UF" name="uf" options={UF_OPTIONS} value={unitDetails.uf} onChange={e => setUnitDetails({...unitDetails, uf: e.target.value})} />
                        <Input label="CEP" name="cep" value={unitDetails.cep} onChange={e => setUnitDetails({...unitDetails, cep: e.target.value})} />
                        <Input label="Telefone 1" name="telefone_1" value={unitDetails.telefone_1} onChange={e => setUnitDetails({...unitDetails, telefone_1: e.target.value})} />
                        <Input label="Telefone 2" name="telefone_2" value={unitDetails.telefone_2} onChange={e => setUnitDetails({...unitDetails, telefone_2: e.target.value})} />
                        <Input label="CNPJ" name="cnpj" value={unitDetails.cnpj} onChange={e => setUnitDetails({...unitDetails, cnpj: e.target.value})} />
                        <Input label="E-mail" name="email" value={unitDetails.email} onChange={e => setUnitDetails({...unitDetails, email: e.target.value})} />
                        <Input type="date" label="Data de Fundação" name="data_fundacao" value={unitDetails.data_fundacao} onChange={e => setUnitDetails({...unitDetails, data_fundacao: e.target.value})} />
                      </Section>
                      
                      <Section title="Vínculos Institucionais">
                        <Input label="Federação" name="federacao" value={unitDetails.federacao} onChange={e => setUnitDetails({...unitDetails, federacao: e.target.value})} />
                        <Input label="Confederação" name="confederacao" value={unitDetails.confederacao} onChange={e => setUnitDetails({...unitDetails, confederacao: e.target.value})} />
                        <Input label="Polo Regional" name="polo" value={unitDetails.polo} onChange={e => setUnitDetails({...unitDetails, polo: e.target.value})} />
                        <Input label="Comarca" name="comarca" value={unitDetails.comarca} onChange={e => setUnitDetails({...unitDetails, comarca: e.target.value})} />
                      </Section>
                    </div>
                  )}

                  {configSubTab === 'presidente' && (
                    <div className="space-y-10 animate-in slide-in-from-right-4">
                      <Section title="Dados do Presidente">
                        <Input className="md:col-span-3" label="Nome do Presidente" name="nome_presidente" value={unitDetails.nome_presidente} onChange={e => setUnitDetails({...unitDetails, nome_presidente: e.target.value})} />
                        <Input className="md:col-span-2" label="Endereço do Presidente" name="endereco_presidente" value={unitDetails.endereco_presidente} onChange={e => setUnitDetails({...unitDetails, endereco_presidente: e.target.value})} />
                        <Input label="Bairro" name="bairro_presidente" value={unitDetails.bairro_presidente} onChange={e => setUnitDetails({...unitDetails, bairro_presidente: e.target.value})} />
                        <Input label="Cidade" name="cidade_presidente" value={unitDetails.cidade_presidente} onChange={e => setUnitDetails({...unitDetails, cidade_presidente: e.target.value})} />
                        <Select label="UF Presidente" name="uf_presidente" options={UF_OPTIONS} value={unitDetails.uf_presidente} onChange={e => setUnitDetails({...unitDetails, uf_presidente: e.target.value})} />
                        <Input label="RG Presidente" name="rg_presidente" value={unitDetails.rg_presidente} onChange={e => setUnitDetails({...unitDetails, rg_presidente: e.target.value})} />
                        <Input label="CPF Presidente" name="cpf_presidente" value={unitDetails.cpf_presidente} onChange={e => setUnitDetails({...unitDetails, cpf_presidente: e.target.value})} />
                        <Select label="Est. Civil" name="estado_civil_presidente" options={MARITAL_STATUS_OPTIONS} value={unitDetails.estado_civil_presidente} onChange={e => setUnitDetails({...unitDetails, estado_civil_presidente: e.target.value})} />
                        <Input label="Profissão Presidente" name="profissao_presidente" value={unitDetails.profissao_presidente} onChange={e => setUnitDetails({...unitDetails, profissao_presidente: e.target.value})} />
                      </Section>

                      <Section title="Registro do Mandato / Atas">
                        <Input type="date" label="Início do Mandato" name="inicio_mandato" value={unitDetails.inicio_mandato} onChange={e => setUnitDetails({...unitDetails, inicio_mandato: e.target.value})} />
                        <Input type="date" label="Fim do Mandato" name="fim_mandato" value={unitDetails.fim_mandato} onChange={e => setUnitDetails({...unitDetails, fim_mandato: e.target.value})} />
                        <Input className="md:col-span-2" label="Cartório de Registro" name="cartorio" value={unitDetails.cartorio} onChange={e => setUnitDetails({...unitDetails, cartorio: e.target.value})} />
                        <Input label="RC Posse (Livro)" name="rc_posse_livro" value={unitDetails.rc_posse_livro} onChange={e => setUnitDetails({...unitDetails, rc_posse_livro: e.target.value})} />
                        <Input label="RC Posse (Folha)" name="rc_posse_folha" value={unitDetails.rc_posse_folha} onChange={e => setUnitDetails({...unitDetails, rc_posse_folha: e.target.value})} />
                        <Input label="RC Posse (Nº Termo)" name="rc_posse_numero_termo" value={unitDetails.rc_posse_numero_termo} onChange={e => setUnitDetails({...unitDetails, rc_posse_numero_termo: e.target.value})} />
                        <Input type="date" label="Data da ATA" name="data_ata" value={unitDetails.data_ata} onChange={e => setUnitDetails({...unitDetails, data_ata: e.target.value})} />
                      </Section>
                    </div>
                  )}

                  {configSubTab === 'geral' && (
                    <div className="space-y-10 animate-in fade-in">
                      <Section title="Parâmetros Operacionais">
                         <Input label="Valor Mensalidade (R$)" name="valor_mensalidade" value={unitDetails.valor_mensalidade} onChange={e => setUnitDetails({...unitDetails, valor_mensalidade: e.target.value})} />
                         <Input label="Valor Filiação (R$)" name="valor_filiacao" value={unitDetails.valor_filiacao} onChange={e => setUnitDetails({...unitDetails, valor_filiacao: e.target.value})} />
                         <Input label="Qtd Meses a Pagar" name="quantidade_meses_pagar" value={unitDetails.quantidade_meses_pagar} onChange={e => setUnitDetails({...unitDetails, quantidade_meses_pagar: e.target.value})} />
                         <Input label="Inativo Após (Meses)" name="considerar_inativo_apos" value={unitDetails.considerar_inativo_apos} onChange={e => setUnitDetails({...unitDetails, considerar_inativo_apos: e.target.value})} />
                         <Input type="date" label="Corte Votação" name="data_filiado_nao_pode_votar" value={unitDetails.data_filiado_nao_pode_votar} onChange={e => setUnitDetails({...unitDetails, data_filiado_nao_pode_votar: e.target.value})} />
                         <Input label="Ano de Exercício" name="ano" value={unitDetails.ano} onChange={e => setUnitDetails({...unitDetails, ano: e.target.value})} />
                         <Input className="md:col-span-2" label="Profissão Padrão" name="profissao" value={unitDetails.profissao} onChange={e => setUnitDetails({...unitDetails, profissao: e.target.value})} />
                      </Section>

                      <Section title="Configuração de Impressão e Design">
                         <Select label="Modelo da Carteira" name="modelo_carteira" options={['Modelo2020', 'Modelo Antigo', 'PVC Digital']} value={unitDetails.modelo_carteira} onChange={e => setUnitDetails({...unitDetails, modelo_carteira: e.target.value})} />
                         <Select label="Tipo de Impressão" name="tipo_impressao" options={['Fiscal 8Cm 2 Vias', 'Recibo Simples', 'Papel A4']} value={unitDetails.tipo_impressao} onChange={e => setUnitDetails({...unitDetails, tipo_impressao: e.target.value})} />
                         <Select label="Modelo Impressora" name="impressora" options={['Padrão', 'Térmica 80mm', 'Térmica 58mm']} value={unitDetails.impressora} onChange={e => setUnitDetails({...unitDetails, impressora: e.target.value})} />
                         <Select label="Vias na Declaração" name="quantidade_vias_declaracao" options={['1 via', '2 vias', '3 vias']} value={unitDetails.quantidade_vias_declaracao} onChange={e => setUnitDetails({...unitDetails, quantidade_vias_declaracao: e.target.value})} />
                         <Input className="md:col-span-2" label="Texto Logotipo" name="logotipo" value={unitDetails.logotipo} onChange={e => setUnitDetails({...unitDetails, logotipo: e.target.value})} />
                         <Input className="md:col-span-2" label="Endereço Logotipo" name="logotipo_endereco" value={unitDetails.logotipo_endereco} onChange={e => setUnitDetails({...unitDetails, logotipo_endereco: e.target.value})} />
                      </Section>

                      <Section title="Dados Bancários e Oficiais">
                         <Input label="Banco" name="banco" value={unitDetails.banco} onChange={e => setUnitDetails({...unitDetails, banco: e.target.value})} />
                         <Input label="Agência" name="agencia" value={unitDetails.agencia} onChange={e => setUnitDetails({...unitDetails, agencia: e.target.value})} />
                         <Input label="Conta Corrente" name="conta_corrente" value={unitDetails.conta_corrente} onChange={e => setUnitDetails({...unitDetails, conta_corrente: e.target.value})} />
                         <Input label="Registro Federal" name="registro_federal" value={unitDetails.registro_federal} onChange={e => setUnitDetails({...unitDetails, registro_federal: e.target.value})} />
                      </Section>
                    </div>
                  )}

                  {configSubTab === 'representantes' && (
                    <div className="space-y-10 animate-in slide-in-from-bottom-4">
                      {renderRepFields('02')}
                      {renderRepFields('03')}
                      {renderRepFields('04')}
                    </div>
                  )}
                </div>

                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-16 z-[100] animate-in slide-in-from-bottom-8">
                  <button 
                    onClick={handleSaveFullConfig} 
                    disabled={isSubmitting} 
                    className="bg-emerald-600 text-white px-12 py-5 rounded-[28px] font-black uppercase text-[11px] tracking-widest flex items-center gap-4 shadow-2xl shadow-emerald-600/40 hover:-translate-y-2 active:scale-95 transition-all border border-white/20"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} 
                    Salvar Todas as Alterações
                  </button>
                </div>
              </div>
            ) : activeTab === 'import-config' ? (
              <div className="space-y-10">
                {!pendingData ? (
                  <div className="border-4 border-dashed border-amber-50 rounded-[40px] p-24 text-center group hover:border-amber-600 transition-all relative">
                    <input type="file" accept=".json" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <div className="w-24 h-24 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-300 group-hover:text-amber-600 transition-all"><Upload size={40} /></div>
                    <p className="text-sm font-black text-amber-400 uppercase tracking-widest">Migrar Configuração de Unidade</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase mt-2">Clique ou arraste o JSON exportado do sistema anterior</p>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in zoom-in-95">
                     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto p-4 bg-slate-50 rounded-[32px] border border-slate-100">
                       {Object.entries(mapping).map(([old, target]) => (
                         <div key={old} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                           <p className="text-[8px] font-black text-slate-400 uppercase truncate mb-1">{old}</p>
                           <p className="text-[10px] font-black text-amber-600 uppercase flex items-center gap-1"><Check size={10}/> {target}</p>
                         </div>
                       ))}
                     </div>
                     <div className="flex gap-4">
                        <button onClick={finalizeConfigMigration} disabled={isImporting} className="flex-1 bg-amber-600 text-white py-6 rounded-[28px] font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 hover:bg-amber-700 transition-all shadow-xl">
                          {isImporting ? <Loader2 className="animate-spin" /> : <><Save size={18}/> Processar {pendingData.length} Mapeamentos</>}
                        </button>
                        <button onClick={() => setPendingData(null)} className="px-12 py-6 rounded-[28px] border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">Cancelar</button>
                     </div>
                  </div>
                )}
              </div>
            ) : !pendingData ? (
               <div className="border-4 border-dashed border-slate-50 dark:border-slate-800 rounded-[40px] p-24 text-center group hover:border-blue-600 transition-all relative">
                 <input type="file" accept=".json" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                 <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300 group-hover:text-blue-600 transition-all"><Upload size={40} /></div>
                 <p className="text-sm font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Importar {activeTab === 'socios' ? 'Sócios' : 'Mensalidades'}</p>
               </div>
            ) : (
              <div className="space-y-8 animate-in slide-in-from-bottom-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Object.entries(mapping).map(([oldKey, newKey]) => (
                    <div key={oldKey} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[8px] font-black text-slate-400 uppercase truncate mb-1">{oldKey}</p>
                      <p className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1"><Check size={10}/> {newKey}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4">
                  <button onClick={() => alert("Migração efetuada com sucesso (simulado)")} className="flex-1 bg-emerald-600 text-white py-6 rounded-[28px] font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl">
                    <Database size={18}/> Processar {pendingData.length} Registros
                  </button>
                  <button onClick={() => setPendingData(null)} className="px-12 py-6 rounded-[28px] border border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">Cancelar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
