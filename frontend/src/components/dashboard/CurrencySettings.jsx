import React, { useState, useEffect } from 'react';
import { DollarSign, RefreshCw, Save, CheckCircle, AlertCircle, ArrowRightLeft } from 'lucide-react';
import { Input } from '../ui/Input.jsx';
import { Button } from '../ui/Button.jsx';
import { formatDecimal, convertCurrency } from '../../../../shared/utils/math.js';
import { useTenantSettings, useUpdateCurrencies } from '../../hooks/useTenantSettings.js';

export function CurrencySettings({ accessToken }) {
  const { data: settingsRes, isLoading, isError } = useTenantSettings(accessToken);
  const updateCurrenciesMutation = useUpdateCurrencies(accessToken);

  const [formData, setFormData] = useState({
    baseCurrency: 'USD',
    secondaryCurrencyCode: 'VES',
    secondaryCurrencySymbol: 'Bs',
    exchangeRate: '36.54321000',
  });
  const [testAmountUsd, setTestAmountUsd] = useState('100');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (settingsRes) {
      setFormData({
        baseCurrency: settingsRes.baseCurrency || 'USD',
        secondaryCurrencyCode: settingsRes.secondaryCurrencyCode || 'VES',
        secondaryCurrencySymbol: settingsRes.secondaryCurrencySymbol || 'Bs',
        exchangeRate: settingsRes.exchangeRate || '1.00000000',
      });
    }
  }, [settingsRes]);

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
      const formattedRate = formatDecimal(formData.exchangeRate);
      const res = await updateCurrenciesMutation.mutateAsync({
        ...formData,
        exchangeRate: formattedRate,
      });

      setFormData((prev) => ({ ...prev, exchangeRate: res.data?.exchangeRate || formattedRate }));
      setMessage('Configuración de moneda y tasa de cambio guardada (8 decimales exactos)');
    } catch (err) {
      setError(err.response?.data?.error?.message || err.error?.message || 'Error al guardar tasa de cambio');
    }
  };

  let convertedPreview = '0.00000000';
  try {
    convertedPreview = convertCurrency(testAmountUsd || '0', formData.exchangeRate || '1');
  } catch {
    convertedPreview = 'Error en formato';
  }

  if (isLoading) {
    return <div style={{ padding: '24px', color: 'var(--text-secondary)' }}>Cargando configuraciones de moneda...</div>;
  }

  if (isError) {
    return <div style={{ padding: '24px', color: 'var(--status-danger)' }}>Error al cargar configuraciones de moneda.</div>;
  }

  return (
    <div className="apple-glass" style={{ padding: '28px', maxWidth: '680px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Configuración de Monedas & Tasa de Cambio</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Moneda base fija en Dólares (USD). Configurá la segunda moneda y la tasa de cambio con **precisión estricta de 8 decimales**.
        </p>
      </div>

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
          <Input label="Moneda Base" name="baseCurrency" value={formData.baseCurrency} onChange={handleChange} icon={DollarSign} disabled />
          <Input label="Código Segunda Moneda" name="secondaryCurrencyCode" value={formData.secondaryCurrencyCode} onChange={handleChange} placeholder="VES / ARS / COP" icon={RefreshCw} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input label="Símbolo Segunda Moneda" name="secondaryCurrencySymbol" value={formData.secondaryCurrencySymbol} onChange={handleChange} placeholder="Bs / $" icon={DollarSign} required />
          <Input label="Tasa de Cambio (1 USD = X)" name="exchangeRate" value={formData.exchangeRate} onChange={handleChange} placeholder="36.54321000" icon={RefreshCw} required />
        </div>

        {/* Simulador / Vista Previa de Conversión en Tiempo Real */}
        <div
          style={{
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--border-subtle)',
            marginTop: '16px',
            marginBottom: '24px',
          }}
        >
          <h4 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowRightLeft size={14} /> Vista Previa de Conversión (Decimal.js)
          </h4>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <Input label="Monto USD" name="testAmountUsd" value={testAmountUsd} onChange={(e) => setTestAmountUsd(e.target.value)} icon={DollarSign} />
            </div>

            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-tertiary)', marginTop: '8px' }}>=</div>

            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                En {formData.secondaryCurrencyCode} ({formData.secondaryCurrencySymbol})
              </label>
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  fontWeight: '700',
                  color: 'var(--accent-primary)',
                  fontSize: '14px',
                }}
              >
                {formData.secondaryCurrencySymbol} {convertedPreview}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="primary" isLoading={updateCurrenciesMutation.isPending} icon={Save}>
            Guardar Tasa de Cambio
          </Button>
        </div>
      </form>
    </div>
  );
}

