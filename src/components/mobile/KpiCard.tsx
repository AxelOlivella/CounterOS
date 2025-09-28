import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: {
    text: string;
    variant: 'success' | 'warning' | 'danger' | 'neutral';
  };
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  badge,
  icon,
  trend,
  onClick,
  className
}: KpiCardProps) {
  return (
    <div
      className={cn(
        'mobile-card cursor-pointer hover:shadow-md transition-all',
        onClick && 'active:scale-[0.98]',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="text-sm text-muted-foreground mb-1">{title}</div>
          <div className="text-2xl font-bold text-foreground leading-none">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {subtitle && (
            <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {icon && <div className="text-muted-foreground">{icon}</div>}
          
          {badge && (
            <Badge
              className={cn(
                'text-xs',
                badge.variant === 'success' && 'status-saving',
                badge.variant === 'danger' && 'status-over-budget',
                badge.variant === 'warning' && 'bg-warning/10 text-warning border-warning/20',
                badge.variant === 'neutral' && 'status-on-target'
              )}
            >
              {badge.text}
            </Badge>
          )}
          
          {trend && (
            <div className={cn(
              'text-xs font-medium',
              trend.isPositive ? 'text-success' : 'text-danger'
            )}>
              {trend.value}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}