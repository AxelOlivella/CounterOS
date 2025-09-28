// Alert Item Component
// Actionable alerts with severity indicators and impact calculations

import { cn } from '@/lib/utils';
import { formatMXN, formatPP, getImpactColor } from '@/lib/finance';
import { AlertTriangle, TrendingDown, TrendingUp, Info, ChevronRight } from 'lucide-react';

type AlertSeverity = 'high' | 'medium' | 'low' | 'info';

interface AlertItemProps {
  id: string;
  severity: AlertSeverity;
  title: string;
  subtitle: string;
  cause?: string;
  impactMoney?: number;
  impactPP?: number;
  actionLabel?: string;
  onAction?: (alertId: string) => void;
  className?: string;
}

const severityConfig = {
  high: {
    icon: AlertTriangle,
    bgColor: 'bg-warn-50',
    borderColor: 'border-warn-200',
    iconColor: 'text-warn-500',
    titleColor: 'text-warn-900',
    dotColor: 'bg-warn-500',
  },
  medium: {
    icon: TrendingDown,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-500',
    titleColor: 'text-yellow-900',
    dotColor: 'bg-yellow-500',
  },
  low: {
    icon: TrendingUp,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-900',
    dotColor: 'bg-blue-500',
  },
  info: {
    icon: Info,
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    iconColor: 'text-gray-500',
    titleColor: 'text-gray-900',
    dotColor: 'bg-gray-500',
  },
};

export default function AlertItem({
  id,
  severity,
  title,
  subtitle,
  cause,
  impactMoney,
  impactPP,
  actionLabel = 'Revisar',
  onAction,
  className,
}: AlertItemProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  const handleClick = () => {
    if (onAction) {
      onAction(id);
    }
  };

  return (
    <div
      className={cn(
        // Base styles
        "rounded-lg border p-4 transition-all duration-200 cursor-pointer",
        "hover:shadow-md focus-within:ring-2 focus-within:ring-accent-300",
        // Severity-specific styles
        config.bgColor,
        config.borderColor,
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`${title}: ${subtitle}. ${actionLabel}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        {/* Severity Indicator */}
        <div className="flex-shrink-0">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center",
            config.bgColor === 'bg-warn-50' ? 'bg-warn-100' : config.bgColor
          )}>
            <Icon className={cn("h-4 w-4", config.iconColor)} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Action */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={cn(
              "font-semibold text-body leading-tight",
              config.titleColor
            )}>
              {title}
            </h3>
            
            {onAction && (
              <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
            )}
          </div>

          {/* Subtitle */}
          <p className="text-caption text-gray-600 mb-2 leading-relaxed">
            {subtitle}
          </p>

          {/* Cause (if provided) */}
          {cause && (
            <p className="text-caption text-gray-500 mb-3 italic">
              Causa: {cause}
            </p>
          )}

          {/* Impact Metrics */}
          {(impactMoney !== undefined || impactPP !== undefined) && (
            <div className="flex items-center gap-4 mb-3">
              {impactMoney !== undefined && (
                <div className="flex items-center gap-1">
                  <span className="text-caption text-gray-500">Impacto:</span>
                  <span className={cn(
                    "text-caption font-semibold",
                    getImpactColor(impactMoney < 0 ? -1 : 1)
                  )}>
                    {formatMXN(Math.abs(impactMoney))}
                  </span>
                </div>
              )}
              
              {impactPP !== undefined && (
                <div className="flex items-center gap-1">
                  <span className="text-caption text-gray-500">Δ:</span>
                  <span className={cn(
                    "text-caption font-semibold",
                    getImpactColor(impactPP)
                  )}>
                    {formatPP(impactPP)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          {onAction && (
            <button
              className={cn(
                "inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-caption font-medium",
                "transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1",
                // Severity-specific button styles
                severity === 'high' 
                  ? "bg-warn-500 text-white hover:bg-warn-600 focus:ring-warn-300"
                  : severity === 'medium'
                  ? "bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-300"
                  : "bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-300"
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              {actionLabel}
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// List container for multiple alerts
export function AlertList({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {children}
    </div>
  );
}

// Empty state for when there are no alerts
export function AlertsEmptyState({ className }: { className?: string }) {
  return (
    <div className={cn(
      "text-center py-12 px-4",
      className
    )}>
      <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <TrendingUp className="h-8 w-8 text-accent-500" />
      </div>
      
      <h3 className="text-xl-custom font-semibold text-navy-600 mb-2">
        ¡Todo está bajo control!
      </h3>
      
      <p className="text-body text-gray-600 max-w-sm mx-auto">
        No hay alertas activas. Tus métricas están dentro de los rangos esperados.
      </p>
    </div>
  );
}