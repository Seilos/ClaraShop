/**
 * useCart — Shopping cart state with localStorage persistence
 *
 * Responsibilities:
 * - Keep cart items in state (reactive UI)
 * - Persist cart to localStorage so it survives page refreshes
 * - Expose add, remove, update quantity, clear actions
 * - Compute derived totals using decimal.js (no floats)
 */
import { useState, useCallback, useEffect } from 'react';
import Decimal from 'decimal.js';

const STORAGE_KEY = 'td_cart';
const DECIMAL_PRECISION = 8;

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

/** Read cart from localStorage; return [] on any error */
function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Safely format a Decimal value to N decimal places */
function fmt(value, places = DECIMAL_PRECISION) {
  return new Decimal(value).toFixed(places);
}

/** Compute cart totals — always via Decimal, never float arithmetic */
function computeTotals(items, exchangeRate = '1.00000000') {
  const totalUsd = items.reduce(
    (acc, item) => acc.plus(new Decimal(item.priceUsd1).times(item.quantity)),
    new Decimal(0)
  );
  const totalSecondary = totalUsd.times(new Decimal(exchangeRate));

  return {
    totalUsd: fmt(totalUsd),
    totalSecondary: fmt(totalSecondary),
    itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
  };
}

export function useCart(exchangeRate = '1.00000000') {
  const [items, setItems] = useState(() => readStorage());

  // Sync to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage might be full or restricted — silently skip
    }
  }, [items]);

  const addItem = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...product, quantity }];
    });
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === productId ? { ...i, quantity } : i))
    );
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  return {
    items,
    totals: computeTotals(items, exchangeRate),
    addItem,
    updateQuantity,
    removeItem,
    clear,
    isEmpty: items.length === 0,
  };
}
