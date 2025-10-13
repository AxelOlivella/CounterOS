import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingResults {
  foodCost: number;
  compras: number;
  ventas: number;
  periodo: {
    inicio: string;
    fin: string;
  };
}

interface Store {
  name: string;
  target_food_cost: number;
}

export default function SuccessPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState<OnboardingResults | null>(null);
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    // Read results from sessionStorage
    const resultsData = sessionStorage.getItem('onboarding_results');
    const storesData = sessionStorage.getItem('onboarding_stores');

    if (!resultsData) {
      // No results, redirect to welcome
      navigate('/onboarding/welcome', { replace: true });
      return;
    }

    const parsedResults = JSON.parse(resultsData);
    const parsedStores = storesData ? JSON.parse(storesData) : [];

    setResults(parsedResults);
    setStore(parsedStores[0] || { name: 'Mi tienda', target_food_cost: 28.5 });
  }, [navigate]);

  if (!results || !store) {
    return null;
  }

  const delta = results.foodCost - store.target_food_cost;
  const deltaStatus = delta <= 0 
    ? 'success' 
    : delta <= 3 
    ? 'warning' 
    : 'critical';

  const statusConfig = {
    success: {
      textColor: 'text-success',
      bgColor: 'bg-success/10',
    },
    warning: {
      textColor: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    critical: {
      textColor: 'text-critical',
      bgColor: 'bg-critical/10',
    },
  };

  const config = statusConfig[deltaStatus];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const nextSteps = [
    { label: 'Categorías de productos (lácteos, proteínas, etc.)', done: false },
    { label: 'Mapeo de facturas → categorías', done: false },
    { label: 'Recetas estándar (opcional pero recomendado)', done: false },
  ];

  return (
    <OnboardingLayout currentStep={4}>
      <div className="space-y-8 animate-fade-in">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="text-6xl animate-scale-in">🎉</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            ¡Listo!
          </h1>
          <p className="text-lg text-muted-foreground">
            Aquí está tu food cost
          </p>
        </div>

        {/* Result Card */}
        <Card className={cn(
          "p-8 text-center space-y-6 shadow-lg border-2 animate-scale-in",
          "bg-gradient-to-br from-card via-card to-muted/20"
        )}>
          <div>
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
              {store.name}
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              Food Cost
            </p>
          </div>

          {/* Animated Food Cost */}
          <div className="space-y-3">
            <div className={cn(
              "text-6xl sm:text-7xl font-bold tabular-nums",
              config.textColor
            )}>
              <AnimatedNumber value={results.foodCost} decimals={1} duration={1000} />%
            </div>

            {/* Delta vs Target */}
            <div className={cn(
              "inline-block px-4 py-2 rounded-full text-sm font-medium",
              config.bgColor,
              config.textColor
            )}>
              Meta: {store.target_food_cost.toFixed(1)}% → {delta > 0 ? '+' : ''}{delta.toFixed(1)}pts
            </div>
          </div>

          {/* Details */}
          <div className="pt-6 border-t border-border space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-3">Basado en:</p>
            <p>• Compras: {formatCurrency(results.compras)} (último mes)</p>
            <p>• Ventas: {formatCurrency(results.ventas)}</p>
            <p>• Período: {formatDate(results.periodo.inicio)} - {formatDate(results.periodo.fin)}</p>
          </div>
        </Card>

        {/* Next Steps Section */}
        <Card className="p-6 space-y-4 bg-muted/30">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div className="space-y-3 flex-1">
              <h3 className="text-lg font-semibold text-foreground">
                Siguiente paso
              </h3>
              <p className="text-sm text-muted-foreground">
                Para análisis más detallado necesitamos:
              </p>

              {/* Steps List */}
              <ul className="space-y-2">
                {nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    {step.done ? (
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                    )}
                    <span className={step.done ? 'text-foreground' : 'text-muted-foreground'}>
                      {step.label}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="text-sm text-muted-foreground italic">
                Puedes configurar esto ahora o después.
              </p>
            </div>
          </div>
        </Card>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => navigate('/resumen')}
          >
            Configurar ahora
          </Button>
          <Button
            size="lg"
            className="flex-1"
            onClick={() => navigate('/resumen')}
          >
            Ver mi dashboard →
          </Button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
