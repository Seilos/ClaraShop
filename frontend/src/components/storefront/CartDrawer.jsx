import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { addDecimal, mulDecimal, convertCurrency, formatDecimal } from '../../../../shared/utils/math.js';

export function CartDrawer({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, settings, onProceedToCheckout }) {
  if (!isOpen) return null;

  const exchangeRate = settings?.exchangeRate || '1.00000000';
  const currencyCode = settings?.secondaryCurrencyCode || 'VES';
  const currencySymbol = settings?.secondaryCurrencySymbol || 'Bs';

  // Calcular subtotal exacto en USD usando decimal.js
  let totalUsd = '0.00000000';
  cartItems.forEach((item) => {
    const price = item.onSale && item.salePriceUsd ? item.salePriceUsd : item.priceUsd1;
    const itemSubtotal = mulDecimal(price, item.quantity);
    totalUsd = addDecimal(totalUsd, itemSubtotal);
  });

  const totalSecondary = convertCurrency(totalUsd, exchangeRate);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        className="apple-glass"
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100vh',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px',
        }}
      >
        {/* Cabecera del Carrito */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} style={{ color: 'var(--accent-primary)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Carrito de Compras</h3>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Lista de Productos en el Carrito */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
              El carrito está vacío. Agregá productos para comenzar tu orden.
            </div>
          ) : (
            cartItems.map((item) => {
              const price = item.onSale && item.salePriceUsd ? item.salePriceUsd : item.priceUsd1;
              const subtotal = mulDecimal(price, item.quantity);

              return (
                <div
                  key={item.id}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ flex: 1, paddingRight: '12px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '2px' }}>{item.name}</h4>
                    <div style={{ fontSize: '13px', color: 'var(--accent-primary)', fontWeight: '600' }}>
                      $ {formatDecimal(price)} USD
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                      Subtotal: $ {formatDecimal(subtotal)} USD
                    </div>
                  </div>

                  {/* Controles de Cantidad (+ / -) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        style={{ padding: '6px 8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ padding: '0 8px', fontSize: '13px', fontWeight: '700' }}>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        style={{ padding: '6px 8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-danger)', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pie del Carrito con Totales y Botón Checkout */}
        {cartItems.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <div style={{ padding: '12px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Total USD:</span>
                <strong style={{ fontSize: '16px' }}>$ {formatDecimal(totalUsd)} USD</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--accent-primary)', fontWeight: '600' }}>
                <span>Total {currencyCode}:</span>
                <span>{currencySymbol} {formatDecimal(totalSecondary)} {currencyCode}</span>
              </div>
            </div>

            <Button type="button" variant="primary" onClick={onProceedToCheckout} fullWidth icon={ArrowRight}>
              Procesar Pedido
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
