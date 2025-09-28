// Store Switcher Component
// Pill-style selector for multi-tenant navigation

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { routes, STORES } from '@/routes';
import { useStore } from '@/contexts/StoreContext';

interface StoreSwitcherProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export default function StoreSwitcher({ 
  className,
  variant = 'default' 
}: StoreSwitcherProps) {
  const navigate = useNavigate();
  const { slug, name } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleStoreSelect = (newSlug: string) => {
    if (newSlug !== slug) {
      navigate(routes.store(newSlug));
    }
    setIsOpen(false);
  };

  const isCompact = variant === 'compact';

  return (
    <div className={cn("relative", className)}>
      <button
        className={cn(
          // Base styles
          "inline-flex items-center gap-2 rounded-full border transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-accent-300",
          // Size variants
          isCompact 
            ? "px-3 py-1.5 text-caption" 
            : "px-4 py-2 text-body",
          // Color scheme
          "bg-gray-100 border-gray-200 text-navy-500",
          "hover:bg-gray-200 hover:border-gray-300",
          // Active state
          slug && "bg-accent-50 border-accent-200 text-accent-700"
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Seleccionar tienda"
      >
        <Store className={cn("flex-shrink-0", isCompact ? "h-3 w-3" : "h-4 w-4")} />
        <span className="font-medium truncate max-w-32">
          {name || 'Selecciona tienda'}
        </span>
        <ChevronDown 
          className={cn(
            "flex-shrink-0 transition-transform",
            isCompact ? "h-3 w-3" : "h-4 w-4",
            isOpen && "rotate-180"
          )} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Menu */}
          <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-lg shadow-card border border-gray-200 py-2 min-w-48">
            <div className="px-3 py-2 text-caption text-gray-500 font-medium border-b border-gray-100">
              Seleccionar tienda
            </div>
            
            {STORES.map((store) => (
              <button
                key={store.slug}
                className={cn(
                  "w-full px-4 py-3 text-left text-body transition-colors",
                  "hover:bg-gray-50 focus:bg-gray-50 focus:outline-none",
                  // Active state
                  store.slug === slug 
                    ? "bg-accent-50 text-accent-700 font-medium" 
                    : "text-gray-700"
                )}
                onClick={() => handleStoreSelect(store.slug)}
                role="option"
                aria-selected={store.slug === slug}
              >
                <div className="flex items-center gap-3">
                  <Store className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{store.name}</span>
                  {store.slug === slug && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-accent-500" />
                  )}
                </div>
              </button>
            ))}
            
            {/* View All Stores Option */}
            <div className="border-t border-gray-100 mt-2">
              <button
                className="w-full px-4 py-3 text-left text-body text-accent-600 hover:bg-accent-50 focus:bg-accent-50 focus:outline-none transition-colors"
                onClick={() => {
                  navigate(routes.stores);
                  setIsOpen(false);
                }}
              >
                Ver todas las tiendas →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}