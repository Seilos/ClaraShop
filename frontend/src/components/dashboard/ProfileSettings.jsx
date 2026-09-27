import React, { useState, useEffect } from 'react';
import { Store, User, Mail, Phone, Globe, Building, MapPin, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import { useTenantProfile, useUpdateTenantProfile } from '../../hooks/useTenantSettings.js';

export function ProfileSettings({ accessToken }) {
  const { data: profileRes, isLoading, isError } = useTenantProfile(accessToken);
  const updateProfileMutation = useUpdateTenantProfile(accessToken);

  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    country: '',
    city: '',
    address: '',
    slug: '',
  });

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (profileRes) {
      const { tenant, adminUser } = profileRes;
      setFormData({
        name: tenant?.name || '',
        slug: tenant?.slug || '',
        contactName: tenant?.contactName || `${adminUser?.firstName || ''} ${adminUser?.lastName || ''}`.trim(),
        contactPhone: tenant?.contactPhone || adminUser?.phone || '',
        contactEmail: tenant?.contactEmail || adminUser?.email || '',
        country: tenant?.country || '',
        city: tenant?.city || '',
        address: tenant?.address || '',
      });
    }
  }, [profileRes]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (message) setMessage(null);
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      await updateProfileMutation.mutateAsync({
        name: formData.name,
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        country: formData.country,
        city: formData.city,
        address: formData.address,
      });

      setMessage('Perfil de la tienda actualizado correctamente');
    } catch (err) {
      setError(err.response?.data?.error?.message || err.error?.message || 'Fallo al guardar cambios del perfil');
    }
  };

  if (isLoading) {
    return <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Cargando perfil de tienda...</div>;
  }

  if (isError) {
    return <div style={{ padding: '24px', color: 'var(--status-danger)' }}>Error al cargar datos del perfil.</div>;
  }

  return (
    <div className="apple-glass" style={{ width: '100%', flex: 1, minHeight: '100%', padding: '24px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>

      {message && (
        <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(52, 199, 89, 0.1)', color: 'var(--status-success)', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(255, 59, 48, 0.1)', color: 'var(--status-danger)', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input label="Nombre de la Tienda" name="name" value={formData.name} onChange={handleChange} icon={Store} required />
          <Input label="Subdominio / Slug" name="slug" value={formData.slug} onChange={handleChange} icon={Globe} disabled />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input label="Nombre de Contacto" name="contactName" value={formData.contactName} onChange={handleChange} icon={User} required />
          <Input label="Teléfono de Contacto" name="contactPhone" value={formData.contactPhone} onChange={handleChange} icon={Phone} required />
        </div>

        <Input label="Correo Electrónico de Contacto" name="contactEmail" type="email" value={formData.contactEmail} onChange={handleChange} icon={Mail} required />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input label="País" name="country" value={formData.country} onChange={handleChange} icon={Globe} required />
          <Input label="Ciudad" name="city" value={formData.city} onChange={handleChange} icon={Building} required />
        </div>

        <Input label="Dirección de la Tienda" name="address" value={formData.address} onChange={handleChange} icon={MapPin} required />

        <div style={{ marginTop: 'auto', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="primary" isLoading={updateProfileMutation.isPending} icon={Save}>
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
}

