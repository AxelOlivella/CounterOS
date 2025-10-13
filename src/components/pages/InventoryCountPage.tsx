import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Save, ClipboardCheck } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/common/PageHeader';

interface Store {
  store_id: string;
  name: string;
}

interface Ingredient {
  ingredient_id: string;
  code: string;
  name: string;
  unit: string;
}

interface CountItem {
  ingredient_id: string;
  ingredient_name: string;
  unit: string;
  physical_qty: number;
  notes: string;
}

export default function InventoryCountPage() {
  const { toast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('');
  const [countDate, setCountDate] = useState<Date>(new Date());
  const [countItems, setCountItems] = useState<CountItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStores();
    fetchIngredients();
  }, []);

  const fetchStores = async () => {
    const { data, error } = await supabase.rpc('get_stores_data');
    if (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar las tiendas', variant: 'destructive' });
      return;
    }
    setStores(data || []);
    if (data && data.length > 0) {
      setSelectedStore(data[0].store_id);
    }
  };

  const fetchIngredients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('ingredients')
      .select('ingredient_id, code, name, unit')
      .order('name');
    
    if (error) {
      toast({ title: 'Error', description: 'No se pudieron cargar los ingredientes', variant: 'destructive' });
      setLoading(false);
      return;
    }

    setIngredients(data || []);
    
    // Initialize count items with all ingredients
    const items: CountItem[] = (data || []).map(ing => ({
      ingredient_id: ing.ingredient_id,
      ingredient_name: ing.name,
      unit: ing.unit,
      physical_qty: 0,
      notes: ''
    }));
    setCountItems(items);
    setLoading(false);
  };

  const updateCountItem = (ingredientId: string, field: 'physical_qty' | 'notes', value: number | string) => {
    setCountItems(prev => 
      prev.map(item => 
        item.ingredient_id === ingredientId 
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const handleSaveCount = async () => {
    if (!selectedStore) {
      toast({ title: 'Error', description: 'Selecciona una tienda', variant: 'destructive' });
      return;
    }

    // Filter items with qty > 0
    const itemsToSave = countItems.filter(item => item.physical_qty > 0);

    if (itemsToSave.length === 0) {
      toast({ title: 'Error', description: 'Ingresa al menos un conteo', variant: 'destructive' });
      return;
    }

    setSaving(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('auth_user_id', userData.user?.id)
        .single();

      const countsToInsert = itemsToSave.map(item => ({
        tenant_id: profile?.tenant_id,
        store_id: selectedStore,
        ingredient_id: item.ingredient_id,
        count_date: format(countDate, 'yyyy-MM-dd'),
        physical_qty: item.physical_qty,
        unit: item.unit,
        counted_by: userData.user?.id,
        notes: item.notes || null
      }));

      const { error } = await supabase
        .from('inventory_counts')
        .insert(countsToInsert);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: `Se guardaron ${itemsToSave.length} conteos de inventario`,
      });

      // Reset counts
      setCountItems(prev => prev.map(item => ({ ...item, physical_qty: 0, notes: '' })));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo guardar el conteo',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conteo de Inventario"
        description="Registra conteos físicos de inventario para análisis de variancia real"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Configuración del Conteo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tienda</Label>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una tienda" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map(store => (
                    <SelectItem key={store.store_id} value={store.store_id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha de Conteo</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !countDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {countDate ? format(countDate, "PPP") : <span>Selecciona fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={countDate}
                    onSelect={(date) => date && setCountDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ingredientes</CardTitle>
          <CardDescription>
            Ingresa las cantidades físicas contadas para cada ingrediente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {countItems.map(item => (
              <div key={item.ingredient_id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start p-4 border rounded-lg">
                <div className="md:col-span-3">
                  <Label className="text-sm font-medium">{item.ingredient_name}</Label>
                  <p className="text-xs text-muted-foreground">Unidad: {item.unit}</p>
                </div>
                
                <div className="md:col-span-2">
                  <Label className="text-xs">Cantidad Física</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.physical_qty}
                    onChange={(e) => updateCountItem(item.ingredient_id, 'physical_qty', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                </div>

                <div className="md:col-span-7">
                  <Label className="text-xs">Notas (opcional)</Label>
                  <Textarea
                    value={item.notes}
                    onChange={(e) => updateCountItem(item.ingredient_id, 'notes', e.target.value)}
                    placeholder="Ej: producto dañado, cajas abiertas..."
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleSaveCount} 
              disabled={saving || !selectedStore}
              size="lg"
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar Conteo'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
