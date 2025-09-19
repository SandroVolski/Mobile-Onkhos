// Interfaces base
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Interface do Paciente (baseada no banco existente)
export interface Paciente {
  id: number;
  clinica_id: number;
  Paciente_Nome: string;
  Operadora: number;
  Prestador: number;
  Codigo?: string;
  Data_Nascimento: string;
  Sexo: 'Masculino' | 'Feminino';
  Cid_Diagnostico: string;
  Data_Primeira_Solicitacao: string;
  cpf?: string;
  rg?: string;
  telefone?: string;
  endereco?: string;
  email?: string;
  nome_responsavel?: string;
  telefone_responsavel?: string;
  plano_saude?: string;
  abrangencia?: string;
  numero_carteirinha?: string;
  status: 'Em tratamento' | 'Em remissão' | 'Alta' | 'Óbito';
  observacoes?: string;
  stage: string;
  treatment: string;
  peso?: number;
  altura?: number;
  setor_prestador?: string;
  contato_emergencia_nome?: string;
  contato_emergencia_telefone?: string;
  endereco_rua?: string;
  endereco_numero?: string;
  endereco_complemento?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  endereco_cep?: string;
  created_at?: string;
  updated_at?: string;
  operadora_nome?: string;
  prestador_nome?: string;
}

// Interface para criar paciente
export interface PacienteCreateInput {
  clinica_id?: number;
  Paciente_Nome: string;
  Operadora?: number | string;
  Prestador?: number | string;
  Codigo?: string;
  Data_Nascimento: string;
  Sexo: string;
  Cid_Diagnostico: string;
  Data_Primeira_Solicitacao?: string;
  Data_Inicio_Tratamento?: string;
  cpf?: string;
  rg?: string;
  telefone?: string;
  endereco?: string;
  email?: string;
  nome_responsavel?: string;
  telefone_responsavel?: string;
  plano_saude?: string;
  abrangencia?: string;
  numero_carteirinha?: string;
  status: string;
  observacoes?: string;
  stage: string;
  treatment: string;
  peso?: number;
  altura?: number;
  setor_prestador?: string;
  contato_emergencia_nome?: string;
  contato_emergencia_telefone?: string;
  endereco_rua?: string;
  endereco_numero?: string;
  endereco_complemento?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  endereco_cep?: string;
}

// Interface para atualizar paciente
export interface PacienteUpdateInput extends Partial<PacienteCreateInput> {}

// Interface para usuário/médico
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  username?: string;
  password_hash?: string;
  role: 'admin' | 'clinica' | 'operadora';
  status: 'ativo' | 'inativo';
  clinica_id?: number;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface para login
export interface LoginRequest {
  email: string;
  senha: string;
}

// Interface para resposta de login
export interface LoginResponse {
  user: {
    id: number;
    nome: string;
    email: string;
    role: string;
    clinica_id?: number;
  };
  accessToken: string;
  refreshToken: string;
}

// Interface para JWT payload
export interface JWTPayload {
  id: number;
  userId?: number; // Compatibilidade
  email: string;
  role: string;
  clinica_id?: number;
  clinicaId?: number; // Compatibilidade
  iat?: number;
  exp?: number;
}

// Interface para request autenticado
export interface AuthenticatedRequest {
  user?: JWTPayload;
}

// Interface para dados do paciente no mobile (simplificada)
export interface MobilePaciente {
  id: number;
  name: string;
  age: number;
  phone: string;
  email: string;
  diagnosis: string;
  stage: string;
  status: 'ativo' | 'inativo';
  lastVisit: string;
  nextAppointment: string | null;
  treatmentPlan: string;
  doctor: string;
  initials: string;
}
