import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStores, useDailyFoodCost } from "@/hooks/useFoodCost";
import { FoodCostTrendChart } from "@/components/food-cost/FoodCostTrendChart";
import { VarianceAnalysisChart } from "@/components/food-cost/VarianceAnalysisChart";
import { Loader2, AlertTriangle, TrendingUp } from "lucide-react";

export function FoodCostPage() {
  const [selectedStore, setSelectedStore] = useState("all");
  const { data: stores, loading: storesLoading } = useStores();
  const { rows: foodCostData, loading: foodCostLoading, error } = useDailyFoodCost(selectedStore === "all" ? undefined : selectedStore);

  const analysisData = useMemo(() => {
    if (!foodCostData.length) return null;

    // Transform data for charts
    const trendData = foodCostData.map(row => ({
      date: new Date(row.day).toLocaleDateString(),
      foodCostPercent: row.food_cost_pct,
      purchases: row.cogs,
      sales: row.revenue,
    }));

    // Latest food cost %
    const latest = foodCostData[foodCostData.length - 1];
    const target = 30;
    const variance = latest ? latest.food_cost_pct - target : 0;

    // Days over 30%
    const highCostDays = foodCostData
      .filter(row => row.food_cost_pct > 30)
      .sort((a, b) => b.food_cost_pct - a.food_cost_pct)
      .slice(0, 10);

    // Check for consecutive high days
    let consecutiveAlert = false;
    for (let i = 1; i < foodCostData.length; i++) {
      const current = foodCostData[i];
      const previous = foodCostData[i - 1];
      const currentDate = new Date(current.day);
      const previousDate = new Date(previous.day);
      
      const daysDiff = (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysDiff === 1 && current.food_cost_pct > 30 && previous.food_cost_pct > 30) {
        consecutiveAlert = true;
        break;
      }
    }

    return {
      trendData,
      latest: latest ? latest.food_cost_pct : 0,
      target,
      variance,
      highCostDays,
      consecutiveAlert,
    };
  }, [foodCostData]);

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Food Cost Analysis</h1>
        <p className="text-muted-foreground">Monitoreo operativo del costo de alimentos</p>
      </div>

      {/* Store Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Tienda:</label>
              {storesLoading ? (
                <div className="flex items-center gap-2 mt-1">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Cargando...</span>
                </div>
              ) : (
                <Select value={selectedStore} onValueChange={setSelectedStore}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las tiendas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Consolidado</SelectItem>
                    {stores.map((store) => (
                      <SelectItem key={store.store_id} value={store.store_id}>
                        {store.name} ({store.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analysisData?.consecutiveAlert && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            ⚠️ Alerta: Dos días consecutivos con Food Cost superior al 30%
          </AlertDescription>
        </Alert>
      )}

      {foodCostLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Cargando datos de Food Cost...</span>
        </div>
      ) : !analysisData ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No hay datos disponibles</h3>
            <p className="text-muted-foreground">Carga ventas en la sección de Datos para ver el análisis</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FoodCostTrendChart data={analysisData.trendData} />
            <VarianceAnalysisChart 
              current={analysisData.latest}
              target={analysisData.target}
              variance={analysisData.variance}
            />
          </div>

          {/* High Cost Days Table */}
          {analysisData.highCostDays.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Días con Food Cost &gt; 30%</CardTitle>
                <CardDescription>
                  Top días con mayor costo de alimentos (ordenados por %)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Food Cost %</TableHead>
                      <TableHead className="text-right">Ventas</TableHead>
                      <TableHead className="text-right">COGS</TableHead>
                      <TableHead className="text-right">Exceso vs Meta</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysisData.highCostDays.map((day, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {new Date(day.day).toLocaleDateString('es-MX', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          <span className={day.food_cost_pct > 35 ? "text-red-600 font-semibold" : "text-orange-600"}>
                            {day.food_cost_pct.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          ${day.revenue.toLocaleString('es-MX')}
                        </TableCell>
                        <TableCell className="text-right">
                          ${day.cogs.toLocaleString('es-MX')}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          +{(day.food_cost_pct - 30).toFixed(1)}pp
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {analysisData.latest.toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Food Cost Actual
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">30.0%</div>
                <p className="text-xs text-muted-foreground">
                  Meta
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className={`text-2xl font-bold ${analysisData.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {analysisData.variance > 0 ? '+' : ''}{analysisData.variance.toFixed(1)}pp
                </div>
                <p className="text-xs text-muted-foreground">
                  Varianza
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {analysisData.highCostDays.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Días &gt;30%
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}