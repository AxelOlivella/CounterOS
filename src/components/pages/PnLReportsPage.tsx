import { useState, useEffect } from 'react';
import { useCounter } from '@/contexts/CounterContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker-range';
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Download,
  Calculator,
  BarChart3,
  PieChart
} from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { PnLSummaryChart } from '@/components/pnl/PnLSummaryChart';
import { RevenueAnalysisChart } from '@/components/pnl/RevenueAnalysisChart';
import { ExpenseBreakdownChart } from '@/components/pnl/ExpenseBreakdownChart';
import { ProfitabilityTrendChart } from '@/components/pnl/ProfitabilityTrendChart';
import { PnLTable } from '@/components/pnl/PnLTable';
import { toast } from '@/hooks/use-toast';
import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface PnLData {
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMargin: number;
  laborCosts: number;
  otherExpenses: number;
  totalOperatingExpenses: number;
  ebitda: number;
  ebitdaMargin: number;
  netProfit: number;
  netMargin: number;
  revenueBreakdown: Array<{
    store: string;
    revenue: number;
    transactions: number;
    avgTicket: number;
  }>;
  expenseBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    revenue: number;
    cogs: number;
    grossProfit: number;
    netProfit: number;
    grossMargin: number;
    netMargin: number;
  }>;
  comparison?: {
    revenue: number;
    grossProfit: number;
    netProfit: number;
  };
}

