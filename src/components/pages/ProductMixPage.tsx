import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { DatePickerWithRange } from '@/components/ui/date-picker-range';
import { DateRange } from 'react-day-picker';
import { subDays } from 'date-fns';
import type { ProductMixImpact } from '@/lib/types_menu';

interface Store {
  id: string;
  name: string;
}

export const ProductMixPage = () => {
  const { toast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [loading, setLoading] = useState(false);
  const [mixData, setMixData] = useState<ProductMixImpact[]>([]);

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchMixData();
    }
  }, [selectedStore, dateRange]);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase.rpc('get_stores_data');
      if (error) throw error;
      
      const mappedStores = data?.filter(s => s.active).map(s => ({
        id: s.store_id,
        name: s.name
      })) || [];
      setStores(mappedStores);
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const fetchMixData = async () => {
    if (!dateRange?.from || !dateRange?.to) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_product_mix_impact' as any, {
        p_store_id: selectedStore === 'all' ? null : selectedStore,
        p_start_date: dateRange.from.toISOString().split('T')[0],
        p_end_date: dateRange.to.toISOString().split('T')[0]
      });

      if (error) throw error;
      setMixData((data as any) || []);
    } catch (error) {
      console.error('Error fetching mix data:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el análisis de mix',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = mixData.reduce((sum, item) => sum + item.revenue, 0);
  const totalFoodCost = mixData.reduce((sum, item) => sum + item.food_cost, 0);
  const aggregateFoodCostPct = totalRevenue > 0 ? (totalFoodCost / totalRevenue * 100) : 0;
  const totalMargin = mixData.reduce((sum, item) => sum + item.contribution_margin_dollars, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Análisis de Product Mix</h1>
        <p className="text-muted-foreground">
          Entiende cómo el mix de productos impacta tu food cost agregado
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Tienda</label>
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tienda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las tiendas</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Período</label>
            <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
          </div>
          <div className="flex items-end">
            <Button onClick={fetchMixData} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Food Cost Agregado</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${aggregateFoodCostPct > 30 ? 'text-red-600' : 'text-green-600'}`}>
              {aggregateFoodCostPct.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMargin.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mixData.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Insight Card */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            Regla de Oro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            <strong>Optimiza para $ de margen, NO para % de food cost.</strong>
            {' '}Es mejor vender un item con 30% food cost y $126 de margen, que uno con 25% food cost y $82 de margen.
          </p>
        </CardContent>
      </Card>

      {/* Product Mix Table */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis Detallado por Producto</CardTitle>
          <CardDescription>
            Ordena por margen $ para identificar qué items promover
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : mixData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-2" />
              <p>No hay datos para el período seleccionado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mixData.map((item, idx) => (
                <div key={item.product_id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{item.product_name}</h4>
                        <p className="text-sm text-muted-foreground">{item.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Margen $</p>
                      <p className="text-lg font-bold text-green-600">
                        ${item.contribution_margin_dollars.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">% de Ventas</p>
                      <p className="font-medium">{item.sales_pct.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Food Cost %</p>
                      <p className={`font-medium ${item.food_cost_pct > 30 ? 'text-red-600' : ''}`}>
                        {item.food_cost_pct.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="font-medium">${item.revenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Food Cost $</p>
                      <p className="font-medium">${item.food_cost.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Impacto en FC Agregado</p>
                      <p className="font-medium">{item.impact_on_aggregate_food_cost.toFixed(2)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
