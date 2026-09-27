import { randomUUID } from 'crypto';

/**
 * Middleware para asignar un ID único a cada petición y extraer el tenant del host o header.
 */
export function requestContextMiddleware(req, res, next) {
  // Asignar reqId único si no viene en los headers
  req.reqId = req.headers['x-request-id'] || `req-${Date.now()}-${randomUUID().substring(0, 8)}`;
  res.setHeader('X-Request-ID', req.reqId);

  // Extraer subdominio de la petición HTTP (ej: tienda1.localhost:3000 -> tenant_id: tienda1)
  const host = req.headers.host || '';
  const parts = host.split('.');
  
  if (parts.length > 2 || (parts.length === 2 && !host.includes('localhost'))) {
    req.tenantSlug = parts[0];
  } else {
    // Permitir fallback por header para desarrollo o APIs directas
    req.tenantSlug = req.headers['x-tenant-slug'] || null;
  }

  next();
}
