import { z } from 'zod';
import { toDecimal } from '../utils/math.js';

const requiredDecimalValidator = z
  .union([z.string(), z.number()])
  .transform((val) => String(val))
  .refine(
    (val) => {
      try {
        const dec = toDecimal(val);
        return !dec.isNaN() && dec.gte(0);
      } catch {
        return false;
      }
    },
    { message: 'Monto debe ser un número decimal válido' }
  );

const optionalDecimalValidator = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .optional()
  .nullable()
  .transform((val) => (val !== null && val !== undefined && val !== '' ? String(val) : null))
  .refine(
    (val) => {
      if (val === null) return true;
      try {
        const dec = toDecimal(val);
        return !dec.isNaN() && dec.gte(0);
      } catch {
        return false;
      }
    },
    { message: 'Monto debe ser un número decimal válido' }
  );

export const createProductSchema = z.object({
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  name: z.string().min(2, 'El nombre del producto es requerido'),
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  modelName: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  material: z.string().optional().nullable(),
  warrantyInfo: z.string().optional().nullable(),

  // Precios obligatorios y opcionales (8 decimales exactos con decimal.js)
  priceUsd1: requiredDecimalValidator,
  priceUsd2: optionalDecimalValidator,
  priceUsd3: optionalDecimalValidator,
  costUsd: optionalDecimalValidator,
  onSale: z.boolean().optional().default(false),
  salePriceUsd: optionalDecimalValidator,

  // Inventario
  stockQuantity: z.number().int().min(0).default(0),
  minStockAlert: z.number().int().min(0).default(5),
  allowOutOfStockPurchase: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),

  // Imágenes
  featuredImage: z.string().optional().nullable(),
  galleryImages: z.array(z.string()).optional().default([]),

  // Atributos dinámicos
  customAttributes: z
    .array(
      z.object({
        attributeId: z.string(),
        value: z.string(),
      })
    )
    .optional()
    .default([]),
});

export const createBrandSchema = z.object({
  name: z.string().min(1, 'El nombre de la marca es requerido'),
  description: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'El nombre de la categoría es requerido'),
  description: z.string().optional().nullable(),
});

export const createAttributeSchema = z.object({
  name: z.string().min(1, 'El nombre del atributo es requerido (ej: Voltaje, Temporada)'),
});

/**
 * Update schemas: all fields optional (partial updates / PATCH-style via PUT)
 */
export const updateProductSchema = createProductSchema.partial().omit({ customAttributes: true });

export const updateBrandSchema = createBrandSchema.partial();

export const updateCategorySchema = createCategorySchema.partial();
