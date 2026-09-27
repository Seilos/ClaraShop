import React, { useState } from 'react';
import { Plus, Search, Package, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { useProductsList, useDeactivateProduct } from '../../hooks/useProducts.js';

export function ProductsList({ accessToken, onOpenCreateModal }) {
  const [search, setSearch] = useState('');
  const { data: productsData = [], isLoading, isError } = useProductsList({ search }, accessToken);
  const deactivateProductMutation = useDeactivateProduct(accessToken);

  const handleDeactivate = async (productId, productName) => {
    if (!window.confirm(`¿Estás seguro de desactivar "${productName}"?`)) return;
    try {
      await deactivateProductMutation.mutateAsync(productId);
    } catch (err) {
      alert('Error al desactivar producto');
    }
  };

  const filteredProducts = Array.isArray(productsData) ? productsData : [];

  return (
    <div className="apple-glass" style={{ padding: '28px' }}>
      {/* Cabecera del Catálogo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Catálogo de Productos</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Gestión profesional de inventario, precios multi-nivel (8 decimales) y características.
          </p>
        </div>

        <Button variant="primary" onClick={onOpenCreateModal} icon={Plus}>
          Nuevo Producto
        </Button>
      </div>

      {/* Buscador y Filtros */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, SKU o modelo..."
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              fontSize: '14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Grid / Lista de Productos */}
      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Cargando productos...
        </div>
      ) : isError ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--status-danger)' }}>
          Error al cargar los productos.
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)' }}>
          <Package size={48} style={{ color: 'var(--text-tertiary)', marginBottom: '12px' }} />
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>No hay productos en el catálogo</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Hacé clic en "Nuevo Producto" para agregar el primero con precios en 8 decimales.
          </p>
          <Button variant="primary" onClick={onOpenCreateModal} icon={Plus}>
            Agregar Producto
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {p.sku || 'SIN SKU'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: p.isActive ? 'rgba(52, 199, 89, 0.15)' : 'rgba(255, 59, 48, 0.15)',
                        color: p.isActive ? 'var(--status-success)' : 'var(--status-danger)',
                        fontWeight: '600',
                      }}
                    >
                      {p.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeactivate(p.id, p.name)}
                      title="Desactivar producto"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>{p.name}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', minHeight: '32px' }}>
                  {p.shortDescription || p.description || 'Sin descripción'}
                </p>

                {/* Precios Multi-nivel USD */}
                <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Precio 1 (Minorista):</span>
                    <strong style={{ color: 'var(--accent-primary)' }}>$ {p.priceUsd1} USD</strong>
                  </div>
                  {p.priceUsd2 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      <span>Precio 2 (Mayorista):</span>
                      <span>$ {p.priceUsd2} USD</span>
                    </div>
                  )}
                  {p.priceUsd3 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      <span>Precio 3 (VIP):</span>
                      <span>$ {p.priceUsd3} USD</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Pie de tarjeta con stock */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', marginTop: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Package size={14} />
                  <span>Stock: <strong>{p.stockQuantity}</strong> un.</span>
                </div>

                {p.modelName && (
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Mod: {p.modelName}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

