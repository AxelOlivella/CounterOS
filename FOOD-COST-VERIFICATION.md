# Food Cost System - Status Report

## ✅ Sistema Base Verificado (2025-10-11)

### Database Health
- ✅ **3,984 ventas** en tabla `sales`
- ✅ **1 tienda** activa en tabla `stores`  
- ✅ **1 usuario demo** configurado (demo@crepas.com)
- ✅ Tenant ID: `00000000-0000-0000-0000-000000000001`

### Anti-Hibernación Implementado ✅
- ✅ Edge Function `healthcheck` creado (`supabase/functions/healthcheck/index.ts`)
- ✅ Usa SERVICE_ROLE_KEY para permisos completos
- ✅ Cron job cada 5 min configurado con `pg_cron`
- ✅ ANON_KEY rotado: `sb_publishable_pB8t7_YT9Ifrd3FQyOUMIA_mYvGVkLl`
- ✅ Actualizado en `.env` y cron job

**Verificar cron activo:**
```sql
SELECT jobid, jobname, schedule, active
FROM cron.job 
WHERE jobname = 'counteros-healthcheck';

-- Ver últimas 10 ejecuciones
SELECT runid, status, start_time, return_message
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'counteros-healthcheck')
ORDER BY start_time DESC LIMIT 10;
```

## 🔐 Seguridad RLS Correcta

### Patrón de Acceso Multi-Tenant
Las vistas `v_sales_daily` y `daily_food_cost_view` NO tienen RLS directo (por diseño PostgreSQL). 

El acceso está protegido por **funciones SECURITY DEFINER** que verifican tenant_id:
- `get_daily_food_cost_data()` - Acceso seguro a food cost
- `get_daily_sales_data()` - Acceso seguro a ventas
- `get_stores_data()` - Acceso seguro a tiendas

✅ **Patrón correcto**: 
```typescript
// ✅ CORRECTO - Cliente llama función RPC
const { data } = await supabase.rpc('get_daily_food_cost_data');

// ❌ INCORRECTO - No consultar vistas directamente
const { data } = await supabase.from('v_sales_daily').select();
```

### Tablas con RLS Activo
- ✅ `stores` - Solo datos del tenant del usuario
- ✅ `sales` - Filtrado por tenant_id  
- ✅ `products` - Acceso restringido por tenant
- ✅ `ingredients` - Protegido por RLS
- ✅ `recipe_components` - Multi-tenant aislado
- ✅ `expenses` - Solo tenant propio
- ✅ `users` - Solo ver propio perfil
- ✅ `tenants` - Solo ver propio tenant

---

## 📊 Próximos Pasos para Food Cost Completo

### Paso 1: Login y Prueba de UI ✅ LISTO PARA PRUEBA

**Acción**: Hacer login con usuario demo
- Email: `demo@crepas.com`
- Password: (configurado en Supabase Auth)
- Navegar a página Food Cost Analysis (ruta a confirmar en routes)

**Verificar en UI** (`FoodCostAnalysisPage.tsx`):
- [ ] Store selector carga tiendas desde `get_stores_data()`
- [ ] Date range picker funciona (últimos 30 días por defecto)
- [ ] KPI Cards muestran:
  - Average Food Cost % (rojo si >30%, verde si ≤30%)
  - Total Revenue (desde `get_daily_food_cost_data()`)
  - Total COGS (calculado desde recetas)
  - Variance vs Target (diferencia vs 30%)
- [ ] Loading states funcionan correctamente
- [ ] Error toasts aparecen si falla data fetch

**Funciones RPC que debe llamar la UI:**
```typescript
// Ya implementado en FoodCostAnalysisPage.tsx líneas 59, 84
await supabase.rpc('get_stores_data');
await supabase.rpc('get_daily_food_cost_data');
```

---

### Paso 2: Configurar Ingredientes y Recetas 🔄 PENDIENTE

**Problema actual**: COGS probablemente sea $0 porque no hay ingredientes/recetas configuradas.

**Verificar estado:**
```sql
SELECT COUNT(*) as ingredient_count FROM ingredients;
SELECT COUNT(*) as recipe_count FROM recipe_components;
SELECT COUNT(*) as product_count FROM products;
```

**Si están vacías**, cargar datos de ejemplo:

```sql
-- 1. Cargar ingredientes básicos
INSERT INTO ingredients (tenant_id, code, name, unit, cost_per_unit) VALUES
('00000000-0000-0000-0000-000000000001', 'HAR01', 'Harina de trigo', 'kg', 18.50),
('00000000-0000-0000-0000-000000000001', 'HUE01', 'Huevo', 'pza', 2.80),
('00000000-0000-0000-0000-000000000001', 'LEC01', 'Leche', 'lt', 22.00),
('00000000-0000-0000-0000-000000000001', 'AZU01', 'Azúcar', 'kg', 20.00),
('00000000-0000-0000-0000-000000000001', 'MAN01', 'Mantequilla', 'kg', 145.00);

-- 2. Vincular ingredientes con productos (recetas)
-- Ejemplo: Crepa básica requiere harina, huevos, leche
INSERT INTO recipe_components (tenant_id, product_id, ingredient_id, qty)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  p.product_id,
  i.ingredient_id,
  CASE i.code
    WHEN 'HAR01' THEN 0.12  -- 120g de harina por crepa
    WHEN 'HUE01' THEN 2.00  -- 2 huevos
    WHEN 'LEC01' THEN 0.15  -- 150ml de leche
  END as qty
FROM products p
CROSS JOIN ingredients i
WHERE p.tenant_id = '00000000-0000-0000-0000-000000000001'
  AND i.code IN ('HAR01', 'HUE01', 'LEC01')
  AND p.sku LIKE 'CREPA%';  -- Ajustar según SKUs reales
```

