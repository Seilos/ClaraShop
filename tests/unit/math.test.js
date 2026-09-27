import { describe, it, expect } from 'vitest';
import {
  toDecimal,
  formatDecimal,
  addDecimal,
  subDecimal,
  mulDecimal,
  divDecimal,
  convertCurrency,
} from '../../shared/utils/math.js';

describe('Shared Math Utility (Precision 8 decimales)', () => {
  it('debe mantener 8 decimales exactos en formateo', () => {
    expect(formatDecimal('10.5')).toBe('10.50000000');
    expect(formatDecimal(100)).toBe('100.00000000');
  });

  it('debe realizar sumas exactas evitando problemas de float binario (0.1 + 0.2)', () => {
    // En JS normal float: 0.1 + 0.2 = 0.30000000000000004
    const result = addDecimal('0.1', '0.2');
    expect(result).toBe('0.30000000');
  });

  it('debe multiplicar montos y tasas de cambio con 8 decimales exactos', () => {
    const priceUsd = '125.75000000';
    const rate = '36.54321000'; // 1 USD = 36.54321000 Bs/Moneda local
    const converted = convertCurrency(priceUsd, rate);
    // 125.75 * 36.54321 = 4595.3086575 -> redondeado a 8 decimales: 4595.30865750
    expect(converted).toBe('4595.30865750');
  });

  it('debe lanzar error al intentar dividir por cero', () => {
    expect(() => divDecimal('100', '0')).toThrow('División por cero en cálculo decimal');
  });
});
