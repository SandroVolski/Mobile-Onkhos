import { query, queryWithLimit } from '../config/database';
import pool from '../config/database';

export interface Solicitacao {
  id: number;
  clinica_id: number;
  paciente_id: number;
  hospital_nome: string;
  hospital_codigo: string;
  cliente_nome: string;
  cliente_codigo: string;
  sexo: 'M' | 'F';
  data_nascimento: string;
  idade: number;
  data_solicitacao: string;
  diagnostico_cid: string;
  diagnostico_descricao: string;
  local_metastases?: string;
  estagio_t?: string;
  estagio_n?: string;
  estagio_m?: string;
  estagio_clinico?: string;
  tratamento_cirurgia_radio?: string;
  tratamento_quimio_adjuvante?: string;
  tratamento_quimio_primeira_linha?: string;
  tratamento_quimio_segunda_linha?: string;
  finalidade: 'neoadjuvante' | 'adjuvante' | 'curativo' | 'controle' | 'radioterapia' | 'paliativo';
  performance_status: string;
  siglas?: string;
  ciclos_previstos: number;
  ciclo_atual: number;
  superficie_corporal: number;
  peso: number;
  altura: number;
  medicamentos_antineoplasticos: string;
  dose_por_m2: string;
  dose_total: string;
  via_administracao: string;
  dias_aplicacao_intervalo: string;
  medicacoes_associadas?: string;
  medico_assinatura_crm: string;
  numero_autorizacao?: string;
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'em_analise';
  observacoes?: string;
  created_at: string;
  updated_at: string;
  // Dados do paciente (JOIN)
  paciente_nome?: string;
  paciente_cpf?: string;
  paciente_telefone?: string;
  paciente_email?: string;
}

export interface SolicitacaoCreateInput {
  paciente_id: number;
  hospital_nome: string;
  hospital_codigo: string;
  cliente_nome: string;
  cliente_codigo: string;
  sexo: 'M' | 'F';
  data_nascimento: string;
  idade: number;
  data_solicitacao: string;
  diagnostico_cid: string;
  diagnostico_descricao: string;
  medicamentos_antineoplasticos: string;
  finalidade: 'neoadjuvante' | 'adjuvante' | 'curativo' | 'controle' | 'radioterapia' | 'paliativo';
  observacoes?: string;
}

export interface SolicitacaoUpdateInput {
  status?: 'pendente' | 'aprovada' | 'rejeitada' | 'em_analise';
  observacoes?: string;
  numero_autorizacao?: string;
}

export interface SolicitacaoStats {
  total: number;
  pendentes: number;
  aprovadas: number;
  rejeitadas: number;
  em_analise: number;
  por_finalidade: {
    neoadjuvante: number;
    adjuvante: number;
    curativo: number;
    controle: number;
    radioterapia: number;
    paliativo: number;
  };
}

export class SolicitacaoModel {
  
