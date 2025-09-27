import { useEffect, useState } from 'react';
import { useCounter } from '@/contexts/CounterContext';
import { fetchDashboardKPIs, fetchTenant } from '@/lib/counteros-db';
import { KPICard } from '@/components/dashboard/KPICard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, PieChart, Users, Store, AlertTriangle, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardData {
  totalSales: number;
  foodCostPercentage: number;
  totalTransactions: number;
  avgTicket: number;
  stores: number;
  salesData?: any[];
  purchases?: any[];
}

export const DashboardPage = () => {
  const { userProfile, tenant } = useCounter();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData>({
    totalSales: 0,
    foodCostPercentage: 0,
    totalTransactions: 0,
    avgTicket: 0,
    stores: 0,
  });
  const [loading, setLoading] = useState(true);
  const [demoTenant, setDemoTenant] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
  }, [userProfile]);

  const loadDashboardData = async () => {
    setLoading(true);
    
    try {
      // First try to load demo data for showcase
      const demo = await fetchTenant('demo-counteros');
      if (demo) {
        setDemoTenant(demo);
        const kpis = await fetchDashboardKPIs(demo.id);
        
        if (kpis) {
          setData({
            totalSales: kpis.totalSales,
            foodCostPercentage: kpis.foodCostPercentage,
            totalTransactions: kpis.totalTransactions,
            avgTicket: kpis.avgTicket,
            stores: kpis.stores,
            salesData: kpis.salesData,
            purchases: kpis.purchases
          });
        } else {
          // Fallback demo data if no sales data exists yet
          setData({
            totalSales: 1250000,
            foodCostPercentage: 28.5,
            totalTransactions: 8450,
            avgTicket: 235,
            stores: 1,
          });
        }
      } else if (userProfile?.tenant_id) {
        // Load actual user data if logged in
        const kpis = await fetchDashboardKPIs(userProfile.tenant_id);
        
        if (kpis) {
          setData({
            totalSales: kpis.totalSales,
            foodCostPercentage: kpis.foodCostPercentage,
            totalTransactions: kpis.totalTransactions,
            avgTicket: kpis.avgTicket,
            stores: kpis.stores,
            salesData: kpis.salesData,
            purchases: kpis.purchases
          });
        }
      } else {
        // Default demo values for showcase
        setData({
          totalSales: 1250000,
          foodCostPercentage: 28.5,
          totalTransactions: 8450,
          avgTicket: 235,
          stores: 1,
        });
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos del dashboard',
        variant: 'destructive',
      });
      
      // Fallback to demo data on error
      setData({
        totalSales: 1250000,
        foodCostPercentage: 28.5,
        totalTransactions: 8450,
        avgTicket: 235,
        stores: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  const getTheme = () => {
    return demoTenant?.theme || tenant?.theme || { primary: '#00C853', secondary: '#FFFFFF' };
  };

  const displayTenant = demoTenant || tenant;

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
          <h1 className="text-3xl font-bold tracking-tight">CounterOS Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen de métricas de {displayTenant?.name || 'Demo CounterOS'}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Ventas (30 días)"
          value={data.totalSales}
          format="currency"
          variant="default"
          icon={<DollarSign className="h-4 w-4" />}
          change={5.2}
        />
        
        <KPICard
          title="Food Cost %"
          value={data.foodCostPercentage}
          format="percentage"
          variant={data.foodCostPercentage > 30 ? 'danger' : 'success'}
          icon={<PieChart className="h-4 w-4" />}
          change={-1.8}
        />
        
        <KPICard
          title="Transacciones"
          value={data.totalTransactions}
          format="number"
          variant="default"
          icon={<ShoppingCart className="h-4 w-4" />}
          change={3.4}
        />
        
        <KPICard
          title="Ticket Promedio"
          value={data.avgTicket}
          format="currency"
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
            <div className="text-2xl font-bold mb-2">{data.stores}</div>
            <p className="text-sm text-muted-foreground">
              Tiendas registradas en el sistema
            </p>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Rendimiento del Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Food Cost Target</span>
                <span className={`text-sm ${data.foodCostPercentage <= 30 ? 'text-green-600' : 'text-red-600'}`}>
                  {data.foodCostPercentage <= 30 ? '✓ Dentro del target' : '⚠ Fuera del target'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Ticket Promedio</span>
                <span className="text-sm font-bold">${data.avgTicket}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Transacciones/día</span>
                <span className="text-sm font-bold">{Math.round(data.totalTransactions / 30)}</span>
              </div>
            </div>
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