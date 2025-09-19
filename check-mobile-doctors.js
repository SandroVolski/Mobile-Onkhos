const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_clinicas',
  port: process.env.DB_PORT || 3306
};

async function checkMobileDoctors() {
  let connection;

  try {
    console.log('🔍 Verificando médicos mobile no banco...');
    console.log('📊 Configuração do banco:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port
    });

    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco de dados');

    // Verificar se a tabela existe
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'Medicos_Mobile'
    `);

    if (tables.length === 0) {
      console.log('❌ Tabela Medicos_Mobile não existe!');
      console.log('💡 Execute primeiro: node setup-mobile-medicos.js');
      return;
    }

    // Buscar todos os médicos mobile
    const [medicos] = await connection.execute(`
      SELECT 
        id, nome, email, crm, clinica_id, clinica_nome, 
        especialidade, status, created_at
      FROM Medicos_Mobile 
      ORDER BY nome
    `);

    console.log(`\n👨‍⚕️ Médicos Mobile Encontrados: ${medicos.length}`);
    console.log('═'.repeat(80));

    if (medicos.length === 0) {
      console.log('⚠️  Nenhum médico mobile cadastrado!');
      console.log('💡 Execute: node sync-doctors-from-main-system.js');
    } else {
      medicos.forEach((medico, index) => {
        console.log(`\n${index + 1}. ${medico.nome}`);
        console.log(`   📧 Email: ${medico.email}`);
        console.log(`   🆔 CRM: ${medico.crm}`);
        console.log(`   🏥 Clínica: ${medico.clinica_nome || 'Sem clínica'} (ID: ${medico.clinica_id})`);
        console.log(`   🎯 Especialidade: ${medico.especialidade || 'Não informada'}`);
        console.log(`   ✅ Status: ${medico.status}`);
        console.log(`   📅 Criado: ${medico.created_at}`);
        console.log('   ' + '─'.repeat(50));
      });
    }

    // Verificar usuários do sistema principal
    console.log('\n🔍 Verificando usuários do sistema principal...');
    const [usuarios] = await connection.execute(`
      SELECT 
        u.id, u.nome, u.email, u.role, u.status, u.clinica_id,
        c.nome as clinica_nome
      FROM Usuarios u
      LEFT JOIN Clinicas c ON u.clinica_id = c.id
      WHERE u.role = 'clinica' AND u.status = 'ativo'
      ORDER BY u.nome
    `);

    console.log(`\n👥 Usuários Clínicos (Sistema Principal): ${usuarios.length}`);
    console.log('═'.repeat(80));

    if (usuarios.length === 0) {
      console.log('⚠️  Nenhum usuário clínico encontrado no sistema principal!');
    } else {
      usuarios.forEach((usuario, index) => {
        console.log(`\n${index + 1}. ${usuario.nome}`);
        console.log(`   📧 Email: ${usuario.email}`);
        console.log(`   🏥 Clínica: ${usuario.clinica_nome || 'Sem clínica'} (ID: ${usuario.clinica_id})`);
        console.log(`   ✅ Status: ${usuario.status}`);
        console.log('   ' + '─'.repeat(50));
      });
    }

    // Instruções de uso
    console.log('\n📋 INSTRUÇÕES DE USO:');
    console.log('═'.repeat(80));
    console.log('1. Para testar o login, use qualquer email/CRM listado acima');
    console.log('2. Formato: Email = email do médico, Senha = CRM do médico');
    console.log('3. Exemplo:');
    if (medicos.length > 0) {
      const primeiro = medicos[0];
      console.log(`   Email: ${primeiro.email}`);
      console.log(`   Senha: ${primeiro.crm}`);
    }
    console.log('\n4. Se não houver médicos mobile, execute:');
    console.log('   node sync-doctors-from-main-system.js');

  } catch (error) {
    console.error('❌ Erro ao verificar médicos:', error);
  } finally {
    if (connection) await connection.end();
    console.log('\n🔌 Conexão fechada');
  }
}

checkMobileDoctors();
