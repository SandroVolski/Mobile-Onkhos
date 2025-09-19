const mysql = require('mysql2/promise');

const connectionConfig = {
  host: '191.252.1.143',
  user: 'douglas',
  password: 'Douglas193',
  database: 'bd_sistema_clinicas',
  port: 3306
};

async function checkSolicitacoesTable() {
  let connection;
  
  try {
    console.log('🔌 Conectando ao banco de dados...');
    connection = await mysql.createConnection(connectionConfig);
    console.log('✅ Conectado com sucesso!');
    
    // Verificar se a tabela existe
    console.log('📋 Verificando estrutura da tabela Solicitacoes_Autorizacao...');
    const [columns] = await connection.execute('DESCRIBE Solicitacoes_Autorizacao');
    console.log('📊 Colunas da tabela:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });
    
    // Verificar quantos registros existem
    const [count] = await connection.execute('SELECT COUNT(*) as total FROM Solicitacoes_Autorizacao');
    console.log(`\n📊 Total de registros: ${count[0].total}`);
    
    // Mostrar alguns registros de exemplo
    if (count[0].total > 0) {
      const [rows] = await connection.execute('SELECT * FROM Solicitacoes_Autorizacao LIMIT 3');
      console.log('\n📋 Primeiros 3 registros:');
      rows.forEach(row => {
        console.log(`  - ID: ${row.id}, Paciente: ${row.paciente_id}, Protocolo: ${row.protocolo || 'N/A'}, Status: ${row.status || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão encerrada');
    }
  }
}

// Executar o script
checkSolicitacoesTable();
