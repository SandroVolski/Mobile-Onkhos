const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_clinicas',
  port: process.env.DB_PORT || 3306
};

async function checkSolicitacoesMedico() {
  let connection;

  try {
    console.log('🔍 Verificando solicitações e médicos...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco de dados');

    // Verificar médicos mobile
    const [medicos] = await connection.execute(`
      SELECT id, nome, email, crm, clinica_id, status 
      FROM Medicos_Mobile 
      WHERE status = 'ativo'
      ORDER BY nome
    `);

    console.log(`\n👨‍⚕️ Médicos Mobile encontrados: ${medicos.length}`);
    medicos.forEach((medico, index) => {
      console.log(`${index + 1}. ${medico.nome} (${medico.email}) - CRM: ${medico.crm} - Clínica: ${medico.clinica_id}`);
    });

    // Verificar solicitações
    const [solicitacoes] = await connection.execute(`
      SELECT 
        s.id, s.clinica_id, s.paciente_id, s.medico_assinatura_crm, s.status, s.created_at,
        p.Paciente_Nome as paciente_nome
      FROM Solicitacoes_Autorizacao s
      LEFT JOIN Pacientes_Clinica p ON s.paciente_id = p.id
      ORDER BY s.created_at DESC
      LIMIT 10
    `);

    console.log(`\n📋 Solicitações encontradas: ${solicitacoes.length}`);
    solicitacoes.forEach((solicitacao, index) => {
      console.log(`${index + 1}. ID: ${solicitacao.id} - CRM: ${solicitacao.medico_assinatura_crm} - Clínica: ${solicitacao.clinica_id} - Status: ${solicitacao.status} - Paciente: ${solicitacao.paciente_nome || 'N/A'}`);
    });

    // Verificar se há correspondência entre médicos e solicitações
    console.log('\n🔍 Verificando correspondências...');
    for (const medico of medicos) {
      const [solicitacoesMedico] = await connection.execute(`
        SELECT COUNT(*) as total
        FROM Solicitacoes_Autorizacao s
        WHERE s.clinica_id = ? AND s.medico_assinatura_crm = ?
      `, [medico.clinica_id, medico.crm]);

      const total = solicitacoesMedico[0].total;
      console.log(`   ${medico.nome} (CRM: ${medico.crm}): ${total} solicitações`);
    }

    // Verificar se há solicitações sem médico correspondente
    const [solicitacoesSemMedico] = await connection.execute(`
      SELECT COUNT(*) as total
      FROM Solicitacoes_Autorizacao s
      WHERE s.medico_assinatura_crm NOT IN (
        SELECT crm FROM Medicos_Mobile WHERE status = 'ativo'
      )
    `);

    console.log(`\n⚠️  Solicitações sem médico correspondente: ${solicitacoesSemMedico[0].total}`);

    if (solicitacoesSemMedico[0].total > 0) {
      console.log('\n📋 Solicitações sem médico correspondente:');
      const [detalhes] = await connection.execute(`
        SELECT id, medico_assinatura_crm, clinica_id, status
        FROM Solicitacoes_Autorizacao s
        WHERE s.medico_assinatura_crm NOT IN (
          SELECT crm FROM Medicos_Mobile WHERE status = 'ativo'
        )
        LIMIT 5
      `);
      
      detalhes.forEach((solicitacao, index) => {
        console.log(`   ${index + 1}. ID: ${solicitacao.id} - CRM: ${solicitacao.medico_assinatura_crm} - Clínica: ${solicitacao.clinica_id} - Status: ${solicitacao.status}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    if (connection) await connection.end();
    console.log('\n🔌 Conexão fechada');
  }
}

checkSolicitacoesMedico();
