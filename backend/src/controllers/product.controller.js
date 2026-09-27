import { ProductService } from '../services/product.service.js';
import { createProductSchema, updateProductSchema } from '../../../shared/schemas/product.schema.js';

export class ProductController {
  static async createProduct(req, res, next) {
    try {
      const validatedData = createProductSchema.parse(req.body);
      const product = await ProductService.createProduct(req.tenantId, req.user.userId, validatedData);
      return res.status(201).json({ success: true, message: 'Producto creado exitosamente', data: product });
    } catch (err) {
      next(err);
    }
  }

  static async listProducts(req, res, next) {
    try {
      const { search, categoryId, brandId } = req.query;
      const products = await ProductService.listProducts(req.tenantId, { search, categoryId, brandId });
      return res.status(200).json({ success: true, data: products });
    } catch (err) {
      next(err);
    }
  }

  static async getProductById(req, res, next) {
    try {
      const product = await ProductService.getProductById(req.tenantId, req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, error: { message: 'Producto no encontrado' } });
      }
      return res.status(200).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  }

  static async updateProduct(req, res, next) {
    try {
      const validatedData = updateProductSchema.parse(req.body);
      const updated = await ProductService.updateProduct(req.tenantId, req.params.id, req.user.userId, validatedData);
      return res.status(200).json({ success: true, message: 'Producto actualizado correctamente', data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async deactivateProduct(req, res, next) {
    try {
      const deactivated = await ProductService.deactivateProduct(req.tenantId, req.params.id, req.user.userId);
      return res.status(200).json({ success: true, message: 'Producto desactivado correctamente', data: deactivated });
    } catch (err) {
      next(err);
    }
  }
}
