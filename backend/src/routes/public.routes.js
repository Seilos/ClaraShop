import { Router } from 'express';
import { OrderController } from '../controllers/order.controller.js';

const router = Router();

// Rutas públicas accesibles por compradores sin login
router.get('/storefront/:slug', OrderController.getPublicStorefront);
router.post('/orders', OrderController.createPublicOrder);

export default router;
