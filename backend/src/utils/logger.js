import pino from 'pino';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, '../../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const errorLogPath = path.join(logsDir, 'error.log');
const combinedLogPath = path.join(logsDir, 'combined.log');

const targets = [
  // Consola en desarrollo con formato legible
  {
    target: 'pino-pretty',
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    options: {
      colorize: true,
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
      ignore: 'pid,hostname',
    },
  },
  // Archivo de logs de errores graves
  {
    target: 'pino/file',
    level: 'error',
    options: { destination: errorLogPath, mkdir: true },
  },
  // Archivo de logs combinados (auditoría completa)
  {
    target: 'pino/file',
    level: 'info',
    options: { destination: combinedLogPath, mkdir: true },
  },
];

export const logger = pino({
  level: process.env.LOG_LEVEL || 'debug',
  base: {
    env: process.env.NODE_ENV || 'development',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: {
    targets,
  },
});

export default logger;
