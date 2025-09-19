const fetch = require('node-fetch');

async function testLoginFix() {
  try {
    console.log('🧪 Testando correção do login...');
    
    // Testar login
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
    
    console.log('✅ Login bem-sucedido!');
    console.log('📋 Dados do médico:');
    console.log(`   Nome: ${loginData.data.medico.nome}`);
    console.log(`   Email: ${loginData.data.medico.email}`);
    console.log(`   CRM: ${loginData.data.medico.crm}`);
    console.log(`   Clínica: ${loginData.data.medico.clinica_nome}`);
    
    const accessToken = loginData.data.accessToken;
    console.log('🔑 Token obtido:', accessToken.substring(0, 20) + '...');
    
    // Testar validação do token
    console.log('\n📡 Testando validação do token...');
    const validateResponse = await fetch('http://localhost:3002/api/mobile/auth/validate', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const validateData = await validateResponse.json();
    console.log('📊 Resposta da validação:');
    console.log(`   Status: ${validateResponse.status}`);
    console.log(`   Success: ${validateData.success}`);
    console.log(`   Message: ${validateData.message}`);
    
    // Testar perfil
    console.log('\n📡 Testando perfil...');
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
    
    if (profileData.data) {
      console.log('📋 Dados do perfil:');
      console.log(`   Nome: ${profileData.data.nome}`);
      console.log(`   Email: ${profileData.data.email}`);
      console.log(`   CRM: ${profileData.data.crm}`);
      console.log(`   Clínica: ${profileData.data.clinica_nome}`);
    }
    
    if (loginData.success && validateData.success && profileData.success) {
      console.log('\n🎉 Tudo funcionando perfeitamente!');
      console.log('✅ O frontend agora deve conseguir fazer login corretamente');
    } else {
      console.log('\n❌ Ainda há problemas');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar:', error.message);
  }
}

testLoginFix();
