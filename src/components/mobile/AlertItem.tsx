import { ReactNode } from 'react';
import { AlertTriangle, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AlertItemProps {
  severity: 'high' | 'medium' | 'low';
  title: string;
  subtitle?: string;
  cause?: string;
  impact?: string;
  ctaText?: string;
  onAction?: () => void;
  className?: string;
}

const severityConfig = {
  high: {
    icon: AlertTriangle,
    bgColor: 'bg-danger/5',
    borderColor: 'border-danger/20',
    iconColor: 'text-danger',
    textColor: 'text-danger'
  },
  medium: {
    icon: AlertCircle,
    bgColor: 'bg-warning/5',
    borderColor: 'border-warning/20',
    iconColor: 'text-warning',
    textColor: 'text-warning'
  },
  low: {
    icon: Info,
    bgColor: 'bg-info/5',
    borderColor: 'border-info/20',
    iconColor: 'text-info',
    textColor: 'text-info'
  }
};

export function AlertItem({
  severity,
  title,
  subtitle,
  cause,
  impact,
  ctaText = 'Revisar',
  onAction,
  className
}: AlertItemProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div className={cn(
      'border rounded-lg p-4 transition-colors',
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', config.iconColor)} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-foreground">{title}</h4>
            <Button
              size="sm"
              variant="outline"
              onClick={onAction}
              className="h-7 px-2 text-xs"
            >
              {ctaText}
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          
          {subtitle && (
            <p className="text-xs text-muted-foreground mb-2">{subtitle}</p>
          )}
          
          {cause && (
            <p className="text-xs text-foreground mb-1">
              <span className="font-medium">Causa:</span> {cause}
            </p>
          )}
          
          {impact && (
            <p className={cn('text-xs font-medium', config.textColor)}>
              <span className="font-medium">Impacto:</span> {impact}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}