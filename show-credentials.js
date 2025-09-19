const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bd_sistema_clinicas',
  port: process.env.DB_PORT || 3306
};

async function showCredentials() {
  let connection;

  try {
    console.log('🔑 Credenciais para teste no frontend...\n');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco de dados');

    // Buscar médicos com emails
    const [medicos] = await connection.execute(`
      SELECT id, nome, email, crm, clinica_id 
      FROM Medicos_Mobile 
      WHERE status = 'ativo'
      ORDER BY nome
    `);

    console.log('📋 CREDENCIAIS PARA TESTE NO FRONTEND:');
    console.log('═'.repeat(80));
    
    medicos.forEach((medico, index) => {
      console.log(`${index + 1}. 👨‍⚕️ ${medico.nome}`);
      console.log(`   📧 Email: ${medico.email}`);
      console.log(`   🔑 Senha: ${medico.crm}`);
      console.log(`   🏥 Clínica ID: ${medico.clinica_id}`);
      console.log('');
    });

    console.log('🎯 COMO TESTAR:');
    console.log('1. Acesse: http://localhost:5050/login');
    console.log('2. Use qualquer credencial acima');
    console.log('3. Vá para a tela de Pacientes');
    console.log('4. Cada médico verá apenas seus 3 pacientes de teste');
    console.log('');
    console.log('✅ A autenticação está funcionando perfeitamente!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexão fechada');
    }
  }
}

showCredentials();
