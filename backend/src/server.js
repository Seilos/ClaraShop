import app from './app.js';
import { logger } from './utils/logger.js';
import { runMigrations } from './db/migrate.js';

const PORT = process.env.PORT || 4017;

// Capturador global de excepciones no atrapadas
process.on('uncaughtException', (err) => {
  logger.fatal({
    err: {
      message: err.message,
      stack: err.stack,
    },
    msg: 'CRITICAL: Exception no atrapada detectada (uncaughtException). El proceso terminará.',
  });
  process.exit(1);
});

// Capturador global de promesas rechazadas no atrapadas
process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({
    reason: reason instanceof Error ? { message: reason.message, stack: reason.stack } : reason,
    msg: 'CRITICAL: Promesa rechazada no atrapada (unhandledRejection).',
  });
});

// Ejecutar migraciones e iniciar servidor HTTP
runMigrations()
  .then(() => {
    app.listen(PORT, () => {
      logger.info({
        port: PORT,
        env: process.env.NODE_ENV || 'development',
        msg: `Servidor HTTP escuchando en puerto ${PORT}`,
      });
    });
  })
  .catch((err) => {
    logger.fatal({ err, msg: 'Error fatal al ejecutar migraciones de la base de datos' });
    process.exit(1);
  });
