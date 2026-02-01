
import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Plus, MapPin, User, CheckCircle2, 
  XCircle, Trash2, Globe, Lock, Database, Upload, AlertTriangle, FileJson,
  Sparkles, RefreshCw, Server, ArrowRight, Key, Link, ChevronDown
} from 'lucide-react';
import { useApp } from '../AppContext';
import { GoogleGenAI } from "@google/genai";
import { Member } from '../types';
import { EMPTY_MEMBER } from '../constants';

export const AdminPanelView: React.FC = () => {
  const { 
    tenants, addTenant, toggleTenantStatus, deleteTenant, 
    importMembers, clearDatabase, cloudConnected, syncData, 
    updateCloudKeys, cloudKeys, session 
  } = useApp();
  
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', username: '', password: '' });
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditLog, setAuditLog] = useState<string[]>([]);
  const [pendingData, setPendingData] = useState<any[] | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isImporting, setIsImporting] = useState(false);
  const [selectedTargetTenant, setSelectedTargetTenant] = useState<string>('');
  
  const [tempKeys, setTempKeys] = useState({ url: cloudKeys.url, key: cloudKeys.key });

  useEffect(() => {
    if (session.user?.role === 'REGION_USER' && session.user.tenantId) {
      setSelectedTargetTenant(session.user.tenantId);
    } else if (tenants.length === 1) {
      setSelectedTargetTenant(tenants[0].id);
    }
  }, [tenants, session]);

  const auditDataWithAI = async (json: any[]) => {
    setIsAuditing(true);
    setAuditLog(["Iniciando Auditoria de Migração...", "Lendo estrutura da tabela antiga..."]);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const sample = json[0];
      
      const prompt = `Analise este registro de sócio: ${JSON.stringify(sample)}. 
      Crie um mapeamento JSON onde a CHAVE é o campo do seu arquivo e o VALOR é o campo equivalente no sistema atual.
      Campos de destino aceitos: registration, registrationDate, fullName, nickname, fatherName, motherName, maritalStatus, nationality, naturalness, uf, street, number, neighborhood, city, addressUf, cep, phone, profession, workplace, literate, rg, rgUf, rgExpeditionDate, cpf, ctps, ctpsSeries, ctpsExpeditionDate, voterId, voterZone, voterSection, caepf, pis, nit, cei, rgpMma, rgpEmissionDate, status, photoUrl.
      Retorne APENAS o objeto JSON de mapeamento.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt
      });

      const cleanedResponse = response.text.replace(/```json|```/g, '').trim();
      const suggestedMapping = JSON.parse(cleanedResponse);
      
      setMapping(suggestedMapping);
      setAuditLog(prev => [...prev, "Inteligência Artificial concluiu o mapeamento.", "Correspondência automática para " + Object.keys(suggestedMapping).length + " colunas de dados."]);
    } catch (err) {
      console.error("AI Error:", err);
      setAuditLog(prev => [...prev, "Aviso: Falha na IA. Usando mapeamento manual padrão."]);
      setMapping({
        "Codigo do Socio": "registration",
        "Data de Admissao": "registrationDate",
        "Nome": "fullName",
        "Apelido": "nickname",
        "Pai": "fatherName",
        "Mae": "motherName",
        "RG": "rg",
        "SSP": "rgUf",
        "CPF": "cpf"
      });
    } finally {
      setIsAuditing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const dataArray = Array.isArray(json) ? json : [json];
        setPendingData(dataArray);
        await auditDataWithAI(dataArray);
      } catch (err) {
        alert("Erro ao ler JSON: Certifique-se que o arquivo é um JSON válido.");
      }
    };
    reader.readAsText(file);
  };

  const finalizeImport = () => {
    if (!pendingData || !selectedTargetTenant) {
      alert("Selecione a Unidade de Destino antes de confirmar a migração.");
      return;
    }

    setIsImporting(true);
    setAuditLog(prev => [...prev, "Processando registros..."]);

    try {
      const converted: Member[] = pendingData.map(oldItem => {
        const newItem: any = { 
          ...EMPTY_MEMBER,
          id: crypto.randomUUID(),
          tenantId: selectedTargetTenant, 
          isSynced: false, 
          updatedAt: new Date().toISOString(),
          dependents: [] 
        };
        
        Object.entries(mapping).forEach(([oldKey, newKey]) => {
          let value = oldItem[oldKey];
          if (value === null || value === undefined) value = '';
          if (typeof value === 'string' && value.includes('00:00:00')) value = value.split(' ')[0];
          newItem[newKey] = String(value);
        });

        return newItem as Member;
      });

      importMembers(converted);
      alert(`${converted.length} sócios foram migrados com sucesso para a unidade selecionada!`);
      setPendingData(null);
      setMapping({});
    } catch (err) {
      console.error("Erro na Migração:", err);
      alert("Falha ao converter dados. Verifique a estrutura do arquivo.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleSaveKeys = () => {
    updateCloudKeys(tempKeys.url, tempKeys.key);
    alert("Configurações de nuvem atualizadas!");
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Central de Migração e Cloud</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">SGA Smart Migrator v2.1</p>
        </div>
        <div className="flex gap-3">
           <button 
            onClick={syncData}
            disabled={cloudConnected}
            className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:-translate-y-1 transition-all shadow-lg"
          >
            {cloudConnected ? <RefreshCw className="animate-spin" size={18} /> : <Server size={18} />}
            Sincronizar Nuvem
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white border border-slate-200 rounded-[48px] p-10 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-lg">
              <Key size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Conexão Supabase</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Configure sua base de dados online</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Supabase URL</label>
              <input 
                type="text" 
                value={tempKeys.url}
                onChange={e => setTempKeys({...tempKeys, url: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[11px] font-bold outline-none"
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Anon Key</label>
              <input 
                type="password" 
                value={tempKeys.key}
                onChange={e => setTempKeys({...tempKeys, key: e.target.value})}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-[11px] font-bold outline-none"
                placeholder="eyJhbGci..."
              />
            </div>
            <button 
              onClick={handleSaveKeys}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all mt-4"
            >
              Salvar Configuração Cloud
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[48px] p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sparkles size={120} className="text-blue-600" />
          </div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-600/20">
              <Database size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">SGA Smart Auditor (IA)</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Importação automatizada via JSON</p>
            </div>
          </div>

          {!pendingData ? (
            <div className="border-2 border-dashed border-slate-200 rounded-[32px] p-16 flex flex-col items-center text-center justify-center hover:border-blue-400 transition-all group relative bg-slate-50/30">
              <Upload size={48} className="text-slate-200 mb-4 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
              <p className="text-[11px] font-black text-slate-600 uppercase tracking-tight mb-2">Subir Tabela de Sócios (JSON)</p>
              <input type="file" accept=".json" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          ) : (
            <div className="space-y-6">
               <div className="bg-blue-50/50 border border-blue-100 rounded-[32px] p-6">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 block ml-2">Unidade de Destino dos Dados</label>
                  <div className="relative">
                    <select 
                      value={selectedTargetTenant}
                      onChange={(e) => setSelectedTargetTenant(e.target.value)}
                      className="w-full appearance-none bg-white border border-blue-200 rounded-2xl px-6 py-4 text-xs font-black uppercase text-slate-700 outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">Selecione a Unidade...</option>
                      {tenants.map(t => (
                        <option key={t.id} value={t.id}>{t.name} (ID: {t.id.slice(0,8)}...)</option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600">
                      <ChevronDown size={18} />
                    </div>
                  </div>
               </div>

               <div className="bg-slate-950 rounded-[32px] p-8 font-mono text-[10px] text-emerald-400 overflow-y-auto max-h-[200px] border border-white/10">
                  <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-2 text-white/50">
                    <Sparkles size={12} /> <span>LOG DE AUDITORIA DE SÓCIOS</span>
                  </div>
                  {auditLog.map((log, i) => (
                    <div key={i} className="mb-1 flex gap-2">
                      <span className="opacity-30">[{new Date().toLocaleTimeString()}]</span>
                      <span>{log}</span>
                    </div>
                  ))}
                  {isAuditing && <div className="animate-pulse text-blue-400">Gemini analisando estrutura...</div>}
               </div>

               <div className="flex gap-4">
                  <button 
                    onClick={finalizeImport} 
                    disabled={isImporting || isAuditing || !selectedTargetTenant}
                    className="flex-1 bg-emerald-600 text-white py-5 rounded-[28px] font-black uppercase text-[11px] tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-900/10"
                  >
                    {isImporting ? "Convertendo..." : `Confirmar Migração (${pendingData.length} sócios)`}
                  </button>
                  <button onClick={() => setPendingData(null)} className="px-8 bg-slate-100 text-slate-500 rounded-[28px] font-black uppercase text-[10px] hover:bg-slate-200">Cancelar</button>
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[48px] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
            <Globe size={18} className="text-blue-600" /> Cidades / Associações Cadastradas
          </h3>
          {session.user?.role === 'SUPER_ADMIN' && (
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center gap-2"
            >
              <Plus size={14} /> Novo Tenant
            </button>
          )}
        </div>

        {isAdding && (
          <div className="p-8 border-b border-slate-100 bg-blue-50/30">
             <form onSubmit={(e) => {
               e.preventDefault();
               addTenant(formData.name, formData.username, formData.password);
               setIsAdding(false);
               setFormData({ name: '', username: '', password: '' });
             }} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Nome</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Usuário</label>
                  <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-4">Senha</label>
                  <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-bold outline-none" required />
                </div>
                <div className="flex gap-2">
                   <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest">Criar</button>
                   <button type="button" onClick={() => setIsAdding(false)} className="px-4 bg-slate-200 text-slate-600 rounded-xl text-[9px] font-black uppercase">X</button>
                </div>
             </form>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Nome da Associação</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Tenant ID (Interno)</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <MapPin size={18} className="text-slate-400" />
                      <span className="text-xs font-black text-slate-800 uppercase">{t.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-mono text-[10px] text-blue-600 font-bold">{t.id}</td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => toggleTenantStatus(t.id)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all ${t.isActive ? 'text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100' : 'text-red-500 bg-red-50 border-red-100 hover:bg-red-100'}`}
                    >
                      {t.isActive ? 'Ativo' : 'Bloqueado'}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right space-x-2">
                    {session.user?.role === 'SUPER_ADMIN' && (
                      <button onClick={() => { if(confirm('Excluir?')) deleteTenant(t.id); }} className="p-2 text-slate-300 hover:text-red-600 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
