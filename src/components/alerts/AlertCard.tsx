import { Alert } from '@/lib/alerts';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatImpact } from '@/lib/alerts';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface AlertCardProps {
  alert: Alert;
  compact?: boolean;
}

export function AlertCard({ alert, compact = false }: AlertCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const statusConfig = {
    critical: {
      emoji: '🔴',
      bg: 'bg-critical/5 border-critical/20',
      text: 'text-critical',
      badge: 'border-critical text-critical'
    },
    warning: {
      emoji: '🟡',
      bg: 'bg-warning/5 border-warning/20',
      text: 'text-warning',
      badge: 'border-warning text-warning'
    },
    info: {
      emoji: '⚪',
      bg: 'bg-muted/30 border-muted',
      text: 'text-muted-foreground',
      badge: 'border-muted-foreground text-muted-foreground'
    }
  };

  const config = statusConfig[alert.severity];

  return (
    <Card className={cn(
      'border-2 transition-all hover:shadow-md',
      config.bg,
      compact && 'p-4'
    )}>
      <CardContent className={cn('space-y-3', compact ? 'p-0' : 'p-6')}>
        {/* Header: Emoji + Title + Badge compacto */}
        <div className="flex items-start gap-3">
          <span className="text-3xl flex-shrink-0">{config.emoji}</span>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className={cn(
                'font-bold leading-tight',
                config.text,
                compact ? 'text-base' : 'text-lg'
              )}>
                {alert.title}
              </h3>
              {alert.impact_mxn && (
                <Badge variant="outline" className={cn('flex-shrink-0 text-xs font-bold', config.badge)}>
                  {formatImpact(alert.impact_mxn)}
                </Badge>
              )}
            </div>
            
            {!compact && (
              <p className="text-sm text-muted-foreground">
                {alert.message}
              </p>
            )}
          </div>
        </div>

        {/* Acción principal - destacada */}
        {!compact && (
          <div className={cn('rounded-lg p-3 border', config.bg)}>
            <p className={cn('text-sm font-semibold', config.text)}>
              ✅ {alert.action}
            </p>
          </div>
        )}

        {/* Métricas - modo compacto */}
        {alert.metric_context && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground font-medium">Actual</p>
              <p className={cn('text-lg font-bold tabular-nums', config.text)}>
                {alert.metric_context.current.toFixed(1)}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground font-medium">Meta</p>
              <p className="text-lg font-bold tabular-nums">
                {alert.metric_context.expected.toFixed(1)}
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <p className="text-xs text-muted-foreground font-medium">Var</p>
              <p className={cn(
                'text-lg font-bold tabular-nums',
                alert.metric_context.variance_pct > 0 ? config.text : 'text-success'
              )}>
                {alert.metric_context.variance_pct > 0 ? '+' : ''}
                {alert.metric_context.variance_pct.toFixed(1)}
              </p>
            </div>
          </div>
        )}

        {/* Causas raíz - colapsable */}
        {alert.root_causes && alert.root_causes.length > 0 && !compact && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-between h-10 hover:bg-muted/50"
              >
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {isOpen ? 'Ocultar' : 'Ver'} {alert.root_causes.length} causas probables
                </span>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-2 mt-2">
              {alert.root_causes.map((cause, idx) => (
                <div key={idx} className="bg-muted/40 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {cause.category.replace('_', ' ')}
                    </span>
                    <Badge variant="outline" className="text-xs font-bold">
                      {cause.probability}%
                    </Badge>
                  </div>
                  <p className="text-sm leading-snug">{cause.description}</p>
                  <div className={cn('text-xs font-semibold pt-1', config.text)}>
                    → {cause.action}
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
