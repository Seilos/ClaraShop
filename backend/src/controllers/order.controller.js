import { OrderService } from '../services/order.service.js';
import { createOrderSchema } from '../../../shared/schemas/order.schema.js';
import { db } from '../db/index.js';
import { tenants, tenantSettings, products } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

export class OrderController {
  /**
   * Endpoint público para obtener catálogo e información de la tienda cliente
   */
  static async getPublicStorefront(req, res, next) {
    try {
      const slug = req.params.slug || req.tenantSlug;
      if (!slug) {
        return res.status(400).json({ success: false, error: { message: 'Se requiere el slug o subdominio de la tienda' } });
      }

      const tenant = await db.select().from(tenants).where(eq(tenants.slug, slug.toLowerCase())).get();
      if (!tenant) {
        return res.status(404).json({ success: false, error: { message: 'Tienda no encontrada' } });
      }

      const settings = await db.select().from(tenantSettings).where(eq(tenantSettings.tenantId, tenant.id)).get();
      const productList = await db.select().from(products).where(and(eq(products.tenantId, tenant.id), eq(products.isActive, true))).all();

      return res.status(200).json({
        success: true,
        data: {
          store: {
            name: tenant.name,
            slug: tenant.slug,
            contactPhone: tenant.contactPhone,
            contactEmail: tenant.contactEmail,
            country: tenant.country,
            city: tenant.city,
          },
          settings: settings || {
            baseCurrency: 'USD',
            secondaryCurrencyCode: 'VES',
            secondaryCurrencySymbol: 'Bs',
            exchangeRate: '1.00000000',
          },
          products: productList.map((p) => ({
            ...p,
            galleryImages: p.galleryImages ? JSON.parse(p.galleryImages) : [],
          })),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Endpoint público para procesar la orden del checkout
   */
  static async createPublicOrder(req, res, next) {
    try {
      const validatedData = createOrderSchema.parse(req.body);
      const result = await OrderService.createOrder(validatedData);

      return res.status(201).json({
        success: true,
        message: 'Pedido procesado exitosamente',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
