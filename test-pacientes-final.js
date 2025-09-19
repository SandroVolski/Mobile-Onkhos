const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3002/api/mobile';

async function testPacientesFinal() {
  console.log('🧪 Teste final de pacientes com autenticação...\n');

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
      throw new Error(`Busca de pacientes falhou: ${pacientesResponse.status}\n${errorText}`);
    }

    const pacientesData = await pacientesResponse.json();
    console.log('✅ Pacientes carregados com sucesso');
    console.log(`📊 Total de pacientes: ${pacientesData.data.pagination.total}`);
    console.log(`📋 Pacientes encontrados: ${pacientesData.data.data.length}`);

    if (pacientesData.data.data.length > 0) {
      console.log('\n👥 Pacientes do médico:');
      pacientesData.data.data.forEach((paciente, index) => {
        console.log(`   ${index + 1}. ${paciente.name}`);
        console.log(`      📞 ${paciente.phone} | 📧 ${paciente.email}`);
        console.log(`      📊 Status: ${paciente.status} | 🎯 Diagnóstico: ${paciente.diagnosis}`);
        console.log(`      👨‍⚕️ Dr. ${paciente.doctor || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('⚠️  Nenhum paciente encontrado para este médico');
    }

    // 3. Testar estatísticas
    console.log('3️⃣ Testando estatísticas...');
    const statsResponse = await fetch(`${API_BASE}/pacientes-auth/stats`, {
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

    // 4. Testar busca por status
    console.log('\n4️⃣ Testando busca por status ativo...');
    const ativosResponse = await fetch(`${API_BASE}/pacientes-auth/status/ativo`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (ativosResponse.ok) {
      const ativosData = await ativosResponse.json();
      console.log('✅ Pacientes ativos carregados');
      console.log(`📊 Total de ativos: ${ativosData.data.data.length}`);
    } else {
      console.log('❌ Erro ao carregar ativos:', ativosResponse.status);
    }

    console.log('\n🎉 Teste final concluído com sucesso!');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Execute: node create-test-pacientes-medico.js');
    console.log('2. Execute: node verify-pacientes-medico.js');
    console.log('3. Teste no frontend com as credenciais listadas');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testPacientesFinal();
