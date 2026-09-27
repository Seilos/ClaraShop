import Decimal from 'decimal.js';

// Configuración global de precisión a 8 decimales con redondeo half-up
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export const DECIMAL_PLACES = 8;

/**
 * Convierte cualquier valor numérico/string a Decimal configurado a 8 decimales.
 * @param {string|number|Decimal} value
 * @returns {Decimal}
 */
export function toDecimal(value) {
  if (value === null || value === undefined || value === '') {
    return new Decimal(0);
  }
  return new Decimal(value);
}

/**
 * Formatea un valor decimal a string con 8 decimales exactos.
 * @param {string|number|Decimal} value
 * @returns {string}
 */
export function formatDecimal(value) {
  return toDecimal(value).toFixed(DECIMAL_PLACES);
}

/**
 * Suma valores con precisión decimal estricta.
 * @param {string|number|Decimal} a
 * @param {string|number|Decimal} b
 * @returns {string}
 */
export function addDecimal(a, b) {
  return toDecimal(a).plus(toDecimal(b)).toFixed(DECIMAL_PLACES);
}

/**
 * Resta valores con precisión decimal estricta.
 * @param {string|number|Decimal} a
 * @param {string|number|Decimal} b
 * @returns {string}
 */
export function subDecimal(a, b) {
  return toDecimal(a).minus(toDecimal(b)).toFixed(DECIMAL_PLACES);
}

/**
 * Multiplica valores con precisión decimal estricta.
 * @param {string|number|Decimal} a
 * @param {string|number|Decimal} b
 * @returns {string}
 */
export function mulDecimal(a, b) {
  return toDecimal(a).times(toDecimal(b)).toFixed(DECIMAL_PLACES);
}

/**
 * Divide valores con precisión decimal estricta.
 * @param {string|number|Decimal} a
 * @param {string|number|Decimal} b
 * @returns {string}
 */
export function divDecimal(a, b) {
  const divisor = toDecimal(b);
  if (divisor.isZero()) {
    throw new Error('División por cero en cálculo decimal');
  }
  return toDecimal(a).dividedBy(divisor).toFixed(DECIMAL_PLACES);
}

/**
 * Convierte un monto USD a la moneda secundaria utilizando la tasa de cambio.
 * @param {string|number} amountUsd - Monto en USD
 * @param {string|number} exchangeRate - Tasa de cambio (1 USD = X moneda secundaria)
 * @returns {string} Monto convertido formateado a 8 decimales
 */
export function convertCurrency(amountUsd, exchangeRate) {
  return mulDecimal(amountUsd, exchangeRate);
}
