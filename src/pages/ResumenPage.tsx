import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StoreSelector } from '@/components/ui/store-selector';
import { useStoreSelection } from '@/hooks/useStoreSelection';
import { useSEO } from '@/hooks/useSEO';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { LoadingState } from '@/components/ui/states/LoadingState';
import { ErrorState } from '@/components/ui/states/ErrorState';
import { EmptyOnboardingState } from '@/components/ui/states/EmptyOnboardingState';
import GlassCard from '@/components/ui/GlassCard';
import AutoGrid from '@/components/ui/AutoGrid';
import Section from '@/components/ui/Section';
import { routes } from '@/routes';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Store, 
  AlertTriangle, 
  Target,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResumenPage = () => {
  const navigate = useNavigate();
  const { selectedStore, isConsolidatedView } = useStoreSelection();
  
  // Fetch real data from Supabase
  const { data: summaryData, isLoading, error } = useDashboardSummary();

  // SEO Configuration
  useSEO({
    title: 'Resumen Ejecutivo - Control de Costos en Tiempo Real',
    description: 'Dashboard consolidado con métricas clave de rentabilidad. Identifica oportunidades de ahorro y optimiza el food cost de todas tus tiendas.',
    keywords: ['resumen ejecutivo restaurante', 'dashboard costos', 'food cost consolidado']
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl">
        <LoadingState 
          title="Cargando resumen ejecutivo..." 
          description="Procesando métricas de tus tiendas"
        />
      </div>
    );
  }

  // Show error state
  if (error || !summaryData) {
    return (
      <div className="container mx-auto max-w-6xl">
        <ErrorState 
          title="Error al cargar el resumen" 
          description="No se pudieron cargar las métricas del dashboard"
          error={error?.message}
        />
      </div>
    );
  }

  // Show empty state if no stores configured
  if (summaryData.totalStores === 0) {
    return <EmptyOnboardingState />;
  }

  const quickActions = [
    {
      title: 'Revisar Food Cost',
      description: 'Portal Centro necesita atención',
      icon: AlertTriangle,
      color: 'text-orange-500',
      action: () => navigate('/food-cost-analysis')
    },
    {
      title: 'Ver P&L Completo',
      description: 'Análisis financiero detallado',
      icon: DollarSign,
      color: 'text-green-500',
      action: () => navigate('/pnl-reports')
    },
    {
      title: 'Cargar Datos',
      description: 'Actualizar ventas y gastos',
      icon: TrendingUp,
      color: 'text-blue-500',
      action: () => navigate(routes.upload)
    }
  ];

  return (
    <div className="container mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Resumen Ejecutivo
            </h1>
            <p className="text-muted-foreground">
              {isConsolidatedView 
                ? 'Vista consolidada de todas tus tiendas y oportunidades de mejora'
                : `Análisis detallado de ${selectedStore?.name || 'tienda seleccionada'}`
              }
            </p>
          </div>
          <StoreSelector />
        </div>
      </div>

      {/* Key Metrics Section */}
      <Section>
        <AutoGrid>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-300">Food Cost Promedio</p>
                <p className="text-2xl font-bold">
                  {summaryData.avgFoodCost}%
                </p>
              </div>
              <div className="text-right">
                <Badge variant={summaryData.avgFoodCost > summaryData.target ? 'destructive' : 'default'}>
                  Meta: {summaryData.target}%
                </Badge>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-300">Ahorro Este Mes</p>
                <p className="text-2xl font-bold text-green-600">
                  ${summaryData.totalSavings.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-300">Alertas Activas</p>
                <p className="text-2xl font-bold text-orange-500">
                  {summaryData.alertsCount}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-300">Tiendas Monitoreadas</p>
                <p className="text-2xl font-bold">{summaryData.totalStores}</p>
              </div>
              <Store className="h-8 w-8 text-blue-500" />
            </div>
          </GlassCard>
        </AutoGrid>
      </Section>

      {/* Tiendas Destacadas Section */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Best Performing Store */}
          <GlassCard className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <TrendingUp className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Tu Mejor Tienda</h3>
              </div>
              <p className="text-sm text-zinc-400 mb-4">Desempeño destacado del período</p>
              
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{summaryData.bestStore.name}</h3>
                <Badge variant="default" className="bg-green-600">
                  {summaryData.bestStore.improvement}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-zinc-400">Food Cost</p>
                  <p className="text-2xl font-bold text-green-600">
                    {summaryData.bestStore.foodCost}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Ventas</p>
                  <p className="text-lg font-semibold">
                    ${summaryData.bestStore.revenue.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-lg">
                <p className="text-sm font-medium text-green-400">
                  ¡Excelente! Bajo la meta por 1.5 puntos
                </p>
                <p className="text-sm text-green-500/70">
                  Sigue aplicando las mismas prácticas operativas
                </p>
              </div>

              <Button 
                variant="outline" 
                className="w-full border-green-600 text-green-600 hover:bg-green-600/10"
                onClick={() => navigate(routes.store('plaza-norte'))}
              >
                Ver Detalles <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </GlassCard>

          {/* Worst Performing Store */}
          <GlassCard className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                <TrendingDown className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Tu Tienda con Mayor Oportunidad</h3>
              </div>
              <p className="text-sm text-zinc-400 mb-4">Requiere atención inmediata</p>
              
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{summaryData.worstStore.name}</h3>
                <Badge variant="destructive">
                  {summaryData.worstStore.decline}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-zinc-400">Food Cost</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {summaryData.worstStore.foodCost}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Ventas</p>
                  <p className="text-lg font-semibold">
                    ${summaryData.worstStore.revenue.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/20 p-3 rounded-lg">
                <p className="text-sm font-medium text-orange-400">
                  4.2 puntos sobre la meta - Oportunidad: $8,500/mes
                </p>
                <p className="text-sm text-orange-500/70">
                  Revisar porciones de lácteos y desperdicio
                </p>
              </div>

              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => navigate(routes.store('portal-centro'))}
              >
                Revisar Ahora <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </GlassCard>
        </div>
      </Section>

      {/* Potencial de Ahorro Section */}
      <Section>
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Potencial de Ahorro</h3>
          </div>
          <p className="text-sm text-zinc-400 mb-6">
            Si todas las tiendas alcanzan la meta de 30% food cost
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border border-[var(--card-border)] rounded-lg bg-green-500/5">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p className="text-3xl font-bold text-green-500">$15,200</p>
              <p className="text-sm text-zinc-400">Ahorro mensual estimado</p>
            </div>
            
            <div className="text-center p-6 border border-[var(--card-border)] rounded-lg bg-blue-500/5">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <p className="text-3xl font-bold text-blue-500">3.1%</p>
              <p className="text-sm text-zinc-400">Mejora promedio necesaria</p>
            </div>
            
            <div className="text-center p-6 border border-[var(--card-border)] rounded-lg bg-purple-500/5">
              <Target className="h-12 w-12 mx-auto mb-4 text-purple-500" />
              <p className="text-3xl font-bold text-purple-500">2 semanas</p>
              <p className="text-sm text-zinc-400">Tiempo estimado de implementación</p>
            </div>
          </div>
        </GlassCard>
      </Section>

      {/* Acciones Recomendadas Section */}
      <Section>
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-2">Acciones Recomendadas</h3>
          <p className="text-sm text-zinc-400 mb-6">
            Pasos prioritarios para mejorar tu rentabilidad
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div key={index} onClick={action.action}>
                  <GlassCard className="p-6 hover-raise cursor-pointer">
                    <div className="flex items-start gap-4">
                      <Icon className={`h-8 w-8 mt-1 ${action.color}`} />
                      <div>
                        <p className="font-medium mb-1">{action.title}</p>
                        <p className="text-sm text-zinc-400">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </Section>
    </div>
  );
};

export default ResumenPage;
