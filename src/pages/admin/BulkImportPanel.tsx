import { useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BulkImportPanel() {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const handleImport = async () => {
    setImporting(true);
    setProgress(0);
    setLogs(['🚀 Iniciando importación masiva...']);
    
    // TODO: Implementar lógica de importación real
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress(i);
      setLogs(prev => [...prev, `✅ Procesando... ${i}%`]);
    }
    
    setLogs(prev => [...prev, '🎉 Importación completada exitosamente']);
    setImporting(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Importación Masiva</h2>
      <p className="text-muted-foreground mb-6">
        Para clientes que ya tienen data estructurada lista para importar
      </p>

      {/* Upload areas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-6 border-2 border-dashed border-border rounded-lg hover:border-primary transition cursor-pointer">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
            <h3 className="font-medium mb-1">Facturas XML</h3>
            <p className="text-sm text-muted-foreground mb-3">
              ZIP con 100+ archivos XML del SAT
            </p>
            <input
              type="file"
              accept=".zip"
              className="hidden"
              id="xml-upload"
            />
            <label
              htmlFor="xml-upload"
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm cursor-pointer inline-block"
            >
              Seleccionar ZIP
            </label>
          </div>
        </div>

        <div className="p-6 border-2 border-dashed border-border rounded-lg hover:border-primary transition cursor-pointer">
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
            <h3 className="font-medium mb-1">Ventas CSV</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Historial de ventas (365+ días)
            </p>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              id="sales-upload"
            />
            <label
              htmlFor="sales-upload"
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm cursor-pointer inline-block"
            >
              Seleccionar CSV
            </label>
          </div>
        </div>

        <div className="p-6 border-2 border-dashed border-border rounded-lg hover:border-primary transition cursor-pointer">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
            <h3 className="font-medium mb-1">Inventario CSV</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Lista de ingredientes (5000+ SKUs)
            </p>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              id="inventory-upload"
            />
            <label
              htmlFor="inventory-upload"
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm cursor-pointer inline-block"
            >
              Seleccionar CSV
            </label>
          </div>
        </div>
      </div>

      {/* Progress & Logs */}
      {importing && (
        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progreso de importación</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 max-h-64 overflow-y-auto">
            <div className="space-y-1 font-mono text-xs">
              {logs.map((log, i) => (
                <div key={i} className="text-muted-foreground">{log}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button 
          onClick={handleImport}
          disabled={importing}
          className="flex-1"
        >
          {importing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Importando...
            </>
          ) : (
            'Iniciar Importación'
          )}
        </Button>
      </div>
    </div>
  );
}
