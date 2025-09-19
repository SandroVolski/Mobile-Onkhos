const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bd_sistema_clinicas',
  port: process.env.DB_PORT || 3306
};

async function createTestPacientesMedico() {
  let connection;

  try {
    console.log('🔧 Criando dados de teste para pacientes e médicos...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco de dados');

    // 1. Verificar médicos mobile existentes
    const [medicos] = await connection.execute(`
      SELECT id, nome, crm, clinica_id 
      FROM Medicos_Mobile 
      WHERE status = 'ativo'
    `);

    console.log('\n👨‍⚕️ Médicos Mobile encontrados:');
    medicos.forEach((medico, index) => {
      console.log(`   ${index + 1}. ${medico.nome} - CRM: ${medico.crm} - Clínica: ${medico.clinica_id}`);
    });

    if (medicos.length === 0) {
      console.log('❌ Nenhum médico mobile encontrado!');
      return;
    }

    // 2. Para cada médico, criar/atualizar prestador correspondente
    for (const medico of medicos) {
      console.log(`\n🔧 Processando médico: ${medico.nome}`);
      
      // Verificar se já existe prestador com esse CRM
      const [prestadoresExistentes] = await connection.execute(`
        SELECT id, nome, crm FROM Prestadores WHERE crm = ?
      `, [medico.crm]);

      let prestadorId;
      
      if (prestadoresExistentes.length > 0) {
        prestadorId = prestadoresExistentes[0].id;
        console.log(`   ✅ Prestador já existe: ${prestadoresExistentes[0].nome} (ID: ${prestadorId})`);
      } else {
        // Criar novo prestador
        const [result] = await connection.execute(`
          INSERT INTO Prestadores (nome, codigo, especialidade, crm, status, created_at)
          VALUES (?, ?, ?, ?, 'ativo', NOW())
        `, [
          medico.nome,
          `PREST_${medico.crm}`,
          'Oncologia', // Especialidade padrão
          medico.crm
        ]);
        
        prestadorId = result.insertId;
        console.log(`   ✅ Prestador criado: ID ${prestadorId}`);
      }

      // 3. Criar pacientes de teste para este prestador
      const pacientesTeste = [
        {
          nome: `Paciente Teste ${medico.nome.split(' ')[1]} - 01`,
          cpf: `111.111.111-${String(medico.id).padStart(2, '0')}`,
          telefone: `(21) 99999-${String(medico.id).padStart(4, '0')}`,
          email: `paciente${medico.id}@teste.com`,
          status: 'Em tratamento'
        },
        {
          nome: `Paciente Teste ${medico.nome.split(' ')[1]} - 02`,
          cpf: `222.222.222-${String(medico.id).padStart(2, '0')}`,
          telefone: `(21) 88888-${String(medico.id).padStart(4, '0')}`,
          email: `paciente${medico.id + 10}@teste.com`,
          status: 'Em remissão'
        },
        {
          nome: `Paciente Teste ${medico.nome.split(' ')[1]} - 03`,
          cpf: `333.333.333-${String(medico.id).padStart(2, '0')}`,
          telefone: `(21) 77777-${String(medico.id).padStart(4, '0')}`,
          email: `paciente${medico.id + 20}@teste.com`,
          status: 'Alta'
        }
      ];

      for (const paciente of pacientesTeste) {
        // Verificar se paciente já existe
        const [pacientesExistentes] = await connection.execute(`
          SELECT id FROM Pacientes_Clinica 
          WHERE Paciente_Nome = ? AND clinica_id = ?
        `, [paciente.nome, medico.clinica_id]);

        if (pacientesExistentes.length === 0) {
          // Criar novo paciente
          await connection.execute(`
            INSERT INTO Pacientes_Clinica (
              clinica_id, Paciente_Nome, Prestador, Codigo, Data_Nascimento, 
              Sexo, Cid_Diagnostico, stage, treatment, peso, altura,
              telefone, email, cpf, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          `, [
            medico.clinica_id,
            paciente.nome,
            prestadorId,
            `PAC_${medico.id}_${Date.now()}`,
            '1980-01-01', // Data de nascimento padrão
            'Masculino',
            'C78.0', // CID de exemplo
            'Estágio I',
            'Quimioterapia',
            70.0, // Peso
            1.70, // Altura
            paciente.telefone,
            paciente.email,
            paciente.cpf,
            paciente.status
          ]);
          
          console.log(`   ✅ Paciente criado: ${paciente.nome}`);
        } else {
          console.log(`   ⚠️  Paciente já existe: ${paciente.nome}`);
        }
      }
    }

    // 4. Verificar resultado final
    console.log('\n📊 Verificando resultado final...');
    
    for (const medico of medicos) {
      const [pacientes] = await connection.execute(`
        SELECT 
          p.id, p.Paciente_Nome, p.status,
          pr.nome as prestador_nome
        FROM Pacientes_Clinica p
        LEFT JOIN Prestadores pr ON p.Prestador = pr.id
        WHERE p.clinica_id = ? 
          AND p.Prestador IN (
            SELECT pr.id FROM Prestadores pr 
            INNER JOIN Medicos_Mobile m ON pr.crm = m.crm
            WHERE m.id = ? AND m.clinica_id = ?
          )
      `, [medico.clinica_id, medico.id, medico.clinica_id]);

      console.log(`\n👨‍⚕️ ${medico.nome} tem ${pacientes.length} pacientes:`);
      pacientes.forEach((paciente, index) => {
        console.log(`   ${index + 1}. ${paciente.Paciente_Nome} - ${paciente.status} - Dr. ${paciente.prestador_nome}`);
      });
    }

    console.log('\n🎉 Dados de teste criados com sucesso!');
    console.log('\n📋 INSTRUÇÕES PARA TESTE NO FRONTEND:');
    console.log('1. Faça login com qualquer médico listado acima');
    console.log('2. Vá para a tela de Pacientes');
    console.log('3. Você deve ver apenas os pacientes associados ao médico logado');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Conexão fechada');
    }
  }
}

createTestPacientesMedico();