  // Buscar todas as solicitações com paginação
  static async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    prioridade?: string;
    paciente_id?: number;
    clinicaId?: number;
    medicoId?: number;
  }): Promise<{ data: Solicitacao[]; total: number }> {
    const { page = 1, limit = 20, search = '', status = '', prioridade = '', paciente_id, clinicaId = 1, medicoId } = params;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE s.clinica_id = ?';
    let searchParams: any[] = [clinicaId];
    
    // Filtrar por médico se especificado
    if (medicoId) {
      whereClause += ` AND s.medico_assinatura_crm IN (
        SELECT crm FROM Medicos_Mobile WHERE id = ? AND clinica_id = ?
      )`;
      searchParams.push(medicoId, clinicaId);
    }
    
    if (paciente_id) {
      whereClause += ` AND s.paciente_id = ?`;
      searchParams.push(paciente_id);
    }
    
    if (search && search.trim() !== '') {
      whereClause += ` AND (p.Paciente_Nome LIKE ? OR s.cliente_nome LIKE ? OR s.diagnostico_cid LIKE ? OR s.medicamentos_antineoplasticos LIKE ?)`;
      const searchTerm = `%${search.trim()}%`;
      searchParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (status && status.trim() !== '') {
      whereClause += ` AND s.status = ?`;
      searchParams.push(status);
    }
    
    if (prioridade && prioridade.trim() !== '') {
      whereClause += ` AND s.finalidade = ?`;
      searchParams.push(prioridade);
    }
    
    const selectQuery = `
      SELECT 
        s.*,
        p.Paciente_Nome as paciente_nome,
        p.cpf as paciente_cpf,
        p.telefone as paciente_telefone,
        p.email as paciente_email
      FROM Solicitacoes_Autorizacao s
      LEFT JOIN Pacientes_Clinica p ON s.paciente_id = p.id
      ${whereClause}
      ORDER BY s.created_at DESC
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM Solicitacoes_Autorizacao s
      LEFT JOIN Pacientes_Clinica p ON s.paciente_id = p.id
      ${whereClause}
    `;
    
    try {
      const [countResult, solicitacoes] = await Promise.all([
        query(countQuery, searchParams),
        queryWithLimit(selectQuery, searchParams, limit, offset)
      ]);
      
      const total = countResult[0]?.total || 0;
      
      return {
        data: solicitacoes,
        total
      };
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
      throw new Error('Erro ao buscar solicitações');
    }
  }
  
  // Buscar solicitação por ID
  static async findById(id: number): Promise<Solicitacao | null> {
    const selectQuery = `
      SELECT 
        s.*,
        p.Paciente_Nome as paciente_nome,
        p.cpf as paciente_cpf,
        p.telefone as paciente_telefone,
        p.email as paciente_email
      FROM Solicitacoes_Autorizacao s
      LEFT JOIN Pacientes_Clinica p ON s.paciente_id = p.id
      WHERE s.id = ?
    `;
    
    try {
      const result = await query(selectQuery, [id]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Erro ao buscar solicitação por ID:', error);
      throw new Error('Erro ao buscar solicitação');
    }
  }
  
  // Criar nova solicitação
  static async create(data: SolicitacaoCreateInput, clinicaId: number): Promise<Solicitacao> {
    const insertQuery = `
      INSERT INTO Solicitacoes_Autorizacao 
      (paciente_id, protocolo, cid, prioridade, status, observacoes, clinica_id, data_submissao, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'Pendente', ?, ?, NOW(), NOW(), NOW())
    `;
    
    try {
      const result = await query(insertQuery, [
        data.paciente_id,
        data.protocolo,
        data.cid,
        data.prioridade,
        data.observacoes || '',
        clinicaId
      ]);
      
      const newId = result.insertId;
      const solicitacao = await this.findById(newId);
      
      if (!solicitacao) {
        throw new Error('Erro ao criar solicitação');
      }
      
      return solicitacao;
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      throw new Error('Erro ao criar solicitação');
    }
  }
  
  // Atualizar solicitação
  static async update(id: number, data: SolicitacaoUpdateInput): Promise<Solicitacao | null> {
    const updateFields = [];
    const updateValues = [];
    
    if (data.status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(data.status);
      
      if (data.status === 'Aprovada') {
        updateFields.push('data_aprovacao = NOW()');
      }
    }
    
    if (data.observacoes !== undefined) {
      updateFields.push('observacoes = ?');
      updateValues.push(data.observacoes);
    }
    
    if (data.justificativa_rejeicao !== undefined) {
      updateFields.push('justificativa_rejeicao = ?');
      updateValues.push(data.justificativa_rejeicao);
    }
    
    if (updateFields.length === 0) {
      return await this.findById(id);
    }
    
    updateFields.push('updated_at = NOW()');
    updateValues.push(id);
    
    const updateQuery = `
      UPDATE Solicitacoes_Autorizacao 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;
    
    try {
      await query(updateQuery, updateValues);
      return await this.findById(id);
    } catch (error) {
      console.error('Erro ao atualizar solicitação:', error);
      throw new Error('Erro ao atualizar solicitação');
    }
  }
  
  // Deletar solicitação
  static async delete(id: number): Promise<boolean> {
    const deleteQuery = 'DELETE FROM Solicitacoes_Autorizacao WHERE id = ?';
    
    try {
      const result = await query(deleteQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao deletar solicitação:', error);
      throw new Error('Erro ao deletar solicitação');
    }
  }
  
  // Estatísticas das solicitações
  static async getStats(clinicaId: number, medicoId?: number): Promise<SolicitacaoStats> {
    let whereClause = 'WHERE s.clinica_id = ?';
    let queryParams: any[] = [clinicaId];
    
    // Filtrar por médico se especificado
    if (medicoId) {
      whereClause += ` AND s.medico_assinatura_crm IN (
        SELECT crm FROM Medicos_Mobile WHERE id = ? AND clinica_id = ?
      )`;
      queryParams.push(medicoId, clinicaId);
    }
    
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN s.status = 'pendente' THEN 1 ELSE 0 END) as pendentes,
        SUM(CASE WHEN s.status = 'aprovada' THEN 1 ELSE 0 END) as aprovadas,
        SUM(CASE WHEN s.status = 'rejeitada' THEN 1 ELSE 0 END) as rejeitadas,
        SUM(CASE WHEN s.status = 'em_analise' THEN 1 ELSE 0 END) as em_analise,
        SUM(CASE WHEN s.finalidade = 'neoadjuvante' THEN 1 ELSE 0 END) as neoadjuvante,
        SUM(CASE WHEN s.finalidade = 'adjuvante' THEN 1 ELSE 0 END) as adjuvante,
        SUM(CASE WHEN s.finalidade = 'curativo' THEN 1 ELSE 0 END) as curativo,
        SUM(CASE WHEN s.finalidade = 'controle' THEN 1 ELSE 0 END) as controle,
        SUM(CASE WHEN s.finalidade = 'radioterapia' THEN 1 ELSE 0 END) as radioterapia,
        SUM(CASE WHEN s.finalidade = 'paliativo' THEN 1 ELSE 0 END) as paliativo
      FROM Solicitacoes_Autorizacao s
      ${whereClause}
    `;
    
    try {
      const result = await query(statsQuery, queryParams);
      const stats = result[0] || {};
      
      return {
        total: parseInt(stats.total) || 0,
        pendentes: parseInt(stats.pendentes) || 0,
        aprovadas: parseInt(stats.aprovadas) || 0,
        rejeitadas: parseInt(stats.rejeitadas) || 0,
        em_analise: parseInt(stats.em_analise) || 0,
        por_finalidade: {
          neoadjuvante: parseInt(stats.neoadjuvante) || 0,
          adjuvante: parseInt(stats.adjuvante) || 0,
          curativo: parseInt(stats.curativo) || 0,
          controle: parseInt(stats.controle) || 0,
          radioterapia: parseInt(stats.radioterapia) || 0,
          paliativo: parseInt(stats.paliativo) || 0
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de solicitações:', error);
      throw new Error('Erro ao buscar estatísticas');
    }
  }
  
  // Buscar solicitações recentes (últimos 7 dias)
  static async findRecent(clinicaId: number, limit: number = 5): Promise<Solicitacao[]> {
    const recentQuery = `
      SELECT 
        s.*,
        p.Paciente_Nome as paciente_nome,
        p.cpf as paciente_cpf,
        p.telefone as paciente_telefone,
        p.email as paciente_email
      FROM Solicitacoes_Autorizacao s
      LEFT JOIN Pacientes_Clinica p ON s.paciente_id = p.id
      WHERE s.clinica_id = ? 
        AND s.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY s.created_at DESC
      LIMIT ?
    `;
    
    try {
      const [rows] = await pool.query(recentQuery, [clinicaId, limit]);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar solicitações recentes:', error);
      throw new Error('Erro ao buscar solicitações recentes');
    }
  }
}
