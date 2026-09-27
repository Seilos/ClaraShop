import { db } from '../db/index.js';
import { products, brands, categories, customAttributes, productAttributeValues } from '../db/schema.js';
import { eq, and, like, desc, or } from 'drizzle-orm';
import { formatDecimal } from '../../../shared/utils/math.js';
import { logger } from '../utils/logger.js';

export class ProductService {
  /**
   * Generador de UUIDv7 secuencial basado en timestamp
   */
  static generateUUIDv7() {
    const timeHex = Date.now().toString(16).padStart(12, '0');
    const randomHex = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    return `${timeHex.substring(0, 8)}-${timeHex.substring(8, 12)}-7${randomHex.substring(1, 4)}-8${randomHex.substring(5, 8)}-${randomHex.substring(8, 20)}`;
  }

  /**
   * Crear un producto profesional con precios decimales y atributos dinámicos
   */
  static async createProduct(tenantId, userId, data) {
    const productId = this.generateUUIDv7();
    const slug = (data.slug || data.name)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    const formattedPrice1 = formatDecimal(data.priceUsd1);
    const formattedPrice2 = data.priceUsd2 ? formatDecimal(data.priceUsd2) : null;
    const formattedPrice3 = data.priceUsd3 ? formatDecimal(data.priceUsd3) : null;
    const formattedCost = data.costUsd ? formatDecimal(data.costUsd) : null;
    const formattedSale = data.salePriceUsd ? formatDecimal(data.salePriceUsd) : null;

    await db.insert(products).values({
      id: productId,
      tenantId,
      sku: data.sku || `SKU-${Date.now().toString().slice(-6)}`,
      barcode: data.barcode || null,
      name: data.name,
      slug,
      description: data.description || '',
      shortDescription: data.shortDescription || '',
      brandId: data.brandId || null,
      categoryId: data.categoryId || null,
      modelName: data.modelName || null,
      color: data.color || null,
      size: data.size || null,
      material: data.material || null,
      warrantyInfo: data.warrantyInfo || null,

      priceUsd1: formattedPrice1,
      priceUsd2: formattedPrice2,
      priceUsd3: formattedPrice3,
      costUsd: formattedCost,
      onSale: !!data.onSale,
      salePriceUsd: formattedSale,

      stockQuantity: data.stockQuantity || 0,
      minStockAlert: data.minStockAlert || 5,
      allowOutOfStockPurchase: !!data.allowOutOfStockPurchase,
      isFeatured: !!data.isFeatured,
      isActive: true,

      featuredImage: data.featuredImage || null,
      galleryImages: JSON.stringify(data.galleryImages || []),

      createdBy: userId,
    });

    // Insertar atributos dinámicos personalizados si los hay
    if (data.customAttributes && data.customAttributes.length > 0) {
      for (const attr of data.customAttributes) {
        await db.insert(productAttributeValues).values({
          id: this.generateUUIDv7(),
          tenantId,
          productId,
          attributeId: attr.attributeId,
          value: attr.value,
        });
      }
    }

    logger.info({ tenantId, productId, sku: data.sku, msg: 'Producto profesional creado exitosamente' });
    return this.getProductById(tenantId, productId);
  }

