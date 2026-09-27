import { logger } from '../utils/logger.js';
import { ZodError } from 'zod';

/**
 * Middleware central de manejo de errores para cero fallas silenciosas.
 */
export function errorHandler(err, req, res, next) {
  const reqId = req.reqId || 'unknown-req';
  const tenantSlug = req.tenantSlug || 'no-tenant';

  // Manejo de errores de validación de Zod
  if (err instanceof ZodError) {
    logger.warn({
      reqId,
      tenantSlug,
      url: req.originalUrl,
      method: req.method,
      issues: err.issues,
      msg: 'Error de validación Zod en entrada de petición',
    });

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Los datos enviados no cumplen con el formato requerido',
        details: err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
      reqId,
    });
  }

  // Errores HTTP conocidos con statusCode personalizado
  const statusCode = err.statusCode || err.status || 500;
  const isServerError = statusCode >= 500;

  // Registrar con logger estructurado Pino
  if (isServerError) {
    logger.error({
      reqId,
      tenantSlug,
      url: req.originalUrl,
      method: req.method,
      err: {
        message: err.message,
        stack: err.stack,
        code: err.code,
      },
      msg: 'EXCEPCIÓN DE SERVIDOR CAPTURADA - Cero Falla Silenciosa',
    });
  } else {
    logger.warn({
      reqId,
      tenantSlug,
      url: req.originalUrl,
      method: req.method,
      message: err.message,
      msg: 'Excepción HTTP operacional',
    });
  }

  // Responder al cliente sin expone stacks internos en producción
  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || (isServerError ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST'),
      message: isServerError ? 'Ocurrió un error interno en el servidor' : err.message,
    },
    reqId,
  });
}
