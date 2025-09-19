import { Request, Response } from 'express';
import { query } from '../config/database';
import { AgendamentoStats } from '../models/AgendamentoModel';

export class AgendamentoControllerSimple {
  
  // Listar agendamentos de forma simplificada
  static async list(req: Request, res: Response) {
    try {
      const {
        data_inicio,
        data_fim,
        page = 1,
        limit = 50
      } = req.query as any;

      console.log('🔍 Recebendo requisição de agendamentos...');
      console.log('Query params:', { data_inicio, data_fim, page, limit });

      // Usar clínica ID 1 por padrão para teste
      const clinicaId = 1;
      
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
        WHERE a.clinica_id = ?
      `;
      
      const params = [clinicaId];

      // Adicionar filtros de data se fornecidos
      if (data_inicio) {
        sql += ' AND a.data_agendamento >= ?';
        params.push(data_inicio);
      }

      if (data_fim) {
        sql += ' AND a.data_agendamento <= ?';
        params.push(data_fim);
      }

      sql += ' ORDER BY a.data_agendamento ASC, a.horario_inicio ASC';
      
      // Só aplicar limite se não há filtros específicos
      if (!data_inicio && !data_fim) {
        sql += ` LIMIT ${parseInt(limit)}`;
      }

      console.log('📋 Executando query:', sql);
      console.log('📋 Parâmetros:', params);

      const agendamentos = await query(sql, params);

      console.log(`✅ ${agendamentos.length} agendamentos encontrados`);

      res.json({
        success: true,
        data: agendamentos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: agendamentos.length
        }
      });

    } catch (error) {
      console.error('❌ Erro ao listar agendamentos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Buscar agendamento por ID
  static async show(req: Request, res: Response) {
    try {
      const { id } = req.params;

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
        WHERE a.id = ?
      `;

      const agendamentos = await query(sql, [parseInt(id)]);

      if (agendamentos.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Agendamento não encontrado'
        });
      }

      res.json({
        success: true,
        data: agendamentos[0]
      });

    } catch (error) {
      console.error('❌ Erro ao buscar agendamento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Atualizar status do agendamento
  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, observacoes, motivo_cancelamento } = req.body;

      console.log(`🔄 Atualizando agendamento ${id}:`, { status, observacoes, motivo_cancelamento });

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

      sql += ' WHERE id = ?';
      params.push(parseInt(id));

      await query(sql, params);

      console.log('✅ Agendamento atualizado com sucesso');

      res.json({
        success: true,
        message: 'Agendamento atualizado com sucesso'
      });

    } catch (error) {
      console.error('❌ Erro ao atualizar agendamento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  // Estatísticas dos agendamentos
  static async stats(req: Request, res: Response) {
    try {
      console.log('📊 Recebendo requisição de estatísticas de agendamentos...');

      const hoje = new Date().toISOString().split('T')[0];
      const inicioSemana = new Date();
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(fimSemana.getDate() + 6);

      // Total de agendamentos
      const [totalResult] = await query('SELECT COUNT(*) as total FROM Agendamentos WHERE clinica_id = ?', [1]);
      
      // Agendamentos hoje
      const [hojeResult] = await query('SELECT COUNT(*) as total FROM Agendamentos WHERE clinica_id = ? AND data_agendamento = ?', [1, hoje]);
      
      // Agendamentos esta semana
      const [semanaResult] = await query(
        'SELECT COUNT(*) as total FROM Agendamentos WHERE clinica_id = ? AND data_agendamento BETWEEN ? AND ?',
        [1, inicioSemana.toISOString().split('T')[0], fimSemana.toISOString().split('T')[0]]
      );

      // Por status
      const statusStats = await query(`
        SELECT status, COUNT(*) as count 
        FROM Agendamentos 
        WHERE clinica_id = ?
        GROUP BY status
      `, [1]);

      // Por tipo
      const tipoStats = await query(`
        SELECT tipo_consulta, COUNT(*) as count 
        FROM Agendamentos 
        WHERE clinica_id = ?
        GROUP BY tipo_consulta
      `, [1]);

      const stats: AgendamentoStats = {
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

      console.log('✅ Estatísticas carregadas:', stats);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
}
