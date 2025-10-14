import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Toolbar from "@/components/ui/Toolbar";
import { DatePickerWithRange } from '@/components/ui/date-picker-range';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCard } from '@/components/alerts/AlertCard';
import { FoodCostTrendChart } from '@/components/food-cost/FoodCostTrendChart';
import { HeroMetric } from '@/components/dashboard/HeroMetric';
import { CategoryBreakdown } from '@/components/dashboard/CategoryBreakdown';
import { CategoryDetail } from '@/components/dashboard/CategoryDetail';
import { VarianceAnalysisChart } from '@/components/food-cost/VarianceAnalysisChart';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import { EmptyState } from '@/components/ui/states/EmptyState';
import { Loader2, TrendingUp, AlertTriangle, Target, AlertCircle, ClipboardCheck, Database } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';
import { generateAlerts, formatImpact, getAlertBadgeVariant, type Alert as AlertType } from '@/lib/alerts';
import type { VarianceRow, TopVarianceIngredient } from '@/lib/types_variance';
import type { RealVarianceRow } from '@/lib/types_inventory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

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
  const { userProfile } = useTenant();
  const { toast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [loading, setLoading] = useState(false);
  const [foodCostData, setFoodCostData] = useState<FoodCostData[]>([]);
  const [varianceData, setVarianceData] = useState<VarianceRow[]>([]);
  const [realVarianceData, setRealVarianceData] = useState<RealVarianceRow[]>([]);
  const [topVariances, setTopVariances] = useState<TopVarianceIngredient[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [summary, setSummary] = useState({
    avgFoodCost: 0,
    totalRevenue: 0,
    totalCogs: 0,
    variance: 0,
  });
  const [viewLevel, setViewLevel] = useState<'overview' | 'breakdown' | 'detail'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const TARGET_FOOD_COST = 30;

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchFoodCostData();
      fetchRealVarianceData();
    }
  }, [selectedStore, dateRange]);

  const fetchStores = async () => {
    try {
      const { data: storesData, error } = await supabase
        .rpc('get_stores_data');

      if (error) throw error;
      
      const mappedStores = storesData?.filter(store => store.active).map(store => ({
        id: store.store_id,
        name: store.name
      })) || [];
      setStores(mappedStores);
    } catch (error) {
      // Error handled with toast, no console.error needed
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
      const { data: allData, error } = await supabase
        .rpc('get_daily_food_cost_data');

      if (error) throw error;

      // Filter data by date range and store on client side
      let filteredData = allData?.filter(item => {
        const itemDate = new Date(item.day);
        const fromDate = dateRange.from;
        const toDate = dateRange.to;
        return itemDate >= fromDate && itemDate <= toDate;
      }) || [];

      if (selectedStore !== 'all') {
        filteredData = filteredData.filter(item => item.store_id === selectedStore);
      }

      // Sort by day
      filteredData.sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());
      
      const data = filteredData;

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

      // Fetch variance data
      await fetchVarianceData();
      
      // Generate alerts
      const generatedAlerts = generateAlerts({
        foodCostData: processedData.map(d => ({
          day: d.date,
          foodCostPct: d.foodCostPct,
          revenue: d.revenue,
          cogs: d.cogs,
        })),
        varianceData: varianceData.map(v => ({
          ingredient_name: v.ingredient_name,
          variance_pct: v.variance_pct,
          cost_impact_mxn: v.cost_impact_mxn,
          theoretical_qty: v.theoretical_qty,
          actual_qty: v.actual_qty,
        })),
        targetFoodCost: TARGET_FOOD_COST,
      });
      setAlerts(generatedAlerts);

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

  const fetchVarianceData = async () => {
    try {
      // Get variance data from last 30 days
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const { data: variance, error: varianceError } = await supabase.rpc('get_variance_data', {
        p_store_id: selectedStore === 'all' ? null : selectedStore,
        p_start_date: startDate.toISOString().split('T')[0],
        p_end_date: new Date().toISOString().split('T')[0],
        p_limit: 20,
      });

      if (varianceError) throw varianceError;
      setVarianceData(variance || []);

      // Get top variances
      const { data: topVar, error: topError } = await supabase.rpc('get_top_variance_ingredients', {
        p_store_id: selectedStore === 'all' ? null : selectedStore,
        p_days: 30,
        p_limit: 10,
      });

      if (topError) throw topError;
      setTopVariances(topVar || []);

    } catch (error) {
      console.error('Error fetching variance data:', error);
    }
  };

  const fetchRealVarianceData = async () => {
    if (!dateRange?.from || !dateRange?.to) return;

    try {
      const storeFilter = selectedStore !== 'all' ? selectedStore : null;
      
      const { data, error } = await supabase.rpc('get_real_variance_data', {
        p_store_id: storeFilter,
        p_start_date: format(dateRange.from, 'yyyy-MM-dd'),
        p_end_date: format(dateRange.to, 'yyyy-MM-dd'),
        p_limit: 50
      } as any);

      if (error) throw error;

      setRealVarianceData(data || []);
    } catch (error) {
      console.error('Error fetching real variance data:', error);
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

  // Mock categories for breakdown
  const categories = [
    { name: 'Proteínas', value: 14.5, target: 11.0, status: 'warning' as const },
    { name: 'Lácteos', value: 8.2, target: 8.0, status: 'success' as const },
    { name: 'Vegetales', value: 4.1, target: 4.5, status: 'success' as const },
    { name: 'Secos', value: 3.2, target: 3.0, status: 'success' as const },
    { name: 'Bebidas', value: 2.8, target: 3.0, status: 'success' as const },
  ];

  // Mock detail data
  const categoryDetailData = {
    categoryName: selectedCategory?.name || 'Proteínas',
    variance: 3.5,
    impactMxn: 3200,
    products: [
      { name: 'Carne de res', actual: 8500, target: 6000, status: 'critical' as const },
      { name: 'Pollo', actual: 4000, target: 4200, status: 'success' as const },
      { name: 'Pescado', actual: 2000, target: 1800, status: 'success' as const },
    ],
    probableCauses: [
      'Porciones inconsistentes (+25% más grandes que estándar)',
      'Precio de carne de res subió 15% este mes',
      'Posible merma no registrada en almacén',
    ],
  };

  const handleCategoryClick = (category: any) => {
    setSelectedCategory(category);
    setViewLevel('detail');
  };

  const handleBackToBreakdown = () => {
    setViewLevel('breakdown');
  };

  const handleBackToOverview = () => {
    setViewLevel('overview');
  };

  // Render detail view
  if (viewLevel === 'detail') {
    return (
      <div className="mobile-container">
        <CategoryDetail
          {...categoryDetailData}
          onBack={handleBackToBreakdown}
        />
      </div>
    );
  }

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

      {/* Alertas Glanceable */}
      {loading ? (
        <div className="space-y-3">
          <SkeletonCard variant="list" />
        </div>
      ) : alerts.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold">🚨 Alertas</h2>
            <Badge variant="outline" className="text-sm font-bold">
              {alerts.length}
            </Badge>
          </div>
          {alerts.slice(0, 3).map((alert, idx) => (
            <div key={alert.id} className={cn("animate-fade-in", `animate-stagger-${Math.min(idx + 1, 3)}`)}>
              <AlertCard alert={alert} compact />
            </div>
          ))}
        </div>
      )}

      {/* Hero Metric: Food Cost GIGANTE */}
      {loading ? (
        <SkeletonCard variant="hero" />
      ) : (
        <div className="animate-scale-in">
          <HeroMetric
            value={summary.avgFoodCost}
            suffix="%"
            label="Food Cost Promedio"
            target={TARGET_FOOD_COST}
            status={
              summary.avgFoodCost > TARGET_FOOD_COST + 3 ? 'critical' :
              summary.avgFoodCost > TARGET_FOOD_COST + 1.5 ? 'warning' :
              'success'
            }
            variance={summary.avgFoodCost - TARGET_FOOD_COST}
            size="large"
          />
        </div>
      )}

      {/* Métricas Secundarias */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <HeroMetric
            value={summary.totalRevenue / 1000}
            suffix="K"
            label="Ingresos"
            status="neutral"
            size="default"
          />
          <HeroMetric
            value={summary.totalCogs / 1000}
            suffix="K"
            label="COGS"
            status="neutral"
            size="default"
          />
        </div>
      )}

      {/* Progressive disclosure: Breakdown or Overview */}
      {viewLevel === 'breakdown' ? (
        <section className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToOverview}
            className="mb-4"
          >
            ← Volver al resumen
          </Button>
          <CategoryBreakdown
            categories={categories}
            onCategoryClick={handleCategoryClick}
          />
        </section>
      ) : (
        <>
          {/* Quick action to drill down */}
          <section>
            <Button
              variant="outline"
              onClick={() => setViewLevel('breakdown')}
              className="w-full mobile-button"
              size="lg"
            >
              Ver desglose por categorías →
            </Button>
          </section>

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
        </>
      )}

      {/* Variance Analysis Chart */}
      <VarianceAnalysisChart
        current={summary.avgFoodCost}
        target={TARGET_FOOD_COST}
        variance={summary.variance}
      />

      {/* Top Variance Ingredients */}
      {topVariances.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Top 10 Ingredientes con Mayor Variancia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topVariances.map((item, index) => {
                const isNegative = item.total_cost_impact < 0;
                const absImpact = Math.abs(item.total_cost_impact);
                
                return (
                  <div key={item.ingredient_id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{item.ingredient_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.days_with_variance} días con variancia
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={Math.abs(item.avg_variance_pct) > 15 ? 'destructive' : 'secondary'}
                        className="mb-1"
                      >
                        {item.avg_variance_pct > 0 ? '+' : ''}{item.avg_variance_pct.toFixed(1)}%
                      </Badge>
                      <p className={`text-sm font-medium ${isNegative ? 'text-green-600' : 'text-red-600'}`}>
                        {isNegative ? '-' : '+'}{formatImpact(absImpact)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Variance Analysis with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Variancia</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="theoretical" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="theoretical">Variancia Teórica</TabsTrigger>
              <TabsTrigger value="real">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Variancia Real
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="theoretical" className="space-y-4">
              {varianceData.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Variancia calculada automáticamente basada en recetas y ventas
                  </p>
                  {varianceData.slice(0, 15).map((variance) => {
                    const isOverage = variance.variance_pct > 0;
                    const severity = Math.abs(variance.variance_pct) > 20 ? 'critical' : 
                                    Math.abs(variance.variance_pct) > 10 ? 'warning' : 'info';
                    
                    return (
                      <div key={`${variance.ingredient_id}-${variance.day}`} className="flex items-start justify-between border-b pb-2 last:border-0">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{variance.ingredient_name}</p>
                            <Badge variant={severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                              {variance.variance_pct > 0 ? '+' : ''}{variance.variance_pct.toFixed(1)}%
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(variance.day).toLocaleDateString('es-MX', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                            {' • '}
                            Teórico: {variance.theoretical_qty.toFixed(1)} {variance.unit}
                            {' • '}
                            Sistema: {variance.actual_qty.toFixed(1)} {variance.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${isOverage ? 'text-red-600' : 'text-green-600'}`}>
                            {isOverage ? '+' : ''}{formatImpact(Math.abs(variance.cost_impact_mxn))}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No hay datos de variancia teórica</p>
              )}
            </TabsContent>
            
            <TabsContent value="real" className="space-y-4">
              {realVarianceData.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Variancia basada en conteos físicos de inventario vs teórico
                  </p>
                  {realVarianceData.map((variance) => {
                    const isOverage = variance.variance_pct && variance.variance_pct > 0;
                    const severity = variance.variance_pct && Math.abs(variance.variance_pct) > 20 ? 'critical' : 
                                    variance.variance_pct && Math.abs(variance.variance_pct) > 10 ? 'warning' : 'info';
                    
                    return (
                      <div key={`${variance.ingredient_id}-${variance.day}`} className="flex items-start justify-between border-b pb-2 last:border-0">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{variance.ingredient_name}</p>
                            {variance.variance_pct && (
                              <Badge variant={severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                                {variance.variance_pct > 0 ? '+' : ''}{variance.variance_pct.toFixed(1)}%
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(variance.day).toLocaleDateString('es-MX', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                            {' • '}
                            Teórico: {variance.theoretical_qty.toFixed(1)} {variance.unit}
                            {' • '}
                            Físico: {variance.actual_qty.toFixed(1)} {variance.unit}
                          </p>
                          {variance.notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              Nota: {variance.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${isOverage ? 'text-red-600' : 'text-green-600'}`}>
                            {isOverage ? '+' : ''}{formatImpact(Math.abs(variance.cost_impact_mxn))}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No hay conteos de inventario registrados</p>
                  <Button variant="outline" onClick={() => window.location.href = '/inventory-count'}>
                    Realizar Conteo de Inventario
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};