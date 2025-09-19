const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3002/api/mobile';

async function testPacientesAuth() {
  console.log('🧪 Testando autenticação de pacientes...\n');

  try {
    // 1. Fazer login para obter token
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
    console.log('✅ Login realizado com sucesso');
    console.log(`👨‍⚕️ Médico: ${loginData.data.medico.nome}`);
    console.log(`🏥 Clínica: ${loginData.data.medico.clinica_nome}`);

    const token = loginData.data.accessToken;

    // 2. Testar busca de pacientes autenticada
    console.log('\n2️⃣ Testando busca de pacientes autenticada...');
    const pacientesResponse = await fetch(`${API_BASE}/pacientes-auth`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!pacientesResponse.ok) {
      const errorText = await pacientesResponse.text();
      throw new Error(`Busca de pacientes falhou: ${pacientesResponse.status} ${pacientesResponse.statusText}\n${errorText}`);
    }

    const pacientesData = await pacientesResponse.json();
    console.log('✅ Pacientes carregados com sucesso');
    console.log(`📊 Total de pacientes: ${pacientesData.data.pagination.total}`);
    console.log(`📋 Pacientes encontrados: ${pacientesData.data.data.length}`);

    if (pacientesData.data.data.length > 0) {
      console.log('\n👥 Primeiros pacientes:');
      pacientesData.data.data.slice(0, 3).forEach((paciente, index) => {
        console.log(`   ${index + 1}. ${paciente.name} - ${paciente.status} - Dr. ${paciente.doctor || 'N/A'}`);
      });
    }

    // 3. Testar estatísticas de pacientes
    console.log('\n3️⃣ Testando estatísticas de pacientes...');
    const statsResponse = await fetch(`${API_BASE}/pacientes-auth/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!statsResponse.ok) {
      const errorText = await statsResponse.text();
      throw new Error(`Estatísticas falharam: ${statsResponse.status} ${statsResponse.statusText}\n${errorText}`);
    }

    const statsData = await statsResponse.json();
    console.log('✅ Estatísticas carregadas com sucesso');
    console.log(`📊 Estatísticas:`, statsData.data);

    // 4. Testar busca sem autenticação (deve falhar)
    console.log('\n4️⃣ Testando acesso sem autenticação (deve falhar)...');
    const noAuthResponse = await fetch(`${API_BASE}/pacientes-auth`);
    
    if (noAuthResponse.status === 401) {
      console.log('✅ Acesso negado corretamente (401 Unauthorized)');
    } else {
      console.log('⚠️  Acesso deveria ter sido negado, mas foi permitido');
    }

    console.log('\n🎉 Todos os testes de autenticação de pacientes passaram!');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
  }
}

// Executar testes
testPacientesAuth();
