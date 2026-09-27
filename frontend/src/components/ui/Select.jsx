import React from 'react';

/**
 * Select component matching the luxury Apple-inspired design system.
 * Mirrors the Input component styling for visual consistency.
 */
export function Select({ name, value, onChange, error, options = [], placeholder, required = false }) {
  return (
    <div className="input-group" style={{ marginBottom: '16px' }}>
      <div style={{ position: 'relative' }}>
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          style={{
            width: '100%',
            padding: '12px 36px 12px 14px',
            fontSize: '14px',
            borderRadius: 'var(--radius-sm)',
            border: error
              ? '1px solid var(--status-danger)'
              : '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-secondary)',
            color: value ? 'var(--text-primary)' : 'var(--text-tertiary)',
            outline: 'none',
            transition: 'var(--transition-fast)',
            boxShadow: 'var(--shadow-sm)',
            appearance: 'none',
            WebkitAppearance: 'none',
            cursor: 'pointer',
          }}
        >
          {placeholder && (
            <option value="" disabled hidden>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={typeof opt === 'string' ? opt : opt.code}
              value={typeof opt === 'string' ? opt : opt.code}
              style={{ color: 'var(--text-primary)' }}
            >
              {typeof opt === 'string' ? opt : opt.name}
            </option>
          ))}
        </select>

        {/* Chevron icon */}
        <div
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: error ? 'var(--status-danger)' : 'var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
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
