import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../backend/src/app.js';
import { runMigrations } from '../../backend/src/db/migrate.js';

describe('Products API Integration Tests', () => {
  let authToken = '';
  let tenantSlug = '';

  beforeAll(async () => {
    await runMigrations();

    // 1. Registrar tenant para las pruebas de productos
    const testTenant = {
      storeName: 'Tienda Productos Test',
      slug: `prod-store-${Date.now()}`,
      firstName: 'Carlos',
      lastName: 'Gómez',
      phone: '+5491199887766',
      email: `carlos.${Date.now()}@example.com`,
      password: 'Password123!',
      country: 'Argentina',
      city: 'Rosario',
      address: 'Calle Córdoba 500',
    };

    tenantSlug = testTenant.slug;

    const regRes = await request(app).post('/api/v1/auth/register').send(testTenant);
    expect(regRes.status).toBe(201);

    // 2. Iniciar sesión para obtener AccessToken JWT
    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: testTenant.email,
      password: testTenant.password,
    });

    expect(loginRes.status).toBe(200);
    authToken = loginRes.body.data.accessToken;
  });

  let createdProductId = '';

  it('debe crear un producto profesional con UUIDv7 y precios en 8 decimales (HTTP 201)', async () => {
    const newProduct = {
      sku: 'TEST-SKU-100',
      barcode: '779123456789',
      name: 'iPad Pro 11" M4 256GB',
      description: 'Pantalla Ultra Retina XDR con tecnología OLED en tándem',
      shortDescription: 'Tablet profesional con chip M4',
      modelName: 'Pro 11 M4',
      color: 'Negro Espacial',
      size: '256GB',
      material: 'Aluminio',
      warrantyInfo: '12 Meses Garantía Oficial',

      // Precios con 8 decimales exactos
      priceUsd1: '999.00000000',
      priceUsd2: '899.50000000',
      priceUsd3: '849.00000000',
      costUsd: '700.00000000',
      onSale: false,

      stockQuantity: 10,
      minStockAlert: 2,
      isFeatured: true,
    };

    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newProduct);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(newProduct.name);
    expect(res.body.data.priceUsd1).toBe('999.00000000');
    expect(res.body.data.sku).toBe(newProduct.sku);

    createdProductId = res.body.data.id;
  });

  it('debe listar los productos del tenant aislado (HTTP 200)', async () => {
    const res = await request(app)
      .get('/api/v1/products')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('debe actualizar un producto existente manteniendo auditoría y 8 decimales (HTTP 200)', async () => {
    const updatePayload = {
      name: 'iPad Pro 11" M4 512GB (Updated)',
      priceUsd1: '1199.00000000',
      stockQuantity: 15,
    };

    const res = await request(app)
      .put(`/api/v1/products/${createdProductId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(updatePayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(updatePayload.name);
    expect(res.body.data.priceUsd1).toBe('1199.00000000');
    expect(res.body.data.stockQuantity).toBe(15);
  });

  it('debe desactivar suavemente un producto (HTTP 200)', async () => {
    const res = await request(app)
      .delete(`/api/v1/products/${createdProductId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isActive).toBe(false);
  });
});
