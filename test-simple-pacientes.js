const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3002/api/mobile';

async function testSimplePacientes() {
  console.log('🧪 Teste simples de pacientes...\n');

  try {
    // 1. Verificar se o servidor está rodando
    console.log('1️⃣ Verificando se o servidor está rodando...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    
    if (!healthResponse.ok) {
      throw new Error(`Servidor não está rodando: ${healthResponse.status}`);
    }
    
    const healthData = await healthResponse.json();
    console.log('✅ Servidor está rodando:', healthData.message);

    // 2. Fazer login
    console.log('\n2️⃣ Fazendo login...');
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

    console.log('Status do login:', loginResponse.status);
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.log('Erro do login:', errorText);
      throw new Error(`Login falhou: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login realizado com sucesso');
    console.log('Dados do login:', JSON.stringify(loginData, null, 2));

    const token = loginData.data.accessToken;
    console.log('Token obtido:', token ? 'Sim' : 'Não');

    // 3. Testar endpoint de pacientes sem autenticação (deve funcionar)
    console.log('\n3️⃣ Testando endpoint de pacientes sem autenticação...');
    const pacientesNoAuthResponse = await fetch(`${API_BASE}/pacientes`);
    
    if (pacientesNoAuthResponse.ok) {
      const pacientesNoAuthData = await pacientesNoAuthResponse.json();
      console.log('✅ Endpoint sem auth funcionou');
      console.log('Total de pacientes (sem auth):', pacientesNoAuthData.data?.pagination?.total || 'N/A');
    } else {
      console.log('❌ Endpoint sem auth falhou:', pacientesNoAuthResponse.status);
    }

    // 4. Testar endpoint de pacientes com autenticação
    console.log('\n4️⃣ Testando endpoint de pacientes com autenticação...');
    const pacientesAuthResponse = await fetch(`${API_BASE}/pacientes-auth`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('Status da busca autenticada:', pacientesAuthResponse.status);
    
    if (!pacientesAuthResponse.ok) {
      const errorText = await pacientesAuthResponse.text();
      console.log('Erro da busca autenticada:', errorText);
    } else {
      const pacientesAuthData = await pacientesAuthResponse.json();
      console.log('✅ Endpoint com auth funcionou');
      console.log('Total de pacientes (com auth):', pacientesAuthData.data?.pagination?.total || 'N/A');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testSimplePacientes();
