import { db } from '../db/index.js';
import { brands, categories, customAttributes, products } from '../db/schema.js';
import { eq, and, sql, count } from 'drizzle-orm';
import { logger } from '../utils/logger.js';
import { ProductService } from './product.service.js';

// ---------------------------------------------------------------------------
// Brands
// ---------------------------------------------------------------------------

export class BrandService {
  /**
   * Create a new brand for a tenant
   * @param {string} tenantId
   * @param {{ name: string, logoUrl?: string }} data
   */
  static async createBrand(tenantId, data) {
    const id = ProductService.generateUUIDv7();
    await db.insert(brands).values({ id, tenantId, name: data.name, description: data.description ?? null, logoUrl: data.logoUrl ?? null });
    logger.info({ tenantId, brandId: id, name: data.name, msg: 'Brand created' });
    return this.getBrandById(tenantId, id);
  }

  /**
   * List all brands for a tenant with product count.
   * When categoryId is provided, brands are sorted by usage in that category first
   * (smart suggestions: brands already used in that category appear at top).
   */
  static async listBrands(tenantId, categoryId = null) {
    const rows = await db
      .select({
        id: brands.id,
        tenantId: brands.tenantId,
        name: brands.name,
        description: brands.description,
        logoUrl: brands.logoUrl,
        createdAt: brands.createdAt,
        productCount: sql`COUNT(${products.id})`.as('productCount'),
        categoryUsage: categoryId
          ? sql`SUM(CASE WHEN ${products.categoryId} = ${categoryId} THEN 1 ELSE 0 END)`.as('categoryUsage')
          : sql`0`.as('categoryUsage'),
      })
      .from(brands)
      .leftJoin(products, and(eq(products.brandId, brands.id), eq(products.tenantId, tenantId), eq(products.isActive, 1)))
      .where(eq(brands.tenantId, tenantId))
      .groupBy(brands.id)
      .orderBy(sql`categoryUsage DESC`, sql`productCount DESC`, brands.name)
      .all();
    return rows;
  }

  /**
   * Get a single brand by ID (scoped to tenant)
   * Returns null if not found or belongs to another tenant
   */
  static async getBrandById(tenantId, brandId) {
    return db
      .select()
      .from(brands)
      .where(and(eq(brands.id, brandId), eq(brands.tenantId, tenantId)))
      .get() ?? null;
  }

