import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { AppLayout } from '@/components/layout/AppLayout';
import { KpiCard } from '@/components/mobile/KpiCard';
import { AlertItem } from '@/components/mobile/AlertItem';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { EmptyState } from '@/components/ui/states/EmptyState';
import { useSEO } from '@/hooks/useSEO';
import { 
  Store, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Target,
  Plus,
  MapPin
} from 'lucide-react';
import { useStoreSelection } from '@/hooks/useStoreSelection';
import { calculatePnL, formatCurrency, formatPercentage, formatPP } from '@/utils/calculations';

const TiendasPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { stores } = useStoreSelection();
  const [searchTerm, setSearchTerm] = useState('');

  // SEO Configuration
  useSEO({
    title: 'Gestión de Tiendas - Monitoreo Multi-Ubicación',
    description: 'Administra todas tus ubicaciones desde un panel central. Control de food cost, alertas y métricas por tienda en tiempo real.',
    keywords: ['gestión tiendas restaurante', 'multi ubicación', 'control por tienda', 'food cost tiendas']
  });

  // Mock data for stores - in real app this would come from API
  const storesData = [
    {
      slug: 'portal-centro',
      name: 'Portal Centro',
      city: 'León',
      sales_mxn: 98000,
      food_cost_pct: 34.2,
      target_pct: 30.0,
      trend: -1.8,
      alerts: 2,
      status: 'attention'
    },
    {
      slug: 'plaza-norte', 
      name: 'Plaza Norte',
      city: 'León',
      sales_mxn: 125000,
      food_cost_pct: 28.5,
      target_pct: 30.0,
      trend: 2.1,
      alerts: 0,
      status: 'good'
    }
  ];

  // Memoize filtered stores to avoid recalculation on every render
  const filteredStores = useMemo(() => 
    storesData.filter(store => 
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.city.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [searchTerm]
  );

  const handleStoreClick = (storeSlug: string) => {
    navigate(`/tiendas/${storeSlug}`);
  };

  return (
    <div className="min-h-screen">
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="p-4 space-y-4 pb-24">
          {/* Header */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-primary">Tiendas</h1>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tienda o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Store Cards */}
          {filteredStores.length === 0 ? (
            <EmptyState
              icon={<MapPin className="h-12 w-12 text-muted-foreground" />}
              title="No se encontraron tiendas"
              description={searchTerm 
                ? `No hay resultados para "${searchTerm}". Intenta con otro término de búsqueda.`
                : "Aún no tienes tiendas configuradas. Agrega tu primera tienda para comenzar."}
              action={!searchTerm ? {
                label: "Agregar Primera Tienda",
                onClick: () => toast({
                  title: "Función en desarrollo",
                  description: "La creación de tiendas estará disponible próximamente"
                }),
                variant: 'default'
              } : undefined}
            />
          ) : (
            <div className="space-y-3">
              {filteredStores.map((store) => {
                const delta_pp = store.food_cost_pct - store.target_pct;
                const impact_mxn = (delta_pp * store.sales_mxn) / 100;
                
                return (
                  <KpiCard
                    key={store.slug}
                    title={store.name}
                    value={formatCurrency(store.sales_mxn)}
                    subtitle={`${store.city} • Food Cost: ${formatPercentage(store.food_cost_pct)}`}
                    badge={{
                      text: delta_pp > 0 ? `${formatPP(delta_pp)}` : `${formatPP(delta_pp)}`,
                      variant: delta_pp > 2 ? 'danger' : delta_pp > 0 ? 'warning' : 'success'
                    }}
                    trend={{
                      value: `${store.trend > 0 ? '+' : ''}${store.trend}%`,
                      isPositive: store.trend > 0
                    }}
                    onClick={() => handleStoreClick(store.slug)}
                    icon={<Store className="h-5 w-5" />}
                  />
                );
              })}
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <KpiCard
              title="Total Ventas"
              value={formatCurrency(storesData.reduce((sum, s) => sum + s.sales_mxn, 0))}
              subtitle="Este mes"
              icon={<TrendingUp className="h-4 w-4 text-success" />}
            />
            <KpiCard
              title="Alertas Activas"
              value={storesData.reduce((sum, s) => sum + s.alerts, 0)}
              subtitle="Requieren atención"
              icon={<AlertTriangle className="h-4 w-4 text-warning" />}
              badge={{
                text: 'Ver todas',
                variant: 'warning'
              }}
              onClick={() => navigate('/alertas')}
            />
          </div>

          {/* Top Alerts */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-primary">Alertas Recientes</h3>
            
            <AlertItem
              severity="high"
              title="Food Cost elevado - Portal Centro"
              subtitle="4.2 pp sobre la meta"
              cause="Desperdicio de lácteos alto"
              impact="$8,200/mes en pérdidas"
              ctaText="Revisar tienda"
              onAction={() => handleStoreClick('portal-centro')}
            />
            
            <AlertItem
              severity="medium"
              title="Ventas bajo expectativa - Portal Centro"
              subtitle="1.8% menos que mes anterior"
              cause="Competencia nueva en zona"
              impact="$1,800/mes menos ingresos"
              ctaText="Ver análisis"
              onAction={() => navigate('/food-cost-analysis')}
            />
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <AppLayout>
          <div className="container mx-auto max-w-6xl py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Tiendas</h1>
                <p className="text-muted-foreground">
                  Gestión y monitoreo de todas tus ubicaciones
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar tienda..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" disabled>
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva Tienda
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Función disponible próximamente</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Store Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredStores.map((store) => {
                const delta_pp = store.food_cost_pct - store.target_pct;
                const impact_mxn = (delta_pp * store.sales_mxn) / 100;
                
                return (
                  <Card key={store.slug} className="cursor-pointer hover:shadow-md transition-all" onClick={() => handleStoreClick(store.slug)}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Store className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold">{store.name}</h3>
                            <p className="text-sm text-muted-foreground">{store.city}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                            store.trend > 0 ? 'text-success' : 'text-danger'
                          }`}>
                            {store.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {store.trend > 0 ? '+' : ''}{store.trend}%
                          </span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Ventas del Mes</p>
                          <p className="text-xl font-bold">{formatCurrency(store.sales_mxn)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Food Cost</p>
                          <p className={`text-xl font-bold ${
                            delta_pp > 2 ? 'text-danger' : delta_pp > 0 ? 'text-warning' : 'text-success'
                          }`}>
                            {formatPercentage(store.food_cost_pct)}
                          </p>
                        </div>
                      </div>

                      <div className={`p-3 rounded-lg border ${
                        delta_pp > 2 ? 'bg-danger/5 border-danger/20' : 
                        delta_pp > 0 ? 'bg-warning/5 border-warning/20' : 
                        'bg-success/5 border-success/20'
                      }`}>
                        <p className="text-sm font-medium">
                          {delta_pp > 0 ? 'Sobre meta' : 'Bajo meta'}: {formatPP(Math.abs(delta_pp))}
                        </p>
                        <p className={`text-xs ${
                          delta_pp > 2 ? 'text-danger' : 
                          delta_pp > 0 ? 'text-warning' : 
                          'text-success'
                        }`}>
                          Impacto: {formatCurrency(Math.abs(impact_mxn))}/mes
                        </p>
                      </div>

                      {store.alerts > 0 && (
                        <div className="flex items-center gap-2 text-warning">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">{store.alerts} alertas activas</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </AppLayout>
      </div>
    </div>
  );
};

export default TiendasPage;