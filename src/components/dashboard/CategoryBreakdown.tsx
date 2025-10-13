import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface Category {
  name: string;
  value: number;
  target: number;
  status: 'critical' | 'warning' | 'success';
}

interface CategoryBreakdownProps {
  categories: Category[];
  onCategoryClick: (category: Category) => void;
}

export function CategoryBreakdown({ categories, onCategoryClick }: CategoryBreakdownProps) {
  const getStatusColor = (status: Category['status']) => {
    switch (status) {
      case 'critical':
        return 'bg-critical';
      case 'warning':
        return 'bg-warning';
      case 'success':
        return 'bg-success';
      default:
        return 'bg-muted';
    }
  };

  const getStatusEmoji = (status: Category['status']) => {
    switch (status) {
      case 'critical':
        return '🔴';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      default:
        return '⚪';
    }
  };

  const getBarWidth = (value: number) => {
    const max = Math.max(...categories.map(c => c.value));
    return `${(value / max) * 100}%`;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-2">¿Dónde está el problema?</h3>
      <p className="text-sm text-muted-foreground mb-6">Toca una categoría para ver detalles</p>

      <div className="space-y-4">
        {categories.map((category) => {
          const variance = category.value - category.target;
          const variancePct = ((variance / category.target) * 100).toFixed(1);
          
          return (
            <button
              key={category.name}
              onClick={() => onCategoryClick(category)}
              className="w-full mobile-tap-target group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span>{getStatusEmoji(category.status)}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-sm font-bold',
                    category.status === 'critical' && 'text-critical',
                    category.status === 'warning' && 'text-warning',
                    category.status === 'success' && 'text-success'
                  )}>
                    {variance > 0 ? '+' : ''}{variancePct}%
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>

              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn('h-full transition-all duration-300', getStatusColor(category.status))}
                  style={{ width: getBarWidth(category.value) }}
                />
              </div>

              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>Actual: {category.value.toFixed(1)}%</span>
                <span>Meta: {category.target.toFixed(1)}%</span>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
