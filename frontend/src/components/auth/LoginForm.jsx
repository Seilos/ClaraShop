import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import { loginSchema } from '../../../../shared/schemas/auth.schema.js';
import api from '../../utils/api.js';

export function LoginForm({ onSuccess, onToggleRegister }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    setServerError('');

    try {
      const response = await api.post('/auth/login', formData);
      if (onSuccess) onSuccess(response.data);
    } catch (err) {
      setServerError(err.error?.message || 'Error al iniciar sesión. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      {serverError && (
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(255, 59, 48, 0.1)',
            border: '1px solid rgba(255, 59, 48, 0.3)',
            color: 'var(--status-danger)',
            fontSize: '13px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={16} />
          <span>{serverError}</span>
        </div>
      )}

      <Input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
        placeholder="Correo electrónico o número de celular"
        required
        autoComplete="email"
      />

      <Input
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        placeholder="Contraseña"
        required
        autoComplete="current-password"
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
          />
          Mantener sesión iniciada
        </label>
      </div>

      <button type="submit" className="btn-luxury-primary" disabled={isLoading}>
        {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>

      {onToggleRegister && (
        <>
          <div style={{ margin: '24px 0 20px 0', borderTop: '1px solid var(--border-subtle)' }} />
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={onToggleRegister}
              className="btn-luxury-secondary"
            >
              Crear nueva tienda
            </button>
          </div>
        </>
      )}
    </form>
  );
}
