# ✅ FASE 2: HOOKS Y APIs ENTERPRISE - COMPLETADO

**Fecha:** 2025-01-15  
**Estado:** 100% COMPLETO ✅

---

## 📦 ARCHIVOS CREADOS

### 1. **useEnterpriseHierarchy.ts** ✅
**Path:** `src/hooks/useEnterpriseHierarchy.ts`

**Exports:**
- `useEnterpriseHierarchy()` - Hook principal que retorna jerarquía completa
- `useCorporate()` - Hook simplificado para obtener solo el corporate
- `useAllBrands()` - Hook simplificado para todas las brands

**Características:**
- ✅ Fetch completo: Corporate → Legal Entities → Brands → Store counts
- ✅ Cache 5 minutos con React Query
- ✅ Logging detallado
- ✅ Error handling robusto
- ✅ TypeScript types completos

**Uso:**
```typescript
const { data: hierarchy, isLoading } = useEnterpriseHierarchy();

if (hierarchy) {
  console.log(hierarchy.corporate.name); // "Grupo MYT"
  hierarchy.legalEntities.forEach(le => {
    console.log(le.rfc); // "MYT890123ABC"
    le.brands.forEach(brand => {
      console.log(brand.name, brand.store_count); // "Moshi Moshi", 12
    });
  });
}
```

---

### 2. **useBrands.ts** ✅
**Path:** `src/hooks/useBrands.ts`

**Exports:**
- `useBrands(legalEntityId)` - Fetch brands de un legal entity
- `useBrand(brandId)` - Fetch brand específico
- `useCreateBrand()` - Crear nuevo brand
- `useUpdateBrand()` - Actualizar brand existente
- `useDeleteBrand()` - Eliminar brand

**Características:**
- ✅ CRUD completo para brands
- ✅ Auto-generación de slug
- ✅ Validación de datos
- ✅ Toast notifications
- ✅ Cache invalidation automática
- ✅ Error handling con mensajes específicos

**Uso:**
```typescript
// Listar brands
const { data: brands } = useBrands('legal-entity-uuid');

// Crear brand
const createBrand = useCreateBrand();
createBrand.mutate({
  legal_entity_id: 'uuid',
  name: 'Moshi Moshi',
  concept: 'sushi',
  target_food_cost: 28,
  branding: {
    logo: 'url',
    primary_color: '#FF6B6B',
    secondary_color: '#4ECDC4'
  }
});

// Actualizar brand
const updateBrand = useUpdateBrand();
updateBrand.mutate({
  brandId: 'brand-uuid',
  updates: { target_food_cost: 30 }
});
```

---

### 3. **useCorporateUsers.ts** ✅
**Path:** `src/hooks/useCorporateUsers.ts`

**Exports:**
- `useCorporateUsers(corporateId)` - Fetch usuarios del corporate
- `useMyRole(corporateId)` - Obtener rol del usuario actual
- `useAddCorporateUser()` - Agregar usuario al corporate
- `useUpdateCorporateUser()` - Actualizar rol/permisos
- `useRemoveCorporateUser()` - Remover usuario
- `hasPermission()` - Helper para verificar permisos

**Características:**
- ✅ Gestión completa de usuarios
- ✅ Roles: admin, analyst, viewer
- ✅ Access scope: corporate, brand, store
- ✅ Filtros granulares (brand_ids, store_ids)
- ✅ Jerarquía de roles para verificación de permisos

**Uso:**
```typescript
// Ver usuarios del corporate
const { data: users } = useCorporateUsers('corporate-uuid');

// Ver mi rol
const { data: myRole } = useMyRole('corporate-uuid');
const isAdmin = hasPermission(myRole, 'admin');

// Agregar usuario con acceso limitado
const addUser = useAddCorporateUser();
addUser.mutate({
  user_id: 'user-uuid',
  corporate_id: 'corporate-uuid',
  role: 'analyst',
  access_scope: 'brand',
  access_filter: { brand_ids: ['brand-1', 'brand-2'] }
});
```

---

### 4. **EnterpriseContext.tsx** ✅
**Path:** `src/contexts/EnterpriseContext.tsx`

