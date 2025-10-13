# Configuración de Mapbox para Operations Dashboard

## ¿Por qué necesitas Mapbox?

El **Operations Dashboard** utiliza Mapbox para visualización geográfica de precision de las 100+ tiendas, permitiendo:
- 🗺️ Mapa interactivo con zoom/pan
- 📍 Markers color-coded por food cost status
- 🎯 Click en tienda → Navigate a detalle
- 🔍 Filtros por región y status
- 📊 Pattern detection visual (clusters problemáticos)

## Paso 1: Obtener tu Mapbox Public Token

1. Ve a [https://account.mapbox.com/](https://account.mapbox.com/)
2. Crea una cuenta gratuita (si no tienes)
3. En el dashboard, ve a **Access Tokens**
4. Copia tu **Default Public Token** (empieza con `pk.`)

**Nota:** El token público es seguro para usar en frontend (no es un secreto).

## Paso 2: Agregar el token a tu proyecto

### Opción A: Variable de entorno (Recomendado)

1. Crea/edita tu archivo `.env`:
```bash
VITE_MAPBOX_PUBLIC_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbTFhYmMxMjMifQ...
```

2. Actualiza `src/components/dashboard/StoreHeatmap.tsx`:
```typescript
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN || "";
```

### Opción B: Hardcoded (Solo para desarrollo)

Edita directamente en `src/components/dashboard/StoreHeatmap.tsx`:
```typescript
const MAPBOX_TOKEN = "pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbTFhYmMxMjMifQ...";
```

## Paso 3: Verificar funcionamiento

1. Ve a `/dashboard/operations`
2. Scroll al **heatmap geográfico**
3. Deberías ver:
   - ✅ Mapa de CDMX con calles
   - ✅ 100 markers color-coded (🟢🟡🔴)
   - ✅ Zoom/pan controls (arriba derecha)
   - ✅ Tooltips al hover sobre markers

**Si ves un warning de "Mapbox API Key Required":**
→ El token no está configurado correctamente. Revisa los pasos anteriores.

## Features implementadas con Mapbox

### ✅ Interactividad:
- **Click en marker** → Navigate a `/dashboard/operations/store/:id`
- **Hover sobre marker** → Tooltip con nombre + FC%
- **Zoom/Pan** → Controles en esquina superior derecha
- **Fullscreen** → Botón para expandir mapa completo

### ✅ Filtros:
- **Por región:** CDMX Norte, Sur, Centro, Oeste, Estado de México
- **Por status:** Excelente (🟢), Warning (🟡), Crítico (🔴)
- **Estilo de mapa:** Calles, Light, Satélite
- **Labels:** Toggle para mostrar/ocultar nombres de tiendas

### ✅ Animaciones:
- **Markers fade in** con stagger (aparecen secuencialmente)
- **Smooth transitions** en zoom/pan
- **Hover effects** en markers (scale + brightness)

### ✅ Insights automáticos:
- **Pattern detection:** Si hay 5+ tiendas críticas, muestra insight box
- **Cluster alerts:** "Cluster de 8 tiendas críticas en CDMX Sur"
- **Leyenda dinámica:** Counts y porcentajes por status

## Pricing de Mapbox

**Plan Gratuito:**
- ✅ 50,000 map loads/mes
- ✅ Suficiente para desarrollo y staging
- ✅ Más que suficiente para 100-200 usuarios activos/mes

**Plan Pro ($5/mes):**
- ✅ 100,000 map loads/mes
- ✅ Recomendado para producción

**Para cadena de 100 tiendas:**
- VP Ops usa dashboard 20 veces/día = 600 loads/mes
- 10 usuarios corporativos = 6,000 loads/mes
- **→ Plan gratuito es suficiente**

## Troubleshooting

### Error: "Mapbox API Key Required"
**Causa:** Token no configurado o inválido
**Solución:** Verifica que el token en `.env` sea correcto y empiece con `pk.`

### Error: "Failed to load map"
**Causa:** Token inválido o expirado
**Solución:** Genera un nuevo token en Mapbox dashboard

### Markers no aparecen
**Causa:** Coordenadas fuera de rango o filtros muy restrictivos
**Solución:** 
- Verifica que lat/lng sean válidos
- Click "Limpiar filtros" en el dashboard

### Mapa muy lento
**Causa:** Muchos markers (100+) con animaciones
**Solución:** Ya optimizado con `will-change` y GPU acceleration

## Alternativas sin Mapbox

Si prefieres no usar Mapbox, puedes:

1. **Usar Leaflet (open-source):** Similar a Mapbox pero gratuito
2. **Volver a SVG scatter plot:** Implementación anterior (más simple)
3. **Usar Google Maps:** Requiere Google Cloud account

**Recomendación:** Mapbox es la mejor opción para este caso (visual quality + pricing + dev experience).

## Próximos pasos (Fase 4)

Una vez Mapbox funcione:
- [ ] Conectar a **real data** desde Supabase (reemplazar mock)
- [ ] Agregar **heatmap layer** (density visualization)
- [ ] Implementar **clustering** para 100+ stores
- [ ] Agregar **time-based playback** (ver evolución FC en el tiempo)
- [ ] **Export mapa** a PNG/PDF para reportes ejecutivos

---

**¿Preguntas?** Contáctame para ayuda con setup.
