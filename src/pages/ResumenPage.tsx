import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StoreSelector } from '@/components/ui/store-selector';
import { useStoreSelection } from '@/hooks/useStoreSelection';
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

  // Mock data - in real app this would come from API
  const summaryData = {
    bestStore: {
      name: 'Plaza Norte',
      foodCost: 28.5,
      revenue: 125000,
      improvement: '+2.1%'
    },
    worstStore: {
      name: 'Portal Centro',
      foodCost: 34.2,
      revenue: 98000,
      decline: '-1.8%'
    },
    totalSavings: 52300,
    avgFoodCost: 31.2,
    target: 30.0,
    alertsCount: 3
  };

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
      action: () => navigate('/datos')
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Food Cost Promedio</p>
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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ahorro Este Mes</p>
                <p className="text-2xl font-bold text-green-600">
                  ${summaryData.totalSavings.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Alertas Activas</p>
                <p className="text-2xl font-bold text-orange-500">
                  {summaryData.alertsCount}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tiendas Monitoreadas</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <Store className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Best Performing Store */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-5 w-5" />
              Tu Mejor Tienda
            </CardTitle>
            <CardDescription>Desempeño destacado del período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{summaryData.bestStore.name}</h3>
                <Badge variant="default" className="bg-green-600">
                  {summaryData.bestStore.improvement}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Food Cost</p>
                  <p className="text-2xl font-bold text-green-600">
                    {summaryData.bestStore.foodCost}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ventas</p>
                  <p className="text-lg font-semibold">
                    ${summaryData.bestStore.revenue.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  ¡Excelente! Bajo la meta por 1.5 puntos
                </p>
                <p className="text-sm text-green-600">
                  Sigue aplicando las mismas prácticas operativas
                </p>
              </div>

              <Button variant="outline" className="w-full">
                Ver Detalles <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Worst Performing Store */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <TrendingDown className="h-5 w-5" />
              Tu Tienda con Mayor Oportunidad
            </CardTitle>
            <CardDescription>Requiere atención inmediata</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{summaryData.worstStore.name}</h3>
                <Badge variant="destructive">
                  {summaryData.worstStore.decline}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Food Cost</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {summaryData.worstStore.foodCost}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ventas</p>
                  <p className="text-lg font-semibold">
                    ${summaryData.worstStore.revenue.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                <p className="text-sm font-medium text-orange-800">
                  4.2 puntos sobre la meta - Oportunidad: $8,500/mes
                </p>
                <p className="text-sm text-orange-600">
                  Revisar porciones de lácteos y desperdicio
                </p>
              </div>

              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={() => navigate('/tiendas/portal-centro')}
              >
                Revisar Ahora <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Potential */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Potencial de Ahorro
          </CardTitle>
          <CardDescription>
            Si todas las tiendas alcanzan la meta de 30% food cost
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border rounded-lg bg-gradient-to-br from-green-50 to-green-100">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <p className="text-3xl font-bold text-green-600">$15,200</p>
              <p className="text-sm text-muted-foreground">Ahorro mensual estimado</p>
            </div>
            
            <div className="text-center p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <p className="text-3xl font-bold text-blue-600">3.1%</p>
              <p className="text-sm text-muted-foreground">Mejora promedio necesaria</p>
            </div>
            
            <div className="text-center p-6 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
              <Target className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <p className="text-3xl font-bold text-purple-600">2 semanas</p>
              <p className="text-sm text-muted-foreground">Tiempo estimado de implementación</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Recomendadas</CardTitle>
          <CardDescription>
            Pasos prioritarios para mejorar tu rentabilidad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-6 text-left"
                  onClick={action.action}
                >
                  <div className="flex items-start gap-4">
                    <Icon className={`h-8 w-8 mt-1 ${action.color}`} />
                    <div>
                      <p className="font-medium mb-1">{action.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumenPage;