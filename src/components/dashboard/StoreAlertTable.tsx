import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import TableWrap from "@/components/ui/TableWrap";
import Pill from "@/components/ui/Pill";

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
  const navigate = useNavigate();
  const displayedStores = stores.slice(0, limit);
  const hasMore = stores.length > limit;

  const handleViewStore = (storeId: number) => {
    if (onViewStore) {
      onViewStore(storeId);
    }
    // Navigate to store detail page
    navigate(`/dashboard/operations/store/${storeId}`);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex gap-3">
          <button
            onClick={onViewAll}
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Ver todas
          </button>
          <button
            onClick={onAssign}
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Asignar
          </button>
        </div>
      </div>

      {/* Table with TableWrap */}
      <TableWrap>
        <table className="w-full">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Tienda
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider hidden md:table-cell">
                Ubicación
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                FC
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Δ
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider hidden sm:table-cell">
                Impact/año
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Acción
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedStores.map((store) => (
              <tr key={store.id}>
                <td className="px-4 py-4 text-sm font-medium tabular-nums">
                  {store.id}
                </td>
                <td className="px-4 py-4 text-sm">
                  <div className="font-medium">{store.name}</div>
                  <div className="text-xs text-zinc-500 md:hidden">
                    {store.location}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-zinc-400 hidden md:table-cell">
                  {store.location}
                </td>
                <td className="px-4 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold tabular-nums">
                      {store.foodCost}%
                    </span>
                    <Pill tone={store.status === "critical" ? "danger" : "warn"}>
                      {store.status === "critical" ? "Crítico" : "Warning"}
                    </Pill>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm tabular-nums">
                  <span
                    className={cn(
                      "font-medium",
                      store.delta > 5
                        ? "text-[var(--danger)]"
                        : store.delta > 3
                        ? "text-[var(--warn)]"
                        : "text-zinc-400"
                    )}
                  >
                    +{store.delta.toFixed(1)}pts
                  </span>
                </td>
                <td className="px-4 py-4 text-sm font-medium tabular-nums hidden sm:table-cell">
                  ${(store.impact / 1000).toFixed(0)}K
                </td>
                <td className="px-4 py-4 text-sm">
                  <button
                    onClick={() => handleViewStore(store.id)}
                    className="text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>

      {/* Footer */}
      {hasMore && (
        <div className="mt-4 text-center">
          <p className="text-sm text-zinc-400 mb-2">
            Mostrando {displayedStores.length} de {stores.length} tiendas
          </p>
          <button
            onClick={onViewAll}
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
          >
            Ver todas las {stores.length} tiendas →
          </button>
        </div>
      )}

      {/* Empty State */}
      {stores.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-zinc-400 text-sm">
            ✓ No hay tiendas que requieran atención
          </p>
          <p className="text-zinc-500 text-xs mt-1">
            Todas las tiendas están dentro del rango objetivo
          </p>
        </div>
      )}
    </div>
  );
}
