
import React, { useState, useEffect } from 'react';
import { 
  Plus, MapPin, User, CheckCircle2, 
  XCircle, Trash2, Globe, Lock, Database, Upload, 
  RefreshCw, Server, Key, ChevronDown, AlertTriangle, SearchCode, CloudIcon
} from 'lucide-react';
import { useApp } from '../AppContext';
import { Member } from '../types';
import { EMPTY_MEMBER } from '../constants';

// Dicionário de Sinônimos para Mapeamento Automático (Normal Backend Logic)
const FIELD_SYNONYMS: Record<string, string[]> = {
  registration: ["codigo do socio", "matricula", "inscricao", "nº registro", "registro", "id_socio", "cod"],
  birthDate: ["data de nascimentos", "data de nascimento", "nascimento", "dt_nasc", "data_nasc", "nascido_em"],
  fullName: ["nome", "nome completo", "associado", "nome_completo", "nome do socio", "nome do cliente"],
  cpf: ["cpf", "c.p.f.", "documento_cpf", "nr_cpf"],
  rg: ["rg", "r.g.", "identidade", "documento_rg", "nr_rg"],
  registrationDate: ["data de admissao", "admissao", "filiacao", "data_cadastro", "data_inscricao", "dt_adm"],
  phone: ["telefone", "celular", "contato", "tel", "fone", "fone_contato"],
  city: ["cidade", "municipio", "cid"],
  addressUf: ["uf", "estado", "uf_endereco", "est"],
  neighborhood: ["bairro", "distrito", "bai"],
  street: ["logradouro", "endereco", "rua", "end"],
  number: ["numero", "nº", "nr"],
  cep: ["cep", "c.e.p."],
  fatherName: ["nome do pai", "pai", "genitor"],
  motherName: ["nome da mae", "mae", "genitora"],
  maritalStatus: ["estado civil", "situacao_conjugal", "est_civil"],
  profession: ["profissao", "ocupacao", "cargo"],
  nit: ["nit", "n.i.t."],
  pis: ["pis", "p.i.s."],
  cir: ["cir", "c.i.r.", "carteira_pesca", "registro_pesca"]
};

