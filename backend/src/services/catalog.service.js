import { db } from '../db/index.js';
import { brands, categories, customAttributes, productAttributes, attributeValues, products } from '../db/schema.js';
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
   * @param {{ name: string, description?: string, logoUrl?: string }} data
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
   * Update a brand (name, description, logoUrl)
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
   * Generate slug from category name
   */
  static generateSlug(name) {
    return name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-');
  }

  /**
   * Create a new category for a tenant
   */
  static async createCategory(tenantId, data) {
    const id = ProductService.generateUUIDv7();
    const slug = data.slug || this.generateSlug(data.name);
    await db.insert(categories).values({
      id,
      tenantId,
      name: data.name,
      description: data.description ?? null,
      slug,
    });
    logger.info({ tenantId, categoryId: id, name: data.name, msg: 'Category created' });
    return this.getCategoryById(tenantId, id);
  }

  /**
   * List all categories for a tenant with product count
   */
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
      .orderBy(categories.name)
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
   * Update a category (name, description, slug)
   */
  static async updateCategory(tenantId, categoryId, data) {
    const existing = await this.getCategoryById(tenantId, categoryId);
    if (!existing) {
      const err = new Error('Category not found');
      err.statusCode = 404;
      throw err;
    }
    const updatePayload = {};
    if (data.name !== undefined) {
      updatePayload.name = data.name;
      if (!data.slug) updatePayload.slug = this.generateSlug(data.name);
    }
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.slug !== undefined) updatePayload.slug = data.slug;

    await db
      .update(categories)
      .set(updatePayload)
      .where(and(eq(categories.id, categoryId), eq(categories.tenantId, tenantId)));
    logger.info({ tenantId, categoryId, msg: 'Category updated' });
    return this.getCategoryById(tenantId, categoryId);
  }

  /**
   * Delete a category permanently
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
// Master Attributes & Attribute Values (EAV Dynamic Pattern)
// ---------------------------------------------------------------------------

export class AttributeService {
  /**
   * Default system attributes to seed per tenant if empty
   */
  static DEFAULT_ATTRIBUTES = [
    { name: 'Modelo', code: 'ATT-MOD', description: 'Modelo o versión del producto (ej. Pro Max, S24 Ultra)' },
    { name: 'Color', code: 'ATT-COL', description: 'Color o acabado del producto (ej. Titanio Natural, Negro)' },
    { name: 'Talla / Almacenamiento', code: 'ATT-TAL', description: 'Talla, tamaño o almacenamiento (ej. 256GB, XL, 42)' },
    { name: 'Material', code: 'ATT-MAT', description: 'Materiales principales de construcción (ej. Titanio & Cristal, Algodón)' },
    { name: 'Garantía', code: 'ATT-GAR', description: 'Tiempo y tipo de garantía oficial (ej. 12 Meses Oficial)' },
  ];

  /**
   * Ensure default system attributes exist for tenant
   */
  static async ensureDefaultAttributes(tenantId) {
    const existing = await db.select().from(productAttributes).where(eq(productAttributes.tenantId, tenantId)).all();
    if (existing.length === 0) {
      for (const attr of this.DEFAULT_ATTRIBUTES) {
        const id = ProductService.generateUUIDv7();
        await db.insert(productAttributes).values({
          id,
          tenantId,
          code: attr.code,
          name: attr.name,
          description: attr.description,
          isSystem: true,
        });
      }
    }
  }

  /**
   * List all master attributes for a tenant, with counts of values
   */
  static async listAttributes(tenantId) {
    await this.ensureDefaultAttributes(tenantId);
    const rows = await db
      .select({
        id: productAttributes.id,
        tenantId: productAttributes.tenantId,
        code: productAttributes.code,
        name: productAttributes.name,
        description: productAttributes.description,
        isSystem: productAttributes.isSystem,
        createdAt: productAttributes.createdAt,
        valueCount: sql`COUNT(${attributeValues.id})`.as('valueCount'),
      })
      .from(productAttributes)
      .leftJoin(attributeValues, and(eq(attributeValues.attributeId, productAttributes.id), eq(attributeValues.tenantId, tenantId)))
      .where(eq(productAttributes.tenantId, tenantId))
      .groupBy(productAttributes.id)
      .orderBy(productAttributes.code, productAttributes.name)
      .all();
    return rows;
  }

  /**
   * Create a new master attribute definition
   */
  static async createAttribute(tenantId, data) {
    const id = ProductService.generateUUIDv7();
    const countAttr = await db.select({ count: count() }).from(productAttributes).where(eq(productAttributes.tenantId, tenantId)).get();
    const nextNum = (countAttr?.count || 0) + 1;
    const code = data.code || `ATT-${String(nextNum).padStart(3, '0')}`;

    await db.insert(productAttributes).values({
      id,
      tenantId,
      code,
      name: data.name,
      description: data.description ?? null,
      isSystem: false,
    });
    logger.info({ tenantId, attributeId: id, name: data.name, code, msg: 'Master attribute created' });
    return this.getAttributeById(tenantId, id);
  }

  /** Get single attribute by ID */
  static async getAttributeById(tenantId, attributeId) {
    return db
      .select()
      .from(productAttributes)
      .where(and(eq(productAttributes.id, attributeId), eq(productAttributes.tenantId, tenantId)))
      .get() ?? null;
  }

  /** Update master attribute */
  static async updateAttribute(tenantId, attributeId, data) {
    const existing = await this.getAttributeById(tenantId, attributeId);
    if (!existing) {
      const err = new Error('Attribute not found');
      err.statusCode = 404;
      throw err;
    }
    const updatePayload = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.code !== undefined) updatePayload.code = data.code;

    await db.update(productAttributes).set(updatePayload).where(and(eq(productAttributes.id, attributeId), eq(productAttributes.tenantId, tenantId)));
    return this.getAttributeById(tenantId, attributeId);
  }

  /** Delete master attribute */
  static async deleteAttribute(tenantId, attributeId) {
    const existing = await this.getAttributeById(tenantId, attributeId);
    if (!existing) {
      const err = new Error('Attribute not found');
      err.statusCode = 404;
      throw err;
    }
    await db.delete(productAttributes).where(and(eq(productAttributes.id, attributeId), eq(productAttributes.tenantId, tenantId)));
    return true;
  }

  // -------------------------------------------------------------------------
  // Attribute Values
  // -------------------------------------------------------------------------

  /**
   * List all values for a specific attribute (e.g., all Colors or all Sizes)
   */
  static async listAttributeValues(tenantId, attributeId) {
    return db
      .select()
      .from(attributeValues)
      .where(and(eq(attributeValues.tenantId, tenantId), eq(attributeValues.attributeId, attributeId)))
      .orderBy(attributeValues.value)
      .all();
  }

  /**
   * List ALL values for ALL attributes of a tenant (grouped or flattened for fast catalog lookup)
   */
  static async listAllAttributeValues(tenantId) {
    await this.ensureDefaultAttributes(tenantId);
    return db
      .select({
        id: attributeValues.id,
        attributeId: attributeValues.attributeId,
        attributeName: productAttributes.name,
        attributeCode: productAttributes.code,
        code: attributeValues.code,
        value: attributeValues.value,
        description: attributeValues.description,
        createdAt: attributeValues.createdAt,
      })
      .from(attributeValues)
      .innerJoin(productAttributes, eq(productAttributes.id, attributeValues.attributeId))
      .where(eq(attributeValues.tenantId, tenantId))
      .orderBy(productAttributes.name, attributeValues.value)
      .all();
  }

  /**
   * Create a new value for a master attribute (e.g., "Titanio Natural" for Color)
   */
  static async createAttributeValue(tenantId, attributeId, data) {
    const attr = await this.getAttributeById(tenantId, attributeId);
    if (!attr) {
      const err = new Error('Parent attribute not found');
      err.statusCode = 404;
      throw err;
    }

    const id = ProductService.generateUUIDv7();
    const countVal = await db
      .select({ count: count() })
      .from(attributeValues)
      .where(and(eq(attributeValues.tenantId, tenantId), eq(attributeValues.attributeId, attributeId)))
      .get();
    const nextNum = (countVal?.count || 0) + 1;
    
    // Prefix based on attribute code if available (e.g. COL-001, TAL-001, VAL-001)
    const prefix = attr.code ? attr.code.replace('ATT-', '') : 'VAL';
    const code = data.code || `${prefix}-${String(nextNum).padStart(3, '0')}`;

    await db.insert(attributeValues).values({
      id,
      tenantId,
      attributeId,
      code,
      value: data.value,
      description: data.description ?? null,
    });
    logger.info({ tenantId, attributeId, valueId: id, value: data.value, code, msg: 'Attribute value created' });
    return this.getAttributeValueById(tenantId, id);
  }

  /** Get single attribute value by ID */
  static async getAttributeValueById(tenantId, valueId) {
    return db
      .select()
      .from(attributeValues)
      .where(and(eq(attributeValues.id, valueId), eq(attributeValues.tenantId, tenantId)))
      .get() ?? null;
  }

  /** Update attribute value */
  static async updateAttributeValue(tenantId, valueId, data) {
    const existing = await this.getAttributeValueById(tenantId, valueId);
    if (!existing) {
      const err = new Error('Attribute value not found');
      err.statusCode = 404;
      throw err;
    }
    const updatePayload = {};
    if (data.value !== undefined) updatePayload.value = data.value;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.code !== undefined) updatePayload.code = data.code;

    await db.update(attributeValues).set(updatePayload).where(and(eq(attributeValues.id, valueId), eq(attributeValues.tenantId, tenantId)));
    return this.getAttributeValueById(tenantId, valueId);
  }

  /** Delete attribute value */
  static async deleteAttributeValue(tenantId, valueId) {
    const existing = await this.getAttributeValueById(tenantId, valueId);
    if (!existing) {
      const err = new Error('Attribute value not found');
      err.statusCode = 404;
      throw err;
    }
    await db.delete(attributeValues).where(and(eq(attributeValues.id, valueId), eq(attributeValues.tenantId, tenantId)));
    return true;
  }
}
