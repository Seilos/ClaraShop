/**
 * useStorefront — TanStack Query hooks for the public store page
 *
 * - useStorefrontData: fetch store info + active products by slug
 * - useCreateOrder: submit a public order (no auth required)
 */
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../utils/api.js';

/**
 * Fetch the public storefront data for a given tenant slug.
 * Enabled only when a slug is provided — avoids requests on unmounted pages.
 */
export function useStorefrontData(slug) {
  return useQuery({
    queryKey: ['storefront', slug],
    queryFn: () => api.get(`/public/storefront/${slug}`),
    select: (res) => res.data,
    enabled: !!slug,
    staleTime: 60_000, // Product catalog can be slightly stale for public visitors
    retry: 1,
  });
}

/**
 * Submit a public checkout order.
 * On success, returns { orderId, orderNumber, totalUsd, totalSecondary, whatsappUrl }
 */
export function useCreateOrder() {
  return useMutation({
    mutationFn: async (orderData) => {
      const res = await api.post('/public/orders', orderData);
      return res.data;
    },
  });
}
