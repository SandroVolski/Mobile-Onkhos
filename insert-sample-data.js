const { query } = require('./dist/config/database');

async function insertSampleData() {
  try {
    console.log('🚀 Inserindo dados de exemplo no banco de dados...');
    
    // Verificar se já existem dados
    const [countResult] = await query('SELECT COUNT(*) as total FROM Agendamentos WHERE clinica_id = ?', [1]);
    const existingCount = countResult.total;
    
    if (existingCount > 0) {
      console.log(`ℹ️ Já existem ${existingCount} agendamentos no banco. Pulando inserção.`);
      return;
    }
    
    // Inserir dados de exemplo
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split('T')[0];
    
    const sampleAppointments = [
      // Consultas para hoje
      {
        clinica_id: 1,
        paciente_id: 1,
        medico_id: 1,
        data_agendamento: todayStr,
        horario_inicio: '14:30:00',
        horario_fim: '15:00:00',
        tipo_consulta: 'primeira_consulta',
        status: 'agendada',
        local: 'Consultório 3A',
        observacoes: 'Primeira consulta - trazer exames'
      },
      {
        clinica_id: 1,
        paciente_id: 2,
        medico_id: 1,
        data_agendamento: todayStr,
        horario_inicio: '15:15:00',
        horario_fim: '16:00:00',
        tipo_consulta: 'retorno',
        status: 'confirmada',
        local: 'Consultório 3A',
        observacoes: 'Avaliar resposta ao tratamento'
      },
      // Consultas para amanhã
      {
        clinica_id: 1,
        paciente_id: 3,
        medico_id: 1,
        data_agendamento: tomorrowStr,
        horario_inicio: '09:00:00',
        horario_fim: '10:00:00',
        tipo_consulta: 'primeira_consulta',
        status: 'agendada',
        local: 'Consultório 3A',
        observacoes: 'Consulta inicial'
      },
      {
        clinica_id: 1,
        paciente_id: 4,
        medico_id: 1,
        data_agendamento: tomorrowStr,
        horario_inicio: '14:00:00',
        horario_fim: '14:30:00',
        tipo_consulta: 'retorno',
        status: 'agendada',
        local: 'Consultório 3A',
        observacoes: 'Acompanhamento'
      },
      // Consultas para depois de amanhã
      {
        clinica_id: 1,
        paciente_id: 1,
        medico_id: 1,
        data_agendamento: dayAfterTomorrowStr,
        horario_inicio: '10:30:00',
        horario_fim: '11:30:00',
        tipo_consulta: 'quimioterapia',
        status: 'agendada',
        local: 'Sala de Quimio 1',
        observacoes: 'Ciclo 2 de quimioterapia'
      },
      {
        clinica_id: 1,
        paciente_id: 2,
        medico_id: 1,
        data_agendamento: dayAfterTomorrowStr,
        horario_inicio: '15:00:00',
        horario_fim: '15:30:00',
        tipo_consulta: 'radioterapia',
        status: 'agendada',
        local: 'Sala de Radio',
        observacoes: 'Sessão de radioterapia'
      }
    ];
    
    for (const appointment of sampleAppointments) {
      const sql = `
        INSERT INTO Agendamentos (
          clinica_id, paciente_id, medico_id, data_agendamento,
          horario_inicio, horario_fim, tipo_consulta, status,
          local, observacoes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      await query(sql, [
        appointment.clinica_id,
        appointment.paciente_id,
        appointment.medico_id,
        appointment.data_agendamento,
        appointment.horario_inicio,
        appointment.horario_fim,
        appointment.tipo_consulta,
        appointment.status,
        appointment.local,
        appointment.observacoes
      ]);
    }
    
    console.log('✅ Dados de exemplo inseridos com sucesso!');
    console.log(`📅 ${sampleAppointments.length} agendamentos criados`);
    
    // Verificar os dados inseridos
    const [newCountResult] = await query('SELECT COUNT(*) as total FROM Agendamentos WHERE clinica_id = ?', [1]);
    console.log(`📊 Total de agendamentos no banco: ${newCountResult.total}`);
    
  } catch (error) {
    console.error('❌ Erro ao inserir dados de exemplo:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  insertSampleData()
    .then(() => {
      console.log('🎉 Script concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { insertSampleData };
