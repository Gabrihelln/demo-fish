
import React, { useState, useEffect } from 'react';
import { 
  Plus, Globe, Trash2, Server, Key, Upload, RefreshCw, CloudIcon, CheckCircle, X, ArrowRight
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
  codigo_comunidade: ["cod comunidade"],
  data_nascimento: ["data de nascimentos", "nascimento"],
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
  numero: ["num", "número"],
  bairro: ["bairro"],
  cidade: ["cidade"],
  uf: ["uf"],
  cep: ["cep"],
  complemento: ["complemento"],
  ponto_referencia: ["pt de referencia"],
  telefone: ["telefone", "celular"],
  profissao: ["profissao"],
  local_trabalho: ["loc trabalho", "local_trabalho"],
  alfabetizado: ["alfabetizado"],
  escolaridade: ["escolaridade"],
  rg: ["rg"],
  orgao_expedidor_rg: ["ssp", "orgao_expedidor"],
  data_expedicao_rg: ["dt expedicao rg", "data_expedicao_rg"],
  cpf: ["cpf"],
  ctps: ["ctps"],
  serie_ctps: ["serie", "serie_ctps"],
  data_expedicao_ctps: ["expedicao ctps", "data_expedicao_ctps"],
  titulo_eleitor: ["titulo", "titulo_eleitor"],
  zona_eleitoral: ["zona", "zona_eleitoral"],
  secao_eleitoral: ["secao", "secao_eleitoral"],
  cir: ["cir"],
  embarcacao: ["embarcacao"],
  embarcacao_rgp: ["emb_rgp", "embarcacao_rgp"],
  rgp_uf: ["rgp_uf"],
  ab: ["ab"],
  numero_tripulantes: ["nr_tripulantes", "numero_tripulantes"],
  cpf_proprietario: ["cpf_proprietario"],
  quantidade_membros_familia: ["qtd de memb na familia", "quantidade_membros_familia"],
  renda_familiar: ["renda familiar"],
  inscricao_incra: ["insc incra", "inscricao_incra"],
  area_fazenda: ["area_da_fazenda", "area_fazenda"],
  livro: ["livro"],
  folha: ["folha"],
  numero_termo: ["num termo", "numero_termo"],
  nit: ["nit"],
  pis: ["pis"],
  cei: ["cei"],
  caepf: ["caepf"],
  numero_propriedade_receita_federal: ["nº prop rec federal", "numero_propriedade_receita_federal"],
  data_emissao_rgp: ["emissao_rgp", "data_emissao_rgp"],
  codigo_categoria: ["cod categoria", "codigo_categoria"],
  situacao: ["situacao", "situação"],
  ultimo_mes_pago: ["ult mes pago", "ultimo_mes_pago"],
  numero_beneficio: ["num beneficio", "numero_beneficio"],
  especie: ["especie"],
  data_transferencia: ["data transferencia"],
  data_falecimento: ["dt de falicimento", "data_falecimento"],
  observacao: ["observacao", "observação"],
  foto: ["foto"],
  local_foto: ["local_foto"],
  webcam: ["webcan", "webcam"],
  sexo: ["sexo"],
  data_ultimo_pagamento: ["data do ult pagamento", "data_ultimo_pagamento"],
  primeira_data_pagamento: ["1a_data_pag", "primeira_data_pagamento"],
  ultimo_dia_pago: ["ult_dia_pago", "ultimo_dia_pago"],
  destino_transferencia: ["pra onde foi transferido"],
  data_ultimo_movimento: ["data ult movimento"],
  pasta_socios: ["pasta_socios"],
  pasta_embarcacao: ["pasta_embarcacao"],
  email: ["email"],
  id_defeso: ["id_defeso"],
  numero_dap: ["nr_dap", "numero_dap"],
  grupo_dap: ["grupo_dap", "GRUPO_DAP"],
  validade_dap: ["validade_dap"],
  tem_defeso: ["tem_defeso"],
  tipo_sanguineo: ["tipo_sangue", "tipo_sanguineo"],
  sus: ["sus"],
  outros_documentos: ["outrosdocumentos", "outros_documentos"],
  situacao_mpa: ["situacao_mpa"],
  codigo_gps_mpa: ["codgps_mpa"],
  senha_gps_mpa: ["senhagps_mpa"],
  senha_inss_mpa: ["senhainss_mpa"]
};

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
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [migrationResult, setMigrationResult] = useState<{count: number} | null>(null);
  const [selectedTargetTenant, setSelectedTargetTenant] = useState<string>('');
  const [tempKeys, setTempKeys] = useState({ url: cloudKeys.url, key: cloudKeys.key });

  useEffect(() => {
    if (session.user?.role === 'REGION_USER' && session.user.tenantId) {
      setSelectedTargetTenant(session.user.tenantId);
    } else if (tenants.length > 0 && !selectedTargetTenant) {
      setSelectedTargetTenant(tenants[0].id);
    }
  }, [tenants, session]);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    setSyncStatus('idle');
    const success = await syncData();
    setIsSyncing(false);
    if (success) {
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } else {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const normalize = (str: string) => str.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, " ");

  const analyzeFile = (sample: any) => {
    const newMapping: Record<string, string> = {};
    const keys = Object.keys(sample);
    keys.forEach(key => {
      const normalizedKey = normalize(key);
      for (const [field, synonyms] of Object.entries(FIELD_MAP)) {
        if (synonyms.some(syn => normalize(syn) === normalizedKey || normalizedKey.includes(normalize(syn)))) {
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
    if (!pendingData || !selectedTargetTenant) return;
    setIsImporting(true);
    try {
      const converted: Member[] = pendingData.map(oldItem => {
        const newItem: any = { 
          ...EMPTY_MEMBER,
          id: crypto.randomUUID(),
          tenant_id: selectedTargetTenant, 
          isSynced: false, 
          updated_at: new Date().toISOString()
        };
        Object.entries(mapping).forEach(([oldKey, newKey]) => {
          let val = oldItem[oldKey];
          if (val !== undefined && val !== null && val !== "") {
            let strVal = String(val).trim();
            if (newKey.startsWith('data_') || newKey.endsWith('_date') || newKey === 'recadastro' || newKey.includes('validade')) {
              const match = strVal.match(/^(\d{4}-\d{2}-\d{2})/);
              if (match) strVal = match[1];
            }
            newItem[newKey] = strVal;
          }
        });
        return newItem as Member;
      });
      importMembers(converted);
      await syncData();
      setMigrationResult({ count: converted.length });
      setPendingData(null);
    } catch (err) { 
      console.error(err);
      alert("Erro crítico na migração."); 
    }
    finally { setIsImporting(false); }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Modal de Sucesso de Migração */}
      {migrationResult && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setMigrationResult(null)} />
          <div className="bg-white rounded-[48px] shadow-2xl p-12 max-w-md w-full text-center relative z-10 animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle size={48} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4">Migração Concluída</h3>
            <p className="text-sm font-medium text-slate-500 mb-8 leading-relaxed">
              Os registros foram processados com sucesso. <br/>
              <span className="text-emerald-600 font-black text-lg">{migrationResult.count}</span> associados foram importados e sincronizados com a nuvem.
            </p>
            <button 
              onClick={() => setMigrationResult(null)}
              className="w-full bg-slate-900 text-white py-5 rounded-[28px] font-black uppercase text-[11px] tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Administração SGA</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Gestão de Unidades e Migração</p>
        </div>
        <button 
          onClick={handleSyncNow} 
          disabled={isSyncing}
          className={`px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all ${
            syncStatus === 'success' ? 'bg-emerald-600 text-white' : 
            syncStatus === 'error' ? 'bg-red-600 text-white' :
            'bg-slate-900 text-white hover:bg-blue-600'
          }`}
        >
          {isSyncing ? <RefreshCw size={18} className="animate-spin" /> : 
           syncStatus === 'success' ? <CheckCircle size={18} /> : <Server size={18} />}
          {isSyncing ? 'Sincronizando...' : syncStatus === 'success' ? 'Sincronizado!' : 'Sincronizar'}
        </button>
      </div>

      <div className="bg-white border rounded-[48px] overflow-hidden shadow-sm">
        <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
            <Globe size={18} className="text-blue-600" /> Unidades Regionais
          </h3>
          <button onClick={() => setIsAddingTenant(true)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest">
            + Unidade
          </button>
        </div>
        {isAddingTenant && (
          <div className="p-8 bg-blue-50/20 border-b animate-in slide-in-from-top-4 duration-300">
            <form className="grid grid-cols-4 gap-4" onSubmit={e => {
              e.preventDefault();
              addTenant(tenantFormData.name, tenantFormData.username, tenantFormData.password);
              setIsAddingTenant(false);
            }}>
              <input type="text" placeholder="Cidade" className="p-3 rounded-xl text-xs border bg-white" value={tenantFormData.name} onChange={e => setTenantFormData({...tenantFormData, name: e.target.value})} required />
              <input type="text" placeholder="Login" className="p-3 rounded-xl text-xs border bg-white" value={tenantFormData.username} onChange={e => setTenantFormData({...tenantFormData, username: e.target.value})} required />
              <input type="password" placeholder="Senha" className="p-3 rounded-xl text-xs border bg-white" value={tenantFormData.password} onChange={e => setTenantFormData({...tenantFormData, password: e.target.value})} required />
              <button className="bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase">Salvar</button>
            </form>
          </div>
        )}
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400">Cidade</th>
              <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400">Acesso</th>
              <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map(t => (
              <tr key={t.id} className="border-b last:border-0 hover:bg-slate-50/50">
                <td className="px-8 py-5 font-black text-xs uppercase text-slate-700">{t.name}</td>
                <td className="px-8 py-5 font-mono text-blue-600 text-xs">{t.adminUsername}</td>
                <td className="px-8 py-5 text-right flex items-center justify-end gap-2">
                  <button onClick={() => toggleTenantStatus(t.id)} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${t.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {t.isActive ? 'Ativa' : 'Inativa'}
                  </button>
                  <button onClick={() => deleteTenant(t.id)} className="text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="bg-white border rounded-[40px] p-10 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2"><Key size={18}/> Cloud Sync</h3>
          <div className="space-y-4">
            <input type="text" value={tempKeys.url} onChange={e => setTempKeys({...tempKeys, url: e.target.value})} className="w-full bg-slate-50 border rounded-2xl p-4 text-[10px] font-bold outline-none" placeholder="API URL" />
            <input type="password" value={tempKeys.key} onChange={e => setTempKeys({...tempKeys, key: e.target.value})} className="w-full bg-slate-50 border rounded-2xl p-4 text-[10px] font-bold outline-none" placeholder="API Key" />
            <button onClick={() => updateCloudKeys(tempKeys.url, tempKeys.key)} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] hover:shadow-lg hover:shadow-blue-600/20 transition-all">Salvar Credenciais</button>
          </div>
        </div>

        <div className="col-span-2 bg-white border rounded-[40px] p-10 shadow-sm relative overflow-hidden">
          <h3 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2"><Upload size={20}/> Importar JSON Legado</h3>
          {!pendingData ? (
            <div className="border-2 border-dashed rounded-[32px] p-16 flex flex-col items-center justify-center bg-slate-50/50 relative hover:border-blue-300 transition-colors">
              <Upload size={40} className="text-slate-200 mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase">Selecione o arquivo .json</p>
              <input type="file" accept=".json" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          ) : (
            <div className="space-y-6">
               <div className="bg-blue-50 p-6 rounded-[24px] border border-blue-100">
                  <p className="text-[10px] font-black text-blue-600 uppercase mb-3">Destino da Importação:</p>
                  <select value={selectedTargetTenant} onChange={e => setSelectedTargetTenant(e.target.value)} className="w-full border rounded-xl p-4 text-xs font-black uppercase bg-white outline-none">
                    <option value="">Escolha a unidade...</option>
                    {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
               </div>
               <button onClick={finalizeImport} disabled={isImporting || !selectedTargetTenant} className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase text-[11px] flex items-center justify-center gap-3 disabled:opacity-50">
                 {isImporting ? <RefreshCw className="animate-spin" size={18} /> : <CloudIcon size={18} />}
                 {isImporting ? "Convertendo..." : `Migrar ${pendingData.length} registros`}
               </button>
               <button onClick={() => setPendingData(null)} className="w-full text-[10px] font-black text-slate-300 hover:text-red-500 uppercase transition-colors">Cancelar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
