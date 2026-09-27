import React, { useState, useMemo } from 'react';
import { Tag, Layers, Sliders, Plus, Trash2, Search, Package, Edit2, Check, X, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
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
  useUpdateAttribute,
  useDeleteAttribute,
  useAttributeValues,
  useCreateAttributeValue,
  useDeleteAttributeValue,
} from '../../hooks/useCatalog.js';

// ─── Inline editable row for Brands and Categories ───────────────────────────
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
        backgroundColor: isEditing ? 'rgba(79, 70, 229, 0.04)' : 'transparent',
      }}
      onMouseEnter={(e) => { if (!isEditing) e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.02)'; }}
      onMouseLeave={(e) => { if (!isEditing) e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      {/* Code / slug */}
      <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '700', color: 'var(--accent-primary)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
        {codeLabel}
      </td>

      {/* Name + description */}
      <td style={{ padding: '14px 16px', flex: 1 }}>
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
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{item.name}</div>
            {item.description && (
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.description}</div>
            )}
          </div>
        )}
      </td>

      {/* Product count */}
      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '13px',
            fontWeight: '700',
            color: item.productCount > 0 ? '#4f46e5' : 'var(--text-tertiary)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: item.productCount > 0 ? 'rgba(79, 70, 229, 0.1)' : 'rgba(0, 0, 0, 0.04)',
          }}
        >
          <Package size={13} />
          {item.productCount ?? 0}
        </span>
      </td>

      {/* Actions */}
      <td style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
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
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px', borderRadius: '4px' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#4f46e5')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <Edit2 size={15} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item.id, item.name)}
              title="Eliminar"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px', borderRadius: '4px' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-danger)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

