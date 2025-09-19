const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('🔐 Testando login...');
    
    const response = await fetch('http://localhost:3002/api/mobile/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'teste@clinica.com',
        senha: '123456'
      })
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Login bem-sucedido!');
      console.log('👤 Usuário:', data.data.user.nome);
      console.log('🔑 Token:', data.data.accessToken.substring(0, 50) + '...');
      
      // Testar API de pacientes com o token
      console.log('\n📋 Testando API de pacientes...');
      const pacientesResponse = await fetch('http://localhost:3002/api/mobile/pacientes', {
        headers: {
          'Authorization': `Bearer ${data.data.accessToken}`
        }
      });
      
      const pacientesData = await pacientesResponse.json();
      console.log('✅ Pacientes carregados:', pacientesData.data?.data?.length || 0);
      
    } else {
      console.log('❌ Erro no login:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testLogin();
