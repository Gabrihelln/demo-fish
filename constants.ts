
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
  id: '', tenant_id: '', updated_at: '', isSynced: false,
  codigo_socio: '', data_admissao: '', codigo_antigo: '', recadastro: '', codigo_delegacia: '', codigo_comunidade: '',
  data_nascimento: '', nome: '', apelido: '', nome_pai: '', nome_mae: '', estado_civil: '', conjuge: '',
  nacionalidade: '', naturalidade: '', uf_naturalidade: '', endereco: '', numero: '', bairro: '', cidade: '',
  uf: '', cep: '', complemento: '', ponto_referencia: '', telefone: '', profissao: '', empregador: '',
  local_trabalho: '', alfabetizado: '', escolaridade: '', rg: '', orgao_expedidor_rg: '', data_expedicao_rg: '',
  cpf: '', ctps: '', serie_ctps: '', data_expedicao_ctps: '', titulo_eleitor: '', zona_eleitoral: '',
  secao_eleitoral: '', cir: '', embarcacao: '', embarcacao_rgp: '', rgp_uf: '', ab: '', numero_tripulantes: '',
  cpf_proprietario: '', quantidade_membros_familia: '', renda_familiar: '', inscricao_incra: '', area_fazenda: '',
  livro: '', folha: '', numero_termo: '', nit: '', pis: '', cei: '', caepf: '', numero_propriedade_receita_federal: '',
  data_emissao_rgp: '', codigo_categoria: '', situacao: '', ultimo_mes_pago: '', numero_beneficio: '', especie: '',
  data_transferencia: '', data_falecimento: '', observacao: '', foto: '', local_foto: '', webcam: '', sexo: '',
  data_ultimo_pagamento: '', primeira_data_pagamento: '', ultimo_dia_pago: '', destino_transferencia: '',
  data_ultimo_movimento: '', pasta_socios: '', pasta_embarcacao: '', email: '', id_defeso: '', numero_dap: '',
  grupo_dap: '', validade_dap: '', tem_defeso: '', tipo_sanguineo: '', sus: '', outros_documentos: '',
  situacao_mpa: '', codigo_gps_mpa: '', senha_gps_mpa: '', senha_inss_mpa: '',
  dependents: [], photoUrl: ''
};
