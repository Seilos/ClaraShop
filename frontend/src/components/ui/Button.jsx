import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Componente Botón de Alta Gama estilo Apple con estados de carga y variantes
 */
export function Button({
  children,
  type = 'button',
  onClick,
  variant = 'primary', // 'primary' | 'secondary' | 'glass'
  isLoading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
}) {
  const getStyle = () => {
    const base = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '12px 20px',
      fontSize: '14px',
      fontWeight: '600',
      borderRadius: 'var(--radius-sm)',
      border: 'none',
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      transition: 'var(--transition-fast)',
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled ? 0.6 : 1,
    };

    if (variant === 'primary') {
      return {
        ...base,
        backgroundColor: 'var(--accent-primary)',
        color: '#ffffff',
        boxShadow: '0 4px 14px rgba(0, 122, 255, 0.3)',
      };
    }

    if (variant === 'secondary') {
      return {
        ...base,
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-subtle)',
      };
    }

    // variant === 'glass'
    return {
      ...base,
      backgroundColor: 'var(--bg-glass)',
      backdropFilter: 'var(--backdrop-blur)',
      color: 'var(--text-primary)',
      border: '1px solid var(--bg-glass-border)',
    };
  };

  return (
    <button type={type} onClick={onClick} disabled={disabled || isLoading} style={getStyle()}>
      {isLoading ? (
        <Loader2 className="animate-spin" size={18} />
      ) : (
        <>
          {Icon && <Icon size={18} />}
          {children}
        </>
      )}
    </button>
  );
}
