const mysql = require('mysql2/promise');
require('dotenv').config();

async function testSimpleQuery() {
  const config = {
    host: process.env.DB_HOST || '191.252.1.143',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'douglas',
    password: process.env.DB_PASSWORD || 'Douglas193',
    database: process.env.DB_NAME || 'bd_sistema_clinicas'
  };

  try {
    const connection = await mysql.createConnection(config);
    
    console.log('🔍 Testando query simples...');
    
    // Teste 1: Query básica
    const [result1] = await connection.execute('SELECT COUNT(*) as total FROM Pacientes_Clinica WHERE clinica_id = ?', [1]);
    console.log('✅ Query básica funcionou:', result1[0].total, 'pacientes');
    
    // Teste 2: Query com LIMIT
    const [result2] = await connection.execute('SELECT * FROM Pacientes_Clinica WHERE clinica_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?', [1, 5, 0]);
    console.log('✅ Query com LIMIT funcionou:', result2.length, 'pacientes');
    
    // Teste 3: Query exata do modelo
    const sql = `
      SELECT 
        p.*
      FROM Pacientes_Clinica p
      WHERE p.clinica_id = ?
      ORDER BY p.created_at DESC
    `;
    const [result3] = await connection.execute(`${sql} LIMIT ? OFFSET ?`, [1, 5, 0]);
    console.log('✅ Query do modelo funcionou:', result3.length, 'pacientes');
    
    if (result3.length > 0) {
      console.log('📋 Primeiro paciente:', {
        id: result3[0].id,
        nome: result3[0].Paciente_Nome,
        status: result3[0].status
      });
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('SQL State:', error.sqlState);
    console.error('Code:', error.code);
  }
}

testSimpleQuery();
