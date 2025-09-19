const fetch = require('node-fetch');

async function testSolicitacoesAuth() {
  try {
    console.log('🧪 Testando autenticação de solicitações...');
    
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
    
    // Testar endpoint de solicitações
    console.log('\n📡 Testando endpoint de solicitações...');
    const solicitacoesResponse = await fetch('http://localhost:3002/api/mobile/solicitacoes', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const solicitacoesData = await solicitacoesResponse.json();
    console.log('📊 Resposta das solicitações:');
    console.log(`   Status: ${solicitacoesResponse.status}`);
    console.log(`   Success: ${solicitacoesData.success}`);
    console.log(`   Message: ${solicitacoesData.message}`);
    
    if (solicitacoesData.data) {
      console.log('\n📋 Dados das solicitações:');
      console.log(`   Total de solicitações: ${solicitacoesData.data.solicitacoes.length}`);
      console.log(`   Página: ${solicitacoesData.data.pagination.page}`);
      console.log(`   Total de páginas: ${solicitacoesData.data.pagination.totalPages}`);
      console.log(`   Total geral: ${solicitacoesData.data.pagination.total}`);
      
      if (solicitacoesData.data.solicitacoes.length > 0) {
        console.log('\n📄 Primeira solicitação:');
        const primeira = solicitacoesData.data.solicitacoes[0];
        console.log(`   ID: ${primeira.id}`);
        console.log(`   Paciente: ${primeira.paciente_nome || 'N/A'}`);
        console.log(`   Status: ${primeira.status}`);
        console.log(`   CRM Médico: ${primeira.medico_assinatura_crm}`);
        console.log(`   Clínica ID: ${primeira.clinica_id}`);
      }
    }
    
    // Testar endpoint de estatísticas
    console.log('\n📡 Testando endpoint de estatísticas...');
    const statsResponse = await fetch('http://localhost:3002/api/mobile/solicitacoes/stats', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    const statsData = await statsResponse.json();
    console.log('📊 Resposta das estatísticas:');
    console.log(`   Status: ${statsResponse.status}`);
    console.log(`   Success: ${statsData.success}`);
    
    if (statsData.data) {
      console.log('\n📈 Estatísticas:');
      console.log(`   Total: ${statsData.data.total}`);
      console.log(`   Pendentes: ${statsData.data.pendentes}`);
      console.log(`   Aprovadas: ${statsData.data.aprovadas}`);
      console.log(`   Rejeitadas: ${statsData.data.rejeitadas}`);
      console.log(`   Em análise: ${statsData.data.em_analise}`);
    }
    
    if (solicitacoesData.success && statsData.success) {
      console.log('\n✅ Autenticação de solicitações funcionando perfeitamente!');
    } else {
      console.log('\n❌ Falha na autenticação de solicitações');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar autenticação:', error.message);
  }
}

testSolicitacoesAuth();