export const AdminPanelView: React.FC = () => {
  const { 
    tenants, addTenant, toggleTenantStatus, deleteTenant, 
    importMembers, syncData, updateCloudKeys, cloudKeys, session, cloudConnected 
  } = useApp();
  
  const [isAddingTenant, setIsAddingTenant] = useState(false);
  const [tenantFormData, setTenantFormData] = useState({ name: '', username: '', password: '' });
  const [auditLog, setAuditLog] = useState<string[]>([]);
  const [pendingData, setPendingData] = useState<any[] | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isImporting, setIsImporting] = useState(false);
  const [selectedTargetTenant, setSelectedTargetTenant] = useState<string>('');
  const [tempKeys, setTempKeys] = useState({ url: cloudKeys.url, key: cloudKeys.key });

  useEffect(() => {
    if (session.user?.role === 'REGION_USER' && session.user.tenantId) {
      setSelectedTargetTenant(session.user.tenantId);
    } else if (tenants.length > 0 && !selectedTargetTenant) {
      setSelectedTargetTenant(tenants[0].id);
    }
  }, [tenants, session]);

  // Normalização de chaves para comparação robusta
  const normalize = (str: string) => {
    return str.toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, " ");
  };

  // Motor de Mapeamento Heurístico (Substitui a IA para ser Vercel-ready)
  const performLocalMapping = (sample: any) => {
    setAuditLog(["Iniciando análise de cabeçalhos...", "Comparando com dicionário de sinônimos..."]);
    
    const newMapping: Record<string, string> = {};
    const keys = Object.keys(sample);

    keys.forEach(key => {
      const normalizedKey = normalize(key);
      let matchedField = "";
      
      for (const [field, synonyms] of Object.entries(FIELD_SYNONYMS)) {
        if (synonyms.some(syn => {
          const normSyn = normalize(syn);
          return normSyn === normalizedKey || normalizedKey.includes(normSyn) || normSyn.includes(normalizedKey);
        })) {
          matchedField = field;
          break;
        }
      }

      if (matchedField) {
        newMapping[key] = matchedField;
        setAuditLog(prev => [...prev, `Vínculo detectado: "${key}" → ${matchedField}`]);
      }
    });

    setMapping(newMapping);
    setAuditLog(prev => [...prev, "✓ Mapeamento local concluído com sucesso.", `${Object.keys(newMapping).length} campos vinculados automaticamente.`]);
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
        performLocalMapping(dataArray[0]);
      } catch (err) { alert("Arquivo JSON inválido."); }
    };
    reader.readAsText(file);
  };

  const finalizeImport = async () => {
    if (!pendingData || !selectedTargetTenant) return alert("Selecione uma Unidade de destino.");
    setIsImporting(true);
    setAuditLog(prev => [...prev, "Transformando registros para o novo esquema..."]);

    try {
      const converted: Member[] = pendingData.map(oldItem => {
        const newItem: any = { 
          ...EMPTY_MEMBER,
          id: crypto.randomUUID(),
          tenantId: selectedTargetTenant, 
          isSynced: false, 
          updatedAt: new Date().toISOString()
        };
        
        Object.entries(mapping).forEach(([oldKey, newKey]) => {
          let value = oldItem[oldKey];
          if (value !== undefined && value !== null && value !== "") {
            let strValue = String(value).trim();
            
            // Limpeza de datas "00:00:00"
            if (newKey.toLowerCase().includes('date') || newKey === 'birthDate') {
              const dateMatch = strValue.match(/^(\d{4}-\d{2}-\d{2})/);
              if (dateMatch) strValue = dateMatch[1];
            }
            newItem[newKey] = strValue;
          }
        });
        return newItem as Member;
      });

      importMembers(converted);
      setAuditLog(prev => [...prev, "Importação local ok. Sincronizando com Supabase..."]);
      
      const success = await syncData();
      if (success) {
        alert(`${converted.length} sócios importados e enviados para a nuvem.`);
        setPendingData(null);
      } else {
        alert("Dados salvos localmente, mas a nuvem recusou (verifique o RLS no Supabase).");
      }
    } catch (err) {
      alert("Erro na conversão.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantFormData.name || !tenantFormData.username || !tenantFormData.password) return;
    addTenant(tenantFormData.name, tenantFormData.username, tenantFormData.password);
    setIsAddingTenant(false);
    setTenantFormData({ name: '', username: '', password: '' });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Administração SGA</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configurações de Instância e Importação Backend</p>
        </div>
        <button onClick={syncData} disabled={cloudConnected} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 active:scale-95 transition-all">
          <Server size={18} className={cloudConnected ? 'animate-spin' : ''} /> {cloudConnected ? 'Sincronizando...' : 'Sincronizar Agora'}
        </button>
      </div>

      {/* GESTÃO DE UNIDADES */}
      <div className="bg-white border border-slate-200 rounded-[48px] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
            <Globe size={18} className="text-blue-600" /> Unidades Regionais
          </h3>
          <button onClick={() => setIsAddingTenant(true)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center gap-2">
            <Plus size={14} /> Nova Unidade
          </button>
        </div>

        {isAddingTenant && (
          <div className="p-8 border-b border-slate-100 bg-blue-50/20">
             <form onSubmit={handleAddTenant} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <input type="text" placeholder="Nome Cidade" value={tenantFormData.name} onChange={e => setTenantFormData({...tenantFormData, name: e.target.value})} className="bg-white border p-3 rounded-xl text-xs font-bold outline-none" required />
                <input type="text" placeholder="Login" value={tenantFormData.username} onChange={e => setTenantFormData({...tenantFormData, username: e.target.value})} className="bg-white border p-3 rounded-xl text-xs font-bold outline-none" required />
                <input type="password" placeholder="Senha" value={tenantFormData.password} onChange={e => setTenantFormData({...tenantFormData, password: e.target.value})} className="bg-white border p-3 rounded-xl text-xs font-bold outline-none" required />
                <div className="flex gap-2">
                   <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-[9px] font-black uppercase">Criar</button>
                   <button type="button" onClick={() => setIsAddingTenant(false)} className="px-4 bg-slate-200 rounded-xl text-[9px] font-black uppercase">X</button>
                </div>
             </form>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400">Cidade</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400">Acesso</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400">Status</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tenants.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/50">
                  <td className="px-8 py-6 font-black text-xs text-slate-800 uppercase">{t.name}</td>
                  <td className="px-8 py-6 text-xs font-mono text-blue-600">{t.adminUsername}</td>
                  <td className="px-8 py-6">
                    <button onClick={() => toggleTenantStatus(t.id)} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border ${t.isActive ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-red-500 bg-red-50 border-red-100'}`}>
                      {t.isActive ? 'Ativa' : 'Bloqueada'}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => { if(confirm('Excluir?')) deleteTenant(t.id); }} className="text-slate-300 hover:text-red-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white border rounded-[48px] p-10 shadow-sm">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2"><Key size={20}/> Credenciais Supabase</h3>
          <div className="space-y-4">
            <input type="text" value={tempKeys.url} onChange={e => setTempKeys({...tempKeys, url: e.target.value})} className="w-full bg-slate-50 border rounded-2xl p-4 text-[11px] font-bold outline-none" placeholder="URL Supabase" />
            <input type="password" value={tempKeys.key} onChange={e => setTempKeys({...tempKeys, key: e.target.value})} className="w-full bg-slate-50 border rounded-2xl p-4 text-[11px] font-bold outline-none" placeholder="Chave Anon" />
            <button onClick={() => updateCloudKeys(tempKeys.url, tempKeys.key)} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px]">Atualizar Conexão</button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border rounded-[48px] p-10 shadow-sm relative overflow-hidden">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-8 flex items-center gap-2"><Upload size={24} /> Migração de Dados (JSON)</h3>

          {!pendingData ? (
            <div className="border-2 border-dashed border-slate-200 rounded-[32px] p-16 flex flex-col items-center text-center justify-center bg-slate-50/30 relative hover:border-blue-300 transition-colors">
              <Upload size={48} className="text-slate-200 mb-4" />
              <p className="text-[11px] font-black text-slate-600 uppercase mb-4">Solte o arquivo JSON legado aqui</p>
              <input type="file" accept=".json" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          ) : (
            <div className="space-y-6">
               <div className="bg-blue-50 border border-blue-100 rounded-[32px] p-6">
                  <label className="text-[10px] font-black text-blue-600 uppercase block mb-3">Vincular a Unidade</label>
                  <select value={selectedTargetTenant} onChange={(e) => setSelectedTargetTenant(e.target.value)} className="w-full bg-white border border-blue-200 rounded-2xl px-6 py-4 text-xs font-black uppercase outline-none cursor-pointer">
                    <option value="">Selecione a associação...</option>
                    {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
               </div>

               <div className="bg-slate-900 rounded-[32px] p-6 font-mono text-[10px] text-emerald-400 overflow-y-auto max-h-[150px]">
                  {auditLog.map((log, i) => (
                    <div key={i} className="mb-1 flex gap-2">
                      <span className="text-slate-500">{" >> "}</span>
                      <span>{log}</span>
                    </div>
                  ))}
                  {cloudConnected && <div className="text-blue-400 animate-pulse mt-2">{" >>> "} ENVIANDO PARA NUVEM SUPABASE...</div>}
               </div>

               <div className="flex gap-4">
                  <button onClick={finalizeImport} disabled={isImporting || !selectedTargetTenant || cloudConnected} className="flex-1 bg-emerald-600 text-white py-5 rounded-[28px] font-black uppercase text-[11px] shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 active:scale-95 transition-all">
                    {isImporting ? <RefreshCw className="animate-spin" size={18} /> : <CloudIcon size={18} />}
                    {isImporting ? "Convertendo..." : `Finalizar Importação (${pendingData.length} Sócios)`}
                  </button>
                  <button onClick={() => setPendingData(null)} disabled={isImporting} className="px-8 bg-slate-100 text-slate-500 rounded-[28px] font-black uppercase text-[10px] hover:bg-slate-200 transition-colors">Descartar</button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
