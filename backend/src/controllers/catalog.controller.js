import { BrandService, CategoryService, AttributeService } from '../services/catalog.service.js';
import {
  createBrandSchema,
  updateBrandSchema,
  createCategorySchema,
  updateCategorySchema,
  createAttributeSchema,
} from '../../../shared/schemas/product.schema.js';

// ---------------------------------------------------------------------------
// Brands
// ---------------------------------------------------------------------------

export class BrandController {
  static async listBrands(req, res, next) {
    try {
      const { categoryId } = req.query;
      const data = await BrandService.listBrands(req.tenantId, categoryId || null);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async createBrand(req, res, next) {
    try {
      const validated = createBrandSchema.parse(req.body);
      const data = await BrandService.createBrand(req.tenantId, validated);
      return res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async updateBrand(req, res, next) {
    try {
      const validated = updateBrandSchema.parse(req.body);
      const data = await BrandService.updateBrand(req.tenantId, req.params.id, validated);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async deleteBrand(req, res, next) {
    try {
      await BrandService.deleteBrand(req.tenantId, req.params.id);
      return res.status(200).json({ success: true, message: 'Brand deleted' });
    } catch (err) {
      next(err);
    }
  }
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export class CategoryController {
  static async listCategories(req, res, next) {
    try {
      const data = await CategoryService.listCategories(req.tenantId);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async createCategory(req, res, next) {
    try {
      const validated = createCategorySchema.parse(req.body);
      const data = await CategoryService.createCategory(req.tenantId, validated);
      return res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async updateCategory(req, res, next) {
    try {
      const validated = updateCategorySchema.parse(req.body);
      const data = await CategoryService.updateCategory(req.tenantId, req.params.id, validated);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async deleteCategory(req, res, next) {
    try {
      await CategoryService.deleteCategory(req.tenantId, req.params.id);
      return res.status(200).json({ success: true, message: 'Category deleted' });
    } catch (err) {
      next(err);
    }
  }
}

// ---------------------------------------------------------------------------
// Custom Attributes
// ---------------------------------------------------------------------------

export class AttributeController {
  static async listAttributes(req, res, next) {
    try {
      const data = await AttributeService.listAttributes(req.tenantId);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async createAttribute(req, res, next) {
    try {
      const validated = createAttributeSchema.parse(req.body);
      const data = await AttributeService.createAttribute(req.tenantId, validated);
      return res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

  static async deleteAttribute(req, res, next) {
    try {
      await AttributeService.deleteAttribute(req.tenantId, req.params.id);
      return res.status(200).json({ success: true, message: 'Attribute deleted' });
    } catch (err) {
      next(err);
    }
  }
}
