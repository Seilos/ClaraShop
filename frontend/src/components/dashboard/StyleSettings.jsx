import React, { useState } from 'react';
import { Palette, CheckCircle2, Sparkles, Store, Layers } from 'lucide-react';

export function StyleSettings({ selectedTheme = 'clarashop', onSelectTheme }) {
  const [selectedStyle, setSelectedStyle] = useState(selectedTheme); // 'clarashop' | 'custom'

  const handleSelect = (style) => {
    setSelectedStyle(style);
    if (onSelectTheme) onSelectTheme(style);
  };

  return (
    <div style={{ width: '100%', flex: 1, minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        className="apple-glass"
        style={{
          width: '100%',
          flex: 1,
          minHeight: '100%',
          padding: '28px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
        {/* Tarjetas de Selección de Estilo */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
          
          {/* Opción 1: Estilo ClaraShop (Actual) */}
          <div
            onClick={() => handleSelect('clarashop')}
            style={{
              padding: '22px',
              borderRadius: '16px',
              border: selectedStyle === 'clarashop'
                ? '2px solid #4f46e5'
                : '1px solid var(--border-subtle)',
              backgroundColor: selectedStyle === 'clarashop'
                ? 'rgba(79, 70, 229, 0.04)'
                : 'var(--bg-secondary)',
              cursor: 'pointer',
              transition: 'all 200ms ease',
              position: 'relative',
              boxShadow: selectedStyle === 'clarashop' ? '0 8px 24px rgba(79, 70, 229, 0.12)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Store size={18} color="#4f46e5" />
                <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Estilo ClaraShop
                </span>
              </div>
              {selectedStyle === 'clarashop' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4f46e5', fontSize: '12px', fontWeight: '700' }}>
                  <CheckCircle2 size={18} />
                  <span>Activo</span>
                </div>
              )}
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
              Diseño distintivo predeterminado de ClaraShop con Glassmorphism esmerilado de alta gama, auras de luz animadas y tipografía moderna.
            </p>

            {/* Preview Miniatura Estilo ClaraShop */}
            <div
              style={{
                height: '110px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0b0f19 0%, #1e1b4b 100%)',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(0,122,255,0.6), transparent)',
                  filter: 'blur(20px)',
                  top: '-20px',
                  left: '-20px',
                }}
              />
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(10px)',
                  color: '#0f172a',
                  fontSize: '12px',
                  fontWeight: '700',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                }}
              >
                Glassmorphism ClaraShop
              </div>
            </div>
          </div>

          {/* Opción 2: Estilo Propio / Personalizado */}
          <div
            onClick={() => handleSelect('custom')}
            style={{
              padding: '22px',
              borderRadius: '16px',
              border: selectedStyle === 'custom'
                ? '2px solid #a855f7'
                : '1px solid var(--border-subtle)',
              backgroundColor: selectedStyle === 'custom'
                ? 'rgba(168, 85, 247, 0.04)'
                : 'var(--bg-secondary)',
              cursor: 'pointer',
              transition: 'all 200ms ease',
              position: 'relative',
              boxShadow: selectedStyle === 'custom' ? '0 8px 24px rgba(168, 85, 247, 0.12)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#a855f7" />
                <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Estilo Propio (Personalizado)
                </span>
              </div>
              {selectedStyle === 'custom' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a855f7', fontSize: '12px', fontWeight: '700' }}>
                  <CheckCircle2 size={18} />
                  <span>Seleccionado</span>
                </div>
              ) : (
                <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#7e22ce', fontWeight: '600' }}>
                  Próximamente
                </span>
              )}
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '16px' }}>
              Configuración de marca propia donde podrás personalizar paleta de colores, logo, fuentes y el tema exclusivo de tu comercio.
            </p>

            {/* Preview Miniatura Estilo Propio */}
            <div
              style={{
                height: '110px',
                borderRadius: '12px',
                border: '2px dashed rgba(168, 85, 247, 0.3)',
                backgroundColor: 'rgba(168, 85, 247, 0.05)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                color: '#7e22ce',
              }}
            >
              <Layers size={22} />
              <span style={{ fontSize: '12px', fontWeight: '600' }}>
                Personalización de Marca Propia
              </span>
            </div>
          </div>

        </div>

        {/* Notificación de estado */}
        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <button
            type="button"
            className="btn-luxury-primary"
            style={{ width: 'auto', padding: '12px 24px', fontSize: '14px' }}
            onClick={() => alert(`Estilo guardado: ${selectedStyle === 'clarashop' ? 'Estilo ClaraShop' : 'Estilo Propio'}`)}
          >
            Guardar preferencia de estilo
          </button>
        </div>

      </div>
    </div>
  );
}
