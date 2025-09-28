// WCAG 2.1 AA Compliance Utilities

export interface ContrastRatio {
  ratio: number;
  passes: boolean;
  level: 'AA' | 'AAA';
}

// Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Calculate relative luminance
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio between two colors
export function getContrastRatio(color1: string, color2: string): ContrastRatio {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    return { ratio: 0, passes: false, level: 'AA' };
  }

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return {
    ratio: Math.round(ratio * 100) / 100,
    passes: ratio >= 4.5, // WCAG AA standard
    level: ratio >= 7 ? 'AAA' : 'AA'
  };
}

// Validate minimum touch target size (44px minimum for WCAG AA)
export function validateTouchTarget(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return rect.width >= 44 && rect.height >= 44;
}

// Generate ARIA attributes for interactive elements
export function generateAriaAttributes(element: {
  label?: string;
  description?: string;
  expanded?: boolean;
  disabled?: boolean;
  required?: boolean;
}): Record<string, string | boolean> {
  const attrs: Record<string, string | boolean> = {};

  if (element.label) attrs['aria-label'] = element.label;
  if (element.description) attrs['aria-describedby'] = element.description;
  if (element.expanded !== undefined) attrs['aria-expanded'] = element.expanded;
  if (element.disabled) attrs['aria-disabled'] = true;
  if (element.required) attrs['aria-required'] = true;

  return attrs;
}

// Focus management utilities
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  function handleTabKey(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }

  container.addEventListener('keydown', handleTabKey);

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleTabKey);
  };
}

// Screen reader announcements
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Validate form accessibility
export function validateFormAccessibility(form: HTMLFormElement): {
  issues: string[];
  passes: boolean;
} {
  const issues: string[] = [];

  // Check all inputs have labels
  const inputs = form.querySelectorAll('input, textarea, select');
  inputs.forEach((input, index) => {
    const id = input.getAttribute('id');
    const label = id ? form.querySelector(`label[for="${id}"]`) : null;
    const ariaLabel = input.getAttribute('aria-label');
    
    if (!label && !ariaLabel) {
      issues.push(`Input ${index + 1} missing label or aria-label`);
    }
  });

  // Check required fields are marked
  const requiredInputs = form.querySelectorAll('input[required], textarea[required], select[required]');
  requiredInputs.forEach((input, index) => {
    const ariaRequired = input.getAttribute('aria-required');
    if (!ariaRequired) {
      issues.push(`Required field ${index + 1} missing aria-required`);
    }
  });

  return {
    issues,
    passes: issues.length === 0
  };
}