const mysql = require('mysql2/promise');
require('dotenv').config();

async function testSimpleLogin() {
  let connection;
  
  try {
    console.log('🧪 Testando login simples...');
    
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sistema_clinicas',
      port: process.env.DB_PORT || 3306
    };
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco!');
    
    const email = 'carlos.lima@clinica-rj.com';
    const crm = '222222-RJ';
    
    console.log(`🔍 Testando: ${email} / ${crm}`);
    
    // Query exata que o modelo usa
    const sql = `
      SELECT 
        id, clinica_id, nome, email, crm, especialidade, telefone, status, created_at, updated_at
      FROM Medicos_Mobile
      WHERE email = ? AND crm = ? AND status = 'ativo'
    `;
    
    console.log('📋 Query:', sql);
    console.log('📋 Parâmetros:', [email, crm]);
    
    const [rows] = await connection.execute(sql, [email, crm]);
    
    console.log(`📊 Resultado: ${rows.length} linhas encontradas`);
    
    if (rows.length > 0) {
      console.log('✅ Médico encontrado!');
      console.log('📋 Dados:', rows[0]);
    } else {
      console.log('❌ Médico não encontrado');
      
      // Verificar se existe sem filtro de status
      const [allRows] = await connection.execute(
        'SELECT * FROM Medicos_Mobile WHERE email = ? AND crm = ?',
        [email, crm]
      );
      
      console.log(`🔍 Sem filtro de status: ${allRows.length} linhas`);
      if (allRows.length > 0) {
        console.log('📋 Dados encontrados:', allRows[0]);
        console.log(`📋 Status: "${allRows[0].status}"`);
        console.log(`📋 Status === 'ativo': ${allRows[0].status === 'ativo'}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    if (connection) await connection.end();
    console.log('🔌 Conexão fechada');
  }
}

testSimpleLogin();
