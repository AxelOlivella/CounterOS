import { Alert } from '@/lib/alerts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp, Target, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { formatImpact, getAlertBadgeVariant } from '@/lib/alerts';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface AlertCardProps {
  alert: Alert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getSeverityIcon = () => {
    switch (alert.severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <TrendingUp className="h-5 w-5 text-orange-500" />;
      default:
        return <Target className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityColor = () => {
    switch (alert.severity) {
      case 'critical':
        return 'border-l-4 border-l-destructive bg-destructive/5';
      case 'warning':
        return 'border-l-4 border-l-orange-500 bg-orange-500/5';
      default:
        return 'border-l-4 border-l-blue-500 bg-blue-500/5';
    }
  };

  return (
    <Card className={getSeverityColor()}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {getSeverityIcon()}
            <div className="flex-1">
              <CardTitle className="text-base font-bold leading-tight mb-1">
                {alert.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {alert.message}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge variant={getAlertBadgeVariant(alert.severity)}>
              {alert.severity === 'critical' ? 'CRÍTICO' : alert.severity === 'warning' ? 'ATENCIÓN' : 'INFO'}
            </Badge>
            {alert.impact_mxn && (
              <Badge variant="outline" className="gap-1">
                <DollarSign className="h-3 w-3" />
                {formatImpact(alert.impact_mxn)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Acción principal */}
        <div className="bg-primary/10 rounded-lg p-3">
          <p className="text-sm font-medium text-primary">
            ✅ {alert.action}
          </p>
        </div>

        {/* Métricas de contexto */}
        {alert.metric_context && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/50 rounded p-2">
              <p className="text-xs text-muted-foreground">Actual</p>
              <p className="text-sm font-bold">{alert.metric_context.current.toFixed(1)}</p>
            </div>
            <div className="bg-muted/50 rounded p-2">
              <p className="text-xs text-muted-foreground">Esperado</p>
              <p className="text-sm font-bold">{alert.metric_context.expected.toFixed(1)}</p>
            </div>
            <div className="bg-muted/50 rounded p-2">
              <p className="text-xs text-muted-foreground">Variancia</p>
              <p className={`text-sm font-bold ${alert.metric_context.variance_pct > 0 ? 'text-destructive' : 'text-green-600'}`}>
                {alert.metric_context.variance_pct > 0 ? '+' : ''}{alert.metric_context.variance_pct.toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        {/* Causas raíz colapsables */}
        {alert.root_causes && alert.root_causes.length > 0 && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span className="text-xs font-medium">
                  Ver {alert.root_causes.length} causas probables
                </span>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-2 mt-2">
              {alert.root_causes.map((cause, idx) => (
                <div key={idx} className="bg-muted/30 rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {cause.category.replace('_', ' ')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {cause.probability}% prob.
                    </Badge>
                  </div>
                  <p className="text-sm">{cause.description}</p>
                  <p className="text-xs text-primary font-medium">
                    → {cause.action}
                  </p>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>
            {alert.affected_item && `Item: ${alert.affected_item}`}
          </span>
          <span>
            {new Date(alert.created_at).toLocaleTimeString('es-MX', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
