# 🔍 AUDITORÍA POST-MIGRACIÓN ENTERPRISE

Guía rápida para ejecutar la auditoría completa en **5 minutos**.

---

## 📋 Instrucciones de Uso

### 1️⃣ Abrir Supabase SQL Editor
- Ve a tu proyecto en Supabase Dashboard
- Click en "SQL Editor" en el menú lateral
- Abre una nueva query

### 2️⃣ Ejecutar Scripts en Orden

#### **Script 1: Tablas y Columnas** (30 segundos)
```bash
Copiar y pegar: sql/audit/001_verify_tables_and_columns.sql
```
**Resultado esperado:**
- ✅ 4 tablas enterprise creadas
- ✅ `stores.brand_id` existe (uuid, NOT NULL)
- ✅ `compras.legal_entity_id` existe (uuid, NOT NULL)
- ✅ Todas las tablas tienen registros

**🔴 Si falla:** STOP - No continuar

---

#### **Script 2: Integridad de Datos** (30 segundos)
```bash
Copiar y pegar: sql/audit/002_verify_data_integrity.sql
```
**Resultado esperado:**
- ✅ 0 stores huérfanos (sin brand_id)
- ✅ 0 compras huérfanas (sin legal_entity_id)
- ✅ 0 brands huérfanos (sin legal entity)
- ✅ 0 legal entities huérfanos (sin corporate)
- ✅ Cada tenant tiene su estructura completa

**🔴 Si hay CUALQUIER huérfano:** STOP - Ejecutar rollback

---

#### **Script 3: Jerarquía Completa** (1 minuto)
```bash
Copiar y pegar: sql/audit/003_verify_hierarchy.sql
```
**Resultado esperado:**
- ✅ Vista completa de Corporate → LE → Brand → Store
- ✅ Cada brand tiene al menos 1 store
- ✅ Stores tienen compras y ventas asociadas
- ✅ Consistencia de tenant_id

**Revisar output:**
- ¿Ves tu estructura jerárquica completa?
- ¿Los números de stores/compras/ventas coinciden con tu dashboard?

---

#### **Script 4: RLS y Permisos** (1 minuto)
```bash
Copiar y pegar: sql/audit/004_verify_rls_and_permissions.sql
```
**Resultado esperado:**
- ✅ RLS habilitado en todas las tablas enterprise
- ✅ Al menos 1 policy por tabla
- ✅ Índices creados (brand, corporate, legal_entity)
- ✅ Foreign keys configuradas

---

#### **Script 5: Acceso de Usuario** (1 minuto)
```bash
Copiar y pegar: sql/audit/005_verify_user_access.sql
```
**⚠️ IMPORTANTE:** Ejecutar como **usuario autenticado**, NO como service_role

**Resultado esperado:**
- ✅ Ves tu registro en `corporate_users` con role 'admin'
- ✅ Ves al menos 1 corporate
- ✅ Ves tus brands
- ✅ Ves tus stores
- ✅ Puedes leer de todas las tablas sin errores

**🔴 Si ves "permission denied":** RLS mal configurado

---

## ✅ Checklist Rápido

Después de ejecutar los 5 scripts:

- [ ] **Script 1:** Todas las tablas existen ✅
- [ ] **Script 2:** Integridad 100% (0 huérfanos) ✅
- [ ] **Script 3:** Jerarquía completa visible ✅
- [ ] **Script 4:** RLS + Índices OK ✅
- [ ] **Script 5:** Acceso de usuario OK ✅

---

## 🎯 Resultado Final

### ✅ TODO VERDE → Continuar a testing de UI

```bash
# Siguiente paso:
1. Abrir tu app en /resumen
2. Verificar que dashboard carga sin errores
3. Buscar ContextSelector en la UI
4. Probar drill-down (Grupo → Marca → Tienda)
```

### 🔴 ALGÚN ROJO → Ejecutar Rollback

```sql
-- En Supabase SQL Editor:
\i sql/migrations/2025_01_enterprise/999_rollback.sql
```

---

## 📊 Interpretar Resultados

### Status Icons
- ✅ = PASS - Todo bien
- ⚠️ = WARNING - Revisar pero no crítico
- 🔴 = FAIL - Detener y arreglar
- 📋 = INFO - Solo informativo

### Tabla de Status Rápida

| Script | Checks | Tiempo | Crítico |
|--------|--------|--------|---------|
| 001    | 4      | 30s    | ✅ Sí  |
| 002    | 6      | 30s    | ✅ Sí  |
| 003    | 4      | 60s    | ⚠️ Revisar |
| 004    | 5      | 60s    | ⚠️ Revisar |
| 005    | 5      | 60s    | ✅ Sí  |

---

## 🚨 Troubleshooting

### Error: "permission denied for table corporate_users"
**Causa:** RLS policy mal configurada  
**Fix:** Re-ejecutar migration de RLS policies

### Error: "stores sin brand_id"
**Causa:** Migración no completó correctamente  
**Fix:** Ejecutar rollback y volver a migrar

### Error: "brands huérfanos"
**Causa:** Foreign keys no se crearon correctamente  
**Fix:** Verificar que legal_entities tiene registros

---

## 📝 Notas

- **Tiempo total:** ~5 minutos
- **Orden:** DEBE ejecutarse en orden (001 → 005)
- **Rollback:** Disponible en `999_rollback.sql`
- **Soporte:** Ver `ENTERPRISE-PHASES-COMPLETE.md`

---

## ✨ Próximos Pasos

Una vez que **todos los checks estén en verde**:

1. ✅ Testing de UI (`/resumen` + ContextSelector)
2. ✅ Testing de hooks (useStores, useBrands)
3. ✅ Testing de drill-down jerárquico
4. ✅ Deploy a staging
5. ✅ Onboarding cliente piloto

---

**🎉 ¡Éxito en la auditoría!**
