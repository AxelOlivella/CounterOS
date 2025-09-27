import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Store, Package, Beaker, Receipt, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const navigate = useNavigate();

  const steps = [
    {
      id: 1,
      title: 'Información de la Tienda',
      description: 'Configura los datos básicos de tu tienda',
      icon: Store,
      fields: ['storeName', 'zone', 'size']
    },
    {
      id: 2,
      title: 'Productos y Recetas',
      description: 'Elige plantilla Froyo y ajusta gramajes',
      icon: Package,
      fields: ['template', 'products']
    },
    {
      id: 3,
      title: 'Insumos y Costos',
      description: 'Define tus ingredientes y precios',
      icon: Beaker,
      fields: ['ingredients']
    },
    {
      id: 4,
      title: 'Gastos Fijos',
      description: 'Configura renta, nómina y gastos operativos',
      icon: Receipt,
      fields: ['expenses']
    },
    {
      id: 5,
      title: 'Carga Inicial de Ventas',
      description: 'Sube tu primer CSV para ver el food cost',
      icon: TrendingUp,
      fields: ['sales']
    }
  ];

  const [formData, setFormData] = useState({
    // Step 1
    storeName: '',
    zone: '',
    size: '',
    
    // Step 2
    template: '',
    products: [] as string[],
    
    // Step 3
    ingredients: [] as Array<{name: string, cost: string, unit: string, category: string}>,
    
    // Step 4
    rent: '',
    payroll: '',
    energy: '',
    royalty: '',
    marketing: '',
    
    // Step 5
    salesFile: null as File | null
  });

  const progress = (currentStep / steps.length) * 100;

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    } else {
      // Onboarding complete - redirect to food cost
      navigate('/food-cost-analysis');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="storeName">Nombre de la tienda *</Label>
              <Input
                id="storeName"
                value={formData.storeName}
                onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                placeholder="Portal Centro"
              />
            </div>
            <div>
              <Label htmlFor="zone">Zona/Ciudad</Label>
              <Input
                id="zone"
                value={formData.zone}
                onChange={(e) => setFormData({...formData, zone: e.target.value})}
                placeholder="Centro Histórico, CDMX"
              />
            </div>
            <div>
              <Label htmlFor="size">Metros cuadrados (opcional)</Label>
              <Input
                id="size"
                type="number"
                value={formData.size}
                onChange={(e) => setFormData({...formData, size: e.target.value})}
                placeholder="45"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>Plantilla de productos</Label>
              <Select value={formData.template} onValueChange={(value) => setFormData({...formData, template: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una plantilla" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="froyo">Froyo Clásico (3 productos básicos)</SelectItem>
                  <SelectItem value="froyo-premium">Froyo Premium (5 productos)</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.template === 'froyo' && (
              <div className="space-y-2">
                <Label>Productos incluidos:</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Yogurt Natural 12oz</Badge>
                  <Badge variant="outline">Yogurt Mango 12oz</Badge>
                  <Badge variant="outline">Yogurt Mango+Nuez 12oz</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Podrás ajustar gramajes en el siguiente paso
                </p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>Ingredientes básicos (plantilla Froyo)</Label>
              <div className="space-y-3 mt-2">
                {[
                  { name: 'Base Yogurt', cost: '45.00', unit: 'kg', category: 'lácteos' },
                  { name: 'Mango', cost: '25.00', unit: 'kg', category: 'fruta' },
                  { name: 'Nuez', cost: '120.00', unit: 'kg', category: 'toppings' },
                  { name: 'Vaso 12oz', cost: '2.50', unit: 'pieza', category: 'desechables' }
                ].map((ingredient, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 p-3 border rounded-lg">
                    <div>
                      <Label className="text-xs">Ingrediente</Label>
                      <Input value={ingredient.name} disabled className="h-8" />
                    </div>
                    <div>
                      <Label className="text-xs">Costo/unidad</Label>
                      <Input value={ingredient.cost} className="h-8" />
                    </div>
                    <div>
                      <Label className="text-xs">Unidad</Label>
                      <Input value={ingredient.unit} className="h-8" />
                    </div>
                    <div>
                      <Label className="text-xs">Categoría</Label>
                      <Badge variant="outline" className="mt-1">{ingredient.category}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rent">Renta mensual</Label>
                <Input
                  id="rent"
                  type="number"
                  value={formData.rent}
                  onChange={(e) => setFormData({...formData, rent: e.target.value})}
                  placeholder="25000"
                />
              </div>
              <div>
                <Label htmlFor="payroll">Nómina mensual</Label>
                <Input
                  id="payroll"
                  type="number"
                  value={formData.payroll}
                  onChange={(e) => setFormData({...formData, payroll: e.target.value})}
                  placeholder="35000"
                />
              </div>
              <div>
                <Label htmlFor="energy">Energía/servicios</Label>
                <Input
                  id="energy"
                  type="number"
                  value={formData.energy}
                  onChange={(e) => setFormData({...formData, energy: e.target.value})}
                  placeholder="8000"
                />
              </div>
              <div>
                <Label htmlFor="royalty">Regalías (%)</Label>
                <Input
                  id="royalty"
                  type="number"
                  value={formData.royalty}
                  onChange={(e) => setFormData({...formData, royalty: e.target.value})}
                  placeholder="6"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="marketing">Marketing (%)</Label>
              <Input
                id="marketing"
                type="number"
                value={formData.marketing}
                onChange={(e) => setFormData({...formData, marketing: e.target.value})}
                placeholder="3"
                className="w-full"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <Label>Carga tu primer archivo de ventas</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFormData({...formData, salesFile: e.target.files?.[0] || null})}
                  className="hidden"
                  id="sales-file"
                />
                <label htmlFor="sales-file" className="cursor-pointer">
                  <div className="space-y-2">
                    <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {formData.salesFile ? formData.salesFile.name : 'Selecciona archivo CSV'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Formato esperado: fecha, sku, cantidad, precio
                    </p>
                  </div>
                </label>
              </div>
            </div>
            {formData.salesFile && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  ¡Perfecto! Una vez que completes el onboarding, te llevaremos directamente a ver tu food cost.
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Meta objetivo: 30% | Tu resultado aparecerá en la siguiente pantalla
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-4xl py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Configuración Inicial
          </h1>
          <p className="text-muted-foreground">
            5 pasos rápidos para empezar a analizar tu food cost
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Paso {currentStep} de {steps.length}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% completado</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {steps.map((step) => {
              const Icon = step.icon;
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors
                    ${isCurrent ? 'border-primary bg-primary text-primary-foreground' : ''}
                    ${isCompleted ? 'border-green-500 bg-green-500 text-white' : ''}
                    ${!isCurrent && !isCompleted ? 'border-muted-foreground/25 text-muted-foreground' : ''}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <span className="text-xs mt-2 text-center max-w-16">
                    {step.title.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(steps[currentStep - 1].icon, { className: "h-5 w-5" })}
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Anterior
          </Button>
          <Button
            onClick={handleNextStep}
            disabled={currentStep === 1 && !formData.storeName}
          >
            {currentStep === steps.length ? 'Completar Setup' : 'Siguiente'}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default OnboardingPage;