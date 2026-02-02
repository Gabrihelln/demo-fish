
import React, { useState, useEffect } from 'react';
import { 
  Plus, Globe, Trash2, Server, Key, Upload, RefreshCw, CheckCircle, X, ChevronDown
} from 'lucide-react';
import { useApp } from '../AppContext';
import { Member } from '../types';
import { EMPTY_MEMBER } from '../constants';

const FIELD_MAP: Record<string, string[]> = {
  codigo_socio: ["codigo do socio", "matricula", "inscricao"],
  data_admissao: ["data de admissao"],
  codigo_antigo: ["codigo antigo"],
  recadastro: ["recadastro"],
  codigo_delegacia: ["codigo delegacia"],
  codigo_comunidade: ["cod comunidade", "comunidade"],
  data_nascimento: ["data de nascimentos", "data de nascimento", "nascimento"],
  nome: ["nome", "associado"],
  apelido: ["apelido"],
  nome_pai: ["pai", "nome do pai"],
  nome_mae: ["mae", "nome da mae"],
  estado_civil: ["estado civil"],
  conjuge: ["conjuge"],
  nacionalidade: ["nacionalidade"],
  naturalidade: ["naturalidade"],
  uf_naturalidade: ["uf naturalidade"],
  endereco: ["endereco", "endereço"],
  numero: ["num", "numero"],
  bairro: ["bairro"],
  cidade: ["cidade"],
  uf: ["uf"],
  cep: ["cep"],
  complemento: ["complemento"],
  ponto_referencia: ["pt de referencia", "ponto de referencia"],
  telefone: ["telefone", "celular"],
  profissao: ["profissao"],
  empregador: ["empregador"],
  local_trabalho: ["loc trabalho", "local de trabalho"],
  alfabetizado: ["alfabetizado"],
  escolaridade: ["escolaridade"],
  rg: ["rg"],
  orgao_expedidor_rg: ["ssp", "orgao expedidor"],
  data_expedicao_rg: ["dt expedição rg", "data expedição rg"],
  cpf: ["CPF", "cpf", "c p f", "c.p.f", "cadastro pessoa fisica", "cpf socio"],
  ctps: ["ctps"],
  serie_ctps: ["série", "serie ctps"],
  data_expedicao_ctps: ["expedição ctps", "data expedição ctps"],
  titulo_eleitor: ["titulo", "titulo de eleitor"],
  zona_eleitoral: ["zona"],
  secao_eleitoral: ["seção"],
  cir: ["cir"],
  embarcacao: ["embarcacao"],
  embarcacao_rgp: ["emb_rgp", "embarcacao rgp"],
  rgp_uf: ["rgp_uf"],
  ab: ["ab"],
  numero_tripulantes: ["nr_tripulantes", "numero de tripulantes"],
  cpf_proprietario: ["cpf_proprietario", "cpf do proprietario"],
  quantidade_membros_familia: ["qtd de memb na familia", "membros familia"],
  renda_familiar: ["renda familiar"],
  inscricao_incra: ["insc incra", "incra"],
  area_fazenda: ["area_da_fazenda", "area fazenda"],
  livro: ["livro"],
  folha: ["folha"],
  numero_termo: ["num termo"],
  nit: ["nit"],
  pis: ["pis"],
  cei: ["cei"],
  caepf: ["caepf"],
  numero_propriedade_receita_federal: ["nº prop rec federal", "propriedade receita"],
  data_emissao_rgp: ["emissao_rgp", "emissão rgp"],
  codigo_categoria: ["cod categoria", "categoria"],
  situacao: ["situação", "situacao"],
  ultimo_mes_pago: ["ult mes pago", "ultimo mes pago"],
  numero_beneficio: ["num beneficio"],
  especie: ["especie"],
  data_transferencia: ["data transferencia"],
  data_falecimento: ["dt de falicimento", "data falecimento"],
  observacao: ["observação", "observacao"],
  foto: ["foto"],
  local_foto: ["local_foto"],
  webcam: ["webcan", "webcam"],
  sexo: ["sexo"],
  data_ultimo_pagamento: ["data do ult pagamento", "ultimo pagamento"],
  primeira_data_pagamento: ["1a_data_pag", "primeira data pagamento"],
  ultimo_dia_pago: ["ult_dia_pago", "ultimo dia pago"],
  destino_transferencia: ["pra onde foi transferido", "destino transferencia"],
  data_ultimo_movimento: ["data ult movimento", "ultimo movimento"],
  pasta_socios: ["pasta_socios"],
  pasta_embarcacao: ["pasta_embarcacao"],
  email: ["email"],
  id_defeso: ["id_defeso"],
  numero_dap: ["nr_dap", "numero dap"],
  grupo_dap: ["grupo_dap"],
  validade_dap: ["validade_dap"],
  tem_defeso: ["tem_defeso"],
  tipo_sanguineo: ["tipo_sangue", "tipo sanguineo"],
  sus: ["sus"],
  outros_documentos: ["outrosdocumentos", "outros documentos"],
  situacao_mpa: ["situacao_mpa"],
  codigo_gps_mpa: ["codgps_mpa", "gps mpa"],
  senha_gps_mpa: ["senhagps_mpa"],
  senha_inss_mpa: ["senhainss_mpa"],
  tenant_id: ["tenant_id", "unidade", "unidade_id"]
};

