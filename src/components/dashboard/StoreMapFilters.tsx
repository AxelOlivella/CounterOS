import { Filter, MapPin, AlertTriangle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface MapFilters {
  regions: string[];
  statuses: ("ok" | "warning" | "critical")[];
  showLabels: boolean;
  mapStyle: "streets" | "satellite" | "light";
}

interface StoreMapFiltersProps {
  filters: MapFilters;
  onFiltersChange: (filters: MapFilters) => void;
  availableRegions: string[];
  counts: {
    ok: number;
    warning: number;
    critical: number;
  };
}

export function StoreMapFilters({
  filters,
  onFiltersChange,
  availableRegions,
  counts,
}: StoreMapFiltersProps) {
  const toggleRegion = (region: string) => {
    const newRegions = filters.regions.includes(region)
      ? filters.regions.filter((r) => r !== region)
      : [...filters.regions, region];
    onFiltersChange({ ...filters, regions: newRegions });
  };

  const toggleStatus = (status: "ok" | "warning" | "critical") => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: newStatuses });
  };

  const resetFilters = () => {
    onFiltersChange({
      regions: availableRegions,
      statuses: ["ok", "warning", "critical"],
      showLabels: filters.showLabels,
      mapStyle: filters.mapStyle,
    });
  };

  const activeFilterCount =
    (availableRegions.length - filters.regions.length) +
    (3 - filters.statuses.length);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Region Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <MapPin className="h-4 w-4" />
            Región
            {filters.regions.length < availableRegions.length && (
              <Badge variant="secondary" className="ml-1">
                {filters.regions.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Filtrar por región</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableRegions.map((region) => (
            <DropdownMenuCheckboxItem
              key={region}
              checked={filters.regions.includes(region)}
              onCheckedChange={() => toggleRegion(region)}
            >
              {region}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Status
            {filters.statuses.length < 3 && (
              <Badge variant="secondary" className="ml-1">
                {filters.statuses.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Filtrar por status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={filters.statuses.includes("ok")}
            onCheckedChange={() => toggleStatus("ok")}
          >
            <div className="flex items-center gap-2 w-full">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Excelente</span>
              <Badge variant="secondary" className="ml-auto">
                {counts.ok}
              </Badge>
            </div>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.statuses.includes("warning")}
            onCheckedChange={() => toggleStatus("warning")}
          >
            <div className="flex items-center gap-2 w-full">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span>Warning</span>
              <Badge variant="secondary" className="ml-auto">
                {counts.warning}
              </Badge>
            </div>
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.statuses.includes("critical")}
            onCheckedChange={() => toggleStatus("critical")}
          >
            <div className="flex items-center gap-2 w-full">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span>Crítico</span>
              <Badge variant="secondary" className="ml-auto">
                {counts.critical}
              </Badge>
            </div>
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Map Style Toggle */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            🗺️ Estilo
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Estilo de mapa</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={filters.mapStyle === "streets"}
            onCheckedChange={() =>
              onFiltersChange({ ...filters, mapStyle: "streets" })
            }
          >
            Calles
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.mapStyle === "light"}
            onCheckedChange={() =>
              onFiltersChange({ ...filters, mapStyle: "light" })
            }
          >
            Light
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.mapStyle === "satellite"}
            onCheckedChange={() =>
              onFiltersChange({ ...filters, mapStyle: "satellite" })
            }
          >
            Satélite
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Show Labels Toggle */}
      <Button
        variant={filters.showLabels ? "default" : "outline"}
        size="sm"
        onClick={() =>
          onFiltersChange({ ...filters, showLabels: !filters.showLabels })
        }
      >
        {filters.showLabels ? "🏷️ Labels ON" : "🏷️ Labels OFF"}
      </Button>

      {/* Reset Filters */}
      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          Limpiar filtros ({activeFilterCount})
        </Button>
      )}
    </div>
  );
}
