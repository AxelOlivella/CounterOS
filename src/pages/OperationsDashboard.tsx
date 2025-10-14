import { StatCard } from "@/components/dashboard/StatCard";
import { StoreHeatmap } from "@/components/dashboard/StoreHeatmap";
import { StoreAlertTable } from "@/components/dashboard/StoreAlertTable";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/ui/states/EmptyState";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/ui/GlassCard";
import AutoGrid from "@/components/ui/AutoGrid";
import Section from "@/components/ui/Section";
import { Clock, AlertTriangle, Warehouse, Settings, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import KpiSkeleton from "@/components/ui/KpiSkeleton";
import ChartSkeleton from "@/components/ui/ChartSkeleton";

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

  // Estado de México (60 tiendas distribuidas) - better distribution
  ...Array.from({ length: 60 }, (_, i) => {
    // Distribuir más ampliamente en el área metropolitana
    const baseRegions = [
      { lat: 19.5, lng: -99.1, name: "Estado de México Norte" },
      { lat: 19.3, lng: -99.1, name: "Estado de México Sur" },
      { lat: 19.4, lng: -99.0, name: "Estado de México Este" },
      { lat: 19.4, lng: -99.3, name: "Estado de México Oeste" },
    ];
    const region = baseRegions[i % 4];
    const lat = region.lat + (Math.random() - 0.5) * 0.3;
    const lng = region.lng + (Math.random() - 0.5) * 0.3;
    const fc = 26 + Math.random() * 12;
    return {
      id: 100 + i,
      name: `Tienda ${100 + i}`,
      lat: Number(lat.toFixed(4)),
      lng: Number(lng.toFixed(4)),
      fc: Number(fc.toFixed(1)),
      status: (fc > 32 ? "critical" : fc > 29 ? "warning" : "ok") as "critical" | "warning" | "ok",
      location: region.name,
    };
  }),
];

export default function OperationsDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const currentTime = new Date().toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  // Simulating loading/error states for demo
  const hasData = mockStoresGeo.length > 0;

  const foodCostDelta = mockData.foodCostAvg - mockData.foodCostTarget;
  const totalAlerts = mockData.alerts.critical + mockData.alerts.warning;
  const storesOKPercentage = Math.round(
    (mockData.storesOK / mockData.totalStores) * 100
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Operations Overview
            </h1>
            <p className="text-sm text-gray-500 mt-1">Cargando datos...</p>
          </div>
        </div>
        <KpiSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header with action buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-slide-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Operations Overview - {mockData.totalStores} Tiendas
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <Clock className="h-4 w-4" />
            <span>Última actualización: Hoy {currentTime}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" disabled>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Exportación de reportes disponible próximamente</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" disabled>
                <Settings className="h-4 w-4 mr-2" />
                Config
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Configuración de dashboard en desarrollo</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Empty State Example (hidden in normal operation) */}
      {!hasData && (
        <EmptyState
          icon={<Warehouse className="h-12 w-12 text-muted-foreground" />}
          title="No hay tiendas configuradas"
          description="Para comenzar a usar el dashboard de operaciones, necesitas configurar al menos una tienda en tu cuenta."
          action={{
            label: "Ir a Tiendas",
            onClick: () => navigate('/tiendas'),
            variant: 'default'
          }}
        />
      )}

      {/* 4 Hero Stats Cards */}
      {hasData && (
        <>
          <Section>
            <AutoGrid>
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
            </AutoGrid>
          </Section>

          {/* Store Heatmap - Geographic View */}
          <Section>
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold mb-2">Food Cost por Tienda (Vista Geográfica)</h2>
              <p className="text-sm text-zinc-400 mb-4">Mapa interactivo de tus {mockData.totalStores} tiendas</p>
              <StoreHeatmap stores={mockStoresGeo} />
            </GlassCard>
          </Section>

          {/* Store Alerts Table */}
          <Section>
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg font-semibold">Tiendas que Requieren Atención</h2>
              </div>
              <p className="text-sm text-zinc-400 mb-6">Ordenadas por impacto potencial en rentabilidad</p>
              <StoreAlertTable
                stores={mockStores}
                limit={7}
                onViewAll={() => navigate('/tiendas')}
                onAssign={() => {
                  // Disabled - feature in development
                }}
              />
            </GlassCard>
          </Section>
        </>
      )}
    </div>
  );
}
