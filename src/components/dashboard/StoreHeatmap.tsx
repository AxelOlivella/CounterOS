import { useState } from "react";
import { cn } from "@/lib/utils";
import { MapPin, AlertTriangle } from "lucide-react";

interface StoreGeo {
  id: number;
  name: string;
  lat: number;
  lng: number;
  fc: number;
  status: "ok" | "warning" | "critical";
}

interface StoreHeatmapProps {
  stores: StoreGeo[];
  className?: string;
}

export function StoreHeatmap({ stores, className }: StoreHeatmapProps) {
  const [hoveredStore, setHoveredStore] = useState<StoreGeo | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Count by status
  const counts = {
    ok: stores.filter((s) => s.status === "ok").length,
    warning: stores.filter((s) => s.status === "warning").length,
    critical: stores.filter((s) => s.status === "critical").length,
  };

  // Normalize coordinates to SVG viewport
  const latRange = { min: 19.0, max: 19.7 }; // CDMX approx range
  const lngRange = { min: -99.5, max: -98.9 };
  const viewportWidth = 800;
  const viewportHeight = 400;

  const normalizeCoords = (lat: number, lng: number) => {
    const x =
      ((lng - lngRange.min) / (lngRange.max - lngRange.min)) * viewportWidth;
    const y =
      ((latRange.max - lat) / (latRange.max - latRange.min)) * viewportHeight;
    return { x, y };
  };

  const getColor = (status: string) => {
    switch (status) {
      case "critical":
        return "#ef4444"; // red-500
      case "warning":
        return "#f59e0b"; // yellow-500
      case "ok":
        return "#10b981"; // green-500
      default:
        return "#9ca3af"; // gray-400
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-fade-in",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">
            Food Cost por Tienda (Vista Geográfica)
          </h2>
        </div>
        <div className="flex gap-3 text-sm">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600">{counts.ok}</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-600">{counts.warning}</span>
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600">{counts.critical}</span>
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
        <svg
          width="100%"
          height="400"
          viewBox={`0 0 ${viewportWidth} ${viewportHeight}`}
          className="w-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredStore(null)}
        >
          {/* Background grid for reference */}
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Store dots */}
          {stores.map((store) => {
            const { x, y } = normalizeCoords(store.lat, store.lng);
            const color = getColor(store.status);
            const isHovered = hoveredStore?.id === store.id;

            return (
              <g key={store.id}>
                {/* Outer ring on hover */}
                {isHovered && (
                  <circle
                    cx={x}
                    cy={y}
                    r="12"
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    opacity="0.4"
                    className="animate-pulse"
                  />
                )}

                {/* Main dot */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? "8" : "6"}
                  fill={color}
                  opacity={isHovered ? "1" : "0.8"}
                  className="cursor-pointer transition-all duration-200 hover:opacity-100"
                  onMouseEnter={() => setHoveredStore(store)}
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredStore && (
          <div
            className="absolute bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg p-3 pointer-events-none z-10"
            style={{
              left: `${mousePos.x + 15}px`,
              top: `${mousePos.y + 15}px`,
              transform: "translateY(-50%)",
            }}
          >
            <div className="text-sm">
              <div className="font-semibold text-gray-900">
                #{hoveredStore.id} - {hoveredStore.name}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-600">FC:</span>
                <span
                  className={cn(
                    "font-bold tabular-nums",
                    hoveredStore.status === "critical"
                      ? "text-red-600"
                      : hoveredStore.status === "warning"
                      ? "text-yellow-600"
                      : "text-green-600"
                  )}
                >
                  {hoveredStore.fc.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Insight Box */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 border border-yellow-200 shadow-md">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                Pattern detectado
              </p>
              <p className="text-sm text-gray-700">
                <strong>Cluster de 8 tiendas críticas en CDMX Sur.</strong>{" "}
                Posible problema regional (proveedor o gerente regional).
                Requiere investigación inmediata.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-600">
            &lt;29% (Excelente) - {counts.ok} tiendas
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-gray-600">
            29-32% (OK) - {counts.warning} tiendas
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-gray-600">
            &gt;32% (Crítico) - {counts.critical} tiendas
          </span>
        </div>
      </div>
    </div>
  );
}
