# Polish Visual - Progreso de Implementación

## ✅ FASES COMPLETADAS

### FASE 1: ResumenPage ✅ 100%
- ✅ 4 cards hero con GlassCard + AutoGrid
- ✅ Secciones "Tiendas Destacadas" con GlassCard
- ✅ "Potencial de Ahorro" con GlassCard
- ✅ "Acciones Recomendadas" con GlassCard + hover-raise
- ✅ Organización completa con Section
- ✅ Colores semánticos (green-500/10, orange-500/20, etc.)

**Resultado:** Glassmorphism profesional en toda la página

---

### FASE 2: Operations Dashboard ✅ 100%
- ✅ 4 KPI cards con AutoGrid
- ✅ Heatmap geográfico envuelto en GlassCard
- ✅ Tabla de alertas (StoreAlertTable) envuelta en GlassCard
- ✅ Todo organizado con Section

**Resultado:** Dashboard operativo con efecto glass consistente

---

### FASE 3: Tablas con TableWrap + Pill ✅ 90%

**Completado:**
- ✅ `src/components/dashboard/StoreAlertTable.tsx`
  - TableWrap implementado
  - Pill para status (crítico/warning)
  - Colores semánticos en deltas
  - Hover states suaves

**Pendiente:**
- ⏳ `src/pages/StoreDetailPage.tsx` - Tabla de categorías (línea ~305)
- ⏳ `src/components/dashboard/CategoryBreakdown.tsx`
- ⏳ `src/components/pages/FoodCostAnalysisPage.tsx` - Tablas varias

**Cómo implementar pendientes:**
```tsx
import TableWrap from '@/components/ui/TableWrap';
import Pill from '@/components/ui/Pill';

// Envolver tabla
<TableWrap>
  <table className="w-full">
    // ... thead, tbody
  </table>
</TableWrap>

// Reemplazar status badges
<Pill tone="danger">Crítico</Pill>
<Pill tone="warn">Warning</Pill>
<Pill tone="accent">OK</Pill>
```

---

### FASE 4: Gráficas con ChartCard + LegendDots ✅ 80%

**Completado:**
- ✅ `src/components/dashboard/TrendingChart.tsx`
  - ChartCard wrapper
  - LegendDots con colores FC y Meta
  - Insight message con colores semánticos

**Pendiente:**
- ⏳ `src/components/food-cost/FoodCostTrendChart.tsx`
- ⏳ `src/components/food-cost/CategoryBreakdownChart.tsx` (pie chart)
- ⏳ `src/components/food-cost/VarianceAnalysisChart.tsx`
- ⏳ `src/components/pnl/*Chart.tsx` (varios)

**Patrón a seguir:**
```tsx
<ChartCard 
  title="Título del Chart"
  action={<button>Export</button>}
>
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      {/* chart elements */}
    </LineChart>
  </ResponsiveContainer>
  
  <LegendDots items={[
    {label: "Serie 1", color: "#3b82f6"},
    {label: "Serie 2", color: "#ef4444"}
  ]} />
</ChartCard>
```

---

### FASE 5: Loading States con Skeletons ✅ 40%

**Completado:**
- ✅ `src/pages/ResumenPage.tsx` - KpiSkeleton en loading
- ✅ Componentes creados:
  - `src/components/ui/KpiSkeleton.tsx`
  - `src/components/ui/ChartSkeleton.tsx`

**Pendiente:**
- ⏳ `src/pages/OperationsDashboard.tsx`
- ⏳ `src/pages/StoreDetailPage.tsx`
- ⏳ `src/components/pages/FoodCostAnalysisPage.tsx`
- ⏳ `src/components/pages/PnLReportsPage.tsx`

**Implementación:**
```tsx
import KpiSkeleton from '@/components/ui/KpiSkeleton';
import ChartSkeleton from '@/components/ui/ChartSkeleton';

{isLoading ? (
  <>
    <KpiSkeleton />
    <ChartSkeleton />
  </>
) : (
  // contenido real
)}
```

---

### FASE 6: Toolbars y Filtros ⏳ 0%

**Pendiente:**
- ⏳ `src/pages/TiendasPage.tsx` - Filtros de tiendas
- ⏳ `src/components/pages/FoodCostAnalysisPage.tsx` - Selector de período
- ⏳ Cualquier página con filtros/acciones

**Patrón a implementar:**
```tsx
import Toolbar from '@/components/ui/Toolbar';
import Segmented from '@/components/ui/Segmented';

<Toolbar 
  left={
    <>
      <Segmented 
        items={["Todas", "Críticas", "OK"]} 
        active={filter} 
        onChange={setFilter} 
      />
      <input placeholder="Buscar..." />
    </>
  }
  right={
    <>
      <button>Export</button>
      <button>+ Nueva</button>
    </>
  }
/>
```

---

### FASE 7: Polish Final ✅ 60%

