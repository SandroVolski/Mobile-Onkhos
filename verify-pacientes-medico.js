const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bd_sistema_clinicas',
  port: process.env.DB_PORT || 3306
};

async function verifyPacientesMedico() {
  let connection;

  try {
    console.log('🔍 Verificando dados de pacientes e médicos...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco de dados');

    // 1. Listar todos os médicos mobile
    const [medicos] = await connection.execute(`
      SELECT id, nome, email, crm, clinica_id 
      FROM Medicos_Mobile 
      WHERE status = 'ativo'
      ORDER BY nome
    `);

    console.log('\n👨‍⚕️ MÉDICOS MOBILE DISPONÍVEIS:');
    console.log('═'.repeat(80));
    
    for (const medico of medicos) {
      console.log(`\n📋 ${medico.nome}`);
      console.log(`   🆔 ID: ${medico.id}`);
      console.log(`   🏥 Clínica ID: ${medico.clinica_id}`);
      console.log(`   🆔 CRM: ${medico.crm}`);
      
      // 2. Buscar prestador correspondente
      const [prestadores] = await connection.execute(`
        SELECT id, nome, crm, especialidade 
        FROM Prestadores 
        WHERE crm = ?
      `, [medico.crm]);

      if (prestadores.length > 0) {
        const prestador = prestadores[0];
        console.log(`   🏥 Prestador: ${prestador.nome} (ID: ${prestador.id})`);
        console.log(`   🎯 Especialidade: ${prestador.especialidade}`);
        
        // 3. Buscar pacientes deste prestador
        const [pacientes] = await connection.execute(`
          SELECT 
            p.id, p.Paciente_Nome, p.status, p.telefone, p.email,
            pr.nome as prestador_nome
          FROM Pacientes_Clinica p
          LEFT JOIN Prestadores pr ON p.Prestador = pr.id
          WHERE p.clinica_id = ? AND p.Prestador = ?
          ORDER BY p.Paciente_Nome
        `, [medico.clinica_id, prestador.id]);

        console.log(`   👥 Pacientes: ${pacientes.length}`);
        
        if (pacientes.length > 0) {
          pacientes.forEach((paciente, index) => {
            console.log(`      ${index + 1}. ${paciente.Paciente_Nome}`);
            console.log(`         📞 ${paciente.telefone} | 📧 ${paciente.email}`);
            console.log(`         📊 Status: ${paciente.status}`);
          });
        } else {
          console.log(`      ⚠️  Nenhum paciente encontrado`);
        }
      } else {
        console.log(`   ❌ Prestador não encontrado para CRM ${medico.crm}`);
      }
    }

    // 4. Testar a query de autenticação
    console.log('\n\n🧪 TESTANDO QUERY DE AUTENTICAÇÃO:');
    console.log('═'.repeat(80));
    
    for (const medico of medicos) {
      console.log(`\n🔍 Testando query para: ${medico.nome}`);
      
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
        ORDER BY p.Paciente_Nome
      `, [medico.clinica_id, medico.id, medico.clinica_id]);

      console.log(`   📊 Resultado: ${queryResult.length} pacientes encontrados`);
      
      if (queryResult.length > 0) {
        queryResult.forEach((paciente, index) => {
          console.log(`      ${index + 1}. ${paciente.Paciente_Nome} - Dr. ${paciente.prestador_nome}`);
        });
      }
    }

    console.log('\n\n📋 CREDENCIAIS PARA TESTE NO FRONTEND:');
    console.log('═'.repeat(80));
    medicos.forEach((medico, index) => {
      console.log(`${index + 1}. Email: ${medico.email}`);
      console.log(`   Senha: ${medico.crm}`);
      console.log(`   Nome: ${medico.nome}`);
      console.log('');
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

verifyPacientesMedico();
