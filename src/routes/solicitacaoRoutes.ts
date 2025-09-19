import { Router } from 'express';
import { 
  getSolicitacoes, 
  getSolicitacoesStats, 
  getSolicitacaoById, 
  createSolicitacao, 
  updateSolicitacao, 
  deleteSolicitacao 
} from '../controllers/SolicitacaoController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// GET /api/mobile/solicitacoes - Listar solicitações
router.get('/', getSolicitacoes);

// GET /api/mobile/solicitacoes/stats - Estatísticas das solicitações
router.get('/stats', getSolicitacoesStats);

// GET /api/mobile/solicitacoes/:id - Buscar solicitação por ID
router.get('/:id', getSolicitacaoById);

// POST /api/mobile/solicitacoes - Criar nova solicitação
router.post('/', createSolicitacao);

// PUT /api/mobile/solicitacoes/:id - Atualizar solicitação
router.put('/:id', updateSolicitacao);

// DELETE /api/mobile/solicitacoes/:id - Deletar solicitação
router.delete('/:id', deleteSolicitacao);

export default router;
