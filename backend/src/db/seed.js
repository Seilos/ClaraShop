import { db } from './index.js';
import { tenants, users, brands, categories, customAttributes, products, productAttributeValues } from './schema.js';
import { runMigrations } from './migrate.js';
import { ProductService } from '../services/product.service.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Poblando base de datos con datos de prueba profesionales...');
  await runMigrations();

  const tenantId = 'tnt-test-apple-store';
  const userId = 'usr-admin-demo';

  // 1. Crear o reemplazar Tenant Demo
  await db.insert(tenants).values({
    id: tenantId,
    name: 'Apple Duilio Store',
    slug: 'apple-duilio',
    contactName: 'Duilio Admin',
    contactPhone: '+5491122334455',
    contactEmail: 'admin@appleduilio.com',
    country: 'Argentina',
    city: 'Buenos Aires',
    address: 'Av. Libertador 5000',
    isActive: true,
  }).onConflictDoNothing();

  // 2. Usuario Administrador
  const passwordHash = await bcrypt.hash('Password123!', 10);
  await db.insert(users).values({
    id: userId,
    tenantId,
    firstName: 'Duilio',
    lastName: 'Admin',
    email: 'admin@appleduilio.com',
    passwordHash,
    phone: '+5491122334455',
    role: 'tenant_admin',
    country: 'Argentina',
    city: 'Buenos Aires',
    address: 'Av. Libertador 5000',
  }).onConflictDoNothing();

  // 3. Marcas de prueba
  const brandAppleId = ProductService.generateUUIDv7();
  await db.insert(brands).values({
    id: brandAppleId,
    tenantId,
    name: 'Apple',
  }).onConflictDoNothing();

  // 4. Categorías de prueba
  const categoryTechId = ProductService.generateUUIDv7();
  await db.insert(categories).values({
    id: categoryTechId,
    tenantId,
    name: 'Smartphones & Laptops',
    slug: 'smartphones-laptops',
  }).onConflictDoNothing();

  // 5. Atributo Dinámico (ej: Voltaje / Garantía Oficial)
  const attrGarantiaId = ProductService.generateUUIDv7();
  await db.insert(customAttributes).values({
    id: attrGarantiaId,
    tenantId,
    name: 'Garantía Oficial Apple',
  }).onConflictDoNothing();

  // 6. Productos de prueba con UUIDv7 y precios en 8 decimales exactos
  await ProductService.createProduct(tenantId, userId, {
    sku: 'IPHONE-15-PRO-256',
    barcode: '194253000000',
    name: 'iPhone 15 Pro Max 256GB',
    slug: 'iphone-15-pro-max-256gb',
    description: 'Titanio de grado aeroespacial, chip A17 Pro, botón de Acción y cámara principal de 48 MP.',
    shortDescription: 'Smartphone flagship de Apple en Titanio Natural',
    brandId: brandAppleId,
    categoryId: categoryTechId,
    modelName: 'Pro Max 15',
    color: 'Titanio Natural',
    size: '256GB',
    material: 'Titanio & Cristal',
    warrantyInfo: '12 Meses AppleCare',

    // Precios con 8 decimales exactos (Decimal.js)
    priceUsd1: '1199.99000000', // Precio Minorista
    priceUsd2: '1099.50000000', // Precio Mayorista
    priceUsd3: '1049.00000000', // Precio VIP
    costUsd: '850.00000000',
    onSale: true,
    salePriceUsd: '1149.99000000',

    stockQuantity: 15,
    minStockAlert: 3,
    isFeatured: true,
    customAttributes: [
      { attributeId: attrGarantiaId, value: '1 Año AppleCare Global' }
    ],
  });

  await ProductService.createProduct(tenantId, userId, {
    sku: 'MACBOOK-AIR-M3',
    barcode: '194253999999',
    name: 'MacBook Air 15" Chip M3 512GB',
    slug: 'macbook-air-15-m3-512gb',
    description: 'Increíblemente delgada y rápida con pantalla Liquid Retina y hasta 18 horas de batería.',
    shortDescription: 'Laptop ultraportátil con procesador M3',
    brandId: brandAppleId,
    categoryId: categoryTechId,
    modelName: 'Air M3 15"',
    color: 'Medianoche',
    size: '512GB SSD / 16GB RAM',
    material: 'Aluminio 100% Reciclado',
    warrantyInfo: '12 Meses AppleCare',

    priceUsd1: '1499.00000000',
    priceUsd2: '1399.00000000',
    priceUsd3: '1349.00000000',
    costUsd: '1100.00000000',
    onSale: false,

    stockQuantity: 8,
    minStockAlert: 2,
    isFeatured: true,
  });

  console.log('✅ Base de datos poblada con productos de prueba exitosamente.');
}

seed().catch(console.error);
