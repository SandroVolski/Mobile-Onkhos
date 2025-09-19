const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_clinicas',
  port: process.env.DB_PORT || 3306
};

async function checkPacientesMedicoRelation() {
  let connection;

  try {
    console.log('🔍 Analisando relacionamento entre pacientes e médicos...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco de dados');

    // Verificar estrutura da tabela Pacientes_Clinica
    const [pacientesColumns] = await connection.execute(`
      DESCRIBE Pacientes_Clinica
    `);

    console.log('\n📋 Estrutura da tabela Pacientes_Clinica:');
    pacientesColumns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });

    // Verificar se há coluna de prestador/médico
    const prestadorColumn = pacientesColumns.find(col => 
      col.Field.toLowerCase().includes('prestador') || 
      col.Field.toLowerCase().includes('medico') ||
      col.Field.toLowerCase().includes('doctor')
    );

    if (prestadorColumn) {
      console.log(`\n👨‍⚕️ Coluna de prestador encontrada: ${prestadorColumn.Field}`);
    } else {
      console.log('\n⚠️  Nenhuma coluna de prestador/médico encontrada na tabela Pacientes_Clinica');
    }

    // Verificar tabela de Prestadores
    const [prestadoresExists] = await connection.execute(`
      SHOW TABLES LIKE 'Prestadores'
    `);

    if (prestadoresExists.length > 0) {
      console.log('\n📋 Tabela Prestadores encontrada!');
      
      const [prestadoresColumns] = await connection.execute(`
        DESCRIBE Prestadores
      `);

      console.log('📋 Estrutura da tabela Prestadores:');
      prestadoresColumns.forEach(col => {
        console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
      });

      // Verificar dados de prestadores
      const [prestadores] = await connection.execute(`
        SELECT id, nome, crm, especialidade, status
        FROM Prestadores 
        WHERE status = 'ativo'
        LIMIT 5
      `);

      console.log(`\n👨‍⚕️ Prestadores encontrados: ${prestadores.length}`);
      prestadores.forEach((prestador, index) => {
        console.log(`   ${index + 1}. ${prestador.nome} - CRM: ${prestador.crm} - Especialidade: ${prestador.especialidade}`);
      });
    } else {
      console.log('\n❌ Tabela Prestadores não encontrada');
    }

    // Verificar solicitações para entender o relacionamento
    const [solicitacoes] = await connection.execute(`
      SELECT 
        s.id, s.paciente_id, s.medico_assinatura_crm, s.clinica_id,
        p.Paciente_Nome
      FROM Solicitacoes_Autorizacao s
      LEFT JOIN Pacientes_Clinica p ON s.paciente_id = p.id
      WHERE s.medico_assinatura_crm IS NOT NULL
      LIMIT 5
    `);

    console.log(`\n📋 Solicitações com médico: ${solicitacoes.length}`);
    solicitacoes.forEach((solicitacao, index) => {
      console.log(`   ${index + 1}. Paciente: ${solicitacao.Paciente_Nome} - CRM: ${solicitacao.medico_assinatura_crm}`);
    });

    // Verificar se há relação direta entre pacientes e médicos
    const [pacientesComMedico] = await connection.execute(`
      SELECT 
        p.id, p.Paciente_Nome
      FROM Pacientes_Clinica p
      LIMIT 5
    `);

    if (pacientesComMedico.length > 0) {
      console.log(`\n👥 Pacientes encontrados: ${pacientesComMedico.length}`);
      pacientesComMedico.forEach((paciente, index) => {
        console.log(`   ${index + 1}. ${paciente.Paciente_Nome}`);
      });
    } else {
      console.log('\n⚠️  Nenhum paciente encontrado');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    if (connection) await connection.end();
    console.log('\n🔌 Conexão fechada');
  }
}

checkPacientesMedicoRelation();