**Exports:**
- `EnterpriseProvider` - Context provider
- `useEnterprise()` - Hook para consumir contexto

**Características:**
- ✅ Estado global de hierarchy
- ✅ Selected brand/store para filtros
- ✅ Helpers: getBrand(), getAllBrands(), getStoresByBrand()
- ✅ Loading y error states

**Uso:**
```typescript
// En App.tsx o layout
<EnterpriseProvider>
  <AppContent />
</EnterpriseProvider>

// En cualquier componente
const { 
  hierarchy, 
  selectedBrandId, 
  setSelectedBrandId,
  getAllBrands 
} = useEnterprise();

// Filtro por brand
<Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
  {getAllBrands().map(brand => (
    <SelectItem value={brand.id}>{brand.name}</SelectItem>
  ))}
</Select>
```

---

## 🎯 FUNCIONALIDADES IMPLEMENTADAS

### ✅ Jerarquía Enterprise
- [x] Fetch completo Corporate → Legal Entity → Brand → Store
- [x] Cache estratégico con React Query
- [x] Hooks simplificados (useCorporate, useAllBrands)
- [x] TypeScript interfaces completas

### ✅ Gestión de Brands
- [x] CRUD completo (create, read, update, delete)
- [x] Auto-generación de slug
- [x] Validación de concept (enum)
- [x] Branding JSON (logo, colores)
- [x] Target food cost configurable
- [x] Toast notifications
- [x] Cache invalidation

### ✅ Gestión de Usuarios
- [x] Listar usuarios del corporate
- [x] Ver mi rol actual
- [x] Agregar usuarios con roles
- [x] Actualizar roles/permisos
- [x] Remover usuarios
- [x] Verificación de permisos (hasPermission)
- [x] Access scope granular

### ✅ Context Global
- [x] Estado compartido de hierarchy
- [x] Selected brand/store para filtros
- [x] Helpers para navegación
- [x] Loading y error handling

---

## 📊 TIPOS DEFINIDOS

```typescript
// Jerarquía
interface EnterpriseHierarchy {
  corporate: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
  };
  legalEntities: Array<{
    id: string;
    name: string;
    rfc: string;
    brands: Array<{
      id: string;
      name: string;
      concept: string;
      target_food_cost: number;
      store_count: number;
    }>;
  }>;
}

// Brand
interface Brand {
  id: string;
  legal_entity_id: string;
  name: string;
  slug: string;
  concept: string;
  target_food_cost: number;
  branding: {
    logo?: string;
    primary_color?: string;
    secondary_color?: string;
  };
}

// Usuario Corporate
interface CorporateUser {
  id: string;
  user_id: string;
  corporate_id: string;
  role: 'admin' | 'analyst' | 'viewer';
  access_scope: 'corporate' | 'brand' | 'store';
  access_filter: {
    brand_ids?: string[];
    store_ids?: string[];
  };
}
```

---

## 🔗 INTEGRACIÓN CON BACKEND

### ✅ Tablas Usadas
- `corporates` - ✅ SELECT con RLS
- `legal_entities` - ✅ SELECT con RLS
- `brands` - ✅ CRUD completo con RLS
- `corporate_users` - ✅ CRUD completo con RLS
- `stores` - ✅ COUNT por brand_id

### ✅ RLS Policies Verificadas
- Users solo ven su corporate ✅
- INSERT/UPDATE/DELETE requiere service_role ✅
- SELECT permitido para users con acceso ✅

### ✅ Cache Strategy
- Hierarchy: 5 min stale, 10 min gc
- Brands: 3 min stale, 10 min gc
- Corporate users: 2 min stale, 10 min gc
- My role: 5 min stale (no cambia frecuentemente)

---

## 📝 EJEMPLOS DE USO

### Caso 1: Dashboard Multi-Marca

```typescript
function Dashboard() {
  const { data: hierarchy, isLoading } = useEnterpriseHierarchy();
  const { selectedBrandId, setSelectedBrandId } = useEnterprise();

  if (isLoading) return <LoadingState />;

  return (
    <div>
      <h1>{hierarchy?.corporate.name}</h1>
      
      <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
        <SelectTrigger>Seleccionar Marca</SelectTrigger>
        <SelectContent>
          {hierarchy?.legalEntities.flatMap(le => 
            le.brands.map(brand => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name} ({brand.store_count} tiendas)
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      <FoodCostChart brandId={selectedBrandId} />
    </div>
  );
}
```

