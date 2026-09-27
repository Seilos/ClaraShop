import { z } from 'zod';
import { toDecimal } from '../utils/math.js';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'El nombre de la tienda debe tener al menos 2 caracteres'),
  contactName: z.string().min(2, 'El nombre de contacto es requerido'),
  contactPhone: z.string().min(6, 'El teléfono de contacto debe ser válido'),
  contactEmail: z.string().email('El correo de contacto no es válido'),
  country: z.string().min(2, 'El país es requerido'),
  city: z.string().min(2, 'La ciudad es requerida'),
  address: z.string().min(5, 'La dirección es requerida'),
});

export const updateCurrenciesSchema = z.object({
  baseCurrency: z.string().min(1).default('USD'),
  secondaryCurrencyCode: z.string().min(2, 'El código de moneda es requerido (ej: VES, ARS, COP)'),
  secondaryCurrencySymbol: z.string().min(1, 'El símbolo de moneda es requerido (ej: Bs, $, S/)'),
  exchangeRate: z.string().refine(
    (val) => {
      try {
        const dec = toDecimal(val);
        return !dec.isNaN() && dec.gt(0);
      } catch {
        return false;
      }
    },
    { message: 'La tasa de cambio debe ser un número positivo válido' }
  ),
});

export const updateChannelsSchema = z.object({
  whatsappNumber: z.string().min(6, 'El número de WhatsApp debe ser válido'),
  notificationEmail: z.string().email('El correo de notificación no es válido'),
});
