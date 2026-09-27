import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import { registerTenantSchema } from '../../../../shared/schemas/auth.schema.js';
import api from '../../utils/api.js';

export function RegisterForm({ onSuccess, onToggleLogin }) {
  const [formData, setFormData] = useState({
    storeName: '',
    slug: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    country: '',
    city: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'storeName' && !formData.slugEdited) {
      const generatedSlug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      setFormData((prev) => ({ ...prev, storeName: value, slug: generatedSlug }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === 'slug' ? value.toLowerCase() : value,
        ...(name === 'slug' ? { slugEdited: true } : {}),
      }));
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = registerTenantSchema.safeParse(formData);
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
      const response = await api.post('/auth/register', formData);
      if (onSuccess) onSuccess(response.data);
    } catch (err) {
      setServerError(err.error?.message || 'Error al registrar la tienda. Intente nuevamente.');
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

      {/* Sección 1: Datos de la Tienda */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          1. Configuración de Tienda
        </h4>

        <Input
          name="storeName"
          value={formData.storeName}
          onChange={handleChange}
          error={errors.storeName}
          placeholder="Nombre de la Tienda (Ej: ClaraShop Central)"
          required
        />

        <Input
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          error={errors.slug}
          placeholder="Subdominio / URL de tu tienda (ej: clarashop-central)"
          required
        />
      </div>

      {/* Sección 2: Datos del Usuario Administrador */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          2. Datos del Administrador
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={errors.firstName}
            placeholder="Nombre"
            required
          />
          <Input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={errors.lastName}
            placeholder="Apellido"
            required
          />
        </div>

        <Input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="Correo electrónico"
          required
        />

        <Input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="Teléfono o celular (+5491122334455)"
          required
        />

        <Input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Contraseña"
          required
        />
      </div>

      {/* Sección 3: Ubicación y Dirección */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          3. Dirección de Operaciones
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Input
            name="country"
            value={formData.country}
            onChange={handleChange}
            error={errors.country}
            placeholder="País (ej: Argentina)"
            required
          />
          <Input
            name="city"
            value={formData.city}
            onChange={handleChange}
            error={errors.city}
            placeholder="Ciudad (ej: Buenos Aires)"
            required
          />
        </div>

        <Input
          name="address"
          value={formData.address}
          onChange={handleChange}
          error={errors.address}
          placeholder="Dirección completa (ej: Av. Corrientes 1234)"
          required
        />
      </div>

      <button type="submit" className="btn-luxury-primary" disabled={isLoading}>
        {isLoading ? 'Registrando tienda...' : 'Registrar nueva tienda'}
      </button>

      {onToggleLogin && (
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={onToggleLogin}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '13px',
              color: 'var(--accent-primary)',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            ¿Ya tenés una tienda? Iniciar sesión
          </button>
        </div>
      )}
    </form>
  );
}
