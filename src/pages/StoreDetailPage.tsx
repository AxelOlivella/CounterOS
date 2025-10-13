import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { TrendingChart } from "@/components/dashboard/TrendingChart";

// Mock data for store #47 (Polanco)
const getMockStoreDetail = (id: string) => {
  const storeId = parseInt(id);
  
  // Special detailed data for store #47, generic for others
  if (storeId === 47) {
    return {
      id: 47,
      name: "Polanco",
      location: "CDMX Norte",
      address: "Av. Presidente Masaryk 1234, Polanco",
      manager: "María López",
      managerTenure: "3 meses",
      phone: "+52 55 1234 5678",
      foodCost: {
        current: 36.2,
        target: 28.5,
        delta: 8.0,
        deltaVsTop10: 9.0,
      },
      trending: {
        weeks: 12,
        data: [
          { week: 1, fc: 28.5 },
          { week: 2, fc: 29.1 },
          { week: 3, fc: 29.8 },
          { week: 4, fc: 30.5 },
          { week: 5, fc: 31.2 },
          { week: 6, fc: 31.8 },
          { week: 7, fc: 32.5 },
          { week: 8, fc: 33.2 },
          { week: 9, fc: 34.1 },
          { week: 10, fc: 34.8 },
          { week: 11, fc: 35.5 },
          { week: 12, fc: 36.2 },
        ],
        status: "up-critical" as const,
        message: "Empeorando consistentemente 12 semanas (+8pts desde inicio)",
      },
      breakdown: {
        categories: [
          { name: "Lácteos", actual: 10.2, target: 7.0, delta: 3.2, impact: 38400, status: "critical" as const },
          { name: "Proteínas", actual: 13.1, target: 12.0, delta: 1.1, impact: 13200, status: "warning" as const },
          { name: "Vegetales", actual: 4.8, target: 4.5, delta: 0.3, impact: 3600, status: "ok" as const },
          { name: "Secos", actual: 3.1, target: 3.0, delta: 0.1, impact: 1200, status: "ok" as const },
          { name: "Bebidas", actual: 2.0, target: 2.0, delta: 0, impact: 0, status: "ok" as const },
          { name: "Condimentos", actual: 1.0, target: 1.0, delta: 0, impact: 0, status: "ok" as const },
          { name: "Otros", actual: 2.0, target: 2.0, delta: 0, impact: 0, status: "ok" as const },
        ],
        primaryIssue: "Lácteos (+3.2pts = $38K/año)",
      },
      rootCause: {
        category: "Lácteos",
        sku: "Queso manchego",
        problem: "Porciones inconsistentes",
        details: [
          { label: "Gasto actual", value: "$4,200/mes", status: "critical" as const },
          { label: "Target", value: "$3,000/mes", status: "neutral" as const },
          { label: "Variance", value: "+$1,200 (40%)", status: "critical" as const },
        ],
        analysis: [
          {
            type: "portions",
            label: "Porciones",
            actual: "180g",
            target: "140g",
            delta: "+28%",
            status: "critical" as const,
          },
          {
            type: "price",
            label: "Precio proveedor",
            actual: "Mismo que otras tiendas",
            status: "ok" as const,
          },
          {
            type: "waste",
            label: "Merma",
            actual: "3% (normal)",
            status: "ok" as const,
          },
        ],
        conclusion: "Porciones inconsistentes (staff no usa medidores)",
        context: "Gerente María López tiene 3 meses en puesto. Posible falta de training.",
      },
      suggestedAction: {
        title: "Re-entrenar en porciones estándar",
        steps: [
          "1. Training María López en uso de medidores (2 horas)",
          "2. Mystery shop 3x/semana por 2 semanas (validar compliance)",
          "3. Benchmarking diario vs Tienda #12 Narvarte (top performer lácteos)",
        ],
        expectedSavings: 38400,
        timeframe: "90 días",
      },
    };
  }
  
  // Generic data for other stores
  return {
    id: storeId,
    name: `Tienda ${storeId}`,
    location: "CDMX Centro",
    address: "Av. Insurgentes Sur 1234, Col. Roma",
    manager: "Juan Pérez",
    managerTenure: "6 meses",
    phone: "+52 55 1234 5678",
    foodCost: {
      current: 32.5,
      target: 28.5,
      delta: 4.0,
      deltaVsTop10: 5.0,
    },
    trending: {
      weeks: 12,
      data: Array.from({ length: 12 }, (_, i) => ({
        week: i + 1,
        fc: 28.5 + Math.random() * 6,
      })),
      status: "up" as const,
      message: "Variabilidad moderada en últimas 12 semanas",
    },
    breakdown: {
      categories: [
        { name: "Proteínas", actual: 12.5, target: 12.0, delta: 0.5, impact: 6000, status: "warning" as const },
        { name: "Lácteos", actual: 7.2, target: 7.0, delta: 0.2, impact: 2400, status: "ok" as const },
        { name: "Vegetales", actual: 4.8, target: 4.5, delta: 0.3, impact: 3600, status: "ok" as const },
        { name: "Secos", actual: 3.0, target: 3.0, delta: 0, impact: 0, status: "ok" as const },
        { name: "Bebidas", actual: 2.0, target: 2.0, delta: 0, impact: 0, status: "ok" as const },
        { name: "Condimentos", actual: 1.0, target: 1.0, delta: 0, impact: 0, status: "ok" as const },
        { name: "Otros", actual: 2.0, target: 2.0, delta: 0, impact: 0, status: "ok" as const },
      ],
      primaryIssue: "Proteínas (+0.5pts = $6K/año)",
    },
    rootCause: {
      category: "Proteínas",
      sku: "Pollo",
      problem: "Variabilidad en porciones",
      details: [
        { label: "Gasto actual", value: "$3,200/mes", status: "warning" as const },
        { label: "Target", value: "$3,000/mes", status: "neutral" as const },
        { label: "Variance", value: "+$200 (7%)", status: "warning" as const },
      ],
      analysis: [
        {
          type: "portions",
          label: "Porciones",
          actual: "155g",
          target: "150g",
          delta: "+3%",
          status: "warning" as const,
        },
        {
          type: "price",
          label: "Precio proveedor",
          actual: "Mismo que otras tiendas",
          status: "ok" as const,
        },
        {
          type: "waste",
          label: "Merma",
          actual: "2% (normal)",
          status: "ok" as const,
        },
      ],
      conclusion: "Ligera inconsistencia en porciones",
      context: "Gerente tiene experiencia. Posible necesidad de refuerzo en training.",
    },
    suggestedAction: {
      title: "Reforzar control de porciones",
      steps: [
        "1. Refresher training en medidores (1 hora)",
        "2. Auditoría semanal por 1 mes",
        "3. Comparar con top performers regionales",
      ],
      expectedSavings: 6000,
      timeframe: "60 días",
    },
  };
};

