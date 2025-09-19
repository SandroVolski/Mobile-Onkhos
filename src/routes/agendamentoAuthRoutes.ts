import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  getAgendamentos, 
  getAgendamentoById, 
  getAgendamentoStats, 
  updateAgendamento,
  createAgendamento
} from '../controllers/AgendamentoController';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// Rotas de agendamentos autenticadas
router.get('/', getAgendamentos);
router.get('/stats', getAgendamentoStats);
router.get('/:id', getAgendamentoById);
router.post('/', createAgendamento);
router.put('/:id', updateAgendamento);

export default router;
