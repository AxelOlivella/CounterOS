import { useState, useEffect } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2, DollarSign, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Store {
  id: string;
  name: string;
}

interface PnLData {
  period: string;
  revenue: number;
  cogs: number;
  rent: number;
  payroll: number;
  energy: number;
  marketing: number;
  royalties: number;
  ebitda: number;
  storeId?: string;
}

export const PnLReportsPage = () => {
  const { userProfile } = useTenant();
  const { toast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [pnlData, setPnlData] = useState<PnLData[]>([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
  });

  useEffect(() => {
    fetchStores();
    fetchPnLData();
  }, []);

  useEffect(() => {
    fetchPnLData();
  }, [selectedStore]);

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
      console.error('Error fetching stores:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch stores',
        variant: 'destructive',
      });
    }
  };

  const fetchPnLData = async () => {
    setLoading(true);
    try {
      // Get last 6 months of data
      const startDate = format(startOfMonth(subMonths(new Date(), 6)), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd');

      const { data: allData, error } = await supabase
        .rpc('get_pnl_monthly_data');

      if (error) throw error;

      // Filter data by date range and store on client side
      let filteredData = allData?.filter(item => {
        const itemDate = new Date(item.period);
        const fromDate = new Date(startDate);
        const toDate = new Date(endDate);
        return itemDate >= fromDate && itemDate <= toDate;
      }) || [];

      if (selectedStore !== 'all') {
        filteredData = filteredData.filter(item => item.store_id === selectedStore);
      }

      // Sort by period
      filteredData.sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());
      
      const data = filteredData;

      if (error) throw error;

      const processedData: PnLData[] = data?.map(item => ({
        period: item.period || '',
        revenue: Number(item.revenue) || 0,
        cogs: Number(item.cogs) || 0,
        rent: Number(item.rent) || 0,
        payroll: Number(item.payroll) || 0,
        energy: Number(item.energy) || 0,
        marketing: Number(item.marketing) || 0,
        royalties: Number(item.royalties) || 0,
        ebitda: Number(item.ebitda) || 0,
        storeId: item.store_id,
      })) || [];

      setPnlData(processedData);

      // Calculate summary
      const totalRevenue = processedData.reduce((sum, item) => sum + item.revenue, 0);
      const totalExpenses = processedData.reduce((sum, item) => 
        sum + item.cogs + item.rent + item.payroll + item.energy + item.marketing + item.royalties, 0
      );
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      setSummary({
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
      });

    } catch (error) {
      console.error('Error fetching P&L data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch P&L data',
        variant: 'destructive',
      });
      
      // Show demo data if no real data
      const demoData: PnLData[] = [
        { period: '2024-01', revenue: 450000, cogs: 144000, rent: 85000, payroll: 67000, energy: 15000, marketing: 22000, royalties: 13500, ebitda: 103500 },
        { period: '2024-02', revenue: 472000, cogs: 151000, rent: 85000, payroll: 68000, energy: 16000, marketing: 24000, royalties: 14160, ebitda: 113840 },
        { period: '2024-03', revenue: 485000, cogs: 155000, rent: 85000, payroll: 69000, energy: 17000, marketing: 25000, royalties: 14550, ebitda: 119450 },
      ];
      setPnlData(demoData);
      
      const totalRevenue = demoData.reduce((sum, item) => sum + item.revenue, 0);
      const totalExpenses = demoData.reduce((sum, item) => 
        sum + item.cogs + item.rent + item.payroll + item.energy + item.marketing + item.royalties, 0
      );
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      setSummary({
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes P&L</h1>
          <p className="text-muted-foreground">
            Análisis de pérdidas y ganancias por período
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
          <div className="flex items-end">
            <Button onClick={fetchPnLData} disabled={loading}>
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
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${summary.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ${summary.totalExpenses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Todos los gastos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilidad Neta</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${summary.netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.netProfit >= 0 ? 'Ganancia' : 'Pérdida'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen de Utilidad</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.profitMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Margen neto</p>
          </CardContent>
        </Card>
      </div>

      {/* P&L Table */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Resultados por Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Período</th>
                  <th className="text-right p-2">Ingresos</th>
                  <th className="text-right p-2">COGS</th>
                  <th className="text-right p-2">Renta</th>
                  <th className="text-right p-2">Nómina</th>
                  <th className="text-right p-2">Energía</th>
                  <th className="text-right p-2">Marketing</th>
                  <th className="text-right p-2">Royalties</th>
                  <th className="text-right p-2">EBITDA</th>
                </tr>
              </thead>
              <tbody>
                {pnlData.map((row, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{row.period}</td>
                    <td className="text-right p-2">${row.revenue.toLocaleString()}</td>
                    <td className="text-right p-2 text-red-600">${row.cogs.toLocaleString()}</td>
                    <td className="text-right p-2 text-red-600">${row.rent.toLocaleString()}</td>
                    <td className="text-right p-2 text-red-600">${row.payroll.toLocaleString()}</td>
                    <td className="text-right p-2 text-red-600">${row.energy.toLocaleString()}</td>
                    <td className="text-right p-2 text-red-600">${row.marketing.toLocaleString()}</td>
                    <td className="text-right p-2 text-red-600">${row.royalties.toLocaleString()}</td>
                    <td className={`text-right p-2 font-bold ${row.ebitda >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${row.ebitda.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};