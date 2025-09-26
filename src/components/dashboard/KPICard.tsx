import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format?: 'currency' | 'percentage' | 'number';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  icon?: React.ReactNode;
  subtitle?: string;
}

export const KPICard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  format = 'number',
  variant = 'default',
  icon,
  subtitle
}: KPICardProps) => {
  const formatValue = (val: string | number) => {
    const numVal = typeof val === 'string' ? parseFloat(val) : val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(numVal);
      case 'percentage':
        return `${numVal.toFixed(1)}%`;
      default:
        return numVal.toLocaleString('es-MX');
    }
  };

  const getChangeIcon = () => {
    if (!change) return <Minus className="h-3 w-3" />;
    
    // Use changeType if provided, otherwise infer from change value
    const effectiveChangeType = changeType !== 'neutral' ? changeType : 
      (change > 0 ? 'increase' : 'decrease');
    
    switch (effectiveChangeType) {
      case 'increase':
        return <TrendingUp className="h-3 w-3" />;
      case 'decrease':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getChangeVariant = () => {
    if (!change) return 'secondary';
    
    // For decrease in costs (good thing), show as positive
    if (changeType === 'decrease' && (title.toLowerCase().includes('cost') || title.includes('%'))) {
      return 'default';
    }
    
    // For increase in sales/revenue (good thing), show as positive  
    if (changeType === 'increase' && title.toLowerCase().includes('venta')) {
      return 'default';
    }
    
    // Default behavior
    if (change > 0) return 'default';
    return 'destructive';
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-green-200 bg-green-50/50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50/50';
      case 'danger':
        return 'border-red-200 bg-red-50/50';
      default:
        return '';
    }
  };

  return (
    <Card className={cn('transition-all duration-200 hover:shadow-md', getVariantStyles())}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            {formatValue(value)}
          </div>
          {change !== undefined && (
            <Badge variant={getChangeVariant()} className="ml-2">
              {getChangeIcon()}
              <span className="ml-1">
                {Math.abs(change).toFixed(1)}%
              </span>
            </Badge>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-2">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
};