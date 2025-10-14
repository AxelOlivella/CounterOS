import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { FilePreview } from "@/components/onboarding/FilePreview";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateXMLFacturas, validateCSVVentasWithPreview, validateConsistencia } from "@/lib/validators/fileValidator";
import { ArrowLeft, Loader2, TrendingUp, AlertTriangle } from "lucide-react";
import { logger } from "@/lib/logger";

export default function PreviewPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [xmlValidation, setXmlValidation] = useState<any>(null);
  const [csvValidation, setCsvValidation] = useState<any>(null);
  const [consistencia, setConsistencia] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    validateFiles();
  }, []);

  async function validateFiles() {
    try {
      setLoading(true);
      
      // Leer archivos de sessionStorage
      const filesData = sessionStorage.getItem('onboarding_files');
      const storesData = sessionStorage.getItem('onboarding_stores');
      const csvMappingData = sessionStorage.getItem('csv_mapping');
      
      if (!filesData || !storesData) {
        throw new Error('No se encontraron archivos. Por favor regresa y sube los archivos nuevamente.');
      }
      
      const files = JSON.parse(filesData);
      const csvMapping = csvMappingData ? JSON.parse(csvMappingData) : undefined;
      
      logger.info('Validating files for preview', {
        numFacturas: files.facturas?.length || 0,
        hasVentas: !!files.ventas,
        hasMapping: !!csvMapping
      });

      // Validar XMLs
      const facturasArray = files.facturas || [];
      const facturasForValidation = facturasArray.map((content: string, i: number) => ({
        name: `factura_${i + 1}.xml`,
        content
      }));

      const xmlResult = await validateXMLFacturas(facturasForValidation);
      setXmlValidation(xmlResult);

      // Validar CSV con mapping si existe
      if (files.ventas) {
        const csvResult = await validateCSVVentasWithPreview(files.ventas, csvMapping);
        setCsvValidation(csvResult);

        // Validar consistencia entre ambos
        if (xmlResult.allValid && csvResult.valid && csvResult.preview) {
          // Calcular fechas de facturas
          const facturasConPreview = xmlResult.results.filter((r: any) => r.valid && r.preview);
          const fechasFacturas = facturasConPreview.map((r: any) => new Date(r.preview.fecha));
          const facturasInicio = new Date(Math.min(...fechasFacturas.map((f: Date) => f.getTime())));
          const facturasFin = new Date(Math.max(...fechasFacturas.map((f: Date) => f.getTime())));

          const consistenciaResult = validateConsistencia(
            xmlResult.totalMonto,
            facturasInicio,
            facturasFin,
            csvResult.preview.totalVentas,
            csvResult.preview.fechaInicio,
            csvResult.preview.fechaFin
          );
          setConsistencia(consistenciaResult);
        }
      }

      setLoading(false);
    } catch (err: any) {
      logger.error('Validation failed', err);
      setError(err.message || 'Error al validar archivos');
      setLoading(false);
    }
  }

  function handleBack() {
    navigate('/onboarding/upload');
  }

  function handleConfirm() {
    // Validar que todo esté OK
    if (!xmlValidation?.allValid) {
      return;
    }

    if (!csvValidation?.valid) {
      return;
    }

    // Navegar a processing
    navigate('/onboarding/processing');
  }

  const canProceed = xmlValidation?.allValid && csvValidation?.valid;

  if (loading) {
    return (
      <OnboardingLayout currentStep={3}>
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Validando archivos...</p>
        </div>
      </OnboardingLayout>
    );
  }

  if (error) {
    return (
      <OnboardingLayout currentStep={3}>
        <div className="text-center py-10">
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a subir archivos
          </Button>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout currentStep={3}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Revisa tus archivos
          </h2>
          <p className="text-muted-foreground text-sm">
            Verifica que la información sea correcta antes de continuar
          </p>
        </div>

        {/* File Previews */}
        <div className="space-y-4">
          {xmlValidation && (
            <FilePreview type="xml" data={xmlValidation} />
          )}

          {csvValidation && (
            <FilePreview type="csv" data={csvValidation} />
          )}
        </div>

        {/* Food Cost Estimado */}
        {consistencia && canProceed && (
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Food Cost Estimado</p>
                <p className="text-3xl font-bold text-primary">
                  {consistencia.foodCostEstimado.toFixed(1)}%
                </p>
              </div>
            </div>

            {consistencia.warnings && consistencia.warnings.length > 0 && (
              <div className="mt-4 space-y-2">
                {consistencia.warnings.map((warning: string, i: number) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Errors Alert */}
        {!canProceed && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>No se puede continuar.</strong> Corrige los errores detectados en tus archivos y vuelve a intentarlo.
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Ajustar archivos
          </Button>
          
          <Button 
            onClick={handleConfirm}
            disabled={!canProceed}
            className="flex-1"
          >
            Confirmar y guardar
          </Button>
        </div>

        {/* Helper Text */}
        <p className="text-xs text-center text-muted-foreground">
          {canProceed 
            ? '✓ Todo listo para procesar tus datos'
            : '✗ Corrige los errores antes de continuar'
          }
        </p>
      </div>
    </OnboardingLayout>
  );
}
