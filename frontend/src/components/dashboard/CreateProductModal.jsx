import React, { useState } from 'react';
import { X, Package, DollarSign, Tag, Layers, CheckCircle, AlertCircle, Plus, Trash2, Sliders } from 'lucide-react';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import { createProductSchema } from '../../../../shared/schemas/product.schema.js';
import { useCreateProduct } from '../../hooks/useProducts.js';
import { useBrands, useCategories, useAttributes, useAllAttributeValues } from '../../hooks/useCatalog.js';
import { CreateBrandModal } from './CreateBrandModal.jsx';
import { CreateCategoryModal } from './CreateCategoryModal.jsx';

export function CreateProductModal({ isOpen, onClose, onSuccess, accessToken }) {
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(''); // drives smart brand sort

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    brandId: '',
    categoryId: '',
    shortDescription: '',
    description: '',
    priceUsd1: '',
    priceUsd2: '',
    priceUsd3: '',
    costUsd: '',
    stockQuantity: 0,
    minStockAlert: 5,
  });

  // Dynamic user-selected attribute rows: [{ id: string, attributeId: string, value: string }]
  const [selectedAttributes, setSelectedAttributes] = useState([]);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const createProductMutation = useCreateProduct(accessToken);

  // Queries
  const { data: brands = [] } = useBrands(accessToken, selectedCategoryId || null);
  const { data: categories = [] } = useCategories(accessToken);
  const { data: attributes = [] } = useAttributes(accessToken);
  const { data: attributeValues = [] } = useAllAttributeValues(accessToken);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const parsed = type === 'number' ? Number(value) : value;
    setFormData((prev) => ({ ...prev, [name]: parsed }));

    if (name === 'categoryId') setSelectedCategoryId(value);
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (serverError) setServerError('');
  };

  // Dynamic attribute row handlers
  const handleAddAttributeRow = () => {
    setSelectedAttributes((prev) => [
      ...prev,
      { id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, attributeId: '', value: '' },
    ]);
  };

  const handleRemoveAttributeRow = (rowId) => {
    setSelectedAttributes((prev) => prev.filter((r) => r.id !== rowId));
  };

  const handleAttributeRowChange = (rowId, field, val) => {
    setSelectedAttributes((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [field]: val } : r))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Map dynamic attribute rows into model fields vs custom attributes payload
    const mappedAttrs = {
      modelName: null,
      color: null,
      size: null,
      material: null,
      warrantyInfo: null,
      customAttributes: [],
    };

    selectedAttributes.forEach((row) => {
      if (!row.attributeId || !row.value) return;
      const attrObj = attributes.find((a) => a.id === row.attributeId);
      if (!attrObj) return;

      const nameLower = attrObj.name.toLowerCase();
      if (nameLower.includes('modelo')) mappedAttrs.modelName = row.value;
      else if (nameLower.includes('color')) mappedAttrs.color = row.value;
      else if (nameLower.includes('talla') || nameLower.includes('almacenamiento')) mappedAttrs.size = row.value;
      else if (nameLower.includes('material')) mappedAttrs.material = row.value;
      else if (nameLower.includes('garantía') || nameLower.includes('garantia')) mappedAttrs.warrantyInfo = row.value;
      else {
        mappedAttrs.customAttributes.push({ attributeId: row.attributeId, value: row.value });
      }
    });

    const payload = {
      ...formData,
      ...mappedAttrs,
      brandId: formData.brandId || undefined,
      categoryId: formData.categoryId || undefined,
    };

    const result = createProductSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setServerError('');

    try {
      await createProductMutation.mutateAsync(payload);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.error?.message || err.error?.message || 'Error al crear producto');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        className="apple-glass"
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        {/* Cabecera Modal */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Agregar Nuevo Producto</h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
          >
            <X size={20} />
          </button>
        </div>

        {serverError && (
          <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(255, 59, 48, 0.1)', color: 'var(--status-danger)', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Información Principal */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <Input label="Nombre del Producto" name="name" value={formData.name} onChange={handleChange} error={errors.name} placeholder="ej: iPhone 15 Pro 256GB" icon={Package} required />
            <Input label="SKU / Código" name="sku" value={formData.sku} onChange={handleChange} placeholder="IPHONE-15-256" icon={Tag} />
          </div>

          {/* Clasificación obligatoria/por defecto: Marca & Categoría */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  Marca
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddBrandOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4f46e5',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Plus size={13} /> Nueva
                </button>
              </div>
              <select
                name="brandId"
                value={formData.brandId}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: '14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              >
                <option value="">-- Sin Marca --</option>
                {formData.categoryId ? (
                  (() => {
                    const suggested = brands.filter((b) => (b.categoryUsage ?? 0) > 0);
                    const others = brands.filter((b) => (b.categoryUsage ?? 0) === 0);
                    return (
                      <>
                        {suggested.length > 0 && (
                          <optgroup label="✦ Usadas en esta categoría">
                            {suggested.map((b) => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </optgroup>
                        )}
                        {others.length > 0 && (
                          <optgroup label={suggested.length > 0 ? 'Otras marcas' : 'Todas las marcas'}>
                            {others.map((b) => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </optgroup>
                        )}
                      </>
                    );
                  })()
                ) : (
                  brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  Categoría
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddCategoryOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4f46e5',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Plus size={13} /> Nueva
                </button>
              </div>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: '14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              >
                <option value="">-- Sin Categoría --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sección Dinámica de Atributos & Especificaciones */}
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(79, 70, 229, 0.03)', border: '1px solid rgba(79, 70, 229, 0.15)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sliders size={15} style={{ color: '#4f46e5' }} />
                  Atributos del Producto
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Agregá solo los atributos que apliquen a este producto (ej. Color, Talla, Modelo, Garantía...)
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddAttributeRow}
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Plus size={14} /> Atributo
              </button>
            </div>

            {selectedAttributes.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontStyle: 'italic', padding: '8px 0' }}>
                No hay atributos asignados. Hacé clic en "+ Atributo" para agregar uno (ej. Color = Titanio Natural).
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedAttributes.map((row) => {
                  const selectedAttrObj = attributes.find((a) => a.id === row.attributeId);
                  const availableValues = selectedAttrObj
                    ? attributeValues.filter((v) => v.attributeId === selectedAttrObj.id || v.attributeName === selectedAttrObj.name)
                    : [];
                  const datalistId = `datalist-${row.id}`;

                  return (
                    <div key={row.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {/* Dropdown de Atributo */}
                      <select
                        value={row.attributeId}
                        onChange={(e) => handleAttributeRowChange(row.id, 'attributeId', e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          fontSize: '13px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                        }}
                      >
                        <option value="">-- Seleccionar Atributo --</option>
                        {attributes.map((attr) => (
                          <option key={attr.id} value={attr.id}>
                            {attr.name} {attr.code ? `(${attr.code})` : ''}
                          </option>
                        ))}
                      </select>

                      {/* Input de Valor con Auto-sugerencia */}
                      <input
                        type="text"
                        value={row.value}
                        onChange={(e) => handleAttributeRowChange(row.id, 'value', e.target.value)}
                        placeholder={selectedAttrObj ? `Valor para ${selectedAttrObj.name}...` : 'Valor...'}
                        list={datalistId}
                        style={{
                          flex: 1.5,
                          padding: '8px 12px',
                          fontSize: '13px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: 'var(--bg-secondary)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                        }}
                      />
                      <datalist id={datalistId}>
                        {availableValues.map((v) => (
                          <option key={v.id} value={v.value} />
                        ))}
                      </datalist>

                      {/* Botón eliminar fila */}
                      <button
                        type="button"
                        onClick={() => handleRemoveAttributeRow(row.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '6px' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-danger)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Precios Multi-nivel USD (8 decimales exactos) */}
          <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', marginTop: '8px', marginBottom: '12px' }}>
            Precios USD (8 decimales exactos)
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Precio 1 - Minorista USD" name="priceUsd1" value={formData.priceUsd1} onChange={handleChange} error={errors.priceUsd1} placeholder="1199.99000000" icon={DollarSign} required />
            <Input label="Precio 2 - Mayorista USD" name="priceUsd2" value={formData.priceUsd2} onChange={handleChange} error={errors.priceUsd2} placeholder="1099.50000000" icon={DollarSign} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Precio 3 - VIP USD" name="priceUsd3" value={formData.priceUsd3} onChange={handleChange} error={errors.priceUsd3} placeholder="1049.00000000" icon={DollarSign} />
            <Input label="Costo Interno USD" name="costUsd" value={formData.costUsd} onChange={handleChange} error={errors.costUsd} placeholder="850.00000000" icon={DollarSign} />
          </div>

          {/* Inventario */}
          <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent-primary)', textTransform: 'uppercase', marginTop: '8px', marginBottom: '12px' }}>
            Inventario & Stock
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Cantidad en Stock" name="stockQuantity" type="number" value={formData.stockQuantity} onChange={handleChange} icon={Package} required />
            <Input label="Alerta Stock Mínimo" name="minStockAlert" type="number" value={formData.minStockAlert} onChange={handleChange} icon={AlertCircle} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={createProductMutation.isPending} icon={CheckCircle}>
              Crear Producto
            </Button>
          </div>
        </form>
      </div>

      {/* Modales de Creación Rápida */}
      <CreateBrandModal
        isOpen={isAddBrandOpen}
        onClose={() => setIsAddBrandOpen(false)}
        accessToken={accessToken}
        onSuccess={(newBrand) => {
          if (newBrand?.id) {
            setFormData((prev) => ({ ...prev, brandId: newBrand.id }));
          }
        }}
      />

      <CreateCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        accessToken={accessToken}
        onSuccess={(newCategory) => {
          if (newCategory?.id) {
            setFormData((prev) => ({ ...prev, categoryId: newCategory.id }));
          }
        }}
      />
    </div>
  );
}
