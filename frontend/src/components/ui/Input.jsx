import React from 'react';

/**
 * Componente Input de Alta Gama estilo Apple
 */
export function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  icon: Icon,
  required = false,
  autoComplete,
  list,
  ...props
}) {
  return (
    <div className="input-group" style={{ marginBottom: '16px' }}>
      {label && (
        <label
          htmlFor={name}
          style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '6px',
            letterSpacing: '-0.01em',
          }}
        >
          {label} {required && <span style={{ color: 'var(--status-danger)' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              color: error ? 'var(--status-danger)' : 'var(--text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <Icon size={18} />
          </div>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          list={list}
          {...props}
          style={{
            width: '100%',
            padding: Icon ? '12px 14px 12px 40px' : '12px 14px',
            fontSize: '14px',
            borderRadius: 'var(--radius-sm)',
            border: error ? '1px solid var(--status-danger)' : '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'var(--transition-fast)',
            boxShadow: 'var(--shadow-sm)',
          }}
        />
      </div>

      {error && (
        <p
          style={{
            fontSize: '12px',
            color: 'var(--status-danger)',
            marginTop: '4px',
            fontWeight: '500',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
