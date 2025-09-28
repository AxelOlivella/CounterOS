# Suggestions for CounterOS Enhancement

## Required Dependencies (Need Confirmation)
- `papaparse` + `@types/papaparse` - For CSV processing in /datos page
- Already available: `@supabase/supabase-js`, `react-hook-form`, `zod`, `recharts`

## Architecture Recommendations

### 1. Database Helpers (Recommended)
- Create `src/lib/db.ts` with Supabase client using environment variables
- Create `src/lib/types.ts` with TypeScript interfaces for data models
- Add `src/hooks/useFoodCost.ts` for data fetching hooks

### 2. Missing Components (Need Creation)
The following components are referenced in App.tsx but don't exist:
- `src/pages/LandingPage.tsx`
- `src/pages/LoginPage.tsx` 
- `src/pages/SetupPage.tsx`
- `src/pages/OnboardingPage.tsx`
- `src/pages/DatosPage.tsx`
- `src/pages/StoreDashboardPage.tsx`
- `src/pages/TiendasPage.tsx`
- `src/pages/AlertasPage.tsx`
- `src/pages/ResumenPage.tsx`
- `src/pages/PlaceholderPage.tsx`
- `src/pages/NotFound.tsx`
- `src/contexts/TenantContext.tsx`
- `src/components/layout/AppLayout.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/components/pages/UploadPage.tsx`
- `src/components/pages/FoodCostAnalysisPage.tsx`
- `src/components/pages/PnLReportsPage.tsx`
- `src/components/ui/*` (shadcn/ui components)

### 3. Incremental Implementation Plan
1. Create essential contexts and layout components first
2. Add placeholder pages to prevent routing errors
3. Implement MVP data hooks and types
4. Build onboarding wizard step by step
5. Add data upload functionality
6. Enhance analysis pages with real data

### 4. Code Quality Improvements
- All new components should use semantic color tokens from index.css
- Implement proper TypeScript interfaces
- Add error boundaries for better UX
- Include loading states and empty states consistently

## Recomendaciones Post-Auditoría 2024-12-28

### 1. Integración de Componentes de Seguridad
**SafeBoundary**: Agregar como wrapper en componentes críticos:
```tsx
import { SafeBoundary } from '@/components/SafeBoundary';
// Envolver páginas de datos sensibles con <SafeBoundary>
```

**EnvGuard**: Integrar en App.tsx para validación temprana:
```tsx
import { EnvGuard } from '@/components/EnvGuard';
// Envolver la aplicación para verificar configuración
```

### 2. Utilidades CSV - Integración Sugerida
**En páginas de carga de datos existentes:**
- Usar `validateCsv()` antes de procesamiento
- Mostrar preview de 5 filas antes de importar
- Implementar validación específica con `validateCounterOSCsv()`

**En páginas de reportes P&L:**
- Agregar botón "Exportar CSV" usando `exportCounterOSData()`
- No requiere cambios de layout, solo handler adicional

### 3. Mejoras de UX Identificadas (Requieren Validación)
- **Loading states**: Faltan en algunos fetch de datos
- **Empty states**: Algunos componentes no manejan datos vacíos
- **Error handling**: Mejorar feedback de errores de red

### 4. Navegación Interna
- Algunos botones/enlaces podrían necesitar handlers de navegación
- Verificar que todos los enlaces usen `Link` de react-router-dom
- Estados activos en navegación móvil funcionan correctamente

### 5. Páginas Stub Creadas
Las siguientes páginas son solo referencia de auditoría:
- `src/pages/hoy.tsx`
- `src/pages/tiendas.tsx` 
- `src/pages/pnl.tsx`
- `src/pages/datos.tsx`

**NO están enlazadas al navbar principal** - solo para testing/referencia.

## No Breaking Changes
All suggestions above are additive - existing functionality will be preserved.
New components and utilities can be integrated gradually without disrupting current UX.