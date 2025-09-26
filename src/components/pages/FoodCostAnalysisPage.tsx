import { useState, useEffect } from 'react';
import { useCounter } from '@/contexts/CounterContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp, TrendingDown, AlertTriangle, DollarSign } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { FoodCostTrendChart } from '@/components/food-cost/FoodCostTrendChart';
import { CategoryBreakdownChart } from '@/components/food-cost/CategoryBreakdownChart';
import { VarianceAnalysisChart } from '@/components/food-cost/VarianceAnalysisChart';
import { toast } from '@/hooks/use-toast';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

interface FoodCostData {
  currentFoodCostPercent: number;
  previousFoodCostPercent: number;
  totalPurchases: number;
  totalSales: number;
  targetFoodCost: number;
  variance: number;
  topCategories: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  trendData: Array<{
    date: string;
    foodCostPercent: number;
    purchases: number;
    sales: number;
  }>;
}

export const FoodCostAnalysisPage = () => {
  const { userProfile } = useCounter();
  const [data, setData] = useState<FoodCostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [stores, setStores] = useState<Array<{id: string, name: string}>>([]);

  useEffect(() => {
    fetchStores();
    fetchFoodCostData();
  }, [userProfile, selectedPeriod, selectedStore]);

  const fetchStores = async () => {
    try {
      const { data: storesData, error } = await supabase
        .from('stores')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setStores(storesData || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const fetchFoodCostData = async () => {
    if (!userProfile) return;
    
    setLoading(true);
    try {
      const today = new Date();
      const periodDays = parseInt(selectedPeriod);
      const startDate = format(subDays(today, periodDays), 'yyyy-MM-dd');
      const endDate = format(today, 'yyyy-MM-dd');

      // Base queries with optional store filter
      const baseFilter = selectedStore !== 'all' ? { store_id: selectedStore } : {};

      // Fetch current period purchases
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select(`
          total,
          issue_date,
          purchase_items(category, line_total)
        `)
        .gte('issue_date', startDate)
        .lte('issue_date', endDate)
        .match(baseFilter);

      if (purchasesError) throw purchasesError;

      // Fetch current period sales
      const { data: sales, error: salesError } = await supabase
        .from('daily_sales')
        .select('net_sales, date')
        .gte('date', startDate)
        .lte('date', endDate)
        .match(baseFilter);

      if (salesError) throw salesError;

      // Calculate totals
      const totalPurchases = purchases?.reduce((sum, p) => sum + (p.total || 0), 0) || 0;
      const totalSales = sales?.reduce((sum, s) => sum + (s.net_sales || 0), 0) || 0;
      const currentFoodCostPercent = totalSales > 0 ? (totalPurchases / totalSales) * 100 : 0;

      // Fetch previous period for comparison
      const prevStartDate = format(subDays(today, periodDays * 2), 'yyyy-MM-dd');
      const prevEndDate = format(subDays(today, periodDays), 'yyyy-MM-dd');

      const [prevPurchases, prevSales] = await Promise.all([
        supabase
          .from('purchases')
          .select('total')
          .gte('issue_date', prevStartDate)
          .lte('issue_date', prevEndDate)
          .match(baseFilter),
        supabase
          .from('daily_sales')
          .select('net_sales')
          .gte('date', prevStartDate)
          .lte('date', prevEndDate)
          .match(baseFilter)
      ]);

      const prevTotalPurchases = prevPurchases.data?.reduce((sum, p) => sum + (p.total || 0), 0) || 0;
      const prevTotalSales = prevSales.data?.reduce((sum, s) => sum + (s.net_sales || 0), 0) || 0;
      const previousFoodCostPercent = prevTotalSales > 0 ? (prevTotalPurchases / prevTotalSales) * 100 : 0;

      // Calculate category breakdown
      const categoryTotals: Record<string, number> = {};
      purchases?.forEach(purchase => {
        purchase.purchase_items?.forEach(item => {
          const category = item.category || 'Sin categoría';
          categoryTotals[category] = (categoryTotals[category] || 0) + (item.line_total || 0);
        });
      });

      const topCategories = Object.entries(categoryTotals)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalPurchases > 0 ? (amount / totalPurchases) * 100 : 0
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      // Generate trend data (daily)
      const trendData = [];
      for (let i = periodDays - 1; i >= 0; i--) {
        const date = format(subDays(today, i), 'yyyy-MM-dd');
        const dayPurchases = purchases?.filter(p => p.issue_date === date).reduce((sum, p) => sum + (p.total || 0), 0) || 0;
        const daySales = sales?.filter(s => s.date === date).reduce((sum, s) => sum + (s.net_sales || 0), 0) || 0;
        
        trendData.push({
          date,
          foodCostPercent: daySales > 0 ? (dayPurchases / daySales) * 100 : 0,
          purchases: dayPurchases,
          sales: daySales
        });
      }

      const targetFoodCost = 30; // Industry standard target
      const variance = currentFoodCostPercent - targetFoodCost;

      setData({
        currentFoodCostPercent,
        previousFoodCostPercent,
        totalPurchases,
        totalSales,
        targetFoodCost,
        variance,
        topCategories,
        trendData
      });

    } catch (error) {
      console.error('Error fetching food cost data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el análisis de food cost",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 5) return 'danger';
    if (variance > 2) return 'warning';
    return 'success';
  };

  const getVarianceIcon = (variance: number) => {
    if (variance > 2) return AlertTriangle;
    if (variance > 0) return TrendingUp;
    return TrendingDown;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Análisis Food Cost</h1>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const changePercent = data.previousFoodCostPercent > 0 
    ? ((data.currentFoodCostPercent - data.previousFoodCostPercent) / data.previousFoodCostPercent) * 100 
    : 0;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Análisis Food Cost</h1>
          <p className="text-muted-foreground">
            Monitoreo y análisis de costos de alimentos
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-[200px]">
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
          
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 90 días</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Food Cost %"
          value={data.currentFoodCostPercent}
          change={changePercent}
          format="percentage"
          variant={data.variance > 5 ? 'danger' : data.variance > 2 ? 'warning' : 'success'}
          icon={<DollarSign className="h-4 w-4" />}
        />
        
        <KPICard
          title="Compras Totales"
          value={data.totalPurchases}
          format="currency"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        
        <KPICard
          title="Ventas Totales"
          value={data.totalSales}
          format="currency"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        
        <Card className="kpi-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Varianza vs Objetivo
              </CardTitle>
              {(() => {
                const VarianceIcon = getVarianceIcon(data.variance);
                return <VarianceIcon className="h-4 w-4 text-muted-foreground" />;
              })()}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold text-foreground">
                {data.variance > 0 ? '+' : ''}{data.variance.toFixed(1)}%
              </div>
              <Badge 
                variant={data.variance > 5 ? 'destructive' : data.variance > 2 ? 'secondary' : 'default'}
                className="text-xs"
              >
                Meta: {data.targetFoodCost}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="categories">Por Categoría</TabsTrigger>
          <TabsTrigger value="variance">Análisis de Varianza</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <FoodCostTrendChart data={data.trendData} />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <CategoryBreakdownChart data={data.topCategories} />
        </TabsContent>

        <TabsContent value="variance" className="space-y-4">
          <VarianceAnalysisChart 
            current={data.currentFoodCostPercent}
            target={data.targetFoodCost}
            variance={data.variance}
          />
        </TabsContent>
      </Tabs>

      {/* Top Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Top Categorías por Costo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topCategories.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{category.category}</div>
                    <div className="text-sm text-muted-foreground">
                      {category.percentage.toFixed(1)}% del total
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${category.amount.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};