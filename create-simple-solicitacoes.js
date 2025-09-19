const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_clinicas',
  port: process.env.DB_PORT || 3306
};

async function createSimpleSolicitacoes() {
  let connection;

  try {
    console.log('🔍 Criando solicitações de teste simples...');
    
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

    // Buscar pacientes existentes (sem filtro de status)
    const [pacientes] = await connection.execute(`
      SELECT id, Paciente_Nome, cpf, telefone, email
      FROM Pacientes_Clinica 
      LIMIT 5
    `);

    console.log(`\n👥 Pacientes encontrados: ${pacientes.length}`);

    if (pacientes.length === 0) {
      console.log('❌ Nenhum paciente encontrado. Criando pacientes básicos...');
      
      // Criar pacientes básicos sem campo status
      const pacientesTeste = [
        { nome: 'João Silva Santos', cpf: '12345678901', telefone: '11999999999', email: 'joao@teste.com' },
        { nome: 'Maria Oliveira Costa', cpf: '98765432100', telefone: '11888888888', email: 'maria@teste.com' },
        { nome: 'Pedro Souza Lima', cpf: '11122233344', telefone: '11777777777', email: 'pedro@teste.com' }
      ];

      for (const paciente of pacientesTeste) {
        await connection.execute(`
          INSERT INTO Pacientes_Clinica (Paciente_Nome, cpf, telefone, email, created_at, updated_at)
          VALUES (?, ?, ?, ?, NOW(), NOW())
        `, [paciente.nome, paciente.cpf, paciente.telefone, paciente.email]);
      }

      // Buscar pacientes novamente
      const [novosPacientes] = await connection.execute(`
        SELECT id, Paciente_Nome, cpf, telefone, email
        FROM Pacientes_Clinica 
        ORDER BY id DESC
        LIMIT 3
      `);
      
      console.log(`✅ ${novosPacientes.length} pacientes básicos criados`);
    }

    // Buscar pacientes finais
    const [pacientesFinais] = await connection.execute(`
      SELECT id, Paciente_Nome, cpf, telefone, email
      FROM Pacientes_Clinica 
      ORDER BY id DESC
      LIMIT 3
    `);

    // Criar solicitações de teste para o Dr. Carlos Lima (que usamos no login)
    const carlosLima = medicos.find(m => m.email === 'carlos.lima@clinica-rj.com');
    
    if (carlosLima) {
      console.log(`\n📋 Criando solicitações para ${carlosLima.nome} (CRM: ${carlosLima.crm})...`);
      
      const statuses = ['pendente', 'aprovada', 'rejeitada', 'em_analise'];
      const finalidades = ['neoadjuvante', 'adjuvante', 'curativo', 'controle', 'radioterapia', 'paliativo'];
      const medicamentos = ['Cisplatina', 'Carboplatina', 'Paclitaxel', 'Docetaxel', '5-Fluorouracil'];
      
      for (let i = 0; i < 3; i++) {
        const paciente = pacientesFinais[i % pacientesFinais.length];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const finalidade = finalidades[Math.floor(Math.random() * finalidades.length)];
        const medicamento = medicamentos[Math.floor(Math.random() * medicamentos.length)];
        
        await connection.execute(`
          INSERT INTO Solicitacoes_Autorizacao (
            clinica_id, paciente_id, hospital_nome, hospital_codigo, cliente_nome, cliente_codigo,
            sexo, data_nascimento, idade, data_solicitacao, diagnostico_cid, diagnostico_descricao,
            finalidade, performance_status, ciclos_previstos, ciclo_atual, superficie_corporal,
            peso, altura, medicamentos_antineoplasticos, dose_por_m2, dose_total, via_administracao,
            dias_aplicacao_intervalo, medico_assinatura_crm, status, observacoes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          carlosLima.clinica_id, paciente.id, 'Hospital Teste', 'HT001', 'Cliente Teste', 'CT001',
          'M', '1980-01-01', 45, new Date().toISOString().split('T')[0], 'C78.0', 'Neoplasia maligna secundária do pulmão',
          finalidade, '0', 6, 1, 1.7, 70, 170, medicamento, '75 mg/m²', '127.5 mg', 'EV',
          '21 dias', carlosLima.crm, status, `Solicitação de teste ${i + 1} para ${carlosLima.nome}`
        ]);

        console.log(`   ✅ Solicitação ${i + 1} criada - Status: ${status}, Finalidade: ${finalidade}`);
      }
    }

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

createSimpleSolicitacoes();
