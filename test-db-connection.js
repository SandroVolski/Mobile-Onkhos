const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDbConnection() {
  let connection;
  
  try {
    console.log('🔍 Configuração do .env:');
    console.log('  DB_HOST:', process.env.DB_HOST);
    console.log('  DB_USER:', process.env.DB_USER);
    console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'EMPTY');
    console.log('  DB_NAME:', process.env.DB_NAME);
    console.log('  DB_PORT:', process.env.DB_PORT);

    // Conectar ao banco usando a mesma configuração do servidor
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sistema_clinicas',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Conectado ao banco de dados:', process.env.DB_NAME || 'sistema_clinicas');

    // Listar todas as tabelas
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📋 Tabelas disponíveis:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });

    // Verificar se Medicos_Mobile existe
    const [medicoTables] = await connection.execute(
      "SHOW TABLES LIKE 'Medicos_Mobile'"
    );
    
    if (medicoTables.length === 0) {
      console.log('\n❌ Tabela Medicos_Mobile não encontrada neste banco');
      
      // Tentar buscar em outros bancos
      console.log('\n🔍 Buscando tabela em outros bancos...');
      const [databases] = await connection.execute('SHOW DATABASES');
      
      for (const db of databases) {
        const dbName = Object.values(db)[0];
        if (dbName !== 'information_schema' && dbName !== 'performance_schema' && dbName !== 'mysql' && dbName !== 'sys') {
          try {
            const [tablesInDb] = await connection.execute(`SHOW TABLES FROM \`${dbName}\` LIKE 'Medicos_Mobile'`);
            if (tablesInDb.length > 0) {
              console.log(`✅ Tabela Medicos_Mobile encontrada no banco: ${dbName}`);
            }
          } catch (error) {
            // Ignorar erros de permissão
          }
        }
      }
    } else {
      console.log('\n✅ Tabela Medicos_Mobile encontrada');
      
      // Testar a query
      const [medicos] = await connection.execute(
        `SELECT 
          m.*,
          c.nome as clinica_nome
        FROM Medicos_Mobile m
        LEFT JOIN Clinicas c ON m.clinica_id = c.id
        WHERE m.email = ? AND m.crm = ? AND m.status = 'ativo'`,
        ['carlos.lima@clinica-rj.com', '222222-RJ']
      );
      
      console.log('\n🔍 Resultado da query:');
      if (medicos.length > 0) {
        console.log('✅ Médico encontrado:', medicos[0]);
      } else {
        console.log('❌ Médico não encontrado');
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexão fechada');
    }
  }
}

testDbConnection();
