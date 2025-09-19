import { Request, Response } from 'express';
import { query } from '../config/database';

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// POST /api/mobile/sync/doctors - Sincronizar médicos automaticamente
export const syncDoctors = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔄 Iniciando sincronização automática de médicos...');

    // Buscar todos os usuários com role 'clinica' do sistema principal
    const usuarios = await query(`
      SELECT 
        u.id,
        u.clinica_id,
        u.nome,
        u.email,
        u.username,
        u.status,
        c.nome as clinica_nome
      FROM Usuarios u
      LEFT JOIN Clinicas c ON u.clinica_id = c.id
      WHERE u.role = 'clinica' AND u.status = 'ativo'
    `);

    console.log(`📊 Encontrados ${usuarios.length} usuários clínicos ativos`);

    if (usuarios.length === 0) {
      const response: ApiResponse = {
        success: true,
        message: 'Nenhum usuário clínico encontrado para sincronizar',
        data: { created: 0, updated: 0, skipped: 0, total: 0 }
      };
      res.json(response);
      return;
    }

    // Verificar se a tabela Medicos_Mobile existe
    const tables = await query(`
      SHOW TABLES LIKE 'Medicos_Mobile'
    `);

    if (tables.length === 0) {
      console.log('❌ Tabela Medicos_Mobile não existe. Criando...');
      
      await query(`
        CREATE TABLE IF NOT EXISTS Medicos_Mobile (
          id INT AUTO_INCREMENT PRIMARY KEY,
          clinica_id INT NOT NULL,
          nome VARCHAR(200) NOT NULL,
          email VARCHAR(150) NOT NULL UNIQUE,
          crm VARCHAR(50) NOT NULL UNIQUE,
          especialidade VARCHAR(100),
          telefone VARCHAR(20),
          status ENUM('ativo', 'inativo') DEFAULT 'ativo',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Tabela Medicos_Mobile criada!');
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const usuario of usuarios) {
      try {
        // Verificar se o médico já existe na tabela mobile
        const existing = await query(`
          SELECT id FROM Medicos_Mobile WHERE email = ?
        `, [usuario.email]);

        if (existing.length > 0) {
          // Atualizar médico existente
          await query(`
            UPDATE Medicos_Mobile SET
              nome = ?,
              clinica_id = ?,
              status = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE email = ?
          `, [
            usuario.nome,
            usuario.clinica_id,
            usuario.status,
            usuario.email
          ]);
          updated++;
          console.log(`🔄 Atualizado: ${usuario.nome} (${usuario.email})`);
        } else {
          // Criar novo médico mobile
          // Gerar CRM baseado no ID do usuário (formato: CRM + ID)
          const crm = `CRM${String(usuario.id).padStart(6, '0')}`;
          
          await query(`
            INSERT INTO Medicos_Mobile (
              nome, email, crm, clinica_id, 
              especialidade, telefone, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `, [
            usuario.nome,
            usuario.email,
            crm,
            usuario.clinica_id,
            'Oncologia', // Especialidade padrão
            null, // Telefone não disponível no sistema principal
            usuario.status
          ]);
          created++;
          console.log(`✅ Criado: ${usuario.nome} (${usuario.email}) - CRM: ${crm}`);
        }
      } catch (error) {
        console.error(`❌ Erro ao processar ${usuario.nome}:`, error);
        skipped++;
      }
    }

    console.log('\n📈 Resumo da sincronização:');
    console.log(`   ✅ Criados: ${created}`);
    console.log(`   🔄 Atualizados: ${updated}`);
    console.log(`   ⚠️  Ignorados: ${skipped}`);
    console.log(`   📊 Total processados: ${usuarios.length}`);

    const response: ApiResponse = {
      success: true,
      message: 'Sincronização concluída com sucesso',
      data: {
        created,
        updated,
        skipped,
        total: usuarios.length
      }
    };

    res.json(response);

  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    };
    res.status(500).json(response);
  }
};
