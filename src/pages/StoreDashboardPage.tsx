import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KPICard } from '@/components/dashboard/KPICard';
import { 
  ArrowLeft,
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle,
  Target,
  FileText,
  Clock,
  Settings,
  CheckCircle,
  XCircle,
  Info,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const StoreDashboardPage = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();

  // Mock data - in real app this would come from API based on storeId
  const storeData = {
    name: 'Portal Centro',
    id: storeId || 'portal-centro',
    currentMonth: {
      sales: 98000,
      foodCostPercent: 34.2,
      foodCostAmount: 33516,
      target: 30.0,
      monthlyCostImpact: -8500, // negative = losing money
      salesChange: -1.8
    },
    performance: [
      { day: 'Lun', sales: 14500, foodCost: 32.1, isOverTarget: false },
      { day: 'Mar', sales: 13200, foodCost: 35.4, isOverTarget: true },
      { day: 'Mié', sales: 15800, foodCost: 31.2, isOverTarget: false },
      { day: 'Jue', sales: 12900, foodCost: 36.8, isOverTarget: true },
      { day: 'Vie', sales: 16500, foodCost: 33.9, isOverTarget: true },
      { day: 'Sáb', sales: 18200, foodCost: 35.1, isOverTarget: true },
      { day: 'Dom', sales: 17100, foodCost: 32.7, isOverTarget: false }
    ],
    expenses: [
      { category: 'Lácteos', amount: 12500, percentage: 12.8, insight: 'Alto, revisar porciones', status: 'high' },
      { category: 'Harinas', amount: 8200, percentage: 8.4, insight: 'Normal', status: 'normal' },
      { category: 'Proteínas', amount: 7800, percentage: 8.0, insight: 'Dentro de rango', status: 'normal' },
      { category: 'Bebidas', amount: 3200, percentage: 3.3, insight: 'Bajo, oportunidad', status: 'low' },
      { category: 'Vegetales', amount: 1816, percentage: 1.9, insight: 'Revisar desperdicio', status: 'high' }
    ],
    alerts: [
      { id: 1, type: 'warning', message: 'Desperdicio de lácteos alto (+15% vs promedio)', action: 'Ver checklist' },
      { id: 2, type: 'danger', message: 'Ventas -1.8% vs mes anterior', action: 'Revisar estrategia' },
      { id: 3, type: 'info', message: 'Próxima revisión de inventario: Mañana', action: 'Programar' }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'danger': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="container mx-auto max-w-7xl py-6 space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/resumen')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Todas las tiendas
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="font-semibold">{storeData.name}</span>
      </div>

      {/* Hero Section - KPIs Principales */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">{storeData.name}</h1>
            <p className="text-lg text-muted-foreground">Dashboard operativo - Vista detallada</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold mb-1">
              {storeData.currentMonth.monthlyCostImpact < 0 ? (
                <span className="text-red-600">
                  Perdiendo ${Math.abs(storeData.currentMonth.monthlyCostImpact).toLocaleString()}/mes
                </span>
              ) : (
                <span className="text-green-600">
                  Ahorrando ${storeData.currentMonth.monthlyCostImpact.toLocaleString()}/mes
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {(storeData.currentMonth.foodCostPercent - storeData.currentMonth.target).toFixed(1)} puntos sobre meta
            </p>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPICard
            title="Ventas del Mes"
            value={storeData.currentMonth.sales}
            format="currency"
            change={storeData.currentMonth.salesChange}
            changeType="decrease"
            icon={<DollarSign className="h-4 w-4" />}
          />
          <KPICard
            title="Food Cost %"
            value={storeData.currentMonth.foodCostPercent}
            format="percentage"
            variant={storeData.currentMonth.foodCostPercent > storeData.currentMonth.target ? 'danger' : 'success'}
            icon={<Target className="h-4 w-4" />}
            subtitle={`Meta: ${storeData.currentMonth.target}%`}
          />
          <KPICard
            title="Food Cost MXN"
            value={storeData.currentMonth.foodCostAmount}
            format="currency"
            variant="warning"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <KPICard
            title="Diferencia vs Meta"
            value={`+${(storeData.currentMonth.foodCostPercent - storeData.currentMonth.target).toFixed(1)}`}
            format="percentage"
            variant="danger"
            icon={<AlertTriangle className="h-4 w-4" />}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Tendencias de Performance
            </CardTitle>
            <CardDescription>Ventas y Food Cost diario de la última semana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={storeData.performance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="sales" orientation="left" />
                  <YAxis yAxisId="foodCost" orientation="right" />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'sales' ? `$${value.toLocaleString()}` : `${value}%`,
                      name === 'sales' ? 'Ventas' : 'Food Cost %'
                    ]}
                  />
                  <Bar yAxisId="sales" dataKey="sales" fill="#10b981" opacity={0.6} />
                  <Line 
                    yAxisId="foodCost" 
                    type="monotone" 
                    dataKey="foodCost" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 6 }}
                  />
                  {/* Meta line */}
                  <Line 
                    yAxisId="foodCost" 
                    type="monotone" 
                    dataKey={() => storeData.currentMonth.target}
                    stroke="#6b7280" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Ventas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-2 bg-red-500 rounded"></div>
                <span>Food Cost %</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-gray-500 border-dashed"></div>
                <span>Meta (30%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Detalle de Gastos Operativos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Detalle de Gastos Operativos
            </CardTitle>
            <CardDescription>Desglose por categoría con insights accionables</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {/* Header */}
              <div className="grid grid-cols-4 gap-4 p-3 bg-muted/50 rounded-lg font-medium text-sm">
                <div>Rubro</div>
                <div className="text-right">Monto MXN</div>
                <div className="text-right">% sobre ventas</div>
                <div>Insight/Comentario</div>
              </div>
              
              {/* Rows */}
              {storeData.expenses.map((expense) => (
                <div key={expense.category} className="grid grid-cols-4 gap-4 p-3 border rounded-lg items-center hover:bg-muted/30 transition-colors">
                  <div className="font-medium">{expense.category}</div>
                  <div className="text-right font-mono">${expense.amount.toLocaleString()}</div>
                  <div className="text-right font-mono">{expense.percentage}%</div>
                  <div>
                    <Badge className={`text-xs ${getStatusColor(expense.status)}`}>
                      {expense.insight}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <div className="grid grid-cols-4 gap-4 p-3 bg-orange-50 border border-orange-200 rounded-lg font-semibold">
                <div>Total Food Cost</div>
                <div className="text-right">${storeData.currentMonth.foodCostAmount.toLocaleString()}</div>
                <div className="text-right">{storeData.currentMonth.foodCostPercent}%</div>
                <div className="text-orange-600">4.2% sobre meta</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alertas de la Tienda */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas Activas
            </CardTitle>
            <CardDescription>Requieren atención inmediata</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {storeData.alerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-tight">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="w-full text-xs">
                    {alert.action}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Acciones Rápidas - {storeData.name}
          </CardTitle>
          <CardDescription>Herramientas específicas para esta tienda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-6 text-left"
              onClick={() => navigate('/pnl-reports')}
            >
              <div className="flex items-start gap-4">
                <FileText className="h-8 w-8 mt-1 text-green-500" />
                <div>
                  <p className="font-medium mb-1">Generar P&L</p>
                  <p className="text-sm text-muted-foreground">
                    Reporte financiero de esta tienda
                  </p>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-6 text-left"
              onClick={() => navigate('/food-cost-analysis')}
            >
              <div className="flex items-start gap-4">
                <BarChart3 className="h-8 w-8 mt-1 text-blue-500" />
                <div>
                  <p className="font-medium mb-1">Ver Histórico</p>
                  <p className="text-sm text-muted-foreground">
                    Tendencias y comparativas
                  </p>
                </div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-6 text-left"
              onClick={() => navigate('/alertas')}
            >
              <div className="flex items-start gap-4">
                <Clock className="h-8 w-8 mt-1 text-orange-500" />
                <div>
                  <p className="font-medium mb-1">Configurar Alertas</p>
                  <p className="text-sm text-muted-foreground">
                    Personalizar notificaciones
                  </p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreDashboardPage;