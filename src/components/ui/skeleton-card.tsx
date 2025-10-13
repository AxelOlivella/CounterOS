import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SkeletonCardProps {
  className?: string;
  variant?: 'hero' | 'metric' | 'list' | 'chart';
}

export function SkeletonCard({ className, variant = 'metric' }: SkeletonCardProps) {
  if (variant === 'hero') {
    return (
      <Card className={cn('p-8', className)}>
        <div className="space-y-4 animate-pulse">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-20 w-48 bg-muted rounded" />
          <div className="flex gap-4">
            <div className="h-3 w-24 bg-muted rounded" />
            <div className="h-3 w-24 bg-muted rounded" />
          </div>
        </div>
      </Card>
    );
  }

  if (variant === 'list') {
    return (
      <Card className={cn('p-4', className)}>
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="space-y-2">
                  <div className="h-3 w-32 bg-muted rounded" />
                  <div className="h-2 w-24 bg-muted rounded" />
                </div>
              </div>
              <div className="h-4 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (variant === 'chart') {
    return (
      <Card className={cn('p-6', className)}>
        <div className="space-y-4 animate-pulse">
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="h-[200px] flex items-end gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div
                key={i}
                className="flex-1 bg-muted rounded-t"
                style={{ height: `${Math.random() * 100}%` }}
              />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // Default: metric variant
  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-3 animate-pulse">
        <div className="h-3 w-24 bg-muted rounded" />
        <div className="h-10 w-32 bg-muted rounded" />
        <div className="h-2 w-20 bg-muted rounded" />
      </div>
    </Card>
  );
}
