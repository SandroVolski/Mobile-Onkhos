const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkTables() {
  const config = {
    host: process.env.DB_HOST || '191.252.1.143',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'douglas',
    password: process.env.DB_PASSWORD || 'Douglas193',
    database: process.env.DB_NAME || 'bd_sistema_clinicas'
  };

  try {
    const connection = await mysql.createConnection(config);
    
    console.log('📋 Listando todas as tabelas...');
    const [tables] = await connection.execute('SHOW TABLES');
    
    tables.forEach((table, index) => {
      const tableName = Object.values(table)[0];
      console.log(`${index + 1}. ${tableName}`);
    });
    
    console.log('\n🔍 Verificando estrutura da tabela Pacientes_Clinica...');
    const [columns] = await connection.execute('DESCRIBE Pacientes_Clinica');
    
    console.log('Colunas da tabela Pacientes_Clinica:');
    columns.forEach((col) => {
      console.log(`- ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key ? col.Key : ''}`);
    });
    
    await connection.end();
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

checkTables();
