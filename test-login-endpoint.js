const fetch = require('node-fetch');

async function testLoginEndpoint() {
  try {
    console.log('🧪 Testando endpoint de login...');
    
    const response = await fetch('http://localhost:3002/api/mobile/medico/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'carlos.lima@clinica-rj.com',
        crm: '222222-RJ'
      })
    });

    console.log('📊 Status:', response.status);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('📄 Response:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('✅ Login realizado com sucesso!');
      console.log('👤 Médico:', data.data.medico.nome);
      console.log('🏥 Clínica:', data.data.medico.clinica_nome);
      console.log('🔑 Token recebido:', data.data.accessToken ? 'Sim' : 'Não');
    } else {
      console.log('❌ Falha no login:', data.message);
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

testLoginEndpoint();
