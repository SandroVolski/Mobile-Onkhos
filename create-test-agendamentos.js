const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bd_sistema_clinicas',
  port: process.env.DB_PORT || 3306
};

async function createTestAgendamentos() {
  let connection;

  try {
    console.log('🔧 Criando dados de teste para agendamentos...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco de dados');

    // 1. Verificar médicos mobile existentes
    const [medicos] = await connection.execute(`
      SELECT id, nome, crm, clinica_id 
      FROM Medicos_Mobile 
      WHERE status = 'ativo'
    `);

    console.log('\n👨‍⚕️ Médicos Mobile encontrados:');
    medicos.forEach((medico, index) => {
      console.log(`   ${index + 1}. ${medico.nome} - CRM: ${medico.crm} - Clínica: ${medico.clinica_id}`);
    });

    if (medicos.length === 0) {
      console.log('❌ Nenhum médico mobile encontrado!');
      return;
    }

    // 2. Verificar se a tabela Agendamentos existe
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'Agendamentos'
    `);

    if (tables.length === 0) {
      console.log('❌ Tabela Agendamentos não existe!');
      return;
    }

    console.log('✅ Tabela Agendamentos encontrada');

    // 3. Verificar estrutura da tabela Agendamentos
    const [columns] = await connection.execute(`
      DESCRIBE Agendamentos
    `);

    console.log('\n📋 Estrutura da tabela Agendamentos:');
    columns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // 4. Buscar pacientes existentes para cada médico
    for (const medico of medicos) {
      console.log(`\n🔧 Processando médico: ${medico.nome}`);
      
      // Buscar pacientes deste médico
      const [pacientes] = await connection.execute(`
        SELECT 
          p.id, p.Paciente_Nome, p.telefone, p.email
        FROM Pacientes_Clinica p
        LEFT JOIN Prestadores pr ON p.Prestador = pr.id
        WHERE p.clinica_id = ? 
          AND p.Prestador IN (
            SELECT pr.id FROM Prestadores pr 
            INNER JOIN Medicos_Mobile m ON pr.crm = m.crm
            WHERE m.id = ? AND m.clinica_id = ?
          )
        LIMIT 3
      `, [medico.clinica_id, medico.id, medico.clinica_id]);

      console.log(`   👥 Pacientes encontrados: ${pacientes.length}`);

      if (pacientes.length === 0) {
        console.log(`   ⚠️  Nenhum paciente encontrado para ${medico.nome}`);
        continue;
      }

      // 5. Criar agendamentos de teste para este médico
      const tiposConsulta = ['primeira_consulta', 'retorno', 'quimioterapia', 'radioterapia', 'seguimento'];
      const statusOptions = ['agendada', 'confirmada', 'em_andamento', 'concluida'];
      const locais = ['Consultório Principal', 'Sala de Quimioterapia', 'Consultório 2', 'Sala de Radioterapia'];

      for (let i = 0; i < 5; i++) {
        const paciente = pacientes[i % pacientes.length];
        const tipoConsulta = tiposConsulta[i % tiposConsulta.length];
        const status = statusOptions[i % statusOptions.length];
        const local = locais[i % locais.length];

        // Criar data de agendamento (próximos 30 dias)
        const dataAgendamento = new Date();
        dataAgendamento.setDate(dataAgendamento.getDate() + (i * 2) + 1);

        // Criar horários
        const horarioInicio = `${8 + (i * 2)}:00`;
        const horarioFim = `${9 + (i * 2)}:00`;

        // Verificar se agendamento já existe
        const [agendamentoExistente] = await connection.execute(`
          SELECT id FROM Agendamentos 
          WHERE clinica_id = ? AND medico_id = ? AND paciente_id = ? 
            AND data_agendamento = ? AND horario_inicio = ?
        `, [
          medico.clinica_id, 
          medico.id, 
          paciente.id, 
          dataAgendamento.toISOString().split('T')[0], 
          horarioInicio
        ]);

        if (agendamentoExistente.length > 0) {
          console.log(`   ⚠️  Agendamento já existe para ${paciente.Paciente_Nome} em ${dataAgendamento.toISOString().split('T')[0]}`);
          continue;
        }

        // Criar agendamento
        await connection.execute(`
          INSERT INTO Agendamentos (
            clinica_id, medico_id, paciente_id, data_agendamento, 
            horario_inicio, horario_fim, tipo_consulta, status, 
            local, observacoes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          medico.clinica_id,
          medico.id,
          paciente.id,
          dataAgendamento.toISOString().split('T')[0],
          horarioInicio,
          horarioFim,
          tipoConsulta,
          status,
          local,
          `Consulta de teste para ${paciente.Paciente_Nome} - ${tipoConsulta}`
        ]);

        console.log(`   ✅ Agendamento criado: ${paciente.Paciente_Nome} - ${dataAgendamento.toISOString().split('T')[0]} ${horarioInicio}`);
      }
    }

    // 6. Verificar resultado final
    console.log('\n📊 Verificando resultado final...');
    
    for (const medico of medicos) {
      const [agendamentos] = await connection.execute(`
        SELECT 
          a.id, a.data_agendamento, a.horario_inicio, a.tipo_consulta, a.status,
          p.Paciente_Nome, pr.nome as medico_nome
        FROM Agendamentos a
        LEFT JOIN Pacientes_Clinica p ON a.paciente_id = p.id
        LEFT JOIN Responsaveis_Tecnicos pr ON a.medico_id = pr.id
        WHERE a.clinica_id = ? AND a.medico_id = ?
        ORDER BY a.data_agendamento ASC, a.horario_inicio ASC
      `, [medico.clinica_id, medico.id]);

      console.log(`\n👨‍⚕️ ${medico.nome} tem ${agendamentos.length} agendamentos:`);
      agendamentos.forEach((agendamento, index) => {
        console.log(`   ${index + 1}. ${agendamento.Paciente_Nome} - ${agendamento.data_agendamento} ${agendamento.horario_inicio} - ${agendamento.tipo_consulta} (${agendamento.status})`);
      });
    }

    console.log('\n🎉 Dados de teste de agendamentos criados com sucesso!');
    console.log('\n📋 INSTRUÇÕES PARA TESTE NO FRONTEND:');
    console.log('1. Faça login com qualquer médico listado acima');
    console.log('2. Vá para a tela de Agenda');
    console.log('3. Você deve ver apenas os agendamentos do médico logado');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexão fechada');
    }
  }
}

createTestAgendamentos();
