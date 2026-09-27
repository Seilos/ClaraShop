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
    } catch {
      alert('Error al crear valor de atributo');
    }
  };

  const handleDeleteValue = async (valId, valName) => {
    if (!window.confirm(`¿Eliminar el valor "${valName}"?`)) return;
    try {
      await deleteValue.mutateAsync(valId);
    } catch {
      alert('Error al eliminar valor');
    }
  };

  return (
    <>
      <tr
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: isExpanded ? 'rgba(79, 70, 229, 0.02)' : 'transparent',
          transition: 'background 150ms ease',
        }}
      >
        {/* Code */}
        <td style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
          {item.code}
        </td>

        {/* Name & description */}
        <td style={{ padding: '12px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.name}</span>
            {item.isSystem && (
              <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5' }}>
                Sistema
              </span>
            )}
          </div>
          {item.description && (
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{item.description}</div>
          )}
        </td>

        {/* Values count + expand toggle */}
        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#4f46e5',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(79, 70, 229, 0.08)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span>{item.valueCount || 0} valores</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </td>

        {/* Actions */}
        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
          {!item.isSystem && (
            <button
              type="button"
              onClick={() => onDelete(item.id, item.name)}
              title="Eliminar atributo maestro"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-danger)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
            >
              <Trash2 size={15} />
            </button>
          )}
        </td>
      </tr>

      {/* Expanded drawer for attribute values */}
      {isExpanded && (
        <tr>
          <td colSpan={4} style={{ padding: '0 16px 16px 48px', backgroundColor: 'rgba(79, 70, 229, 0.02)', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(79, 70, 229, 0.15)', backgroundColor: 'var(--bg-secondary)' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={13} style={{ color: '#4f46e5' }} />
                Valores Maestros para {item.name}
              </div>

              {/* Form to add new value */}
              <form onSubmit={handleAddValue} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
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
                    backgroundColor: 'var(--bg-primary)',
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
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Cargando valores...</div>
              ) : values.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', italic: 'true' }}>No hay valores guardados aún. Agregá el primero arriba.</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {values.map((v) => (
                    <div
                      key={v.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-primary)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '10px', fontFamily: 'monospace' }}>{v.code}</span>
                      <span>{v.value}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteValue(v.id, v.value)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '2px', display: 'flex' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-danger)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                      >
                        <X size={13} />
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
    } catch {
      alert('Error al eliminar');
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
      alert(err.response?.data?.error?.message || 'Error al crear atributo');
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      {/* Header Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
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
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: isActive ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                color: isActive ? '#4f46e5' : 'var(--text-secondary)',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', width: '100%' }}>
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
          // Master Attributes Table with expandable values drawer
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(0,0,0,0.025)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  Código
                </th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Atributo / Descripción
                </th>
                <th style={{ padding: '10px 16px', textAlign: 'center', fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  Valores Guardados
                </th>
                <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAttributes.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '14px' }}>
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
