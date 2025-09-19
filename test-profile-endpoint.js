const fetch = require('node-fetch');

async function testProfileEndpoint() {
  try {
    console.log('🧪 Testando endpoint de perfil...');
    
    // Primeiro fazer login para obter o token
    console.log('📡 Fazendo login...');
    const loginResponse = await fetch('http://localhost:3002/api/mobile/medico/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'carlos.lima@clinica-rj.com',
        crm: '222222-RJ'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('📊 Resposta do login:');
    console.log(`   Status: ${loginResponse.status}`);
    console.log(`   Success: ${loginData.success}`);
    
    if (!loginData.success) {
      console.log('❌ Falha no login:', loginData.message);
      return;
    }
    
    const accessToken = loginData.data.accessToken;
    console.log('✅ Token obtido:', accessToken.substring(0, 20) + '...');
    
    // Agora testar o endpoint de perfil
    console.log('\n📡 Testando endpoint de perfil...');
    const profileResponse = await fetch('http://localhost:3002/api/mobile/medico/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const profileData = await profileResponse.json();
    console.log('📊 Resposta do perfil:');
    console.log(`   Status: ${profileResponse.status}`);
    console.log(`   Success: ${profileData.success}`);
    console.log(`   Message: ${profileData.message}`);
    
    if (profileData.data) {
      console.log('\n📋 Dados do médico:');
      console.log(`   ID: ${profileData.data.id}`);
      console.log(`   Nome: ${profileData.data.nome}`);
      console.log(`   Email: ${profileData.data.email}`);
      console.log(`   CRM: ${profileData.data.crm}`);
      console.log(`   Especialidade: ${profileData.data.especialidade}`);
      console.log(`   Telefone: ${profileData.data.telefone}`);
      console.log(`   Clínica ID: ${profileData.data.clinica_id}`);
      console.log(`   Clínica Nome: ${profileData.data.clinica_nome}`);
      console.log(`   Status: ${profileData.data.status}`);
    }
    
    if (profileData.success) {
      console.log('✅ Perfil carregado com sucesso!');
    } else {
      console.log('❌ Falha ao carregar perfil');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar endpoint:', error.message);
  }
}

testProfileEndpoint();
