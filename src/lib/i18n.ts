// Internationalization & Localization System for CounterOS
// Enterprise multi-market support

export type SupportedLocale = 'es-MX' | 'en-US' | 'pt-BR' | 'es-CO' | 'es-PE';
export type SupportedCurrency = 'MXN' | 'USD' | 'BRL' | 'COP' | 'PEN';

export interface LocaleConfig {
  locale: SupportedLocale;
  currency: SupportedCurrency;
  dateFormat: string;
  numberFormat: Intl.NumberFormatOptions;
  currencyFormat: Intl.NumberFormatOptions;
  percentageFormat: Intl.NumberFormatOptions;
}

// Market-specific configurations
export const LOCALE_CONFIGS: Record<SupportedLocale, LocaleConfig> = {
  'es-MX': {
    locale: 'es-MX',
    currency: 'MXN',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
    currencyFormat: {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
    percentageFormat: {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    },
  },
  'en-US': {
    locale: 'en-US',
    currency: 'USD',
    dateFormat: 'MM/dd/yyyy',
    numberFormat: {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
    currencyFormat: {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
    percentageFormat: {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    },
  },
  'pt-BR': {
    locale: 'pt-BR',
    currency: 'BRL',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
    currencyFormat: {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
    percentageFormat: {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    },
  },
  'es-CO': {
    locale: 'es-CO',
    currency: 'COP',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
    currencyFormat: {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    },
    percentageFormat: {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    },
  },
  'es-PE': {
    locale: 'es-PE',
    currency: 'PEN',
    dateFormat: 'dd/MM/yyyy',
    numberFormat: {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
    currencyFormat: {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
    percentageFormat: {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    },
  },
};

// Translation keys and messages
export const TRANSLATIONS = {
  'es-MX': {
    // Navigation
    'nav.dashboard': 'Resumen',
    'nav.stores': 'Tiendas',
    'nav.upload': 'Cargar',
    'nav.alerts': 'Alertas',
    'nav.settings': 'Configuración',
    
    // Financial terms
    'finance.revenue': 'Ventas',
    'finance.cogs': 'COGS',
    'finance.food_cost': 'Food Cost',
    'finance.variance': 'Variación',
    'finance.savings': 'Ahorro',
    'finance.loss': 'Sobrecosto',
    'finance.target': 'Meta',
    'finance.actual': 'Real',
    'finance.percentage_points': 'pp',
    'finance.per_month': '/mes',
    
    // Status messages
    'status.loading': 'Cargando...',
    'status.error': 'Error al cargar datos',
    'status.no_data': 'Sin datos disponibles',
    'status.success': 'Operación exitosa',
    
    // Actions
    'action.retry': 'Reintentar',
    'action.save': 'Guardar',
    'action.cancel': 'Cancelar',
    'action.upload': 'Subir archivo',
    'action.export': 'Exportar',
    'action.view_details': 'Ver detalles',
  },
  'en-US': {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.stores': 'Stores',
    'nav.upload': 'Upload',
    'nav.alerts': 'Alerts',
    'nav.settings': 'Settings',
    
    // Financial terms
    'finance.revenue': 'Revenue',
    'finance.cogs': 'COGS',
    'finance.food_cost': 'Food Cost',
    'finance.variance': 'Variance',
    'finance.savings': 'Savings',
    'finance.loss': 'Excess Cost',
    'finance.target': 'Target',
    'finance.actual': 'Actual',
    'finance.percentage_points': 'pp',
    'finance.per_month': '/month',
    
    // Status messages
    'status.loading': 'Loading...',
    'status.error': 'Error loading data',
    'status.no_data': 'No data available',
    'status.success': 'Operation successful',
    
    // Actions
    'action.retry': 'Retry',
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.upload': 'Upload file',
    'action.export': 'Export',
    'action.view_details': 'View details',
  },
  // Additional languages would be added here
};

// Main i18n class
export class I18nManager {
  private static instance: I18nManager;
  private currentLocale: SupportedLocale = 'es-MX';
  private config: LocaleConfig;

  constructor() {
    this.config = LOCALE_CONFIGS[this.currentLocale];
  }

  static getInstance(): I18nManager {
    if (!this.instance) {
      this.instance = new I18nManager();
    }
    return this.instance;
  }

  setLocale(locale: SupportedLocale): void {
    this.currentLocale = locale;
    this.config = LOCALE_CONFIGS[locale];
  }

  getLocale(): SupportedLocale {
    return this.currentLocale;
  }

  // Translation function
  t(key: string, params?: Record<string, string | number>): string {
    const translations = TRANSLATIONS[this.currentLocale] || TRANSLATIONS['es-MX'];
    let translation = translations[key as keyof typeof translations] || key;

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{{${param}}}`, String(value));
      });
    }

    return translation;
  }

  // Formatting functions
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat(this.currentLocale, this.config.currencyFormat).format(amount);
  }

  formatNumber(number: number): string {
    return new Intl.NumberFormat(this.currentLocale, this.config.numberFormat).format(number);
  }

  formatPercentage(percentage: number): string {
    return new Intl.NumberFormat(this.currentLocale, this.config.percentageFormat).format(percentage / 100);
  }

  formatPercentagePoints(pp: number): string {
    const sign = pp > 0 ? '+' : '';
    return `${sign}${pp.toFixed(1)} ${this.t('finance.percentage_points')}`;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat(this.currentLocale).format(date);
  }

  formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat(this.currentLocale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  formatRelativeTime(date: Date): string {
    const rtf = new Intl.RelativeTimeFormat(this.currentLocale, { numeric: 'auto' });
    const now = new Date();
    const diffInDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (Math.abs(diffInDays) < 1) {
      const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
      return rtf.format(diffInHours, 'hour');
    }

    return rtf.format(diffInDays, 'day');
  }

  // Currency conversion (would integrate with real exchange rate API)
  convertCurrency(amount: number, fromCurrency: SupportedCurrency, toCurrency: SupportedCurrency): number {
    // Mock exchange rates - in production, use real-time rates
    const exchangeRates: Record<SupportedCurrency, Record<SupportedCurrency, number>> = {
      MXN: { USD: 0.056, BRL: 0.30, COP: 0.24, PEN: 0.21, MXN: 1 },
      USD: { MXN: 17.8, BRL: 5.3, COP: 4.3, PEN: 3.7, USD: 1 },
      BRL: { MXN: 3.35, USD: 0.19, COP: 0.81, PEN: 0.70, BRL: 1 },
      COP: { MXN: 4.15, USD: 0.23, BRL: 1.23, PEN: 0.86, COP: 1 },
      PEN: { MXN: 4.82, USD: 0.27, BRL: 1.43, COP: 1.16, PEN: 1 },
    };

    return amount * (exchangeRates[fromCurrency]?.[toCurrency] || 1);
  }
}

// Global instance
export const i18n = I18nManager.getInstance();

// React hooks for i18n
import React from 'react';

export function useTranslation() {
  const [locale, setLocale] = React.useState<SupportedLocale>(i18n.getLocale());

  const changeLocale = (newLocale: SupportedLocale) => {
    i18n.setLocale(newLocale);
    setLocale(newLocale);
  };

  return {
    locale,
    setLocale: changeLocale,
    t: i18n.t.bind(i18n),
    formatCurrency: i18n.formatCurrency.bind(i18n),
    formatNumber: i18n.formatNumber.bind(i18n),
    formatPercentage: i18n.formatPercentage.bind(i18n),
    formatPercentagePoints: i18n.formatPercentagePoints.bind(i18n),
    formatDate: i18n.formatDate.bind(i18n),
    formatDateTime: i18n.formatDateTime.bind(i18n),
    formatRelativeTime: i18n.formatRelativeTime.bind(i18n),
  };
}

export function useLocale() {
  return i18n.getLocale();
}

export function useCurrency() {
  const locale = useLocale();
  const config = LOCALE_CONFIGS[locale];
  
  return {
    currency: config.currency,
    formatCurrency: i18n.formatCurrency.bind(i18n),
    convertCurrency: i18n.convertCurrency.bind(i18n),
  };
}