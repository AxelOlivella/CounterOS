import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Papa from "papaparse";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStores } from "@/hooks/useFoodCost";
import { supabase } from "@/lib/db";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TENANT = "00000000-0000-0000-0000-000000000001";

const expenseSchema = z.object({
  rent: z.number().min(0, "Debe ser positivo"),
  payroll: z.number().min(0, "Debe ser positivo"),
  energy: z.number().min(0, "Debe ser positivo"),
  marketing_pct: z.number().min(0, "Debe ser positivo").max(100, "Máximo 100%"),
  royalty_pct: z.number().min(0, "Debe ser positivo").max(100, "Máximo 100%"),
  other: z.number().min(0, "Debe ser positivo"),
});

type SalesRow = {
  date: string;
  ticket_id: string;
  sku: string;
  qty: number;
  unit_price: number;
};

export function DatosPage() {
  const [selectedStore, setSelectedStore] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<SalesRow[]>([]);
  const [csvError, setCsvError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [salesStatus, setSalesStatus] = useState<boolean | null>(null);
  const [expensesStatus, setExpensesStatus] = useState<boolean | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: stores, loading: storesLoading } = useStores();
  const { toast } = useToast();
  const navigate = useNavigate();

  const expenseForm = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      rent: 0,
      payroll: 0,
      energy: 0,
      marketing_pct: 3,
      royalty_pct: 5,
      other: 0,
    },
  });

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Check sales for current month
    const { data: salesData } = await supabase
      .from("sales")
      .select("sale_id")
      .eq("tenant_id", TENANT)
      .gte("sold_at", currentMonth + "-01")
      .lt("sold_at", new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString())
      .limit(1);
    
    setSalesStatus((salesData?.length || 0) > 0);

    // Check expenses for current month
    const { data: expensesData } = await supabase
      .from("expenses")
      .select("expense_id")
      .eq("tenant_id", TENANT)
      .eq("period", currentMonth + "-01")
      .limit(1);
    
    setExpensesStatus((expensesData?.length || 0) > 0);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setCsvError("");
    setCsvPreview([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const requiredColumns = ["date", "ticket_id", "sku", "qty", "unit_price"];
        const columns = Object.keys(results.data[0] || {});
        const missingColumns = requiredColumns.filter(col => !columns.includes(col));

        if (missingColumns.length > 0) {
          setCsvError(`Columnas faltantes: ${missingColumns.join(", ")}`);
          return;
        }

        const parsedData: SalesRow[] = results.data.slice(0, 5).map((row: any) => ({
          date: row.date,
          ticket_id: row.ticket_id,
          sku: row.sku,
          qty: parseFloat(row.qty) || 0,
          unit_price: parseFloat(row.unit_price) || 0,
        }));

        setCsvPreview(parsedData);
      },
      error: (error) => {
        setCsvError(error.message);
      }
    });
  };

  const handleUploadSales = async () => {
    if (!csvFile || !selectedStore) {
      toast({ title: "Error", description: "Selecciona tienda y archivo CSV", variant: "destructive" });
      return;
    }

    setUploading(true);

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const salesData = results.data.map((row: any) => ({
          tenant_id: TENANT,
          store_id: selectedStore,
          ticket_id: row.ticket_id,
          sku: row.sku,
          qty: parseFloat(row.qty) || 0,
          unit_price: parseFloat(row.unit_price) || 0,
          sold_at: new Date(row.date).toISOString(),
        }));

        const { error } = await supabase
          .from("sales")
          .insert(salesData);

        setUploading(false);

        if (error) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Ventas cargadas exitosamente" });
          checkStatus();
          setCsvFile(null);
          setCsvPreview([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      }
    });
  };

  const handleExpenses = async (values: z.infer<typeof expenseSchema>) => {
    const period = new Date().toISOString().slice(0, 7) + "-01";
    
    const { error } = await supabase
      .from("expenses")
      .upsert([{
        tenant_id: TENANT,
        store_id: selectedStore,
        period,
        ...values,
      }]);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Gastos guardados exitosamente" });
      checkStatus();
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Carga de Datos</h1>
        <p className="text-muted-foreground">Carga las ventas y configura los gastos del mes</p>
      </div>

      {/* Status Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Estado</CardTitle>
          <CardDescription>Semáforo de datos cargados para el mes actual</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              {salesStatus === null ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : salesStatus ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">Ventas</span>
              <span className="text-sm text-muted-foreground">
                {salesStatus === null ? "Verificando..." : salesStatus ? "✅ Cargadas" : "❌ Pendientes"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {expensesStatus === null ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : expensesStatus ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">Gastos</span>
              <span className="text-sm text-muted-foreground">
                {expensesStatus === null ? "Verificando..." : expensesStatus ? "✅ Configurados" : "❌ Pendientes"}
              </span>
            </div>
          </div>
          
          {salesStatus && expensesStatus && (
            <div className="mt-4 pt-4 border-t">
              <Button onClick={() => navigate("/foodcost")} className="w-full">
                Ver Food Cost Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Cargar Ventas (CSV)
            </CardTitle>
            <CardDescription>
              Formato: date,ticket_id,sku,qty,unit_price (YYYY-MM-DD)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                    <SelectValue placeholder="Seleccionar tienda" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.store_id} value={store.store_id}>
                        {store.name} ({store.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
              />
            </div>

            {csvError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{csvError}</AlertDescription>
              </Alert>
            )}

            {csvPreview.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Preview (primeros 5 registros):</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Ticket</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Precio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvPreview.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.ticket_id}</TableCell>
                        <TableCell>{row.sku}</TableCell>
                        <TableCell>{row.qty}</TableCell>
                        <TableCell>${row.unit_price}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <Button 
              onClick={handleUploadSales} 
              disabled={!csvFile || !selectedStore || uploading}
              className="w-full"
            >
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cargar Ventas
            </Button>
          </CardContent>
        </Card>

        {/* Monthly Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos del Mes</CardTitle>
            <CardDescription>Configura los gastos fijos para {new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...expenseForm}>
              <form onSubmit={expenseForm.handleSubmit(handleExpenses)} className="space-y-4">
                <FormField
                  control={expenseForm.control}
                  name="rent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Renta ($)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={expenseForm.control}
                  name="payroll"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nómina ($)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={expenseForm.control}
                  name="energy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Energía ($)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={expenseForm.control}
                    name="marketing_pct"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marketing (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={expenseForm.control}
                    name="royalty_pct"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Regalías (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={expenseForm.control}
                  name="other"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Otros ($)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={!selectedStore}>
                  Guardar Gastos
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}