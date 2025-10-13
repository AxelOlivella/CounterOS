import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, TrendingUp, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";

// Mock data - will be replaced with real Supabase data
const getMockStoreDetail = (id: string) => {
  const storeId = parseInt(id);
  
  // Find from mock data or generate
  return {
    id: storeId,
    name: `Tienda ${storeId}`,
    location: "CDMX Centro",
    address: "Av. Insurgentes Sur 1234, Col. Roma",
    fc: 32.5,
    fcTarget: 28.5,
    delta: 4.0,
    revenue: 450000,
    cogs: 146250,
    manager: "Juan Pérez",
    phone: "+52 55 1234 5678",
    status: "warning" as const,
  };
};

export default function StoreDetailPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

  if (!storeId) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Tienda no encontrada
        </div>
      </div>
    );
  }

  const store = getMockStoreDetail(storeId);

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard/operations")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Operations
        </Button>
      </div>

      {/* Store Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 font-bold text-lg">
                #{store.id}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {store.name}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>{store.location}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">{store.address}</p>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">Gerente</div>
            <div className="font-medium text-gray-900">{store.manager}</div>
            <div className="text-sm text-gray-500">{store.phone}</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Food Cost"
          value={`${store.fc}%`}
          delta={`+${store.delta.toFixed(1)}pts`}
          status={store.status}
          subtitle={`vs meta ${store.fcTarget}%`}
        />

        <StatCard
          title="Revenue Mensual"
          value={`$${(store.revenue / 1000).toFixed(0)}K`}
          subtitle="Último mes"
          status="neutral"
        />

        <StatCard
          title="COGS Mensual"
          value={`$${(store.cogs / 1000).toFixed(0)}K`}
          subtitle={`${((store.cogs / store.revenue) * 100).toFixed(1)}% de revenue`}
          status="neutral"
        />

        <StatCard
          title="Impact Anual"
          value={`$${((store.delta / 100) * store.revenue * 12 / 1000).toFixed(0)}K`}
          subtitle="Si se reduce a meta"
          status="warning"
        />
      </div>

      {/* Placeholder for detailed analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
        <div className="max-w-md mx-auto space-y-3">
          <div className="text-gray-400 text-lg font-medium">
            📊 Análisis Detallado (Fase 4)
          </div>
          <div className="text-gray-500 text-sm">
            Drill-down por categoría, ingrediente, y período
          </div>
          <div className="flex justify-center gap-2 text-xs text-gray-400">
            <span>• Breakdown por categoría</span>
            <span>• Trending histórico</span>
            <span>• Comparación vs peers</span>
          </div>
        </div>
      </div>
    </div>
  );
}
