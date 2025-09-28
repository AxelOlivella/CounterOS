import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStores, useMonthlyPnL } from "@/hooks/useFoodCost";
import { Loader2, Download, Printer, AlertTriangle, BarChart3 } from "lucide-react";

export function PnLPage() {
  const [selectedStore, setSelectedStore] = useState("all");
  const { data: stores, loading: storesLoading } = useStores();
  const { rows: pnlData, loading: pnlLoading, error } = useMonthlyPnL(selectedStore === "all" ? undefined : selectedStore);

  const summary = useMemo(() => {
    if (!pnlData.length) return null;

    const totals = pnlData.reduce((acc, row) => ({
      revenue: acc.revenue + row.revenue,
      cogs: acc.cogs + row.cogs,
      rent: acc.rent + row.rent,
      payroll: acc.payroll + row.payroll,
      energy: acc.energy + row.energy,
      marketing: acc.marketing + row.marketing,
      royalties: acc.royalties + row.royalties,
      other: acc.other + row.other,
      ebitda: acc.ebitda + row.ebitda,
    }), {
      revenue: 0,
      cogs: 0,
      rent: 0,
      payroll: 0,
      energy: 0,
      marketing: 0,
      royalties: 0,
      other: 0,
      ebitda: 0,
    });

    return {
      ...totals,
      foodCostPct: totals.revenue > 0 ? (totals.cogs / totals.revenue) * 100 : 0,
      ebitdaPct: totals.revenue > 0 ? (totals.ebitda / totals.revenue) * 100 : 0,
    };
  }, [pnlData]);

  const exportToCSV = () => {
    if (!pnlData.length) return;

    const headers = [
      "Periodo",
      "Tienda",
      "Ingresos",
      "COGS",
      "Renta",
      "Nómina", 
      "Energía",
      "Marketing",
      "Regalías",
      "Otros",
      "EBITDA"
    ];

    const rows = pnlData.map(row => [
      new Date(row.period).toLocaleDateString('es-MX', { year: 'numeric', month: 'long' }),
      stores.find(s => s.store_id === row.store_id)?.name || "N/A",
      row.revenue,
      row.cogs,
      row.rent,
      row.payroll,
      row.energy,
      row.marketing,
      row.royalties,
      row.other,
      row.ebitda
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `pnl-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">P&L Reports</h1>
        <p className="text-muted-foreground">Estados de resultados mensuales</p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="flex-1">
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={exportToCSV}
                disabled={!pnlData.length}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                disabled={!pnlData.length}
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
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

      {pnlLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Cargando datos P&L...</span>
        </div>
      ) : !pnlData.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No hay datos P&L disponibles</h3>
            <p className="text-muted-foreground">Carga ventas y gastos para generar reportes</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    ${summary.revenue.toLocaleString('es-MX')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ingresos Totales
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {summary.foodCostPct.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Food Cost %
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    ${summary.ebitda.toLocaleString('es-MX')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    EBITDA
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className={`text-2xl font-bold ${summary.ebitdaPct >= 15 ? 'text-green-600' : summary.ebitdaPct >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {summary.ebitdaPct.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    EBITDA %
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* P&L Table */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Resultados</CardTitle>
              <CardDescription>
                Detalle mensual por {selectedStore !== "all" ? stores.find(s => s.store_id === selectedStore)?.name : "todas las tiendas"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Período</TableHead>
                      {!selectedStore && <TableHead>Tienda</TableHead>}
                      <TableHead className="text-right">Ingresos</TableHead>
                      <TableHead className="text-right">COGS</TableHead>
                      <TableHead className="text-right">Food Cost %</TableHead>
                      <TableHead className="text-right">Renta</TableHead>
                      <TableHead className="text-right">Nómina</TableHead>
                      <TableHead className="text-right">Energía</TableHead>
                      <TableHead className="text-right">Marketing</TableHead>
                      <TableHead className="text-right">Regalías</TableHead>
                      <TableHead className="text-right">Otros</TableHead>
                      <TableHead className="text-right">EBITDA</TableHead>
                      <TableHead className="text-right">EBITDA %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pnlData.map((row, index) => {
                      const foodCostPct = row.revenue > 0 ? (row.cogs / row.revenue) * 100 : 0;
                      const ebitdaPct = row.revenue > 0 ? (row.ebitda / row.revenue) * 100 : 0;
                      
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            {new Date(row.period).toLocaleDateString('es-MX', {
                              year: 'numeric',
                              month: 'long'
                            })}
                          </TableCell>
                          {selectedStore === "all" && (
                            <TableCell>
                              {stores.find(s => s.store_id === row.store_id)?.name || "N/A"}
                            </TableCell>
                          )}
                          <TableCell className="text-right font-medium">
                            ${row.revenue.toLocaleString('es-MX')}
                          </TableCell>
                          <TableCell className="text-right">
                            ${row.cogs.toLocaleString('es-MX')}
                          </TableCell>
                          <TableCell className={`text-right ${foodCostPct > 30 ? 'text-red-600' : 'text-green-600'}`}>
                            {foodCostPct.toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-right">
                            ${row.rent.toLocaleString('es-MX')}
                          </TableCell>
                          <TableCell className="text-right">
                            ${row.payroll.toLocaleString('es-MX')}
                          </TableCell>
                          <TableCell className="text-right">
                            ${row.energy.toLocaleString('es-MX')}
                          </TableCell>
                          <TableCell className="text-right">
                            ${row.marketing.toLocaleString('es-MX')}
                          </TableCell>
                          <TableCell className="text-right">
                            ${row.royalties.toLocaleString('es-MX')}
                          </TableCell>
                          <TableCell className="text-right">
                            ${row.other.toLocaleString('es-MX')}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ${row.ebitda.toLocaleString('es-MX')}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${ebitdaPct >= 15 ? 'text-green-600' : ebitdaPct >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {ebitdaPct.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Totals Footer */}
              {summary && pnlData.length > 1 && (
                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">TOTALES:</span>
                    <div className="flex gap-8">
                      <span>Ingresos: ${summary.revenue.toLocaleString('es-MX')}</span>
                      <span>EBITDA: ${summary.ebitda.toLocaleString('es-MX')}</span>
                      <span>EBITDA %: {summary.ebitdaPct.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}