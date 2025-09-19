const fetch = require('node-fetch');

async function testSyncEndpoint() {
  try {
    console.log('🧪 Testando endpoint de sincronização...');
    console.log('📡 URL: http://localhost:3002/api/mobile/sync/doctors');
    
    const response = await fetch('http://localhost:3002/api/mobile/sync/doctors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    console.log('📊 Resposta do servidor:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${data.success}`);
    console.log(`   Message: ${data.message}`);
    
    if (data.data) {
      console.log('📈 Dados da sincronização:');
      console.log(`   ✅ Criados: ${data.data.created}`);
      console.log(`   🔄 Atualizados: ${data.data.updated}`);
      console.log(`   ⚠️  Ignorados: ${data.data.skipped}`);
      console.log(`   📊 Total: ${data.data.total}`);
    }
    
    if (data.success) {
      console.log('✅ Sincronização executada com sucesso!');
    } else {
      console.log('❌ Falha na sincronização');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar endpoint:', error.message);
  }
}

testSyncEndpoint();
