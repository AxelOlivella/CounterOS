import { ReactNode } from 'react';
import { ChevronRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListFormRowProps {
  label: string;
  value?: ReactNode;
  isEditable?: boolean;
  isCalculated?: boolean;
  rightElement?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ListFormRow({
  label,
  value,
  isEditable = false,
  isCalculated = false,
  rightElement,
  onClick,
  className
}: ListFormRowProps) {
  return (
    <div
      className={cn(
        'ios-list-item cursor-pointer',
        isCalculated && 'bg-accent-light/10',
        className
      )}
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground truncate">
            {label}
          </span>
          {isCalculated && <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
        </div>
        {value && (
          <div className="text-xs text-muted-foreground">
            {value}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2 ml-3">
        {rightElement}
        {isEditable && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </div>
    </div>
  );
}