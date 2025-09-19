import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { 
  getPacientes, 
  getPacientesStats, 
  getPacienteById, 
  getPacientesByStatus 
} from '../controllers/PacienteController';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// Rotas de pacientes autenticadas
router.get('/', getPacientes);
router.get('/stats', getPacientesStats);
router.get('/:id', getPacienteById);
router.get('/status/:status', getPacientesByStatus);

export default router;
