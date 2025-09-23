import { KPICard } from '@/components/KPICard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTenant } from '@/contexts/TenantContext';
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

export const Dashboard = () => {
  const { currentTenant } = useTenant();

  const kpis = [
    {
      title: 'Ventas Hoy',
      value: '$25,430',
      change: 12.5,
      changeType: 'increase' as const,
      icon: <DollarSign className="w-5 h-5" />,
      subtitle: 'vs. ayer'
    },
    {
      title: 'Food Cost %',
      value: '28.5%',
      change: -2.1,
      changeType: 'decrease' as const,
      icon: <ShoppingCart className="w-5 h-5" />,
      subtitle: 'Meta: <30%',
      variant: 'success' as const
    },
    {
      title: 'Merma %',
      value: '8.2%',
      change: 0.5,
      changeType: 'increase' as const,
      icon: <TrendingUp className="w-5 h-5" />,
      subtitle: 'Meta: <10%',
      variant: 'warning' as const
    },
    {
      title: 'Energía/Ticket',
      value: '$4.20',
      change: -1.8,
      changeType: 'decrease' as const,
      icon: <Zap className="w-5 h-5" />,
      subtitle: 'CFE del mes'
    }
  ];

  const alerts = [
    {
      id: 1,
      type: 'warning' as const,
      title: 'Food Cost Alto',
      description: 'Tienda Centro: 32.1% vs meta 30%',
      time: 'hace 2 horas'
    },
    {
      id: 2,
      type: 'success' as const,
      title: 'Inventario Completado',
      description: 'Tienda Sur: Conteo semanal realizado',
      time: 'hace 4 horas'
    },
    {
      id: 3,
      type: 'danger' as const,
      title: 'Merma Crítica',
      description: 'Tienda Norte: 15.2% en lácteos',
      time: 'hace 1 día'
    }
  ];

  const stores = [
    { name: 'Centro', revenue: '$8,420', foodCost: '29.2%', status: 'good' },
    { name: 'Norte', revenue: '$7,210', foodCost: '31.8%', status: 'warning' },
    { name: 'Sur', revenue: '$9,800', foodCost: '27.1%', status: 'good' }
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen operativo - {new Date().toLocaleDateString('es-MX', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Exportar P&L</Button>
          <Button>Ver Reportes</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-grid">
        {kpis.map((kpi, index) => (
          <KPICard
            key={index}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            changeType={kpi.changeType}
            icon={kpi.icon}
            subtitle={kpi.subtitle}
            variant={kpi.variant}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Store Performance */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Rendimiento por Tienda</h3>
            <Button variant="ghost" size="sm">
              Ver todo <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-4">
            {stores.map((store, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    store.status === 'good' ? 'bg-green-500' : 'bg-amber-500'
                  }`} />
                  <div>
                    <p className="font-medium">Tienda {store.name}</p>
                    <p className="text-sm text-muted-foreground">Food Cost: {store.foodCost}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{store.revenue}</p>
                  <p className="text-sm text-muted-foreground">hoy</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Alerts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Alertas Recientes</h3>
            <Badge variant="secondary">3</Badge>
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => {
              const getIcon = () => {
                switch (alert.type) {
                  case 'success':
                    return <CheckCircle2 className="w-4 h-4 text-green-600" />;
                  case 'warning':
                    return <AlertTriangle className="w-4 h-4 text-amber-600" />;
                  case 'danger':
                    return <AlertTriangle className="w-4 h-4 text-red-600" />;
                  default:
                    return <Clock className="w-4 h-4 text-blue-600" />;
                }
              };

              return (
                <div key={alert.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                  {getIcon()}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{alert.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{alert.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <Button variant="ghost" size="sm" className="w-full mt-4">
            Ver todas las alertas
          </Button>
        </Card>
      </div>
    </div>
  );
};