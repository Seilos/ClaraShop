import React, { useState } from 'react';
import { Settings, Store, DollarSign, ChevronDown, ChevronRight, LogOut, Package, Layers, Palette } from 'lucide-react';

export function Sidebar({ activeView, setActiveView, tenantName, onLogout }) {
  const [isConfigOpen, setIsConfigOpen] = useState(true);

  const navItemStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    fontSize: '13.5px',
    fontWeight: isActive ? '600' : '500',
    borderRadius: 'var(--radius-sm)',
    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
    backgroundColor: isActive ? 'var(--accent-subtle)' : 'transparent',
    cursor: 'pointer',
    border: 'none',
    width: '100%',
    textAlign: 'left',
    transition: 'var(--transition-fast)',
    marginBottom: '4px',
  });

  return (
    <aside
      className="apple-glass"
      style={{
        width: '260px',
        minHeight: 'calc(100vh - 48px)',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginRight: '24px',
      }}
    >
      <div>
        {/* Cabecera Sidebar */}
        <div style={{ padding: '0 8px 20px 8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
              }}
            >
              <Store size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', lineHeight: '1.2' }}>{tenantName || 'Mi Tienda'}</h3>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '500' }}>Panel de Control</span>
            </div>
          </div>
        </div>

        {/* Sección Productos & Catálogo */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ padding: '0 12px 6px 12px', fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Gestión de Tienda
          </div>
          <button
            type="button"
            onClick={() => setActiveView('products')}
            style={navItemStyle(activeView === 'products')}
          >
            <Package size={16} />
            <span>Productos & Inventario</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('catalog')}
            style={navItemStyle(activeView === 'catalog')}
          >
            <Layers size={16} />
            <span>Marcas & Categorías</span>
          </button>
        </div>

        {/* Menú Desplegable de Configuración */}
        <div style={{ marginBottom: '8px' }}>
          <button
            type="button"
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '10px 12px',
              fontSize: '11px',
              fontWeight: '700',
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={15} />
              <span>Configuración</span>
            </div>
            {isConfigOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {/* Submenús replegables */}
          {isConfigOpen && (
            <div style={{ paddingLeft: '12px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setActiveView('profile')}
                style={navItemStyle(activeView === 'profile')}
              >
                <Store size={16} />
                <span>Perfil de Tienda</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('currencies')}
                style={navItemStyle(activeView === 'currencies')}
              >
                <DollarSign size={16} />
                <span>Monedas & Tasa</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('styles')}
                style={navItemStyle(activeView === 'styles')}
              >
                <Palette size={16} />
                <span>Estilos de Tienda</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pie de Sidebar con botón de Salida */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
        <button
          type="button"
          onClick={onLogout}
          style={{
            ...navItemStyle(false),
            color: 'var(--status-danger)',
          }}
        >
          <LogOut size={16} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
