const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_clinicas',
  port: process.env.DB_PORT || 3306
};

async function checkPacientesTable() {
  let connection;

  try {
    console.log('🔍 Verificando estrutura da tabela Pacientes_Clinica...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco de dados');

    // Verificar estrutura da tabela
    const [columns] = await connection.execute(`
      DESCRIBE Pacientes_Clinica
    `);

    console.log('\n📋 Estrutura da tabela Pacientes_Clinica:');
    columns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });

    // Verificar se há pacientes existentes
    const [pacientes] = await connection.execute(`
      SELECT COUNT(*) as total FROM Pacientes_Clinica
    `);

    console.log(`\n👥 Total de pacientes: ${pacientes[0].total}`);

    if (pacientes[0].total > 0) {
      const [amostra] = await connection.execute(`
        SELECT id, Paciente_Nome, cpf, telefone, email, status
        FROM Pacientes_Clinica 
        LIMIT 3
      `);

      console.log('\n📄 Amostra de pacientes:');
      amostra.forEach((paciente, index) => {
        console.log(`   ${index + 1}. ${paciente.Paciente_Nome} - Status: ${paciente.status || 'NULL'}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    if (connection) await connection.end();
    console.log('\n🔌 Conexão fechada');
  }
}

checkPacientesTable();
