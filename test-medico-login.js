const mysql = require('mysql2/promise');
require('dotenv').config();

async function testMedicoLogin() {
  let connection;
  
  try {
    // Conectar ao banco
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sistema_clinicas',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Conectado ao banco de dados');

    // Verificar se a tabela Medicos_Mobile existe
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'Medicos_Mobile'"
    );
    
    if (tables.length === 0) {
      console.log('❌ Tabela Medicos_Mobile não encontrada');
      return;
    }
    
    console.log('✅ Tabela Medicos_Mobile encontrada');

    // Verificar estrutura da tabela
    const [columns] = await connection.execute(
      "DESCRIBE Medicos_Mobile"
    );
    
    console.log('📋 Estrutura da tabela Medicos_Mobile:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });

    // Buscar médico específico
    const [medicos] = await connection.execute(
      `SELECT 
        m.*,
        c.nome as clinica_nome
      FROM Medicos_Mobile m
      LEFT JOIN Clinicas c ON m.clinica_id = c.id
      WHERE m.email = ? AND m.crm = ? AND m.status = 'ativo'`,
      ['carlos.lima@clinica-rj.com', '222222-RJ']
    );

    console.log('\n🔍 Busca por Carlos Lima:');
    if (medicos.length > 0) {
      console.log('✅ Médico encontrado:', medicos[0]);
    } else {
      console.log('❌ Médico não encontrado');
      
      // Listar todos os médicos para debug
      const [allMedicos] = await connection.execute(
        'SELECT id, nome, email, crm, status FROM Medicos_Mobile LIMIT 10'
      );
      
      console.log('\n📋 Médicos disponíveis na tabela:');
      allMedicos.forEach(med => {
        console.log(`  - ID: ${med.id}, Nome: ${med.nome}, Email: ${med.email}, CRM: ${med.crm}, Status: ${med.status}`);
      });
    }

    // Verificar se a tabela Clinicas existe
    const [clinicas] = await connection.execute(
      "SELECT id, nome FROM Clinicas LIMIT 5"
    );
    
    console.log('\n🏥 Clínicas disponíveis:');
    clinicas.forEach(clinica => {
      console.log(`  - ID: ${clinica.id}, Nome: ${clinica.nome}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexão fechada');
    }
  }
}

testMedicoLogin();