const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_clinicas',
  port: process.env.DB_PORT || 3306
};

async function testLoginDebug() {
  let connection;

  try {
    console.log('🔍 Testando login com credenciais específicas...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco de dados');

    // Testar com as credenciais fornecidas
    const email = 'carlos.lima@clinica-rj.com';
    const crm = '222222-RJ';

    console.log(`\n🧪 Testando login:`);
    console.log(`   Email: ${email}`);
    console.log(`   CRM: ${crm}`);

    // Executar a mesma query que o modelo usa
    const sql = `
      SELECT 
        m.*,
        c.nome as clinica_nome
      FROM Medicos_Mobile m
      LEFT JOIN Clinicas c ON m.clinica_id = c.id
      WHERE m.email = ? AND m.crm = ? AND m.status = 'ativo'
    `;
    
    console.log('\n📋 Query executada:');
    console.log(sql);
    console.log(`   Parâmetros: [${email}, ${crm}]`);

    const [rows] = await connection.execute(sql, [email, crm]);
    
    console.log(`\n📊 Resultado da query:`);
    console.log(`   Linhas encontradas: ${rows.length}`);
    
    if (rows.length > 0) {
      console.log('✅ Médico encontrado!');
      console.log('📋 Dados do médico:');
      const medico = rows[0];
      Object.keys(medico).forEach(key => {
        console.log(`   ${key}: ${medico[key]}`);
      });
    } else {
      console.log('❌ Médico NÃO encontrado!');
      
      // Verificar se o email existe
      const [emailCheck] = await connection.execute(
        'SELECT * FROM Medicos_Mobile WHERE email = ?',
        [email]
      );
      
      console.log(`\n🔍 Verificação de email:`);
      console.log(`   Email encontrado: ${emailCheck.length > 0 ? 'SIM' : 'NÃO'}`);
      if (emailCheck.length > 0) {
        console.log('   Dados do email:');
        Object.keys(emailCheck[0]).forEach(key => {
          console.log(`     ${key}: ${emailCheck[0][key]}`);
        });
      }
      
      // Verificar se o CRM existe
      const [crmCheck] = await connection.execute(
        'SELECT * FROM Medicos_Mobile WHERE crm = ?',
        [crm]
      );
      
      console.log(`\n🔍 Verificação de CRM:`);
      console.log(`   CRM encontrado: ${crmCheck.length > 0 ? 'SIM' : 'NÃO'}`);
      if (crmCheck.length > 0) {
        console.log('   Dados do CRM:');
        Object.keys(crmCheck[0]).forEach(key => {
          console.log(`     ${key}: ${crmCheck[0][key]}`);
        });
      }
      
      // Verificar status
      const [statusCheck] = await connection.execute(
        'SELECT * FROM Medicos_Mobile WHERE email = ? AND crm = ?',
        [email, crm]
      );
      
      if (statusCheck.length > 0) {
        console.log(`\n🔍 Verificação de status:`);
        console.log(`   Status: ${statusCheck[0].status}`);
        console.log(`   Status é 'ativo': ${statusCheck[0].status === 'ativo'}`);
      }
    }

    // Testar com outras credenciais também
    console.log('\n🧪 Testando outras credenciais disponíveis...');
    
    const [allMedicos] = await connection.execute(`
      SELECT email, crm, status FROM Medicos_Mobile ORDER BY nome
    `);
    
    for (const medico of allMedicos) {
      console.log(`\n   Testando: ${medico.email} / ${medico.crm}`);
      
      const [testResult] = await connection.execute(sql, [medico.email, medico.crm]);
      console.log(`   Resultado: ${testResult.length > 0 ? '✅ SUCESSO' : '❌ FALHA'} (Status: ${medico.status})`);
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    if (connection) await connection.end();
    console.log('\n🔌 Conexão fechada');
  }
}

testLoginDebug();
