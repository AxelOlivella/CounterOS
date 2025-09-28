// Mini Form for Upload Page
// Mobile-optimized financial data entry with auto-calculations

import { useState, useEffect } from 'react';
import { calculatePnL, type PnLData } from '@/lib/finance';
import MiniFormComponent, { FormSection } from '@/components/MiniForm';
import MiniPnL from '@/components/MiniPnL';
import StickyCTA from '@/components/StickyCTA';

interface UploadFormData {
  sales: number;
  cogs: number;
  rent: number;
  payroll: number;
  energy: number;
  other: number;
}

interface MiniFormProps {
  onSave: (data: PnLData) => void;
  initialData?: Partial<UploadFormData>;
  storeName?: string;
  period?: string;
}

export default function MiniForm({ 
  onSave, 
  initialData = {},
  storeName = '',
  period = ''
}: MiniFormProps) {
  const [formData, setFormData] = useState<UploadFormData>({
    sales: 0,
    cogs: 0,
    rent: 0,
    payroll: 0,
    energy: 0,
    other: 0,
    ...initialData,
  });

  const [pnlData, setPnlData] = useState<PnLData | null>(null);
  const [showPnL, setShowPnL] = useState(false);

  // Recalculate P&L when form data changes
  useEffect(() => {
    if (formData.sales > 0) {
      const calculatedPnL = calculatePnL(formData);
      setPnlData(calculatedPnL);
    } else {
      setPnlData(null);
    }
  }, [formData]);

  const handleFieldChange = (key: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    if (pnlData) {
      setShowPnL(true);
      onSave(pnlData);
    }
  };

  // Auto-calculated fields based on sales
  const autoCalculated = pnlData ? {
    marketing: pnlData.marketing,
    royalties: pnlData.royalties,
  } : { marketing: 0, royalties: 0 };

  const revenueFields = [
    {
      key: 'sales',
      label: 'Ventas',
      value: formData.sales,
      placeholder: '150,000',
      hint: 'Ventas totales del período',
    },
  ];

  const cogsFields = [
    {
      key: 'cogs',
      label: 'COGS',
      value: formData.cogs,
      placeholder: '45,000',
      hint: 'Costo de productos vendidos',
    },
  ];

  const opexFields = [
    {
      key: 'rent',
      label: 'Renta',
      value: formData.rent,
      placeholder: '25,000',
    },
    {
      key: 'payroll',
      label: 'Nómina',
      value: formData.payroll,
      placeholder: '35,000',
    },
    {
      key: 'energy',
      label: 'Energía',
      value: formData.energy,
      placeholder: '8,000',
    },
    {
      key: 'other',
      label: 'Otros gastos',
      value: formData.other,
      placeholder: '5,000',
    },
  ];

  const autoFields = [
    {
      key: 'royalties',
      label: 'Regalías (6%)',
      value: autoCalculated.royalties,
      disabled: true,
      isCalculated: true,
      hint: 'Calculado automáticamente',
    },
    {
      key: 'marketing',
      label: 'Marketing (3%)',
      value: autoCalculated.marketing,
      disabled: true,
      isCalculated: true,
      hint: 'Calculado automáticamente',
    },
  ];

  const canSave = formData.sales > 0 && formData.cogs > 0 && pnlData;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-xl-custom font-semibold text-navy-600">
          Captura de datos
        </h1>
        {(storeName || period) && (
          <p className="text-caption text-gray-600 mt-1">
            {storeName && period ? `${storeName} • ${period}` : storeName || period}
          </p>
        )}
      </div>

      {/* Form Content */}
      <div className="px-4 py-6 space-y-6 pb-24">
        {/* Revenue Section */}
        <FormSection title="Ingresos">
          <MiniFormComponent
            fields={revenueFields}
            onChange={handleFieldChange}
          />
        </FormSection>

        {/* COGS Section */}
        <FormSection title="Costos de ventas">
          <MiniFormComponent
            fields={cogsFields}
            onChange={handleFieldChange}
          />
        </FormSection>

        {/* OPEX Section */}
        <FormSection title="Gastos operativos">
          <MiniFormComponent
            fields={opexFields}
            onChange={handleFieldChange}
          />
        </FormSection>

        {/* Auto-calculated Section */}
        <FormSection title="Calculados automáticamente">
          <MiniFormComponent
            fields={autoFields}
            onChange={handleFieldChange}
          />
        </FormSection>

        {/* P&L Preview */}
        {showPnL && pnlData && (
          <div className="space-y-3">
            <h3 className="text-xl-custom font-semibold text-navy-600 px-4">
              Resumen P&L
            </h3>
            <MiniPnL data={pnlData} />
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <StickyCTA
        onClick={handleSave}
        disabled={!canSave}
      >
        {showPnL ? 'Datos guardados ✓' : 'Guardar y ver P&L'}
      </StickyCTA>
    </div>
  );
}