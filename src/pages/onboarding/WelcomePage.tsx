import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Store, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

type StoreCount = "single" | "multiple";

export default function WelcomePage() {
  const navigate = useNavigate();
  const [storeCount, setStoreCount] = useState<StoreCount | null>(null);

  const handleContinue = () => {
    if (!storeCount) return;
    
    logger.info("Onboarding: Usuario seleccionó", { storeCount });
    
    // Store selection in sessionStorage for next steps
    sessionStorage.setItem("onboarding_store_count", storeCount);
    
    navigate("/onboarding/stores");
  };

  return (
    <OnboardingLayout currentStep={1}>
      <div className="space-y-6 sm:space-y-8 animate-fade-in">
        {/* Welcome header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            ¡Bienvenido a CounterOS! 🎉
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto">
            En menos de 5 minutos tendrás tu primer food cost calculado
          </p>
        </div>

        {/* Store selection cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground text-center">
            ¿Cuántas tiendas vas a administrar?
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Single store option */}
            <Card
              className={cn(
                "p-6 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg",
                storeCount === "single"
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => setStoreCount("single")}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                    storeCount === "single"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Store className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Una tienda
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Perfecto para empezar o negocio único
                  </p>
                </div>
              </div>
            </Card>

            {/* Multiple stores option */}
            <Card
              className={cn(
                "p-6 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg",
                storeCount === "multiple"
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => setStoreCount("multiple")}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center transition-colors",
                    storeCount === "multiple"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Building2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Múltiples tiendas
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Gestiona varias ubicaciones desde un panel
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Continue button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleContinue}
            disabled={!storeCount}
            size="lg"
            className="w-full sm:w-auto min-w-[200px]"
          >
            Continuar →
          </Button>
        </div>

        {/* Info text */}
        <p className="text-xs text-center text-muted-foreground">
          No te preocupes, podrás agregar más tiendas después
        </p>
      </div>
    </OnboardingLayout>
  );
}
