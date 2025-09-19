import { Request, Response } from 'express';
import { SolicitacaoModel } from '../models/SolicitacaoModel';
import { ApiResponse } from '../types';

interface AuthRequest extends Request {
  user?: any;
}

// GET /api/mobile/solicitacoes - Listar solicitações do médico logado
export const getSolicitacoes = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, search = '', status = '', prioridade = '', paciente_id } = req.query;
    
    // Obter dados do médico logado
    const medicoId = req.user?.id;
    const clinicaId = req.user?.clinica_id;
    
    if (!medicoId || !clinicaId) {
      const response: ApiResponse = {
        success: false,
        message: 'Token inválido ou médico não encontrado'
      };
      res.status(401).json(response);
      return;
    }
    
    console.log('📋 Recebendo requisição de solicitações...');
    console.log('Médico logado:', { medicoId, clinicaId });
    console.log('Query params:', { page, limit, search, status, prioridade, paciente_id });
    
    const params = {
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      status: status as string,
      prioridade: prioridade as string,
      paciente_id: paciente_id ? Number(paciente_id) : undefined,
      clinicaId,
      medicoId // Adicionar filtro por médico
    };
    
    const result = await SolicitacaoModel.findAll(params);
    
    const response: ApiResponse = {
      success: true,
      message: 'Solicitações listadas com sucesso',
      data: {
        solicitacoes: result.data,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: result.total,
          totalPages: Math.ceil(result.total / Number(limit))
        }
      }
    };
    
    console.log(`✅ Sucesso! ${result.data.length} solicitações encontradas para o médico ${medicoId}`);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Erro ao listar solicitações:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao listar solicitações',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

// GET /api/mobile/solicitacoes/stats - Estatísticas das solicitações do médico logado
export const getSolicitacoesStats = async (req: AuthRequest, res: Response) => {
  try {
    // Obter dados do médico logado
    const medicoId = req.user?.id;
    const clinicaId = req.user?.clinica_id;
    
    if (!medicoId || !clinicaId) {
      const response: ApiResponse = {
        success: false,
        message: 'Token inválido ou médico não encontrado'
      };
      res.status(401).json(response);
      return;
    }
    
    console.log('📊 Recebendo requisição de estatísticas de solicitações...');
    console.log('Médico logado:', { medicoId, clinicaId });
    
    const stats = await SolicitacaoModel.getStats(clinicaId, medicoId);
    
    const response: ApiResponse = {
      success: true,
      message: 'Estatísticas de solicitações carregadas com sucesso',
      data: stats
    };
    
    console.log('✅ Estatísticas de solicitações carregadas para o médico:', stats);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas de solicitações:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao buscar estatísticas de solicitações',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

// GET /api/mobile/solicitacoes/:id - Buscar solicitação por ID
export const getSolicitacaoById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const solicitacaoId = parseInt(id);
    
    if (isNaN(solicitacaoId)) {
      const response: ApiResponse = {
        success: false,
        message: 'ID da solicitação inválido'
      };
      return res.status(400).json(response);
    }
    
    console.log(`🔍 Buscando solicitação ID: ${solicitacaoId}`);
    
    const solicitacao = await SolicitacaoModel.findById(solicitacaoId);
    
    if (!solicitacao) {
      const response: ApiResponse = {
        success: false,
        message: 'Solicitação não encontrada'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Solicitação encontrada com sucesso',
      data: solicitacao
    };
    
    console.log('✅ Solicitação encontrada:', solicitacao.protocolo);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Erro ao buscar solicitação:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao buscar solicitação',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

// POST /api/mobile/solicitacoes - Criar nova solicitação
export const createSolicitacao = async (req: AuthRequest, res: Response) => {
  try {
    const { paciente_id, protocolo, cid, prioridade, observacoes } = req.body;
    
    console.log('➕ Recebendo requisição para criar solicitação...');
    console.log('Dados:', { paciente_id, protocolo, cid, prioridade, observacoes });
    
    // Validações básicas
    if (!paciente_id || !protocolo || !cid || !prioridade) {
      const response: ApiResponse = {
        success: false,
        message: 'Dados obrigatórios: paciente_id, protocolo, cid, prioridade'
      };
      return res.status(400).json(response);
    }
    
    // Usar clínica ID 1 por padrão para teste
    const clinicaId = 1;
    
    const solicitacaoData = {
      paciente_id: Number(paciente_id),
      protocolo,
      cid,
      prioridade,
      observacoes
    };
    
    const solicitacao = await SolicitacaoModel.create(solicitacaoData, clinicaId);
    
    const response: ApiResponse = {
      success: true,
      message: 'Solicitação criada com sucesso',
      data: solicitacao
    };
    
    console.log('✅ Solicitação criada:', solicitacao.id);
    res.status(201).json(response);
    
  } catch (error) {
    console.error('❌ Erro ao criar solicitação:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao criar solicitação',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

// PUT /api/mobile/solicitacoes/:id - Atualizar solicitação
export const updateSolicitacao = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, observacoes, justificativa_rejeicao } = req.body;
    
    const solicitacaoId = parseInt(id);
    
    if (isNaN(solicitacaoId)) {
      const response: ApiResponse = {
        success: false,
        message: 'ID da solicitação inválido'
      };
      return res.status(400).json(response);
    }
    
    console.log(`✏️ Recebendo requisição para atualizar solicitação ID: ${solicitacaoId}`);
    console.log('Dados:', { status, observacoes, justificativa_rejeicao });
    
    const updateData = {
      status,
      observacoes,
      justificativa_rejeicao
    };
    
    const solicitacao = await SolicitacaoModel.update(solicitacaoId, updateData);
    
    if (!solicitacao) {
      const response: ApiResponse = {
        success: false,
        message: 'Solicitação não encontrada'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Solicitação atualizada com sucesso',
      data: solicitacao
    };
    
    console.log('✅ Solicitação atualizada:', solicitacao.id);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar solicitação:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao atualizar solicitação',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};

// DELETE /api/mobile/solicitacoes/:id - Deletar solicitação
export const deleteSolicitacao = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const solicitacaoId = parseInt(id);
    
    if (isNaN(solicitacaoId)) {
      const response: ApiResponse = {
        success: false,
        message: 'ID da solicitação inválido'
      };
      return res.status(400).json(response);
    }
    
    console.log(`🗑️ Recebendo requisição para deletar solicitação ID: ${solicitacaoId}`);
    
    const deleted = await SolicitacaoModel.delete(solicitacaoId);
    
    if (!deleted) {
      const response: ApiResponse = {
        success: false,
        message: 'Solicitação não encontrada'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Solicitação deletada com sucesso'
    };
    
    console.log('✅ Solicitação deletada:', solicitacaoId);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Erro ao deletar solicitação:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao deletar solicitação',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
};
