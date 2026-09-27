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
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        boxSizing: 'border-box',
        backgroundColor: '#0f172a',
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(0, 122, 255, 0.18) 0%, rgba(15, 23, 42, 0.97) 70%)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/*
       * WRAPPER: columna principal que agrupa header de marca + las dos columnas.
       * En desktop: max-width 960px, centrado.
       * En mobile: ancho completo, sin overflow.
       */}
      <div
        style={{
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

            {/* Card con glassmorphism */}
            <div
              style={{
                position: 'relative',
                overflow: 'hidden',
                padding: '32px 28px',
                borderRadius: '24px',
                boxShadow:
                  '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxSizing: 'border-box',
                width: '100%',
              }}
            >
              {/* Capa imagen de fondo (hero extendida para tapar bordes borrosos) */}
              <div
                style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '-12px',
                  right: '-12px',
                  bottom: '-12px',
                  backgroundImage: 'url(/clarashop_hero.jpg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  opacity: 0.55,
                  filter: 'blur(4px) saturate(160%)',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />
              {/* Capa glass translúcida */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    'linear-gradient(145deg, rgba(255,255,255,0.78) 0%, rgba(230,240,255,0.86) 100%)',
                  backdropFilter: 'blur(18px)',
                  WebkitBackdropFilter: 'blur(18px)',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />

              {/* Contenido sobre la card */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ marginBottom: '20px' }}>
                  <h3
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
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(52, 199, 89, 0.15)',
                      border: '1px solid rgba(52, 199, 89, 0.4)',
                      color: '#1d7331',
                      fontSize: '13px',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <ShieldCheck size={16} />
                    <span>{successMessage}</span>
                  </div>
                )}

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
  );
}
