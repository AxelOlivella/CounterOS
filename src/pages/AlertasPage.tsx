import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { StoreSelector } from '@/components/ui/store-selector';
import { useStoreSelection } from '@/hooks/useStoreSelection';
import { 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Bell,
  Settings,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

const AlertasPage = () => {
  const { selectedStore, isConsolidatedView } = useStoreSelection();
  const [alertRules, setAlertRules] = useState({
    foodCostHigh: {
      enabled: true,
      threshold: 30,
      days: 2,
      description: 'Food cost > 30% por 2 días seguidos'
    },
    recipeVariance: {
      enabled: true,
      threshold: 10,
      description: 'Desviación de receta > 10%'
    },
    energyCost: {
      enabled: false,
      threshold: 90,
      description: 'Energía/ticket fuera de rango (percentil 90)'
    }
  });

  const [activeAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Food Cost Elevado',
      message: 'Portal Centro: 32.5% por 2 días consecutivos',
      timestamp: '2024-01-15 09:30',
      store: 'Portal Centro',
      impact: 'Alto',
      action: 'Revisar costos de lácteos y porciones'
    },
    {
      id: 2,
      type: 'info',
      title: 'Desviación de Receta',
      message: 'Yogurt Mango: +15% en consumo de base',
      timestamp: '2024-01-15 08:15',
      store: 'Portal Centro',
      impact: 'Medio',
      action: 'Verificar gramajes en preparación'
    }
  ]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'info':
        return <Bell className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-orange-200 bg-orange-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-green-200 bg-green-50';
    }
  };

  const updateAlertRule = (rule: string, field: string, value: any) => {
    setAlertRules(prev => ({
      ...prev,
      [rule]: {
        ...prev[rule as keyof typeof prev],
        [field]: value
      }
    }));
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-6xl py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Centro de Alertas
              </h1>
              <p className="text-muted-foreground">
                {isConsolidatedView 
                  ? 'Monitoreo automático de métricas clave que impactan tu rentabilidad'
                  : `Alertas específicas para ${selectedStore?.name || 'tienda seleccionada'}`
                }
              </p>
            </div>
            <StoreSelector />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Alerts */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alertas Activas
                  <Badge variant="destructive">2</Badge>
                </CardTitle>
                <CardDescription>
                  Situaciones que requieren tu atención inmediata
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeAlerts.map((alert) => (
                    <div key={alert.id} className={`p-4 border rounded-lg ${getAlertColor(alert.type)}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getAlertIcon(alert.type)}
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge variant="outline">
                            {alert.store}
                          </Badge>
                        </div>
                        <Badge variant={alert.impact === 'Alto' ? 'destructive' : 'secondary'}>
                          {alert.impact}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {alert.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {alert.timestamp}
                        </span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Ver Detalle
                          </Button>
                          <Button size="sm">
                            Marcar Revisado
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-3 bg-white/60 rounded border-l-4 border-l-primary">
                        <p className="text-sm font-medium text-primary">
                          Acción recomendada:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {alert.action}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Impact Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Impacto</CardTitle>
                <CardDescription>
                  Estimación del ahorro potencial al resolver las alertas activas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <p className="text-2xl font-bold text-red-600">$18,500</p>
                    <p className="text-sm text-muted-foreground">Pérdida mensual estimada</p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold text-green-600">2.5%</p>
                    <p className="text-sm text-muted-foreground">Reducción food cost posible</p>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <Zap className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold text-blue-600">3 días</p>
                    <p className="text-sm text-muted-foreground">Tiempo promedio resolución</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alert Configuration */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuración
                </CardTitle>
                <CardDescription>
                  Reglas automáticas de alertas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Food Cost Alert */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="foodcost-alert" className="font-medium">
                        Food Cost Elevado
                      </Label>
                      <Switch
                        id="foodcost-alert"
                        checked={alertRules.foodCostHigh.enabled}
                        onCheckedChange={(enabled) => updateAlertRule('foodCostHigh', 'enabled', enabled)}
                      />
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {alertRules.foodCostHigh.description}
                    </p>
                    
                    {alertRules.foodCostHigh.enabled && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Umbral (%)</Label>
                          <Input
                            type="number"
                            value={alertRules.foodCostHigh.threshold}
                            onChange={(e) => updateAlertRule('foodCostHigh', 'threshold', parseInt(e.target.value))}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Días</Label>
                          <Input
                            type="number"
                            value={alertRules.foodCostHigh.days}
                            onChange={(e) => updateAlertRule('foodCostHigh', 'days', parseInt(e.target.value))}
                            className="h-8"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recipe Variance Alert */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="recipe-alert" className="font-medium">
                        Desviación de Receta
                      </Label>
                      <Switch
                        id="recipe-alert"
                        checked={alertRules.recipeVariance.enabled}
                        onCheckedChange={(enabled) => updateAlertRule('recipeVariance', 'enabled', enabled)}
                      />
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {alertRules.recipeVariance.description}
                    </p>
                    
                    {alertRules.recipeVariance.enabled && (
                      <div>
                        <Label className="text-xs">Umbral (%)</Label>
                        <Input
                          type="number"
                          value={alertRules.recipeVariance.threshold}
                          onChange={(e) => updateAlertRule('recipeVariance', 'threshold', parseInt(e.target.value))}
                          className="h-8"
                        />
                      </div>
                    )}
                  </div>

                  {/* Energy Cost Alert */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="energy-alert" className="font-medium">
                        Costo Energético
                      </Label>
                      <Switch
                        id="energy-alert"
                        checked={alertRules.energyCost.enabled}
                        onCheckedChange={(enabled) => updateAlertRule('energyCost', 'enabled', enabled)}
                      />
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {alertRules.energyCost.description}
                    </p>
                    
                    {alertRules.energyCost.enabled && (
                      <div>
                        <Label className="text-xs">Percentil</Label>
                        <Input
                          type="number"
                          value={alertRules.energyCost.threshold}
                          onChange={(e) => updateAlertRule('energyCost', 'threshold', parseInt(e.target.value))}
                          className="h-8"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Button className="w-full mt-6">
                  Guardar Configuración
                </Button>
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Alertas este mes</span>
                    <Badge variant="outline">12</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tiempo resp. promedio</span>
                    <Badge variant="outline">2.5 días</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ahorro generado</span>
                    <Badge variant="default" className="bg-green-600">$45,200</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AlertasPage;