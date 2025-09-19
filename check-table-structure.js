const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_clinicas',
  port: process.env.DB_PORT || 3306
};

async function checkTableStructure() {
  let connection;

  try {
    console.log('🔍 Verificando estrutura das tabelas...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco de dados');

    // Verificar se a tabela Medicos_Mobile existe
    const [tables] = await connection.execute(`
      SHOW TABLES LIKE 'Medicos_Mobile'
    `);

    if (tables.length === 0) {
      console.log('❌ Tabela Medicos_Mobile não existe!');
      console.log('💡 Vamos criar a tabela...');
      
      // Criar a tabela
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS Medicos_Mobile (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nome VARCHAR(150) NOT NULL,
          email VARCHAR(150) NOT NULL UNIQUE,
          crm VARCHAR(20) NOT NULL UNIQUE,
          clinica_id INT,
          especialidade VARCHAR(100),
          telefone VARCHAR(20),
          status ENUM('ativo', 'inativo') DEFAULT 'ativo',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Tabela Medicos_Mobile criada!');
    } else {
      console.log('✅ Tabela Medicos_Mobile existe');
    }

    // Verificar estrutura da tabela Medicos_Mobile
    console.log('\n📋 Estrutura da tabela Medicos_Mobile:');
    const [columns] = await connection.execute(`
      DESCRIBE Medicos_Mobile
    `);
    
    columns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `(${col.Key})` : ''}`);
    });

    // Verificar se existem dados
    const [medicos] = await connection.execute(`
      SELECT id, nome, email, crm, clinica_id, especialidade, status, created_at
      FROM Medicos_Mobile 
      ORDER BY nome
    `);

    console.log(`\n👨‍⚕️ Médicos Mobile Encontrados: ${medicos.length}`);
    
    if (medicos.length === 0) {
      console.log('⚠️  Nenhum médico mobile cadastrado!');
      console.log('💡 Vamos criar alguns médicos de teste...');
      
      // Inserir médicos de teste
      const medicosTeste = [
        {
          nome: 'Dr. João Silva',
          email: 'joao.silva@clinica.com',
          crm: 'CRM123456',
          clinica_id: 1,
          especialidade: 'Oncologia'
        },
        {
          nome: 'Dra. Maria Santos',
          email: 'maria.santos@clinica.com',
          crm: 'CRM789012',
          clinica_id: 1,
          especialidade: 'Oncologia'
        },
        {
          nome: 'Dr. Pedro Oliveira',
          email: 'pedro.oliveira@clinica.com',
          crm: 'CRM345678',
          clinica_id: 2,
          especialidade: 'Oncologia'
        }
      ];

      for (const medico of medicosTeste) {
        await connection.execute(`
          INSERT INTO Medicos_Mobile (nome, email, crm, clinica_id, especialidade, status)
          VALUES (?, ?, ?, ?, ?, 'ativo')
        `, [medico.nome, medico.email, medico.crm, medico.clinica_id, medico.especialidade]);
        
        console.log(`✅ Criado: ${medico.nome} (${medico.email}) - CRM: ${medico.crm}`);
      }
    } else {
      console.log('\n📋 Médicos disponíveis:');
      medicos.forEach((medico, index) => {
        console.log(`\n${index + 1}. ${medico.nome}`);
        console.log(`   📧 Email: ${medico.email}`);
        console.log(`   🆔 CRM: ${medico.crm}`);
        console.log(`   🏥 Clínica ID: ${medico.clinica_id}`);
        console.log(`   🎯 Especialidade: ${medico.especialidade || 'Não informada'}`);
        console.log(`   ✅ Status: ${medico.status}`);
        console.log(`   📅 Criado: ${medico.created_at}`);
      });
    }

    // Instruções de uso
    console.log('\n📋 INSTRUÇÕES DE USO:');
    console.log('═'.repeat(80));
    console.log('1. Para testar o login, use qualquer email/CRM listado acima');
    console.log('2. Formato: Email = email do médico, Senha = CRM do médico');
    console.log('3. Exemplo:');
    if (medicos.length > 0) {
      const primeiro = medicos[0];
      console.log(`   Email: ${primeiro.email}`);
      console.log(`   Senha: ${primeiro.crm}`);
    } else {
      console.log('   Email: joao.silva@clinica.com');
      console.log('   Senha: CRM123456');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error);
  } finally {
    if (connection) await connection.end();
    console.log('\n🔌 Conexão fechada');
  }
}

checkTableStructure();