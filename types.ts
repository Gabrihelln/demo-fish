
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

export interface Category {
  id: string;
  tenant_id: string;
  codigo: string;
  nome: string;
  isSynced: boolean;
}

export interface Locality {
  id: string;
  tenant_id: string;
  codigo: string;
  nome: string;
  isSynced: boolean;
}

export interface Mensalidade {
  id: string;
  tenant_id: string;
  codigo_mensalidade: string;
  data: string;
  codigo_socio: string;
  data_ultimo_mes_pago: string;
  quantidade_meses: string;
  data_ate_quando_pagar: string;
  valor: string;
  desconto_valor: string;
  desconto_percentual: string;
  valor_desconto_percentual: string;
  valor_total: string;
  observacao: string;
  isSynced: boolean;
}

export interface RequerimentoINSS {
  id: string;
  tenant_id: string;
  codigo: string;
  data: string;
  insc_sindical: string;
  nome: string;
  cei: string;
  data_nascimento: string;
  nome_mae: string;
  cpf: string;
  rg: string;
  pis: string;
  nit: string;
  endereco: string;
  numero: string;
  bairro_complemento: string;
  municipio: string;
  uf: string;
  telefone: string;
  cep: string;
  situacao_mpa: string;
  nr_rgp: string;
  uf_rg: string;
  ab: string;
  nr_tripulantes: string;
  cpf_proprietario: string;
  nr_publicacao: string;
  dt_publicacao: string;
  area: string;
  p1_inicio: string;
  p1_fim: string;
  p2_inicio: string;
  p2_fim: string;
  especies_proibidas: string;
  isSynced: boolean;
}

export interface AutoDeclaracao {
  id: string;
  tenant_id: string;
  data_auto_declaracao: string;
  // Segurado
  insc_sindical: string;
  nome_segurado: string;
  apelido: string;
  data_nascimento: string;
  local_nascimento: string;
  logradouro: string;
  numero: string;
  uf: string;
  bairro_distrito: string;
  municipio: string;
  rg: string;
  data_expedicao_rg: string;
  local_expedicao_rg: string;
  cpf: string;
  rgp: string;
  cei_caepf: string;
  // Tabelas e Listas
  atividades_pesca: Array<{id: string, dt_inicio: string, dt_fim: string, local: string, situacao: string}>;
  grupo_familiar_condicao: string;
  grupo_familiar_membros: Array<{id: string, nome: string, dt_nascimento: string, cpf: string, estado_civil: string, parentesco: string}>;
  condicoes_embarcacao: Array<{id: string, dt_inicio: string, dt_fim: string, condicao: string, ab: string}>;
  arrendamentos: Array<{id: string, dt_inicio: string, dt_fim: string}>;
  titulares_embarcacao: Array<{id: string, nome: string, cpf: string, dt_inicio: string, dt_fim: string}>;
  atividades_pesqueiras_detalhe: Array<{id: string, atividade: string, subsistencia_venda: string, valor_anual: string}>;
  ipi_recolhimento: string;
  processos_industrializacao: Array<{id: string, dt_inicio: string, dt_fim: string}>;
  possui_empregados: string;
  lista_empregados: Array<{id: string, nome: string, cpf: string, dt_inicio: string, dt_fim: string}>;
  outras_atividades: Array<{id: string, atividade: string, local: string, dt_inicio: string, dt_fim: string}>;
  outras_rendas_atividades: string;
  lista_outras_rendas: Array<{id: string, atividade: string, dt_inicio: string, dt_fim: string, renda: string, outras_infos: string}>;
  participa_cooperativa: string;
  cooperativa_entidade: string;
  cooperativa_cnpj: string;
  cooperativa_agropecuaria: string;
  isSynced: boolean;
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
  codigo_socio: string;
  data_admissao: string;
  codigo_antigo: string;
  recadastro: string;
  codigo_delegacia: string;
  codigo_comunidade: string;
  data_nascimento: string;
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
  profissao: string;
  empregador: string;
  local_trabalho: string;
  inscricao_incra: string;
  area_fazenda: string;
  renda_familiar: string;
  quantidade_membros_familia: string;
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
  embarcacao: string;
  embarcacao_rgp: string;
  rgp_uf: string;
  ab: string;
  numero_tripulantes: string;
  cpf_proprietario: string;
  numero_propriedade_receita_federal: string;
  data_emissao_rgp: string;
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
  situacao_mpa: string;
  codigo_gps_mpa: string;
  senha_gps_mpa: string;
  senha_inss_mpa: string;
  data_ultimo_pagamento: string;
  primeira_data_pagamento: string;
  ultimo_dia_pago: string;
  data_ultimo_movimento: string;
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
  uf_rg?: string;
}

export type TabType = 'frente' | 'outros' | 'verso';

export interface MenuItem {
  id: string;
  label: string;
  icon?: any;
  children?: MenuItem[];
}
