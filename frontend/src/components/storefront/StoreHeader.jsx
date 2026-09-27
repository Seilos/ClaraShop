import React from 'react';
import { ShoppingBag, Store, Globe, DollarSign } from 'lucide-react';

export function StoreHeader({ store, settings, cartItemCount, onOpenCart }) {
  return (
    <header
      className="apple-glass"
      style={{
        position: 'sticky',
        top: '16px',
        zIndex: 100,
        padding: '14px 24px',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--accent-primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            boxShadow: '0 4px 12px rgba(0, 122, 255, 0.3)',
          }}
        >
          <Store size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: '700', lineHeight: '1.2' }}>{store?.name || 'Tienda en Línea'}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Globe size={12} /> {store?.slug || 'tienda'}.midominio.com
            </span>
            <span>•</span>
            <span style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
              1 USD = {settings?.exchangeRate || '1.00000000'} {settings?.secondaryCurrencyCode || 'VES'} ({settings?.secondaryCurrencySymbol || 'Bs'})
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpenCart}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--accent-primary)',
          color: '#ffffff',
          border: 'none',
          fontWeight: '600',
          fontSize: '13px',
          cursor: 'pointer',
          boxShadow: '0 4px 14px rgba(0, 122, 255, 0.3)',
          transition: 'var(--transition-fast)',
        }}
      >
        <ShoppingBag size={18} />
        <span>Carrito</span>
        {cartItemCount > 0 && (
          <span
            style={{
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: '#ffffff',
              color: 'var(--accent-primary)',
              fontSize: '11px',
              fontWeight: '800',
            }}
          >
            {cartItemCount}
          </span>
        )}
      </button>
    </header>
  );
}
