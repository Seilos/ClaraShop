import React, { useState } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar.jsx';
import { ProfileSettings } from '../components/dashboard/ProfileSettings.jsx';
import { CurrencySettings } from '../components/dashboard/CurrencySettings.jsx';
import { ProductsList } from '../components/dashboard/ProductsList.jsx';
import { CatalogManager } from '../components/dashboard/CatalogManager.jsx';
import { CreateProductModal } from '../components/dashboard/CreateProductModal.jsx';
import { User } from 'lucide-react';

export function DashboardPage({ user, accessToken, onLogout }) {
  const [activeView, setActiveView] = useState('products'); // 'products' | 'catalog' | 'profile' | 'currencies'
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const getHeaderTitle = () => {
    switch (activeView) {
      case 'products':
        return 'Gestión > Catálogo de Productos';
      case 'catalog':
        return 'Gestión > Marcas & Categorías';
      case 'profile':
        return 'Configuración > Perfil de Tienda';
      case 'currencies':
        return 'Configuración > Monedas & Tasa de Cambio';
      default:
        return 'Panel de Control';
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        padding: '24px',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      {/* Panel Lateral con Menú Desplegable */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        tenantName={user?.tenantSlug || 'Mi Tienda'}
        onLogout={onLogout}
      />

      {/* Área Principal de Contenido */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>{getHeaderTitle()}</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              Tenant ID: {user?.tenantSlug || user?.tenantId}
            </span>
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
        <section style={{ flex: 1 }}>
          {activeView === 'products' && (
            <ProductsList accessToken={accessToken} onOpenCreateModal={() => setIsCreateModalOpen(true)} />
          )}
          {activeView === 'catalog' && <CatalogManager accessToken={accessToken} />}
          {activeView === 'profile' && <ProfileSettings accessToken={accessToken} />}
          {activeView === 'currencies' && <CurrencySettings accessToken={accessToken} />}
        </section>
      </main>

      {/* Modal de Creación de Producto */}
      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        accessToken={accessToken}
      />
    </div>
  );
}
