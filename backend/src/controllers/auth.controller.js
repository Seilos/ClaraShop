import { AuthService } from '../services/auth.service.js';
import { registerTenantSchema, loginSchema } from '../../../shared/schemas/auth.schema.js';

/** Cookie name used for the refresh token across the auth flow */
const REFRESH_COOKIE = 'refreshToken';

/** Extract refresh token from cookie or body (fallback for API clients) */
function extractRefreshToken(req) {
  return req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken || null;
}

export class AuthController {
  static async registerTenant(req, res, next) {
    try {
      const validatedData = registerTenantSchema.parse(req.body);
      const result = await AuthService.registerTenant(validatedData);

      return res.status(201).json({
        success: true,
        message: 'Tienda y cuenta de usuario creadas exitosamente',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip || req.connection.remoteAddress;

      const result = await AuthService.login({ ...validatedData, userAgent, ipAddress });

      res.cookie(REFRESH_COOKIE, result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: (validatedData.rememberMe ? 7 : 1) * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: { accessToken: result.accessToken, user: result.user },
      });
    } catch (err) {
      next(err);
    }
  }

  /** Silently renew an expiring Access Token using the stored Refresh Token cookie */
  static async refresh(req, res, next) {
    try {
      const rawToken = extractRefreshToken(req);
      const result = await AuthService.refreshToken(rawToken);

      return res.status(200).json({
        success: true,
        data: { accessToken: result.accessToken, user: result.user },
      });
    } catch (err) {
      next(err);
    }
  }

  /** Log out from the current device — revokes only this session */
  static async logout(req, res, next) {
    try {
      const rawToken = extractRefreshToken(req);
      await AuthService.logout(rawToken);
      res.clearCookie(REFRESH_COOKIE);
      return res.status(200).json({ success: true, message: 'Sesión cerrada correctamente' });
    } catch (err) {
      next(err);
    }
  }

  /** Log out from all devices — revokes every session for this user */
  static async logoutAllDevices(req, res, next) {
    try {
      await AuthService.logoutAllDevices(req.user.userId);
      res.clearCookie(REFRESH_COOKIE);
      return res.status(200).json({ success: true, message: 'Todas las sesiones revocadas' });
    } catch (err) {
      next(err);
    }
  }
}