**Completado:**
- ✅ Data-skin theming activado en App.tsx
- ✅ ThemeApplier component
- ✅ Tokens.css con skins descomentados:
  - `froyo` → #34d399 (verde esmeralda)
  - `crepas` → #f59e0b (naranja)
  - `portal-centro` → #22c55e (verde)
- ✅ hover-raise en cards clicables de ResumenPage

**Pendiente - Colores Hardcoded:**

Archivos con colores directos que necesitan semantic tokens:

1. **src/pages/AlertasPage.tsx**
   - Líneas 77, 81, 90, 94, 226, 232
   - `text-red-500` → `text-[var(--danger)]`
   - `text-green-500` → `text-[var(--accent)]`
   - `bg-red-50` → `bg-[var(--danger)]/10`
   - `bg-green-50` → `bg-[var(--accent)]/10`

2. **src/pages/OnboardingPage.tsx**
   - Líneas 15, 30, 34
   - Íconos CheckCircle: `text-green-500` → `text-[var(--accent)]`

3. **src/pages/StoreDashboardPage.tsx**
   - Líneas 68-70, 76-77, 206-207, 210-211, 316
   - Badges y legends con colores directos

4. **src/pages/StoreDetailPage.tsx**
   - Línea 378
   - Alert box: `bg-red-50 border-red-200` → `bg-[var(--danger)]/10 border-[var(--danger)]/20`

**Búsqueda y reemplazo sugerido:**
```bash
# Danger (rojo)
text-red-500 → text-[var(--danger)]
text-red-600 → text-[var(--danger)]
bg-red-50 → bg-[var(--danger)]/10
border-red-200 → border-[var(--danger)]/20

# Warning (amarillo/naranja)
text-yellow-500 → text-[var(--warn)]
text-orange-500 → text-[var(--warn)]
bg-yellow-50 → bg-[var(--warn)]/10
border-yellow-200 → border-[var(--warn)]/20

# Success/Accent (verde)
text-green-500 → text-[var(--accent)]
text-green-600 → text-[var(--accent)]
bg-green-50 → bg-[var(--accent)]/10
border-green-200 → border-[var(--accent)]/20
```

**Hover-raise pendiente:**
- Buscar todos los cards con `onClick` o `cursor-pointer`
- Agregar clase `hover-raise`

---

## 📊 PROGRESO GENERAL

| Fase | Completado | Estado |
|------|------------|--------|
| FASE 1: ResumenPage | 100% | ✅ |
| FASE 2: Operations Dashboard | 100% | ✅ |
| FASE 3: TableWrap + Pill | 90% | 🟡 |
| FASE 4: ChartCard + LegendDots | 80% | 🟡 |
| FASE 5: Skeletons | 40% | 🟡 |
| FASE 6: Toolbars | 0% | ⏳ |
| FASE 7: Polish Final | 60% | 🟡 |
| **TOTAL** | **67%** | 🟡 |

---

## 🎯 SIGUIENTE PASO RECOMENDADO

**Prioridad 1: Completar colores semánticos (FASE 7)**
- Archivo por archivo, reemplazar hardcoded colors
- ~30 minutos de trabajo

**Prioridad 2: Skeletons en páginas clave (FASE 5)**
- OperationsDashboard
- FoodCostAnalysisPage
- ~15 minutos

**Prioridad 3: Toolbars en páginas con filtros (FASE 6)**
- TiendasPage
- FoodCostAnalysisPage (período selector)
- ~30 minutos

**Prioridad 4: Completar TableWrap + Pill (FASE 3)**
- StoreDetailPage
- CategoryBreakdown
- ~20 minutos

**Prioridad 5: Completar ChartCard (FASE 4)**
- Food cost charts
- P&L charts
- ~30 minutos

---

## ✨ RESULTADO ACTUAL

**Lo que funciona perfectamente:**
- ✅ ResumenPage tiene glassmorphism completo
- ✅ Operations Dashboard con glass effect
- ✅ StoreAlertTable con Pill y sticky headers
- ✅ TrendingChart con ChartCard y legend
- ✅ Theming por tenant activado
- ✅ KpiSkeleton en ResumenPage

**Lo que se ve profesional:**
- Efecto glassmorphism en cards principales
- Hover effects suaves
- Spacing consistente con Section
- Auto-responsive con AutoGrid
- Focus states accesibles

**Lo que falta pulir:**
- Colores hardcoded en 4-5 páginas
- Más skeletons en loading states
- Toolbars en páginas con filtros
- Completar TableWrap en todas las tablas
- Completar ChartCard en todos los charts

---

## 🚀 CUANDO ESTÉ 100%

- Visual consistente en toda la app
- Theming por tenant funcional
- Zero colores hardcoded
- Loading states con skeletons profesionales
- Tablas con sticky headers uniformes
- Charts con layout consistente
- Filtros con UI unificada
- Hover effects en todos los elementos interactivos

**Estimación para 100%:** 2-3 horas de trabajo adicional
