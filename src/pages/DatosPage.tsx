import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StoreSelector } from '@/components/ui/store-selector';
import { useStoreSelection } from '@/hooks/useStoreSelection';
import { 
  Upload, 
  FileText, 
  Receipt, 
  CheckCircle, 
  AlertTriangle, 
  FileSpreadsheet,
  Calendar,
  DollarSign
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';

const DatosPage = () => {
  const { selectedStore, isConsolidatedView } = useStoreSelection();
  const [uploadedFiles, setUploadedFiles] = useState({
    sales: null as File | null,
    expenses: false,
    cfdi: null as File | null
  });

  const [expenseData, setExpenseData] = useState({
    rent: '',
    payroll: '',
    energy: '',
    marketing: '',
    other: ''
  });

  const handleFileUpload = (type: 'sales' | 'cfdi', file: File | null) => {
    setUploadedFiles(prev => ({
      ...prev,
      [type]: file
    }));
  };

  const handleExpenseSubmit = () => {
    setUploadedFiles(prev => ({
      ...prev,
      expenses: true
    }));
  };

  const getStatusColor = (status: boolean | File | null) => {
    if (status) return 'text-green-600';
    return 'text-orange-500';
  };

  const getStatusIcon = (status: boolean | File | null) => {
    if (status) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <AlertTriangle className="h-4 w-4 text-orange-500" />;
  };

  const getStatusText = (status: boolean | File | null) => {
    if (status) return 'Completado';
    return 'Pendiente';
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-6xl py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Carga de Datos
              </h1>
              <p className="text-muted-foreground">
                {isConsolidatedView 
                  ? 'Centraliza toda la información que necesitas para generar tus reportes'
                  : `Carga de datos para ${selectedStore?.name || 'tienda seleccionada'}`
                }
              </p>
            </div>
            <StoreSelector />
          </div>
        </div>

        {/* Status Checklist */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Estado del P&L
            </CardTitle>
            <CardDescription>
              Verifica que tengas toda la información necesaria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                {getStatusIcon(uploadedFiles.sales)}
                <div>
                  <p className="font-medium">Ventas</p>
                  <p className={`text-sm ${getStatusColor(uploadedFiles.sales)}`}>
                    {getStatusText(uploadedFiles.sales)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                {getStatusIcon(uploadedFiles.expenses)}
                <div>
                  <p className="font-medium">Gastos</p>
                  <p className={`text-sm ${getStatusColor(uploadedFiles.expenses)}`}>
                    {getStatusText(uploadedFiles.expenses)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <div className="flex items-center">
                  {uploadedFiles.sales && uploadedFiles.expenses ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium">P&L</p>
                  <p className={`text-sm ${uploadedFiles.sales && uploadedFiles.expenses ? 'text-green-600' : 'text-orange-500'}`}>
                    {uploadedFiles.sales && uploadedFiles.expenses ? 'Listo' : 'Faltan datos'}
                  </p>
                </div>
              </div>
            </div>
            
            {uploadedFiles.sales && uploadedFiles.expenses && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  ¡Perfecto! Ya puedes generar tu reporte P&L completo
                </p>
                <Button className="mt-2" size="sm">
                  Ver P&L →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Upload Tabs */}
        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sales">Ventas CSV</TabsTrigger>
            <TabsTrigger value="expenses">Gastos</TabsTrigger>
            <TabsTrigger value="cfdi">CFDI (Beta)</TabsTrigger>
          </TabsList>

          {/* Sales Upload */}
          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Carga de Ventas
                </CardTitle>
                <CardDescription>
                  Sube tu archivo CSV con las ventas del período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFileUpload('sales', e.target.files?.[0] || null)}
                      className="hidden"
                      id="sales-file"
                    />
                    <label htmlFor="sales-file" className="cursor-pointer">
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                        <div>
                          <p className="text-lg font-medium">
                            {uploadedFiles.sales ? uploadedFiles.sales.name : 'Selecciona archivo CSV'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Arrastra y suelta o haz clic para seleccionar
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Formato esperado:</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>• <code>fecha</code>: YYYY-MM-DD</p>
                      <p>• <code>sku</code>: Código del producto</p>
                      <p>• <code>cantidad</code>: Unidades vendidas</p>
                      <p>• <code>precio_unitario</code>: Precio por unidad</p>
                      <p>• <code>ticket_id</code>: ID de la venta</p>
                    </div>
                  </div>

                  {uploadedFiles.sales && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Archivo cargado correctamente
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expenses Form */}
          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Gastos del Mes
                </CardTitle>
                <CardDescription>
                  Captura rápida de gastos fijos y variables
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rent">Renta mensual</Label>
                      <Input
                        id="rent"
                        type="number"
                        value={expenseData.rent}
                        onChange={(e) => setExpenseData({...expenseData, rent: e.target.value})}
                        placeholder="25,000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="payroll">Nómina</Label>
                      <Input
                        id="payroll"
                        type="number"
                        value={expenseData.payroll}
                        onChange={(e) => setExpenseData({...expenseData, payroll: e.target.value})}
                        placeholder="35,000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="energy">Energía y servicios</Label>
                      <Input
                        id="energy"
                        type="number"
                        value={expenseData.energy}
                        onChange={(e) => setExpenseData({...expenseData, energy: e.target.value})}
                        placeholder="8,000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="marketing">Marketing (% de ventas)</Label>
                      <Input
                        id="marketing"
                        type="number"
                        value={expenseData.marketing}
                        onChange={(e) => setExpenseData({...expenseData, marketing: e.target.value})}
                        placeholder="3"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="other">Otros gastos</Label>
                    <Input
                      id="other"
                      type="number"
                      value={expenseData.other}
                      onChange={(e) => setExpenseData({...expenseData, other: e.target.value})}
                      placeholder="5,000"
                    />
                  </div>

                  <Button onClick={handleExpenseSubmit} className="w-full">
                    Guardar Gastos
                  </Button>

                  {uploadedFiles.expenses && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Gastos guardados correctamente
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CFDI Upload */}
          <TabsContent value="cfdi">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Facturas CFDI
                  <Badge variant="secondary">Beta</Badge>
                </CardTitle>
                <CardDescription>
                  Procesamiento automático de facturas (próximamente disponible)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center opacity-50">
                    <Receipt className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div className="space-y-2 mt-4">
                      <p className="text-lg font-medium">Carga de CFDI</p>
                      <p className="text-sm text-muted-foreground">
                        Esta funcionalidad estará disponible pronto
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">¿Qué podrás hacer?</h4>
                    <ul className="space-y-1 text-sm text-blue-600">
                      <li>• Carga automática de facturas XML</li>
                      <li>• Extracción de datos de proveedores</li>
                      <li>• Clasificación automática de gastos</li>
                      <li>• Integración directa con el P&L</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">Ver Food Cost</p>
                  <p className="text-xs text-muted-foreground">Análisis de costos</p>
                </div>
              </Button>
              
              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <Receipt className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">Generar P&L</p>
                  <p className="text-xs text-muted-foreground">Reporte financiero</p>
                </div>
              </Button>
              
              <Button variant="outline" className="h-auto p-4">
                <div className="text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">Configurar Alertas</p>
                  <p className="text-xs text-muted-foreground">Automatización</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default DatosPage;