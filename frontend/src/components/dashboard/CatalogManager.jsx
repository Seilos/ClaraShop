import React, { useState, useMemo } from 'react';
import { Tag, Layers, Sliders, Plus, Trash2, Search, Package, Edit2, Check, X } from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import { CreateBrandModal } from './CreateBrandModal.jsx';
import { CreateCategoryModal } from './CreateCategoryModal.jsx';
import {
  useBrands,
  useDeleteBrand,
  useUpdateBrand,
  useCategories,
  useDeleteCategory,
  useUpdateCategory,
  useAttributes,
  useCreateAttribute,
  useDeleteAttribute,
} from '../../hooks/useCatalog.js';

// ─── Inline editable row ─────────────────────────────────────────────────────
function EditableRow({ item, onSave, onDelete, codeLabel }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editDesc, setEditDesc] = useState(item.description || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    await onSave(item.id, { name: editName, description: editDesc || null });
    setSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(item.name);
    setEditDesc(item.description || '');
    setIsEditing(false);
  };

  return (
    <tr
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'background 150ms ease',
        backgroundColor: isEditing ? 'rgba(79, 70, 229, 0.03)' : 'transparent',
      }}
      onMouseEnter={(e) => { if (!isEditing) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'; }}
      onMouseLeave={(e) => { if (!isEditing) e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      {/* Code / slug */}
      <td style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-tertiary)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
        {codeLabel}
      </td>

      {/* Name + description */}
      <td style={{ padding: '12px 16px', flex: 1 }}>
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoFocus
              style={{
                padding: '6px 10px',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: 'var(--radius-sm)',
                border: '1.5px solid #4f46e5',
                outline: 'none',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
            <input
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Descripción..."
              style={{
                padding: '5px 10px',
                fontSize: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                outline: 'none',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.name}</div>
            {item.description && (
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{item.description}</div>
            )}
          </div>
        )}
      </td>

      {/* Product count */}
      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '13px',
            fontWeight: '600',
            color: item.productCount > 0 ? '#4f46e5' : 'var(--text-tertiary)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: item.productCount > 0 ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
          }}
        >
          <Package size={13} />
          {item.productCount ?? 0}
        </span>
      </td>

      {/* Actions */}
      <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
        {isEditing ? (
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleCancel}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px' }}
            >
              <X size={16} />
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#fff',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Check size={13} /> {saving ? '...' : 'Guardar'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              title="Editar"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px', borderRadius: '4px' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#4f46e5')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
            >
              <Edit2 size={15} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id, item.name)}
              title="Eliminar"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px', borderRadius: '4px' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-danger)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

// ─── Attributes tab (simple list, no description/count) ──────────────────────
function AttributeRow({ item, onDelete }) {
  return (
    <tr
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.name}</td>
      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
        <button
          type="button"
          onClick={() => onDelete(item.id, item.name)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-danger)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  );
}

