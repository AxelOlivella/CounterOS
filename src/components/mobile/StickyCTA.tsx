import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StickyCTAProps {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'success' | 'warning';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function StickyCTA({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  className
}: StickyCTAProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'mobile-cta',
        'min-h-[52px] flex items-center justify-center font-semibold text-base',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-[0.98] active:bg-opacity-80',
        'safe-area-inset-bottom',
        variant === 'primary' && 'bg-secondary text-secondary-foreground hover:bg-secondary-dark',
        variant === 'success' && 'bg-success text-white hover:bg-success/90',
        variant === 'warning' && 'bg-warning text-white hover:bg-warning/90',
        className
      )}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Procesando...
        </div>
      ) : (
        children
      )}
    </button>
  );
}