// ─── Master Attribute Row (Expandable with Values Management) ─────────────────
function MasterAttributeRow({ item, accessToken, onDelete, onUpdate }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newValue, setNewValue] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Values query & mutations
  const { data: values = [], isLoading } = useAttributeValues(accessToken, item.id);
  const createValue = useCreateAttributeValue(accessToken);
  const deleteValue = useDeleteAttributeValue(accessToken);

  const handleAddValue = async (e) => {
    e.preventDefault();
    if (!newValue.trim()) return;
    try {
      await createValue.mutateAsync({
        attributeId: item.id,
        value: newValue.trim(),
        description: newDesc.trim() || null,
      });
      setNewValue('');
      setNewDesc('');
    } catch (err) {
      alert(err.response?.data?.error?.message || err.message || 'Error al crear valor de atributo');
    }
  };

  const handleDeleteValue = async (valId, valName) => {
    if (!window.confirm(`¿Eliminar el valor "${valName}"?`)) return;
    try {
      await deleteValue.mutateAsync(valId);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Error al eliminar valor');
    }
  };

  // Generate fallback code display if code field was null
  const displayCode = item.code || `ATT-${(item.name || '').substring(0, 3).toUpperCase()}`;

  return (
    <>
      <tr
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: isExpanded ? 'rgba(79, 70, 229, 0.04)' : 'transparent',
          transition: 'background 150ms ease',
        }}
      >
        {/* Code */}
        <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '700', color: 'var(--accent-primary)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
          {displayCode}
        </td>

        {/* Name & description */}
        <td style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{item.name}</span>
            {item.isSystem && (
              <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(79, 70, 229, 0.12)', color: '#4f46e5' }}>
                Sistema
              </span>
            )}
          </div>
          {item.description && (
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.description}</div>
          )}
        </td>

        {/* Product Count column */}
        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '13px',
              fontWeight: '700',
              color: item.productCount > 0 ? '#4f46e5' : 'var(--text-tertiary)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: item.productCount > 0 ? 'rgba(79, 70, 229, 0.1)' : 'rgba(0, 0, 0, 0.04)',
            }}
          >
            <Package size={13} />
            {item.productCount ?? 0}
          </span>
        </td>

        {/* Values count + expand toggle */}
        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#4f46e5',
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            <span>{item.valueCount || 0} valores</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </td>

        {/* Actions */}
        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
          {!item.isSystem && (
            <button
              type="button"
              onClick={() => onDelete(item.id, item.name)}
              title="Eliminar atributo maestro"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-danger)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <Trash2 size={15} />
            </button>
          )}
        </td>
      </tr>

      {/* Expanded drawer for attribute values */}
      {isExpanded && (
        <tr>
          <td colSpan={5} style={{ padding: '0 16px 16px 48px', backgroundColor: 'rgba(79, 70, 229, 0.03)', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(79, 70, 229, 0.2)', backgroundColor: 'rgba(255, 255, 255, 0.85)', marginTop: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} style={{ color: '#4f46e5' }} />
                Valores Maestros Registrados para {item.name}
              </div>

              {/* Form to add new value */}
              <form onSubmit={handleAddValue} style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={`Nuevo valor para ${item.name} (ej. Titanio Natural)...`}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '13px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: '#ffffff',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
                <Button type="submit" variant="primary" icon={Plus} isLoading={createValue.isPending}>
                  Agregar Valor
                </Button>
              </form>

              {/* Values list */}
              {isLoading ? (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Cargando valores...</div>
              ) : values.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No hay valores guardados aún. Agregá el primero arriba.</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {values.map((v) => (
                    <div
                      key={v.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <span style={{ color: '#4f46e5', fontSize: '11px', fontFamily: 'monospace', fontWeight: '700' }}>{v.code}</span>
                      <span>{v.value}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteValue(v.id, v.value)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '2px', display: 'flex', marginLeft: '4px' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-danger)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
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
  const [newAttrDesc, setNewAttrDesc] = useState('');

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
  const updateAttribute = useUpdateAttribute(accessToken);
  const deleteAttribute = useDeleteAttribute(accessToken);

  const handleDelete = async (id, name, type) => {
    if (!window.confirm(`¿Eliminar "${name}"?`)) return;
    try {
      if (type === 'brand') await deleteBrand.mutateAsync(id);
      else if (type === 'category') await deleteCategory.mutateAsync(id);
      else await deleteAttribute.mutateAsync(id);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Error al eliminar');
    }
  };

  const handleAttrCreate = async (e) => {
    e.preventDefault();
    if (!newAttrName.trim()) return;
    try {
      await createAttribute.mutateAsync({ name: newAttrName.trim(), description: newAttrDesc.trim() || null });
      setNewAttrName('');
      setNewAttrDesc('');
    } catch (err) {
      alert(err.response?.data?.error?.message || err.message || 'Error al crear atributo');
    }
  };

  // Filtered lists
  const filteredBrands = useMemo(() => {
    if (!search.trim()) return brands;
    const q = search.toLowerCase();
    return brands.filter((b) => b.name.toLowerCase().includes(q) || (b.description && b.description.toLowerCase().includes(q)));
  }, [brands, search]);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q)) || c.slug.toLowerCase().includes(q));
  }, [categories, search]);

  const filteredAttributes = useMemo(() => {
    if (!search.trim()) return attributes;
    const q = search.toLowerCase();
    return attributes.filter((a) => a.name.toLowerCase().includes(q) || (a.description && a.description.toLowerCase().includes(q)) || (a.code && a.code.toLowerCase().includes(q)));
  }, [attributes, search]);

  const tabs = [
    { id: 'brands', label: 'Marcas', icon: Tag, count: brands.length },
    { id: 'categories', label: 'Categorías', icon: Layers, count: categories.length },
    { id: 'attributes', label: 'Atributos & Valores', icon: Sliders, count: attributes.length },
  ];

  const isTagTab = tab === 'brands' || tab === 'categories';

  return (
    <div
      className="apple-glass"
      style={{
        width: '100%',
        flex: 1,
        minHeight: '100%',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header Tabs con diseño de alta visibilidad */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1.5px solid var(--border-subtle)', paddingBottom: '14px' }}>
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTab(t.id);
                setSearch('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: 'var(--radius-sm)',
                border: isActive ? '1px solid rgba(79, 70, 229, 0.4)' : '1px solid var(--border-subtle)',
                fontSize: '14px',
                fontWeight: '700',
                background: isActive ? 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)' : 'rgba(255, 255, 255, 0.6)',
                color: isActive ? '#ffffff' : 'var(--text-primary)',
                boxShadow: isActive ? '0 4px 14px rgba(79, 70, 229, 0.35)' : 'none',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
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

        {/* Create button */}
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
              placeholder="Nombre del atributo (ej. Voltaje)..."
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
              Crear Atributo
            </Button>
          </form>
        )}
      </div>

      {/* Table */}
      <div style={{ flex: 1, borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-secondary)' }}>
        {isTagTab ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', borderBottom: '1.5px solid var(--border-subtle)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  {tab === 'brands' ? 'Marca' : 'Slug'}
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Nombre / Descripción
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  Productos
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {(tab === 'brands' ? filteredBrands : filteredCategories).length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
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
          // Master Attributes Table with expandable values drawer and subtle row divider lines
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', borderBottom: '1.5px solid var(--border-subtle)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  Código
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Atributo / Descripción
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  Productos
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  Valores Guardados
                </th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAttributes.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    {search ? `Sin resultados para "${search}"` : 'No hay atributos registrados. Creá el primero.'}
                  </td>
                </tr>
              ) : (
                filteredAttributes.map((item) => (
                  <MasterAttributeRow
                    key={item.id}
                    item={item}
                    accessToken={accessToken}
                    onDelete={(id, name) => handleDelete(id, name, 'attribute')}
                    onUpdate={(id, data) => updateAttribute.mutateAsync({ id, ...data })}
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
