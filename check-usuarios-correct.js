const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsuarios() {
  const config = {
    host: process.env.DB_HOST || '191.252.1.143',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'douglas',
    password: process.env.DB_PASSWORD || 'Douglas193',
    database: process.env.DB_NAME || 'bd_sistema_clinicas'
  };

  try {
    const connection = await mysql.createConnection(config);
    
    console.log('\n📋 Usuário existente:');
    const [sampleUsers] = await connection.execute('SELECT id, nome, email, role, status FROM Usuarios LIMIT 3');
    sampleUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.nome} (${user.email}) - Role: ${user.role} - Status: ${user.status}`);
    });
    
    await connection.end();
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

checkUsuarios();