**Resultado esperado**: 
- `v_theoretical_consumption_daily` calculará qty_needed por ingrediente
- `daily_food_cost_view` sumará (qty_needed × cost_per_unit) = COGS
- Food Cost % = (COGS / Revenue) × 100

---

### Paso 3: Calcular Food Cost Real 🎯 OBJETIVO

Con ingredientes y recetas configurados correctamente:

**Flujo de cálculo:**
```sql
-- Vista 1: Consumo teórico diario
v_theoretical_consumption_daily
  = ventas × recetas → kg/lt/pza de cada ingrediente

-- Vista 2: Food cost diario  
daily_food_cost_view
  = (consumo × costo_unitario) / revenue
```

**Benchmarks esperados para crepas:**
- Food Cost %: 25-32% (óptimo)
- Si >35%: revisar porciones, merma, robo
- Si <20%: revisar precios de venta, calidad

**Verificar cálculo:**
```sql
SELECT 
  day,
  store_id,
  ROUND(revenue::numeric, 2) as revenue_mxn,
  ROUND(cogs::numeric, 2) as cogs_mxn,
  ROUND(food_cost_pct::numeric, 2) as fc_pct,
  CASE 
    WHEN food_cost_pct > 35 THEN '🔴 Crítico'
    WHEN food_cost_pct > 32 THEN '🟡 Atención'
    ELSE '🟢 OK'
  END as status
FROM daily_food_cost_view
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
ORDER BY day DESC
LIMIT 10;
```

---

### Paso 4: Integración CFDI para COGS Real (Opcional)

Ya existe edge function `process-cfdi` que puede:
- Recibir facturas CFDI (XML) de proveedores
- Extraer productos y costos reales de compras
- Actualizar tabla `ingredients` con costos actualizados

**Beneficio**: COGS basado en facturas reales vs teórico de recetas.

**Endpoint**:
```typescript
const { data } = await supabase.functions.invoke('process-cfdi', {
  body: { cfdiXml: '<xml>...</xml>' }
});
```

---

## 🎯 Plan de Acción Inmediato

### ✅ Completado
1. Cliente Supabase con variables de entorno correctas
2. Healthcheck edge function + cron cada 5 min
3. ANON_KEY rotado y actualizado
4. RLS policies verificadas (multi-tenant seguro)
5. Funciones SECURITY DEFINER funcionando

### 🔄 Siguiente (En Orden)
1. **Login y verificar UI** → Ver si muestra datos (aunque COGS sea $0)
2. **Cargar ingredientes y recetas** → SQL arriba
3. **Verificar cálculo Food Cost** → Debe mostrar % realista
4. **Alertas y monitoreo** → Dashboard operativo

---

## ⚠️ Warnings Pendientes

### Leaked Password Protection Disabled (Nivel Bajo)
- **No es crítico** para ambiente demo
- **Para producción**: Activar en Supabase Dashboard → Authentication → Settings → "Enable Leaked Password Protection"

### Billing Alerts (Recomendado)
- Configurar alertas de uso en [Project Settings](https://supabase.com/dashboard/project/syusqcaslrxdkwaqsdks/settings/billing)
- Spend cap: Considerar límite mensual
- Notificaciones: Email cuando se alcance 80% del límite

---

## 📞 Soporte y Monitoreo

### Logs Útiles
- [Healthcheck Function Logs](https://supabase.com/dashboard/project/syusqcaslrxdkwaqsdks/functions/healthcheck/logs)
- [Edge Function Logs](https://supabase.com/dashboard/project/syusqcaslrxdkwaqsdks/functions)
- [Database Logs](https://supabase.com/dashboard/project/syusqcaslrxdkwaqsdks/logs/postgres-logs)

### Queries de Diagnóstico
```sql
-- Verificar datos base
SELECT 
  (SELECT COUNT(*) FROM sales) as sales_count,
  (SELECT COUNT(*) FROM stores) as stores_count,
  (SELECT COUNT(*) FROM products) as products_count,
  (SELECT COUNT(*) FROM ingredients) as ingredients_count,
  (SELECT COUNT(*) FROM recipe_components) as recipes_count;

-- Verificar cron job activo
SELECT * FROM cron.job WHERE jobname = 'counteros-healthcheck';

-- Ver últimas ejecuciones healthcheck
SELECT status, start_time, return_message
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'counteros-healthcheck')
ORDER BY start_time DESC LIMIT 5;
```

---

## 🎉 Estado Final

**✅ Sistema listo para prueba**. Siguiente acción del usuario:

1. **Login** con `demo@crepas.com`
2. **Navegar** a página Food Cost Analysis
3. **Verificar** que UI cargue (aunque COGS sea $0 inicialmente)
4. **Cargar** ingredientes y recetas (SQL Paso 2 arriba)
5. **Validar** que Food Cost % se calcule correctamente

**Healthcheck activo**: Sistema no hibernará (cron cada 5 min toca DB).  
**Seguridad**: RLS funcional con multi-tenant isolation via SECURITY DEFINER functions.  
**Datos**: 3,984 ventas listas, falta configurar ingredientes/recetas para COGS real.
