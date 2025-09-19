import { query } from '../config/database';

export interface MedicoMobile {
  id: number;
  clinica_id: number;
  nome: string;
  email: string;
  crm: string;
  especialidade?: string;
  telefone?: string;
  status: 'ativo' | 'inativo';
  created_at: string;
  updated_at: string;
  clinica_nome?: string; // Adicionado para compatibilidade com JOIN
}

export interface MedicoMobileLogin {
  email: string;
  crm: string;
}

export class MedicoMobileModel {
  
  // Buscar médico por email e CRM (para login)
  static async findByEmailAndCRM(email: string, crm: string): Promise<MedicoMobile | null> {
    const sql = `
      SELECT 
        id, clinica_id, nome, email, crm, especialidade, telefone, status, created_at, updated_at
      FROM Medicos_Mobile
      WHERE email = ? AND crm = ? AND status = 'ativo'
    `;
    
    try {
      console.log('🔍 Executando query:', sql);
      console.log('🔍 Parâmetros:', [email, crm]);
      
      const rows = await query(sql, [email, crm]);
      console.log('🔍 Resultado da query:', rows);
      console.log('🔍 Tipo do resultado:', typeof rows);
      console.log('🔍 É array?', Array.isArray(rows));
      
      if (Array.isArray(rows) && rows.length > 0) {
        const medico = rows[0];
        console.log('🔍 Médico encontrado (array):', medico);
        // Adicionar clinica_nome como null por enquanto
        medico.clinica_nome = null;
        return medico;
      } else if (rows && typeof rows === 'object' && rows.id) {
        // Se o resultado é um objeto único (não array)
        console.log('🔍 Médico encontrado (objeto único):', rows);
        // Adicionar clinica_nome como null por enquanto
        rows.clinica_nome = null;
        return rows;
      }
      
      console.log('🔍 Nenhum médico encontrado');
      return null;
    } catch (error) {
      console.error('Erro ao buscar médico por email e CRM:', error);
      throw error;
    }
  }
  
  // Buscar médico por ID
  static async findById(id: number): Promise<MedicoMobile | null> {
    const sql = `
      SELECT 
        m.*,
        c.nome as clinica_nome
      FROM Medicos_Mobile m
      LEFT JOIN Clinicas c ON m.clinica_id = c.id
      WHERE m.id = ? AND m.status = 'ativo'
    `;
    
    try {
      console.log('🔍 Buscando médico por ID:', id);
      const rows = await query(sql, [id]);
      console.log('🔍 Resultado da busca por ID:', rows);
      console.log('🔍 Tipo do resultado:', typeof rows);
      console.log('🔍 É array?', Array.isArray(rows));
      
      if (Array.isArray(rows) && rows.length > 0) {
        console.log('🔍 Médico encontrado (array):', rows[0]);
        return rows[0];
      } else if (rows && typeof rows === 'object' && rows.id) {
        console.log('🔍 Médico encontrado (objeto único):', rows);
        return rows;
      }
      
      console.log('🔍 Nenhum médico encontrado para ID:', id);
      return null;
    } catch (error) {
      console.error('Erro ao buscar médico por ID:', error);
      throw error;
    }
  }
  
  // Listar médicos por clínica
  static async findByClinicaId(clinicaId: number): Promise<MedicoMobile[]> {
    const sql = `
      SELECT 
        m.*,
        c.nome as clinica_nome
      FROM Medicos_Mobile m
      LEFT JOIN Clinicas c ON m.clinica_id = c.id
      WHERE m.clinica_id = ? AND m.status = 'ativo'
      ORDER BY m.nome
    `;
    
    try {
      const [rows] = await query(sql, [clinicaId]);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar médicos por clínica:', error);
      throw error;
    }
  }
  
  // Criar novo médico
  static async create(medicoData: Omit<MedicoMobile, 'id' | 'created_at' | 'updated_at'>): Promise<MedicoMobile> {
    const sql = `
      INSERT INTO Medicos_Mobile 
      (clinica_id, nome, email, crm, especialidade, telefone, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      medicoData.clinica_id,
      medicoData.nome,
      medicoData.email,
      medicoData.crm,
      medicoData.especialidade || null,
      medicoData.telefone || null,
      medicoData.status || 'ativo'
    ];
    
    try {
      const [result] = await query(sql, values);
      const newMedico = await this.findById(result.insertId);
      return newMedico!;
    } catch (error) {
      console.error('Erro ao criar médico:', error);
      throw error;
    }
  }
  
  // Atualizar médico
  static async update(id: number, medicoData: Partial<MedicoMobile>): Promise<MedicoMobile | null> {
    const fields = [];
    const values = [];
    
    if (medicoData.nome) {
      fields.push('nome = ?');
      values.push(medicoData.nome);
    }
    if (medicoData.email) {
      fields.push('email = ?');
      values.push(medicoData.email);
    }
    if (medicoData.crm) {
      fields.push('crm = ?');
      values.push(medicoData.crm);
    }
    if (medicoData.especialidade) {
      fields.push('especialidade = ?');
      values.push(medicoData.especialidade);
    }
    if (medicoData.telefone) {
      fields.push('telefone = ?');
      values.push(medicoData.telefone);
    }
    if (medicoData.status) {
      fields.push('status = ?');
      values.push(medicoData.status);
    }
    
    if (fields.length === 0) {
      return await this.findById(id);
    }
    
    fields.push('updated_at = NOW()');
    values.push(id);
    
    const sql = `UPDATE Medicos_Mobile SET ${fields.join(', ')} WHERE id = ?`;
    
    try {
      await query(sql, values);
      return await this.findById(id);
    } catch (error) {
      console.error('Erro ao atualizar médico:', error);
      throw error;
    }
  }
  
  // Deletar médico (soft delete)
  static async delete(id: number): Promise<boolean> {
    const sql = 'UPDATE Medicos_Mobile SET status = "inativo", updated_at = NOW() WHERE id = ?';
    
    try {
      const [result] = await query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao deletar médico:', error);
      throw error;
    }
  }
  
  // Verificar se email já existe
  static async emailExists(email: string, excludeId?: number): Promise<boolean> {
    let sql = 'SELECT COUNT(*) as count FROM Medicos_Mobile WHERE email = ?';
    const values = [email];
    
    if (excludeId) {
      sql += ' AND id != ?';
      values.push(excludeId);
    }
    
    try {
      const [rows] = await query(sql, values);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      throw error;
    }
  }
  
  // Verificar se CRM já existe
  static async crmExists(crm: string, excludeId?: number): Promise<boolean> {
    let sql = 'SELECT COUNT(*) as count FROM Medicos_Mobile WHERE crm = ?';
    const values = [crm];
    
    if (excludeId) {
      sql += ' AND id != ?';
      values.push(excludeId);
    }
    
    try {
      const [rows] = await query(sql, values);
      return rows[0].count > 0;
    } catch (error) {
      console.error('Erro ao verificar CRM:', error);
      throw error;
    }
  }
}
