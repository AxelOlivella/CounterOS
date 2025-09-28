import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getCTA } from './CTARegistry';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CTAButtonProps {
  ctaId: string;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function CTAButton({ ctaId, children, className, onClick }: CTAButtonProps) {
  const navigate = useNavigate();
  const cta = getCTA(ctaId);

  if (!cta) {
    console.warn(`CTA not found: ${ctaId}`);
    return null;
  }

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    
    if (cta.action) {
      cta.action(navigate);
    } else if (cta.destination) {
      navigate(cta.destination);
    }
  };

  const buttonElement = (
    <Button
      variant={cta.variant || 'default'}
      size={cta.size || 'default'}
      className={cn(className)}
      onClick={handleClick}
      disabled={!cta.isEnabled}
      aria-label={cta.description || cta.label}
    >
      {children || cta.label}
    </Button>
  );

  if (!cta.isEnabled && cta.tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonElement}
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">{cta.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return buttonElement;
}