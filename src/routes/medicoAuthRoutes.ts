import { Router } from 'express';
import { 
  loginMedico, 
  getMedicoProfile, 
  updateMedicoProfile, 
  logoutMedico 
} from '../controllers/MedicoAuthController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// POST /api/mobile/medico/login - Login do médico (SEM AUTENTICAÇÃO)
router.post('/login', loginMedico);

// GET /api/mobile/medico/profile - Perfil do médico (COM AUTENTICAÇÃO)
router.get('/profile', authenticateToken, getMedicoProfile);

// PUT /api/mobile/medico/profile - Atualizar perfil do médico (COM AUTENTICAÇÃO)
router.put('/profile', authenticateToken, updateMedicoProfile);

// POST /api/mobile/medico/logout - Logout do médico (COM AUTENTICAÇÃO)
router.post('/logout', authenticateToken, logoutMedico);

export default router;
