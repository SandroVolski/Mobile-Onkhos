const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createTestUser() {
  const config = {
    host: process.env.DB_HOST || '191.252.1.143',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'douglas',
    password: process.env.DB_PASSWORD || 'Douglas193',
    database: process.env.DB_NAME || 'bd_sistema_clinicas'
  };

  try {
    const connection = await mysql.createConnection(config);
    
    console.log('🔐 Criando usuário de teste para o aplicativo móvel...');
    
    // Verificar se já existe um usuário de teste
    const [existingUsers] = await connection.execute(
      'SELECT * FROM Usuarios WHERE email = ?',
      ['teste@clinica.com']
    );
    
    if (existingUsers.length > 0) {
      console.log('✅ Usuário de teste já existe!');
      console.log('📧 Email: teste@clinica.com');
      console.log('🔑 Senha: 123456');
      console.log('👤 Tipo: clinica');
      await connection.end();
      return;
    }
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Criar usuário de teste
    await connection.execute(
      `INSERT INTO Usuarios (nome, email, password_hash, role, clinica_id, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        'Doutor Teste Mobile',
        'teste@clinica.com',
        hashedPassword,
        'clinica',
        1, // Assumindo que existe uma clínica com ID 1
        'ativo'
      ]
    );
    
    console.log('✅ Usuário de teste criado com sucesso!');
    console.log('📧 Email: teste@clinica.com');
    console.log('🔑 Senha: 123456');
    console.log('👤 Tipo: clinica');
    console.log('🏥 Clínica ID: 1');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

createTestUser();
