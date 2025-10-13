import { ReactNode } from "react";
import { ProgressStepper } from "./ProgressStepper";

const ONBOARDING_STEPS = [
  { number: 1, label: "Bienvenida" },
  { number: 2, label: "Tiendas" },
  { number: 3, label: "Datos" },
  { number: 4, label: "Listo" },
];

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
}

export function OnboardingLayout({ children, currentStep }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header with logo and progress */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              CounterOS
            </h1>
            <span className="text-sm text-muted-foreground">
              Paso {currentStep} de {ONBOARDING_STEPS.length}
            </span>
          </div>
          <ProgressStepper currentStep={currentStep} steps={ONBOARDING_STEPS} />
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 sm:py-12">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
