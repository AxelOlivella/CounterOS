import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useTenant } from '@/contexts/TenantContext';
import { 
  Store, 
  Mail, 
  Upload, 
  DollarSign, 
  Package,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileText
} from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export const OnboardingWizard = ({ onComplete }: OnboardingWizardProps) => {
  const { currentTenant } = useTenant();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const steps = [
    { number: 1, title: 'Tiendas y Responsables', icon: Store, description: 'Configure sus ubicaciones' },
    { number: 2, title: 'Buzón CFDI', icon: Mail, description: 'Conecte recepción de facturas' },
    { number: 3, title: 'Datos POS', icon: Upload, description: 'Suba información de ventas' },
    { number: 4, title: 'Gastos Fijos', icon: DollarSign, description: 'Configure costos operativos' },
    { number: 5, title: 'Inventario Inicial', icon: Package, description: 'Establezca stock base' }
  ];

  const progress = (currentStep / totalSteps) * 100;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Store className="w-12 h-12 mx-auto text-primary mb-3" />
              <h3 className="text-xl font-semibold mb-2">Configuración de Tiendas</h3>
              <p className="text-muted-foreground">Agregue sus ubicaciones y responsables</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="store-name">Nombre de la Tienda</Label>
                  <Input id="store-name" placeholder="Ej: Tienda Centro" />
                </div>
                <div>
                  <Label htmlFor="store-code">Código</Label>
                  <Input id="store-code" placeholder="Ej: CTR01" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="store-address">Dirección</Label>
                <Textarea id="store-address" placeholder="Dirección completa de la tienda" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="manager-name">Responsable</Label>
                  <Input id="manager-name" placeholder="Nombre del encargado" />
                </div>
                <div>
                  <Label htmlFor="manager-email">Email del Responsable</Label>
                  <Input id="manager-email" type="email" placeholder="email@ejemplo.com" />
                </div>
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">Tiendas configuradas:</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tienda Centro (CTR01)</span>
                  <Badge variant="secondary">Configurada</Badge>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Mail className="w-12 h-12 mx-auto text-primary mb-3" />
              <h3 className="text-xl font-semibold mb-2">Configuración de Buzón CFDI</h3>
              <p className="text-muted-foreground">Configure la recepción automática de facturas</p>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Su buzón CFDI:</h4>
                <code className="text-sm bg-blue-100 px-2 py-1 rounded">
                  facturas@{currentTenant.name}.froyoos.com
                </code>
                <p className="text-sm text-blue-700 mt-2">
                  Configure este email en sus proveedores para recepción automática
                </p>
              </div>
              
              <div>
                <Label htmlFor="current-email">Email actual para facturas (opcional)</Label>
                <Input 
                  id="current-email" 
                  type="email" 
                  placeholder="Si ya recibe facturas en otro email" 
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Podemos configurar el reenvío automático
                </p>
              </div>
              
              <div className="space-y-3">
                <Label>Proveedores principales</Label>
                {['Lácteos San Marcos', 'Distribuidora Norte', 'Frutas Frescas SA'].map((provider, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">{provider}</span>
                    <Badge variant="outline">Pendiente configurar</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Upload className="w-12 h-12 mx-auto text-primary mb-3" />
              <h3 className="text-xl font-semibold mb-2">Carga de Datos POS</h3>
              <p className="text-muted-foreground">Suba información de ventas históricas</p>
            </div>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                <h4 className="font-medium mb-2">Arrastre su archivo CSV aquí</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  O haga clic para seleccionar archivo
                </p>
                <Button variant="outline">Seleccionar Archivo</Button>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h5 className="font-medium mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Formato requerido del CSV:
                </h5>
                <code className="text-sm block bg-background p-2 rounded border font-mono">
                  store_id, datetime, ticket_id, sku_code, sku_name, qty, unit_price, payment_method
                </code>
                <p className="text-sm text-muted-foreground mt-2">
                  Ejemplo: CTR01, 2024-01-15 14:30:00, T001, YOG001, Yogurt Natural, 2, 45.00, Efectivo
                </p>
              </div>
              
              <div className="space-y-2">
                <h5 className="font-medium">Archivos cargados:</h5>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">ventas_enero_2024.csv</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Procesado
                    </Badge>
                  </div>
                  <p className="text-xs text-green-700 mt-1">1,247 registros importados</p>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <DollarSign className="w-12 h-12 mx-auto text-primary mb-3" />
              <h3 className="text-xl font-semibold mb-2">Gastos Fijos y Operativos</h3>
              <p className="text-muted-foreground">Configure costos para cálculo de P&L</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rent">Renta Mensual</Label>
                  <Input id="rent" type="number" placeholder="15000" />
                </div>
                <div>
                  <Label htmlFor="payroll">Nómina Mensual</Label>
                  <Input id="payroll" type="number" placeholder="35000" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="royalties">Regalías (%)</Label>
                  <Input id="royalties" type="number" placeholder="5" />
                </div>
                <div>
                  <Label htmlFor="marketing">Marketing (%)</Label>
                  <Input id="marketing" type="number" placeholder="2" />
                </div>
              </div>
              
              <div>
                <Label htmlFor="energy-estimate">Energía Estimada (Mensual)</Label>
                <Input id="energy-estimate" type="number" placeholder="3500" />
                <p className="text-sm text-muted-foreground mt-1">
                  Se actualizará automáticamente con facturas CFE
                </p>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h5 className="font-medium text-amber-900 mb-2">Resumen P&L Base:</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Renta:</span>
                    <span className="font-medium">$15,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nómina:</span>
                    <span className="font-medium">$35,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Regalías (5%):</span>
                    <span className="font-medium">Variable</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marketing (2%):</span>
                    <span className="font-medium">Variable</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Package className="w-12 h-12 mx-auto text-primary mb-3" />
              <h3 className="text-xl font-semibold mb-2">Inventario Inicial</h3>
              <p className="text-muted-foreground">Establezca cantidades base de ingredientes</p>
            </div>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Package className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                <h4 className="font-medium mb-2">Cargue inventario desde CSV</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Formato: store_id, ingredient_code, ingredient_name, qty, unit
                </p>
                <Button variant="outline">Cargar Inventario CSV</Button>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h5 className="font-medium mb-3">O capture manualmente:</h5>
                <div className="space-y-3">
                  {[
                    { name: 'Yogurt Natural Base', code: 'YOG-BASE', qty: '50', unit: 'kg' },
                    { name: 'Fresas Congeladas', code: 'FRU-FRES', qty: '25', unit: 'kg' },
                    { name: 'Granola Premium', code: 'GRA-PREM', qty: '15', unit: 'kg' }
                  ].map((item, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2">
                      <Input placeholder="Código" value={item.code} />
                      <Input placeholder="Ingrediente" value={item.name} className="col-span-2" />
                      <div className="flex gap-1">
                        <Input placeholder="Qty" value={item.qty} className="w-16" />
                        <Input placeholder="Unit" value={item.unit} className="w-16" />
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" size="sm" className="mt-3">+ Agregar ingrediente</Button>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h5 className="font-medium text-green-900 mb-2">¡Configuración casi lista!</h5>
                <p className="text-sm text-green-700">
                  Una vez completado el inventario inicial, su sistema estará listo para generar 
                  reportes de P&L, food cost y merma automáticamente.
                </p>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <Card className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Bienvenido a {currentTenant.displayName}
            </h1>
            <p className="text-muted-foreground">
              Configure su sistema en 5 pasos simples
            </p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">
                Paso {currentStep} de {totalSteps}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% completado
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps Navigation */}
          <div className="flex items-center justify-between mb-8 overflow-x-auto">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = step.number === currentStep;
              const isCompleted = step.number < currentStep;
              
              return (
                <div 
                  key={step.number}
                  className={`flex flex-col items-center min-w-0 flex-1 ${
                    step.number !== steps.length ? 'border-r border-muted' : ''
                  } px-2`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : isCompleted 
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <p className={`text-xs text-center font-medium ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            
            <Button onClick={nextStep}>
              {currentStep === totalSteps ? 'Finalizar Configuración' : 'Siguiente'}
              {currentStep < totalSteps && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};