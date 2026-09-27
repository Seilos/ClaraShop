import React, { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm.jsx';
import { RegisterForm } from '../components/auth/RegisterForm.jsx';
import { Store, ShieldCheck } from 'lucide-react';

export function AuthPage({ onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegisterSuccess = () => {
    setSuccessMessage('¡Tienda creada exitosamente! Ahora podés iniciar sesión.');
    setActiveTab('login');
  };

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        boxSizing: 'border-box',
        backgroundColor: '#0b0f19',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Capa de Auras Ambientales Flotantes en Segundo Plano */}
      <div className="aura-container">
        <div className="aura-orb aura-orb-1" />
        <div className="aura-orb aura-orb-2" />
        <div className="aura-orb aura-orb-3" />
      </div>

      {/*
       * WRAPPER: columna principal que agrupa header de marca + las dos columnas.
       * En desktop: max-width 960px, centrado.
       * En mobile: ancho completo, sin overflow.
       */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '960px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
          boxSizing: 'border-box',
        }}
      >

        {/* ── HEADER DE MARCA — centrado sobre las dos columnas (solo desktop) ── */}
        <div
          className="hero-desktop-only"
          style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#007aff',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(0, 122, 255, 0.45)',
              }}
            >
              <Store size={28} />
            </div>
            <h1
              style={{
                fontSize: '38px',
                fontWeight: '800',
                color: '#ffffff',
                letterSpacing: '-0.04em',
                margin: 0,
              }}
            >
              ClaraShop
            </h1>
          </div>
          <p
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#94a3b8',
              letterSpacing: '-0.01em',
              margin: 0,
            }}
          >
            Hacemos lo imposible Posible.
          </p>
        </div>

        {/* ── DOS COLUMNAS (imagen izq · card der) — solo en desktop ── */}
        {/*
         * CSS Grid: ambas celdas comparten la misma altura sin ciclos de dependencia.
         * La altura de la fila la fija el contenido de la card (columna derecha).
         * La imagen se estira para llenar esa altura con objectFit: cover.
         */}
        <div
          className="auth-columns-row"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >

          {/* Columna Izquierda — Hero Image (oculta en mobile) */}
          <div
            className="hero-desktop-only"
            style={{
              minWidth: 0,
              display: 'flex',          /* necesario para que el hijo tome height:100% */
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                overflow: 'hidden',
                borderRadius: '20px',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                width: '100%',
                flex: 1,               /* crece para llenar toda la celda del grid */
              }}
            >
              <img
                src="/clarashop_hero.jpg"
                alt="ClaraShop E-Commerce"
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
              />
            </div>
          </div>

          {/* Columna Derecha — Card con Glassmorphism */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxSizing: 'border-box',
            }}
          >
            {/* Cabecera mobile — logo + título + lema (oculta en desktop) */}
            <div
              className="mobile-header-only"
              style={{ textAlign: 'center', marginBottom: '8px' }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#007aff',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  boxShadow: '0 6px 20px rgba(0, 122, 255, 0.5)',
                }}
              >
                <Store size={30} />
              </div>
              <h1
                style={{
                  fontSize: '30px',
                  fontWeight: '800',
                  color: '#ffffff',
                  letterSpacing: '-0.03em',
                  marginBottom: '6px',
                }}
              >
                ClaraShop
              </h1>
              <p style={{ fontSize: '15px', fontWeight: '600', color: '#94a3b8', margin: 0 }}>
                Hacemos lo imposible Posible.
              </p>
            </div>

            {/* Card con Glassmorphism Esmerilado de Alta Luminosidad y Contraste */}
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                padding: '32px 28px',
                borderRadius: '24px',
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.86) 0%, rgba(235, 243, 255, 0.78) 100%)',
                backdropFilter: 'blur(30px) saturate(200%)',
                WebkitBackdropFilter: 'blur(30px) saturate(200%)',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxSizing: 'border-box',
                width: '100%',
              }}
            >

              {/* Contenido sobre la card con transición suave */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ marginBottom: '20px' }}>
                  <h3
                    key={`title-${activeTab}`}
                    className="animate-view-transition"
                    style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#1c1e21',
                      margin: 0,
                    }}
                  >
                    {activeTab === 'login'
                      ? 'Iniciar sesión en ClaraShop'
                      : 'Crear tu tienda en ClaraShop'}
                  </h3>
                </div>

                {successMessage && activeTab === 'login' && (
                  <div
                    className="animate-view-transition"
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(5, 150, 105, 0.22) 100%)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                      color: '#064e3b',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <ShieldCheck size={18} color="#059669" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <div key={`view-${activeTab}`} className="animate-view-transition">
                  {activeTab === 'login' ? (
                    <LoginForm
                      onSuccess={onAuthSuccess}
                      onToggleRegister={() => setActiveTab('register')}
                    />
                  ) : (
                    <RegisterForm
                      onSuccess={handleRegisterSuccess}
                      onToggleLogin={() => setActiveTab('login')}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
