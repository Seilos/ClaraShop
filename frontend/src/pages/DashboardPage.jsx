import React, { useState } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar.jsx';
import { ProfileSettings } from '../components/dashboard/ProfileSettings.jsx';
import { CurrencySettings } from '../components/dashboard/CurrencySettings.jsx';
import { StyleSettings } from '../components/dashboard/StyleSettings.jsx';
import { ProductsList } from '../components/dashboard/ProductsList.jsx';
import { CatalogManager } from '../components/dashboard/CatalogManager.jsx';
import { CreateProductModal } from '../components/dashboard/CreateProductModal.jsx';
import { User } from 'lucide-react';

export function DashboardPage({ user, accessToken, onLogout }) {
  const [activeView, setActiveView] = useState('products'); // 'products' | 'catalog' | 'profile' | 'currencies' | 'styles'
  const [selectedTheme, setSelectedTheme] = useState(() => {
    return localStorage.getItem('clarashop_theme') || 'clarashop';
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleThemeChange = (newTheme) => {
    setSelectedTheme(newTheme);
    localStorage.setItem('clarashop_theme', newTheme);
  };

  const getHeaderTitle = () => {
    switch (activeView) {
      case 'products':
        return 'Catálogo de Productos';
      case 'catalog':
        return 'Marcas & Categorías';
      case 'profile':
        return 'Perfil de Tienda';
      case 'currencies':
        return 'Monedas & Tasa de Cambio';
      case 'styles':
        return 'Estilos de Tienda';
      default:
        return 'Panel de Control';
    }
  };

  return (
    <div
      className={selectedTheme === 'clarashop' ? 'theme-clarashop' : ''}
      style={{
        position: 'relative',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        padding: '24px',
        backgroundColor: 'var(--bg-primary)',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Capa de Auras Ambientales Flotantes (si el tema ClaraShop está activo) */}
      {selectedTheme === 'clarashop' && (
        <div className="aura-container">
          <div className="aura-orb aura-orb-1" />
          <div className="aura-orb aura-orb-2" />
          <div className="aura-orb aura-orb-3" />
        </div>
      )}

      {/* Contenedor Principal de la Aplicación */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '24px', width: '100%', height: 'calc(100vh - 48px)' }}>
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          tenantName={user?.tenantSlug || 'Mi Tienda'}
          onLogout={onLogout}
        />

        {/* Área Principal de Contenido */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
        {/* Header Superior Estilo Apple */}
        <header
          className="apple-glass"
          style={{
            padding: '16px 24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>{getHeaderTitle()}</h2>
          </div>

          {/* Badge del Usuario */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <User size={18} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{user?.email}</div>
            </div>
          </div>
        </header>

        {/* Vistas según selección lateral */}
        <section style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%', overflowY: 'auto' }}>
          {activeView === 'products' && (
            <ProductsList accessToken={accessToken} onOpenCreateModal={() => setIsCreateModalOpen(true)} />
          )}
          {activeView === 'catalog' && <CatalogManager accessToken={accessToken} />}
          {activeView === 'profile' && <ProfileSettings accessToken={accessToken} />}
          {activeView === 'currencies' && <CurrencySettings accessToken={accessToken} />}
          {activeView === 'styles' && (
            <StyleSettings selectedTheme={selectedTheme} onSelectTheme={handleThemeChange} />
          )}
        </section>
      </main>
      </div>

      {/* Modal de Creación de Producto */}
      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        accessToken={accessToken}
      />
    </div>
  );
}
