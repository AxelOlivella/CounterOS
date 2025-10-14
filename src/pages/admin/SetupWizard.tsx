import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building2, FileText, Store, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type WizardStep = 'corporate' | 'legal' | 'brand' | 'stores' | 'complete';

interface WizardData {
  corporate: {
    name: string;
    slug: string;
  };
  legalEntity: {
    name: string;
    rfc: string;
    tax_regime: string;
  };
  brand: {
    name: string;
    slug: string;
    concept: string;
    description: string;
    target_food_cost: number;
  };
  stores: Array<{
    name: string;
    code: string;
    location: string;
    city: string;
  }>;
}

export default function SetupWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<WizardStep>('corporate');
  const [loading, setLoading] = useState(false);
  const [createdIds, setCreatedIds] = useState<{
    corporate_id?: string;
    legal_entity_id?: string;
    brand_id?: string;
  }>({});

  const [data, setData] = useState<WizardData>({
    corporate: { name: '', slug: '' },
    legalEntity: { name: '', rfc: '', tax_regime: '' },
    brand: { name: '', slug: '', concept: '', description: '', target_food_cost: 30 },
    stores: [{ name: '', code: '', location: '', city: '' }]
  });

  const steps: Array<{ key: WizardStep; label: string; icon: any }> = [
    { key: 'corporate', label: 'Corporate', icon: Building2 },
    { key: 'legal', label: 'Legal Entity', icon: FileText },
    { key: 'brand', label: 'Brand', icon: Store },
    { key: 'stores', label: 'Stores', icon: Store },
    { key: 'complete', label: 'Complete', icon: CheckCircle2 }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleCreateCorporate = async () => {
    setLoading(true);
    try {
      const { data: corporate, error } = await supabase
        .from('corporates')
        .insert({
          name: data.corporate.name,
          slug: data.corporate.slug
        })
        .select()
        .single();

      if (error) throw error;

      setCreatedIds(prev => ({ ...prev, corporate_id: corporate.id }));
      setCurrentStep('legal');
      toast({ title: 'Corporate creado exitosamente' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLegalEntity = async () => {
    setLoading(true);
    try {
      const { data: legalEntity, error } = await supabase
        .from('legal_entities')
        .insert({
          corporate_id: createdIds.corporate_id,
          name: data.legalEntity.name,
          rfc: data.legalEntity.rfc,
          tax_regime: data.legalEntity.tax_regime
        })
        .select()
        .single();

      if (error) throw error;

      setCreatedIds(prev => ({ ...prev, legal_entity_id: legalEntity.id }));
      setCurrentStep('brand');
      toast({ title: 'Legal Entity creada exitosamente' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBrand = async () => {
    setLoading(true);
    try {
      const { data: brand, error } = await supabase
        .from('brands')
        .insert({
          legal_entity_id: createdIds.legal_entity_id,
          name: data.brand.name,
          slug: data.brand.slug,
          concept: data.brand.concept,
          description: data.brand.description,
          target_food_cost: data.brand.target_food_cost
        })
        .select()
        .single();

      if (error) throw error;

      setCreatedIds(prev => ({ ...prev, brand_id: brand.id }));
      setCurrentStep('stores');
      toast({ title: 'Brand creado exitosamente' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStores = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('No user found');

      const { data: userData } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('auth_user_id', user.user.id)
        .single();

      const storesToInsert = data.stores.map(store => ({
        tenant_id: userData?.tenant_id,
        brand_id: createdIds.brand_id,
        name: store.name,
        code: store.code,
        location: store.location,
        city: store.city,
        active: true
      }));

      const { error } = await supabase
        .from('stores')
        .insert(storesToInsert);

      if (error) throw error;

      setCurrentStep('complete');
      toast({ title: `${data.stores.length} tiendas creadas exitosamente` });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const addStore = () => {
    setData(prev => ({
      ...prev,
      stores: [...prev.stores, { name: '', code: '', location: '', city: '' }]
    }));
  };

  const removeStore = (index: number) => {
    setData(prev => ({
      ...prev,
      stores: prev.stores.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Setup Wizard</h1>
        <p className="text-muted-foreground">
          Configuración guiada paso a paso para tu estructura enterprise
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.key === currentStep;
            const isCompleted = index < currentStepIndex;

            return (
              <div key={step.key} className="flex items-center">
                <div className={`flex flex-col items-center ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'}`}>
                  <div className={`rounded-full p-2 ${isActive ? 'bg-primary text-primary-foreground' : isCompleted ? 'bg-green-600 text-white' : 'bg-muted'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs mt-1">{step.label}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-12 mx-2 ${isCompleted ? 'bg-green-600' : 'bg-muted'}`} />
                )}
              </div>
            );
          })}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {currentStep === 'corporate' && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Corporate</CardTitle>
            <CardDescription>Información del grupo corporativo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="corp-name">Nombre del Corporate</Label>
              <Input
                id="corp-name"
                placeholder="Grupo Restaurantero S.A."
                value={data.corporate.name}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  corporate: { ...prev.corporate, name: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="corp-slug">Slug (URL amigable)</Label>
              <Input
                id="corp-slug"
                placeholder="grupo-restaurantero"
                value={data.corporate.slug}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  corporate: { ...prev.corporate, slug: e.target.value }
                }))}
              />
            </div>
            <Button
              onClick={handleCreateCorporate}
              disabled={loading || !data.corporate.name || !data.corporate.slug}
            >
              {loading ? 'Creando...' : 'Siguiente'}
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 'legal' && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Legal Entity</CardTitle>
            <CardDescription>Razón social y datos fiscales</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="legal-name">Razón Social</Label>
              <Input
                id="legal-name"
                placeholder="Restaurantes del Centro S.A. de C.V."
                value={data.legalEntity.name}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  legalEntity: { ...prev.legalEntity, name: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rfc">RFC</Label>
              <Input
                id="rfc"
                placeholder="RDC123456ABC"
                value={data.legalEntity.rfc}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  legalEntity: { ...prev.legalEntity, rfc: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax-regime">Régimen Fiscal</Label>
              <Input
                id="tax-regime"
                placeholder="601 - General de Ley Personas Morales"
                value={data.legalEntity.tax_regime}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  legalEntity: { ...prev.legalEntity, tax_regime: e.target.value }
                }))}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep('corporate')}>
                Anterior
              </Button>
              <Button
                onClick={handleCreateLegalEntity}
                disabled={loading || !data.legalEntity.name || !data.legalEntity.rfc}
              >
                {loading ? 'Creando...' : 'Siguiente'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'brand' && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Brand</CardTitle>
            <CardDescription>Marca o concepto del restaurante</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand-name">Nombre del Brand</Label>
              <Input
                id="brand-name"
                placeholder="Tacos al Pastor"
                value={data.brand.name}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  brand: { ...prev.brand, name: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand-slug">Slug</Label>
              <Input
                id="brand-slug"
                placeholder="tacos-al-pastor"
                value={data.brand.slug}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  brand: { ...prev.brand, slug: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="concept">Concepto</Label>
              <Input
                id="concept"
                placeholder="Tacos, Comida Mexicana, QSR"
                value={data.brand.concept}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  brand: { ...prev.brand, concept: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Descripción del concepto..."
                value={data.brand.description}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  brand: { ...prev.brand, description: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-fc">Target Food Cost (%)</Label>
              <Input
                id="target-fc"
                type="number"
                step="0.1"
                value={data.brand.target_food_cost}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  brand: { ...prev.brand, target_food_cost: parseFloat(e.target.value) }
                }))}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep('legal')}>
                Anterior
              </Button>
              <Button
                onClick={handleCreateBrand}
                disabled={loading || !data.brand.name || !data.brand.slug || !data.brand.concept}
              >
                {loading ? 'Creando...' : 'Siguiente'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'stores' && (
        <Card>
          <CardHeader>
            <CardTitle>Crear Tiendas</CardTitle>
            <CardDescription>Agrega las tiendas para este brand</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.stores.map((store, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Tienda {index + 1}</h4>
                  {data.stores.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStore(index)}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      placeholder="Polanco"
                      value={store.name}
                      onChange={(e) => {
                        const newStores = [...data.stores];
                        newStores[index].name = e.target.value;
                        setData(prev => ({ ...prev, stores: newStores }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Código</Label>
                    <Input
                      placeholder="POL"
                      value={store.code}
                      onChange={(e) => {
                        const newStores = [...data.stores];
                        newStores[index].code = e.target.value;
                        setData(prev => ({ ...prev, stores: newStores }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ubicación</Label>
                    <Input
                      placeholder="Av. Masaryk 123"
                      value={store.location}
                      onChange={(e) => {
                        const newStores = [...data.stores];
                        newStores[index].location = e.target.value;
                        setData(prev => ({ ...prev, stores: newStores }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ciudad</Label>
                    <Input
                      placeholder="CDMX"
                      value={store.city}
                      onChange={(e) => {
                        const newStores = [...data.stores];
                        newStores[index].city = e.target.value;
                        setData(prev => ({ ...prev, stores: newStores }));
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addStore}>
              + Agregar otra tienda
            </Button>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setCurrentStep('brand')}>
                Anterior
              </Button>
              <Button
                onClick={handleCreateStores}
                disabled={loading || data.stores.some(s => !s.name || !s.code)}
              >
                {loading ? 'Creando...' : 'Finalizar Setup'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'complete' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              Setup Completado
            </CardTitle>
            <CardDescription>
              Tu estructura enterprise ha sido creada exitosamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Se ha creado la siguiente jerarquía:
              </p>
              <ul className="space-y-1 text-sm">
                <li>✓ Corporate: <strong>{data.corporate.name}</strong></li>
                <li className="ml-4">✓ Legal Entity: <strong>{data.legalEntity.name}</strong></li>
                <li className="ml-8">✓ Brand: <strong>{data.brand.name}</strong></li>
                <li className="ml-12">✓ {data.stores.length} tienda(s)</li>
              </ul>
            </div>
            <Button onClick={() => navigate('/admin')}>
              Ir al Panel Admin
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
