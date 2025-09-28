// CTA Registry - OBLIGATORY: All CTAs must be registered here to prevent broken links

import { NavigateFunction } from 'react-router-dom';

export interface CTAAction {
  id: string;
  label: string;
  description?: string;
  destination?: string;
  action?: (navigate: NavigateFunction) => void;
  isEnabled: boolean;
  tooltip?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export const CTARegistry: Record<string, CTAAction> = {
  // Primary Navigation CTAs
  'go-to-resumen': {
    id: 'go-to-resumen',
    label: 'Ver Resumen',
    destination: '/resumen',
    isEnabled: true,
    variant: 'outline'
  },
  
  'go-to-tiendas': {
    id: 'go-to-tiendas', 
    label: 'Ver Todas las Tiendas',
    destination: '/tiendas',
    isEnabled: true,
    variant: 'outline'
  },

  'go-to-cargar': {
    id: 'go-to-cargar',
    label: 'Cargar Datos',
    destination: '/cargar',
    isEnabled: true,
    variant: 'secondary'
  },

  'go-to-alertas': {
    id: 'go-to-alertas',
    label: 'Ver Alertas',
    destination: '/alertas', 
    isEnabled: true,
    variant: 'outline'
  },

  // Store-specific CTAs
  'revisar-tienda-portal': {
    id: 'revisar-tienda-portal',
    label: 'Revisar Ahora',
    description: 'Portal Centro necesita atención',
    destination: '/tiendas/portal-centro',
    isEnabled: true,
    variant: 'default',
    size: 'lg'
  },

  'revisar-tienda-plaza': {
    id: 'revisar-tienda-plaza',
    label: 'Ver Detalles',
    description: 'Plaza Norte - Rendimiento destacado',
    destination: '/tiendas/plaza-norte',
    isEnabled: true,
    variant: 'outline'
  },

  // Data & Analysis CTAs
  'generar-pnl': {
    id: 'generar-pnl',
    label: 'Generar P&L',
    description: 'Crear reporte de pérdidas y ganancias',
    destination: '/pnl-reports',
    isEnabled: true,
    variant: 'secondary'
  },

  'analisis-food-cost': {
    id: 'analisis-food-cost',
    label: 'Revisar Food Cost',
    description: 'Análisis detallado de costos de comida',
    destination: '/food-cost-analysis',
    isEnabled: true,
    variant: 'outline'
  },

  'guardar-datos': {
    id: 'guardar-datos',
    label: 'Guardar y ver P&L',
    description: 'Procesa y guarda los datos del período',
    action: (navigate) => {
      // Custom save logic would go here
      // Then navigate or show success state
    },
    isEnabled: true,
    variant: 'secondary',
    size: 'lg'
  },

  // Configuration CTAs
  'configurar-metas': {
    id: 'configurar-metas',
    label: 'Configurar Metas',
    destination: '/configuracion',
    isEnabled: false,
    tooltip: 'Próximamente - Configura metas por tienda',
    variant: 'outline'
  },

  'configurar-alertas': {
    id: 'configurar-alertas', 
    label: 'Configurar Alertas',
    destination: '/configuracion',
    isEnabled: false,
    tooltip: 'Próximamente - Personaliza alertas automáticas',
    variant: 'outline'
  },

  // History & Reports
  'ver-historico': {
    id: 'ver-historico',
    label: 'Ver Histórico',
    destination: '/reports',
    isEnabled: false,
    tooltip: 'Próximamente - Análisis histórico detallado',
    variant: 'outline'
  },

  'exportar-datos': {
    id: 'exportar-datos',
    label: 'Exportar Datos',
    action: () => {
      // Export logic would go here
    },
    isEnabled: false,
    tooltip: 'Próximamente - Exporta datos a Excel/CSV',
    variant: 'ghost'
  },

  // Upload & Integration CTAs
  'subir-csv': {
    id: 'subir-csv',
    label: 'Subir CSV',
    destination: '/upload',
    isEnabled: true,
    variant: 'outline'
  },

  'plantilla-csv': {
    id: 'plantilla-csv',
    label: 'Descargar Plantilla',
    action: () => {
      // Download CSV template logic
    },
    isEnabled: true,
    variant: 'ghost'
  }
};

export function getCTA(id: string): CTAAction | undefined {
  return CTARegistry[id];
}

export function getEnabledCTAs(): CTAAction[] {
  return Object.values(CTARegistry).filter(cta => cta.isEnabled);
}

export function getDisabledCTAs(): CTAAction[] {
  return Object.values(CTARegistry).filter(cta => !cta.isEnabled);
}