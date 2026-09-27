import { z } from 'zod';

export const registerTenantSchema = z.object({
  // Datos del Tenant (Tienda)
  storeName: z.string().min(2, 'El nombre de la tienda debe tener al menos 2 caracteres'),
  slug: z
    .string()
    .min(2, 'El subdominio/slug debe tener al menos 2 caracteres')
    .regex(/^[a-z0-9-]+$/, 'El subdominio solo permite letras minúsculas, números y guiones'),

  // Datos del Usuario Administrador (Requeridos según especificación Fase 2)
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: z.string().min(6, 'El número de contacto debe ser válido'),
  email: z.string().email('El correo electrónico no tiene un formato válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  country: z.string().min(2, 'El país es requerido'),
  city: z.string().min(2, 'La ciudad es requerida'),
  address: z.string().min(5, 'La dirección debe ser más descriptiva'),
});

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico no válido'),
  password: z.string().min(1, 'La contraseña es requerida'),
  rememberMe: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Correo electrónico no válido'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'El token es requerido'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
});
