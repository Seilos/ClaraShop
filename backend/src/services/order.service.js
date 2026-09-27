import { db } from '../db/index.js';
import { tenants, tenantSettings, products, orders, orderItems } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import { addDecimal, mulDecimal, convertCurrency, formatDecimal } from '../../../shared/utils/math.js';
import { ProductService } from './product.service.js';
import { logger } from '../utils/logger.js';
import nodemailer from 'nodemailer';

export class OrderService {
  /**
   * Genera el enlace de WhatsApp estructurado (wa.me)
   */
  static buildWhatsAppUrl(phone, orderNumber, customerName, totalUsd, totalSecondary, currencyCode, items) {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');

    let text = `🛒 *NUEVO PEDIDO DE COMPRA - ${orderNumber}*\n\n`;
    text += `👤 *Cliente:* ${customerName}\n`;
    text += `📦 *Productos:*\n`;

    items.forEach((item, index) => {
      text += `  ${index + 1}. ${item.productName} x${item.quantity} = $${item.subtotalUsd} USD\n`;
    });

    text += `\n💵 *Total USD:* $${totalUsd} USD\n`;
    text += `💱 *Total ${currencyCode}:* ${totalSecondary} ${currencyCode}\n`;
    text += `\nPor favor confirmar recepción e instrucciones de pago.`;

    const encodedText = encodeURIComponent(text);
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }

  /**
   * Procesa la creación de un nuevo pedido público
   */
  static async createOrder(data) {
    const { tenantSlug, customerName, customerContact, paymentMethod, country, city, address, items } = data;

    // 1. Buscar Tenant por Slug
    const tenant = await db.select().from(tenants).where(eq(tenants.slug, tenantSlug.toLowerCase())).get();
    if (!tenant) {
      const err = new Error(`Tienda '${tenantSlug}' no encontrada`);
      err.statusCode = 404;
      throw err;
    }

    // 2. Obtener configuraciones de moneda del Tenant
    let settings = await db.select().from(tenantSettings).where(eq(tenantSettings.tenantId, tenant.id)).get();
    const exchangeRate = settings?.exchangeRate || '1.00000000';
    const secondaryCode = settings?.secondaryCurrencyCode || 'VES';
    const whatsappNumber = settings?.whatsappNumber || tenant.contactPhone;

    // 3. Procesar items y calcular montos exactos con decimal.js
    let calculatedTotalUsd = '0.00000000';
    const processedItems = [];

    for (const item of items) {
      const product = await db
        .select()
        .from(products)
        .where(and(eq(products.id, item.productId), eq(products.tenantId, tenant.id)))
        .get();

      if (!product) {
        const err = new Error(`Producto ID ${item.productId} no está disponible`);
        err.statusCode = 400;
        throw err;
      }

      const unitPrice = product.onSale && product.salePriceUsd ? product.salePriceUsd : product.priceUsd1;
      const subtotalUsd = mulDecimal(unitPrice, item.quantity);
      calculatedTotalUsd = addDecimal(calculatedTotalUsd, subtotalUsd);

      processedItems.push({
        id: ProductService.generateUUIDv7(),
        productId: product.id,
        productName: product.name,
        unitPriceUsd: formatDecimal(unitPrice),
        quantity: item.quantity,
        subtotalUsd: formatDecimal(subtotalUsd),
      });
    }

    // Convertir total a moneda secundaria con 8 decimales de precisión
    const calculatedTotalSecondary = convertCurrency(calculatedTotalUsd, exchangeRate);
    const orderId = ProductService.generateUUIDv7();
    const orderNumber = `#ORD-${Date.now().toString().slice(-6)}`;

    // 4. Guardar orden en SQLite
    await db.insert(orders).values({
      id: orderId,
      tenantId: tenant.id,
      orderNumber,
      customerName,
      customerContact,
      paymentMethod,
      country,
      city,
      address,
      totalUsd: formatDecimal(calculatedTotalUsd),
      totalSecondary: formatDecimal(calculatedTotalSecondary),
      secondaryCurrencyCode: secondaryCode,
      exchangeRateUsed: formatDecimal(exchangeRate),
      status: 'pending',
    });

    for (const item of processedItems) {
      await db.insert(orderItems).values({
        ...item,
        orderId,
      });
    }

    // 5. Generar enlace WhatsApp
    const whatsappUrl = this.buildWhatsAppUrl(
      whatsappNumber,
      orderNumber,
      customerName,
      calculatedTotalUsd,
      calculatedTotalSecondary,
      secondaryCode,
      processedItems
    );

    logger.info({
      tenantId: tenant.id,
      orderId,
      orderNumber,
      totalUsd: calculatedTotalUsd,
      msg: 'Orden procesada y guardada exitosamente',
    });

    return {
      orderId,
      orderNumber,
      totalUsd: formatDecimal(calculatedTotalUsd),
      totalSecondary: formatDecimal(calculatedTotalSecondary),
      secondaryCurrencyCode: secondaryCode,
      whatsappUrl,
    };
  }
}
