import { Router } from 'express';
import { BrandController, CategoryController, AttributeController } from '../controllers/catalog.controller.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// All catalog routes require tenant authentication
router.use(requireAuth);

// ── Brands ──────────────────────────────────────────────────────────────────
router.get('/brands', BrandController.listBrands);
router.post('/brands', BrandController.createBrand);
router.put('/brands/:id', BrandController.updateBrand);
router.delete('/brands/:id', BrandController.deleteBrand);

// ── Categories ───────────────────────────────────────────────────────────────
router.get('/categories', CategoryController.listCategories);
router.post('/categories', CategoryController.createCategory);
router.put('/categories/:id', CategoryController.updateCategory);
router.delete('/categories/:id', CategoryController.deleteCategory);

// ── Master Attributes ────────────────────────────────────────────────────────
router.get('/attributes', AttributeController.listAttributes);
router.post('/attributes', AttributeController.createAttribute);
router.put('/attributes/:id', AttributeController.updateAttribute);
router.delete('/attributes/:id', AttributeController.deleteAttribute);

// ── Master Attribute Values ──────────────────────────────────────────────────
router.get('/attributes/values/all', AttributeController.listAllAttributeValues);
router.get('/attributes/:attributeId/values', AttributeController.listAttributeValues);
router.post('/attributes/:attributeId/values', AttributeController.createAttributeValue);
router.put('/attributes/values/:id', AttributeController.updateAttributeValue);
router.delete('/attributes/values/:id', AttributeController.deleteAttributeValue);

export default router;
