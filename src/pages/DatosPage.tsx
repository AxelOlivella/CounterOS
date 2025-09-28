import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StoreSelector } from '@/components/ui/store-selector';
import { useStoreSelection } from '@/hooks/useStoreSelection';
import { 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Copy,
  FileText,
  Info,
  Calculator,
  TrendingUp,
  Lock
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';

interface ExpenseRow {
  category: string;
  label: string;
  value: string;
  percentage: string;
  isCalculated: boolean;
  isEditable: boolean;
  tooltip?: string;
}

const DatosPage = () => {
  const { selectedStore, isConsolidatedView } = useStoreSelection();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [salesAmount, setSalesAmount] = useState('');
  const [salesFile, setSalesFile] = useState<File | null>(null);
  const [uploadMode, setUploadMode] = useState<'amount' | 'csv'>('amount');
  const [isSaved, setIsSaved] = useState(false);
  
  // Expense rows configuration
  const [expenseRows, setExpenseRows] = useState<ExpenseRow[]>([
    { category: 'sales', label: 'Ventas Totales', value: '', percentage: '100.00', isCalculated: false, isEditable: true },
    { category: 'cogs', label: 'Costo de Ventas (COGS)', value: '', percentage: '35.00', isCalculated: true, isEditable: false, tooltip: 'Calculado automáticamente basado en recetas y costos de ingredientes' },
    { category: 'rent', label: 'Renta', value: '', percentage: '', isCalculated: false, isEditable: true },
    { category: 'payroll', label: 'Nómina', value: '', percentage: '', isCalculated: false, isEditable: true },
    { category: 'energy', label: 'Energía y Servicios', value: '', percentage: '', isCalculated: false, isEditable: true },
    { category: 'other', label: 'Otros Gastos', value: '', percentage: '', isCalculated: false, isEditable: true },
    { category: 'royalties', label: 'Regalías', value: '', percentage: '5.00', isCalculated: true, isEditable: false, tooltip: 'Calculado automáticamente como 5% de ventas' },
    { category: 'marketing', label: 'Marketing', value: '', percentage: '3.00', isCalculated: true, isEditable: false, tooltip: 'Calculado automáticamente como 3% de ventas' },
    { category: 'supervision', label: 'Supervisión', value: '8500', percentage: '', isCalculated: true, isEditable: false, tooltip: 'Costo fijo mensual de supervisión' }
  ]);

  // Calculate values when sales change
  useEffect(() => {
    const sales = parseFloat(salesAmount) || 0;
    
    setExpenseRows(prev => prev.map(row => {
      let newValue = row.value;
      let newPercentage = row.percentage;
      
      if (row.category === 'sales') {
        newValue = sales.toString();
        newPercentage = '100.00';
      } else if (row.isCalculated && sales > 0) {
        if (row.category === 'cogs') {
          newValue = (sales * 0.35).toFixed(0);
        } else if (row.category === 'royalties') {
          newValue = (sales * 0.05).toFixed(0);
        } else if (row.category === 'marketing') {
          newValue = (sales * 0.03).toFixed(0);
        }
      }

      // Calculate percentage for fixed amounts
      if (sales > 0 && row.value && !row.isCalculated && row.category !== 'sales') {
        newPercentage = ((parseFloat(row.value) / sales) * 100).toFixed(2);
      }

      return { ...row, value: newValue, percentage: newPercentage };
    }));
  }, [salesAmount]);

  const updateExpenseRow = (category: string, field: 'value' | 'percentage', newValue: string) => {
    const sales = parseFloat(salesAmount) || 0;
    
    setExpenseRows(prev => prev.map(row => {
      if (row.category === category && row.isEditable) {
        const updatedRow = { ...row };
        
        if (field === 'value') {
          updatedRow.value = newValue;
          if (sales > 0) {
            updatedRow.percentage = ((parseFloat(newValue) / sales) * 100).toFixed(2);
          }
        }
        
        return updatedRow;
      }
      return row;
    }));
  };

  const duplicateLastMonth = () => {
    // Simulated data - in real app this would come from API
    toast({
      title: "Datos del mes anterior copiados",
      description: "Se han prellenado los campos con los datos del mes anterior"
    });
    
    setSalesAmount('125000');
    setExpenseRows(prev => prev.map(row => {
      if (row.category === 'rent') return { ...row, value: '25000' };
      if (row.category === 'payroll') return { ...row, value: '35000' };
      if (row.category === 'energy') return { ...row, value: '8500' };
      if (row.category === 'other') return { ...row, value: '5000' };
      return row;
    }));
  };

  const handleSave = () => {
    setIsSaved(true);
    toast({
      title: "Datos guardados correctamente",
      description: `Información del mes ${selectedMonth} guardada exitosamente`
    });
  };

  const calculatePnL = () => {
    const sales = parseFloat(salesAmount) || 0;
    const cogs = parseFloat(expenseRows.find(r => r.category === 'cogs')?.value || '0');
    const totalExpenses = expenseRows
      .filter(r => r.category !== 'sales' && r.category !== 'cogs')
      .reduce((sum, row) => sum + (parseFloat(row.value) || 0), 0);
    
    const grossProfit = sales - cogs;
    const ebitda = sales - cogs - totalExpenses;
    
    return { sales, cogs, grossProfit, totalExpenses, ebitda };
  };

  const pnl = calculatePnL();

  return (
    <TooltipProvider>
      <AppLayout>
        <div className="container mx-auto max-w-5xl py-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Cargar Datos</h1>
              <p className="text-muted-foreground">
                {isConsolidatedView 
                  ? 'Gestión operativa simplificada para gerentes de QSR'
                  : `Datos operativos - ${selectedStore?.name}`
                }
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StoreSelector />
            </div>
          </div>

          {/* Month & Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <Label htmlFor="month">Período</Label>
                  <Input
                    id="month"
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-auto"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={duplicateLastMonth}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar mes anterior
                  </Button>
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    id="csv-upload"
                    onChange={(e) => {
                      setSalesFile(e.target.files?.[0] || null);
                      if (e.target.files?.[0]) {
                        toast({
                          title: "CSV cargado",
                          description: "Datos históricos procesados correctamente"
                        });
                      }
                    }}
                  />
                  <Button variant="outline" onClick={() => document.getElementById('csv-upload')?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Cargar CSV histórico
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Sales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">1</span>
                Ventas del Mes
              </CardTitle>
              <CardDescription>Captura las ventas totales del período seleccionado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={uploadMode === 'amount' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUploadMode('amount')}
                >
                  Monto total
                </Button>
                <Button
                  variant={uploadMode === 'csv' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUploadMode('csv')}
                >
                  Archivo CSV
                </Button>
              </div>

              {uploadMode === 'amount' ? (
                <div className="max-w-sm">
                  <Label htmlFor="sales">Ventas totales (MXN)</Label>
                  <Input
                    id="sales"
                    type="number"
                    value={salesAmount}
                    onChange={(e) => setSalesAmount(e.target.value)}
                    placeholder="125,000"
                    className="text-lg font-semibold"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm">
                    {salesFile ? salesFile.name : 'Arrastra tu CSV de ventas aquí o haz clic para seleccionar'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Expense Table */}
          {salesAmount && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">2</span>
                  Estructura de Gastos
                </CardTitle>
                <CardDescription>Ajusta los gastos fijos y revisa los automáticos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 border-b font-medium text-sm">
                    <div>Categoría</div>
                    <div className="text-right">Valor (MXN)</div>
                    <div className="text-right">% Ventas</div>
                    <div className="text-center">Estado</div>
                  </div>
                  
                  {expenseRows.map((row) => (
                    <div key={row.category} className={`grid grid-cols-4 gap-4 p-4 border-b last:border-b-0 items-center ${
                      row.isCalculated ? 'bg-accent-light/30' : 'bg-background'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${row.category === 'sales' ? 'text-primary font-semibold' : ''}`}>
                          {row.label}
                        </span>
                        {row.tooltip && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">{row.tooltip}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {row.isCalculated && <Lock className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      
                      <div className="text-right">
                        {row.isEditable ? (
                          <Input
                            type="number"
                            value={row.value}
                            onChange={(e) => updateExpenseRow(row.category, 'value', e.target.value)}
                            className="text-right"
                            disabled={row.category === 'sales'}
                          />
                        ) : (
                          <span className={`font-mono ${row.isCalculated ? 'text-muted-foreground' : 'font-semibold'}`}>
                            ${row.value ? parseFloat(row.value).toLocaleString() : '0'}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <span className="font-mono text-sm">
                          {row.percentage ? `${parseFloat(row.percentage).toFixed(1)}%` : '—'}
                        </span>
                      </div>
                      
                      <div className="text-center">
                        {row.isCalculated ? (
                          <Calculator className="h-4 w-4 text-success mx-auto" />
                        ) : row.value ? (
                          <CheckCircle className="h-4 w-4 text-success mx-auto" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-warning mx-auto" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button onClick={handleSave} size="lg" className="px-8">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Guardar Datos
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: P&L Preview */}
          {isSaved && pnl.sales > 0 && (
            <Card className="border-success/50 bg-success/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-success">
                  <TrendingUp className="h-5 w-5" />
                  Vista Previa P&L
                </CardTitle>
                <CardDescription>Resumen financiero del período</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 rounded-lg bg-background border">
                    <p className="text-sm text-muted-foreground">Ventas</p>
                    <p className="text-lg font-semibold">${pnl.sales.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background border">
                    <p className="text-sm text-muted-foreground">COGS</p>
                    <p className="text-lg font-semibold text-orange-600">-${pnl.cogs.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background border">
                    <p className="text-sm text-muted-foreground">Utilidad Bruta</p>
                    <p className="text-lg font-semibold text-blue-600">${pnl.grossProfit.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background border">
                    <p className="text-sm text-muted-foreground">OPEX Total</p>
                    <p className="text-lg font-semibold text-orange-600">-${pnl.totalExpenses.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-success/10 border border-success">
                    <p className="text-sm text-success">EBITDA</p>
                    <p className="text-xl font-bold text-success">
                      ${pnl.ebitda.toLocaleString()}
                    </p>
                    <p className="text-xs text-success">
                      {((pnl.ebitda / pnl.sales) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-center">
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Ver P&L Completo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AppLayout>
    </TooltipProvider>
  );
};

export default DatosPage;