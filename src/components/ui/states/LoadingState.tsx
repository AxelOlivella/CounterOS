import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface LoadingSkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  children?: ReactNode;
}

export function LoadingState({
  title = 'Cargando...',
  description,
  size = 'md',
  className
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
      <div className={cn('loading-spinner mb-4', sizeClasses[size])} />
      
      <h3 className="text-xl-custom font-semibold text-foreground mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-body text-muted-foreground max-w-md">
          {description}
        </p>
      )}
    </div>
  );
}

export function LoadingSkeleton({
  className,
  width = '100%',
  height = '20px',
  children,
  ...props
}: LoadingSkeletonProps) {
  return (
    <div
      className={cn('loading-skeleton', className)}
      style={{ width, height }}
      {...props}
    >
      {children}
    </div>
  );
}

export function LoadingSpinner({ 
  size = 'md', 
  className 
}: { 
  size?: 'sm' | 'md' | 'lg'; 
  className?: string 
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 className={cn('animate-spin text-primary', sizeClasses[size], className)} />
  );
}