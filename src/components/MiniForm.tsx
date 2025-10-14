// Mini Form Component for Mobile Data Entry
// Compact list-form layout with inline labels and right-aligned inputs

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { formatMXN } from '@/lib/finance';

interface FormField {
  key: string;
  label: string;
  value: number;
  placeholder?: string;
  disabled?: boolean;
  isCalculated?: boolean;
  hint?: string;
}

interface MiniFormProps {
  fields: FormField[];
  onChange: (key: string, value: number) => void;
  className?: string;
}

export default function MiniForm({ fields, onChange, className }: MiniFormProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleInputChange = (key: string, rawValue: string) => {
    // Remove currency formatting and parse
    const cleanValue = rawValue.replace(/[^0-9.]/g, '');
    const numValue = parseFloat(cleanValue) || 0;
    onChange(key, numValue);
  };

  const formatInputValue = (value: number, isSelected: boolean): string => {
    if (isSelected || value === 0) {
      return value.toString();
    }
    return formatMXN(value).replace('MXN', '').trim();
  };

  return (
    <div className={cn("space-y-1", className)}>
      {fields.map((field, index) => (
        <div
          key={field.key}
          className={cn(
            "flex items-center justify-between py-3 px-4 rounded-lg border transition-all duration-200",
            // Base styles
            "bg-card border-border",
            // Disabled/calculated styles
            field.disabled || field.isCalculated
              ? "bg-muted border-muted"
              : "hover:border-border/80",
            // Focus styles
            focusedField === field.key && "border-[var(--accent)] bg-[var(--accent)]/5",
            // Add divider except for last item
            index < fields.length - 1 && "border-b-0 rounded-b-none",
            index > 0 && "rounded-t-none border-t-0"
          )}
        >
          {/* Label */}
          <div className="flex-1 min-w-0">
            <label 
              htmlFor={`field-${field.key}`}
              className={cn(
                "block font-medium text-body",
                field.disabled || field.isCalculated
                  ? "text-muted-foreground"
                  : "text-foreground"
              )}
            >
              {field.label}
              {field.isCalculated && (
                <span className="text-caption text-muted-foreground ml-1">(auto)</span>
              )}
            </label>
            
            {field.hint && (
              <p className="text-caption text-muted-foreground mt-1">
                {field.hint}
              </p>
            )}
          </div>

          {/* Input */}
          <div className="flex-shrink-0 ml-4">
            <input
              id={`field-${field.key}`}
              type="text"
              inputMode="decimal"
              value={formatInputValue(field.value, focusedField === field.key)}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              onFocus={() => setFocusedField(field.key)}
              onBlur={() => setFocusedField(null)}
              disabled={field.disabled || field.isCalculated}
              placeholder={field.placeholder || '0'}
              className={cn(
                "w-24 text-right text-body font-medium border-0 bg-transparent p-0",
                "focus:outline-none focus:ring-0",
                "placeholder:text-muted-foreground",
                field.disabled || field.isCalculated
                  ? "text-muted-foreground cursor-not-allowed"
                  : "text-foreground"
              )}
              aria-describedby={field.hint ? `${field.key}-hint` : undefined}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Separator component for form sections
export function FormSection({ 
  title, 
  children, 
  className 
}: { 
  title: string; 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-xl-custom font-semibold text-foreground px-4">
        {title}
      </h3>
      {children}
    </div>
  );
}