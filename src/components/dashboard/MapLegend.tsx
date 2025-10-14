import { cn } from "@/lib/utils";

interface MapLegendProps {
  counts: {
    ok: number;
    warning: number;
    critical: number;
  };
  className?: string;
}

export function MapLegend({ counts, className }: MapLegendProps) {
  const total = counts.ok + counts.warning + counts.critical;

  return (
    <div
      className={cn(
        "bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-4",
        className
      )}
    >
      <div className="text-sm font-medium text-gray-900 mb-3">
        Distribución de Tiendas
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--status-ok-color, #22c55e)' }} />
            <span className="text-sm text-gray-600">Excelente (&lt;29%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 tabular-nums">
              {counts.ok}
            </span>
            <span className="text-xs text-gray-400">
              ({Math.round((counts.ok / total) * 100)}%)
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--status-warning-color, #f59e0b)' }} />
            <span className="text-sm text-gray-600">Warning (29-32%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 tabular-nums">
              {counts.warning}
            </span>
            <span className="text-xs text-gray-400">
              ({Math.round((counts.warning / total) * 100)}%)
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--status-critical-color, #ef4444)' }} />
            <span className="text-sm text-gray-600">Crítico (&gt;32%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 tabular-nums">
              {counts.critical}
            </span>
            <span className="text-xs text-gray-400">
              ({Math.round((counts.critical / total) * 100)}%)
            </span>
          </div>
        </div>

        <div className="pt-2 mt-2 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total</span>
            <span className="text-sm font-bold text-gray-900 tabular-nums">
              {total}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
