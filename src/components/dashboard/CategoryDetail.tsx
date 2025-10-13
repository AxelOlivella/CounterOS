import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
  name: string;
  actual: number;
  target: number;
  status: 'critical' | 'warning' | 'success';
}

interface CategoryDetailProps {
  categoryName: string;
  variance: number;
  impactMxn: number;
  products: Product[];
  probableCauses: string[];
  onBack: () => void;
}

export function CategoryDetail({
  categoryName,
  variance,
  impactMxn,
  products,
  probableCauses,
  onBack
}: CategoryDetailProps) {
  const getStatusEmoji = (status: Product['status']) => {
    switch (status) {
      case 'critical':
        return '🔴';
      case 'warning':
        return '🟡';
      case 'success':
        return '🟢';
      default:
        return '⚪';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con back button */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mobile-tap-target"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{categoryName}</h2>
          <p className="text-sm text-muted-foreground">Análisis detallado</p>
        </div>
      </div>

      {/* Impact summary */}
      <Card className={cn(
        'p-6 border-2',
        variance > 3 ? 'border-critical/20 bg-critical/5' : 'border-warning/20 bg-warning/5'
      )}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Problema
            </p>
            <p className="text-3xl font-bold text-critical">
              +{variance.toFixed(1)} pts
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
              Impacto
            </p>
            <p className="text-3xl font-bold">
              ${impactMxn.toLocaleString('es-MX')}
            </p>
            <p className="text-xs text-muted-foreground">/mes</p>
          </div>
        </div>
      </Card>

      {/* Products breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Productos</h3>
        
        <div className="space-y-3">
          {products.map((product, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{getStatusEmoji(product.status)}</span>
                  <span className="text-sm font-medium">{product.name}</span>
                </div>
                <span className="text-sm font-bold">
                  ${product.actual.toLocaleString('es-MX')}
                </span>
              </div>
              
              <div className="ml-6 text-xs text-muted-foreground">
                Target: ${product.target.toLocaleString('es-MX')}
                {product.actual > product.target && (
                  <span className="text-critical ml-2">
                    (+${(product.actual - product.target).toLocaleString('es-MX')})
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Probable causes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Causas probables</h3>
        
        <div className="space-y-3">
          {probableCauses.map((cause, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-warning">{idx + 1}</span>
              </div>
              <p className="text-sm leading-relaxed">{cause}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Action buttons */}
      <div className="space-y-3">
        <Button className="w-full mobile-button" size="lg">
          Ver cómo medir porciones
        </Button>
        <Button variant="outline" className="w-full mobile-button" size="lg">
          Hablar con proveedor
        </Button>
      </div>
    </div>
  );
}
