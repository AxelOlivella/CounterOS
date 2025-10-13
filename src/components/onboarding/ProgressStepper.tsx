import { cn } from "@/lib/utils";

interface Step {
  number: number;
  label: string;
}

interface ProgressStepperProps {
  currentStep: number;
  steps: Step[];
  className?: string;
}

export function ProgressStepper({ currentStep, steps, className }: ProgressStepperProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step circle */}
            <div className="relative flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300",
                  currentStep >= step.number
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {currentStep > step.number ? (
                  <span className="text-lg">✓</span>
                ) : (
                  step.number
                )}
              </div>
              {/* Step label - hidden on mobile */}
              <span
                className={cn(
                  "hidden sm:block mt-2 text-xs font-medium transition-colors",
                  currentStep >= step.number
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 sm:mx-4">
                <div
                  className={cn(
                    "h-full transition-all duration-300",
                    currentStep > step.number
                      ? "bg-primary"
                      : "bg-muted"
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile step label */}
      <div className="sm:hidden text-center mt-2">
        <span className="text-sm font-medium text-foreground">
          {steps.find(s => s.number === currentStep)?.label}
        </span>
      </div>
    </div>
  );
}
