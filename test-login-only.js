const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3002/api/mobile';

async function testLoginOnly() {
  console.log('🧪 Testando apenas o login...\n');

  try {
    // 1. Verificar se o servidor está rodando
    console.log('1️⃣ Verificando se o servidor está rodando...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    
    if (!healthResponse.ok) {
      throw new Error(`Servidor não está rodando: ${healthResponse.status}`);
    }
    
    const healthData = await healthResponse.json();
    console.log('✅ Servidor está rodando:', healthData.message);

    // 2. Testar login com diferentes credenciais
    const credentials = [
      { email: 'carlos.lima@clinica-rj.com', crm: '222222-RJ' },
      { email: 'ana.oliveira@clinica-rj.com', crm: '111111-RJ' },
      { email: 'teste@clinica.com', crm: 'CRM000002' }
    ];

    for (const cred of credentials) {
      console.log(`\n2️⃣ Testando login com: ${cred.email}`);
      
      try {
        const loginResponse = await fetch(`${API_BASE}/medico/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(cred)
        });

        console.log(`   Status: ${loginResponse.status}`);
        
        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          console.log('   ✅ Login bem-sucedido');
          console.log(`   👨‍⚕️ Médico: ${loginData.data.medico.nome}`);
          console.log(`   🏥 Clínica: ${loginData.data.medico.clinica_nome}`);
          console.log(`   🆔 ID: ${loginData.data.medico.id}`);
          console.log(`   🏥 Clínica ID: ${loginData.data.medico.clinica_id}`);
          break; // Se um login funcionou, parar aqui
        } else {
          const errorText = await loginResponse.text();
          console.log('   ❌ Login falhou:', errorText);
        }
      } catch (error) {
        console.log('   ❌ Erro na requisição:', error.message);
      }
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testLoginOnly();
