import React, { useState } from 'react';
import { X, Tag, Plus, AlertCircle } from 'lucide-react';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import { createBrandSchema } from '../../../../shared/schemas/product.schema.js';
import { useCreateBrand } from '../../hooks/useCatalog.js';

export function CreateBrandModal({ isOpen, onClose, onSuccess, accessToken }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const createBrandMutation = useCreateBrand(accessToken);

  if (!isOpen) return null;

  const handleClose = () => {
    setName('');
    setDescription('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = createBrandSchema.safeParse({ name, description: description || null });
    if (!result.success) {
      setError(result.error.issues[0]?.message || 'El nombre es requerido');
      return;
    }

    setError('');
    try {
      const res = await createBrandMutation.mutateAsync({ name, description: description || null });
      const createdBrand = res.data;
      handleClose();
      if (onSuccess) onSuccess(createdBrand);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.error?.message || 'Error al crear la marca');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '20px',
      }}
    >
      <div
        className="apple-glass"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-secondary)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={18} color="#4f46e5" />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Nueva Marca</h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(255, 59, 48, 0.1)', color: 'var(--status-danger)', fontSize: '13px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Nombre de la Marca"
            name="brandName"
            value={name}
            onChange={(e) => { setName(e.target.value); if (error) setError(''); }}
            placeholder="ej: Nike, Samsung, Apple"
            icon={Tag}
            required
          />

          {/* Description textarea */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Descripción <span style={{ fontWeight: '400', color: 'var(--text-tertiary)' }}>(opcional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción de la marca..."
              rows={3}
              style={{
                width: '100%',
                padding: '11px 14px',
                fontSize: '14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                boxShadow: 'var(--shadow-sm)',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <Button variant="secondary" onClick={handleClose} type="button">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={createBrandMutation.isPending} icon={Plus}>
              Guardar Marca
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
