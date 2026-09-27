import axios from 'axios';

export const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Interceptor de peticiones para inyectar subdominio / tenant actual si aplica
api.interceptors.request.use(
  (config) => {
    // Si estamos en desarrollo local o subdominio
    const host = window.location.host;
    const parts = host.split('.');
    if (parts.length > 2 || (parts.length === 2 && !host.includes('localhost'))) {
      config.headers['X-Tenant-Slug'] = parts[0];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuestas para manejo centralizado de errores sin fallas silenciosas
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const errorData = error.response?.data || {
      success: false,
      error: { code: 'NETWORK_ERROR', message: 'No se pudo establecer conexión con el servidor' },
    };

    // Reportar telemetría en caso de error 5xx
    if (error.response?.status >= 500) {
      try {
        await axios.post('/api/v1/telemetry/errors', {
          clientUrl: window.location.href,
          userAgent: navigator.userAgent,
          error: {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
          },
        });
      } catch (telemetryErr) {
        console.error('Fallo en reporte de telemetría:', telemetryErr);
      }
    }

    return Promise.reject(errorData);
  }
);

export default api;
