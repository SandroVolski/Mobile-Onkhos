import { Router } from 'express';
import { syncDoctors } from '../controllers/SyncController';

const router = Router();

// POST /api/mobile/sync/doctors - Sincronizar médicos automaticamente
router.post('/doctors', syncDoctors);

export default router;
