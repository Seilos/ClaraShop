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
    const host = window.location.host;
    const parts = host.split('.');
    if (parts.length > 2 || (parts.length === 2 && !host.includes('localhost'))) {
      config.headers['X-Tenant-Slug'] = parts[0];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuestas con Auto-Refresh silencioso para JWT expirados
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Si el servidor devuelve 401 (JWT expirado) y la petición aún no fue reintentada
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
        const newAccessToken = refreshRes.data?.data?.accessToken;

        if (newAccessToken) {
          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        // Si el refresh falla o expiró la sesión completa, redirigir al login limpiando la sesión
        window.location.reload();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

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
