const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3002/api/mobile';

async function testAgendamentosAuth() {
  console.log('🧪 Testando autenticação de agendamentos...\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await fetch(`${API_BASE}/medico/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'carlos.lima@clinica-rj.com',
        crm: '222222-RJ'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login falhou: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login realizado com sucesso');
    console.log(`👨‍⚕️ Médico: ${loginData.data.medico.nome}`);
    console.log(`🏥 Clínica ID: ${loginData.data.medico.clinica_id}`);

    const token = loginData.data.accessToken;

    // 2. Testar busca de agendamentos autenticada
    console.log('\n2️⃣ Testando busca de agendamentos autenticada...');
    const agendamentosResponse = await fetch(`${API_BASE}/agendamentos-auth`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!agendamentosResponse.ok) {
      const errorText = await agendamentosResponse.text();
      throw new Error(`Busca de agendamentos falhou: ${agendamentosResponse.status}\n${errorText}`);
    }

    const agendamentosData = await agendamentosResponse.json();
    console.log('✅ Agendamentos carregados com sucesso');
    console.log(`📊 Total de agendamentos: ${agendamentosData.data.pagination.total}`);
    console.log(`📋 Agendamentos encontrados: ${agendamentosData.data.data.length}`);

    if (agendamentosData.data.data.length > 0) {
      console.log('\n📅 Agendamentos do médico:');
      agendamentosData.data.data.slice(0, 3).forEach((agendamento, index) => {
        console.log(`   ${index + 1}. ${agendamento.paciente_nome || 'Paciente N/A'}`);
        console.log(`      📅 ${agendamento.data_agendamento} ${agendamento.horario_inicio}-${agendamento.horario_fim}`);
        console.log(`      🏥 ${agendamento.tipo_consulta} - ${agendamento.status}`);
        console.log(`      📍 ${agendamento.local || 'Consultório Principal'}`);
        console.log('');
      });
    } else {
      console.log('⚠️  Nenhum agendamento encontrado para este médico');
    }

    // 3. Testar estatísticas
    console.log('3️⃣ Testando estatísticas...');
    const statsResponse = await fetch(`${API_BASE}/agendamentos-auth/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Estatísticas carregadas');
      console.log('📊 Estatísticas:', JSON.stringify(statsData.data, null, 2));
    } else {
      console.log('❌ Erro ao carregar estatísticas:', statsResponse.status);
    }

    // 4. Testar busca por data específica
    console.log('\n4️⃣ Testando busca por data específica...');
    const hoje = new Date().toISOString().split('T')[0];
    const hojeResponse = await fetch(`${API_BASE}/agendamentos-auth?data_inicio=${hoje}&data_fim=${hoje}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (hojeResponse.ok) {
      const hojeData = await hojeResponse.json();
      console.log('✅ Agendamentos de hoje carregados');
      console.log(`📊 Total de agendamentos hoje: ${hojeData.data.pagination.total}`);
    } else {
      console.log('❌ Erro ao carregar agendamentos de hoje:', hojeResponse.status);
    }

    // 5. Testar busca sem autenticação (deve falhar)
    console.log('\n5️⃣ Testando acesso sem autenticação (deve falhar)...');
    const noAuthResponse = await fetch(`${API_BASE}/agendamentos-auth`);
    
    if (noAuthResponse.status === 401) {
      console.log('✅ Acesso negado corretamente (401 Unauthorized)');
    } else {
      console.log('⚠️  Acesso deveria ter sido negado, mas foi permitido');
    }

    console.log('\n🎉 Todos os testes de autenticação de agendamentos passaram!');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
  }
}

// Executar testes
testAgendamentosAuth();
