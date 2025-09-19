const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_clinicas',
  port: process.env.DB_PORT || 3306
};

async function createTestSolicitacoes() {
  let connection;

  try {
    console.log('🔍 Criando solicitações de teste para médicos mobile...');
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao banco de dados');

    // Buscar médicos mobile
    const [medicos] = await connection.execute(`
      SELECT id, nome, email, crm, clinica_id 
      FROM Medicos_Mobile 
      WHERE status = 'ativo'
      ORDER BY nome
    `);

    console.log(`\n👨‍⚕️ Médicos encontrados: ${medicos.length}`);

    // Buscar pacientes para associar
    const [pacientes] = await connection.execute(`
      SELECT id, Paciente_Nome, cpf, telefone, email
      FROM Pacientes_Clinica 
      WHERE status = 'ativo'
      LIMIT 5
    `);

    console.log(`\n👥 Pacientes encontrados: ${pacientes.length}`);

    if (pacientes.length === 0) {
      console.log('❌ Nenhum paciente encontrado. Criando pacientes de teste...');
      
      // Criar pacientes de teste
      const pacientesTeste = [
        { nome: 'João Silva Santos', cpf: '12345678901', telefone: '11999999999', email: 'joao@teste.com' },
        { nome: 'Maria Oliveira Costa', cpf: '98765432100', telefone: '11888888888', email: 'maria@teste.com' },
        { nome: 'Pedro Souza Lima', cpf: '11122233344', telefone: '11777777777', email: 'pedro@teste.com' }
      ];

      for (const paciente of pacientesTeste) {
        await connection.execute(`
          INSERT INTO Pacientes_Clinica (Paciente_Nome, cpf, telefone, email, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, 'ativo', NOW(), NOW())
        `, [paciente.nome, paciente.cpf, paciente.telefone, paciente.email]);
      }

      // Buscar pacientes novamente
      const [novosPacientes] = await connection.execute(`
        SELECT id, Paciente_Nome, cpf, telefone, email
        FROM Pacientes_Clinica 
        WHERE status = 'ativo'
        ORDER BY id DESC
        LIMIT 3
      `);
      
      console.log(`✅ ${novosPacientes.length} pacientes de teste criados`);
    }

    // Buscar pacientes novamente
    const [pacientesFinais] = await connection.execute(`
      SELECT id, Paciente_Nome, cpf, telefone, email
      FROM Pacientes_Clinica 
      WHERE status = 'ativo'
      ORDER BY id DESC
      LIMIT 3
    `);

    // Criar solicitações de teste para cada médico
    let totalCriadas = 0;
    
    for (const medico of medicos) {
      console.log(`\n📋 Criando solicitações para ${medico.nome} (CRM: ${medico.crm})...`);
      
      // Criar 2-3 solicitações por médico
      const numSolicitacoes = Math.floor(Math.random() * 3) + 2;
      
      for (let i = 0; i < numSolicitacoes; i++) {
        const paciente = pacientesFinais[i % pacientesFinais.length];
        const statuses = ['pendente', 'aprovada', 'rejeitada', 'em_analise'];
        const finalidades = ['neoadjuvante', 'adjuvante', 'curativo', 'controle', 'radioterapia', 'paliativo'];
        const medicamentos = ['Cisplatina', 'Carboplatina', 'Paclitaxel', 'Docetaxel', '5-Fluorouracil'];
        
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const finalidade = finalidades[Math.floor(Math.random() * finalidades.length)];
        const medicamento = medicamentos[Math.floor(Math.random() * medicamentos.length)];
        
        const solicitacao = {
          clinica_id: medico.clinica_id,
          paciente_id: paciente.id,
          hospital_nome: 'Hospital Teste',
          hospital_codigo: 'HT001',
          cliente_nome: 'Cliente Teste',
          cliente_codigo: 'CT001',
          sexo: Math.random() > 0.5 ? 'M' : 'F',
          data_nascimento: '1980-01-01',
          idade: 40 + Math.floor(Math.random() * 20),
          data_solicitacao: new Date().toISOString().split('T')[0],
          diagnostico_cid: 'C78.0',
          diagnostico_descricao: 'Neoplasia maligna secundária do pulmão',
          finalidade: finalidade,
          performance_status: '0',
          ciclos_previstos: 6,
          ciclo_atual: 1,
          superficie_corporal: 1.7,
          peso: 70 + Math.floor(Math.random() * 20),
          altura: 160 + Math.floor(Math.random() * 20),
          medicamentos_antineoplasticos: medicamento,
          dose_por_m2: '75 mg/m²',
          dose_total: '127.5 mg',
          via_administracao: 'EV',
          dias_aplicacao_intervalo: '21 dias',
          medico_assinatura_crm: medico.crm,
          status: status,
          observacoes: `Solicitação de teste para ${medico.nome}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        await connection.execute(`
          INSERT INTO Solicitacoes_Autorizacao (
            clinica_id, paciente_id, hospital_nome, hospital_codigo, cliente_nome, cliente_codigo,
            sexo, data_nascimento, idade, data_solicitacao, diagnostico_cid, diagnostico_descricao,
            finalidade, performance_status, ciclos_previstos, ciclo_atual, superficie_corporal,
            peso, altura, medicamentos_antineoplasticos, dose_por_m2, dose_total, via_administracao,
            dias_aplicacao_intervalo, medico_assinatura_crm, status, observacoes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          solicitacao.clinica_id, solicitacao.paciente_id, solicitacao.hospital_nome, solicitacao.hospital_codigo,
          solicitacao.cliente_nome, solicitacao.cliente_codigo, solicitacao.sexo, solicitacao.data_nascimento,
          solicitacao.idade, solicitacao.data_solicitacao, solicitacao.diagnostico_cid, solicitacao.diagnostico_descricao,
          solicitacao.finalidade, solicitacao.performance_status, solicitacao.ciclos_previstos, solicitacao.ciclo_atual,
          solicitacao.superficie_corporal, solicitacao.peso, solicitacao.altura, solicitacao.medicamentos_antineoplasticos,
          solicitacao.dose_por_m2, solicitacao.dose_total, solicitacao.via_administracao, solicitacao.dias_aplicacao_intervalo,
          solicitacao.medico_assinatura_crm, solicitacao.status, solicitacao.observacoes, solicitacao.created_at, solicitacao.updated_at
        ]);

        totalCriadas++;
        console.log(`   ✅ Solicitação ${i + 1} criada - Status: ${status}, Finalidade: ${finalidade}`);
      }
    }

    console.log(`\n🎉 Total de solicitações criadas: ${totalCriadas}`);
    
    // Verificar resultado
    const [verificacao] = await connection.execute(`
      SELECT 
        m.nome as medico_nome,
        m.crm,
        COUNT(s.id) as total_solicitacoes
      FROM Medicos_Mobile m
      LEFT JOIN Solicitacoes_Autorizacao s ON m.crm = s.medico_assinatura_crm AND m.clinica_id = s.clinica_id
      WHERE m.status = 'ativo'
      GROUP BY m.id, m.nome, m.crm
      ORDER BY total_solicitacoes DESC
    `);

    console.log('\n📊 Resumo por médico:');
    verificacao.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.medico_nome} (${item.crm}): ${item.total_solicitacoes} solicitações`);
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    if (connection) await connection.end();
    console.log('\n🔌 Conexão fechada');
  }
}

createTestSolicitacoes();
