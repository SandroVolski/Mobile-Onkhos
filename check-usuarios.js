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
    
    console.log('🔍 Verificando estrutura da tabela Usuarios...');
    const [columns] = await connection.execute('DESCRIBE Usuarios');
    
    console.log('Colunas da tabela Usuarios:');
    columns.forEach((col) => {
      console.log(`- ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key ? col.Key : ''}`);
    });
    
    console.log('\n🔍 Verificando dados na tabela Usuarios...');
    const [users] = await connection.execute('SELECT COUNT(*) as total FROM Usuarios');
    console.log(`👥 Total de usuários: ${users[0].total}`);
    
    if (users[0].total > 0) {
      console.log('\n📋 Primeiros 3 usuários:');
      const [sampleUsers] = await connection.execute('SELECT id, nome, email, tipo, ativo FROM Usuarios LIMIT 3');
      sampleUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.nome} (${user.email}) - Tipo: ${user.tipo} - Ativo: ${user.ativo}`);
      });
    }
    
    await connection.end();
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

checkUsuarios();
