const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bd_sistema_clinicas',
  port: process.env.DB_PORT || 3306
};

async function checkPacientesMedicoRelation() {
  let connection;

  try {
    console.log('🔍 Verificando relacionamento entre pacientes e médicos...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco de dados');

    // 1. Verificar médicos mobile
    const [medicos] = await connection.execute(`
      SELECT id, nome, crm, clinica_id 
      FROM Medicos_Mobile 
      WHERE status = 'ativo'
      LIMIT 3
    `);

    console.log('\n👨‍⚕️ Médicos Mobile encontrados:');
    medicos.forEach((medico, index) => {
      console.log(`   ${index + 1}. ${medico.nome} - CRM: ${medico.crm} - Clínica: ${medico.clinica_id}`);
    });

    if (medicos.length === 0) {
      console.log('❌ Nenhum médico mobile encontrado!');
      return;
    }

    const medico = medicos[0];
    console.log(`\n🔍 Testando com médico: ${medico.nome} (CRM: ${medico.crm})`);

    // 2. Verificar prestadores com esse CRM
    const [prestadores] = await connection.execute(`
      SELECT id, nome, crm, especialidade 
      FROM Prestadores 
      WHERE crm = ?
    `, [medico.crm]);

    console.log('\n🏥 Prestadores com esse CRM:');
    if (prestadores.length > 0) {
      prestadores.forEach((prestador, index) => {
        console.log(`   ${index + 1}. ${prestador.nome} - CRM: ${prestador.crm} - Especialidade: ${prestador.especialidade}`);
      });
    } else {
      console.log('   ❌ Nenhum prestador encontrado com esse CRM!');
      return;
    }

    const prestador = prestadores[0];

    // 3. Verificar pacientes desse prestador
    const [pacientes] = await connection.execute(`
      SELECT id, Paciente_Nome, Prestador, status 
      FROM Pacientes_Clinica 
      WHERE Prestador = ? AND clinica_id = ?
      LIMIT 5
    `, [prestador.id, medico.clinica_id]);

    console.log(`\n👥 Pacientes do prestador ${prestador.nome}:`);
    if (pacientes.length > 0) {
      pacientes.forEach((paciente, index) => {
        console.log(`   ${index + 1}. ${paciente.Paciente_Nome} - Status: ${paciente.status}`);
      });
    } else {
      console.log('   ⚠️  Nenhum paciente encontrado para este prestador');
    }

    // 4. Testar a query completa
    console.log('\n🧪 Testando query completa...');
    const [queryResult] = await connection.execute(`
      SELECT 
        p.id, p.Paciente_Nome, p.status,
        pr.nome as prestador_nome,
        pr.crm as prestador_crm
      FROM Pacientes_Clinica p
      LEFT JOIN Prestadores pr ON p.Prestador = pr.id
      WHERE p.clinica_id = ? 
        AND p.Prestador IN (
          SELECT pr.id FROM Prestadores pr 
          INNER JOIN Medicos_Mobile m ON pr.crm = m.crm
          WHERE m.id = ? AND m.clinica_id = ?
        )
      LIMIT 5
    `, [medico.clinica_id, medico.id, medico.clinica_id]);

    console.log(`\n📊 Resultado da query completa: ${queryResult.length} pacientes`);
    queryResult.forEach((paciente, index) => {
      console.log(`   ${index + 1}. ${paciente.Paciente_Nome} - Dr. ${paciente.prestador_nome}`);
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

checkPacientesMedicoRelation();
