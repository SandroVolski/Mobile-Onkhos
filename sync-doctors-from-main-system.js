const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuração do banco principal (sistema-clinicas-backend)
const mainDbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_clinicas',
  port: process.env.DB_PORT || 3306
};

// Configuração do banco mobile (med-sync-mobile-backend)
const mobileDbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_clinicas',
  port: process.env.DB_PORT || 3306
};

async function syncDoctorsFromMainSystem() {
  let mainConnection;
  let mobileConnection;

  try {
    console.log('🔄 Iniciando sincronização de médicos...');
    
    // Conectar aos bancos
    mainConnection = await mysql.createConnection(mainDbConfig);
    mobileConnection = await mysql.createConnection(mobileDbConfig);
    
    console.log('✅ Conectado aos bancos de dados');

    // Buscar todos os usuários com role 'clinica' do sistema principal
    const [usuarios] = await mainConnection.execute(`
      SELECT 
        u.id,
        u.clinica_id,
        u.nome,
        u.email,
        u.username,
        u.status,
        c.nome as clinica_nome
      FROM Usuarios u
      LEFT JOIN Clinicas c ON u.clinica_id = c.id
      WHERE u.role = 'clinica' AND u.status = 'ativo'
    `);

    console.log(`📊 Encontrados ${usuarios.length} usuários clínicos ativos`);

    if (usuarios.length === 0) {
      console.log('⚠️  Nenhum usuário clínico encontrado');
      return;
    }

    // Verificar se a tabela Medicos_Mobile existe
    const [tables] = await mobileConnection.execute(`
      SHOW TABLES LIKE 'Medicos_Mobile'
    `);

    if (tables.length === 0) {
      console.log('❌ Tabela Medicos_Mobile não existe. Execute primeiro o script de criação.');
      return;
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const usuario of usuarios) {
      try {
        // Verificar se o médico já existe na tabela mobile
        const [existing] = await mobileConnection.execute(`
          SELECT id FROM Medicos_Mobile WHERE email = ?
        `, [usuario.email]);

        if (existing.length > 0) {
          // Atualizar médico existente
          await mobileConnection.execute(`
            UPDATE Medicos_Mobile SET
              nome = ?,
              clinica_id = ?,
              clinica_nome = ?,
              status = ?,
              updated_at = CURRENT_TIMESTAMP
            WHERE email = ?
          `, [
            usuario.nome,
            usuario.clinica_id,
            usuario.clinica_nome,
            usuario.status,
            usuario.email
          ]);
          updated++;
          console.log(`🔄 Atualizado: ${usuario.nome} (${usuario.email})`);
        } else {
          // Criar novo médico mobile
          // Gerar CRM baseado no ID do usuário (formato: CRM + ID)
          const crm = `CRM${String(usuario.id).padStart(6, '0')}`;
          
          await mobileConnection.execute(`
            INSERT INTO Medicos_Mobile (
              nome, email, crm, clinica_id, clinica_nome, 
              especialidade, telefone, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `, [
            usuario.nome,
            usuario.email,
            crm,
            usuario.clinica_id,
            usuario.clinica_nome,
            'Oncologia', // Especialidade padrão
            null, // Telefone não disponível no sistema principal
            usuario.status
          ]);
          created++;
          console.log(`✅ Criado: ${usuario.nome} (${usuario.email}) - CRM: ${crm}`);
        }
      } catch (error) {
        console.error(`❌ Erro ao processar ${usuario.nome}:`, error.message);
        skipped++;
      }
    }

    console.log('\n📈 Resumo da sincronização:');
    console.log(`   ✅ Criados: ${created}`);
    console.log(`   🔄 Atualizados: ${updated}`);
    console.log(`   ⚠️  Ignorados: ${skipped}`);
    console.log(`   📊 Total processados: ${usuarios.length}`);

    // Listar médicos mobile disponíveis
    const [medicosMobile] = await mobileConnection.execute(`
      SELECT id, nome, email, crm, clinica_nome, status 
      FROM Medicos_Mobile 
      ORDER BY nome
    `);

    console.log('\n👨‍⚕️ Médicos disponíveis no sistema mobile:');
    medicosMobile.forEach(medico => {
      console.log(`   • ${medico.nome} (${medico.email}) - CRM: ${medico.crm} - ${medico.clinica_nome || 'Sem clínica'}`);
    });

  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
  } finally {
    if (mainConnection) await mainConnection.end();
    if (mobileConnection) await mobileConnection.end();
    console.log('🔌 Conexões fechadas');
  }
}

// Executar sincronização
syncDoctorsFromMainSystem();
