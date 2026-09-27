import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { requestContextMiddleware } from './middlewares/requestContext.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { logger } from './utils/logger.js';

import authRoutes from './routes/auth.routes.js';
import tenantRoutes from './routes/tenant.routes.js';
import productRoutes from './routes/product.routes.js';
import catalogRoutes from './routes/catalog.routes.js';
import publicRoutes from './routes/public.routes.js';

const app = express();

// Middlewares de seguridad y parsing
app.use(helmet());
app.use(
  cors({
    origin: true, // Configurable por variable de entorno en producción
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Contexto de petición (reqId + tenantSlug)
app.use(requestContextMiddleware);

// Rutas de la API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tenant', tenantRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/catalog', catalogRoutes);
app.use('/api/v1/public', publicRoutes);

// Healthcheck & API Status
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), reqId: req.reqId });
});

app.get('/', (req, res) => {
  res.json({
    name: 'Tienda Duilio API Backend',
    status: 'online',
    version: '1.0.0',
    frontendUrl: 'http://localhost:5173',
    endpoints: '/api/v1',
  });
});

// Endpoint de telemetría de errores del cliente Frontend
app.post('/api/v1/telemetry/errors', (req, res) => {
  const { error, info, clientUrl, userAgent } = req.body || {};
  logger.error({
    source: 'FRONTEND_CLIENT_TELEMETRY',
    reqId: req.reqId,
    tenantSlug: req.tenantSlug,
    clientUrl,
    userAgent,
    err: error,
    info,
    msg: 'Error del cliente React capturado via Telemetría',
  });
  res.status(200).json({ received: true });
});

// Middleware central de manejo de errores
app.use(errorHandler);

export default app;
