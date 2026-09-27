import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// Public routes (no auth required)
router.post('/register', AuthController.registerTenant);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);

// Protected routes (valid access token required)
router.post('/logout', requireAuth, AuthController.logout);
router.post('/logout-all', requireAuth, AuthController.logoutAllDevices);

export default router;
