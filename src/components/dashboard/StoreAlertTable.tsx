import { cn } from "@/lib/utils";

interface Store {
  id: number;
  name: string;
  location: string;
  foodCost: number;
  delta: number;
  target: number;
  impact: number;
  trending: "up-critical" | "up-high" | "up" | "stable" | "down";
  status: "critical" | "warning";
}

interface StoreAlertTableProps {
  stores: Store[];
  limit?: number;
  onViewStore?: (storeId: number) => void;
  onViewAll?: () => void;
  onAssign?: () => void;
}

export function StoreAlertTable({
  stores,
  limit = 7,
  onViewStore,
  onViewAll,
  onAssign,
}: StoreAlertTableProps) {
  const displayedStores = stores.slice(0, limit);
  const hasMore = stores.length > limit;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 animate-fade-in">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Tiendas Requieren Atención ({stores.length})
        </h2>
        <div className="flex gap-3">
          <button
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Ver todas
          </button>
          <button
            onClick={onAssign}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Asignar
          </button>
        </div>
      </div>

      {/* Table - Desktop/Tablet */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tienda
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Ubicación
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                FC
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Δ
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Impact/año
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayedStores.map((store) => (
              <tr
                key={store.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-4 py-4 text-sm font-medium text-gray-900 tabular-nums">
                  {store.id}
                </td>
                <td className="px-4 py-4 text-sm">
                  <div className="font-medium text-gray-900">{store.name}</div>
                  <div className="text-xs text-gray-500 md:hidden">
                    {store.location}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 hidden md:table-cell">
                  {store.location}
                </td>
                <td className="px-4 py-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold tabular-nums text-gray-900">
                      {store.foodCost}%
                    </span>
                    <span
                      className={cn(
                        "text-lg",
                        store.status === "critical"
                          ? "text-red-500"
                          : "text-yellow-500"
                      )}
                    >
                      {store.status === "critical" ? "🔴" : "🟡"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm tabular-nums">
                  <span
                    className={cn(
                      "font-medium",
                      store.delta > 5
                        ? "text-red-600"
                        : store.delta > 3
                        ? "text-yellow-600"
                        : "text-gray-600"
                    )}
                  >
                    +{store.delta.toFixed(1)}pts
                  </span>
                </td>
                <td className="px-4 py-4 text-sm text-gray-900 font-medium tabular-nums hidden sm:table-cell">
                  ${(store.impact / 1000).toFixed(0)}K
                </td>
                <td className="px-4 py-4 text-sm">
                  <button
                    onClick={() => onViewStore?.(store.id)}
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors hover:underline"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {hasMore && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Mostrando {displayedStores.length} de {stores.length} tiendas
          </p>
          <button
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors hover:underline"
          >
            Ver todas las {stores.length} tiendas →
          </button>
        </div>
      )}

      {/* Empty State */}
      {stores.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-500 text-sm">
            ✓ No hay tiendas que requieran atención
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Todas las tiendas están dentro del rango objetivo
          </p>
        </div>
      )}
    </div>
  );
}
