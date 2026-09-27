import React, { useState } from 'react';
import { Search, Plus, Package, Tag, Check } from 'lucide-react';
import { convertCurrency, formatDecimal } from '../../../../shared/utils/math.js';

export function ProductSearchGrid({ products, settings, onAddToCart }) {
  const [search, setSearch] = useState('');
  const [addedProductId, setAddedProductId] = useState(null);

  const filteredProducts = (products || []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.modelName && p.modelName.toLowerCase().includes(search.toLowerCase())) ||
    (p.shortDescription && p.shortDescription.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAdd = (product) => {
    onAddToCart(product);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1200);
  };

  const exchangeRate = settings?.exchangeRate || '1.00000000';
  const currencyCode = settings?.secondaryCurrencyCode || 'VES';
  const currencySymbol = settings?.secondaryCurrencySymbol || 'Bs';

  return (
    <div>
      {/* Buscador Estilo Apple */}
      <div style={{ marginBottom: '24px', position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search size={20} style={{ position: 'absolute', left: '16px', color: 'var(--text-tertiary)' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar productos por nombre, modelo o categoría..."
          style={{
            width: '100%',
            padding: '14px 16px 14px 48px',
            fontSize: '15px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            outline: 'none',
            boxShadow: 'var(--shadow-sm)',
          }}
        />
      </div>

      {/* Grid de Productos */}
      {filteredProducts.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
          <Package size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>No se encontraron productos</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Intentá buscar con otros términos de búsqueda.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredProducts.map((p) => {
            const priceUsd = p.onSale && p.salePriceUsd ? p.salePriceUsd : p.priceUsd1;
            const convertedPrice = convertCurrency(priceUsd, exchangeRate);

            return (
              <div
                key={p.id}
                className="apple-glass"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    {p.modelName && (
                      <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                        {p.modelName}
                      </span>
                    )}
                    {p.onSale && (
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(255, 59, 48, 0.15)', color: 'var(--status-danger)', fontWeight: '700' }}>
                        ¡OFERTA!
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px', lineHeight: '1.3' }}>{p.name}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', minHeight: '36px' }}>
                    {p.shortDescription || p.description || ''}
                  </p>
                </div>

                <div>
                  {/* Bloque de Precios Dual-Currency (USD + Moneda Secundaria en 8 decimales) */}
                  <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)', marginBottom: '16px' }}>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>
                      $ {formatDecimal(priceUsd)} <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: '500' }}>USD</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--accent-primary)', fontWeight: '600', marginTop: '2px' }}>
                      ≈ {currencySymbol} {formatDecimal(convertedPrice)} {currencyCode}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAdd(p)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: addedProductId === p.id ? 'var(--status-success)' : 'var(--accent-primary)',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'var(--transition-fast)',
                    }}
                  >
                    {addedProductId === p.id ? (
                      <>
                        <Check size={18} /> ¡Agregado!
                      </>
                    ) : (
                      <>
                        <Plus size={18} /> Agregar al Carrito
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
