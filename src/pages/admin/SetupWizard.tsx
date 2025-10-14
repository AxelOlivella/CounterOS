import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

export default function SetupWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    corporate: { name: '', slug: '', logo_url: '' },
    legalEntity: { name: '', rfc: '', tax_regime: '' },
    brand: { name: '', slug: '', concept: 'fast_casual', target_food_cost: 30 },
  });

  const steps = [
    { num: 1, label: 'Corporativo' },
    { num: 2, label: 'RFC' },
    { num: 3, label: 'Marcas' },
    { num: 4, label: 'Tiendas' },
    { num: 5, label: 'Data' },
    { num: 6, label: 'Recetas' },
    { num: 7, label: 'Procesar' },
  ];

  return (
    <div className="p-6">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 px-4">
        {steps.map((s, idx) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                  s.num === step
                    ? 'bg-primary text-primary-foreground'
                    : s.num < step
                    ? 'bg-green-500 text-white'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {s.num < step ? <Check className="w-5 h-5" /> : s.num}
              </div>
              <span className="text-xs mt-2 text-muted-foreground">{s.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`h-1 flex-1 mx-2 ${
                  s.num < step ? 'bg-green-500' : 'bg-secondary'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {step === 1 && <Step1Corporate formData={formData} setFormData={setFormData} />}
        {step === 2 && <Step2LegalEntity formData={formData} setFormData={setFormData} />}
        {step === 3 && <Step3Brand formData={formData} setFormData={setFormData} />}
        {step === 4 && <Step4Stores />}
        {step === 5 && <Step5ImportData />}
        {step === 6 && <Step6Recipes />}
        {step === 7 && <Step7Process />}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-border">
        <Button
          variant="outline"
          onClick={() => setStep(s => Math.max(1, s - 1))}
          disabled={step === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>
        <Button
          onClick={() => setStep(s => Math.min(7, s + 1))}
          disabled={step === 7}
        >
          {step === 7 ? 'Finalizar' : 'Siguiente'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// Step Components
function Step1Corporate({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Datos del Corporativo</h3>
        <p className="text-sm text-muted-foreground">
          Información del grupo económico principal
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="corp-name">Nombre del Grupo</Label>
          <Input
            id="corp-name"
            placeholder="Ej: Grupo MYT"
            value={formData.corporate.name}
            onChange={(e) => setFormData((prev: any) => ({
              ...prev,
              corporate: { ...prev.corporate, name: e.target.value }
            }))}
          />
        </div>

        <div>
          <Label htmlFor="corp-slug">Slug (URL-friendly)</Label>
          <Input
            id="corp-slug"
            placeholder="Ej: grupo-myt"
            value={formData.corporate.slug}
            onChange={(e) => setFormData((prev: any) => ({
              ...prev,
              corporate: { ...prev.corporate, slug: e.target.value }
            }))}
          />
        </div>

        <div>
          <Label htmlFor="corp-logo">URL del Logo (opcional)</Label>
          <Input
            id="corp-logo"
            placeholder="https://..."
            value={formData.corporate.logo_url}
            onChange={(e) => setFormData((prev: any) => ({
              ...prev,
              corporate: { ...prev.corporate, logo_url: e.target.value }
            }))}
          />
        </div>
      </div>
    </div>
  );
}

function Step2LegalEntity({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Razón Social (RFC)</h3>
        <p className="text-sm text-muted-foreground">
          Persona moral que emite facturas (CFDIs)
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="le-name">Razón Social</Label>
          <Input
            id="le-name"
            placeholder="Ej: MYT Restaurantes SA de CV"
            value={formData.legalEntity.name}
            onChange={(e) => setFormData((prev: any) => ({
              ...prev,
              legalEntity: { ...prev.legalEntity, name: e.target.value }
            }))}
          />
        </div>

        <div>
          <Label htmlFor="le-rfc">RFC</Label>
          <Input
            id="le-rfc"
            placeholder="Ej: MYT123456ABC"
            value={formData.legalEntity.rfc}
            onChange={(e) => setFormData((prev: any) => ({
              ...prev,
              legalEntity: { ...prev.legalEntity, rfc: e.target.value.toUpperCase() }
            }))}
          />
        </div>

        <div>
          <Label htmlFor="le-regime">Régimen Fiscal (opcional)</Label>
          <Input
            id="le-regime"
            placeholder="Ej: Régimen General"
            value={formData.legalEntity.tax_regime}
            onChange={(e) => setFormData((prev: any) => ({
              ...prev,
              legalEntity: { ...prev.legalEntity, tax_regime: e.target.value }
            }))}
          />
        </div>
      </div>
    </div>
  );
}

function Step3Brand({ formData, setFormData }: any) {
  const concepts = [
    { value: 'sushi', label: '🍣 Sushi' },
    { value: 'crepas', label: '🥞 Crepas' },
    { value: 'cafe', label: '☕ Café' },
    { value: 'hamburguesas', label: '🍔 Hamburguesas' },
    { value: 'tacos', label: '🌮 Tacos' },
    { value: 'froyo', label: '🍦 Frozen Yogurt' },
    { value: 'pizza', label: '🍕 Pizza' },
    { value: 'fast_casual', label: '🍴 Fast Casual' },
    { value: 'casual_dining', label: '🍽️ Casual Dining' },
    { value: 'fine_dining', label: '⭐ Fine Dining' },
    { value: 'other', label: '📦 Otro' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Marca Comercial</h3>
        <p className="text-sm text-muted-foreground">
          Concepto gastronómico que opera las tiendas
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="brand-name">Nombre de la Marca</Label>
          <Input
            id="brand-name"
            placeholder="Ej: Moshi Moshi"
            value={formData.brand.name}
            onChange={(e) => setFormData((prev: any) => ({
              ...prev,
              brand: { ...prev.brand, name: e.target.value }
            }))}
          />
        </div>

        <div>
          <Label htmlFor="brand-slug">Slug</Label>
          <Input
            id="brand-slug"
            placeholder="Ej: moshi-moshi"
            value={formData.brand.slug}
            onChange={(e) => setFormData((prev: any) => ({
              ...prev,
              brand: { ...prev.brand, slug: e.target.value }
            }))}
          />
        </div>

        <div>
          <Label htmlFor="brand-concept">Concepto</Label>
          <select
            id="brand-concept"
            className="w-full px-3 py-2 rounded-md border border-input bg-background"
            value={formData.brand.concept}
            onChange={(e) => setFormData((prev: any) => ({
              ...prev,
              brand: { ...prev.brand, concept: e.target.value }
            }))}
          >
            {concepts.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="brand-fc">Target Food Cost (%)</Label>
          <Input
            id="brand-fc"
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={formData.brand.target_food_cost}
            onChange={(e) => setFormData((prev: any) => ({
              ...prev,
              brand: { ...prev.brand, target_food_cost: parseFloat(e.target.value) }
            }))}
          />
        </div>
      </div>
    </div>
  );
}

function Step4Stores() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Lista de Tiendas</h3>
        <p className="text-sm text-muted-foreground">
          Importa un CSV o agrega manualmente
        </p>
      </div>
      <div className="p-8 border-2 border-dashed border-border rounded-lg text-center">
        <p className="text-muted-foreground mb-4">Funcionalidad pendiente de implementar</p>
        <Button variant="outline">Subir CSV de Tiendas</Button>
      </div>
    </div>
  );
}

function Step5ImportData() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Importar Data Histórica</h3>
        <p className="text-sm text-muted-foreground">
          Facturas XML + CSV de ventas
        </p>
      </div>
      <div className="p-8 border-2 border-dashed border-border rounded-lg text-center">
        <p className="text-muted-foreground mb-4">Funcionalidad pendiente de implementar</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline">Subir XMLs</Button>
          <Button variant="outline">Subir CSV Ventas</Button>
        </div>
      </div>
    </div>
  );
}

function Step6Recipes() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Configurar Recetas</h3>
        <p className="text-sm text-muted-foreground">
          Templates de recetas por concepto
        </p>
      </div>
      <div className="p-8 border-2 border-dashed border-border rounded-lg text-center">
        <p className="text-muted-foreground mb-4">Funcionalidad pendiente de implementar</p>
        <Button variant="outline">Seleccionar Templates</Button>
      </div>
    </div>
  );
}

function Step7Process() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Procesar y Activar</h3>
        <p className="text-sm text-muted-foreground">
          Revisar y confirmar configuración
        </p>
      </div>
      <div className="p-8 bg-secondary/50 rounded-lg">
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Corporativo:</span>
            <span className="font-medium">Pendiente</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">RFC:</span>
            <span className="font-medium">Pendiente</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Marcas:</span>
            <span className="font-medium">0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tiendas:</span>
            <span className="font-medium">0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
