import { StatCard } from "@/components/dashboard/StatCard";
import { Clock } from "lucide-react";

// Mock data - will be replaced with real data in Phase 2
const mockData = {
  foodCostAvg: 30.2,
  foodCostTarget: 28.5,
  alerts: { critical: 5, warning: 18 },
  storesOK: 77,
  totalStores: 100,
  variability: 4.3,
};

export default function OperationsDashboard() {
  const currentTime = new Date().toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const foodCostDelta = mockData.foodCostAvg - mockData.foodCostTarget;
  const totalAlerts = mockData.alerts.critical + mockData.alerts.warning;
  const storesOKPercentage = Math.round(
    (mockData.storesOK / mockData.totalStores) * 100
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 animate-slide-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Operations Overview - {mockData.totalStores} Tiendas
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <Clock className="h-4 w-4" />
            <span>Última actualización: Hoy {currentTime}</span>
          </div>
        </div>
      </div>

      {/* 4 Hero Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger">
        <StatCard
          title="FC Promedio"
          value={`${mockData.foodCostAvg}%`}
          delta={`+${foodCostDelta.toFixed(1)}pts`}
          status="warning"
          subtitle={`vs meta ${mockData.foodCostTarget}%`}
        />

        <StatCard
          title="Alertas"
          value={totalAlerts}
          subtitle={`🔴 ${mockData.alerts.critical} críticos, 🟡 ${mockData.alerts.warning} warnings`}
          status={mockData.alerts.critical > 0 ? "critical" : "warning"}
        />

        <StatCard
          title="Tiendas OK"
          value={`${mockData.storesOK}/${mockData.totalStores}`}
          subtitle={`✓ ${storesOKPercentage}% en rango`}
          status="success"
        />

        <StatCard
          title="Variabilidad"
          value={`±${mockData.variability}pts`}
          subtitle="Target: ±1.5pts"
          status="warning"
          delta="Muy alto"
        />
      </div>

      {/* Placeholder for Phase 2 */}
      <div className="bg-white rounded-lg shadow-sm p-12 text-center animate-fade-in">
        <div className="max-w-md mx-auto space-y-3">
          <div className="text-gray-400 text-lg font-medium">
            📊 Heatmap + Tabla de Tiendas
          </div>
          <div className="text-gray-500 text-sm">
            Fase 2: Vista detallada de todas las tiendas
          </div>
          <div className="flex justify-center gap-2 text-xs text-gray-400">
            <span>• Mapa de calor por FC</span>
            <span>• Drill-down por tienda</span>
            <span>• Filtros avanzados</span>
          </div>
        </div>
      </div>
    </div>
  );
}
