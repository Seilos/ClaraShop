/**
 * useCatalog — TanStack Query hooks for Brands, Categories and Master Attributes
 *
 * Mirrors the /api/v1/catalog/ endpoints with the same pattern as useProducts:
 * one hook per operation, single responsibility, queryKey-scoped invalidations.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api.js';

// ── Query keys ────────────────────────────────────────────────────────────────
const KEYS = {
  brands: 'catalog-brands',
  categories: 'catalog-categories',
  attributes: 'catalog-attributes',
  attributeValues: 'catalog-attribute-values',
};

// ── Helper ────────────────────────────────────────────────────────────────────
function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

// ── Brands ────────────────────────────────────────────────────────────────────

export function useBrands(accessToken, categoryId = null) {
  return useQuery({
    queryKey: [KEYS.brands, categoryId],
    queryFn: () => {
      const params = categoryId ? `?categoryId=${categoryId}` : '';
      return api.get(`/catalog/brands${params}`, { headers: authHeaders(accessToken) });
    },
    select: (res) => res.data,
    enabled: !!accessToken,
    staleTime: 30_000,
  });
}

export function useCreateBrand(accessToken) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/catalog/brands', data, { headers: authHeaders(accessToken) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.brands] }),
  });
}

export function useUpdateBrand(accessToken) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/catalog/brands/${id}`, data, { headers: authHeaders(accessToken) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.brands] }),
  });
}

export function useDeleteBrand(accessToken) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/catalog/brands/${id}`, { headers: authHeaders(accessToken) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.brands] }),
  });
}

// ── Categories ────────────────────────────────────────────────────────────────

export function useCategories(accessToken) {
  return useQuery({
    queryKey: [KEYS.categories],
    queryFn: () => api.get('/catalog/categories', { headers: authHeaders(accessToken) }),
    select: (res) => res.data,
    enabled: !!accessToken,
    staleTime: 60_000,
  });
}

export function useCreateCategory(accessToken) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/catalog/categories', data, { headers: authHeaders(accessToken) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.categories] }),
  });
}

export function useUpdateCategory(accessToken) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/catalog/categories/${id}`, data, { headers: authHeaders(accessToken) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.categories] }),
  });
}

export function useDeleteCategory(accessToken) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/catalog/categories/${id}`, { headers: authHeaders(accessToken) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.categories] }),
  });
}

// ── Master Attributes ─────────────────────────────────────────────────────────

export function useAttributes(accessToken) {
  return useQuery({
    queryKey: [KEYS.attributes],
    queryFn: () => api.get('/catalog/attributes', { headers: authHeaders(accessToken) }),
    select: (res) => res.data,
    enabled: !!accessToken,
    staleTime: 60_000,
  });
}

export function useCreateAttribute(accessToken) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/catalog/attributes', data, { headers: authHeaders(accessToken) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.attributes] }),
  });
}

export function useUpdateAttribute(accessToken) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/catalog/attributes/${id}`, data, { headers: authHeaders(accessToken) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.attributes] }),
  });
}

export function useDeleteAttribute(accessToken) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/catalog/attributes/${id}`, { headers: authHeaders(accessToken) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEYS.attributes] }),
  });
}

// ── Master Attribute Values ───────────────────────────────────────────────────

export function useAllAttributeValues(accessToken) {
  return useQuery({
    queryKey: [KEYS.attributeValues, 'all'],
    queryFn: () => api.get('/catalog/attributes/values/all', { headers: authHeaders(accessToken) }),
    select: (res) => res.data,
    enabled: !!accessToken,
    staleTime: 60_000,
  });
}

export function useAttributeValues(accessToken, attributeId) {
  return useQuery({
    queryKey: [KEYS.attributeValues, attributeId],
    queryFn: () => api.get(`/catalog/attributes/${attributeId}/values`, { headers: authHeaders(accessToken) }),
    select: (res) => res.data,
    enabled: !!accessToken && !!attributeId,
    staleTime: 60_000,
  });
}

export function useCreateAttributeValue(accessToken) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ attributeId, ...data }) =>
      api.post(`/catalog/attributes/${attributeId}/values`, data, { headers: authHeaders(accessToken) }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: [KEYS.attributeValues] });
      qc.invalidateQueries({ queryKey: [KEYS.attributes] });
    },
  });
}

export function useUpdateAttributeValue(accessToken) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.put(`/catalog/attributes/values/${id}`, data, { headers: authHeaders(accessToken) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.attributeValues] });
    },
  });
}

export function useDeleteAttributeValue(accessToken) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/catalog/attributes/values/${id}`, { headers: authHeaders(accessToken) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEYS.attributeValues] });
      qc.invalidateQueries({ queryKey: [KEYS.attributes] });
    },
  });
}
