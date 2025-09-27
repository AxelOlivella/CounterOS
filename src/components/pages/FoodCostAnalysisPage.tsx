import { useState, useEffect } from 'react';
import { useCounter } from '@/contexts/CounterContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker-range';
import { Button } from '@/components/ui/button';
import { FoodCostTrendChart } from '@/components/food-cost/FoodCostTrendChart';
import { CategoryBreakdownChart } from '@/components/food-cost/CategoryBreakdownChart';
import { VarianceAnalysisChart } from '@/components/food-cost/VarianceAnalysisChart';
import { Loader2, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';

interface Store {
  id: string;
  name: string;
}

interface FoodCostData {
  date: string;
  revenue: number;
  cogs: number;
  foodCostPct: number;
}

export const FoodCostAnalysisPage = () => {
  const { userProfile } = useCounter();
  const { toast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [loading, setLoading] = useState(false);
  const [foodCostData, setFoodCostData] = useState<FoodCostData[]>([]);
  const [summary, setSummary] = useState({
    avgFoodCost: 0,
    totalRevenue: 0,
    totalCogs: 0,
    variance: 0,
  });

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchFoodCostData();
    }
  }, [selectedStore, dateRange]);

  const fetchStores = async () => {
    try {
      const { data: storesData, error } = await supabase
        .from('stores')
        .select('store_id, name')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      
      const mappedStores = storesData?.map(store => ({
        id: store.store_id,
        name: store.name
      })) || [];
      setStores(mappedStores);
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch stores',
        variant: 'destructive',
      });
    }
  };

  const fetchFoodCostData = async () => {
    if (!dateRange?.from || !dateRange?.to) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('daily_food_cost_view')
        .select('*')
        .gte('day', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('day', format(dateRange.to, 'yyyy-MM-dd'));

      if (selectedStore !== 'all') {
        query = query.eq('store_id', selectedStore);
      }

      const { data, error } = await query.order('day');

      if (error) throw error;

      const processedData: FoodCostData[] = data?.map(item => ({
        date: item.day || '',
        revenue: Number(item.revenue) || 0,
        cogs: Number(item.cogs) || 0,
        foodCostPct: Number(item.food_cost_pct) || 0,
      })) || [];

      setFoodCostData(processedData);

      // Calculate summary
      const totalRevenue = processedData.reduce((sum, item) => sum + item.revenue, 0);
      const totalCogs = processedData.reduce((sum, item) => sum + item.cogs, 0);
      const avgFoodCost = totalRevenue > 0 ? (totalCogs / totalRevenue) * 100 : 0;
      const targetFoodCost = 30; // 30% target
      const variance = avgFoodCost - targetFoodCost;

      setSummary({
        avgFoodCost,
        totalRevenue,
        totalCogs,
        variance,
      });

    } catch (error) {
      console.error('Error fetching food cost data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch food cost data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const mockCategoryData = [
    { category: 'Proteínas', cost: 45000, percentage: 35 },
    { category: 'Lácteos', cost: 32000, percentage: 25 },
    { category: 'Frutas', cost: 25000, percentage: 20 },
    { category: 'Endulzantes', cost: 15000, percentage: 12 },
    { category: 'Otros', cost: 10000, percentage: 8 },
  ];

  const mockVarianceData = [
    { week: 'Sem 1', actual: 32.5, target: 30, variance: 2.5 },
    { week: 'Sem 2', actual: 31.2, target: 30, variance: 1.2 },
    { week: 'Sem 3', actual: 34.8, target: 30, variance: 4.8 },
    { week: 'Sem 4', actual: 33.1, target: 30, variance: 3.1 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Análisis de Food Cost</h1>
          <p className="text-muted-foreground">
            Monitoreo y análisis detallado del costo de alimentos
          </p>
        </div>
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
            <div className="text-sm text-muted-foreground">
              Últimos 30 días (automático)
            </div>
          </div>
          <div className="flex items-end">
            <Button onClick={fetchFoodCostData} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Food Cost Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.avgFoodCost > 30 ? 'text-red-600' : 'text-green-600'}`}>
              {summary.avgFoodCost.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.avgFoodCost > 30 ? 'Sobre objetivo' : 'Dentro del objetivo'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Período seleccionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">COGS Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary.totalCogs.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Costo de ventas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Varianza vs Objetivo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {summary.variance > 0 ? '+' : ''}{summary.variance.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.variance > 0 ? 'Sobre' : 'Bajo'} objetivo (30%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Simplified without problematic components */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Food Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                <p>Gráfico de tendencias</p>
                <p className="text-sm">Datos: {foodCostData.length} períodos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Desglose por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mockCategoryData.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{item.percentage}%</span>
                    <span className="text-sm font-bold">${item.cost.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análisis de Varianza Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockVarianceData.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 border rounded">
                <span className="text-sm font-medium">{item.week}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm">Actual: {item.actual}%</span>
                  <span className="text-sm">Target: {item.target}%</span>
                  <span className={`text-sm font-bold ${item.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Var: {item.variance > 0 ? '+' : ''}{item.variance}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};