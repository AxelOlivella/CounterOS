# Sugerencias de Implementación (NO aplicadas)

Estas mejoras visuales requieren modificar archivos existentes.
Se documentan aquí para implementación futura opcional.

---

## 1. Envolver KPIs en GlassCard

**Dónde:** ResumenPage.tsx, OperationsDashboard.tsx

**Antes:**
```tsx
<div className="bg-white rounded-lg p-4">
  <StatCard ... />
</div>
```

**Después:**
```tsx
<GlassCard>
  <StatCard ... />
</GlassCard>
```

**Beneficio:** Efecto glassmorphism profesional

---

## 2. Usar Pill para status indicators

**Dónde:** Tablas con status (StoreAlertTable, AlertItem)

**Antes:**
```tsx
<span className="text-red-500">Crítico</span>
```

**Después:**
```tsx
<Pill tone="danger">Crítico</Pill>
<Pill tone="warn">Warning</Pill>
<Pill tone="accent">OK</Pill>
```

**Beneficio:** Consistencia visual en estados

---

## 3. Envolver tablas con TableWrap

**Dónde:** StoreAlertTable, CategoryBreakdown

**Antes:**
```tsx
<table className="...">...</table>
```

**Después:**
```tsx
<TableWrap>
  <table className="table--base">...</table>
</TableWrap>
```

**Beneficio:** Sticky headers + hover states suaves

---

## 4. ChartCard + LegendDots para gráficas

**Dónde:** TrendingChart, cualquier gráfica recharts

**Antes:**
```tsx
<div className="bg-white p-4">
  <h3>Trending</h3>
  <LineChart .../>
</div>
```

**Después:**
```tsx
<ChartCard 
  title="Trending (últimas 12 semanas)"
  action={<button>Export</button>}
>
  <LineChart .../>
  <LegendDots items={[
    {label: "FC", color: "#3b82f6"},
    {label: "Meta", color: "#ef4444"}
  ]} />
</ChartCard>
```

**Beneficio:** Layout consistente + leyendas interactivas

---

## 5. Clase hover-raise en cards clicables

**Dónde:** StoreCards, cualquier card con onClick

Agregar clase:
```tsx
<div className="... hover-raise cursor-pointer">
```

**Beneficio:** Feedback visual al hover

---

## 6. AutoGrid para layouts responsive

**Dónde:** Grids de KPIs, lists de cards

**Antes:**
```tsx
<div className="grid grid-cols-4 gap-4">
  {kpis.map(...)}
</div>
```

**Después:**
```tsx
<AutoGrid>
  {kpis.map(...)}
</AutoGrid>
```

**Beneficio:** Auto-responsive sin breakpoints manuales

---

## 7. Loading states con Skeletons

**Dónde:** Cualquier componente con loading

Agregar:
```tsx
{isLoading ? <KpiSkeleton /> : <KPIs data={data} />}
{isLoadingChart ? <ChartSkeleton /> : <Chart data={data} />}
```

**Beneficio:** UX percibida mejorada

---

## 8. Toolbar para filtros + acciones

**Dónde:** TiendasPage, cualquier lista con filtros

Ejemplo:
```tsx
<Toolbar 
  left={
    <>
      <Segmented items={["Todas","Críticas","OK"]} active={0} onChange={...} />
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

**Beneficio:** Layout consistente filtros/acciones

---

## 9. Data-skin por tenant (theming)

Implementación:
```tsx
// En App.tsx o layout principal
useEffect(() => {
  const tenant = getTenant();
  document.documentElement.setAttribute('data-skin', tenant.slug);
}, []);
```

En tokens.css agregar:
```css
:root[data-skin="froyo"] { --accent: #34d399; }
:root[data-skin="crepas"] { --accent: #f59e0b; }
```

**Beneficio:** Branding personalizado por cliente

---

## 10. Section para separar contenido

**Dónde:** Páginas largas como ResumenPage

Ejemplo:
```tsx
<Section>
  <h2>Food Cost Overview</h2>
  <AutoGrid>...</AutoGrid>
</Section>

<Section>
  <h2>Trending</h2>
  <ChartCard>...</ChartCard>
</Section>
```

**Beneficio:** Spacing consistente entre secciones

---

## Priorización Sugerida

### 🚀 Quick Wins (1-2 horas cada uno)
1. Tooltips en KPIs principales
2. Consistencia de variantes de botones
3. Semáforo centralizado

### 📈 Alto Impacto (4-8 horas cada uno)
4. Mobile overflow en tablas
5. Focus states y keyboard navigation
6. Notificaciones básicas

### 🎯 Mejoras Estratégicas (1-2 días cada uno)
7. Búsqueda y filtros avanzados
8. Gráficos interactivos
9. Comparación multi-período
10. Modo oscuro completo

---

## Componentes Verificados (Ya Existen)

✅ `src/components/common/PageHeader.tsx`
✅ `src/components/EnvGuard.tsx`
✅ `src/components/ui/states/EmptyState.tsx`
✅ `src/components/ui/states/LoadingState.tsx`
✅ `src/components/ui/states/ErrorState.tsx`
✅ `src/components/ui/skeleton.tsx`
✅ `src/utils/exportCsv.ts`
✅ `src/components/ui/StatusPill.tsx`
✅ `src/components/ui/TooltipHelp.tsx`

## Componentes Nuevos Disponibles (2025-10-13)

✅ `src/components/ui/GlassCard.tsx`
✅ `src/components/ui/Section.tsx`
✅ `src/components/ui/AutoGrid.tsx`
✅ `src/components/ui/TableWrap.tsx`
✅ `src/components/ui/ChartCard.tsx`
✅ `src/components/ui/LegendDots.tsx`
✅ `src/components/ui/Pill.tsx`
✅ `src/components/ui/KpiSkeleton.tsx`
✅ `src/components/ui/ChartSkeleton.tsx`
✅ `src/components/ui/Toolbar.tsx`
✅ `src/components/ui/Segmented.tsx`
