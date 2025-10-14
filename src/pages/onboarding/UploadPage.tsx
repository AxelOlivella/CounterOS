import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { FileDropZone } from "@/components/onboarding/FileDropZone";
import { FilePreviewCard } from "@/components/onboarding/FilePreviewCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Download, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

export default function UploadPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [facturaFiles, setFacturaFiles] = useState<File[]>([]);
  const [ventasFile, setVentasFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if user has stores configured
  useEffect(() => {
    const stores = sessionStorage.getItem("onboarding_stores");
    if (!stores) {
      toast({
        title: "Configura tus tiendas primero",
        description: "Debes configurar al menos una tienda antes de subir datos",
        variant: "destructive",
      });
      navigate("/onboarding/stores");
    }
  }, [navigate, toast]);

  const handleFacturasSelected = (files: File[]) => {
    setFacturaFiles(prev => [...prev, ...files]);
    logger.info("Facturas agregadas", { 
      count: files.length,
      totalCount: facturaFiles.length + files.length 
    });
    toast({
      title: "Facturas agregadas",
      description: `${files.length} archivo${files.length > 1 ? 's' : ''} agregado${files.length > 1 ? 's' : ''}`,
    });
  };

  const handleVentasSelected = (files: File[]) => {
    const file = files[0];
    if (file) {
      setVentasFile(file);
      logger.info("Archivo de ventas seleccionado", { 
        fileName: file.name,
        fileSize: file.size 
      });
      toast({
        title: "Archivo de ventas cargado",
        description: file.name,
      });
    }
  };

  const removeFactura = (index: number) => {
    const fileName = facturaFiles[index].name;
    setFacturaFiles(prev => prev.filter((_, i) => i !== index));
    logger.debug("Factura eliminada", { fileName });
    toast({
      title: "Factura eliminada",
      description: fileName,
    });
  };

  const removeVentas = () => {
    const fileName = ventasFile?.name;
    setVentasFile(null);
    logger.debug("Archivo de ventas eliminado", { fileName });
    toast({
      title: "Archivo eliminado",
      description: fileName,
    });
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/plantilla_ventas.csv';
    link.download = 'plantilla_ventas.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logger.info("Plantilla CSV descargada");
  };

  const canProceed = facturaFiles.length > 0 && ventasFile !== null;

  const handleProcesar = async () => {
    if (!canProceed) return;

    setIsProcessing(true);
    
    try {
      // Leer contenido de archivos XML
      const facturasContent = [];
      
      for (const file of facturaFiles) {
        const content = await file.text(); // Lee como texto
        facturasContent.push(content);
      }
      
      // Leer contenido CSV
      let ventasContent = '';
      if (ventasFile) {
        ventasContent = await ventasFile.text();
      }
      
      // Guardar en sessionStorage
      sessionStorage.setItem('onboarding_files', JSON.stringify({
        facturas: facturasContent,
        ventas: ventasContent
      }));
      
      logger.info('Files saved to session', {
        numFacturas: facturasContent.length,
        ventasSize: ventasContent.length
      });

      toast({
        title: "Archivos guardados",
        description: "Revisando contenido...",
      });

      // Navigate to preview page (validation before processing)
      navigate("/onboarding/preview");
    } catch (error) {
      logger.error("Failed to read files", error);
      toast({
        title: "Error",
        description: "No se pudieron leer los archivos. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    navigate("/onboarding/stores");
  };

  return (
    <OnboardingLayout currentStep={3}>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Paso 3: Sube tu primera data
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
            Para calcular food cost necesitamos tus compras (facturas de ingredientes) y ventas (facturación)
          </p>
        </div>

        {/* Facturas Section */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">
              📦 Paso 3A: Compras
            </h2>
            <p className="text-sm text-muted-foreground">
              Sube tus facturas XML del SAT
            </p>
          </div>

          <FileDropZone
            accept=".xml"
            multiple
            maxSize={5_000_000}
            fileType="xml"
            onFilesSelected={handleFacturasSelected}
            title="Arrastra archivos XML aquí"
            description="o haz click para seleccionar"
          />

          {/* Facturas List */}
          {facturaFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">
                  Archivos subidos ({facturaFiles.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.querySelector<HTMLDivElement>('[data-dropzone="facturas"]')?.click()}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Subir más
                </Button>
              </div>
              
              <div className="space-y-2" data-dropzone="facturas">
                {facturaFiles.map((file, index) => (
                  <FilePreviewCard
                    key={`${file.name}-${index}`}
                    file={file}
                    index={index}
                    onRemove={() => removeFactura(index)}
                  />
                ))}
              </div>
            </div>
          )}

          <Alert className="bg-blue-50 border-blue-200">
            <AlertDescription className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> Puedes subir facturas de 1 mes o más para obtener un cálculo más preciso
            </AlertDescription>
          </Alert>
        </section>

        {/* Divider */}
        <div className="border-t" />

        {/* Ventas Section */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">
              💰 Paso 3B: Ventas
            </h2>
            <p className="text-sm text-muted-foreground">
              Sube tus ventas en formato CSV
            </p>
          </div>

          <FileDropZone
            accept=".csv"
            multiple={false}
            maxSize={10_000_000}
            fileType="csv"
            onFilesSelected={handleVentasSelected}
            disabled={!!ventasFile}
            title="Arrastra archivo CSV aquí"
            description="o haz click para seleccionar"
          />

          {/* Ventas File Preview */}
          {ventasFile && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-foreground">
                Archivo subido
              </h3>
              <FilePreviewCard
                file={ventasFile}
                onRemove={removeVentas}
              />
            </div>
          )}

          {/* CSV Template */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">
                ¿No tienes el formato correcto?
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar plantilla
              </Button>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Formato CSV esperado:
              </p>
              <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
{`fecha,monto_total,tienda
2024-09-01,15234.50,Portal Centro
2024-09-02,18945.20,Portal Centro`}
              </pre>
            </div>
          </Card>
        </section>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isProcessing}
            className="w-full sm:w-auto gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </Button>
          <Button
            onClick={handleProcesar}
            disabled={!canProceed || isProcessing}
            className="w-full sm:flex-1 gap-2"
          >
            {isProcessing && <Loader2 className="w-4 h-4 animate-spin" />}
            {isProcessing ? "Procesando..." : "Procesar archivos →"}
          </Button>
        </div>

        {!canProceed && (
          <p className="text-sm text-center text-muted-foreground">
            Sube al menos 1 factura XML y 1 archivo CSV de ventas para continuar
          </p>
        )}
      </div>
    </OnboardingLayout>
  );
}
