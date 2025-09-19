import { Router } from 'express';
import { PacienteModelSimple } from '../models/PacienteModelSimple';
import { ApiResponse } from '../types';

const router = Router();

// GET /api/mobile/pacientes - Listar pacientes (SEM AUTENTICAÇÃO)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', status } = req.query;
    
    console.log('🔍 Recebendo requisição de pacientes...');
    console.log('Query params:', { page, limit, search, status });
    
    // Usar clínica ID 1 por padrão para teste
    const clinicaId = 1;
    
    const params = {
      page: Number(page),
      limit: Number(limit),
      search: search as string
    };
    
    let result;
    
    if (status && (status === 'ativo' || status === 'inativo')) {
      console.log(`📊 Buscando pacientes ${status}...`);
      result = await PacienteModelSimple.findByStatusMobile(clinicaId, status as 'ativo' | 'inativo', params);
    } else {
      console.log('📋 Buscando todos os pacientes...');
      result = await PacienteModelSimple.findByClinicaIdMobile(clinicaId, params);
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Pacientes listados com sucesso',
      data: result
    };
    
    console.log(`✅ Sucesso! ${result.data.length} pacientes encontrados`);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Erro ao listar pacientes:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao listar pacientes',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
});

// GET /api/mobile/pacientes/stats - Estatísticas dos pacientes (SEM AUTENTICAÇÃO)
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 Recebendo requisição de estatísticas...');
    
    // Usar clínica ID 1 por padrão para teste
    const clinicaId = 1;
    
    const stats = await PacienteModelSimple.getStatsForClinica(clinicaId);
    
    const response: ApiResponse = {
      success: true,
      message: 'Estatísticas carregadas com sucesso',
      data: stats
    };
    
    console.log('✅ Estatísticas carregadas:', stats);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
});

// GET /api/mobile/pacientes/:id - Buscar paciente por ID (SEM AUTENTICAÇÃO)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pacienteId = parseInt(id);
    
    if (isNaN(pacienteId)) {
      const response: ApiResponse = {
        success: false,
        message: 'ID do paciente inválido'
      };
      return res.status(400).json(response);
    }
    
    console.log(`🔍 Buscando paciente ID: ${pacienteId}`);
    
    const paciente = await PacienteModelSimple.findByIdMobile(pacienteId);
    
    if (!paciente) {
      const response: ApiResponse = {
        success: false,
        message: 'Paciente não encontrado'
      };
      return res.status(404).json(response);
    }
    
    const response: ApiResponse = {
      success: true,
      message: 'Paciente encontrado com sucesso',
      data: paciente
    };
    
    console.log('✅ Paciente encontrado:', paciente.name);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Erro ao buscar paciente:', error);
    const response: ApiResponse = {
      success: false,
      message: 'Erro ao buscar paciente',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
    res.status(500).json(response);
  }
});

export default router;
