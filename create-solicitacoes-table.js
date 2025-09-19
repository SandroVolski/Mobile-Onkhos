const mysql = require('mysql2/promise');

const connectionConfig = {
  host: '191.252.1.143',
  user: 'douglas',
  password: 'Douglas193',
  database: 'bd_sistema_clinicas',
  port: 3306
};

async function createSolicitacoesTable() {
  let connection;
  
  try {
    console.log('🔌 Conectando ao banco de dados...');
    connection = await mysql.createConnection(connectionConfig);
    console.log('✅ Conectado com sucesso!');
    
    // SQL para criar a tabela Solicitacoes
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS Solicitacoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        paciente_id INT NOT NULL,
        protocolo VARCHAR(500) NOT NULL,
        cid VARCHAR(20) NOT NULL,
        prioridade ENUM('Alta', 'Média', 'Baixa') NOT NULL DEFAULT 'Média',
        status ENUM('Pendente', 'Aprovada', 'Rejeitada', 'Em Análise') NOT NULL DEFAULT 'Pendente',
        data_submissao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        data_aprovacao DATETIME NULL,
        data_rejeicao DATETIME NULL,
        observacoes TEXT NULL,
        justificativa_rejeicao TEXT NULL,
        clinica_id INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_paciente_id (paciente_id),
        INDEX idx_status (status),
        INDEX idx_prioridade (prioridade),
        INDEX idx_clinica_id (clinica_id),
        INDEX idx_data_submissao (data_submissao),
        FOREIGN KEY (paciente_id) REFERENCES Pacientes_Clinica(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    
    console.log('📋 Criando tabela Solicitacoes...');
    await connection.execute(createTableSQL);
    console.log('✅ Tabela Solicitacoes criada com sucesso!');
    
    // Inserir alguns dados de exemplo
    const insertSampleDataSQL = `
      INSERT INTO Solicitacoes (paciente_id, protocolo, cid, prioridade, status, observacoes, clinica_id) VALUES
      (1, 'Pembrolizumab + Carboplatina', 'C78.2', 'Alta', 'Pendente', 'Paciente com progressão da doença, necessita início urgente', 1),
      (2, 'Trastuzumab + Pertuzumab + Docetaxel', 'C50.9', 'Média', 'Pendente', 'Primeira linha de tratamento, HER2 positivo', 1),
      (3, 'Nivolumab monoterapia', 'C78.1', 'Baixa', 'Aprovada', 'Segunda linha após falha com quimioterapia', 1),
      (4, 'Carboplatin + Pemetrexed', 'C78.0', 'Média', 'Aprovada', 'Aprovado com ajuste de dose por idade', 1),
      (5, 'Atezolizumab + Bevacizumab', 'C78.1', 'Alta', 'Rejeitada', 'Ausência de biomarcadores indicados para o protocolo', 1);
    `;
    
    console.log('📝 Inserindo dados de exemplo...');
    await connection.execute(insertSampleDataSQL);
    console.log('✅ Dados de exemplo inseridos com sucesso!');
    
    // Verificar se a tabela foi criada corretamente
    const [rows] = await connection.execute('SELECT COUNT(*) as total FROM Solicitacoes');
    console.log(`📊 Total de solicitações na tabela: ${rows[0].total}`);
    
    // Mostrar algumas solicitações
    const [solicitacoes] = await connection.execute('SELECT * FROM Solicitacoes LIMIT 3');
    console.log('📋 Primeiras 3 solicitações:');
    solicitacoes.forEach(sol => {
      console.log(`  - ID: ${sol.id}, Paciente: ${sol.paciente_id}, Protocolo: ${sol.protocolo}, Status: ${sol.status}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.code === 'ER_TABLE_EXISTS') {
      console.log('ℹ️  Tabela já existe, continuando...');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão encerrada');
    }
  }
}

// Executar o script
createSolicitacoesTable();
