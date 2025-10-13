import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type MetricStatus = 'critical' | 'warning' | 'success' | 'neutral';

interface HeroMetricProps {
  value: number;
  suffix?: string;
  label: string;
  target?: number;
  status: MetricStatus;
  variance?: number;
  size?: 'default' | 'large';
}

const statusConfig = {
  critical: {
    bg: 'bg-critical/10 border-critical/20',
    text: 'text-critical',
    icon: '🔴',
    label: 'URGENTE'
  },
  warning: {
    bg: 'bg-warning/10 border-warning/20',
    text: 'text-warning',
    icon: '🟡',
    label: 'ATENCIÓN'
  },
  success: {
    bg: 'bg-success/10 border-success/20',
    text: 'text-success',
    icon: '🟢',
    label: 'TODO BIEN'
  },
  neutral: {
    bg: 'bg-muted/50 border-muted',
    text: 'text-muted-foreground',
    icon: '⚪',
    label: 'INFO'
  }
};

export function HeroMetric({
  value,
  suffix = '%',
  label,
  target,
  status,
  variance,
  size = 'large'
}: HeroMetricProps) {
  const config = statusConfig[status];
  const isLarge = size === 'large';

  const getTrendIcon = () => {
    if (!variance) return <Minus className="h-5 w-5" />;
    if (variance > 0) return <TrendingUp className="h-5 w-5" />;
    return <TrendingDown className="h-5 w-5" />;
  };

  return (
    <Card className={cn(
      'border-2 transition-all duration-300',
      config.bg,
      isLarge && 'shadow-lg'
    )}>
      <div className={cn(
        'p-6 space-y-3',
        isLarge && 'p-8'
      )}>
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
          <Badge 
            variant="outline" 
            className={cn(
              'border-2 font-bold text-xs',
              config.text
            )}
          >
            {config.icon} {config.label}
          </Badge>
        </div>

        {/* Número GIGANTE */}
        <div className="flex items-baseline gap-2">
          <span className={cn(
            'font-bold tabular-nums leading-none tracking-tight',
            config.text,
            isLarge ? 'text-7xl md:text-8xl' : 'text-5xl md:text-6xl'
          )}>
            {value.toFixed(1)}
          </span>
          <span className={cn(
            'font-semibold',
            config.text,
            isLarge ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'
          )}>
            {suffix}
          </span>
        </div>

        {/* Target y Variancia */}
        <div className="flex items-center justify-between pt-2">
          {target !== undefined && (
            <div className="text-sm text-muted-foreground">
              Meta: <span className="font-medium">{target}{suffix}</span>
            </div>
          )}
          
          {variance !== undefined && (
            <div className={cn(
              'flex items-center gap-1 font-bold',
              variance > 0 ? config.text : 'text-success'
            )}>
              {getTrendIcon()}
              <span>
                {variance > 0 ? '+' : ''}{variance.toFixed(1)}pp
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
