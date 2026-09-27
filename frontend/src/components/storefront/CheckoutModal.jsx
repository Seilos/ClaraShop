import React, { useState } from 'react';
import { X, User, Phone, CreditCard, Globe, Building, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import { createOrderSchema } from '../../../../shared/schemas/order.schema.js';
import { useCreateOrder } from '../../hooks/useStorefront.js';

export function CheckoutModal({ isOpen, onClose, storeSlug, cartItems, settings, onOrderSuccess }) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerContact: '',
    paymentMethod: 'Transferencia Bancaria',
    country: 'Argentina',
    city: 'Buenos Aires',
    address: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const createOrderMutation = useCreateOrder();

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: null }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      tenantSlug: storeSlug,
      ...formData,
      items: cartItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      })),
    };

    const result = createOrderSchema.safeParse(payload);
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
      const { whatsappUrl, orderNumber } = await createOrderMutation.mutateAsync(payload);

      // Abrir enlace wa.me de WhatsApp
      if (whatsappUrl) {
        window.open(whatsappUrl, '_blank');
      }

      if (onOrderSuccess) onOrderSuccess(orderNumber);
      onClose();
    } catch (err) {
      setServerError(err.response?.data?.error?.message || err.error?.message || 'Error al procesar el pedido. Intente nuevamente.');
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
        zIndex: 1100,
        padding: '20px',
      }}
    >
      <div
        className="apple-glass"
        style={{
          width: '100%',
          maxWidth: '540px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Formulario de Pedido</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Completá tus datos para enviar la orden por WhatsApp y Correo
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
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
          <Input label="Nombre y Apellido" name="customerName" value={formData.customerName} onChange={handleChange} error={errors.customerName} placeholder="ej: Juan Pérez" icon={User} required />

          <Input label="Teléfono o Correo de Contacto" name="customerContact" value={formData.customerContact} onChange={handleChange} error={errors.customerContact} placeholder="+5491122334455 / juan@ejemplo.com" icon={Phone} required />

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Método de Pago Preferido <span style={{ color: 'var(--status-danger)' }}>*</span>
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
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
              <option value="Transferencia Bancaria">Transferencia Bancaria</option>
              <option value="Pago Móvil / QR">Pago Móvil / QR</option>
              <option value="Efectivo en Entrega">Efectivo en Entrega</option>
              <option value="Zelle / Binance">Zelle / Binance USDT</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input label="País" name="country" value={formData.country} onChange={handleChange} error={errors.country} placeholder="Argentina" icon={Globe} required />
            <Input label="Ciudad" name="city" value={formData.city} onChange={handleChange} error={errors.city} placeholder="Buenos Aires" icon={Building} required />
          </div>

          <Input label="Dirección Aproximada de Entrega" name="address" value={formData.address} onChange={handleChange} error={errors.address} placeholder="Av. Corrientes 1234, Barrio Norte" icon={MapPin} required />

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={createOrderMutation.isPending} icon={Send}>
              Enviar Pedido por WhatsApp
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
