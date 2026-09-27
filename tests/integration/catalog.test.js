import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../backend/src/app.js';
import { runMigrations } from '../../backend/src/db/migrate.js';

/**
 * Integration tests for Catalog API (Brands, Categories, Custom & Master Attributes)
 * Each test is isolated under a unique tenant created at setup time.
 */
describe('Catalog API Integration Tests', () => {
  let authToken = '';

  beforeAll(async () => {
    await runMigrations();

    const tenant = {
      storeName: 'Tienda Catálogo Test',
      slug: `catalog-${Date.now()}`,
      firstName: 'Ana',
      lastName: 'López',
      phone: '+5491155443322',
      email: `ana.catalog.${Date.now()}@example.com`,
      password: 'Password123!',
      country: 'Argentina',
      city: 'Mendoza',
      address: 'Av. San Martín 100',
    };

    const regRes = await request(app).post('/api/v1/auth/register').send(tenant);
    expect(regRes.status).toBe(201);

    const loginRes = await request(app).post('/api/v1/auth/login').send({
      email: tenant.email,
      password: tenant.password,
    });
    expect(loginRes.status).toBe(200);
    authToken = loginRes.body.data.accessToken;
  });

  // ── Brands ────────────────────────────────────────────────────────────────

  describe('Brands', () => {
    let brandId = '';

    it('debe crear una marca (HTTP 201)', async () => {
      const res = await request(app)
        .post('/api/v1/catalog/brands')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Samsung', logoUrl: 'https://example.com/samsung.png' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Samsung');
      brandId = res.body.data.id;
    });

    it('debe listar marcas del tenant (HTTP 200)', async () => {
      const res = await request(app)
        .get('/api/v1/catalog/brands')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('debe actualizar una marca (HTTP 200)', async () => {
      const res = await request(app)
        .put(`/api/v1/catalog/brands/${brandId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Samsung Electronics' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Samsung Electronics');
    });

    it('debe eliminar una marca (HTTP 200)', async () => {
      const res = await request(app)
        .delete(`/api/v1/catalog/brands/${brandId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('debe rechazar eliminar una marca inexistente (HTTP 404)', async () => {
      const res = await request(app)
        .delete('/api/v1/catalog/brands/id-que-no-existe')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ── Categories ────────────────────────────────────────────────────────────

  describe('Categories', () => {
    let categoryId = '';

    it('debe crear una categoría y generar slug automáticamente (HTTP 201)', async () => {
      const res = await request(app)
        .post('/api/v1/catalog/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Electrónica Gadgets' });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Electrónica Gadgets');
      expect(res.body.data.slug).toBe('electronica-gadgets');
      categoryId = res.body.data.id;
    });

    it('debe listar categorías del tenant (HTTP 200)', async () => {
      const res = await request(app)
        .get('/api/v1/catalog/categories')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('debe actualizar una categoría y regenerar slug (HTTP 200)', async () => {
      const res = await request(app)
        .put(`/api/v1/catalog/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Electrónica' });

      expect(res.status).toBe(200);
      expect(res.body.data.slug).toBe('electronica');
    });

    it('debe eliminar una categoría (HTTP 200)', async () => {
      const res = await request(app)
        .delete(`/api/v1/catalog/categories/${categoryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
    });
  });

  // ── Master Attributes & Values ────────────────────────────────────────────

  describe('Master Attributes & Values', () => {
    let attributeId = '';
    let valueId = '';

    it('debe crear un atributo personalizado (HTTP 201)', async () => {
      const res = await request(app)
        .post('/api/v1/catalog/attributes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Voltaje' });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Voltaje');
      attributeId = res.body.data.id;
    });

    it('debe crear un valor para el atributo (HTTP 201)', async () => {
      const res = await request(app)
        .post(`/api/v1/catalog/attributes/${attributeId}/values`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ value: '220V' });

      expect(res.status).toBe(201);
      expect(res.body.data.value).toBe('220V');
      valueId = res.body.data.id;
    });

    it('debe listar valores del atributo (HTTP 200)', async () => {
      const res = await request(app)
        .get(`/api/v1/catalog/attributes/${attributeId}/values`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
    });

    it('debe eliminar un valor de atributo (HTTP 200)', async () => {
      const res = await request(app)
        .delete(`/api/v1/catalog/attributes/values/${valueId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
    });

    it('debe eliminar un atributo personalizado (HTTP 200)', async () => {
      const res = await request(app)
        .delete(`/api/v1/catalog/attributes/${attributeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
    });

    it('debe rechazar creación de atributo sin nombre (HTTP 400)', async () => {
      const res = await request(app)
        .post('/api/v1/catalog/attributes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '' });

      expect(res.status).toBe(400);
    });
  });

  // ── Tenant isolation ─────────────────────────────────────────────────────

  it('no debe devolver marcas de otro tenant', async () => {
    const tenant2 = {
      storeName: 'Otra Tienda',
      slug: `other-${Date.now()}`,
      firstName: 'Pedro',
      lastName: 'García',
      phone: '+5491166554433',
      email: `pedro.${Date.now()}@example.com`,
      password: 'Password123!',
      country: 'Colombia',
      city: 'Bogotá',
      address: 'Calle 10 #5-20',
    };

    await request(app).post('/api/v1/auth/register').send(tenant2);
    const login2 = await request(app).post('/api/v1/auth/login').send({
      email: tenant2.email,
      password: tenant2.password,
    });
    const token2 = login2.body.data.accessToken;

    const res = await request(app)
      .get('/api/v1/catalog/brands')
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(0);
  });
});
