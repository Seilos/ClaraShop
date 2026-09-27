import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../backend/src/app.js';
import { runMigrations } from '../../backend/src/db/migrate.js';

/**
 * Integration tests for the complete Auth flow:
 * register → login → refresh → logout → logout-all
 *
 * Each test in the "Session flow" describe block shares a single tenant
 * to verify state transitions (token issued → token renewed → session revoked).
 */
describe('Auth API Integration Tests', () => {
  beforeAll(() => runMigrations());

  const tenant = {
    storeName: 'Tienda Test Apple',
    slug: `test-store-${Date.now()}`,
    firstName: 'Juan',
    lastName: 'Pérez',
    phone: '+5491122334455',
    email: `juan.${Date.now()}@example.com`,
    password: 'Password123!',
    country: 'Argentina',
    city: 'Buenos Aires',
    address: 'Av. Corrientes 1234',
  };

  it('debe registrar un nuevo tenant (HTTP 201)', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(tenant);
    expect(res.status).toBe(201);
    expect(res.body.data.tenant.slug).toBe(tenant.slug);
    expect(res.body.data.user.email).toBe(tenant.email);
  });

  it('debe rechazar slug duplicado (HTTP 400)', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(tenant);
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('SLUG_ALREADY_EXISTS');
  });

  // ── Session lifecycle ──────────────────────────────────────────────────────
  describe('Session lifecycle (login → refresh → logout)', () => {
    let accessToken = '';
    let rawRefreshToken = '';

    it('login: devuelve accessToken + cookie refreshToken (HTTP 200)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: tenant.email, password: tenant.password, rememberMe: true });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();

      accessToken = res.body.data.accessToken;

      // Extract raw refresh token from Set-Cookie header for subsequent requests
      const cookieHeader = res.headers['set-cookie'][0];
      rawRefreshToken = cookieHeader.split('refreshToken=')[1].split(';')[0];
    });

    it('refresh: renueva el accessToken con un refreshToken válido (HTTP 200)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: rawRefreshToken });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user).toBeDefined();
    });

    it('refresh: rechaza un refreshToken con formato inválido (HTTP 401)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'token-sin-separador' });

      expect(res.status).toBe(401);
    });

    it('logout: revoca la sesión actual (HTTP 200)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken: rawRefreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('refresh: rechaza el token después del logout (HTTP 401)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: rawRefreshToken });

      expect(res.status).toBe(401);
    });
  });

  // ── Logout-all devices ─────────────────────────────────────────────────────
  describe('logout-all: revoca todas las sesiones del usuario', () => {
    let accessToken1 = '';
    let refreshToken1 = '';
    let accessToken2 = '';
    let refreshToken2 = '';

    beforeAll(async () => {
      // Open two independent sessions
      const login = async () => {
        const res = await request(app)
          .post('/api/v1/auth/login')
          .send({ email: tenant.email, password: tenant.password });
        const cookie = res.headers['set-cookie'][0];
        return {
          access: res.body.data.accessToken,
          refresh: cookie.split('refreshToken=')[1].split(';')[0],
        };
      };

      ({ access: accessToken1, refresh: refreshToken1 } = await login());
      ({ access: accessToken2, refresh: refreshToken2 } = await login());
    });

    it('debe revocar ambas sesiones con logout-all (HTTP 200)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/logout-all')
        .set('Authorization', `Bearer ${accessToken1}`);

      expect(res.status).toBe(200);
    });

    it('ningún refreshToken puede renovarse después de logout-all', async () => {
      const [r1, r2] = await Promise.all([
        request(app).post('/api/v1/auth/refresh').send({ refreshToken: refreshToken1 }),
        request(app).post('/api/v1/auth/refresh').send({ refreshToken: refreshToken2 }),
      ]);

      expect(r1.status).toBe(401);
      expect(r2.status).toBe(401);
    });
  });
});
