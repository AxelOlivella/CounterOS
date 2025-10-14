import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Circle, Loader2 } from "lucide-react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { parseXMLFactura } from '@/lib/parsers/xmlParser';
import { parseCSVVentasWithMapping } from '@/lib/parsers/csvParser';
import { calculateFoodCostSummary } from '@/lib/api/onboarding';
import { logger } from '@/lib/logger';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

type StepStatus = 'pending' | 'processing' | 'done';

interface ProcessingStep {
  label: string;
  status: StepStatus;
}

export default function ProcessingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Validando archivos...');
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { label: 'Archivos validados', status: 'done' },
    { label: 'Leyendo facturas XML...', status: 'pending' },
    { label: 'Procesando ventas CSV...', status: 'pending' },
    { label: 'Categorizando compras...', status: 'pending' },
    { label: 'Calculando food cost...', status: 'pending' },
    { label: 'Guardando en base de datos...', status: 'pending' },
  ]);

  useEffect(() => {
    processUploadedFiles();
  }, []);

  async function processUploadedFiles() {
    try {
      // STEP 1: Leer archivos de sessionStorage
      setCurrentStep('Leyendo archivos...');
      setProgress(5);
      
      const filesData = sessionStorage.getItem('onboarding_files');
      const storesData = sessionStorage.getItem('onboarding_stores');
      const csvMappingData = sessionStorage.getItem('csv_mapping');
      
      if (!filesData || !storesData) {
        throw new Error('No se encontraron archivos o tiendas en sesión');
      }
      
      const files = JSON.parse(filesData);
      const stores = JSON.parse(storesData);
      const csvMapping = csvMappingData ? JSON.parse(csvMappingData) : undefined;
      
      logger.info('Starting file processing', {
        numFacturas: files.facturas?.length || 0,
        hasVentas: !!files.ventas
      });
      
      // STEP 2: Parse XMLs (facturas)
      updateStepStatus(1, 'processing');
      setCurrentStep('Procesando facturas XML...');
      setProgress(20);
      
      const facturasParsed = [];
      
      if (files.facturas && Array.isArray(files.facturas)) {
        for (let i = 0; i < files.facturas.length; i++) {
          const xmlContent = files.facturas[i];
          
          try {
            const parsed = await parseXMLFactura(xmlContent);
            facturasParsed.push(parsed);
            
            logger.debug('Factura parsed', {
              index: i + 1,
              uuid: parsed.uuid,
              total: parsed.total
            });
            
            // Update progress
            const progressIncrement = 30 / files.facturas.length;
            setProgress(prev => Math.min(prev + progressIncrement, 50));
            
          } catch (error: any) {
            logger.error('Failed to parse factura', error);
            // Error específico con contexto
            const xmlPreview = xmlContent.substring(0, 200);
            const hasUUID = xmlContent.includes('UUID') || xmlContent.includes('uuid');
            
            throw new Error(
              `Error en factura ${i + 1} (archivo #${i + 1}): ${error.message}. ` +
              `${!hasUUID ? 'Falta UUID fiscal. ' : ''}` +
              `Verifica que sea un CFDI 4.0 válido.`
            );
          }
        }
      }
      
      updateStepStatus(1, 'done');
      
      // STEP 3: Parse CSV (ventas)
      updateStepStatus(2, 'processing');
      setCurrentStep('Procesando ventas CSV...');
      setProgress(55);
      
      let ventasParsed = [];
      
      if (files.ventas) {
        try {
          const parseResult = await parseCSVVentasWithMapping(files.ventas, csvMapping);
          ventasParsed = parseResult.data;
          
          logger.info('Ventas parsed with mapping', {
            count: ventasParsed.length,
            totalMonto: ventasParsed.reduce((s, v) => s + v.montoTotal, 0),
            mapping: parseResult.mapping,
            confidence: parseResult.confidence,
            errors: parseResult.errors
          });
          
          if (parseResult.errors.length > 0) {
            logger.warn('CSV parsing had errors', parseResult.errors.slice(0, 5));
          }
          
          if (ventasParsed.length === 0) {
            throw new Error('No se pudieron parsear ventas del CSV. Verifica el formato.');
          }
          
        } catch (error: any) {
          logger.error('Failed to parse ventas', error);
          
          const lines = files.ventas.split('\n');
          const preview = lines.slice(0, 3).join('\n');
          
          throw new Error(
            `Error en CSV de ventas: ${error.message}. ` +
            `Vista previa: ${preview.substring(0, 100)}...`
          );
        }
      }
      
      updateStepStatus(2, 'done');
      updateStepStatus(3, 'done'); // Categorizando es automático
      setProgress(65);
      
      // STEP 4: Calculate summary (antes de guardar)
      updateStepStatus(4, 'processing');
      setCurrentStep('Calculando food cost...');
      
      const summary = calculateFoodCostSummary(facturasParsed, ventasParsed);
      
      logger.info('Food cost calculated', summary);
      
      updateStepStatus(4, 'done');
      setProgress(70);
      
      // STEP 5: Guardar en Supabase (usando Edge Function con transacción atómica)
      updateStepStatus(5, 'processing');
      setCurrentStep('Guardando en base de datos...');
      
      // Obtener tenantId del usuario actual
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Usuario no autenticado');
      }

      // Obtener tenant_id del usuario
      const { data: userProfile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('auth_user_id', userData.user.id)
        .single();

      if (!userProfile?.tenant_id) {
        throw new Error('No se encontró el tenant del usuario');
      }

      // Llamar a edge function con transacción atómica
      const { data: edgeResult, error: edgeError } = await supabase.functions.invoke('save-onboarding-transactional', {
        body: {
          tenantId: userProfile.tenant_id,
          stores,
          facturas: facturasParsed,
          ventas: ventasParsed
        }
      });

      if (edgeError) {
        throw new Error(`Error en edge function: ${edgeError.message}`);
      }

      if (!edgeResult?.success) {
        throw new Error(edgeResult?.error || 'Error desconocido al guardar datos');
      }

      logger.info('Data saved via edge function', edgeResult);
      
      updateStepStatus(5, 'done');
      setProgress(90);
      
      // STEP 6: Guardar resultados para success page
      const resultsToSave = {
        foodCost: summary.foodCost,
        compras: summary.compras,
        ventas: summary.ventas,
        periodo: edgeResult.summary,
        storesCreated: edgeResult.stores
      };
      
      sessionStorage.setItem('onboarding_results', JSON.stringify(resultsToSave));
      
      logger.info('Onboarding completed successfully', resultsToSave);
      
      // STEP 7: Done!
      setCurrentStep('¡Listo!');
      setProgress(100);
      
      // Wait 1 second para que usuario vea 100%
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to success
      navigate('/onboarding/success');
      
    } catch (error: any) {
      logger.error('Processing failed', error);
      
      setError(error.message || 'Error procesando archivos');
      setCurrentStep('Error en procesamiento');
      
      toast({
        title: "Error al procesar",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      });
    }
  }

  function updateStepStatus(index: number, status: StepStatus) {
    setSteps(prev => prev.map((s, i) => 
      i === index ? { ...s, status } : s
    ));
  }

  return (
    <OnboardingLayout currentStep={3}>
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          {error ? '❌ Error al procesar' : 'Procesando tus archivos...'}
        </h2>
        {error && (
          <p className="text-sm text-destructive mt-2">{error}</p>
        )}
      </div>

      <div className="flex flex-col items-center space-y-8 py-8">
        {/* Spinner */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-md space-y-2">
          <Progress 
            value={progress} 
            className="h-3 transition-all duration-500"
          />
          <p className="text-sm text-center text-muted-foreground">
            {progress}%
          </p>
        </div>

        {/* Current Step Info */}
        <div className="text-sm text-muted-foreground">
          {currentStep}
        </div>

        {/* Steps List */}
        <div className="w-full max-w-md space-y-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-all duration-300",
                step.status === 'done' && "bg-green-50 dark:bg-green-950/20",
                step.status === 'processing' && "bg-primary/5 animate-pulse",
                step.status === 'pending' && "bg-muted/50"
              )}
            >
              <div className="flex-shrink-0">
                {step.status === 'done' && (
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center animate-scale-in">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                {step.status === 'processing' && (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                )}
                {step.status === 'pending' && (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <p className={cn(
                "text-sm font-medium transition-colors",
                step.status === 'done' && "text-green-600 dark:text-green-400",
                step.status === 'processing' && "text-primary",
                step.status === 'pending' && "text-muted-foreground"
              )}>
                {step.label}
              </p>
            </div>
          ))}
        </div>

        {/* Estimated Time */}
        <p className="text-xs text-muted-foreground">
          Esto puede tomar 30-60 segundos
        </p>
      </div>
    </OnboardingLayout>
  );
}
