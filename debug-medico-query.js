const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugMedicoQuery() {
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

    // Verificar estrutura completa da tabela
    const [columns] = await connection.execute(
      "SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Medicos_Mobile' ORDER BY ORDINAL_POSITION"
    );
    
    console.log('📋 Estrutura completa da tabela Medicos_Mobile:');
    columns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.COLUMN_DEFAULT ? `DEFAULT: ${col.COLUMN_DEFAULT}` : ''}`);
    });

    // Testar a query exata do modelo
    console.log('\n🔍 Testando query exata do MedicoMobileModel...');
    
    const email = 'carlos.lima@clinica-rj.com';
    const crm = '222222-RJ';
    
    const sql = `
      SELECT 
        m.*,
        c.nome as clinica_nome
      FROM Medicos_Mobile m
      LEFT JOIN Clinicas c ON m.clinica_id = c.id
      WHERE m.email = ? AND m.crm = ? AND m.status = 'ativo'
    `;
    
    console.log('📝 SQL:', sql);
    console.log('📝 Parâmetros:', [email, crm]);
    
    const [rows] = await connection.execute(sql, [email, crm]);
    
    console.log('📊 Resultado:', rows);
    console.log('📊 Número de linhas encontradas:', rows.length);
    
    if (rows.length > 0) {
      console.log('✅ Médico encontrado!');
      console.log('👤 Dados:', JSON.stringify(rows[0], null, 2));
    } else {
      console.log('❌ Médico não encontrado');
      
      // Testar query sem o filtro de status
      console.log('\n🔍 Testando sem filtro de status...');
      const sqlNoStatus = `
        SELECT 
          m.*,
          c.nome as clinica_nome
        FROM Medicos_Mobile m
        LEFT JOIN Clinicas c ON m.clinica_id = c.id
        WHERE m.email = ? AND m.crm = ?
      `;
      
      const [rowsNoStatus] = await connection.execute(sqlNoStatus, [email, crm]);
      console.log('📊 Resultado sem filtro de status:', rowsNoStatus);
      
      // Testar apenas por email
      console.log('\n🔍 Testando apenas por email...');
      const [rowsEmail] = await connection.execute(
        'SELECT * FROM Medicos_Mobile WHERE email = ?',
        [email]
      );
      console.log('📊 Resultado por email:', rowsEmail);
      
      // Testar apenas por CRM
      console.log('\n🔍 Testando apenas por CRM...');
      const [rowsCRM] = await connection.execute(
        'SELECT * FROM Medicos_Mobile WHERE crm = ?',
        [crm]
      );
      console.log('📊 Resultado por CRM:', rowsCRM);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('📋 Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexão fechada');
    }
  }
}

debugMedicoQuery();
