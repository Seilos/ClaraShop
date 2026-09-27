import React, { useState } from 'react';
import { StoreHeader } from '../components/storefront/StoreHeader.jsx';
import { ProductSearchGrid } from '../components/storefront/ProductSearchGrid.jsx';
import { CartDrawer } from '../components/storefront/CartDrawer.jsx';
import { CheckoutModal } from '../components/storefront/CheckoutModal.jsx';
import { useStorefrontData } from '../hooks/useStorefront.js';
import { useCart } from '../hooks/useCart.js';

export function PublicStorePage({ slug = 'apple-duilio' }) {
  const { data: storeData, isLoading, isError } = useStorefrontData(slug);
  const cart = useCart(storeData?.settings?.exchangeRate);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleOrderSuccess = (orderNumber) => {
    cart.clear();
    alert(`¡Gracias por tu compra! Tu pedido ${orderNumber} ha sido generado exitosamente y abierto en WhatsApp.`);
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
        Cargando tienda en línea...
      </div>
    );
  }

  if (isError || !storeData) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
        <div className="apple-glass" style={{ padding: '32px', textAlign: 'center', maxWidth: '400px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Tienda No Encontrada</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            No se pudo acceder a la tienda especificada. Verifique la dirección.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Navbar Superior de la Tienda */}
      <StoreHeader
        store={storeData.store}
        settings={storeData.settings}
        cartItemCount={cart.totals.itemCount}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Grid de Productos Públicos */}
      <main>
        <ProductSearchGrid
          products={storeData.products}
          settings={storeData.settings}
          onAddToCart={cart.addItem}
        />
      </main>

      {/* Drawer Lateral del Carrito */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart.items}
        onUpdateQuantity={cart.updateQuantity}
        onRemoveItem={cart.removeItem}
        settings={storeData.settings}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Modal de Checkout & Formulario de Envío a WhatsApp */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        storeSlug={storeData.store.slug}
        cartItems={cart.items}
        settings={storeData.settings}
        onOrderSuccess={handleOrderSuccess}
      />
    </div>
  );
}

