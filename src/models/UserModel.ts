import bcrypt from 'bcryptjs';
import { query } from '../config/database';
import { Usuario, LoginRequest } from '../types';

export class UserModel {
  
  // Buscar usuário por email
  static async findByEmail(email: string): Promise<Usuario | null> {
    const selectQuery = `
      SELECT 
        u.*,
        c.nome as clinica_nome
      FROM Usuarios u
      LEFT JOIN Clinicas c ON u.clinica_id = c.id
      WHERE u.email = ? AND u.status = 'ativo'
    `;
    
    try {
      const result = await query(selectQuery, [email]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      throw new Error('Erro ao buscar usuário');
    }
  }

  // Buscar usuário por ID
  static async findById(id: number): Promise<Usuario | null> {
    const selectQuery = `
      SELECT 
        u.*,
        c.nome as clinica_nome
      FROM Usuarios u
      LEFT JOIN Clinicas c ON u.clinica_id = c.id
      WHERE u.id = ? AND u.status = 'ativo'
    `;
    
    try {
      const result = await query(selectQuery, [id]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      throw new Error('Erro ao buscar usuário');
    }
  }

  // Verificar credenciais de login
  static async verifyCredentials(email: string, senha: string): Promise<Usuario | null> {
    try {
      const user = await this.findByEmail(email);
      
      if (!user || !user.password_hash) {
        return null;
      }

      const isValidPassword = await bcrypt.compare(senha, user.password_hash);
      
      if (!isValidPassword) {
        return null;
      }

      // Remover senha do objeto retornado
      const { password_hash: _, ...userWithoutPassword } = user;
      return userWithoutPassword as Usuario;
    } catch (error) {
      console.error('Erro ao verificar credenciais:', error);
      throw new Error('Erro ao verificar credenciais');
    }
  }

  // Criar usuário (para testes ou admin)
  static async create(userData: {
    nome: string;
    email: string;
    senha: string;
    role: 'admin' | 'clinica' | 'operadora';
    clinica_id?: number;
    crm?: string;
    especialidade?: string;
    telefone?: string;
  }): Promise<Usuario> {
    try {
      // Hash da senha
      const hashedPassword = await bcrypt.hash(userData.senha, 10);
      
      const insertQuery = `
        INSERT INTO Usuarios (nome, email, password_hash, role, clinica_id, status)
        VALUES (?, ?, ?, ?, ?, 'ativo')
      `;
      
      const values = [
        userData.nome,
        userData.email,
        hashedPassword,
        userData.role,
        userData.clinica_id || null
      ];
      
      const result = await query(insertQuery, values);
      const insertId = result.insertId;
      
      const newUser = await this.findById(insertId);
      if (!newUser) {
        throw new Error('Erro ao buscar usuário recém-criado');
      }
      
      return newUser;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw new Error('Erro ao criar usuário');
    }
  }

  // Atualizar último login
  static async updateLastLogin(userId: number): Promise<void> {
    try {
      const updateQuery = `
        UPDATE Usuarios 
        SET last_login = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      
      await query(updateQuery, [userId]);
    } catch (error) {
      console.error('Erro ao atualizar último login:', error);
      // Não throw error aqui pois é apenas informativo
    }
  }

  // Verificar se email já existe
  static async emailExists(email: string, excludeId?: number): Promise<boolean> {
    let checkQuery = `SELECT id FROM Usuarios WHERE email = ?`;
    let params: any[] = [email];
    
    if (excludeId) {
      checkQuery += ` AND id != ?`;
      params.push(excludeId);
    }
    
    try {
      const result = await query(checkQuery, params);
      return result.length > 0;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      throw new Error('Erro ao verificar email');
    }
  }

  // Buscar usuários de uma clínica
  static async findUsuariosByClinica(clinicaId: number): Promise<Usuario[]> {
    const selectQuery = `
      SELECT 
        u.id, u.nome, u.email, u.role, u.created_at
      FROM Usuarios u
      WHERE u.clinica_id = ? AND u.status = 'ativo'
      ORDER BY u.nome
    `;
    
    try {
      const result = await query(selectQuery, [clinicaId]);
      return result;
    } catch (error) {
      console.error('Erro ao buscar usuários da clínica:', error);
      throw new Error('Erro ao buscar usuários da clínica');
    }
  }
}
