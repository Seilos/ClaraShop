import React, { useState } from 'react';
import { X, Package, DollarSign, Tag, Layers, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import { createProductSchema } from '../../../../shared/schemas/product.schema.js';
import { useCreateProduct } from '../../hooks/useProducts.js';
import { useBrands, useCategories, useAllAttributeValues } from '../../hooks/useCatalog.js';
import { CreateBrandModal } from './CreateBrandModal.jsx';
import { CreateCategoryModal } from './CreateCategoryModal.jsx';

export function CreateProductModal({ isOpen, onClose, onSuccess, accessToken }) {
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(''); // drives smart brand sort

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    brandId: '',
    categoryId: '',
    modelName: '',
    color: '',
    size: '',
    material: '',
    warrantyInfo: '',
    shortDescription: '',
    description: '',
    priceUsd1: '',
    priceUsd2: '',
    priceUsd3: '',
    costUsd: '',
    stockQuantity: 0,
    minStockAlert: 5,
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const createProductMutation = useCreateProduct(accessToken);

  // brands se re-sortean automáticamente cuando cambia selectedCategoryId
  const { data: brands = [] } = useBrands(accessToken, selectedCategoryId || null);
  const { data: categories = [] } = useCategories(accessToken);
  const { data: attributeValues = [] } = useAllAttributeValues(accessToken);

  if (!isOpen) return null;

  // Filter attribute values per category/type for auto-suggestions
  const modelOptions = attributeValues.filter((v) => v.attributeName?.toLowerCase().includes('modelo'));
  const colorOptions = attributeValues.filter((v) => v.attributeName?.toLowerCase().includes('color'));
  const sizeOptions = attributeValues.filter((v) => v.attributeName?.toLowerCase().includes('talla') || v.attributeName?.toLowerCase().includes('almacenamiento'));
  const materialOptions = attributeValues.filter((v) => v.attributeName?.toLowerCase().includes('material'));
  const warrantyOptions = attributeValues.filter((v) => v.attributeName?.toLowerCase().includes('garantía') || v.attributeName?.toLowerCase().includes('garantia'));

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const parsed = type === 'number' ? Number(value) : value;
    setFormData((prev) => ({ ...prev, [name]: parsed }));

    // Sync selectedCategoryId so useBrands re-fetches with smart sort
    if (name === 'categoryId') setSelectedCategoryId(value);

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
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
                  // Con categoría seleccionada: separar sugeridas vs otras
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

          {/* Atributos Maestros con Auto-sugerencias Dinámicas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <Input label="Modelo" name="modelName" value={formData.modelName} onChange={handleChange} placeholder="Pro Max" list="model-options" />
            <datalist id="model-options">
              {modelOptions.map((v) => <option key={v.id} value={v.value} />)}
            </datalist>

            <Input label="Color" name="color" value={formData.color} onChange={handleChange} placeholder="Titanio Natural" list="color-options" />
            <datalist id="color-options">
              {colorOptions.map((v) => <option key={v.id} value={v.value} />)}
            </datalist>

            <Input label="Talla / Almacenamiento" name="size" value={formData.size} onChange={handleChange} placeholder="256GB / M" list="size-options" />
            <datalist id="size-options">
              {sizeOptions.map((v) => <option key={v.id} value={v.value} />)}
            </datalist>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="Material" name="material" value={formData.material} onChange={handleChange} placeholder="Titanio & Cristal" list="material-options" />
            <datalist id="material-options">
              {materialOptions.map((v) => <option key={v.id} value={v.value} />)}
            </datalist>

            <Input label="Garantía" name="warrantyInfo" value={formData.warrantyInfo} onChange={handleChange} placeholder="12 Meses Oficial" list="warranty-options" />
            <datalist id="warranty-options">
              {warrantyOptions.map((v) => <option key={v.id} value={v.value} />)}
            </datalist>
          </div>

          {/* Precios Multi-nivel con decimal.js (8 decimales) */}
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
