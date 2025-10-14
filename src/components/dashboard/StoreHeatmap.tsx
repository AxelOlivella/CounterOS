import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { cn } from "@/lib/utils";
import { AlertTriangle, Maximize2 } from "lucide-react";
import { StoreMapFilters, type MapFilters } from "./StoreMapFilters";
import { MapLegend } from "./MapLegend";
import { logger } from "@/lib/logger";

// Use Mapbox token from environment variable
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";
logger.debug('🗺️ Mapbox Token Status:', { 
  status: MAPBOX_TOKEN ? 'Token presente' : 'Token faltante', 
  prefix: MAPBOX_TOKEN?.substring(0, 20) 
});

interface StoreGeo {
  id: number;
  name: string;
  lat: number;
  lng: number;
  fc: number;
  status: "ok" | "warning" | "critical";
  location?: string;
}

interface StoreHeatmapProps {
  stores: StoreGeo[];
  className?: string;
}

export function StoreHeatmap({ stores, className }: StoreHeatmapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const navigate = useNavigate();

  // Extract unique regions from stores
  const availableRegions = Array.from(
    new Set(stores.map((s) => s.location || "CDMX").filter(Boolean))
  );

  const [filters, setFilters] = useState<MapFilters>({
    regions: availableRegions,
    statuses: ["ok", "warning", "critical"],
    showLabels: false,
    mapStyle: "light",
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const currentStyleRef = useRef<string>("");

  // Count by status
  const counts = {
    ok: stores.filter((s) => s.status === "ok").length,
    warning: stores.filter((s) => s.status === "warning").length,
    critical: stores.filter((s) => s.status === "critical").length,
  };

  // Filter stores
  const filteredStores = stores.filter(
    (store) =>
      filters.regions.includes(store.location || "CDMX") &&
      filters.statuses.includes(store.status)
  );

  const getColor = (status: string) => {
    const rootStyles = getComputedStyle(document.documentElement);
    switch (status) {
      case "critical":
        return (rootStyles.getPropertyValue('--status-critical-color') || '#ef4444').trim();
      case "warning":
        return (rootStyles.getPropertyValue('--status-warning-color') || '#f59e0b').trim();
      case "ok":
        return (rootStyles.getPropertyValue('--status-ok-color') || '#22c55e').trim();
      default:
        return "#9ca3af"; // gray-400
    }
  };

  const getMapStyle = () => {
    switch (filters.mapStyle) {
      case "streets":
        return "mapbox://styles/mapbox/streets-v12";
      case "satellite":
        return "mapbox://styles/mapbox/satellite-streets-v12";
      case "light":
      default:
        return "mapbox://styles/mapbox/light-v11";
    }
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    logger.debug('🗺️ Inicializando mapa Mapbox...');
    
    // Set Mapbox access token
    mapboxgl.accessToken = MAPBOX_TOKEN;

    try {
      // Initialize map centered on CDMX
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: getMapStyle(),
        center: [-99.133, 19.432], // CDMX center
        zoom: 11,
        pitch: 0,
        bearing: 0,
      });

      currentStyleRef.current = getMapStyle();

      map.current.on('load', () => {
        logger.info('✅ Mapa cargado');
        setMapReady(true);
      });

      logger.info('✅ Mapa inicializado correctamente');
    } catch (error) {
      logger.error('❌ Error al inicializar mapa', error);
      return;
    }

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      "top-right"
    );

    // Add fullscreen control
    map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");

    // Disable rotation
    map.current.dragRotate.disable();
    map.current.touchZoomRotate.disableRotation();

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update map style when filter changes
  useEffect(() => {
    if (!map.current) return;
    const newStyle = getMapStyle();
    if (currentStyleRef.current === newStyle) return;

    logger.debug('🎨 Cambiando estilo del mapa a:', newStyle);
    setMapReady(false);
    map.current.setStyle(newStyle);
    map.current.once('style.load', () => {
      currentStyleRef.current = newStyle;
      setMapReady(true);
      logger.debug('✅ Estilo del mapa cargado');
    });
  }, [filters.mapStyle]);

  // Resize map on fullscreen toggle
  useEffect(() => {
    if (!map.current) return;
    setTimeout(() => map.current?.resize(), 50);
  }, [isFullscreen]);

  // Update markers when filters change
  useEffect(() => {
    if (!map.current || !mapReady) {
      logger.debug('⚠️ Mapa no listo para dibujar marcadores', { mapReady });
      return;
    }

    logger.debug('📍 Actualizando marcadores', { totalTiendasFiltradas: filteredStores.length });

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Use requestAnimationFrame to ensure map is ready
    const timeoutId = setTimeout(() => {
      // Add filtered markers with staggered animation
      filteredStores.forEach((store, index) => {
        logger.debug(`📌 Agregando marcador ${index + 1}`, { 
          nombre: store.name, 
          coords: `[${store.lat}, ${store.lng}]` 
        });
        const color = getColor(store.status);

      // Create custom marker element with inner visual to avoid overriding Mapbox transforms
      const el = document.createElement("div");
      el.className = "custom-marker";
      el.style.cssText = `position: relative; width: 0; height: 0;`;

      const inner = document.createElement("div");
      inner.className = "custom-marker-inner";
      inner.style.cssText = `
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
        opacity: 0;
        transform: scale(0);
      `;
      // Apply color explicitly to avoid any CSS-var parsing issues in inline cssText
      inner.style.backgroundColor = color;
      el.appendChild(inner);

      // Staggered fade-in animation on inner element (keep root transform intact)
      setTimeout(() => {
        inner.style.opacity = "1";
        inner.style.transform = "scale(1)";
      }, index * 20);

      // Hover effects (apply to inner element only)
      el.addEventListener("mouseenter", () => {
        inner.style.transform = "scale(1.25)";
        inner.style.zIndex = "1000";
      });

      el.addEventListener("mouseleave", () => {
        inner.style.transform = "scale(1)";
        inner.style.zIndex = "auto";
      });

        // Create popup
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          className: "store-popup",
        }).setHTML(`
          <div class="p-2">
            <div class="font-semibold text-sm">#${store.id} - ${store.name}</div>
            <div class="text-xs text-muted-foreground mt-1">${store.location || "CDMX"}</div>
            <div class="flex items-center gap-2 mt-2">
              <span class="text-xs text-muted-foreground">FC:</span>
              <span class="font-bold text-sm" style="color: ${color}">${store.fc.toFixed(1)}%</span>
            </div>
            <button class="mt-2 text-xs text-primary hover:text-primary/80 font-medium">
              Ver detalles →
            </button>
          </div>
        `);

        // Create marker
        try {
          const marker = new mapboxgl.Marker(el)
            .setLngLat([store.lng, store.lat])
            .setPopup(popup)
            .addTo(map.current!);

          // Click handler - navigate to store detail
          el.addEventListener("click", () => {
            navigate(`/dashboard/operations/store/${store.id}`);
          });

          // Store marker ref
          markersRef.current.push(marker);
        } catch (error) {
          console.error(`❌ Error creando marcador para ${store.name}:`, error);
        }

        // Optional: Show label if filter enabled
        if (filters.showLabels) {
          const labelEl = document.createElement("div");
          labelEl.className = "store-label";
          labelEl.textContent = store.name;
          labelEl.style.cssText = `
            position: absolute;
            background: rgba(255,255,255,0.95);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: 500;
            white-space: nowrap;
            pointer-events: none;
            box-shadow: 0 1px 2px rgba(0,0,0,0.2);
            margin-left: 16px;
            margin-top: -6px;
          `;
          el.appendChild(labelEl);
        }
      });

      // Fit bounds to show all filtered markers
      if (filteredStores.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        filteredStores.forEach((store) => {
          bounds.extend([store.lng, store.lat]);
        });
        
        // Add padding and limit zoom to avoid too much zoom out
        map.current?.fitBounds(bounds, {
          padding: { top: 80, bottom: 80, left: 80, right: 80 },
          maxZoom: 12,  // Don't zoom out too much
          duration: 1000,
        });
        logger.info(`✅ Marcadores agregados al mapa`, { total: markersRef.current.length });
      } else {
        logger.debug('⚠️ No hay tiendas para mostrar después del filtro');
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [filteredStores, filters.showLabels, navigate, mapReady]);

  return (
    <div
      className={cn(
        "bg-card rounded-lg shadow-sm border border-border animate-fade-in",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
    >
      {/* Header with Filters */}
      <div className="px-6 py-4 border-b border-border space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              Food Cost por Tienda (Vista Geográfica)
            </h2>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1 hover:bg-muted rounded transition"
            >
              <Maximize2 className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div className="text-sm text-muted-foreground">
            Mostrando {filteredStores.length} de {stores.length} tiendas
          </div>
        </div>

        <StoreMapFilters
          filters={filters}
          onFiltersChange={setFilters}
          availableRegions={availableRegions}
          counts={counts}
        />
      </div>

      {/* Map Container */}
      <div className="relative">
        <div
          ref={mapContainer}
          className={cn(
            "w-full transition-all duration-300",
            isFullscreen ? "h-[calc(100vh-8rem)]" : "h-[500px]"
          )}
        />

        {/* Legend Overlay */}
        <MapLegend
          counts={counts}
          className="absolute bottom-4 left-4 max-w-xs"
        />

        {/* Insight Box Overlay */}
        {counts.critical > 5 && (
          <div className="absolute top-4 right-4 max-w-sm bg-card/95 backdrop-blur-sm rounded-lg p-4 border border-[var(--warn)]/20 shadow-md">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-[var(--warn)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Pattern detectado
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Cluster de {counts.critical} tiendas críticas.</strong>{" "}
                  Posible problema regional. Requiere investigación inmediata.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* API Key Warning - Show if token is missing */}
        {!MAPBOX_TOKEN && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[var(--warn)]/10 border-2 border-[var(--warn)] rounded-lg p-6 max-w-md text-center shadow-lg">
            <AlertTriangle className="h-8 w-8 text-[var(--warn)] mx-auto mb-3" />
            <p className="font-semibold text-foreground mb-2">
              Mapbox API Key Required
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              Add VITE_MAPBOX_TOKEN to your .env file:
            </p>
            <code className="block bg-card px-3 py-2 rounded text-xs mb-3">
              VITE_MAPBOX_TOKEN=your_public_token_here
            </code>
            <a
              href="https://account.mapbox.com/access-tokens/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Get token at mapbox.com →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
