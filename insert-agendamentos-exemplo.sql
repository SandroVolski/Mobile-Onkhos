-- Script para inserir dados de exemplo na tabela Agendamentos
-- Execute este script no seu banco de dados MySQL

-- Inserir alguns agendamentos de exemplo
INSERT INTO Agendamentos (
    clinica_id, paciente_id, medico_id, data_agendamento, 
    horario_inicio, horario_fim, tipo_consulta, status, 
    local, observacoes, created_at, updated_at
) VALUES
-- Agendamentos para hoje
(1, 1, 1, CURDATE(), '14:30:00', '15:00:00', 'primeira_consulta', 'agendada', 'Consultório 3A', 'Primeira consulta - trazer exames', NOW(), NOW()),
(1, 2, 1, CURDATE(), '15:15:00', '16:00:00', 'retorno', 'confirmada', 'Consultório 3A', 'Avaliar resposta ao tratamento', NOW(), NOW()),
(1, 3, 1, CURDATE(), '16:00:00', '16:30:00', 'seguimento', 'agendada', 'Consultório 3A', 'Revisão pós-cirúrgica', NOW(), NOW()),

-- Agendamentos para amanhã
(1, 4, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00', '10:00:00', 'primeira_consulta', 'agendada', 'Consultório 3A', 'Consulta inicial', NOW(), NOW()),
(1, 5, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00', '14:30:00', 'retorno', 'agendada', 'Consultório 3A', 'Acompanhamento', NOW(), NOW()),

-- Agendamentos para esta semana
(1, 1, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:30:00', '11:30:00', 'quimioterapia', 'agendada', 'Sala de Quimio 1', 'Ciclo 2 de quimioterapia', NOW(), NOW()),
(1, 2, 1, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '15:00:00', '15:30:00', 'radioterapia', 'agendada', 'Sala de Radio', 'Sessão de radioterapia', NOW(), NOW()),

-- Agendamentos passados (para estatísticas)
(1, 3, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', '09:30:00', 'retorno', 'concluida', 'Consultório 3A', 'Consulta realizada com sucesso', NOW(), NOW()),
(1, 4, 1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '14:30:00', '15:30:00', 'primeira_consulta', 'concluida', 'Consultório 3A', 'Primeira consulta finalizada', NOW(), NOW()),
(1, 5, 1, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '16:00:00', '16:45:00', 'emergencia', 'concluida', 'Consultório 3A', 'Atendimento de emergência', NOW(), NOW());

-- Verificar se os dados foram inseridos
SELECT 
    a.*,
    p.Paciente_Nome as paciente_nome,
    rt.nome as medico_nome,
    c.nome as clinica_nome
FROM Agendamentos a
LEFT JOIN Pacientes_Clinica p ON a.paciente_id = p.id
LEFT JOIN Responsaveis_Tecnicos rt ON a.medico_id = rt.id
LEFT JOIN Clinicas c ON a.clinica_id = c.id
ORDER BY a.data_agendamento DESC, a.horario_inicio ASC
LIMIT 20;
