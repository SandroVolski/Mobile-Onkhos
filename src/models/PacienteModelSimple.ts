import { query, queryWithLimit } from '../config/database';
import { Paciente, PacienteCreateInput, PacienteUpdateInput, PaginationParams, PaginatedResponse, MobilePaciente } from '../types';

export class PacienteModelSimple {
  
  // Converter paciente do banco para formato mobile
  static convertToMobileFormat(paciente: Paciente): MobilePaciente {
    // Calcular idade
    const birthDate = new Date(paciente.Data_Nascimento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Criar iniciais
    const nameParts = paciente.Paciente_Nome.split(' ');
    const initials = nameParts.length >= 2 
      ? nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
      : nameParts[0].charAt(0) + (nameParts[0].charAt(1) || '');

    // Determinar status ativo/inativo baseado no status atual
    const isActive = paciente.status === 'Em tratamento' || paciente.status === 'Em remissão';

    // Montar endereço completo
    const enderecoCompleto = [
      paciente.endereco_rua,
      paciente.endereco_numero,
      paciente.endereco_complemento,
      paciente.endereco_bairro,
      paciente.endereco_cidade,
      paciente.endereco_estado
    ].filter(Boolean).join(', ');

    return {
      id: paciente.id,
      name: paciente.Paciente_Nome,
      age: age,
      phone: paciente.telefone || '',
      email: paciente.email || '',
      diagnosis: paciente.Cid_Diagnostico || '',
      stage: paciente.stage || '',
      status: isActive ? 'ativo' : 'inativo',
      lastVisit: paciente.Data_Primeira_Solicitacao || '',
      nextAppointment: null, // TODO: implementar sistema de agendamentos
      treatmentPlan: paciente.treatment || '',
      doctor: 'Dr. Médico', // TODO: implementar relacionamento com médicos
      initials: initials.toUpperCase(),
      // Campos adicionais para dados clínicos
      sexo: paciente.Sexo,
      peso: paciente.peso,
      altura: paciente.altura,
      cpf: paciente.cpf,
      plano_saude: paciente.plano_saude,
      operadora_nome: paciente.operadora_nome,
      prestador_nome: paciente.prestador_nome,
      observacoes: paciente.observacoes,
      contato_emergencia_nome: paciente.contato_emergencia_nome,
      contato_emergencia_telefone: paciente.contato_emergencia_telefone,
      endereco_completo: enderecoCompleto
    };
  }

  // Buscar pacientes por clínica (formato mobile) - VERSÃO SIMPLIFICADA
  static async findByClinicaIdMobile(clinicaId: number, params: PaginationParams): Promise<PaginatedResponse<MobilePaciente>> {
    const { page = 1, limit = 20, search = '' } = params;
    const offset = (page - 1) * limit;
    
    let whereClause = `WHERE p.clinica_id = ?`;
    let searchParams: any[] = [clinicaId];
    
    if (search && search.trim() !== '') {
      whereClause += ` AND (p.Paciente_Nome LIKE ? OR p.Codigo LIKE ? OR p.cpf LIKE ? OR p.telefone LIKE ?)`;
      const searchTerm = `%${search.trim()}%`;
      searchParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    // Query simplificada sem JOINs
    const baseSelectQuery = `
      SELECT 
        p.*
      FROM Pacientes_Clinica p
      ${whereClause}
      ORDER BY p.created_at DESC
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM Pacientes_Clinica p 
      ${whereClause}
    `;
    
    try {
      console.log('🔍 Executando query de pacientes...');
      console.log('Query:', baseSelectQuery);
      console.log('Params:', searchParams);
      
      const [countResult, patients] = await Promise.all([
        query(countQuery, searchParams),
        queryWithLimit(baseSelectQuery, searchParams, limit, offset)
      ]);
      
      const total = countResult[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);
      
      console.log(`✅ Sucesso! ${patients.length} pacientes de ${total}`);
      
      // Converter para formato mobile
      const mobilePatients = patients.map((p: Paciente) => this.convertToMobileFormat(p));
      
      return {
        data: mobilePatients,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error('❌ Erro ao buscar pacientes da clínica:', error);
      throw new Error('Erro ao buscar pacientes da clínica');
    }
  }

  // Buscar paciente por ID (formato mobile) - VERSÃO SIMPLIFICADA
  static async findByIdMobile(id: number): Promise<MobilePaciente | null> {
    const selectQuery = `
      SELECT 
        p.*
      FROM Pacientes_Clinica p
      WHERE p.id = ?
    `;
    
    try {
      const result = await query(selectQuery, [id]);
      if (result.length === 0) return null;
      
      return this.convertToMobileFormat(result[0]);
    } catch (error) {
      console.error('Erro ao buscar paciente por ID:', error);
      throw new Error('Erro ao buscar paciente');
    }
  }

  // Buscar pacientes por status (formato mobile) - VERSÃO SIMPLIFICADA
  static async findByStatusMobile(clinicaId: number, status: 'ativo' | 'inativo', params: PaginationParams): Promise<PaginatedResponse<MobilePaciente>> {
    const { page = 1, limit = 20, search = '' } = params;
    const offset = (page - 1) * limit;
    
    // Converter status mobile para status do banco
    const dbStatus = status === 'ativo' 
      ? ['Em tratamento', 'Em remissão'] 
      : ['Alta', 'Óbito'];
    
    let whereClause = `WHERE p.clinica_id = ? AND p.status IN (${dbStatus.map(() => '?').join(',')})`;
    let searchParams: any[] = [clinicaId, ...dbStatus];
    
    if (search && search.trim() !== '') {
      whereClause += ` AND (p.Paciente_Nome LIKE ? OR p.Codigo LIKE ? OR p.cpf LIKE ? OR p.telefone LIKE ?)`;
      const searchTerm = `%${search.trim()}%`;
      searchParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    const baseSelectQuery = `
      SELECT 
        p.*
      FROM Pacientes_Clinica p
      ${whereClause}
      ORDER BY p.created_at DESC
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM Pacientes_Clinica p 
      ${whereClause}
    `;
    
    try {
      const [countResult, patients] = await Promise.all([
        query(countQuery, searchParams),
        queryWithLimit(baseSelectQuery, searchParams, limit, offset)
      ]);
      
      const total = countResult[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);
      
      // Converter para formato mobile
      const mobilePatients = patients.map((p: Paciente) => this.convertToMobileFormat(p));
      
      return {
        data: mobilePatients,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error('Erro ao buscar pacientes por status:', error);
      throw new Error('Erro ao buscar pacientes por status');
    }
  }

  // Estatísticas dos pacientes para o dashboard mobile
  static async getStatsForClinica(clinicaId: number) {
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN p.status IN ('Em tratamento', 'Em remissão') THEN 1 ELSE 0 END) as ativo,
        SUM(CASE WHEN p.status IN ('Alta', 'Óbito') THEN 1 ELSE 0 END) as inativo,
        SUM(CASE WHEN p.status = 'Em tratamento' THEN 1 ELSE 0 END) as em_tratamento,
        SUM(CASE WHEN p.status = 'Em remissão' THEN 1 ELSE 0 END) as em_remissao,
        SUM(CASE WHEN p.status = 'Alta' THEN 1 ELSE 0 END) as alta,
        SUM(CASE WHEN p.status = 'Óbito' THEN 1 ELSE 0 END) as obito
      FROM Pacientes_Clinica p 
      WHERE p.clinica_id = ?
    `;

    try {
      const result = await query(statsQuery, [clinicaId]);
      const stats = result[0] || {};
      
      return {
        total: parseInt(stats.total) || 0,
        ativo: parseInt(stats.ativo) || 0,
        inativo: parseInt(stats.inativo) || 0,
        detalhado: {
          em_tratamento: parseInt(stats.em_tratamento) || 0,
          em_remissao: parseInt(stats.em_remissao) || 0,
          alta: parseInt(stats.alta) || 0,
          obito: parseInt(stats.obito) || 0
        }
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw new Error('Erro ao buscar estatísticas');
    }
  }

  // Buscar pacientes recentes (últimos 7 dias)
  static async findRecentPatients(clinicaId: number, limit: number = 5): Promise<MobilePaciente[]> {
    const recentQuery = `
      SELECT 
        p.*
      FROM Pacientes_Clinica p
      WHERE p.clinica_id = ? 
        AND p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY p.created_at DESC
      LIMIT ?
    `;

    try {
      const result = await query(recentQuery, [clinicaId, limit]);
      return result.map((p: Paciente) => this.convertToMobileFormat(p));
    } catch (error) {
      console.error('Erro ao buscar pacientes recentes:', error);
      throw new Error('Erro ao buscar pacientes recentes');
    }
  }

  // ===== MÉTODOS DE AUTENTICAÇÃO POR MÉDICO =====

  // Buscar pacientes por médico logado (formato mobile)
  static async findByMedicoMobile(clinicaId: number, medicoId: number, params: PaginationParams): Promise<PaginatedResponse<MobilePaciente>> {
    const { page = 1, limit = 20, search = '' } = params;
    const offset = (page - 1) * limit;
    
    let whereClause = `WHERE p.clinica_id = ?`;
    let searchParams: any[] = [clinicaId];

    // Filtrar por médico através do prestador
    whereClause += ` AND p.Prestador IN (
      SELECT pr.id FROM Prestadores pr 
      INNER JOIN Medicos_Mobile m ON pr.crm = m.crm
      WHERE m.id = ? AND m.clinica_id = ?
    )`;
    searchParams.push(medicoId, clinicaId);
    
    if (search && search.trim() !== '') {
      whereClause += ` AND (p.Paciente_Nome LIKE ? OR p.Codigo LIKE ? OR p.cpf LIKE ? OR p.telefone LIKE ?)`;
      const searchTerm = `%${search.trim()}%`;
      searchParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    const baseSelectQuery = `
      SELECT 
        p.*,
        pr.nome as prestador_nome,
        pr.crm as prestador_crm,
        pr.especialidade as prestador_especialidade
      FROM Pacientes_Clinica p
      LEFT JOIN Prestadores pr ON p.Prestador = pr.id
      ${whereClause}
      ORDER BY p.Paciente_Nome ASC
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM Pacientes_Clinica p
      ${whereClause}
    `;
    
    try {
      console.log('🔍 Buscando pacientes por médico:', { clinicaId, medicoId, search });
      console.log('Query:', baseSelectQuery);
      console.log('Params:', searchParams);
      
      const [countResult, patients] = await Promise.all([
        query(countQuery, searchParams),
        queryWithLimit(baseSelectQuery, searchParams, limit, offset)
      ]);
      
      const total = countResult[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);
      
      console.log(`✅ Encontrados ${patients.length} pacientes para o médico ${medicoId} de ${total} total`);
      
      // Converter para formato mobile
      const mobilePatients = patients.map((p: Paciente) => this.convertToMobileFormat(p));
      
      return {
        data: mobilePatients,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error('❌ Erro ao buscar pacientes por médico:', error);
      throw new Error('Erro ao buscar pacientes por médico');
    }
  }

  // Estatísticas de pacientes por médico
  static async getStatsByMedico(clinicaId: number, medicoId: number) {
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN p.status IN ('Em tratamento', 'Em remissão') THEN 1 ELSE 0 END) as ativo,
        SUM(CASE WHEN p.status IN ('Alta', 'Óbito') THEN 1 ELSE 0 END) as inativo,
        SUM(CASE WHEN p.status = 'Em tratamento' THEN 1 ELSE 0 END) as em_tratamento,
        SUM(CASE WHEN p.status = 'Em remissão' THEN 1 ELSE 0 END) as em_remissao,
        SUM(CASE WHEN p.status = 'Alta' THEN 1 ELSE 0 END) as alta,
        SUM(CASE WHEN p.status = 'Óbito' THEN 1 ELSE 0 END) as obito
      FROM Pacientes_Clinica p
      WHERE p.clinica_id = ? 
        AND p.Prestador IN (
          SELECT pr.id FROM Prestadores pr 
          INNER JOIN Medicos_Mobile m ON pr.crm = m.crm
          WHERE m.id = ? AND m.clinica_id = ?
        )
    `;

    try {
      console.log('📊 Buscando estatísticas de pacientes por médico:', { clinicaId, medicoId });
      
      const result = await query(statsQuery, [clinicaId, medicoId, clinicaId]);
      const stats = result[0] || {};
      
      console.log('📊 Estatísticas encontradas:', stats);
      
      return {
        total: parseInt(stats.total) || 0,
        ativo: parseInt(stats.ativo) || 0,
        inativo: parseInt(stats.inativo) || 0,
        detalhado: {
          em_tratamento: parseInt(stats.em_tratamento) || 0,
          em_remissao: parseInt(stats.em_remissao) || 0,
          alta: parseInt(stats.alta) || 0,
          obito: parseInt(stats.obito) || 0
        }
      };
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas de pacientes por médico:', error);
      throw new Error('Erro ao buscar estatísticas de pacientes por médico');
    }
  }

  // Buscar paciente específico por médico
  static async findByIdAndMedicoMobile(id: number, clinicaId: number, medicoId: number): Promise<MobilePaciente | null> {
    const selectQuery = `
      SELECT 
        p.*,
        pr.nome as prestador_nome,
        pr.crm as prestador_crm,
        pr.especialidade as prestador_especialidade
      FROM Pacientes_Clinica p
      LEFT JOIN Prestadores pr ON p.Prestador = pr.id
      WHERE p.id = ? 
        AND p.clinica_id = ?
        AND p.Prestador IN (
          SELECT pr.id FROM Prestadores pr 
          INNER JOIN Medicos_Mobile m ON pr.crm = m.crm
          WHERE m.id = ? AND m.clinica_id = ?
        )
    `;

    try {
      console.log('🔍 Buscando paciente específico por médico:', { id, clinicaId, medicoId });
      
      const result = await query(selectQuery, [id, clinicaId, medicoId, clinicaId]);
      
      if (result.length === 0) {
        console.log('❌ Paciente não encontrado ou não pertence ao médico');
        return null;
      }
      
      console.log('✅ Paciente encontrado:', result[0].Paciente_Nome);
      return this.convertToMobileFormat(result[0]);
    } catch (error) {
      console.error('❌ Erro ao buscar paciente por médico:', error);
      throw new Error('Erro ao buscar paciente por médico');
    }
  }
}