// ─── Main CatalogManager ─────────────────────────────────────────────────────
export function CatalogManager({ accessToken }) {
  const [tab, setTab] = useState('brands');
  const [search, setSearch] = useState('');
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Attribute quick-add
  const [newAttrName, setNewAttrName] = useState('');

  // Queries
  const { data: brands = [] } = useBrands(accessToken);
  const { data: categories = [] } = useCategories(accessToken);
  const { data: attributes = [] } = useAttributes(accessToken);

  // Mutations
  const updateBrand = useUpdateBrand(accessToken);
  const deleteBrand = useDeleteBrand(accessToken);
  const updateCategory = useUpdateCategory(accessToken);
  const deleteCategory = useDeleteCategory(accessToken);
  const createAttribute = useCreateAttribute(accessToken);
  const deleteAttribute = useDeleteAttribute(accessToken);

  const handleDelete = async (id, name, type) => {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return;
    try {
      if (type === 'brand') await deleteBrand.mutateAsync(id);
      else if (type === 'category') await deleteCategory.mutateAsync(id);
      else await deleteAttribute.mutateAsync(id);
    } catch {
      alert('Error al eliminar');
    }
  };

  const handleAttrCreate = async (e) => {
    e.preventDefault();
    if (!newAttrName.trim()) return;
    try {
      await createAttribute.mutateAsync({ name: newAttrName });
      setNewAttrName('');
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Error al crear atributo');
    }
  };

  // Filtered lists
  const filteredBrands = useMemo(
    () => brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase())),
    [brands, search]
  );
  const filteredCategories = useMemo(
    () => categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
    [categories, search]
  );
  const filteredAttributes = useMemo(
    () => attributes.filter((a) => a.name.toLowerCase().includes(search.toLowerCase())),
    [attributes, search]
  );

  const tabs = [
    { key: 'brands', label: 'Marcas', icon: Tag, count: brands.length },
    { key: 'categories', label: 'Categorías', icon: Layers, count: categories.length },
    { key: 'attributes', label: 'Atributos', icon: Sliders, count: attributes.length },
  ];

  const isTagTab = tab === 'brands' || tab === 'categories';

  return (
    <div
      className="apple-glass"
      style={{ width: '100%', flex: 1, minHeight: '100%', padding: '24px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}
    >
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => { setTab(t.key); setSearch(''); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: isActive ? '600' : '500',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? '#4f46e5' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              <Icon size={16} />
              <span>{t.label} ({t.count})</span>
            </button>
          );
        })}
      </div>

      {/* Toolbar: Search + Create button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', width: '100%' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Buscar ${tab === 'brands' ? 'marcas' : tab === 'categories' ? 'categorías' : 'atributos'}...`}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              fontSize: '14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              outline: 'none',
              boxShadow: 'var(--shadow-sm)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Create button — brands & categories open modal; attributes use inline form */}
        {tab === 'brands' && (
          <Button variant="primary" icon={Plus} onClick={() => setIsBrandModalOpen(true)}>
            Nueva Marca
          </Button>
        )}
        {tab === 'categories' && (
          <Button variant="primary" icon={Plus} onClick={() => setIsCategoryModalOpen(true)}>
            Nueva Categoría
          </Button>
        )}
        {tab === 'attributes' && (
          <form onSubmit={handleAttrCreate} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newAttrName}
              onChange={(e) => setNewAttrName(e.target.value)}
              placeholder="Nombre del atributo..."
              style={{
                padding: '10px 14px',
                fontSize: '14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                outline: 'none',
                minWidth: '220px',
                boxSizing: 'border-box',
              }}
            />
            <Button type="submit" variant="primary" icon={Plus} isLoading={createAttribute.isPending}>
              Agregar
            </Button>
          </form>
        )}
      </div>

      {/* Table */}
      <div style={{ flex: 1, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
        {isTagTab ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(0,0,0,0.025)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  {tab === 'brands' ? 'Marca' : 'Slug'}
                </th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Nombre / Descripción
                </th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  Productos
                </th>
                <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {(tab === 'brands' ? filteredBrands : filteredCategories).length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '14px' }}>
                    {search
                      ? `Sin resultados para "${search}"`
                      : `No hay ${tab === 'brands' ? 'marcas' : 'categorías'} registradas. Creá la primera.`}
                  </td>
                </tr>
              ) : (
                (tab === 'brands' ? filteredBrands : filteredCategories).map((item, index) => (
                  <EditableRow
                    key={item.id}
                    item={item}
                    codeLabel={tab === 'brands' ? `#${String(index + 1).padStart(3, '0')}` : item.slug}
                    onSave={(id, data) =>
                      tab === 'brands'
                        ? updateBrand.mutateAsync({ id, ...data })
                        : updateCategory.mutateAsync({ id, ...data })
                    }
                    onDelete={(id, name) => handleDelete(id, name, tab === 'brands' ? 'brand' : 'category')}
                  />
                ))
              )}
            </tbody>
          </table>
        ) : (
          // Attributes: simple list
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(0,0,0,0.025)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Nombre del Atributo
                </th>
                <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAttributes.length === 0 ? (
                <tr>
                  <td colSpan={2} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '14px' }}>
                    {search ? `Sin resultados para "${search}"` : 'No hay atributos personalizados. Agregá el primero.'}
                  </td>
                </tr>
              ) : (
                filteredAttributes.map((item) => (
                  <AttributeRow
                    key={item.id}
                    item={item}
                    onDelete={(id, name) => handleDelete(id, name, 'attribute')}
                  />
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      <CreateBrandModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        accessToken={accessToken}
      />
      <CreateCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        accessToken={accessToken}
      />
    </div>
  );
}
