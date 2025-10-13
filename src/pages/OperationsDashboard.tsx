import { StatCard } from "@/components/dashboard/StatCard";
import { StoreHeatmap } from "@/components/dashboard/StoreHeatmap";
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

// Mock geographic data - 100 stores with coordinates
const mockStoresGeo = [
  // CDMX Norte (10 tiendas)
  { id: 47, name: "Polanco", lat: 19.433, lng: -99.195, fc: 36.2, status: "critical" as const, location: "CDMX Norte" },
  { id: 52, name: "Satélite", lat: 19.508, lng: -99.234, fc: 30.5, status: "warning" as const, location: "CDMX Norte" },
  { id: 63, name: "Lindavista", lat: 19.488, lng: -99.127, fc: 28.2, status: "ok" as const, location: "CDMX Norte" },
  { id: 71, name: "Vallejo", lat: 19.465, lng: -99.154, fc: 27.8, status: "ok" as const, location: "CDMX Norte" },
  { id: 83, name: "Azcapotzalco", lat: 19.490, lng: -99.186, fc: 29.3, status: "ok" as const, location: "CDMX Norte" },
  { id: 88, name: "Tacuba", lat: 19.459, lng: -99.187, fc: 31.2, status: "warning" as const, location: "CDMX Norte" },
  { id: 92, name: "Popotla", lat: 19.452, lng: -99.168, fc: 28.9, status: "ok" as const, location: "CDMX Norte" },
  { id: 94, name: "Refinería", lat: 19.489, lng: -99.198, fc: 27.3, status: "ok" as const, location: "CDMX Norte" },
  { id: 96, name: "Tacubaya", lat: 19.402, lng: -99.187, fc: 30.8, status: "warning" as const, location: "CDMX Norte" },
  { id: 98, name: "Anzures", lat: 19.430, lng: -99.182, fc: 28.5, status: "ok" as const, location: "CDMX Norte" },
  
  // CDMX Sur (10 tiendas) - CLUSTER PROBLEMÁTICO
  { id: 82, name: "Coyoacán", lat: 19.350, lng: -99.162, fc: 35.8, status: "critical" as const, location: "CDMX Sur" },
  { id: 12, name: "Narvarte", lat: 19.397, lng: -99.149, fc: 31.8, status: "warning" as const, location: "CDMX Sur" },
  { id: 41, name: "Tlalpan", lat: 19.290, lng: -99.166, fc: 33.2, status: "critical" as const, location: "CDMX Sur" },
  { id: 67, name: "Del Valle", lat: 19.377, lng: -99.163, fc: 34.1, status: "critical" as const, location: "CDMX Sur" },
  { id: 73, name: "Xochimilco", lat: 19.257, lng: -99.103, fc: 32.9, status: "warning" as const, location: "CDMX Sur" },
  { id: 76, name: "Taxqueña", lat: 19.337, lng: -99.187, fc: 33.8, status: "critical" as const, location: "CDMX Sur" },
  { id: 79, name: "Pedregal", lat: 19.313, lng: -99.200, fc: 32.1, status: "warning" as const, location: "CDMX Sur" },
  { id: 85, name: "Coapa", lat: 19.295, lng: -99.138, fc: 34.5, status: "critical" as const, location: "CDMX Sur" },
  { id: 89, name: "San Ángel", lat: 19.348, lng: -99.191, fc: 30.9, status: "warning" as const, location: "CDMX Sur" },
  { id: 93, name: "Culhuacán", lat: 19.332, lng: -99.106, fc: 33.4, status: "critical" as const, location: "CDMX Sur" },
  
  // CDMX Centro (10 tiendas)
  { id: 15, name: "Roma", lat: 19.413, lng: -99.163, fc: 34.9, status: "critical" as const, location: "CDMX Centro" },
  { id: 5, name: "Condesa", lat: 19.410, lng: -99.172, fc: 32.1, status: "warning" as const, location: "CDMX Centro" },
  { id: 91, name: "Insurgentes", lat: 19.421, lng: -99.162, fc: 32.8, status: "warning" as const, location: "CDMX Centro" },
  { id: 33, name: "Doctores", lat: 19.421, lng: -99.143, fc: 29.1, status: "ok" as const, location: "CDMX Centro" },
  { id: 44, name: "Centro", lat: 19.432, lng: -99.133, fc: 28.7, status: "ok" as const, location: "CDMX Centro" },
  { id: 55, name: "Juárez", lat: 19.427, lng: -99.157, fc: 30.2, status: "warning" as const, location: "CDMX Centro" },
  { id: 61, name: "Cuauhtémoc", lat: 19.425, lng: -99.155, fc: 29.8, status: "ok" as const, location: "CDMX Centro" },
  { id: 68, name: "Obrera", lat: 19.417, lng: -99.144, fc: 28.3, status: "ok" as const, location: "CDMX Centro" },
  { id: 74, name: "Guerrero", lat: 19.445, lng: -99.145, fc: 31.5, status: "warning" as const, location: "CDMX Centro" },
  { id: 81, name: "Tabacalera", lat: 19.430, lng: -99.160, fc: 27.9, status: "ok" as const, location: "CDMX Centro" },
  
  // CDMX Oeste (10 tiendas)
  { id: 23, name: "Santa Fe", lat: 19.359, lng: -99.260, fc: 33.1, status: "critical" as const, location: "CDMX Oeste" },
  { id: 28, name: "Observatorio", lat: 19.401, lng: -99.203, fc: 30.6, status: "warning" as const, location: "CDMX Oeste" },
  { id: 34, name: "Las Águilas", lat: 19.339, lng: -99.220, fc: 29.4, status: "ok" as const, location: "CDMX Oeste" },
  { id: 39, name: "Mixcoac", lat: 19.376, lng: -99.188, fc: 28.8, status: "ok" as const, location: "CDMX Oeste" },
  { id: 46, name: "Tarango", lat: 19.315, lng: -99.235, fc: 31.9, status: "warning" as const, location: "CDMX Oeste" },
  { id: 51, name: "Olivar", lat: 19.357, lng: -99.198, fc: 29.7, status: "ok" as const, location: "CDMX Oeste" },
  { id: 58, name: "Tizapán", lat: 19.352, lng: -99.185, fc: 28.1, status: "ok" as const, location: "CDMX Oeste" },
  { id: 64, name: "Lomas", lat: 19.426, lng: -99.244, fc: 27.5, status: "ok" as const, location: "CDMX Oeste" },
  { id: 69, name: "Bosques", lat: 19.405, lng: -99.238, fc: 32.3, status: "warning" as const, location: "CDMX Oeste" },
  { id: 77, name: "Interlomas", lat: 19.391, lng: -99.268, fc: 30.1, status: "warning" as const, location: "CDMX Oeste" },

  // Estado de México (60 tiendas distribuidas) - random pattern with regions
  ...Array.from({ length: 60 }, (_, i) => {
    const lat = 19.4 + (Math.random() - 0.5) * 0.8;
    const lng = -99.15 + (Math.random() - 0.5) * 0.6;
    const fc = 26 + Math.random() * 12;
    const regions = ["Estado de México Norte", "Estado de México Sur", "Estado de México Este", "Estado de México Oeste"];
    return {
      id: 100 + i,
      name: `Tienda ${100 + i}`,
      lat,
      lng,
      fc: Number(fc.toFixed(1)),
      status: (fc > 32 ? "critical" : fc > 29 ? "warning" : "ok") as "critical" | "warning" | "ok",
      location: regions[i % 4],
    };
  }),
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

      {/* Store Heatmap - Geographic View */}
      <StoreHeatmap stores={mockStoresGeo} />

      {/* Store Alerts Table */}
      <StoreAlertTable
        stores={mockStores}
        limit={7}
        onViewAll={() => {
          console.log("Ver todas las tiendas");
          // TODO Phase 3: expand table or navigate to stores page
        }}
        onAssign={() => {
          console.log("Asignar acciones");
          // TODO Phase 3: open assignment modal
        }}
      />
    </div>
  );
}
