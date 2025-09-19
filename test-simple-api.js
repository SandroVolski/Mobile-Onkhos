const fetch = require('node-fetch');

async function testSimpleAPI() {
  try {
    console.log('🔐 Testando login...');
    
    // 1. Fazer login
    const loginResponse = await fetch('http://localhost:3002/api/mobile/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'teste@clinica.com',
        senha: '123456'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.log('❌ Erro no login:', loginData.message);
      return;
    }

    console.log('✅ Login bem-sucedido!');
    const token = loginData.data.accessToken;
    
    // 2. Testar endpoint de health
    console.log('\n🏥 Testando health...');
    try {
      const healthResponse = await fetch('http://localhost:3002/api/mobile/health');
      const healthData = await healthResponse.json();
      console.log('✅ Health OK:', healthData.message);
    } catch (error) {
      console.log('❌ Health falhou:', error.message);
    }
    
    // 3. Testar endpoint de usuário
    console.log('\n👤 Testando /me...');
    try {
      const meResponse = await fetch('http://localhost:3002/api/mobile/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const meData = await meResponse.json();
      console.log('✅ Me OK:', meData.data?.nome);
    } catch (error) {
      console.log('❌ Me falhou:', error.message);
    }
    
    // 4. Testar endpoint de pacientes com logs detalhados
    console.log('\n📋 Testando pacientes...');
    try {
      const pacientesResponse = await fetch('http://localhost:3002/api/mobile/pacientes?page=1&limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Status:', pacientesResponse.status);
      console.log('Headers:', Object.fromEntries(pacientesResponse.headers.entries()));
      
      const pacientesData = await pacientesResponse.json();
      console.log('✅ Pacientes OK:', pacientesData);
      
    } catch (error) {
      console.log('❌ Pacientes falhou:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testSimpleAPI();
