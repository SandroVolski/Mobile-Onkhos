import { Router } from 'express';
import { PacienteController } from '../controllers/PacienteController';
import { authenticateToken, requireMedico } from '../middleware/auth';

const router = Router();

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Rotas de pacientes para mobile
router.get('/', PacienteController.index);
router.get('/stats', PacienteController.stats);
router.get('/recent', PacienteController.recent);
router.get('/search', PacienteController.search);
router.get('/:id', PacienteController.show);

export default router;
