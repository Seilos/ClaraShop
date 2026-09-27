import { db } from '../db/index.js';
import { tenants, users, tenantSettings } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { formatDecimal } from '../../../shared/utils/math.js';
import { logger } from '../utils/logger.js';

export class TenantService {
  /**
   * Obtiene el perfil completo del Tenant y su Administrador
   */
  static async getProfile(tenantId) {
    const tenant = await db.select().from(tenants).where(eq(tenants.id, tenantId)).get();
    if (!tenant) {
      const err = new Error('Tienda no encontrada');
      err.statusCode = 404;
      throw err;
    }

    const adminUser = await db.select().from(users).where(eq(users.tenantId, tenantId)).get();

    return {
      tenant,
      adminUser: adminUser
        ? {
            id: adminUser.id,
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
            email: adminUser.email,
            phone: adminUser.phone,
          }
        : null,
    };
  }

  /**
   * Actualiza los datos del perfil del Tenant
   */
  static async updateProfile(tenantId, data) {
    await db
      .update(tenants)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(tenants.id, tenantId));

    logger.info({ tenantId, msg: 'Perfil de tienda actualizado correctamente' });
    return this.getProfile(tenantId);
  }

  /**
   * Obtiene las configuraciones de moneda y tasa de cambio del Tenant
   */
  static async getSettings(tenantId) {
    let settings = await db.select().from(tenantSettings).where(eq(tenantSettings.tenantId, tenantId)).get();

    // Si no existen configuraciones iniciales, crearlas por defecto
    if (!settings) {
      const settingId = `tst-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      await db.insert(tenantSettings).values({
        id: settingId,
        tenantId,
        baseCurrency: 'USD',
        secondaryCurrencyCode: 'VES',
        secondaryCurrencySymbol: 'Bs',
        exchangeRate: '1.00000000',
      });

      settings = await db.select().from(tenantSettings).where(eq(tenantSettings.tenantId, tenantId)).get();
    }

    return {
      ...settings,
      exchangeRate: formatDecimal(settings.exchangeRate), // Formateo a 8 decimales exactos
    };
  }

  /**
   * Actualiza las configuraciones de monedas y tasa de cambio con precisión decimal
   */
  static async updateCurrencies(tenantId, data) {
    const { baseCurrency, secondaryCurrencyCode, secondaryCurrencySymbol, exchangeRate } = data;
    const formattedRate = formatDecimal(exchangeRate); // Formateo estricto a 8 decimales

    const settings = await this.getSettings(tenantId);

    await db
      .update(tenantSettings)
      .set({
        baseCurrency: baseCurrency || 'USD',
        secondaryCurrencyCode,
        secondaryCurrencySymbol,
        exchangeRate: formattedRate,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(tenantSettings.id, settings.id));

    logger.info({ tenantId, exchangeRate: formattedRate, msg: 'Tasa de cambio y monedas actualizadas' });
    return this.getSettings(tenantId);
  }
}
