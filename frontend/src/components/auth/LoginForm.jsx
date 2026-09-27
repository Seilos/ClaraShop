import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, KeyRound, ArrowLeft } from 'lucide-react';
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

  // Estado para flujo de "Olvidé mi contraseña"
  const [isForgotView, setIsForgotView] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

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

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;

    setForgotLoading(true);
    // Simular envío de enlace de recuperación (o endpoint real)
    setTimeout(() => {
      setForgotLoading(false);
      setForgotSubmitted(true);
    }, 800);
  };

  // Si el usuario presiona "¿Olvidaste tu contraseña?", mostramos el panel de recuperación
  if (isForgotView) {
    return (
      <div key="forgot-view" className="animate-view-transition" style={{ width: '100%' }}>
        <button
          type="button"
          onClick={() => {
            setIsForgotView(false);
            setForgotSubmitted(false);
          }}
          style={{
            background: 'none',
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#4f46e5',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            padding: 0,
            marginBottom: '16px',
          }}
        >
          <ArrowLeft size={16} />
          Volver a iniciar sesión
        </button>

        <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
          Recuperar contraseña
        </h4>

        {forgotSubmitted ? (
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(52, 199, 89, 0.12)',
              border: '1px solid rgba(52, 199, 89, 0.3)',
              color: '#15803d',
              fontSize: '14px',
              lineHeight: '1.5',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', marginBottom: '6px' }}>
              <CheckCircle2 size={18} />
              Instrucciones enviadas
            </div>
            Si la cuenta existe con el correo <strong>{forgotEmail}</strong>, recibirás un enlace de recuperación en los próximos minutos.
          </div>
        ) : (
          <form onSubmit={handleForgotSubmit}>
            <p style={{ fontSize: '13px', color: '#334155', fontWeight: '500', marginBottom: '16px', lineHeight: '1.4' }}>
              Ingresá tu correo electrónico registrado y te enviaremos las instrucciones para restablecer tu clave.
            </p>

            <Input
              name="forgotEmail"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="Correo electrónico"
              required
              autoComplete="email"
            />

            <button
              type="submit"
              className="btn-luxury-primary"
              disabled={forgotLoading || !forgotEmail}
              style={{ marginTop: '12px' }}
            >
              {forgotLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
          </form>
        )}
      </div>
    );
  }

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
            color: '#1e293b',
            fontWeight: '600',
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

      {/* Opción ¿Olvidaste tu contraseña? justo debajo del botón de iniciar sesión */}
      <div style={{ textAlign: 'center', marginTop: '12px' }}>
        <button
          type="button"
          onClick={() => setIsForgotView(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#4f46e5',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            padding: '4px 8px',
            transition: 'color 150ms ease',
          }}
          onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {onToggleRegister && (
        <>
          <div style={{ margin: '20px 0 20px 0', borderTop: '1px solid var(--border-subtle)' }} />
          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={onToggleRegister}
              className="btn-luxury-outline"
            >
              Crear nueva tienda
            </button>
          </div>
        </>
      )}
    </form>
  );
}
