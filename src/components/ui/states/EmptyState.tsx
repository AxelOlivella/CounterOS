import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn('empty-state', className)}>
      <div className="empty-state-icon">
        {icon}
      </div>
      
      <h3 className="empty-state-title">
        {title}
      </h3>
      
      <p className="empty-state-description">
        {description}
      </p>
      
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || 'default'}
          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}