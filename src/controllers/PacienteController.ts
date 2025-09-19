import { Request, Response } from 'express';
import { PacienteModelSimple } from '../models/PacienteModelSimple';
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

// Buscar pacientes do médico logado
export const getPacientes = async (req: AuthRequest, res: Response) => {
  try {
    const medicoId = req.user?.id;
    const clinicaId = req.user?.clinica_id;

    if (!medicoId || !clinicaId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado ou dados incompletos'
      });
    }

    const { page = 1, limit = 20, search = '', status = '' } = req.query;

    console.log('🔍 Buscando pacientes para médico:', { medicoId, clinicaId, search, status });

    const params = {
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      status: status as string
    };

    const result = await PacienteModelSimple.findByMedicoMobile(clinicaId, medicoId, params);

    const response: ApiResponse = {
      success: true,
      message: 'Pacientes carregados com sucesso',
      data: result
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar estatísticas de pacientes do médico logado
export const getPacientesStats = async (req: AuthRequest, res: Response) => {
  try {
    const medicoId = req.user?.id;
    const clinicaId = req.user?.clinica_id;

    if (!medicoId || !clinicaId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado ou dados incompletos'
      });
    }

    console.log('📊 Buscando estatísticas de pacientes para médico:', { medicoId, clinicaId });

    const stats = await PacienteModelSimple.getStatsByMedico(clinicaId, medicoId);

    const response: ApiResponse = {
      success: true,
      message: 'Estatísticas carregadas com sucesso',
      data: stats
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar estatísticas de pacientes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar paciente específico do médico logado
export const getPacienteById = async (req: AuthRequest, res: Response) => {
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
        message: 'ID do paciente inválido'
      });
    }

    console.log('🔍 Buscando paciente específico para médico:', { id, medicoId, clinicaId });

    const paciente = await PacienteModelSimple.findByIdAndMedicoMobile(Number(id), clinicaId, medicoId);

    if (!paciente) {
      return res.status(404).json({
        success: false,
        message: 'Paciente não encontrado ou não pertence ao médico'
      });
    }

    const response: ApiResponse = {
      success: true,
      message: 'Paciente encontrado com sucesso',
      data: paciente
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar paciente específico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Buscar pacientes por status do médico logado
export const getPacientesByStatus = async (req: AuthRequest, res: Response) => {
  try {
    const medicoId = req.user?.id;
    const clinicaId = req.user?.clinica_id;
    const { status } = req.params;

    if (!medicoId || !clinicaId) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado ou dados incompletos'
      });
    }

    if (!status || !['ativo', 'inativo'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido. Use "ativo" ou "inativo"'
      });
    }

    const { page = 1, limit = 20, search = '' } = req.query;

    console.log('🔍 Buscando pacientes por status para médico:', { status, medicoId, clinicaId, search });

    // Para pacientes por status, vamos usar o método geral mas filtrar por médico
    const params = {
      page: Number(page),
      limit: Number(limit),
      search: search as string
    };

    const result = await PacienteModelSimple.findByMedicoMobile(clinicaId, medicoId, params);

    // Filtrar por status no resultado
    const filteredData = result.data.filter(paciente => {
      if (status === 'ativo') {
        return paciente.status === 'ativo';
      } else {
        return paciente.status === 'inativo';
      }
    });

    const response: ApiResponse = {
      success: true,
      message: `Pacientes ${status} carregados com sucesso`,
      data: {
        ...result,
        data: filteredData
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Erro ao buscar pacientes por status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};