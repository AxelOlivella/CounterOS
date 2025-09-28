import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  description?: string;
  error?: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: ReactNode;
  className?: string;
}

export function ErrorState({
  title = 'Error al cargar datos',
  description = 'Ocurrió un problema al procesar tu solicitud. Verifica tu conexión e inténtalo nuevamente.',
  error,
  onRetry,
  retryLabel = 'Reintentar',
  icon,
  className
}: ErrorStateProps) {
  return (
    <div className={cn('error-state', className)}>
      <div className="error-state-icon">
        {icon || <AlertTriangle className="h-12 w-12 text-warning" />}
      </div>
      
      <h3 className="error-state-title">
        {title}
      </h3>
      
      <p className="error-state-description">
        {description}
      </p>
      
      {error && (
        <div className="mb-6 p-3 bg-warning/5 border border-warning/20 rounded-lg max-w-md">
          <p className="text-caption text-warning font-mono">
            {error}
          </p>
        </div>
      )}
      
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-warning text-warning hover:bg-warning hover:text-white gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}