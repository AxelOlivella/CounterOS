import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Download,
  RefreshCw,
  FileDown
} from 'lucide-react';

export const POSUploadPage = () => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([
    {
      id: 1,
      name: 'ventas_enero_2024.csv',
      size: '2.1 MB',
      status: 'completed',
      records: 1247,
      errors: 0,
      uploadDate: '2024-01-20 14:30',
      store: 'Centro'
    },
    {
      id: 2,
      name: 'ventas_febrero_2024.csv',
      size: '1.8 MB',
      status: 'processing',
      records: 980,
      errors: 0,
      uploadDate: '2024-01-21 09:15',
      store: 'Norte'
    },
    {
      id: 3,
      name: 'ventas_diciembre_2023.csv',
      size: '3.2 MB',
      status: 'error',
      records: 1456,
      errors: 23,
      uploadDate: '2024-01-19 16:45',
      store: 'Sur'
    }
  ]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    console.log("Files dropped:", droppedFiles);
    // Handle file upload logic here
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completado
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
            Procesando
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        );
    }
  };

  const completedFiles = files.filter(f => f.status === 'completed');
  const totalRecords = completedFiles.reduce((sum, f) => sum + f.records, 0);
  const errorFiles = files.filter(f => f.status === 'error').length;

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Carga de Datos POS</h1>
          <p className="text-muted-foreground">
            Importar información de ventas desde su sistema POS
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Plantilla CSV
          </Button>
          <Button variant="outline">
            <FileDown className="w-4 h-4 mr-2" />
            Guía de Formato
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Archivos Procesados</p>
              <p className="text-2xl font-bold">{completedFiles.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Registros</p>
              <p className="text-2xl font-bold">{totalRecords.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">Con Errores</p>
              <p className="text-2xl font-bold text-red-600">{errorFiles}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-amber-600" />
            <div>
              <p className="text-sm text-muted-foreground">Último Proceso</p>
              <p className="text-lg font-semibold">Hoy 14:30</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Upload Area */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Cargar Nuevo Archivo</h3>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h4 className="text-lg font-medium mb-2">
            Arrastre su archivo CSV aquí
          </h4>
          <p className="text-muted-foreground mb-4">
            O haga clic para seleccionar desde su computadora
          </p>
          
          <div className="space-y-3">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer">
                Seleccionar Archivo CSV
              </Button>
            </label>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <Label htmlFor="store-select">Tienda</Label>
                <select 
                  id="store-select" 
                  className="w-full p-2 border rounded-lg bg-background"
                >
                  <option value="">Seleccionar tienda...</option>
                  <option value="centro">Centro</option>
                  <option value="norte">Norte</option>
                  <option value="sur">Sur</option>
                </select>
              </div>
              <div>
                <Label htmlFor="date-range">Período</Label>
                <Input 
                  id="date-range" 
                  placeholder="Ej: Enero 2024" 
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Format Information */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Formato requerido del CSV:
          </h5>
          <div className="bg-white p-3 rounded border font-mono text-sm overflow-x-auto">
            <div className="text-blue-600">store_id, datetime, ticket_id, sku_code, sku_name, qty, unit_price, payment_method</div>
            <div className="text-muted-foreground mt-1">CTR01, 2024-01-15 14:30:00, T001, YOG001, Yogurt Natural, 2, 45.00, Efectivo</div>
          </div>
          <div className="mt-2 text-sm text-blue-700">
            <strong>Notas importantes:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Fecha en formato: YYYY-MM-DD HH:MM:SS</li>
              <li>Precios sin símbol de moneda, solo números</li>
              <li>Cantidades pueden ser decimales (ej: 1.5)</li>
              <li>SKU codes deben coincidir con su catálogo</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* File History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Historial de Cargas</h3>
          <Button variant="outline" size="sm">
            Actualizar
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">Estado</th>
                <th className="text-left py-3 px-2">Archivo</th>
                <th className="text-left py-3 px-2">Tienda</th>
                <th className="text-right py-3 px-2">Tamaño</th>
                <th className="text-right py-3 px-2">Registros</th>
                <th className="text-right py-3 px-2">Errores</th>
                <th className="text-center py-3 px-2">Fecha de Carga</th>
                <th className="text-center py-3 px-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id} className="border-b hover:bg-muted/50 transition-colors">
                  <td className="py-4 px-2">
                    {getStatusBadge(file.status)}
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{file.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <Badge variant="outline">Tienda {file.store}</Badge>
                  </td>
                  <td className="py-4 px-2 text-right text-muted-foreground">
                    {file.size}
                  </td>
                  <td className="py-4 px-2 text-right font-semibold">
                    {file.records.toLocaleString()}
                  </td>
                  <td className="py-4 px-2 text-right">
                    {file.errors > 0 ? (
                      <span className="text-red-600 font-semibold">{file.errors}</span>
                    ) : (
                      <span className="text-green-600">0</span>
                    )}
                  </td>
                  <td className="py-4 px-2 text-center text-sm text-muted-foreground">
                    {file.uploadDate}
                  </td>
                  <td className="py-4 px-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {file.status === 'processing' && (
                        <div className="flex items-center gap-2">
                          <Progress value={65} className="w-16 h-2" />
                          <span className="text-xs">65%</span>
                        </div>
                      )}
                      {file.status === 'completed' && (
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      {file.status === 'error' && (
                        <Button variant="ghost" size="sm">
                          Ver Errores
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Resumen de Ventas Cargadas</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total tickets procesados:</span>
              <span className="font-semibold">1,247</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Ventas totales:</span>
              <span className="font-semibold">$847,530</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Período:</span>
              <span className="font-semibold">Ene 1 - Ene 21, 2024</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Próximos Pasos</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Validar mapping de SKUs
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Generar reporte P&L
            </Button>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Cargar datos de febrero
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};