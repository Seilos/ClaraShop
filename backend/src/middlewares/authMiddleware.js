import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-dev-tienda-duilio-change-in-prod';

/**
 * Middleware para requerir autenticación JWT
 */
export function requireAuth(req, res, next) {
  let token = null;

  // 1. Intentar obtener desde header Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // 2. Fallback a cookie `accessToken`
  if (!token && req.cookies) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    logger.warn({ reqId: req.reqId, msg: 'Petición rechazada: Falta token de autenticación' });
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'No se proporcionó token de autenticación' },
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.tenantId = decoded.tenantId;
    next();
  } catch (err) {
    logger.warn({ reqId: req.reqId, err: err.message, msg: 'Token de autenticación expirado o inválido' });
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Token de autenticación expirado o inválido' },
    });
  }
}
