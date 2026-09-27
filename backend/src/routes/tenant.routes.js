import { Router } from 'express';
import { TenantController } from '../controllers/tenant.controller.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas las rutas de configuración de tenant requieren autenticación JWT
router.use(requireAuth);

router.get('/profile', TenantController.getProfile);
router.put('/profile', TenantController.updateProfile);

router.get('/settings/currencies', TenantController.getSettings);
router.put('/settings/currencies', TenantController.updateCurrencies);

export default router;