  /**
   * Obtener lista de productos con filtros y paginación
   * Filters: search (name/SKU), categoryId, brandId, onlyActive
   */
  static async listProducts(tenantId, { search, categoryId, brandId, onlyActive = true } = {}) {
    const conditions = [eq(products.tenantId, tenantId)];

    if (onlyActive) {
      conditions.push(eq(products.isActive, true));
    }
    if (categoryId) {
      conditions.push(eq(products.categoryId, categoryId));
    }
    if (brandId) {
      conditions.push(eq(products.brandId, brandId));
    }
    if (search) {
      const pattern = `%${search}%`;
      conditions.push(or(like(products.name, pattern), like(products.sku, pattern)));
    }

    const list = await db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt))
      .all();

    return list.map((p) => ({
      ...p,
      galleryImages: p.galleryImages ? JSON.parse(p.galleryImages) : [],
    }));
  }

  /**
   * Actualizar un producto existente (auditoría completa)
   */
  static async updateProduct(tenantId, productId, userId, data) {
    const existing = await this.getProductById(tenantId, productId);
    if (!existing) {
      const err = new Error('Producto no encontrado');
      err.statusCode = 404;
      throw err;
    }

    const updatePayload = { updatedBy: userId, updatedAt: new Date().toISOString() };

    if (data.name !== undefined) {
      updatePayload.name = data.name;
      updatePayload.slug = (data.name)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-');
    }
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.shortDescription !== undefined) updatePayload.shortDescription = data.shortDescription;
    if (data.sku !== undefined) updatePayload.sku = data.sku;
    if (data.barcode !== undefined) updatePayload.barcode = data.barcode;
    if (data.brandId !== undefined) updatePayload.brandId = data.brandId;
    if (data.categoryId !== undefined) updatePayload.categoryId = data.categoryId;
    if (data.modelName !== undefined) updatePayload.modelName = data.modelName;
    if (data.color !== undefined) updatePayload.color = data.color;
    if (data.size !== undefined) updatePayload.size = data.size;
    if (data.material !== undefined) updatePayload.material = data.material;
    if (data.warrantyInfo !== undefined) updatePayload.warrantyInfo = data.warrantyInfo;
    if (data.priceUsd1 !== undefined) updatePayload.priceUsd1 = formatDecimal(data.priceUsd1);
    if (data.priceUsd2 !== undefined) updatePayload.priceUsd2 = data.priceUsd2 ? formatDecimal(data.priceUsd2) : null;
    if (data.priceUsd3 !== undefined) updatePayload.priceUsd3 = data.priceUsd3 ? formatDecimal(data.priceUsd3) : null;
    if (data.costUsd !== undefined) updatePayload.costUsd = data.costUsd ? formatDecimal(data.costUsd) : null;
    if (data.onSale !== undefined) updatePayload.onSale = !!data.onSale;
    if (data.salePriceUsd !== undefined) updatePayload.salePriceUsd = data.salePriceUsd ? formatDecimal(data.salePriceUsd) : null;
    if (data.stockQuantity !== undefined) updatePayload.stockQuantity = data.stockQuantity;
    if (data.minStockAlert !== undefined) updatePayload.minStockAlert = data.minStockAlert;
    if (data.allowOutOfStockPurchase !== undefined) updatePayload.allowOutOfStockPurchase = !!data.allowOutOfStockPurchase;
    if (data.isFeatured !== undefined) updatePayload.isFeatured = !!data.isFeatured;
    if (data.featuredImage !== undefined) updatePayload.featuredImage = data.featuredImage;
    if (data.galleryImages !== undefined) updatePayload.galleryImages = JSON.stringify(data.galleryImages);

    await db
      .update(products)
      .set(updatePayload)
      .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)));

    logger.info({ tenantId, productId, userId, msg: 'Producto actualizado' });
    return this.getProductById(tenantId, productId);
  }

  static async getProductById(tenantId, productId) {
    const product = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)))
      .get();

    if (!product) return null;

    const attrValues = await db
      .select()
      .from(productAttributeValues)
      .where(and(eq(productAttributeValues.productId, productId), eq(productAttributeValues.tenantId, tenantId)))
      .all();

    return {
      ...product,
      galleryImages: product.galleryImages ? JSON.parse(product.galleryImages) : [],
      customAttributes: attrValues,
    };
  }

  /**
   * Marcar producto como desactivado (Soft Delete para Auditoría)
   */
  static async deactivateProduct(tenantId, productId, userId) {
    await db
      .update(products)
      .set({
        isActive: false,
        disabledBy: userId,
        disabledAt: new Date().toISOString(),
      })
      .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)));

    logger.info({ tenantId, productId, userId, msg: 'Producto desactivado (Soft Delete)' });
    return this.getProductById(tenantId, productId);
  }
}
