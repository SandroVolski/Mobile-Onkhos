// Teste básico do servidor
require('dotenv').config({ path: './test.env' });
const mysql = require('mysql2/promise');

async function testServer() {
  console.log('🧪 Testando configurações do servidor...');
  
  // Testar variáveis de ambiente
  console.log('✅ PORT:', process.env.PORT);
  console.log('✅ DB_HOST:', process.env.DB_HOST);
  console.log('✅ JWT_SECRET:', process.env.JWT_SECRET ? 'Configurado' : 'Não configurado');
  
  // Testar conexão com banco
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('✅ Conexão com banco: OK');
    
    // Testar queries básicas
    const [usuarios] = await connection.execute('SELECT COUNT(*) as total FROM Usuarios WHERE status = "ativo"');
    console.log('✅ Usuários ativos:', usuarios[0].total);
    
    const [pacientes] = await connection.execute('SELECT COUNT(*) as total FROM Pacientes_Clinica');
    console.log('✅ Total de pacientes:', pacientes[0].total);
    
    await connection.end();
    
    console.log('\n🎉 Todas as configurações estão OK!');
    console.log('💡 Para iniciar o servidor, execute: npm run dev');
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
  }
}

testServer();