  /**
   * Update a brand (name and/or logoUrl)
   */
  static async updateBrand(tenantId, brandId, data) {
    const existing = await this.getBrandById(tenantId, brandId);
    if (!existing) {
      const err = new Error('Brand not found');
      err.statusCode = 404;
      throw err;
    }
    const updatePayload = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.logoUrl !== undefined) updatePayload.logoUrl = data.logoUrl;
    await db
      .update(brands)
      .set(updatePayload)
      .where(and(eq(brands.id, brandId), eq(brands.tenantId, tenantId)));
    logger.info({ tenantId, brandId, msg: 'Brand updated' });
    return this.getBrandById(tenantId, brandId);
  }

  /**
   * Delete a brand permanently
   * NOTE: products referencing this brand will have brandId set to NULL (ON DELETE SET NULL)
   */
  static async deleteBrand(tenantId, brandId) {
    const existing = await this.getBrandById(tenantId, brandId);
    if (!existing) {
      const err = new Error('Brand not found');
      err.statusCode = 404;
      throw err;
    }
    await db.delete(brands).where(and(eq(brands.id, brandId), eq(brands.tenantId, tenantId)));
    logger.info({ tenantId, brandId, msg: 'Brand deleted' });
    return true;
  }
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export class CategoryService {
  /**
   * Create a new category, auto-generates slug from name
   */
  static async createCategory(tenantId, data) {
    const id = ProductService.generateUUIDv7();
    const slug = data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    await db.insert(categories).values({ id, tenantId, name: data.name, description: data.description ?? null, slug });
    logger.info({ tenantId, categoryId: id, name: data.name, msg: 'Category created' });
    return this.getCategoryById(tenantId, id);
  }

  /** List all categories for a tenant with product count */
  static async listCategories(tenantId) {
    const rows = await db
      .select({
        id: categories.id,
        tenantId: categories.tenantId,
        name: categories.name,
        description: categories.description,
        slug: categories.slug,
        createdAt: categories.createdAt,
        productCount: sql`COUNT(${products.id})`.as('productCount'),
      })
      .from(categories)
      .leftJoin(products, and(eq(products.categoryId, categories.id), eq(products.tenantId, tenantId), eq(products.isActive, 1)))
      .where(eq(categories.tenantId, tenantId))
      .groupBy(categories.id)
      .all();
    return rows;
  }

  /**
   * Get a single category by ID (scoped to tenant)
   */
  static async getCategoryById(tenantId, categoryId) {
    return db
      .select()
      .from(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.tenantId, tenantId)))
      .get() ?? null;
  }

  /**
   * Update a category name (slug regenerated from new name)
   */
  static async updateCategory(tenantId, categoryId, data) {
    const existing = await this.getCategoryById(tenantId, categoryId);
    if (!existing) {
      const err = new Error('Category not found');
      err.statusCode = 404;
      throw err;
    }
    const updatePayload = {};
    if (data.name) {
      updatePayload.name = data.name;
      updatePayload.slug = data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-');
    }
    if (data.description !== undefined) updatePayload.description = data.description;
    await db
      .update(categories)
      .set(updatePayload)
      .where(and(eq(categories.id, categoryId), eq(categories.tenantId, tenantId)));
    logger.info({ tenantId, categoryId, msg: 'Category updated' });
    return this.getCategoryById(tenantId, categoryId);
  }

  /**
   * Delete a category permanently
   * NOTE: products referencing this category will have categoryId set to NULL (ON DELETE SET NULL)
   */
  static async deleteCategory(tenantId, categoryId) {
    const existing = await this.getCategoryById(tenantId, categoryId);
    if (!existing) {
      const err = new Error('Category not found');
      err.statusCode = 404;
      throw err;
    }
    await db.delete(categories).where(and(eq(categories.id, categoryId), eq(categories.tenantId, tenantId)));
    logger.info({ tenantId, categoryId, msg: 'Category deleted' });
    return true;
  }
}

// ---------------------------------------------------------------------------
// Custom Attributes
// ---------------------------------------------------------------------------

export class AttributeService {
  /**
   * Create a new custom attribute definition for tenant (e.g. "Voltage", "Season")
   */
  static async createAttribute(tenantId, data) {
    const id = ProductService.generateUUIDv7();
    await db.insert(customAttributes).values({ id, tenantId, name: data.name });
    logger.info({ tenantId, attributeId: id, name: data.name, msg: 'Custom attribute created' });
    return this.getAttributeById(tenantId, id);
  }

  /** List all custom attributes for a tenant */
  static async listAttributes(tenantId) {
    return db.select().from(customAttributes).where(eq(customAttributes.tenantId, tenantId)).all();
  }

  /**
   * Get a single attribute by ID (scoped to tenant)
   */
  static async getAttributeById(tenantId, attributeId) {
    return db
      .select()
      .from(customAttributes)
      .where(and(eq(customAttributes.id, attributeId), eq(customAttributes.tenantId, tenantId)))
      .get() ?? null;
  }

  /**
   * Delete a custom attribute definition
   * NOTE: associated productAttributeValues will cascade delete (ON DELETE CASCADE)
   */
  static async deleteAttribute(tenantId, attributeId) {
    const existing = await this.getAttributeById(tenantId, attributeId);
    if (!existing) {
      const err = new Error('Attribute not found');
      err.statusCode = 404;
      throw err;
    }
    await db
      .delete(customAttributes)
      .where(and(eq(customAttributes.id, attributeId), eq(customAttributes.tenantId, tenantId)));
    logger.info({ tenantId, attributeId, msg: 'Custom attribute deleted' });
    return true;
  }
}
