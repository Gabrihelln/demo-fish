
export type UserRole = 'SUPER_ADMIN' | 'REGION_USER';

export type DocumentType = 'RECEIPT' | 'DECLARATION' | 'OTHER';
export type PrintFormat = 'A4' | 'THERMAL' | 'A4_DUAL';

export interface Tenant {
  id: string;
  name: string;
  adminUsername: string;
  adminPassword?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  details?: TenantDetails;
  representatives?: TenantRepresentatives;
}

export interface TenantDetails {
  tenant_id: string;
  nome_entidade: string;
  nome_abreviado: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone_1: string;
  telefone_2: string;
  cnpj: string;
  federacao: string;
  confederacao: string;
  polo: string;
  modelo_carteira: string;
  valor_mensalidade: string;
  valor_filiacao: string;
  quantidade_meses_pagar: string;
  logotipo: string;
  logotipo_endereco: string;
  tipo_impressao: string;
  impressora: string;
  considerar_inativo_apos: string;
  data_fundacao: string;
  email: string;
  banco: string;
  agencia: string;
  conta_corrente: string;
  comarca: string;
  profissao: string;
  registro_federal: string;
  data_filiado_nao_pode_votar: string;
  quantidade_vias_declaracao: string;
  ano: string;
  
  // Presidente
  nome_presidente: string;
  endereco_presidente: string;
  bairro_presidente: string;
  cidade_presidente: string;
  uf_presidente: string;
  rg_presidente: string;
  cpf_presidente: string;
  estado_civil_presidente: string;
  profissao_presidente: string;
  
  // Mandato
  inicio_mandato: string;
  fim_mandato: string;
  cartorio: string;
  rc_posse_livro: string;
  rc_posse_folha: string;
  rc_posse_numero_termo: string;
  data_ata: string;
}

export interface TenantRepresentatives {
  tenant_id: string;
  // Representante 02
  nome_representante_02: string;
  endereco_representante_02: string;
  rg_representante_02: string;
  cpf_representante_02: string;
  estado_civil_representante_02: string;
  bairro_representante_02: string;
  cidade_representante_02: string;
  uf_representante_02: string;
  funcao_representante_02: string;
  inicio_mandato_representante_02: string;
  fim_mandato_representante_02: string;
  cartorio_representante_02: string;
  livro_representante_02: string;
  folha_representante_02: string;
  termo_representante_02: string;
  // Representante 03
  nome_representante_03: string;
  endereco_representante_03: string;
  rg_representante_03: string;
  cpf_representante_03: string;
  estado_civil_representante_03: string;
  bairro_representante_03: string;
  cidade_representante_03: string;
  uf_representante_03: string;
  funcao_representante_03: string;
  inicio_mandato_representante_03: string;
  fim_mandato_representante_03: string;
  cartorio_representante_03: string;
  livro_representante_03: string;
  folha_representante_03: string;
  termo_representante_03: string;
  // Representante 04
  nome_representante_04: string;
  endereco_representante_04: string;
  rg_representante_04: string;
  cpf_representante_04: string;
  estado_civil_representante_04: string;
  bairro_representante_04: string;
  cidade_representante_04: string;
  uf_representante_04: string;
  funcao_representante_04: string;
  inicio_mandato_representante_04: string;
  fim_mandato_representante_04: string;
  cartorio_representante_04: string;
  livro_representante_04: string;
  folha_representante_04: string;
  termo_representante_04: string;
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

export interface GeneratedReceipt {
  id: string;
  tenant_id: string;
  member_id: string;
  template_id: string;
  receipt_number: number;
  template_name: string;
  member_name: string;
  content_snapshot: string;
  created_at: string;
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

export interface DocumentTemplate {
  id: string;
  tenantId: string;
  name: string;
  category: string;
  header: string;
  content: string;
  footer: string;
  type: DocumentType;
  printFormat: PrintFormat;
  updatedAt?: string;
}

// Interface para o formulário de Requerimento ao INSS
export interface RequerimentoINSS {
  id: string;
  data: string;
  codigo: string;
  nome: string;
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
  cei: string;
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
  insc_sindical?: string;
}

// Interface para o formulário de Auto Declaração
export interface AutoDeclaracao {
  id: string;
  data_auto_declaracao: string;
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
  atividades_pesca: {
    id: string;
    dt_inicio: string;
    dt_fim: string;
    local: string;
    situacao: string;
  }[];
  grupo_familiar_condicao: string;
  grupo_familiar_membros: {
    id: string;
    nome: string;
    dt_nascimento: string;
    cpf: string;
    estado_civil: string;
    parentesco: string;
  }[];
  condicoes_embarcacao: {
    id: string;
    dt_inicio: string;
    dt_fim: string;
    condicao: string;
    ab: string;
  }[];
  arrendamentos: {
    id: string;
    dt_inicio: string;
    dt_fim: string;
  }[];
  titulares_embarcacao: {
    id: string;
    nome: string;
    cpf: string;
    dt_inicio: string;
    dt_fim: string;
  }[];
  atividades_pesqueiras_detalhe: {
    id: string;
    atividade: string;
    subsistencia_venda: string;
    valor_anual: string;
  }[];
  processos_industrializacao: {
    id: string;
    dt_inicio: string;
    dt_fim: string;
  }[];
  lista_empregados: {
    id: string;
    nome: string;
    cpf: string;
    dt_inicio: string;
    dt_fim: string;
  }[];
  outras_atividades: {
    id: string;
    atividade: string;
    local: string;
    dt_inicio: string;
    dt_fim: string;
  }[];
  lista_outras_rendas: {
    id: string;
    atividade: string;
    dt_inicio: string;
    dt_fim: string;
    renda: string;
    outras_infos: string;
  }[];
  ipi_recolhimento: string;
  possui_empregados: string;
  outras_rendas_atividades: string;
  participa_cooperativa: string;
  cooperativa_agropecuaria: string;
  cooperativa_entidade?: string;
  cooperativa_cnpj?: string;
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
  ab: number | string;
  numero_tripulantes: number | string;
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
