
export const UF_OPTIONS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const MARITAL_STATUS_OPTIONS = [
  'Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável'
];

export const BLOOD_TYPE_OPTIONS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

export const CATEGORY_OPTIONS = [
  'Pescador Artesanal', 'Marisqueira', 'Industrial', 'Outros'
];

export const YES_NO_OPTIONS = ['Sim', 'Não'];

export const SEX_OPTIONS = ['Masculino', 'Feminino', 'Outro'];

export const STATUS_OPTIONS = ['Ativo', 'Inativo', 'Suspenso', 'Aposentado', 'Falecido'];

export const EMPTY_MEMBER: any = {
  id: '',
  tenant_id: '',
  isSynced: false,
  
  codigo_socio: '',
  data_admissao: '',
  codigo_antigo: '',
  recadastro: '',
  codigo_delegacia: '',
  codigo_comunidade: '',
  data_nascimento: '',
  
  nome: '',
  apelido: '',
  nome_pai: '',
  nome_mae: '',
  estado_civil: '',
  conjuge: '',
  nacionalidade: '',
  naturalidade: '',
  uf_naturalidade: '',
  sexo: '',
  alfabetizado: '',
  escolaridade: '',
  tipo_sanguineo: '',
  
  endereco: '',
  numero: '',
  bairro: '',
  cidade: '',
  uf: '',
  cep: '',
  complemento: '',
  ponto_referencia: '',
  telefone: '',
  email: '',
  
  profissao: '',
  empregador: '',
  local_trabalho: '',
  inscricao_incra: '',
  area_fazenda: '',
  renda_familiar: '',
  quantidade_membros_familia: '',
  
  rg: '',
  orgao_expedidor_rg: '',
  data_expedicao_rg: '',
  cpf: '',
  ctps: '',
  serie_ctps: '',
  data_expedicao_ctps: '',
  titulo_eleitor: '',
  zona_eleitoral: '',
  secao_eleitoral: '',
  cir: '',
  nit: '',
  pis: '',
  cei: '',
  caepf: '',
  sus: '',
  numero_dap: '',
  grupo_dap: '',
  validade_dap: '',
  outros_documentos: '',
  
  embarcacao: '',
  embarcacao_rgp: '',
  rgp_uf: '',
  ab: '',
  numero_tripulantes: '',
  cpf_proprietario: '',
  numero_propriedade_receita_federal: '',
  data_emissao_rgp: '',
  
  codigo_categoria: '',
  situacao: '',
  ultimo_mes_pago: '',
  numero_beneficio: '',
  especie: '',
  data_transferencia: '',
  data_falecimento: '',
  destino_transferencia: '',
  id_defeso: '',
  tem_defeso: '',
  
  situacao_mpa: '',
  codigo_gps_mpa: '',
  senha_gps_mpa: '',
  senha_inss_mpa: '',
  
  data_ultimo_pagamento: '',
  primeira_data_pagamento: '',
  ultimo_dia_pago: '',
  data_ultimo_movimento: '',
  
  livro: '',
  folha: '',
  numero_termo: '',
  pasta_socios: '',
  pasta_embarcacao: '',
  foto: '',
  local_foto: '',
  webcam: '',
  observacao: '',
  
  dependents: [],
  photoUrl: ''
};
