import { Router } from 'express';
import authRoutes from './authRoutes';
import medicoAuthRoutes from './medicoAuthRoutes';
import pacienteRoutes from './pacienteRoutesNoAuth';
import pacienteAuthRoutes from './pacienteAuthRoutes';
import solicitacaoRoutes from './solicitacaoRoutes';
import agendamentoRoutes from './agendamentoRoutes';
import agendamentoAuthRoutes from './agendamentoAuthRoutes';
import syncRoutes from './syncRoutes';

const router = Router();

// Rotas da API mobile
router.use('/auth', authRoutes);
router.use('/medico', medicoAuthRoutes);
router.use('/pacientes', pacienteRoutes); // Rotas sem autenticação (para compatibilidade)
router.use('/pacientes-auth', pacienteAuthRoutes); // Rotas com autenticação
router.use('/solicitacoes', solicitacaoRoutes);
router.use('/agendamentos', agendamentoRoutes); // Rotas sem autenticação (para compatibilidade)
router.use('/agendamentos-auth', agendamentoAuthRoutes); // Rotas com autenticação
router.use('/sync', syncRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Med Sync Mobile Backend está funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;
