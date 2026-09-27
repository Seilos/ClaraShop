/**
 * useAuth — Authentication state & token management
 *
 * Responsibilities:
 * - Store the access token in memory (never in localStorage — XSS risk)
 * - Provide login, logout, logoutAll, and refresh actions
 * - Expose the decoded user payload and loading state
 *
 * The refresh token lives in an HttpOnly cookie (managed by the server).
 * This hook only knows about the short-lived access token.
 */
import { useState, useCallback, useRef } from 'react';
import api from '../utils/api.js';

const REFRESH_ENDPOINT = '/auth/refresh';
const LOGIN_ENDPOINT = '/auth/login';
const LOGOUT_ENDPOINT = '/auth/logout';
const LOGOUT_ALL_ENDPOINT = '/auth/logout-all';

/** Decode a JWT payload without verifying the signature (client-side display only) */
function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export function useAuth() {
  const [accessToken, setAccessToken] = useState(() => null);
  const [user, setUser] = useState(() => null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ref so interceptors always read the latest token without stale closure
  const tokenRef = useRef(accessToken);
  tokenRef.current = accessToken;

  /** Persist a new token and decode the user payload from it */
  const applyToken = useCallback((token) => {
    setAccessToken(token);
    setUser(decodeJwtPayload(token));
  }, []);

  /** Attempt to silently restore a session using the HttpOnly refresh-token cookie */
  const tryRefresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.post(REFRESH_ENDPOINT);
      applyToken(data.data.accessToken);
      return true;
    } catch {
      setAccessToken(null);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [applyToken]);

  const login = useCallback(async ({ email, password, rememberMe = false }) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.post(LOGIN_ENDPOINT, { email, password, rememberMe });
      applyToken(data.data.accessToken);
      return data.data.user;
    } catch (err) {
      setError(err?.error?.message || 'Error al iniciar sesión');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [applyToken]);

  const logout = useCallback(async () => {
    try {
      await api.post(LOGOUT_ENDPOINT, {}, {
        headers: { Authorization: `Bearer ${tokenRef.current}` },
      });
    } catch {
      // Best-effort: clear local state even if the server call fails
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const logoutAll = useCallback(async () => {
    try {
      await api.post(LOGOUT_ALL_ENDPOINT, {}, {
        headers: { Authorization: `Bearer ${tokenRef.current}` },
      });
    } catch {
      // Best-effort
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  return {
    accessToken,
    user,
    isLoading,
    error,
    isAuthenticated: !!accessToken,
    login,
    logout,
    logoutAll,
    tryRefresh,
  };
}
