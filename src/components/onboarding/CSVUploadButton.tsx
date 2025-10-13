import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, AlertCircle } from "lucide-react";
import { StoreFormData } from "@/lib/schemas/storeSchema";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { logger } from "@/lib/logger";

interface CSVUploadButtonProps {
  onStoresLoaded: (stores: StoreFormData[]) => void;
}

export function CSVUploadButton({ onStoresLoaded }: CSVUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const parseCSV = (content: string): StoreFormData[] => {
    const lines = content.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('El CSV debe contener al menos una línea de encabezado y una tienda');
    }

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const requiredHeaders = ['nombre', 'ubicacion', 'concepto', 'meta_fc'];
    
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Faltan columnas: ${missingHeaders.join(', ')}`);
    }

    const stores: StoreFormData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < 4) continue;

      const nameIdx = headers.indexOf('nombre');
      const locationIdx = headers.indexOf('ubicacion');
      const conceptIdx = headers.indexOf('concepto');
      const fcIdx = headers.indexOf('meta_fc');

      const concept = values[conceptIdx] as StoreFormData['concept'];
      const validConcepts = ['fast_casual', 'qsr', 'casual_dining', 'fine_dining', 'frozen_yogurt', 'cafeteria', 'otro'];
      
      if (!validConcepts.includes(concept)) {
        logger.warn(`Concepto inválido en línea ${i + 1}: ${concept}`);
        continue;
      }

      stores.push({
        name: values[nameIdx],
        location: values[locationIdx],
        concept,
        targetFoodCost: parseFloat(values[fcIdx]) || 28.5,
      });
    }

    return stores;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Archivo inválido",
        description: "Solo se aceptan archivos CSV",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const content = await file.text();
      const stores = parseCSV(content);

      if (stores.length === 0) {
        throw new Error('No se encontraron tiendas válidas en el archivo');
      }

      logger.info('CSV cargado exitosamente', { storesCount: stores.length });
      onStoresLoaded(stores);

      toast({
        title: "¡CSV cargado!",
        description: `Se importaron ${stores.length} tienda${stores.length > 1 ? 's' : ''}`,
      });

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      logger.error('Error al procesar CSV', error);
      toast({
        title: "Error al procesar CSV",
        description: error instanceof Error ? error.message : "Verifica el formato del archivo",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">O más rápido:</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="gap-2"
        >
          <FileUp className="w-4 h-4" />
          {isProcessing ? "Procesando..." : "Subir CSV con lista de tiendas"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <Alert className="bg-muted/50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-xs">
          <strong>Formato CSV esperado:</strong>
          <pre className="mt-1 text-xs bg-background p-2 rounded overflow-x-auto">
{`nombre,ubicacion,concepto,meta_fc
Portal Centro,Hermosillo,fast_casual,28.5
Plaza Norte,CDMX,qsr,30.0`}
          </pre>
        </AlertDescription>
      </Alert>
    </div>
  );
}