export default function StoreDetailPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

  if (!storeId) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Tienda no encontrada</div>
      </div>
    );
  }

  const store = getMockStoreDetail(storeId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Link
                to="/dashboard/operations"
                className="hover:text-gray-700 transition-colors"
              >
                Operations
              </Link>
              <span>/</span>
              <span className="text-gray-900">Tienda #{store.id}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900">
              Tienda #{store.id} - {store.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {store.location} • Gerente: {store.manager} ({store.managerTenure})
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => console.log("Export report")}
            >
              Exportar reporte
            </Button>
            <Button
              size="sm"
              onClick={() => console.log("Assign action")}
            >
              Asignar acción
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="px-6 py-6 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Food Cost"
            value={`${store.foodCost.current}%`}
            delta={`+${store.foodCost.delta.toFixed(1)}pts`}
            status="critical"
            subtitle={`vs meta ${store.foodCost.target}%`}
          />

          <StatCard
            title="Δ vs Meta"
            value={`+${store.foodCost.delta.toFixed(1)}pts`}
            status="critical"
            subtitle="🔴 Muy alto"
          />

          <StatCard
            title="Δ vs Top 10"
            value={`+${store.foodCost.deltaVsTop10.toFixed(1)}pts`}
            status="critical"
            subtitle="🔴 Muy alto"
          />

          <StatCard
            title="Trending"
            value="↑↑↑"
            status="critical"
            subtitle="🔴 Empeorando"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 space-y-6">
        {/* Trending Chart */}
        <TrendingChart
          data={store.trending.data}
          target={store.foodCost.target}
          title="Trending (últimas 12 semanas)"
          message={store.trending.message}
        />

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Breakdown por Categoría
            </h2>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Ver todas →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Δ
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Impact/año
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {store.breakdown.categories.map((cat) => (
                  <tr key={cat.name} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {cat.name}
                    </td>
                    <td className="px-4 py-4 text-sm">{cat.actual.toFixed(1)}%</td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {cat.target.toFixed(1)}%
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span
                        className={
                          cat.status === "critical"
                            ? "text-red-600 font-semibold"
                            : cat.status === "warning"
                            ? "text-yellow-600"
                            : "text-green-600"
                        }
                      >
                        {cat.delta > 0
                          ? `+${cat.delta.toFixed(1)}pts`
                          : cat.delta === 0
                          ? "0pts"
                          : `${cat.delta.toFixed(1)}pts`}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      ${(cat.impact / 1000).toFixed(0)}K
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <span className="flex items-center gap-2">
                        {cat.status === "critical"
                          ? "🔴 Crítico"
                          : cat.status === "warning"
                          ? "🟡 Warning"
                          : "🟢 OK"}
                        {cat.status === "critical" && (
                          <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                            Drill →
                          </button>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Problema principal:</strong> {store.breakdown.primaryIssue}
            </p>
          </div>
        </div>

        {/* Root Cause Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🔴 Root Cause Analysis: {store.rootCause.category}
          </h2>

          {/* SKU problemático */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              SKU problemático: {store.rootCause.sku}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {store.rootCause.details.map((detail) => (
                <div key={detail.label} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">{detail.label}</p>
                  <p
                    className={`text-lg font-semibold ${
                      detail.status === "critical"
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    {detail.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Análisis */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Causa probable (basado en data):
            </h3>
            <div className="space-y-3">
              {store.rootCause.analysis.map((item) => (
                <div
                  key={item.type}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {item.status === "critical" ? "⚠️" : item.status === "ok" ? "✓" : "○"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {item.label}:
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {item.actual}
                      {item.target && ` (target: ${item.target})`}
                      {item.delta && (
                        <span
                          className={
                            item.status === "critical"
                              ? "text-red-600 font-semibold ml-2"
                              : ""
                          }
                        >
                          {" "}
                          = {item.delta}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {item.status === "critical"
                      ? "🔴"
                      : item.status === "ok"
                      ? "✅"
                      : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Conclusión */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
            <p className="text-sm font-medium text-gray-900 mb-2">
              → Problema: {store.rootCause.conclusion}
            </p>
            <p className="text-sm text-gray-600">{store.rootCause.context}</p>
          </div>

          {/* Acción sugerida */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg">
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              💡 ACCIÓN SUGERIDA:
            </h3>
            <h4 className="text-lg font-bold text-blue-900 mb-4">
              {store.suggestedAction.title}
            </h4>

            <div className="space-y-2 mb-4">
              {store.suggestedAction.steps.map((step, i) => (
                <p key={i} className="text-sm text-gray-700">
                  {step}
                </p>
              ))}
            </div>

            <div className="pt-4 border-t border-blue-200">
              <p className="text-sm text-gray-700">
                <strong>Savings esperado si corriges:</strong>{" "}
                ${(store.suggestedAction.expectedSavings / 1000).toFixed(0)}K/año
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Timeframe: {store.suggestedAction.timeframe}
              </p>
            </div>

            <Button
              className="mt-4 w-full"
              size="lg"
              onClick={() => console.log("Assign action to Regional Centro")}
            >
              Asignar acción a Regional Centro →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