### Caso 2: Crear Nueva Marca

```typescript
function CreateBrandForm() {
  const createBrand = useCreateBrand();
  const { data: hierarchy } = useEnterpriseHierarchy();

  const handleSubmit = (data) => {
    createBrand.mutate({
      legal_entity_id: hierarchy.legalEntities[0].id,
      name: data.name,
      concept: data.concept,
      target_food_cost: data.targetFoodCost,
      branding: {
        primary_color: data.primaryColor,
        secondary_color: data.secondaryColor
      }
    });
  };

  return <BrandForm onSubmit={handleSubmit} isLoading={createBrand.isPending} />;
}
```

### Caso 3: Gestión de Permisos

```typescript
function UserManagement() {
  const { data: hierarchy } = useEnterpriseHierarchy();
  const { data: users } = useCorporateUsers(hierarchy?.corporate.id);
  const { data: myRole } = useMyRole(hierarchy?.corporate.id);
  const updateUser = useUpdateCorporateUser();

  const isAdmin = hasPermission(myRole, 'admin');

  if (!isAdmin) return <AccessDenied />;

  return (
    <Table>
      {users?.map(user => (
        <TableRow key={user.id}>
          <TableCell>{user.user_email}</TableCell>
          <TableCell>
            <Select 
              value={user.role} 
              onValueChange={(role) => updateUser.mutate({
                corporateUserId: user.id,
                updates: { role }
              })}
            >
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="analyst">Analyst</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </Select>
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
```

---

## 🚀 PRÓXIMOS PASOS

### FASE 3: UI Components ⏳

1. **HierarchySelector Component**
   - Dropdown multinivel Corporate → Brand → Store
   - Filtrado inteligente
   - Iconos por concepto

2. **BrandManagementPage**
   - Lista de brands con cards
   - Modal para crear/editar
   - Configuración de branding
   - Upload de logo

3. **UserManagementPage**
   - Tabla de usuarios
   - Edición inline de roles
   - Access scope visual
   - Invitar usuarios

4. **Dashboard Multi-Marca**
   - Selector de brand
   - KPIs por brand
   - Comparación entre brands
   - Drill-down a stores

---

## 📚 DOCUMENTACIÓN

### Hooks Disponibles

| Hook | Descripción | Cache |
|------|-------------|-------|
| `useEnterpriseHierarchy()` | Jerarquía completa | 5 min |
| `useCorporate()` | Solo corporate | 5 min |
| `useAllBrands()` | Todas las brands | 5 min |
| `useBrands(leId)` | Brands por LE | 3 min |
| `useBrand(brandId)` | Brand específico | 5 min |
| `useCorporateUsers(corpId)` | Usuarios del corporate | 2 min |
| `useMyRole(corpId)` | Mi rol actual | 5 min |

### Mutations Disponibles

| Mutation | Descripción | Invalidates |
|----------|-------------|-------------|
| `useCreateBrand()` | Crear brand | brands, hierarchy |
| `useUpdateBrand()` | Actualizar brand | brands, hierarchy |
| `useDeleteBrand()` | Eliminar brand | brands, hierarchy |
| `useAddCorporateUser()` | Agregar usuario | corporate-users |
| `useUpdateCorporateUser()` | Actualizar rol | corporate-users, my-role |
| `useRemoveCorporateUser()` | Remover usuario | corporate-users |

---

## ✅ CONCLUSIÓN

**FASE 2 completada al 100%.**

CounterOS ahora tiene:
- ✅ Hooks robustos para enterprise hierarchy
- ✅ CRUD completo de brands
- ✅ Gestión de usuarios y permisos
- ✅ Context global para estado compartido
- ✅ Cache estratégico con React Query
- ✅ TypeScript types completos
- ✅ Error handling y logging

**Siguiente:** Implementar UI components (FASE 3)
