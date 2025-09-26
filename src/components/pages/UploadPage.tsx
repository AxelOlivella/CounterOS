import { useState } from 'react';
import { FileDropZone } from '@/components/upload/FileDropZone';
import { FileProcessor } from '@/components/upload/FileProcessor';
import { UploadHistory } from '@/components/upload/UploadHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, HelpCircle, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadStats } from '@/components/upload/UploadStats';

export const UploadPage = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleFilesAccepted = (files: File[]) => {
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleProcessingComplete = () => {
    setSelectedFiles([]);
    setRefreshTrigger(prev => prev + 1);
  };

  const downloadTemplate = (type: string) => {
    const templates = {
      sales: `date,store_code,gross_sales,discounts,transactions
2025-01-26,HMO-001,28500,850,185
2025-01-25,HMO-001,22300,650,142
2025-01-24,HMO-001,31200,920,201`,
      expenses: `date,store_code,category,amount,note
2025-01-26,HMO-001,renta,25000,Renta mensual local
2025-01-26,HMO-001,servicios,4200,CFE y agua
2025-01-26,HMO-001,marketing,2500,Publicidad digital`,
      inventory: `date,store_code,opening_value,closing_value,waste_value
2025-01-26,HMO-001,15000,12500,350
2025-01-25,HMO-001,16200,15000,420
2025-01-24,HMO-001,14800,16200,280`
    };

    const content = templates[type as keyof typeof templates];
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${type}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subida de Datos</h1>
          <p className="text-muted-foreground">
            Importa ventas, gastos, inventarios y facturas CFDI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <HelpCircle className="h-4 w-4 mr-2" />
            Guía de Formatos
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          <strong>Formatos soportados:</strong> CSV para ventas/gastos/inventarios, XML para CFDI. 
          Máximo 10MB por archivo. Los archivos CSV deben tener encabezados en la primera línea.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload">Subir Archivos</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* File Upload */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Seleccionar Archivos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FileDropZone onFilesAccepted={handleFilesAccepted} />
                </CardContent>
              </Card>

              {selectedFiles.length > 0 && (
                <FileProcessor 
                  files={selectedFiles}
                  onProcessingComplete={handleProcessingComplete}
                  onRemoveFile={handleRemoveFile}
                />
              )}
            </div>

            <div className="space-y-6">
              {/* Format Guide */}
              <Card>
                <CardHeader>
                  <CardTitle>Guía de Formatos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">📊 Ventas CSV</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Columnas requeridas: date, store_code, gross_sales, discounts, transactions
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Fecha formato: YYYY-MM-DD</li>
                      <li>• Códigos de tienda deben existir</li>
                      <li>• Valores numéricos sin comas</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">💰 Gastos CSV</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Columnas requeridas: date, store_code, category, amount
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Categorías: renta, servicios, marketing, etc.</li>
                      <li>• Columna opcional: note</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">📦 Inventario CSV</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Columnas: date, store_code, opening_value, closing_value, waste_value
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">🧾 CFDI XML</h4>
                    <p className="text-sm text-muted-foreground">
                      Archivos XML CFDI 3.3 o 4.0 válidos con estructura estándar SAT.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <UploadStats />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descargar Plantillas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-2 border-dashed">
                  <CardContent className="p-4 text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium mb-2">Ventas CSV</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Plantilla con formato para datos de ventas diarias
                    </p>
                    <Button size="sm" variant="outline" onClick={() => downloadTemplate('sales')}>
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed">
                  <CardContent className="p-4 text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium mb-2">Gastos CSV</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Plantilla para registro de gastos operativos
                    </p>
                    <Button size="sm" variant="outline" onClick={() => downloadTemplate('expenses')}>
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed">
                  <CardContent className="p-4 text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium mb-2">Inventarios CSV</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Plantilla para conteos de inventario diario
                    </p>
                    <Button size="sm" variant="outline" onClick={() => downloadTemplate('inventory')}>
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <HelpCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Consejos:</strong> Usa las plantillas como base, manteniendo los nombres de columnas exactos. 
                  Para CFDI XML, simplemente sube los archivos XML recibidos del SAT.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <UploadHistory refreshTrigger={refreshTrigger} />
        </TabsContent>
      </Tabs>
    </div>
  );
};