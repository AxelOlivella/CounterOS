import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TooltipHelpProps {
  content: string;
  className?: string;
  iconSize?: number;
}

export function TooltipHelp({ 
  content, 
  className,
  iconSize = 16 
}: TooltipHelpProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={cn(
              'inline-flex items-center justify-center',
              'text-muted-foreground hover:text-foreground',
              'transition-colors cursor-help',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full',
              className
            )}
            aria-label="Más información"
          >
            <HelpCircle size={iconSize} />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          className="max-w-xs text-sm"
          side="top"
          sideOffset={4}
        >
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
