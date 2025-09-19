export interface Agendamento {
  id?: number;
  clinica_id: number;
  paciente_id: number;
  medico_id: number;
  data_agendamento: string; // YYYY-MM-DD
  horario_inicio: string; // HH:MM:SS
  horario_fim: string; // HH:MM:SS
  tipo_consulta: 'primeira_consulta' | 'retorno' | 'quimioterapia' | 'radioterapia' | 'cirurgia' | 'seguimento' | 'emergencia';
  status: 'agendada' | 'confirmada' | 'em_andamento' | 'concluida' | 'cancelada' | 'reagendada';
  local?: string;
  observacoes?: string;
  motivo_cancelamento?: string;
  data_cancelamento?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AgendamentoWithDetails extends Agendamento {
  paciente_nome?: string;
  medico_nome?: string;
  clinica_nome?: string;
}

export interface AgendamentoFilters {
  data_inicio?: string;
  data_fim?: string;
  medico_id?: number;
  paciente_id?: number;
  status?: string;
  tipo_consulta?: string;
  page?: number;
  limit?: number;
}

export interface AgendamentoStats {
  total_agendamentos: number;
  agendamentos_hoje: number;
  agendamentos_semana: number;
  por_status: {
    agendada: number;
    confirmada: number;
    em_andamento: number;
    concluida: number;
    cancelada: number;
    reagendada: number;
  };
  por_tipo: {
    primeira_consulta: number;
    retorno: number;
    quimioterapia: number;
    radioterapia: number;
    cirurgia: number;
    seguimento: number;
    emergencia: number;
  };
}

export interface AgendamentoDashboard {
  proximos_agendamentos: AgendamentoWithDetails[];
  agendamentos_hoje: AgendamentoWithDetails[];
  stats: AgendamentoStats;
}
