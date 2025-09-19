const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3002/api/mobile';

async function testDashboardAuth() {
  console.log('🧪 Testando autenticação do Dashboard...\n');

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
      throw new Error(`Login falhou: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login realizado com sucesso!');
    console.log(`👤 Médico: ${loginData.data.medico.nome}`);
    console.log(`🏥 Clínica: ${loginData.data.medico.clinica_id}\n`);

    const token = loginData.data.accessToken;

    // 2. Testar agendamentos autenticados
    console.log('2️⃣ Testando agendamentos autenticados...');
    const agendamentosResponse = await fetch(`${API_BASE}/agendamentos-auth?limit=10`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!agendamentosResponse.ok) {
      throw new Error(`Agendamentos falharam: ${agendamentosResponse.status} ${agendamentosResponse.statusText}`);
    }

    const agendamentosData = await agendamentosResponse.json();
    console.log('✅ Agendamentos carregados com sucesso!');
    console.log(`📅 Total de agendamentos: ${agendamentosData.data?.data?.length || 0}`);
    
    if (agendamentosData.data?.data?.length > 0) {
      console.log('📋 Primeiros agendamentos:');
      agendamentosData.data.data.slice(0, 3).forEach((ag, index) => {
        console.log(`   ${index + 1}. ${ag.paciente_nome || 'Paciente'} - ${ag.data_agendamento} ${ag.horario_inicio}`);
      });
    }
    console.log('');

    // 3. Testar solicitações autenticadas
    console.log('3️⃣ Testando solicitações autenticadas...');
    const solicitacoesResponse = await fetch(`${API_BASE}/solicitacoes?limit=10`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!solicitacoesResponse.ok) {
      throw new Error(`Solicitações falharam: ${solicitacoesResponse.status} ${solicitacoesResponse.statusText}`);
    }

    const solicitacoesData = await solicitacoesResponse.json();
    console.log('✅ Solicitações carregadas com sucesso!');
    console.log(`📋 Total de solicitações: ${solicitacoesData.data?.data?.length || 0}`);
    
    if (solicitacoesData.data?.data?.length > 0) {
      console.log('📋 Primeiras solicitações:');
      solicitacoesData.data.data.slice(0, 3).forEach((sol, index) => {
        console.log(`   ${index + 1}. ${sol.paciente_nome || 'Paciente'} - ${sol.status}`);
      });
    }
    console.log('');

    // 4. Testar estatísticas de agendamentos
    console.log('4️⃣ Testando estatísticas de agendamentos...');
    const statsResponse = await fetch(`${API_BASE}/agendamentos-auth/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!statsResponse.ok) {
      throw new Error(`Estatísticas falharam: ${statsResponse.status} ${statsResponse.statusText}`);
    }

    const statsData = await statsResponse.json();
    console.log('✅ Estatísticas carregadas com sucesso!');
    console.log(`📊 Estatísticas:`, JSON.stringify(statsData.data, null, 2));
    console.log('');

    // 5. Testar estatísticas de solicitações
    console.log('5️⃣ Testando estatísticas de solicitações...');
    const solicitacoesStatsResponse = await fetch(`${API_BASE}/solicitacoes/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!solicitacoesStatsResponse.ok) {
      throw new Error(`Estatísticas de solicitações falharam: ${solicitacoesStatsResponse.status} ${solicitacoesStatsResponse.statusText}`);
    }

    const solicitacoesStatsData = await solicitacoesStatsResponse.json();
    console.log('✅ Estatísticas de solicitações carregadas com sucesso!');
    console.log(`📊 Estatísticas de solicitações:`, JSON.stringify(solicitacoesStatsData.data, null, 2));
    console.log('');

    console.log('🎉 TESTE DO DASHBOARD CONCLUÍDO COM SUCESSO!');
    console.log('✅ Todos os endpoints autenticados estão funcionando');
    console.log('✅ O dashboard deve mostrar apenas os dados do médico logado');
    console.log('✅ Agora você pode testar no frontend!');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
    process.exit(1);
  }
}

// Executar teste
testDashboardAuth();
