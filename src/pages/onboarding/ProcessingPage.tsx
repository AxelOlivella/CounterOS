import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Circle, Loader2 } from "lucide-react";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type StepStatus = 'pending' | 'processing' | 'done';

interface ProcessingStep {
  label: string;
  status: StepStatus;
}

export default function ProcessingPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { label: 'Archivos validados', status: 'done' },
    { label: 'Leyendo facturas XML...', status: 'pending' },
    { label: 'Procesando ventas CSV...', status: 'pending' },
    { label: 'Categorizando compras...', status: 'pending' },
    { label: 'Calculando food cost...', status: 'pending' },
    { label: 'Generando dashboard...', status: 'pending' },
  ]);

  useEffect(() => {
    // Read from sessionStorage
    const uploadData = sessionStorage.getItem('onboarding_files');
    const storesData = sessionStorage.getItem('onboarding_stores');
    
    if (!uploadData || !storesData) {
      navigate('/onboarding/upload');
      return;
    }

    const upload = JSON.parse(uploadData);
    const numFacturas = upload.facturas?.length || 0;

    // Simulate processing with progressive steps
    const progressSteps = [
      { delay: 0, progress: 0, stepIndex: 0 },
      { delay: 800, progress: 20, stepIndex: 1 },
      { delay: 1600, progress: 40, stepIndex: 2 },
      { delay: 2400, progress: 60, stepIndex: 3 },
      { delay: 3200, progress: 80, stepIndex: 4 },
      { delay: 4000, progress: 100, stepIndex: 5 },
    ];

    progressSteps.forEach((step) => {
      setTimeout(() => {
        setProgress(step.progress);
        setSteps(prev => prev.map((s, i) => {
          if (i < step.stepIndex) return { ...s, status: 'done' as StepStatus };
          if (i === step.stepIndex) return { ...s, status: 'processing' as StepStatus };
          return s;
        }));
      }, step.delay);
    });

    // Save mock results and redirect
    setTimeout(() => {
      const mockResults = {
        foodCost: 32.4,
        compras: 127450,
        ventas: 393210,
        numFacturas,
        numVentas: 480,
        periodo: {
          inicio: '2024-09-01',
          fin: '2024-09-30'
        }
      };
      
      sessionStorage.setItem('onboarding_results', JSON.stringify(mockResults));
      navigate('/onboarding/success');
    }, 5000);
  }, [navigate]);

  const uploadData = JSON.parse(sessionStorage.getItem('onboarding_files') || '{}');
  const numFacturas = uploadData.facturas?.length || 0;

  return (
    <OnboardingLayout currentStep={3}>
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Procesando tus archivos...
        </h2>
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

        {/* File Info */}
        <div className="text-sm text-muted-foreground">
          {numFacturas} {numFacturas === 1 ? 'factura' : 'facturas'}, 1 archivo de ventas
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
