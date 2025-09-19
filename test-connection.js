const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  const config = {
    host: process.env.DB_HOST || '191.252.1.143',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'douglas',
    password: process.env.DB_PASSWORD || 'Douglas193',
    database: process.env.DB_NAME || 'bd_sistema_clinicas'
  };

  console.log('🔍 Testando conexão com o banco de dados...');
  console.log('📊 Configuração:', {
    host: config.host,
    port: config.port,
    user: config.user,
    database: config.database
  });

  try {
    const connection = await mysql.createConnection(config);
    
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Testar algumas queries
    console.log('\n🔍 Testando queries...');
    
    // Verificar tabelas
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 Tabelas encontradas: ${tables.length}`);
    
    // Verificar pacientes
    const [patients] = await connection.execute('SELECT COUNT(*) as total FROM Pacientes_Clinica');
    console.log(`👥 Total de pacientes: ${patients[0].total}`);
    
    // Verificar usuários
    const [users] = await connection.execute('SELECT COUNT(*) as total FROM usuarios WHERE ativo = 1');
    console.log(`🔐 Usuários ativos: ${users[0].total}`);
    
    // Verificar clínicas
    const [clinics] = await connection.execute('SELECT COUNT(*) as total FROM clinicas');
    console.log(`🏥 Clínicas: ${clinics[0].total}`);
    
    await connection.end();
    console.log('\n✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    process.exit(1);
  }
}

testConnection();
