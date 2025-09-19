const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugTables() {
  const config = {
    host: process.env.DB_HOST || '191.252.1.143',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'douglas',
    password: process.env.DB_PASSWORD || 'Douglas193',
    database: process.env.DB_NAME || 'bd_sistema_clinicas'
  };

  try {
    const connection = await mysql.createConnection(config);
    
    console.log('🔍 Verificando tabelas necessárias...');
    
    // Verificar se Operadoras existe
    try {
      const [operadoras] = await connection.execute('SELECT COUNT(*) as total FROM Operadoras');
      console.log('✅ Tabela Operadoras existe:', operadoras[0].total, 'registros');
    } catch (error) {
      console.log('❌ Tabela Operadoras não existe:', error.message);
    }
    
    // Verificar se Prestadores existe
    try {
      const [prestadores] = await connection.execute('SELECT COUNT(*) as total FROM Prestadores');
      console.log('✅ Tabela Prestadores existe:', prestadores[0].total, 'registros');
    } catch (error) {
      console.log('❌ Tabela Prestadores não existe:', error.message);
    }
    
    // Testar query simplificada
    console.log('\n🔍 Testando query simplificada...');
    try {
      const [result] = await connection.execute(`
        SELECT 
          p.id,
          p.Paciente_Nome,
          p.Data_Nascimento,
          p.Sexo,
          p.Cid_Diagnostico,
          p.telefone,
          p.email,
          p.status,
          p.stage,
          p.treatment,
          p.created_at
        FROM Pacientes_Clinica p
        WHERE p.clinica_id = 1
        LIMIT 5
      `);
      
      console.log('✅ Query simplificada funcionou:', result.length, 'pacientes');
      result.forEach((p, i) => {
        console.log(`  ${i+1}. ${p.Paciente_Nome} (${p.status})`);
      });
      
    } catch (error) {
      console.log('❌ Erro na query simplificada:', error.message);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
  }
}

debugTables();
