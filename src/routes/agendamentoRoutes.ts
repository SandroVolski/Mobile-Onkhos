import { Router } from 'express';
import { AgendamentoControllerSimple } from '../controllers/AgendamentoControllerSimple';

const router = Router();

// Rotas SEM autenticação (seguindo padrão das outras rotas)
router.get('/', AgendamentoControllerSimple.list);        // GET /api/mobile/agendamentos
router.get('/stats', AgendamentoControllerSimple.stats);  // GET /api/mobile/agendamentos/stats
router.get('/:id', AgendamentoControllerSimple.show);     // GET /api/mobile/agendamentos/:id
router.put('/:id', AgendamentoControllerSimple.update);   // PUT /api/mobile/agendamentos/:id

export default router;
