const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  let connection;
  
  try {
    console.log('🔍 Testando conexão com banco...');
    
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sistema_clinicas',
      port: process.env.DB_PORT || 3306
    };
    
    console.log('📊 Configuração:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port
    });
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco!');
    
    // Testar query simples
    const [rows] = await connection.execute('SELECT COUNT(*) as total FROM Medicos_Mobile');
    console.log(`📊 Total de médicos: ${rows[0].total}`);
    
    // Testar query específica
    const [medico] = await connection.execute(
      'SELECT * FROM Medicos_Mobile WHERE email = ? AND crm = ?',
      ['carlos.lima@clinica-rj.com', '222222-RJ']
    );
    
    console.log(`🔍 Médico encontrado: ${medico.length > 0 ? 'SIM' : 'NÃO'}`);
    if (medico.length > 0) {
      console.log('📋 Dados:', medico[0]);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão fechada');
    }
  }
}

testConnection();
