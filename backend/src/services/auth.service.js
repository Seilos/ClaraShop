import { db } from '../db/index.js';
import { tenants, users, sessions, passwordResets } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { logger } from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-dev-tienda-duilio-change-in-prod';
const ACCESS_TOKEN_EXPIRATION = '15m';

export class AuthService {
  /**
   * Registro completo de un nuevo Tenant con su Usuario Administrador
   */
  static async registerTenant(data) {
    const { storeName, slug, firstName, lastName, email, password, phone, country, city, address } = data;

    // 1. Verificar si el subdominio/slug ya existe
    const existingTenant = await db.select().from(tenants).where(eq(tenants.slug, slug)).get();
    if (existingTenant) {
      const err = new Error(`El subdominio '${slug}' ya está registrado por otra tienda.`);
      err.statusCode = 400;
      err.code = 'SLUG_ALREADY_EXISTS';
      throw err;
    }

    // 2. Hash de contraseña
    const passwordHash = await bcrypt.hash(password, 10);
    const tenantId = `tnt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // 3. Insertar Tenant
    await db.insert(tenants).values({
      id: tenantId,
      name: storeName,
      slug: slug.toLowerCase(),
      contactName: `${firstName} ${lastName}`,
      contactPhone: phone,
      contactEmail: email,
      country,
      city,
      address,
      isActive: true,
    });

    // 4. Insertar Usuario Administrador
    await db.insert(users).values({
      id: userId,
      tenantId,
      firstName,
      lastName,
      email: email.toLowerCase(),
      passwordHash,
      phone,
      role: 'tenant_admin',
      country,
      city,
      address,
      isActive: true,
    });

    logger.info({ tenantId, userId, slug, msg: 'Nuevo Tenant y usuario registrados exitosamente' });

    return {
      tenant: { id: tenantId, name: storeName, slug },
      user: { id: userId, firstName, lastName, email, role: 'tenant_admin' },
    };
  }

  /**
   * Autenticación de usuario y creación de sesión (Dual Token)
   */
  static async login({ email, password, rememberMe, userAgent, ipAddress }) {
    const user = await db.select().from(users).where(eq(users.email, email.toLowerCase())).get();
    if (!user) {
      const err = new Error('Credenciales inválidas');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const err = new Error('Credenciales inválidas');
      err.statusCode = 401;
      err.code = 'INVALID_CREDENTIALS';
      throw err;
    }

    const tenant = await db.select().from(tenants).where(eq(tenants.id, user.tenantId)).get();

    // Generar Access Token (15 min)
    const accessToken = jwt.sign(
      { userId: user.id, tenantId: user.tenantId, role: user.role, tenantSlug: tenant?.slug },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRATION }
    );

    // Generar Refresh Token (7 días con "Recordarme", o 1 día sin)
    const refreshTokenDurationDays = rememberMe ? 7 : 1;
    const expiresAt = new Date(Date.now() + refreshTokenDurationDays * 24 * 60 * 60 * 1000).toISOString();
    const refreshTokenRaw = `rt-${Date.now()}-${randomBytes(16).toString('hex')}`;
    const refreshTokenHash = await bcrypt.hash(refreshTokenRaw, 8);
    const sessionId = `ses-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Registrar sesión en SQLite
    await db.insert(sessions).values({
      id: sessionId,
      userId: user.id,
      tenantId: user.tenantId,
      refreshTokenHash,
      userAgent: userAgent || 'unknown',
      ipAddress: ipAddress || 'unknown',
      isRememberMe: !!rememberMe,
      expiresAt,
    });

    logger.info({ userId: user.id, tenantId: user.tenantId, sessionId, msg: 'Sesión creada exitosamente' });

    return {
      accessToken,
      refreshToken: `${sessionId}.${refreshTokenRaw}`,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantSlug: tenant?.slug,
      },
    };
  }
  /**
   * Renew an Access Token using a valid Refresh Token.
   * Refresh token format: "{sessionId}.{rawToken}"
   */
  static async refreshToken(rawRefreshToken) {
    if (!rawRefreshToken) {
      const err = new Error('Refresh token requerido');
      err.statusCode = 401;
      err.code = 'MISSING_REFRESH_TOKEN';
      throw err;
    }

    // Split composite token into its two parts
    const dotIndex = rawRefreshToken.indexOf('.');
    if (dotIndex === -1) {
      const err = new Error('Formato de refresh token inválido');
      err.statusCode = 401;
      err.code = 'INVALID_REFRESH_TOKEN';
      throw err;
    }

    const sessionId = rawRefreshToken.substring(0, dotIndex);
    const tokenPart = rawRefreshToken.substring(dotIndex + 1);

    // Look up session by ID (O(1) PK lookup — no table scan)
    const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).get();

    if (!session || session.isRevoked || new Date(session.expiresAt) < new Date()) {
      const err = new Error('Sesión expirada o revocada. Inicie sesión nuevamente.');
      err.statusCode = 401;
      err.code = 'SESSION_EXPIRED';
      throw err;
    }

    const isValidToken = await bcrypt.compare(tokenPart, session.refreshTokenHash);
    if (!isValidToken) {
      // Possible token theft — revoke the session immediately
      await db.update(sessions).set({ isRevoked: true }).where(eq(sessions.id, sessionId));
      logger.warn({ sessionId, msg: 'Posible robo de token detectado — sesión revocada' });
      const err = new Error('Refresh token inválido');
      err.statusCode = 401;
      err.code = 'INVALID_REFRESH_TOKEN';
      throw err;
    }

    const user = await db.select().from(users).where(eq(users.id, session.userId)).get();
    const tenant = await db.select().from(tenants).where(eq(tenants.id, session.tenantId)).get();

    const accessToken = jwt.sign(
      { userId: user.id, tenantId: user.tenantId, role: user.role, tenantSlug: tenant?.slug },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRATION }
    );

    logger.info({ sessionId, userId: user.id, msg: 'Access token renovado exitosamente' });

    return {
      accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantSlug: tenant?.slug,
      },
    };
  }

  /**
   * Revoke a specific session (logout from current device)
   * @param {string} sessionId - extracted from the composite refresh token
   */
  static async logout(rawRefreshToken) {
    if (!rawRefreshToken) return;

    const dotIndex = rawRefreshToken.indexOf('.');
    if (dotIndex === -1) return;

    const sessionId = rawRefreshToken.substring(0, dotIndex);

    await db.update(sessions).set({ isRevoked: true }).where(eq(sessions.id, sessionId));
    logger.info({ sessionId, msg: 'Sesión cerrada y revocada' });
  }

  /**
   * Revoke all active sessions for a user (logout from all devices)
   * @param {string} userId
   */
  static async logoutAllDevices(userId) {
    await db.update(sessions).set({ isRevoked: true }).where(eq(sessions.userId, userId));
    logger.info({ userId, msg: 'Todas las sesiones del usuario revocadas' });
  }
}
