const mysql = require('mysql2/promise');
require('dotenv').config();

async function testMySQLVersion() {
  const config = {
    host: process.env.DB_HOST || '191.252.1.143',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'douglas',
    password: process.env.DB_PASSWORD || 'Douglas193',
    database: process.env.DB_NAME || 'bd_sistema_clinicas'
  };

  try {
    const connection = await mysql.createConnection(config);
    
    console.log('🔍 Verificando versão do MySQL...');
    
    // Verificar versão
    const [version] = await connection.execute('SELECT VERSION() as version');
    console.log('📊 Versão do MySQL:', version[0].version);
    
    // Testar diferentes abordagens para LIMIT
    console.log('\n🔍 Testando diferentes abordagens...');
    
    // Abordagem 1: LIMIT sem OFFSET
    try {
      const [result1] = await connection.execute('SELECT * FROM Pacientes_Clinica WHERE clinica_id = ? LIMIT ?', [1, 5]);
      console.log('✅ LIMIT sem OFFSET funcionou:', result1.length, 'pacientes');
    } catch (error) {
      console.log('❌ LIMIT sem OFFSET falhou:', error.message);
    }
    
    // Abordagem 2: LIMIT com OFFSET como string
    try {
      const [result2] = await connection.execute('SELECT * FROM Pacientes_Clinica WHERE clinica_id = ? LIMIT ?, ?', [1, 0, 5]);
      console.log('✅ LIMIT com OFFSET como string funcionou:', result2.length, 'pacientes');
    } catch (error) {
      console.log('❌ LIMIT com OFFSET como string falhou:', error.message);
    }
    
    // Abordagem 3: Usando query simples
    try {
      const [result3] = await connection.query('SELECT * FROM Pacientes_Clinica WHERE clinica_id = ? LIMIT ? OFFSET ?', [1, 5, 0]);
      console.log('✅ Query simples funcionou:', result3[0].length, 'pacientes');
    } catch (error) {
      console.log('❌ Query simples falhou:', error.message);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
  }
}

testMySQLVersion();
