-- Criar tabela específica para médicos do aplicativo mobile
CREATE TABLE IF NOT EXISTS Medicos_Mobile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clinica_id INT NOT NULL,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    crm VARCHAR(50) NOT NULL,
    especialidade VARCHAR(100),
    telefone VARCHAR(20),
    status ENUM('ativo', 'inativo') DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Chave estrangeira para clínica
    FOREIGN KEY (clinica_id) REFERENCES Clinicas(id) ON DELETE CASCADE,
    
    -- Índices para performance
    INDEX idx_clinica_id (clinica_id),
    INDEX idx_email (email),
    INDEX idx_crm (crm),
    INDEX idx_status (status)
);

-- Inserir médicos de teste para diferentes clínicas
INSERT INTO Medicos_Mobile (clinica_id, nome, email, crm, especialidade, telefone, status) VALUES
-- Clínica 1 (São Paulo)
(1, 'Dr. João Silva', 'joao.silva@clinica-sp.com', '123456-SP', 'Oncologia Clínica', '(11) 99999-1111', 'ativo'),
(1, 'Dra. Maria Santos', 'maria.santos@clinica-sp.com', '789012-SP', 'Radioterapia', '(11) 99999-2222', 'ativo'),
(1, 'Dr. Pedro Costa', 'pedro.costa@clinica-sp.com', '345678-SP', 'Cirurgia Oncológica', '(11) 99999-3333', 'ativo'),

-- Clínica 2 (Rio de Janeiro) - Assumindo que existe
(2, 'Dra. Ana Oliveira', 'ana.oliveira@clinica-rj.com', '111111-RJ', 'Oncologia Clínica', '(21) 88888-1111', 'ativo'),
(2, 'Dr. Carlos Lima', 'carlos.lima@clinica-rj.com', '222222-RJ', 'Radioterapia', '(21) 88888-2222', 'ativo'),

-- Clínica 3 (Belo Horizonte) - Assumindo que existe
(3, 'Dra. Fernanda Rocha', 'fernanda.rocha@clinica-bh.com', '333333-MG', 'Oncologia Clínica', '(31) 77777-1111', 'ativo'),
(3, 'Dr. Roberto Alves', 'roberto.alves@clinica-bh.com', '444444-MG', 'Cirurgia Oncológica', '(31) 77777-2222', 'ativo');

-- Verificar se as clínicas existem, se não, criar algumas de teste
INSERT IGNORE INTO Clinicas (id, nome, codigo, cnpj, endereco, cidade, estado, cep, telefone, email, status, created_at, updated_at) VALUES
(1, 'Clínica Onco São Paulo', 'ONCO-SP', '12.345.678/0001-90', 'Rua das Flores, 123', 'São Paulo', 'SP', '01234-567', '(11) 99999-0000', 'contato@onco-sp.com', 'ativo', NOW(), NOW()),
(2, 'Clínica Onco Rio de Janeiro', 'ONCO-RJ', '23.456.789/0001-91', 'Av. Copacabana, 456', 'Rio de Janeiro', 'RJ', '22000-000', '(21) 88888-0000', 'contato@onco-rj.com', 'ativo', NOW(), NOW()),
(3, 'Clínica Onco Belo Horizonte', 'ONCO-BH', '34.567.890/0001-92', 'Rua Savassi, 789', 'Belo Horizonte', 'MG', '30112-000', '(31) 77777-0000', 'contato@onco-bh.com', 'ativo', NOW(), NOW());

-- Mostrar os médicos criados
SELECT 
    m.id,
    m.nome,
    m.email,
    m.crm,
    m.especialidade,
    c.nome as clinica_nome,
    m.status
FROM Medicos_Mobile m
JOIN Clinicas c ON m.clinica_id = c.id
ORDER BY m.clinica_id, m.nome;
