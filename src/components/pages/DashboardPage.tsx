import { useEffect, useState } from 'react';
import { useCounter } from '@/contexts/CounterContext';
import { supabase } from '@/integrations/supabase/client';
import { KPICard } from '@/components/dashboard/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, PieChart, Users, Store, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardData {
  todaySales: number;
  foodCostPercent: number;
  laborPercent: number;
  ebitdaPercent: number;
  storeCount: number;
  alerts: any[];
}

export const DashboardPage = () => {
  const { userProfile, tenant } = useCounter();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData>({
    todaySales: 0,
    foodCostPercent: 0,
    laborPercent: 0,
    ebitdaPercent: 0,
    storeCount: 0,
    alerts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [userProfile]);

  const fetchDashboardData = async () => {
    if (!userProfile?.tenant_id) return;

    try {
      // Fetch stores count
      const { data: stores, error: storesError } = await supabase
        .from('stores')
        .select('id')
        .eq('tenant_id', userProfile.tenant_id);

      if (storesError) throw storesError;

      // Fetch today's sales
      const today = new Date().toISOString().split('T')[0];
      const { data: salesData, error: salesError } = await supabase
        .from('daily_sales')
        .select('net_sales')
        .eq('tenant_id', userProfile.tenant_id)
        .eq('date', today);

      if (salesError) throw salesError;

      const todaySales = salesData?.reduce((sum, sale) => sum + (sale.net_sales || 0), 0) || 0;

      // Calculate food cost % (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: recentSales, error: recentSalesError } = await supabase
        .from('daily_sales')
        .select('net_sales')
        .eq('tenant_id', userProfile.tenant_id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

      const { data: recentPurchases, error: recentPurchasesError } = await supabase
        .from('purchases')
        .select('total')
        .eq('tenant_id', userProfile.tenant_id)
        .gte('issue_date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (recentSalesError) throw recentSalesError;
      if (recentPurchasesError) throw recentPurchasesError;

      const totalSales30d = recentSales?.reduce((sum, sale) => sum + (sale.net_sales || 0), 0) || 1;
      const totalPurchases30d = recentPurchases?.reduce((sum, purchase) => sum + (purchase.total || 0), 0) || 0;
      const foodCostPercent = (totalPurchases30d / totalSales30d) * 100;

      // Calculate labor cost % (last 30 days)
      const { data: recentLabor, error: recentLaborError } = await supabase
        .from('labor_costs')
        .select('labor_cost')
        .eq('tenant_id', userProfile.tenant_id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (recentLaborError) throw recentLaborError;

      const totalLabor30d = recentLabor?.reduce((sum, labor) => sum + (labor.labor_cost || 0), 0) || 0;
      const laborPercent = (totalLabor30d / totalSales30d) * 100;

      // Fetch recent alerts
      const { data: alerts, error: alertsError } = await supabase
        .from('alerts')
        .select('*')
        .eq('tenant_id', userProfile.tenant_id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (alertsError) throw alertsError;

      setData({
        todaySales,
        foodCostPercent: Math.min(foodCostPercent, 100), // Cap at 100%
        laborPercent: Math.min(laborPercent, 100), // Cap at 100%
        ebitdaPercent: Math.max(15.8 - (foodCostPercent - 25) - (laborPercent - 18), 0), // Rough calculation
        storeCount: stores?.length || 0,
        alerts: alerts || []
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos del dashboard',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTheme = () => {
    return tenant?.theme || { primary: '#00C853', secondary: '#FFFFFF' };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen de métricas de {tenant?.name || 'tu negocio'}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Ventas Hoy"
          value={data.todaySales}
          format="currency"
          variant="default"
          icon={<DollarSign className="h-4 w-4" />}
          change={5.2}
        />
        
        <KPICard
          title="Food Cost %"
          value={data.foodCostPercent}
          format="percentage"
          variant={data.foodCostPercent > 30 ? 'danger' : 'success'}
          icon={<PieChart className="h-4 w-4" />}
          change={-1.8}
        />
        
        <KPICard
          title="Labor %"
          value={data.laborPercent}
          format="percentage"
          variant={data.laborPercent > 20 ? 'warning' : 'success'}
          icon={<Users className="h-4 w-4" />}
          change={0.5}
        />
        
        <KPICard
          title="EBITDA %"
          value={data.ebitdaPercent}
          format="percentage"
          variant="success"
          icon={<TrendingUp className="h-4 w-4" />}
          change={2.1}
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Stores Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Tiendas Activas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{data.storeCount}</div>
            <p className="text-sm text-muted-foreground">
              Tiendas registradas en el sistema
            </p>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.alerts.length > 0 ? (
              <div className="space-y-2">
                {data.alerts.slice(0, 3).map((alert, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{alert.type}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      alert.severity === 'crit' ? 'bg-red-100 text-red-800' :
                      alert.severity === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No hay alertas recientes
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Welcome Message for Demo */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">¡Bienvenido a CounterOS!</h3>
            <p className="text-muted-foreground mb-4">
              Sistema de gestión integral para cadenas QSR. Para comenzar, sube tus datos de ventas y compras.
            </p>
            <div className="flex gap-2 justify-center">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                Multi-tenant
              </span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                Real-time KPIs
              </span>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                CFDI Integration
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};