import { StatCard } from "@/components/dashboard/StatCard";
import { StoreHeatmap } from "@/components/dashboard/StoreHeatmap";
import { StoreAlertTable } from "@/components/dashboard/StoreAlertTable";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EmptyState } from "@/components/ui/states/EmptyState";
import { ErrorState } from "@/components/ui/states/ErrorState";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/ui/GlassCard";
import AutoGrid from "@/components/ui/AutoGrid";
import Section from "@/components/ui/Section";
import { Clock, AlertTriangle, Warehouse, Settings, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import KpiSkeleton from "@/components/ui/KpiSkeleton";
import ChartSkeleton from "@/components/ui/ChartSkeleton";
import { useOperationsDashboard } from "@/hooks/useOperationsDashboard";
import { useStoresGeo } from "@/hooks/useStoresGeo";

// This section removed - now using real data from hooks

// Geographic data now comes from useStoresGeo hook

export default function OperationsDashboard() {
  const navigate = useNavigate();
  const currentTime = new Date().toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Fetch real data from Supabase
  const { data: dashboardData, isLoading, error } = useOperationsDashboard();
  const { data: storesGeo, isLoading: isLoadingGeo } = useStoresGeo();

  const hasData = dashboardData && dashboardData.totalStores > 0;
  
  const foodCostDelta = hasData 
    ? dashboardData.foodCostAvg - dashboardData.foodCostTarget 
    : 0;
  const totalAlerts = hasData 
    ? dashboardData.alerts.critical + dashboardData.alerts.warning 
    : 0;
  const storesOKPercentage = hasData 
    ? Math.round((dashboardData.storesOK / dashboardData.totalStores) * 100)
    : 0;

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-6">
        <ErrorState
          title="Error al cargar Operations Dashboard"
          description="No se pudieron cargar los datos"
          error={error?.message}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Operations Overview
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Cargando datos...</p>
          </div>
        </div>
        <KpiSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header with action buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-slide-up">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Operations Overview - {dashboardData?.totalStores || 0} Tiendas
          </h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
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
                value={`${dashboardData?.foodCostAvg || 0}%`}
                delta={`${foodCostDelta >= 0 ? '+' : ''}${foodCostDelta.toFixed(1)}pts`}
                status={foodCostDelta > 1 ? "warning" : "success"}
                subtitle={`vs meta ${dashboardData?.foodCostTarget || 28.5}%`}
              />

              <StatCard
                title="Alertas"
                value={totalAlerts}
                subtitle={`🔴 ${dashboardData?.alerts.critical || 0} críticos, 🟡 ${dashboardData?.alerts.warning || 0} warnings`}
                status={dashboardData && dashboardData.alerts.critical > 0 ? "critical" : "warning"}
              />

              <StatCard
                title="Tiendas OK"
                value={`${dashboardData?.storesOK || 0}/${dashboardData?.totalStores || 0}`}
                subtitle={`✓ ${storesOKPercentage}% en rango`}
                status="success"
              />

              <StatCard
                title="Variabilidad"
                value={`±${dashboardData?.variability || 0}pts`}
                subtitle="Target: ±1.5pts"
                status={dashboardData && dashboardData.variability > 2 ? "warning" : "success"}
                delta={dashboardData && dashboardData.variability > 2 ? "Alto" : "Normal"}
              />
            </AutoGrid>
          </Section>

          {/* Store Heatmap - Geographic View */}
          <Section>
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold mb-2">Food Cost por Tienda (Vista Geográfica)</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Mapa interactivo de tus {dashboardData?.totalStores || 0} tiendas
              </p>
              {isLoadingGeo ? (
                <ChartSkeleton />
              ) : storesGeo && storesGeo.length > 0 ? (
                <StoreHeatmap stores={storesGeo.map(s => ({ ...s, id: parseInt(s.id) || 0 }))} />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No hay datos geográficos disponibles
                </p>
              )}
            </GlassCard>
          </Section>

          {/* Store Alerts Table */}
          <Section>
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-[var(--warn)]" />
                <h2 className="text-lg font-semibold">Tiendas que Requieren Atención</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6">Ordenadas por impacto potencial en rentabilidad</p>
              {dashboardData && dashboardData.criticalStores.length > 0 ? (
                <StoreAlertTable
                  stores={dashboardData.criticalStores}
                  limit={7}
                  onViewAll={() => navigate('/tiendas')}
                  onAssign={() => {
                    // Disabled - feature in development
                  }}
                />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  ¡Excelente! No hay tiendas que requieran atención inmediata
                </p>
              )}
            </GlassCard>
          </Section>
        </>
      )}
    </div>
  );
}