export const PnLReportsPage = () => {
  const { userProfile } = useCounter();
  const [data, setData] = useState<PnLData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date())
  });
  const [stores, setStores] = useState<Array<{id: string, name: string}>>([]);
  const [comparisonPeriod, setComparisonPeriod] = useState<'previous-month' | 'previous-year' | 'none'>('previous-month');

  useEffect(() => {
    fetchStores();
  }, [userProfile]);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchPnLData();
    }
  }, [userProfile, selectedStore, dateRange, comparisonPeriod]);

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

  const fetchPnLData = async () => {
    if (!userProfile || !dateRange?.from || !dateRange?.to) return;
    
    setLoading(true);
    try {
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(dateRange.to, 'yyyy-MM-dd');
      const baseFilter = selectedStore !== 'all' ? { store_id: selectedStore } : {};

      // Fetch revenue data
      const { data: salesData, error: salesError } = await supabase
        .from('daily_sales')
        .select('net_sales, gross_sales, discounts, transactions, date, store_id')
        .gte('date', startDate)
        .lte('date', endDate)
        .match(baseFilter);

      if (salesError) throw salesError;

      // Fetch COGS (purchases)
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select('total, issue_date, store_id')
        .gte('issue_date', startDate)
        .lte('issue_date', endDate)
        .match(baseFilter);

      if (purchasesError) throw purchasesError;

      // Fetch labor costs
      const { data: laborData, error: laborError } = await supabase
        .from('labor_costs')
        .select('labor_cost, date, store_id')
        .gte('date', startDate)
        .lte('date', endDate)
        .match(baseFilter);

      if (laborError) throw laborError;

      // Fetch other expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('amount, category, date, store_id')
        .gte('date', startDate)
        .lte('date', endDate)
        .match(baseFilter);

      if (expensesError) throw expensesError;

      // Calculate main metrics
      const revenue = salesData?.reduce((sum, s) => sum + (s.net_sales || 0), 0) || 0;
      const grossSales = salesData?.reduce((sum, s) => sum + (s.gross_sales || 0), 0) || 0;
      const totalTransactions = salesData?.reduce((sum, s) => sum + (s.transactions || 0), 0) || 0;
      const cogs = purchasesData?.reduce((sum, p) => sum + (p.total || 0), 0) || 0;
      const laborCosts = laborData?.reduce((sum, l) => sum + (l.labor_cost || 0), 0) || 0;
      const otherExpenses = expensesData?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

      const grossProfit = revenue - cogs;
      const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
      const totalOperatingExpenses = laborCosts + otherExpenses;
      const ebitda = grossProfit - totalOperatingExpenses;
      const ebitdaMargin = revenue > 0 ? (ebitda / revenue) * 100 : 0;
      const netProfit = ebitda; // Simplified - not including depreciation, interest, taxes
      const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

      // Revenue breakdown by store
      const storeRevenue: Record<string, {revenue: number, transactions: number}> = {};
      salesData?.forEach(sale => {
        const storeId = sale.store_id || 'unknown';
        if (!storeRevenue[storeId]) {
          storeRevenue[storeId] = { revenue: 0, transactions: 0 };
        }
        storeRevenue[storeId].revenue += sale.net_sales || 0;
        storeRevenue[storeId].transactions += sale.transactions || 0;
      });

      const revenueBreakdown = await Promise.all(
        Object.entries(storeRevenue).map(async ([storeId, data]) => {
          let storeName = storeId;
          if (storeId !== 'unknown') {
            const { data: store } = await supabase
              .from('stores')
              .select('name')
              .eq('id', storeId)
              .single();
            storeName = store?.name || `Store ${storeId}`;
          }
          return {
            store: storeName,
            revenue: data.revenue,
            transactions: data.transactions,
            avgTicket: data.transactions > 0 ? data.revenue / data.transactions : 0
          };
        })
      );

      // Expense breakdown by category
      const expensesByCategory: Record<string, number> = {
        'Costo de Ventas': cogs,
        'Nómina': laborCosts
      };

      expensesData?.forEach(expense => {
        const category = expense.category || 'Otros';
        expensesByCategory[category] = (expensesByCategory[category] || 0) + (expense.amount || 0);
      });

      const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);
      const expenseBreakdown = Object.entries(expensesByCategory).map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      }));

      // Monthly trend data (last 6 months)
      const monthlyTrend = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthEnd = endOfMonth(subMonths(new Date(), i));
        const monthStartStr = format(monthStart, 'yyyy-MM-dd');
        const monthEndStr = format(monthEnd, 'yyyy-MM-dd');

        const monthSales = await supabase
          .from('daily_sales')
          .select('net_sales')
          .gte('date', monthStartStr)
          .lte('date', monthEndStr)
          .match(baseFilter);

        const monthPurchases = await supabase
          .from('purchases')
          .select('total')
          .gte('issue_date', monthStartStr)
          .lte('issue_date', monthEndStr)
          .match(baseFilter);

        const monthRevenue = monthSales.data?.reduce((sum, s) => sum + (s.net_sales || 0), 0) || 0;
        const monthCogs = monthPurchases.data?.reduce((sum, p) => sum + (p.total || 0), 0) || 0;
        const monthGrossProfit = monthRevenue - monthCogs;

        monthlyTrend.push({
          month: format(monthStart, 'MMM yyyy'),
          revenue: monthRevenue,
          cogs: monthCogs,
          grossProfit: monthGrossProfit,
          netProfit: monthGrossProfit, // Simplified
          grossMargin: monthRevenue > 0 ? (monthGrossProfit / monthRevenue) * 100 : 0,
          netMargin: monthRevenue > 0 ? (monthGrossProfit / monthRevenue) * 100 : 0
        });
      }

      // Comparison data
      let comparison;
      if (comparisonPeriod !== 'none') {
        const compStart = comparisonPeriod === 'previous-month' 
          ? subMonths(dateRange.from, 1)
          : subMonths(dateRange.from, 12);
        const compEnd = comparisonPeriod === 'previous-month'
          ? subMonths(dateRange.to, 1)
          : subMonths(dateRange.to, 12);

        const compStartStr = format(compStart, 'yyyy-MM-dd');
        const compEndStr = format(compEnd, 'yyyy-MM-dd');

        const [compSales, compPurchases] = await Promise.all([
          supabase
            .from('daily_sales')
            .select('net_sales')
            .gte('date', compStartStr)
            .lte('date', compEndStr)
            .match(baseFilter),
          supabase
            .from('purchases')
            .select('total')
            .gte('issue_date', compStartStr)
            .lte('issue_date', compEndStr)
            .match(baseFilter)
        ]);

        const compRevenue = compSales.data?.reduce((sum, s) => sum + (s.net_sales || 0), 0) || 0;
        const compCogs = compPurchases.data?.reduce((sum, p) => sum + (p.total || 0), 0) || 0;
        const compGrossProfit = compRevenue - compCogs;

        comparison = {
          revenue: compRevenue,
          grossProfit: compGrossProfit,
          netProfit: compGrossProfit
        };
      }

      setData({
        revenue,
        cogs,
        grossProfit,
        grossMargin,
        laborCosts,
        otherExpenses,
        totalOperatingExpenses,
        ebitda,
        ebitdaMargin,
        netProfit,
        netMargin,
        revenueBreakdown,
        expenseBreakdown,
        monthlyTrend,
        comparison
      });

    } catch (error) {
      console.error('Error fetching P&L data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el reporte P&L",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // Implementation for exporting P&L report
    toast({
      title: "Exportar P&L",
      description: "Funcionalidad de exportación próximamente",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Reportes P&L</h1>
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

  const getComparisonChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reportes P&L</h1>
          <p className="text-muted-foreground">
            Análisis de rentabilidad y rendimiento financiero
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

          <Select value={comparisonPeriod} onValueChange={(value: any) => setComparisonPeriod(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin comparación</SelectItem>
              <SelectItem value="previous-month">vs Mes Anterior</SelectItem>
              <SelectItem value="previous-year">vs Año Anterior</SelectItem>
            </SelectContent>
          </Select>

          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
          />
          
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Ingresos"
          value={data.revenue}
          change={data.comparison ? getComparisonChange(data.revenue, data.comparison.revenue) : undefined}
          format="currency"
          icon={<DollarSign className="h-4 w-4" />}
        />
        
        <KPICard
          title="Utilidad Bruta"
          value={data.grossProfit}
          change={data.comparison ? getComparisonChange(data.grossProfit, data.comparison.grossProfit) : undefined}
          format="currency"
          variant={data.grossMargin > 60 ? 'success' : data.grossMargin > 50 ? 'warning' : 'danger'}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        
        <KPICard
          title="Margen Bruto"
          value={data.grossMargin}
          format="percentage"
          variant={data.grossMargin > 60 ? 'success' : data.grossMargin > 50 ? 'warning' : 'danger'}
          icon={<BarChart3 className="h-4 w-4" />}
        />
        
        <KPICard
          title="Utilidad Neta"
          value={data.netProfit}
          change={data.comparison ? getComparisonChange(data.netProfit, data.comparison.netProfit) : undefined}
          format="currency"
          variant={data.netMargin > 20 ? 'success' : data.netMargin > 10 ? 'warning' : 'danger'}
          icon={<Calculator className="h-4 w-4" />}
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Resumen</TabsTrigger>
          <TabsTrigger value="revenue">Ingresos</TabsTrigger>
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <PnLSummaryChart data={data} />
            <PnLTable data={data} />
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <RevenueAnalysisChart data={data.revenueBreakdown} />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <ExpenseBreakdownChart data={data.expenseBreakdown} />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <ProfitabilityTrendChart data={data.monthlyTrend} />
        </TabsContent>
      </Tabs>
    </div>
  );
};