import { Request, Response } from 'express';
import { MedicoMobileModel, MedicoMobileLogin } from '../models/MedicoMobileModel';
import { generateAccessToken, generateRefreshToken } from '../middleware/auth';
import { ApiResponse } from '../types';

// Interface para o payload do JWT
interface MedicoJWTPayload {
  id: number;
  clinica_id: number;
  nome: string;
  email: string;
  crm: string;
  especialidade?: string;
  role: 'medico';
  iat?: number;
  exp?: number;
}

// POST /api/mobile/medico/login - Login do médico
export const loginMedico = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, crm }: MedicoMobileLogin = req.body;
    
    console.log('🔐 Tentativa de login médico:', { email, crm: crm ? '***' : 'não informado' });
    
    // Validações básicas
    if (!email || !crm) {
      const response: ApiResponse = {
        success: false,
        message: 'Email e CRM são obrigatórios'
      };
      res.status(400).json(response);
      return;
    }
    
    // Buscar médico por email e CRM
    console.log('🔍 Buscando médico com:', { email, crm });
    console.log('🔍 Tipos:', { emailType: typeof email, crmType: typeof crm });
    console.log('🔍 Valores exatos:', { email: `"${email}"`, crm: `"${crm}"` });
    
    const medico = await MedicoMobileModel.findByEmailAndCRM(email, crm);
    console.log('📊 Resultado da busca:', medico ? 'Médico encontrado' : 'Médico não encontrado');
    if (medico) {
      console.log('📋 Dados do médico encontrado:', {
        id: medico.id,
        nome: medico.nome,
        email: medico.email,
        crm: medico.crm,
        status: medico.status
      });
    }
    
    if (!medico) {
      console.log('❌ Médico não encontrado ou credenciais inválidas');
      const response: ApiResponse = {
        success: false,
        message: 'Email ou CRM inválidos'
      };
      res.status(401).json(response);
      return;
    }
    
    // Criar payload para JWT
    const payload: Omit<MedicoJWTPayload, 'iat' | 'exp'> = {
      id: medico.id,
      clinica_id: medico.clinica_id,
      nome: medico.nome,
      email: medico.email,
      crm: medico.crm,
      especialidade: medico.especialidade,
      role: 'medico'
    };
    
    // Gerar tokens
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    
    console.log('✅ Login realizado com sucesso:', {
      medico: medico.nome,
      clinica: medico.clinica_nome,
      especialidade: medico.especialidade
    });
    
    const response: ApiResponse = {
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        medico: {
          id: medico.id,
          nome: medico.nome,
          email: medico.email,
          crm: medico.crm,
          especialidade: medico.especialidade,
          telefone: medico.telefone,
          clinica_id: medico.clinica_id,
          clinica_nome: medico.clinica_nome,
          status: medico.status
        },
        accessToken,
        refreshToken
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Erro no login do médico:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    };
    res.status(500).json(response);
  }
};

// GET /api/mobile/medico/profile - Perfil do médico logado
export const getMedicoProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const medicoId = (req as any).user?.id;
    
    if (!medicoId) {
      const response: ApiResponse = {
        success: false,
        message: 'Token inválido'
      };
      res.status(401).json(response);
      return;
    }
    
    const medico = await MedicoMobileModel.findById(medicoId);
    
    if (!medico) {
      const response: ApiResponse = {
        success: false,
        message: 'Médico não encontrado'
      };
      res.status(404).json(response);
      return;
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Perfil carregado com sucesso',
      data: {
        id: medico.id,
        nome: medico.nome,
        email: medico.email,
        crm: medico.crm,
        especialidade: medico.especialidade,
        telefone: medico.telefone,
        clinica_id: medico.clinica_id,
        clinica_nome: medico.clinica_nome,
        status: medico.status
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Erro ao buscar perfil do médico:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    };
    res.status(500).json(response);
  }
};

// PUT /api/mobile/medico/profile - Atualizar perfil do médico
export const updateMedicoProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const medicoId = (req as any).user?.id;
    const { nome, telefone, especialidade } = req.body;
    
    if (!medicoId) {
      const response: ApiResponse = {
        success: false,
        message: 'Token inválido'
      };
      res.status(401).json(response);
      return;
    }
    
    const updateData: any = {};
    if (nome) updateData.nome = nome;
    if (telefone) updateData.telefone = telefone;
    if (especialidade) updateData.especialidade = especialidade;
    
    if (Object.keys(updateData).length === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'Nenhum dado para atualizar'
      };
      res.status(400).json(response);
      return;
    }
    
    const medico = await MedicoMobileModel.update(medicoId, updateData);
    
    if (!medico) {
      const response: ApiResponse = {
        success: false,
        message: 'Médico não encontrado'
      };
      res.status(404).json(response);
      return;
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: {
        id: medico.id,
        nome: medico.nome,
        email: medico.email,
        crm: medico.crm,
        especialidade: medico.especialidade,
        telefone: medico.telefone,
        clinica_id: medico.clinica_id,
        clinica_nome: medico.clinica_nome,
        status: medico.status
      }
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil do médico:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    };
    res.status(500).json(response);
  }
};

// POST /api/mobile/medico/logout - Logout do médico
export const logoutMedico = async (req: Request, res: Response): Promise<void> => {
  try {
    // Para logout, simplesmente retornamos sucesso
    // Em um sistema mais robusto, poderíamos invalidar o token no servidor
    const response: ApiResponse = {
      success: true,
      message: 'Logout realizado com sucesso'
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('❌ Erro no logout do médico:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined
    };
    res.status(500).json(response);
  }
};
