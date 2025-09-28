import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useStores, useIngredients } from "@/hooks/useFoodCost";
import { supabase } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TENANT = "00000000-0000-0000-0000-000000000001";

const storeSchema = z.object({
  code: z.string().min(1, "Código requerido"),
  name: z.string().min(1, "Nombre requerido"),
  city: z.string().optional(),
});

const expenseSchema = z.object({
  rent: z.number().min(0, "Debe ser positivo"),
  payroll: z.number().min(0, "Debe ser positivo"),
  energy: z.number().min(0, "Debe ser positivo"),
  marketing_pct: z.number().min(0, "Debe ser positivo").max(100, "Máximo 100%"),
  royalty_pct: z.number().min(0, "Debe ser positivo").max(100, "Máximo 100%"),
  other: z.number().min(0, "Debe ser positivo"),
});

const FROYO_PRODUCTS = [
  { sku: "YO-NAT-12", name: "Yogurt Natural 12oz", defaultGrams: 340 },
  { sku: "YO-MAN-12", name: "Yogurt Mango 12oz", defaultGrams: 340 },
  { sku: "YO-MAN-NUZ-12", name: "Yogurt Mango con Nuez 12oz", defaultGrams: 360 },
];

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [isCreatingStore, setIsCreatingStore] = useState(false);
  const [productGrams, setProductGrams] = useState<Record<string, number>>(
    FROYO_PRODUCTS.reduce((acc, p) => ({ ...acc, [p.sku]: p.defaultGrams }), {})
  );
  
  const { data: stores, loading: storesLoading, error: storesError } = useStores();
  const { data: ingredients, loading: ingredientsLoading } = useIngredients();
  const { toast } = useToast();
  const navigate = useNavigate();

  const storeForm = useForm<z.infer<typeof storeSchema>>({
    resolver: zodResolver(storeSchema),
    defaultValues: { code: "", name: "", city: "" },
  });

  const expenseForm = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      rent: 0,
      payroll: 0,
      energy: 0,
      marketing_pct: 3,
      royalty_pct: 5,
      other: 0,
    },
  });

  const handleCreateStore = async (values: z.infer<typeof storeSchema>) => {
    setIsCreatingStore(true);
    const { data, error } = await supabase
      .from("stores")
      .insert([{ tenant_id: TENANT, ...values }])
      .select("store_id")
      .single();
    
    setIsCreatingStore(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    
    setSelectedStore(data.store_id);
    toast({ title: "Tienda creada exitosamente" });
    setCurrentStep(2);
  };

  const handleUpdateIngredient = async (ingredientId: string, newCost: number) => {
    const { error } = await supabase
      .from("ingredients")
      .update({ cost_per_unit: newCost })
      .eq("ingredient_id", ingredientId);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Costo actualizado" });
    }
  };

  const handleExpenses = async (values: z.infer<typeof expenseSchema>) => {
    const period = new Date().toISOString().slice(0, 7) + "-01";
    
    const { error } = await supabase
      .from("expenses")
      .upsert([{
        tenant_id: TENANT,
        store_id: selectedStore,
        period,
        ...values,
      }]);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Gastos guardados exitosamente" });
      setCurrentStep(5);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Paso 1: Seleccionar Tienda</CardTitle>
              <CardDescription>Selecciona una tienda existente o crea una nueva</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {storesLoading && <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Cargando tiendas...</div>}
              {storesError && <p className="text-destructive">{storesError}</p>}
              
              {stores.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Tiendas existentes:</label>
                  <Select value={selectedStore} onValueChange={setSelectedStore}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tienda" />
                    </SelectTrigger>
                    <SelectContent>
                      {stores.map((store) => (
                        <SelectItem key={store.store_id} value={store.store_id}>
                          {store.name} ({store.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">O crear nueva tienda:</h3>
                <Form {...storeForm}>
                  <form onSubmit={storeForm.handleSubmit(handleCreateStore)} className="space-y-4">
                    <FormField
                      control={storeForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código</FormLabel>
                          <FormControl>
                            <Input placeholder="TIENDA01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={storeForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Mi Tienda" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={storeForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ciudad (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Ciudad de México" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" disabled={isCreatingStore}>
                      {isCreatingStore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Crear Tienda
                    </Button>
                  </form>
                </Form>
              </div>
              
              {selectedStore && (
                <Button onClick={() => setCurrentStep(2)} className="w-full">
                  Continuar con tienda seleccionada
                </Button>
              )}
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Paso 2: Plantilla Froyo</CardTitle>
              <CardDescription>Configura los productos y gramajes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {FROYO_PRODUCTS.map((product) => (
                <div key={product.sku} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Gramaje:</label>
                    <Input
                      type="number"
                      value={productGrams[product.sku]}
                      onChange={(e) => setProductGrams(prev => ({
                        ...prev,
                        [product.sku]: parseInt(e.target.value) || 0
                      }))}
                      className="w-20"
                    />
                    <span className="text-sm">g</span>
                  </div>
                </div>
              ))}
              <Button onClick={() => setCurrentStep(3)} className="w-full">
                Continuar
              </Button>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Paso 3: Insumos</CardTitle>
              <CardDescription>Edita los costos de los insumos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ingredientsLoading && <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Cargando insumos...</div>}
              {ingredients.map((ingredient) => (
                <div key={ingredient.ingredient_id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{ingredient.name}</h4>
                    <p className="text-sm text-muted-foreground">{ingredient.code} - {ingredient.unit}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">$</span>
                    <Input
                      type="number"
                      defaultValue={ingredient.cost_per_unit}
                      onBlur={(e) => {
                        const newCost = parseFloat(e.target.value);
                        if (newCost !== ingredient.cost_per_unit && newCost >= 0) {
                          handleUpdateIngredient(ingredient.ingredient_id, newCost);
                        }
                      }}
                      className="w-24"
                      step="0.01"
                    />
                    <span className="text-sm">/{ingredient.unit}</span>
                  </div>
                </div>
              ))}
              <Button onClick={() => setCurrentStep(4)} className="w-full">
                Continuar
              </Button>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Paso 4: Gastos Fijos</CardTitle>
              <CardDescription>Configura los gastos del mes actual</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...expenseForm}>
                <form onSubmit={expenseForm.handleSubmit(handleExpenses)} className="space-y-4">
                  <FormField
                    control={expenseForm.control}
                    name="rent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Renta ($)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={expenseForm.control}
                    name="payroll"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nómina ($)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={expenseForm.control}
                    name="energy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Energía ($)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={expenseForm.control}
                    name="marketing_pct"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marketing (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={expenseForm.control}
                    name="royalty_pct"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Regalías (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={expenseForm.control}
                    name="other"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Otros ($)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Guardar Gastos
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        );

      case 5:
        return (
          <Card>
            <CardHeader>
              <CardTitle>¡Configuración Completa! 🎉</CardTitle>
              <CardDescription>Tu tienda está lista. Ahora carga las ventas para ver los análisis.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/datos")} className="w-full" size="lg">
                Ir a /datos para cargar ventas
              </Button>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configuración Inicial</h1>
        <div className="flex items-center gap-2 mt-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>
      
      {renderStep()}
    </div>
  );
}