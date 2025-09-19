const http = require('http');

function testCurl() {
  const postData = JSON.stringify({
    email: 'carlos.lima@clinica-rj.com',
    crm: '222222-RJ'
  });

  const options = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/mobile/medico/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('🧪 Testando endpoint com curl...');
  console.log('📡 URL: http://localhost:3002/api/mobile/medico/login');
  console.log('📋 Dados:', postData);

  const req = http.request(options, (res) => {
    console.log(`\n📊 Status: ${res.statusCode}`);
    console.log('📋 Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('📄 Body:', data);
      
      if (res.statusCode === 200) {
        console.log('✅ Login realizado com sucesso!');
      } else {
        console.log('❌ Falha no login');
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Erro na requisição:', e.message);
  });

  req.write(postData);
  req.end();
}

testCurl();
