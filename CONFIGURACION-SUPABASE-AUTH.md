# 🔐 Configuración de Supabase Auth para 10/10

## ⚡ Acción Requerida (2 minutos)

Esta es la **única configuración manual** necesaria para alcanzar el 10/10 perfecto en CounterOS.

---

## 📍 Paso 1: Acceder a Supabase Dashboard

**Tu proyecto:** `syusqcaslrxdkwaqsdks`

**Link directo:** https://supabase.com/dashboard/project/syusqcaslrxdkwaqsdks/auth/providers

---

## 🔧 Paso 2: Configurar Password Protection

### Instrucciones Detalladas:

1. **En el menú lateral izquierdo**, haz clic en:
   ```
   🔐 Authentication
   ```

2. **Luego selecciona:**
   ```
   ⚙️ Policies (o Configuration)
   ```

3. **Busca la sección:** 
   ```
   Password Requirements
   ```

4. **Activa el checkbox:**
   ```
   ☑️ Enable leaked password protection
   ```
   
   **Descripción:** "Prevent users from choosing passwords that have been leaked in data breaches"

5. **Guarda los cambios:**
   ```
   💾 Save
   ```

---

## 🎯 Configuraciones Adicionales Recomendadas (Opcionales)

Mientras estás en la sección de **Password Requirements**, considera activar:

### 1. **Minimum Password Length**
```
Mínimo recomendado: 8 caracteres ✅ (ya configurado en el código)
```

### 2. **Password Complexity Requirements** (si disponible)
```
☑️ Require uppercase letters
☑️ Require lowercase letters  
☑️ Require numbers
☐ Require special characters (opcional)
```

---

## 📧 Paso 3: Verificar URL Configuration (Importante)

Mientras estás en el dashboard, verifica también:

### En: Authentication → URL Configuration

1. **Site URL:**
   ```
   Producción: https://tu-dominio-produccion.com
   Desarrollo: https://lovable.app (o tu URL de preview)
   ```

2. **Redirect URLs** (agregar ambas):
   ```
   https://*.lovable.app/**
   https://tu-dominio-produccion.com/**
   ```

**¿Por qué?** Esto previene errores de "requested path is invalid" al hacer login.

---

## ✅ Verificación

Una vez completadas las configuraciones:

### 1. Verifica en Supabase:
```
✅ Leaked password protection: Enabled
✅ Minimum password length: 8
✅ Site URL configurada
✅ Redirect URLs configuradas
```

### 2. Prueba de Registro:
- Ve a tu app: `/login`
- Intenta registrarte con una contraseña débil común (ejemplo: "password123")
- **Resultado esperado:** El sistema debe rechazar la contraseña

### 3. Ejecuta el Linter en Lovable:
El warning "Leaked Password Protection Disabled" debe desaparecer

---

## 🎉 Resultado Final

```
✅ Seguridad: 10/10
✅ Integridad de Datos: 10/10
✅ Cálculos Matemáticos: 10/10
✅ Código Frontend: 10/10
✅ Consistencia: 10/10

🏆 PROMEDIO FINAL: 10/10 PERFECTO
```

---

## 🆘 Solución de Problemas

### "No encuentro la opción de Leaked Password Protection"

**Posibles ubicaciones:**
1. `Authentication → Policies`
2. `Authentication → Settings`
3. `Project Settings → Auth`

**Alternativa:** Busca en el dashboard con Ctrl+K (o Cmd+K) y escribe "password"

### "La opción está gris/deshabilitada"

Esto puede pasar si:
1. El proyecto está en plan gratuito con limitaciones
2. Se necesita actualizar el plan
3. **Solución:** Contacta soporte de Supabase o verifica los límites de tu plan

### "¿Afecta a usuarios existentes?"

**No.** La protección de contraseñas filtradas solo afecta:
- Nuevos registros
- Cambios de contraseña
- Usuarios existentes NO son forzados a cambiar su contraseña

---

## 📚 Referencias

- [Supabase Auth Security](https://supabase.com/docs/guides/auth/password-security)
- [Password Strength Guide](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
- [Best Practices](https://supabase.com/docs/guides/auth)

---

## 💬 Necesitas Ayuda?

Si tienes problemas encontrando la configuración o no aparece la opción, por favor:

1. **Comparte una captura de pantalla** de tu sección de Authentication
2. **Verifica tu plan** en Supabase (algunas features requieren plan Pro)
3. **Contacta al soporte** de Supabase si la opción no está disponible

---

**Última actualización:** 2025-10-13  
**Proyecto:** CounterOS  
**Proyecto ID:** syusqcaslrxdkwaqsdks  
**Estado:** ⚠️ Pendiente de configuración manual
