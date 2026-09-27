/**
 * useProducts — TanStack Query hooks for product operations (tenant dashboard)
 *
 * Each hook has a single responsibility:
 * - useProductsList   → paginated/filtered product list
 * - useProductById    → single product detail
 * - useCreateProduct  → mutation: create
 * - useUpdateProduct  → mutation: update
 * - useDeactivateProduct → mutation: soft-delete
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api.js';

const QUERY_KEY = 'products';

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * @param {object} filters - { search?, categoryId?, brandId?, onlyActive? }
 * @param {string} accessToken
 */
export function useProductsList(filters = {}, accessToken) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: () =>
      api.get('/products', {
        params: filters,
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    select: (res) => res.data,
    enabled: !!accessToken,
    staleTime: 30_000, // 30s — product lists can be slightly stale
  });
}

/**
 * @param {string} productId
 * @param {string} accessToken
 */
export function useProductById(productId, accessToken) {
  return useQuery({
    queryKey: [QUERY_KEY, productId],
    queryFn: () =>
      api.get(`/products/${productId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    select: (res) => res.data,
    enabled: !!productId && !!accessToken,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateProduct(accessToken) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      api.post('/products', data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}

export function useUpdateProduct(accessToken) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }) =>
      api.put(`/products/${id}`, data, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
    },
  });
}

export function useDeactivateProduct(accessToken) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId) =>
      api.delete(`/products/${productId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
}
