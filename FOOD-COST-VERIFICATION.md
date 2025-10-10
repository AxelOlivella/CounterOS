# Food Cost Verification Checklist

## ✅ Estado del Sistema CounterOS

### 1. Configuración Base
- [x] Cliente Supabase actualizado para usar variables de entorno
- [x] `.env.example` creado con template de configuración
- [x] EnvGuard implementado y funcionando
- [x] RLS policies activas en todas las tablas multi-tenant

### 2. Datos de Ejemplo
- [x] 3,984 ventas generadas (últimos 30 días)
- [x] Revenue total: ~$355,782 MXN
- [x] Tenant: Portal Centro (00000000-0000-0000-0000-000000000001)
- [x] Usuario demo: demo@crepas.com

### 3. Vistas Críticas para Food Cost

#### v_sales_daily
```sql
-- Verificar ventas diarias por producto
SELECT * FROM v_sales_daily 
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
ORDER BY day DESC 
LIMIT 5;
```

**Resultado esperado:**
- Columnas: day, store_id, tenant_id, product_id, sku, qty_sold, revenue
- Datos agregados por día/sku
- Revenue calculado correctamente

#### daily_food_cost_view
```sql
-- Verificar food cost diario
SELECT 
  day,
  ROUND(revenue::numeric, 2) as revenue,
  ROUND(cogs::numeric, 2) as cogs,
  ROUND(food_cost_pct::numeric, 2) as food_cost_pct
FROM daily_food_cost_view
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
ORDER BY day DESC
LIMIT 5;
```

**Resultado esperado:**
- Food cost % entre 28-35% (típico para restaurantes)
- COGS calculado desde recipe_components
- Revenue desde v_sales_daily

### 4. Funciones Security Definer

```sql
-- Verificar acceso con security definer functions
SELECT * FROM get_daily_sales_data() LIMIT 5;
SELECT * FROM get_daily_food_cost_data() LIMIT 5;
SELECT * FROM get_stores_data();
```

### 5. UI - FoodCostAnalysisPage

**Verificar en `/food-cost-analysis`:**
- [ ] Store selector funciona
- [ ] Date range picker funciona
- [ ] KPI Cards muestran:
  - Average Food Cost %
  - Total Revenue
  - Total COGS
  - Variance vs Target (30%)
- [ ] Food Cost Trend Chart muestra evolución temporal
- [ ] Category Breakdown Chart muestra distribución por categoría
- [ ] Variance Analysis Chart muestra diferencias vs objetivo

### 6. Blindaje Anti-Hibernación

#### Edge Function Healthcheck
- [x] Creada: `supabase/functions/healthcheck/index.ts`
- [x] Realiza query ligero a tabla `tenants`
- [x] Retorna status JSON con timestamp
- [x] CORS headers configurados

#### Cron Job (pg_cron)
- [x] Extensiones habilitadas: `pg_cron`, `pg_net`
- [x] Job programado: `counteros-healthcheck`
- [x] Frecuencia: Cada 5 minutos (`*/5 * * * *`)
- [x] Endpoint: `/functions/v1/healthcheck`

**Verificar cron job:**
```sql
SELECT jobid, jobname, schedule, active, jobname
FROM cron.job 
WHERE jobname = 'counteros-healthcheck';
```

**Ver historial de ejecuciones:**
```sql
SELECT 
  runid, 
  jobid, 
  status, 
  start_time, 
  end_time,
  return_message
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'counteros-healthcheck')
ORDER BY start_time DESC
LIMIT 10;
```

### 7. Seguridad Multi-Tenant (RLS)

**Políticas implementadas:**
- [x] `stores`: Solo datos del tenant del usuario
- [x] `sales`: Filtrado por tenant_id
- [x] `products`: Acceso restringido por tenant
- [x] `ingredients`: Protegido por RLS
- [x] `recipe_components`: Multi-tenant aislado
- [x] `expenses`: Solo tenant propio

**Test de aislamiento:**
```sql
-- Como usuario autenticado, solo ver datos de MI tenant
SET request.jwt.claims TO '{"sub": "user-uuid", "tenant_id": "mi-tenant-uuid"}';
SELECT COUNT(*) FROM sales; -- Debe ser solo mis datos
```

### 8. Próximos Pasos

#### Datos Reales de COGS
- [ ] Integrar `process-cfdi` Edge Function
- [ ] Cargar facturas XML (CFDI) de proveedores
- [ ] Mapear compras → ingredients
- [ ] Calcular COGS real vs teórico

#### Análisis Avanzado
- [ ] Variancia por SKU
- [ ] Food cost por categoría de producto
- [ ] Alertas automáticas (>35% food cost)
- [ ] Comparativa histórica (WoW, MoM)

#### Optimización
- [ ] Cache de KPIs diarios (materialized views)
- [ ] Índices en queries frecuentes
- [ ] Particionamiento de tabla `sales` por fecha

### 9. Rotación de Credenciales (CRÍTICO)

⚠️ **PENDIENTE - ACCIÓN REQUERIDA:**

1. Ir a [Supabase Project Settings - API](https://supabase.com/dashboard/project/syusqcaslrxdkwaqsdks/settings/api)
2. Rotar `anon key` (la actual está expuesta en el repo)
3. Actualizar `.env` con la nueva key:
   ```
   VITE_SUPABASE_ANON_KEY=<nueva-key>
   ```
4. Redeploy en Lovable
5. ⚠️ **IMPORTANTE:** Actualizar el cron job con la nueva key:
   ```sql
   -- Re-schedule con nueva anon key
   SELECT cron.unschedule('counteros-healthcheck');
   SELECT cron.schedule(
     'counteros-healthcheck',
     '*/5 * * * *',
     $$
     SELECT net.http_post(
       url:='https://syusqcaslrxdkwaqsdks.supabase.co/functions/v1/healthcheck',
       headers:='{"Authorization": "Bearer <NUEVA-ANON-KEY>"}'::jsonb,
       body:='{}'::jsonb
     );
     $$
   );
   ```

### 10. Monitoreo

**Logs de Edge Function:**
- [Healthcheck Logs](https://supabase.com/dashboard/project/syusqcaslrxdkwaqsdks/functions/healthcheck/logs)

**Queries lentos:**
```sql
-- Ver queries más costosos
SELECT * FROM pg_stat_statements 
ORDER BY total_exec_time DESC 
LIMIT 10;
```

**Uso de recursos:**
- [Project Usage Dashboard](https://supabase.com/dashboard/project/syusqcaslrxdkwaqsdks/settings/billing)

---

## Resumen Ejecutivo

✅ **Funcionando:**
- Backend multi-tenant con RLS
- Vistas de Food Cost con datos de ejemplo
- Anti-hibernación configurado (cron cada 5 min)
- Cliente Supabase usa variables de entorno

⚠️ **Pendiente:**
- Rotar ANON_KEY expuesta
- Actualizar cron job con nueva key
- Probar UI en `/food-cost-analysis`
- Integrar CFDI para COGS real

🎯 **Objetivo:** Monitoreo en tiempo real de Food Cost por tienda/SKU, con alertas automáticas y análisis de variancia vs estándares de la industria (28-32%).
