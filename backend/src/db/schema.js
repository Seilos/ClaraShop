import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Tabla de Tenants (Tiendas Registradas)
export const tenants = sqliteTable('tenants', {
  id: text('id').primaryKey(), // UUIDv7
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(), // Subdominio o identificador de ruta
  contactName: text('contact_name').notNull(),
  contactPhone: text('contact_phone').notNull(),
  contactEmail: text('contact_email').notNull(),
  country: text('country').notNull(),
  city: text('city').notNull(),
  address: text('address').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Tabla de Usuarios Administradores de Tenant
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // UUIDv7
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  phone: text('phone').notNull(),
  role: text('role').notNull().default('tenant_admin'),
  country: text('country').notNull(),
  city: text('city').notNull(),
  address: text('address').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Tabla de Sesiones Activas (Persistencia & Límite de Dispositivos)
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(), // UUIDv7
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  refreshTokenHash: text('refresh_token_hash').notNull(),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  isRememberMe: integer('is_remember_me', { mode: 'boolean' }).notNull().default(false),
  isRevoked: integer('is_revoked', { mode: 'boolean' }).notNull().default(false),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Tabla de Reset Tokens para Recuperación de Contraseña
export const passwordResets = sqliteTable('password_resets', {
  id: text('id').primaryKey(), // UUIDv7
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: text('expires_at').notNull(),
  isUsed: integer('is_used', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Tabla de Configuración de Tenant (Monedas, Tasa de Cambio, WhatsApp & Email)
export const tenantSettings = sqliteTable('tenant_settings', {
  id: text('id').primaryKey(), // UUIDv7
  tenantId: text('tenant_id').notNull().unique().references(() => tenants.id, { onDelete: 'cascade' }),
  baseCurrency: text('base_currency').notNull().default('USD'),
  secondaryCurrencyCode: text('secondary_currency_code').notNull().default('VES'),
  secondaryCurrencySymbol: text('secondary_currency_symbol').notNull().default('Bs'),
  exchangeRate: text('exchange_rate').notNull().default('1.00000000'), // Guardado con 8 decimales exactos
  whatsappNumber: text('whatsapp_number'),
  notificationEmail: text('notification_email'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// Tabla de Marcas de Productos
export const brands = sqliteTable('brands', {
  id: text('id').primaryKey(), // UUIDv7
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  logoUrl: text('logo_url'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Tabla de Categorías de Productos
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(), // UUIDv7
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  slug: text('slug').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Tabla de Relación Marca ↔ Categoría (N:M — future-ready, no UI yet)
// Permite vincular una marca a múltiples categorías para sugerencias inteligentes.
export const brandCategories = sqliteTable('brand_categories', {
  brandId: text('brand_id').notNull().references(() => brands.id, { onDelete: 'cascade' }),
  categoryId: text('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Tabla de Atributos Personalizados Creados por el Tenant (ej: Voltaje, Temporada, Capacidad)
export const customAttributes = sqliteTable('custom_attributes', {
  id: text('id').primaryKey(), // UUIDv7
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Tabla de Productos Profesionales
export const products = sqliteTable('products', {
  id: text('id').primaryKey(), // UUIDv7
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  
  // Identificadores profesionales
  sku: text('sku'),
  barcode: text('barcode'),
  
  // Información principal
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  shortDescription: text('short_description'),
  
  // Relaciones y clasificaciones
  brandId: text('brand_id').references(() => brands.id, { onDelete: 'set null' }),
  categoryId: text('category_id').references(() => categories.id, { onDelete: 'set null' }),
  modelName: text('model_name'),
  color: text('color'),
  size: text('size'),
  material: text('material'),
  warrantyInfo: text('warranty_info'),

  // Precios profesionales (8 decimales exactos con decimal.js)
  priceUsd1: text('price_usd_1').notNull(), // Precio Minorista USD
  priceUsd2: text('price_usd_2'), // Precio Mayorista USD
  priceUsd3: text('price_usd_3'), // Precio VIP / Especial USD
  costUsd: text('cost_usd'), // Costo interno USD
  onSale: integer('on_sale', { mode: 'boolean' }).default(false),
  salePriceUsd: text('sale_price_usd'),

  // Inventario & Visibilidad
  stockQuantity: integer('stock_quantity').notNull().default(0),
  minStockAlert: integer('min_stock_alert').default(5),
  allowOutOfStockPurchase: integer('allow_out_of_stock_purchase', { mode: 'boolean' }).default(false),
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),

  // Imágenes
  featuredImage: text('featured_image'),
  galleryImages: text('gallery_images'), // JSON Array string

  // Auditoría profesional (Cero pérdida)
  createdBy: text('created_by').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedBy: text('updated_by'),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
  disabledBy: text('disabled_by'),
  disabledAt: text('disabled_at'),
});

// Valores de Atributos Personalizados por Producto
export const productAttributeValues = sqliteTable('product_attribute_values', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  attributeId: text('attribute_id').notNull().references(() => customAttributes.id, { onDelete: 'cascade' }),
  value: text('value').notNull(),
});

// Tabla de Órdenes de Pedidos Públicos
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(), // UUIDv7
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  orderNumber: text('order_number').notNull(), // ej: #ORD-1001
  customerName: text('customer_name').notNull(),
  customerContact: text('customer_contact').notNull(), // Teléfono o Email
  paymentMethod: text('payment_method').notNull(), // Transferencia, Efectivo, Pago Móvil, Zelle, etc.
  country: text('country').notNull(),
  city: text('city').notNull(),
  address: text('address').notNull(),
  
  // Montos y conversiones con 8 decimales (decimal.js)
  totalUsd: text('total_usd').notNull(),
  totalSecondary: text('total_secondary').notNull(),
  secondaryCurrencyCode: text('secondary_currency_code').notNull(),
  exchangeRateUsed: text('exchange_rate_used').notNull(),
  
  status: text('status').notNull().default('pending'), // 'pending' | 'completed' | 'cancelled'
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// Detalles / Items de la Orden
export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(), // UUIDv7
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  productName: text('product_name').notNull(),
  unitPriceUsd: text('unit_price_usd').notNull(), // 8 decimales
  quantity: integer('quantity').notNull(),
  subtotalUsd: text('subtotal_usd').notNull(), // 8 decimales
});
