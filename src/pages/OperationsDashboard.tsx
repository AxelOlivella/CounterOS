import { StatCard } from "@/components/dashboard/StatCard";
import { StoreAlertTable } from "@/components/dashboard/StoreAlertTable";
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

// Mock stores data - sorted by impact (highest first)
const mockStores = [
  {
    id: 47,
    name: "Polanco",
    location: "CDMX Norte",
    foodCost: 36.2,
    delta: 8.0,
    target: 28.5,
    impact: 84000,
    trending: "up-critical" as const,
    status: "critical" as const,
  },
  {
    id: 82,
    name: "Coyoacán",
    location: "CDMX Sur",
    foodCost: 35.8,
    delta: 7.3,
    target: 28.5,
    impact: 78000,
    trending: "up-high" as const,
    status: "critical" as const,
  },
  {
    id: 15,
    name: "Roma",
    location: "CDMX Centro",
    foodCost: 34.9,
    delta: 6.4,
    target: 28.5,
    impact: 72000,
    trending: "up" as const,
    status: "critical" as const,
  },
  {
    id: 23,
    name: "Santa Fe",
    location: "CDMX Oeste",
    foodCost: 33.1,
    delta: 4.6,
    target: 28.5,
    impact: 60000,
    trending: "up" as const,
    status: "critical" as const,
  },
  {
    id: 91,
    name: "Insurgentes",
    location: "CDMX Centro",
    foodCost: 32.8,
    delta: 4.3,
    target: 28.5,
    impact: 48000,
    trending: "stable" as const,
    status: "warning" as const,
  },
  {
    id: 5,
    name: "Condesa",
    location: "CDMX Centro",
    foodCost: 32.1,
    delta: 3.6,
    target: 28.5,
    impact: 42000,
    trending: "stable" as const,
    status: "warning" as const,
  },
  {
    id: 12,
    name: "Narvarte",
    location: "CDMX Sur",
    foodCost: 31.8,
    delta: 3.3,
    target: 28.5,
    impact: 38000,
    trending: "down" as const,
    status: "warning" as const,
  },
];

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

      {/* Store Alerts Table */}
      <StoreAlertTable
        stores={mockStores}
        limit={7}
        onViewStore={(id) => {
          console.log("Ver tienda:", id);
          // TODO Phase 3: navigate to store detail
        }}
        onViewAll={() => {
          console.log("Ver todas las tiendas");
          // TODO Phase 3: expand table or navigate to stores page
        }}
        onAssign={() => {
          console.log("Asignar acciones");
          // TODO Phase 3: open assignment modal
        }}
      />

      {/* Placeholder for Phase 2B: Heatmap */}
      <div className="bg-white rounded-lg shadow-sm p-12 text-center animate-fade-in border border-gray-200">
        <div className="max-w-md mx-auto space-y-3">
          <div className="text-gray-400 text-lg font-medium">
            🗺️ Mapa de Calor (Fase 2B)
          </div>
          <div className="text-gray-500 text-sm">
            Vista geográfica de las 100 tiendas color-coded por FC
          </div>
          <div className="flex justify-center gap-2 text-xs text-gray-400">
            <span>• Mapa interactivo</span>
            <span>• Filtros por región</span>
            <span>• Drill-down visual</span>
          </div>
        </div>
      </div>
    </div>
  );
}
