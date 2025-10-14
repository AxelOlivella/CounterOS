# 🏢 CounterOS Enterprise Migration

**Fecha:** 2025-01-15  
**Versión:** 1.0  
**Estado:** Ready for execution

---

## 📋 RESUMEN

Migración para soportar arquitectura enterprise multi-marca:

```
Corporate (Grupo Económico)
  └─ Legal Entity (Razón Social RFC)
      └─ Brand (Marca Comercial)
          └─ Store (Tienda individual)
```

---

## 🎯 ORDEN DE EJECUCIÓN

### 1️⃣ Schema (001_schema.sql)
Crea tablas base:
- `corporates` - Grupos económicos
- `legal_entities` - Razones sociales con RFC
- `brands` - Marcas comerciales
- `corporate_users` - Control de acceso granular

### 2️⃣ Policies (002_policies.sql)
Configura RLS para todas las tablas nuevas con:
- SELECT permitido para usuarios con acceso al corporate
- INSERT/UPDATE/DELETE solo para service_role

### 3️⃣ Migration (003_migration.sql)
- Crea registros default por cada tenant existente
- Extiende `stores` con `brand_id`
- Extiende `compras` con `legal_entity_id`
- Todo idempotente y backward compatible

### 4️⃣ Verify (004_verify.sql)
Verifica:
- ✅ Todas las tablas creadas
- ✅ Stores sin brand_id = 0
- ✅ Compras sin legal_entity_id = 0
- ✅ Jerarquía completa
- ✅ RLS policies activas

### 5️⃣ Rollback (999_rollback.sql)
**Solo en emergencia:** Revierte toda la migración

---

## ⚡ EJECUCIÓN RÁPIDA

```sql
-- En Supabase SQL Editor:

\i 001_schema.sql
\i 002_policies.sql
\i 003_migration.sql
\i 004_verify.sql

-- Si todo ✅, estás listo
-- Si algo falla: \i 999_rollback.sql
```

---

## 🔍 VALIDACIÓN

Después de ejecutar 004_verify.sql, debes ver:

**Tabla checks:**
- ✅ corporates
- ✅ legal_entities
- ✅ brands
- ✅ corporate_users

**Integridad:**
- stores_sin_brand: 0
- compras_sin_legal_entity: 0

**Jerarquía:**
Por cada tenant existente debe haber:
1. Un corporate
2. Una legal_entity con RFC
3. Una brand
4. N stores vinculados

---

## 🚨 IMPORTANTE

### Backward Compatibility
- ✅ Código existente sigue funcionando
- ✅ Queries a `stores` y `compras` sin cambios
- ✅ API actual no afectada
- ✅ Onboarding funciona igual

### Seguridad
- ✅ RLS habilitado en todas las tablas
- ✅ Service role para operaciones críticas
- ✅ Users solo ven su corporate

### Performance
- ✅ Índices en todas las FKs
- ✅ Queries optimizados para jerarquía
- ✅ Sin impacto en queries legacy

---

## 📊 CASOS DE USO

### Cliente Enterprise: Grupo MYT
```
Corporate: "Grupo MYT"
  └─ Legal Entity: "Operadora MYT SA de CV" (RFC: MYT890123ABC)
      ├─ Brand: "Moshi Moshi" (sushi, 28% FC)
      │   └─ Stores: 12 locales
      └─ Brand: "La Crêpe" (crepas, 32% FC)
          └─ Stores: 8 locales
```

### Cliente SMB: La Taquería
```
Corporate: "La Taquería Corporate"
  └─ Legal Entity: "La Taquería SA de CV" (RFC: TAQ123456XYZ)
      └─ Brand: "Marca Principal" (tacos, 30% FC)
          └─ Stores: 3 locales
```

---

## 🔗 PRÓXIMOS PASOS

Después de ejecutar esta migración:

1. ✅ **FASE 2:** Hooks y APIs (useEnterpriseHierarchy, etc.)
2. ✅ **FASE 3:** UI para gestión de hierarchy
3. ✅ **FASE 4:** Dashboard multi-marca
4. ✅ **FASE 5:** Reportes consolidados

---

## 💬 SOPORTE

Si algo falla:
1. Ejecuta 999_rollback.sql
2. Revisa logs de Postgres
3. Verifica que `tenants` table existe
4. Contacta al equipo de backend
