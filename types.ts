
export type UserRole = 'SUPER_ADMIN' | 'REGION_USER';

export interface Tenant {
  id: string;
  name: string; // Nome da Cidade ou Associação
  adminUsername: string;
  adminPassword?: string; // Senha para acesso regional
  isActive: boolean;
  createdAt: string;
}

export interface AuthSession {
  user: {
    id: string;
    username: string;
    role: UserRole;
    tenantId?: string; // Se for REGION_USER, pertence a esta cidade
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
  tenantId: string; // Pertence a qual cidade
  name: string;
  category: string;
  header: string;
  content: string;
  footer: string;
}

export interface Member {
  id: string;
  tenantId: string; // Pertence a qual cidade
  // ABA 1 - FRENTE
  registration: string;
  oldRegistration: string;
  locality: string;
  reRegistrationDate: string;
  registrationDate: string;
  birthDate: string;
  fullName: string;
  nickname: string;
  fatherName: string;
  motherName: string;
  nationality: string;
  naturalness: string;
  uf: string;
  profession: string;
  workplace: string;
  email: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  addressUf: string;
  cep: string;
  phone: string;
  dapNumber: string;
  group: string;
  validityDate: string;
  category: string;
  sus: string;
  bloodType: string;
  photoUrl: string;

  // ABA 2 - OUTROS
  maritalStatus: string;
  literate: string;
  rg: string;
  rgUf: string;
  rgExpeditionDate: string;
  cpf: string;
  ctps: string;
  ctpsSeries: string;
  ctpsExpeditionDate: string;
  voterId: string;
  voterZone: string;
  voterSection: string;
  caepf: string;
  sex: string;
  pis: string;
  cei: string;
  nit: string;
  rgpMma: string;
  rgpEmissionDate: string;
  boatName: string;
  boatRgp: string;
  boatUf: string;
  boatAb: string;
  boatCrewCount: string;
  ownerCpf: string;
  status: string;
  lastMonthPaid: string;
  benefitNumber: string;
  species: string;
  deathDate: string;
  transferDate: string;
  transferDestination: string;
  firstMonthPaid: string;
  mpaStatus: string;
  gpsCode: string;
  gpsPassword: string;
  inssPassword: string;

  // ABA 3 - VERSO
  associateFolder: string;
  boatFolder: string;
  defenseFish: string;
  otherDocs: string;
  dependents: Dependent[];
  observations: string;
}

export type TabType = 'frente' | 'outros' | 'verso';

export interface MenuItem {
  id: string;
  label: string;
  icon?: any;
  children?: MenuItem[];
}
