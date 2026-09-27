import React, { useState } from 'react';
import { Tag, Layers, Sliders, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import {
  useBrands,
  useCreateBrand,
  useDeleteBrand,
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useAttributes,
  useCreateAttribute,
  useDeleteAttribute,
} from '../../hooks/useCatalog.js';

export function CatalogManager({ accessToken }) {
  const [tab, setTab] = useState('brands'); // 'brands' | 'categories' | 'attributes'
  const [newItemName, setNewItemName] = useState('');

  // Queries
  const { data: brands = [] } = useBrands(accessToken);
  const { data: categories = [] } = useCategories(accessToken);
  const { data: attributes = [] } = useAttributes(accessToken);

  // Mutations
  const createBrand = useCreateBrand(accessToken);
  const deleteBrand = useDeleteBrand(accessToken);
  const createCategory = useCreateCategory(accessToken);
  const deleteCategory = useDeleteCategory(accessToken);
  const createAttribute = useCreateAttribute(accessToken);
  const deleteAttribute = useDeleteAttribute(accessToken);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      if (tab === 'brands') await createBrand.mutateAsync({ name: newItemName });
      else if (tab === 'categories') await createCategory.mutateAsync({ name: newItemName });
      else if (tab === 'attributes') await createAttribute.mutateAsync({ name: newItemName });
      setNewItemName('');
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Error al crear elemento');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return;
    try {
      if (tab === 'brands') await deleteBrand.mutateAsync(id);
      else if (tab === 'categories') await deleteCategory.mutateAsync(id);
      else if (tab === 'attributes') await deleteAttribute.mutateAsync(id);
    } catch (err) {
      alert('Error al eliminar elemento');
    }
  };

  const currentList = tab === 'brands' ? brands : tab === 'categories' ? categories : attributes;
  const isCreating = createBrand.isPending || createCategory.isPending || createAttribute.isPending;

  return (
    <div className="apple-glass" style={{ width: '100%', flex: 1, minHeight: '100%', padding: '24px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        {[
          { key: 'brands', label: 'Marcas', icon: Tag, count: brands.length },
          { key: 'categories', label: 'Categorías', icon: Layers, count: categories.length },
          { key: 'attributes', label: 'Atributos Personalizados', icon: Sliders, count: attributes.length },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => { setTab(t.key); setNewItemName(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '500',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--accent-subtle)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Icon size={16} />
              <span>{t.label} ({t.count})</span>
            </button>
          );
        })}
      </div>

      {/* Inline Form */}
      <form onSubmit={handleCreate} style={{ display: 'flex', gap: '12px', marginBottom: '24px', maxWidth: '500px' }}>
        <Input
          placeholder={`Nombre de la nueva ${tab === 'brands' ? 'marca' : tab === 'categories' ? 'categoría' : 'atributo'}...`}
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
        />
        <Button type="submit" variant="primary" isLoading={isCreating} icon={Plus}>
          Agregar
        </Button>
      </form>

      {/* List Grid */}
      {currentList.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', backgroundColor: 'rgba(255, 255, 255, 0.45)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            No hay {tab === 'brands' ? 'marcas' : tab === 'categories' ? 'categorías' : 'atributos'} registrados.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
          {currentList.map((item) => (
            <div
              key={item.id}
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.name}</div>
                {item.slug && (
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>/{item.slug}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleDelete(item.id, item.name)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
