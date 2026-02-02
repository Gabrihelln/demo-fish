
export type UserRole = 'SUPER_ADMIN' | 'REGION_USER';

export interface Tenant {
  id: string;
  name: string;
  adminUsername: string;
  adminPassword?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: {
    id: string;
    username: string;
    role: UserRole;
    tenantId?: string;
    cityName?: string;
  } | null;
}

export interface Dependent {
  id: string;
  name: string;
  birthDate: string;
  relationship: string;
}

export interface DocumentTemplate {
  id: string;
  tenantId: string;
  name: string;
  category: string;
  header: string;
  content: string;
  footer: string;
  updatedAt?: string;
}

export interface Member {
  id: string;
  tenant_id: string;
  isSynced: boolean;
  
  // Identificação e Admin
  codigo_socio: string;
  data_admissao: string;
  codigo_antigo: string;
  recadastro: string;
  codigo_delegacia: string;
  codigo_comunidade: string;
  data_nascimento: string;
  
  // Pessoais
  nome: string;
  apelido: string;
  nome_pai: string;
  nome_mae: string;
  estado_civil: string;
  conjuge: string;
  nacionalidade: string;
  naturalidade: string;
  uf_naturalidade: string;
  sexo: string;
  alfabetizado: string;
  escolaridade: string;
  tipo_sanguineo: string;
  
  // Localização
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  complemento: string;
  ponto_referencia: string;
  telefone: string;
  email: string;
  
  // Profissional
  profissao: string;
  empregador: string;
  local_trabalho: string;
  inscricao_incra: string;
  area_fazenda: string;
  renda_familiar: string;
  quantidade_membros_familia: string;
  
  // Documentos
  rg: string;
  orgao_expedidor_rg: string;
  data_expedicao_rg: string;
  cpf: string;
  ctps: string;
  serie_ctps: string;
  data_expedicao_ctps: string;
  titulo_eleitor: string;
  zona_eleitoral: string;
  secao_eleitoral: string;
  cir: string;
  nit: string;
  pis: string;
  cei: string;
  caepf: string;
  sus: string;
  numero_dap: string;
  grupo_dap: string;
  validade_dap: string;
  outros_documentos: string;
  
  // Embarcação
  embarcacao: string;
  embarcacao_rgp: string;
  rgp_uf: string;
  ab: string;
  numero_tripulantes: string;
  cpf_proprietario: string;
  numero_propriedade_receita_federal: string;
  data_emissao_rgp: string;
  
  // Situação
  codigo_categoria: string;
  situacao: string;
  ultimo_mes_pago: string;
  numero_beneficio: string;
  especie: string;
  data_transferencia: string;
  data_falecimento: string;
  destino_transferencia: string;
  id_defeso: string;
  tem_defeso: string;
  
  // MPA
  situacao_mpa: string;
  codigo_gps_mpa: string;
  senha_gps_mpa: string;
  senha_inss_mpa: string;
  
  // Datas de Pagamento
  data_ultimo_pagamento: string;
  primeira_data_pagamento: string;
  ultimo_dia_pago: string;
  data_ultimo_movimento: string;
  
  // Outros
  livro: string;
  folha: string;
  numero_termo: string;
  pasta_socios: string;
  pasta_embarcacao: string;
  foto: string;
  local_foto: string;
  webcam: string;
  observacao: string;
  
  dependents: Dependent[];
  photoUrl?: string;
}

export type TabType = 'frente' | 'outros' | 'verso';

export interface MenuItem {
  id: string;
  label: string;
  icon?: any;
  children?: MenuItem[];
}
