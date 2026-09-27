import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas las rutas de productos requieren autenticación y contexto de tenant
router.use(requireAuth);

router.post('/', ProductController.createProduct);
router.get('/', ProductController.listProducts);
router.get('/:id', ProductController.getProductById);
router.put('/:id', ProductController.updateProduct);
router.delete('/:id', ProductController.deactivateProduct);

export default router;
