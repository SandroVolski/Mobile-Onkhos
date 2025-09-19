import { Request, Response } from 'express';
import { query } from '../config/database';
import { ApiResponse } from '../types';

interface AuthRequest extends Request {
  user?: {
    id: number;
    clinica_id: number;
    nome: string;
    email: string;
    crm: string;
  };
}

// Listar agendamentos do médico logado
export const getAgendamentos = async (req: AuthRequest, res: Response) => {
  try {
    const medicoId = req.user?.id;
    const clinicaId = req.user?.clinica_id;

    if (!medicoId || !clinicaId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado ou dados incompletos'
      });
    }

      const {
        data_inicio,
        data_fim,
      page = 1,
      limit = 50,
        status,
      tipo_consulta
      } = req.query as any;

    console.log('🔍 Buscando agendamentos para médico:', { medicoId, clinicaId, data_inicio, data_fim });

    let sql = `
      SELECT 
        a.*,
        p.Paciente_Nome as paciente_nome,
        p.telefone as paciente_telefone,
        p.email as paciente_email,
        rt.nome as medico_nome,
        rt.crm as medico_crm,
        rt.especialidade as medico_especialidade,
        c.nome as clinica_nome
      FROM Agendamentos a
      LEFT JOIN Pacientes_Clinica p ON a.paciente_id = p.id
      LEFT JOIN Responsaveis_Tecnicos rt ON a.medico_id = rt.id
      LEFT JOIN Clinicas c ON a.clinica_id = c.id
      WHERE a.clinica_id = ? AND a.medico_id = ?
    `;
    
    const params = [clinicaId, medicoId];

    // Adicionar filtros de data se fornecidos
      if (data_inicio) {
      sql += ' AND a.data_agendamento >= ?';
        params.push(data_inicio);
      }

      if (data_fim) {
      sql += ' AND a.data_agendamento <= ?';
        params.push(data_fim);
      }

    // Filtro por status
      if (status) {
      sql += ' AND a.status = ?';
        params.push(status);
      }

    // Filtro por tipo de consulta
      if (tipo_consulta) {
      sql += ' AND a.tipo_consulta = ?';
        params.push(tipo_consulta);
      }

    sql += ' ORDER BY a.data_agendamento ASC, a.horario_inicio ASC';
    
    // Aplicar paginação
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ` LIMIT ${parseInt(limit)} OFFSET ${offset}`;

    console.log('📋 Executando query:', sql);
    console.log('📋 Parâmetros:', params);

      const agendamentos = await query(sql, params);

    // Buscar total para paginação
    let countSql = `
        SELECT COUNT(*) as total
        FROM Agendamentos a
      WHERE a.clinica_id = ? AND a.medico_id = ?
    `;
    
    const countParams = [clinicaId, medicoId];

    if (data_inicio) {
      countSql += ' AND a.data_agendamento >= ?';
      countParams.push(data_inicio);
    }

    if (data_fim) {
      countSql += ' AND a.data_agendamento <= ?';
      countParams.push(data_fim);
    }

    if (status) {
      countSql += ' AND a.status = ?';
      countParams.push(status);
    }

    if (tipo_consulta) {
      countSql += ' AND a.tipo_consulta = ?';
      countParams.push(tipo_consulta);
    }

    const [countResult] = await query(countSql, countParams);
      const total = countResult.total;

    console.log(`✅ ${agendamentos.length} agendamentos encontrados de ${total} total`);

    const response: ApiResponse = {
        success: true,
      message: 'Agendamentos carregados com sucesso',
      data: {
        data: agendamentos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    };

    res.json(response);

    } catch (error) {
    console.error('❌ Erro ao buscar agendamentos:', error);
      res.status(500).json({
        success: false,
      message: 'Erro interno do servidor'
      });
    }
};

