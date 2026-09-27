import { TenantService } from '../services/tenant.service.js';
import { updateProfileSchema, updateCurrenciesSchema } from '../../../shared/schemas/tenant.schema.js';

export class TenantController {
  static async getProfile(req, res, next) {
    try {
      const profile = await TenantService.getProfile(req.tenantId);
      return res.status(200).json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const validatedData = updateProfileSchema.parse(req.body);
      const updated = await TenantService.updateProfile(req.tenantId, validatedData);
      return res.status(200).json({ success: true, message: 'Perfil de tienda actualizado', data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async getSettings(req, res, next) {
    try {
      const settings = await TenantService.getSettings(req.tenantId);
      return res.status(200).json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  }

  static async updateCurrencies(req, res, next) {
    try {
      const validatedData = updateCurrenciesSchema.parse(req.body);
      const updated = await TenantService.updateCurrencies(req.tenantId, validatedData);
      return res.status(200).json({ success: true, message: 'Monedas y tasa de cambio actualizadas', data: updated });
    } catch (err) {
      next(err);
    }
  }
}
