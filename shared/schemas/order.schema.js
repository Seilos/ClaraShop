import { z } from 'zod';

export const createOrderSchema = z.object({
  tenantSlug: z.string().min(1, 'El subdominio o identificador de tienda es requerido'),
  customerName: z.string().min(2, 'El nombre completo es requerido'),
  customerContact: z.string().min(6, 'El número de teléfono o correo de contacto es requerido'),
  paymentMethod: z.string().min(2, 'El método de pago es requerido (ej: Transferencia, Pago Móvil, Efectivo, Zelle)'),
  country: z.string().min(2, 'El país es requerido'),
  city: z.string().min(2, 'La ciudad es requerida'),
  address: z.string().min(5, 'La dirección aproximada de entrega es requerida'),

  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'El ID del producto es requerido'),
        quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1'),
      })
    )
    .min(1, 'El carrito debe contener al menos un producto'),
});