// Buscar agendamento específico do médico logado
export const getAgendamentoById = async (req: AuthRequest, res: Response) => {
    try {
    const medicoId = req.user?.id;
    const clinicaId = req.user?.clinica_id;
      const { id } = req.params;

    if (!medicoId || !clinicaId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado ou dados incompletos'
      });
    }

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID do agendamento inválido'
      });
    }

    console.log('🔍 Buscando agendamento específico para médico:', { id, medicoId, clinicaId });

      const sql = `
        SELECT 
          a.*,
          p.Paciente_Nome as paciente_nome,
          p.telefone as paciente_telefone,
          p.email as paciente_email,
          rt.nome as medico_nome,
          rt.crm as medico_crm,
          rt.especialidade as medico_especialidade,
          c.nome as clinica_nome
        FROM Agendamentos a
        LEFT JOIN Pacientes_Clinica p ON a.paciente_id = p.id
        LEFT JOIN Responsaveis_Tecnicos rt ON a.medico_id = rt.id
        LEFT JOIN Clinicas c ON a.clinica_id = c.id
      WHERE a.id = ? AND a.clinica_id = ? AND a.medico_id = ?
      `;

    const [agendamentos] = await query(sql, [parseInt(id), clinicaId, medicoId]);

      if (agendamentos.length === 0) {
        return res.status(404).json({
          success: false,
        message: 'Agendamento não encontrado ou não pertence ao médico'
        });
      }

    console.log('✅ Agendamento encontrado:', agendamentos[0].paciente_nome);

    const response: ApiResponse = {
        success: true,
      message: 'Agendamento encontrado com sucesso',
        data: agendamentos[0]
    };

    res.json(response);

    } catch (error) {
    console.error('❌ Erro ao buscar agendamento específico:', error);
      res.status(500).json({
        success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Estatísticas de agendamentos do médico logado
export const getAgendamentoStats = async (req: AuthRequest, res: Response) => {
  try {
    const medicoId = req.user?.id;
    const clinicaId = req.user?.clinica_id;

    if (!medicoId || !clinicaId) {
      return res.status(401).json({
          success: false,
        message: 'Usuário não autenticado ou dados incompletos'
      });
    }

    console.log('📊 Buscando estatísticas de agendamentos para médico:', { medicoId, clinicaId });

      const hoje = new Date().toISOString().split('T')[0];
      const inicioSemana = new Date();
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(fimSemana.getDate() + 6);

      // Total de agendamentos
    const [totalResult] = await query(
      'SELECT COUNT(*) as total FROM Agendamentos WHERE clinica_id = ? AND medico_id = ?', 
      [clinicaId, medicoId]
    );
      
      // Agendamentos hoje
    const [hojeResult] = await query(
      'SELECT COUNT(*) as total FROM Agendamentos WHERE clinica_id = ? AND medico_id = ? AND data_agendamento = ?', 
      [clinicaId, medicoId, hoje]
    );
      
      // Agendamentos esta semana
      const [semanaResult] = await query(
      'SELECT COUNT(*) as total FROM Agendamentos WHERE clinica_id = ? AND medico_id = ? AND data_agendamento BETWEEN ? AND ?',
      [clinicaId, medicoId, inicioSemana.toISOString().split('T')[0], fimSemana.toISOString().split('T')[0]]
      );

      // Por status
      const statusStats = await query(`
        SELECT status, COUNT(*) as count 
        FROM Agendamentos 
      WHERE clinica_id = ? AND medico_id = ?
        GROUP BY status
    `, [clinicaId, medicoId]);

      // Por tipo
      const tipoStats = await query(`
        SELECT tipo_consulta, COUNT(*) as count 
        FROM Agendamentos 
      WHERE clinica_id = ? AND medico_id = ?
        GROUP BY tipo_consulta
    `, [clinicaId, medicoId]);

    const stats = {
        total_agendamentos: totalResult.total,
        agendamentos_hoje: hojeResult.total,
        agendamentos_semana: semanaResult.total,
        por_status: {
          agendada: 0,
          confirmada: 0,
          em_andamento: 0,
          concluida: 0,
          cancelada: 0,
          reagendada: 0
        },
        por_tipo: {
          primeira_consulta: 0,
          retorno: 0,
          quimioterapia: 0,
          radioterapia: 0,
          cirurgia: 0,
          seguimento: 0,
          emergencia: 0
        }
      };

      // Preencher estatísticas por status
      statusStats.forEach((item: any) => {
        if (stats.por_status.hasOwnProperty(item.status)) {
          (stats.por_status as any)[item.status] = item.count;
        }
      });

      // Preencher estatísticas por tipo
      tipoStats.forEach((item: any) => {
        if (stats.por_tipo.hasOwnProperty(item.tipo_consulta)) {
          (stats.por_tipo as any)[item.tipo_consulta] = item.count;
        }
      });

    console.log('📊 Estatísticas encontradas:', stats);

    const response: ApiResponse = {
        success: true,
      message: 'Estatísticas carregadas com sucesso',
        data: stats
    };

    res.json(response);

    } catch (error) {
    console.error('❌ Erro ao buscar estatísticas de agendamentos:', error);
      res.status(500).json({
        success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar agendamento do médico logado
export const updateAgendamento = async (req: AuthRequest, res: Response) => {
  try {
    const medicoId = req.user?.id;
    const clinicaId = req.user?.clinica_id;
    const { id } = req.params;
    const { status, observacoes, motivo_cancelamento } = req.body;

    if (!medicoId || !clinicaId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado ou dados incompletos'
      });
    }

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID do agendamento inválido'
      });
    }

    console.log(`🔄 Atualizando agendamento ${id} para médico ${medicoId}:`, { status, observacoes, motivo_cancelamento });

    // Verificar se o agendamento pertence ao médico
    const [agendamentoCheck] = await query(
      'SELECT id FROM Agendamentos WHERE id = ? AND clinica_id = ? AND medico_id = ?',
      [parseInt(id), clinicaId, medicoId]
    );

    if (agendamentoCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Agendamento não encontrado ou não pertence ao médico'
      });
    }

    let sql = 'UPDATE Agendamentos SET updated_at = NOW()';
    const params = [];

    if (status) {
      sql += ', status = ?';
      params.push(status);
      
      if (status === 'cancelada') {
        sql += ', data_cancelamento = NOW()';
      }
    }

    if (observacoes !== undefined) {
      sql += ', observacoes = ?';
      params.push(observacoes);
    }

    if (motivo_cancelamento !== undefined) {
      sql += ', motivo_cancelamento = ?';
      params.push(motivo_cancelamento);
    }

    sql += ' WHERE id = ? AND clinica_id = ? AND medico_id = ?';
    params.push(parseInt(id), clinicaId, medicoId);

    await query(sql, params);

    console.log('✅ Agendamento atualizado com sucesso');

    const response: ApiResponse = {
      success: true,
      message: 'Agendamento atualizado com sucesso'
    };

    res.json(response);

  } catch (error) {
    console.error('❌ Erro ao atualizar agendamento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Criar novo agendamento para o médico logado
export const createAgendamento = async (req: AuthRequest, res: Response) => {
  try {
    const medicoId = req.user?.id;
    const clinicaId = req.user?.clinica_id;
    const agendamentoData = req.body;

    if (!medicoId || !clinicaId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado ou dados incompletos'
      });
    }

    console.log('📝 Criando agendamento para médico:', { medicoId, clinicaId, agendamentoData });

    // Validar dados obrigatórios
    const { data_agendamento, horario_inicio, tipo_consulta, status } = agendamentoData;

    if (!data_agendamento || !horario_inicio || !tipo_consulta || !status) {
      return res.status(400).json({
        success: false,
        message: 'Dados obrigatórios não fornecidos'
      });
    }

    // Criar agendamento
    const sql = `
      INSERT INTO Agendamentos (
        clinica_id, medico_id, paciente_id, data_agendamento, 
        horario_inicio, horario_fim, tipo_consulta, status, 
        local, observacoes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const params = [
      clinicaId,
      medicoId,
      agendamentoData.paciente_id || null,
      data_agendamento,
      horario_inicio,
      agendamentoData.horario_fim || null,
      tipo_consulta,
      status,
      agendamentoData.local || 'Consultório Principal',
      agendamentoData.observacoes || null
    ];

    const [result] = await query(sql, params);
    const agendamentoId = result.insertId;

    console.log('✅ Agendamento criado com sucesso:', agendamentoId);

    const response: ApiResponse = {
      success: true,
      message: 'Agendamento criado com sucesso',
      data: { id: agendamentoId }
    };

    res.status(201).json(response);

    } catch (error) {
    console.error('❌ Erro ao criar agendamento:', error);
      res.status(500).json({
        success: false,
      message: 'Erro interno do servidor'
      });
    }
};