interface FeedbackState {
  isOpen: boolean;
  type: 'migration' | 'sync';
  count: number;
  success: boolean;
}

export const AdminPanelView: React.FC = () => {
  const { 
    tenants, addTenant, toggleTenantStatus, deleteTenant, 
    importMembers, syncData, updateCloudKeys, cloudKeys, session
  } = useApp();
  
  const [isAddingTenant, setIsAddingTenant] = useState(false);
  const [tenantFormData, setTenantFormData] = useState({ name: '', username: '', password: '' });
  const [pendingData, setPendingData] = useState<any[] | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isImporting, setIsImporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedTargetTenant, setSelectedTargetTenant] = useState<string>('');
  const [tempKeys, setTempKeys] = useState({ url: cloudKeys.url, key: cloudKeys.key });

  useEffect(() => {
    if (session.user?.role === 'REGION_USER' && session.user.tenantId) {
      setSelectedTargetTenant(session.user.tenantId);
    } else if (tenants.length > 0 && !selectedTargetTenant) {
      setSelectedTargetTenant(tenants[0].id);
    }
  }, [tenants, session]);

  const [feedback, setFeedback] = useState<FeedbackState>({
    isOpen: false,
    type: 'migration',
    count: 0,
    success: true
  });

  const normalize = (str: string) => 
    str.toLowerCase().trim()
       .normalize("NFD")
       .replace(/[\u0300-\u036f]/g, "")
       .replace(/[^a-z0-9]/g, ""); 

  const analyzeFile = (sample: any) => {
    const newMapping: Record<string, string> = {};
    const keys = Object.keys(sample);
    
    keys.forEach(key => {
      const normalizedKey = normalize(key);
      for (const [field, synonyms] of Object.entries(FIELD_MAP)) {
        if (synonyms.some(syn => normalize(syn) === normalizedKey)) {
          newMapping[key] = field;
          break;
        }
      }
    });

    keys.forEach(key => {
      if (newMapping[key]) return;
      const normalizedKey = normalize(key);
      for (const [field, synonyms] of Object.entries(FIELD_MAP)) {
        if (synonyms.some(syn => normalizedKey.includes(normalize(syn)))) {
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
      } catch (err) { alert("Arquivo JSON inválido."); }
    };
    reader.readAsText(file);
  };

  const finalizeImport = async () => {
    if (!pendingData || !selectedTargetTenant) return alert("Selecione a Unidade.");
    setIsImporting(true);
    try {
      const converted: Member[] = pendingData.map(oldItem => {
        const newItem: any = { 
          ...EMPTY_MEMBER,
          id: crypto.randomUUID(),
          tenantId: selectedTargetTenant, 
          tenant_id: selectedTargetTenant,
          isSynced: false, 
          updatedAt: new Date().toISOString()
        };
        Object.keys(mapping).forEach((oldKey) => {
          const newKey = mapping[oldKey];
          let value = oldItem[oldKey];
          if (newKey === 'cpf' && typeof value === 'string') {
            value = value.replace(/\D/g, '');
          }
          newItem[newKey] = String(value || "");
        });
        return newItem as Member;
      });

      // Importa localmente e captura a lista sanitizada
      const importedList = importMembers(converted);
      
      // Sincroniza imediatamente com a nuvem passando a lista recém-criada
      // Isso ignora o delay do estado do React
      await syncData(importedList);

      setFeedback({ isOpen: true, type: 'migration', count: converted.length, success: true });
      setPendingData(null);
    } catch (err) { 
      setFeedback({ isOpen: true, type: 'migration', count: 0, success: false });
    } finally { setIsImporting(false); }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const result = await syncData();
      setFeedback({ isOpen: true, type: 'sync', count: result?.count || 0, success: result?.success || false });
    } catch (err) {
      setFeedback({ isOpen: true, type: 'sync', count: 0, success: false });
    } finally { setIsSyncing(false); }
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-500">
      {/* FEEDBACK MODAL */}
      {feedback.isOpen && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setFeedback(prev => ({...prev, isOpen: false}))} />
          <div className="bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl p-12 max-w-md w-full text-center relative z-10 animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-800">
            <div className={`w-24 h-24 ${feedback.success ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'} rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner`}>
              {feedback.success ? <CheckCircle size={48} /> : <X size={48} />}
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">{feedback.type === 'migration' ? 'Migração Finalizada' : 'Nuvem Atualizada'}</h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              {feedback.success ? (
                <><span className="text-blue-600 font-black text-lg">{feedback.count}</span> registros processados e sincronizados com a nuvem.</>
              ) : "Falha na comunicação. Verifique a conectividade com o Supabase."}
            </p>
            <button onClick={() => setFeedback(prev => ({...prev, isOpen: false}))} className="w-full bg-slate-900 dark:bg-blue-600 text-white py-5 rounded-[28px] font-black uppercase text-[11px] tracking-widest hover:bg-blue-600 transition-all">Fechar</button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Administração SGA</h2>
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Gestão de Unidades e Sincronização Mestre</p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleSyncNow} disabled={isSyncing} className="bg-slate-900 dark:bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-blue-600 transition-all disabled:opacity-50 shadow-xl shadow-slate-900/10">
            {isSyncing ? <RefreshCw size={18} className="animate-spin" /> : <Server size={18} />}
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[48px] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center">
          <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-3">
            <Globe size={18} className="text-blue-600" /> Unidades Ativas
          </h3>
          <button onClick={() => setIsAddingTenant(true)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest hover:scale-105 transition-transform shadow-lg shadow-blue-600/20">
            Nova Unidade
          </button>
        </div>
        
        {isAddingTenant && (
          <div className="p-8 bg-blue-50/10 dark:bg-blue-900/10 border-b border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-4 duration-300">
            <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={async e => {
              e.preventDefault();
              await addTenant(tenantFormData.name, tenantFormData.username, tenantFormData.password);
              setIsAddingTenant(false);
              setTenantFormData({ name: '', username: '', password: '' });
            }}>
              <input type="text" placeholder="Nome Unidade" className="p-4 rounded-2xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 shadow-sm" value={tenantFormData.name} onChange={e => setTenantFormData({...tenantFormData, name: e.target.value})} required />
              <input type="text" placeholder="Login" className="p-4 rounded-2xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 shadow-sm" value={tenantFormData.username} onChange={e => setTenantFormData({...tenantFormData, username: e.target.value})} required />
              <input type="password" placeholder="Senha" className="p-4 rounded-2xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 shadow-sm" value={tenantFormData.password} onChange={e => setTenantFormData({...tenantFormData, password: e.target.value})} required />
              <button type="submit" className="bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/10">Criar Unidade</button>
            </form>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 dark:text-slate-500">Cidade/Unidade</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 dark:text-slate-500">Usuário</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tenants.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-8 py-5 font-black text-xs uppercase text-slate-900 dark:text-slate-100">{t.name}</td>
                  <td className="px-8 py-5 font-mono text-blue-600 dark:text-blue-400 text-xs">{t.adminUsername}</td>
                  <td className="px-8 py-5 text-right flex items-center justify-end gap-3">
                    <button onClick={() => toggleTenantStatus(t.id)} className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase ${t.isActive ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-red-50 dark:bg-red-900/20 text-red-600'}`}>
                      {t.isActive ? 'Ativa' : 'Bloqueada'}
                    </button>
                    <button onClick={() => deleteTenant(t.id)} className="text-slate-300 dark:text-slate-600 hover:text-red-500 transition-colors p-2"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] p-10 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-slate-800 dark:text-white flex items-center gap-3"><Key size={18} className="text-blue-600"/> Cloud</h3>
          <div className="space-y-4">
            <input type="text" value={tempKeys.url} onChange={e => setTempKeys({...tempKeys, url: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-[10px] font-bold text-slate-900 dark:text-white outline-none focus:border-blue-600 transition-all" placeholder="Supabase URL" />
            <input type="password" value={tempKeys.key} onChange={e => setTempKeys({...tempKeys, key: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-[10px] font-bold text-slate-900 dark:text-white outline-none focus:border-blue-600 transition-all" placeholder="Anon Key" />
            <button onClick={() => updateCloudKeys(tempKeys.url, tempKeys.key)} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">Salvar Chaves</button>
          </div>
        </div>
        
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] p-10 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-slate-800 dark:text-white flex items-center gap-3"><Upload size={20} className="text-emerald-600"/> Importar JSON</h3>
          {!pendingData ? (
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] p-16 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-800/30 relative hover:border-blue-400 group transition-all">
              <Upload size={32} className="text-slate-300 dark:text-slate-600 group-hover:text-blue-600 mb-4 transition-colors" />
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Clique ou arraste o arquivo JSON</p>
              <input type="file" accept=".json" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" title="Selecione o arquivo de sócios" />
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
              <div className="relative group">
                <select 
                  value={selectedTargetTenant} 
                  onChange={e => setSelectedTargetTenant(e.target.value)} 
                  className="w-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-5 text-xs font-black uppercase text-blue-700 dark:text-blue-400 outline-none focus:ring-4 focus:ring-blue-600/10 transition-all appearance-none cursor-pointer pr-12"
                >
                  <option value="" disabled className="text-slate-400">Escolha a Unidade de Destino...</option>
                  {tenants.map(t => <option key={t.id} value={t.id} className="text-slate-900 dark:text-white bg-white dark:bg-slate-900">{t.name}</option>)}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600 dark:text-blue-400">
                  <ChevronDown size={20} />
                </div>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={finalizeImport} 
                  disabled={isImporting || !selectedTargetTenant} 
                  className="flex-1 bg-emerald-600 text-white py-5 rounded-3xl font-black uppercase text-[11px] tracking-widest hover:bg-emerald-700 hover:-translate-y-1 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50 disabled:translate-y-0"
                >
                  Importar e Sincronizar {pendingData.length} registros
                </button>
                <button onClick={() => setPendingData(null)} className="px-10 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Cancelar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
