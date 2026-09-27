import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../backend/src/app.js';
import { runMigrations } from '../../backend/src/db/migrate.js';

describe('Public Storefront & Orders Integration Tests', () => {
  let tenantSlug = '';
  let productId = '';

  beforeAll(async () => {
    await runMigrations();

    const testTenant = {
      storeName: 'Tienda Checkout Test',
      slug: `order-store-${Date.now()}`,
      firstName: 'María',
      lastName: 'López',
      phone: '+5491133445566',
      email: `maria.${Date.now()}@example.com`,
      password: 'Password123!',
      country: 'Argentina',
      city: 'Mendoza',
      address: 'San Martín 100',
    };

    tenantSlug = testTenant.slug;

    const regRes = await request(app).post('/api/v1/auth/register').send(testTenant);
    expect(regRes.status).toBe(201);

    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: testTenant.email,
      password: testTenant.password,
    });
    const authToken = loginRes.body.data.accessToken;

    // Crear un producto de prueba
    const prodRes = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        sku: 'TEST-ORDER-PROD',
        name: 'Producto Test Pedido',
        priceUsd1: '150.00000000',
        stockQuantity: 20,
      });

    expect(prodRes.status).toBe(201);
    productId = prodRes.body.data.id;
  });

  it('debe obtener la información pública de la tienda y su catálogo (HTTP 200)', async () => {
    const res = await request(app).get(`/api/v1/public/storefront/${tenantSlug}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.store.slug).toBe(tenantSlug);
    expect(Array.isArray(res.body.data.products)).toBe(true);
  });

  it('debe procesar una orden pública y retornar enlace wa.me de WhatsApp (HTTP 201)', async () => {
    const checkoutData = {
      tenantSlug,
      customerName: 'Cliente Ejemplo',
      customerContact: '+5491199998888',
      paymentMethod: 'Transferencia Bancaria',
      country: 'Argentina',
      city: 'Mendoza',
      address: 'Calle Belgrano 456',
      items: [
        {
          productId,
          quantity: 2,
        },
      ],
    };

    const res = await request(app).post('/api/v1/public/orders').send(checkoutData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderNumber).toBeDefined();
    expect(res.body.data.totalUsd).toBe('300.00000000'); // 150 * 2 = 300.00000000 exacto
    expect(res.body.data.whatsappUrl).toContain('wa.me');
  });
});
