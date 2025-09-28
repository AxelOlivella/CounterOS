// Sticky CTA Button for Mobile-First UX
// Fixed bottom button with iOS safe area support

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface StickyCTAProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export default function StickyCTA({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false,
  className 
}: StickyCTAProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 supports-[backdrop-filter]:bg-white/60 pb-safe">
      <button
        className={cn(
          // Base styles
          "w-full h-14 rounded-lg font-medium text-body transition-all duration-200",
          // Colors - using design tokens
          "bg-accent-500 text-white",
          // Interactive states
          "enabled:hover:bg-accent-600 enabled:active:scale-[0.99]",
          "focus:outline-none focus:ring-4 focus:ring-accent-300",
          // Disabled state
          "disabled:opacity-50 disabled:cursor-not-allowed",
          // Custom styles
          className
        )}
        onClick={onClick}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
      >
        <div className="flex items-center justify-center gap-2">
          {loading && (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          )}
          <span>{children}</span>
        </div>
      </button>
    </div>
  );
}

// Wrapper component to add bottom padding for content above sticky CTA
export function StickyBottomSpacer({ className }: { className?: string }) {
  return (
    <div 
      className={cn("h-20 pb-safe", className)} 
      aria-hidden="true"
    />
  );
}