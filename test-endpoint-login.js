const fetch = require('node-fetch');

async function testLoginEndpoint() {
  try {
    console.log('🧪 Testando endpoint de login...');
    
    const url = 'http://localhost:3002/api/mobile/medico/login';
    const credentials = {
      email: 'carlos.lima@clinica-rj.com',
      crm: '222222-RJ'
    };
    
    console.log('📡 URL:', url);
    console.log('📋 Credenciais:', credentials);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    });
    
    console.log('\n📊 Resposta do servidor:');
    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);
    console.log('   Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('   Body:', data);
    
    if (response.ok) {
      console.log('✅ Login realizado com sucesso!');
    } else {
      console.log('❌ Falha no login');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar endpoint:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Servidor não está rodando. Execute: npm run dev');
    }
  }
}

// Aguardar um pouco para o servidor inicializar
setTimeout(testLoginEndpoint, 3000);
