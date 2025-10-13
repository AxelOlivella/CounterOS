import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastNotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function ToastNotification({
  message,
  type = 'success',
  duration = 5000,
  onClose,
  action
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 200); // Match animation duration
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-critical flex-shrink-0" />;
      case 'info':
        return <Info className="h-5 w-5 text-secondary flex-shrink-0" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-success/10 border-success/20';
      case 'error':
        return 'bg-critical/10 border-critical/20';
      case 'info':
        return 'bg-secondary/10 border-secondary/20';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96',
        'animate-slide-up',
        isExiting && 'opacity-0 translate-y-2 transition-all duration-200'
      )}
    >
      <div className={cn('flex items-start gap-3 p-4 rounded-lg border-2 shadow-lg', getBgColor())}>
        {getIcon()}
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-relaxed">{message}</p>
          
          {action && (
            <button
              onClick={() => {
                action.onClick();
                handleClose();
              }}
              className="text-sm font-semibold mt-2 hover:underline"
            >
              {action.label}
            </button>
          )}
        </div>

        <button
          onClick={handleClose}
          className="mobile-tap-target p-1 hover:bg-muted/50 rounded transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
