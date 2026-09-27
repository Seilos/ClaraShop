/**
 * useTenantSettings — TanStack Query hooks for Tenant Profile and Currency Settings
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api.js';

const KEYS = {
  profile: 'tenant-profile',
  settings: 'tenant-settings',
};

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

// ── Profile ───────────────────────────────────────────────────────────────────

export function useTenantProfile(accessToken) {
  return useQuery({
    queryKey: [KEYS.profile],
    queryFn: () => api.get('/tenant/profile', { headers: authHeaders(accessToken) }),
    select: (res) => res.data,
    enabled: !!accessToken,
  });
}

export function useUpdateTenantProfile(accessToken) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      api.put('/tenant/profile', data, { headers: authHeaders(accessToken) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.profile] });
    },
  });
}

// ── Settings & Currencies ─────────────────────────────────────────────────────

export function useTenantSettings(accessToken) {
  return useQuery({
    queryKey: [KEYS.settings],
    queryFn: () => api.get('/tenant/settings/currencies', { headers: authHeaders(accessToken) }),
    select: (res) => res.data,
    enabled: !!accessToken,
  });
}

export function useUpdateCurrencies(accessToken) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) =>
      api.put('/tenant/settings/currencies', data, { headers: authHeaders(accessToken) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.settings] });
    },
  });
}
