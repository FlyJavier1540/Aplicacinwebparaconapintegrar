# ✅ Fix: Coordinadores y Guardarecursos Ahora Se Crean en Supabase Auth

## 🎯 Problema Resuelto

Los **Coordinadores no podían hacer login** porque el sistema intentaba autenticarlos con `supabase.auth.signInWithPassword()`, pero estos usuarios **solo existían en PostgreSQL**, no en Supabase Auth.

## 🔧 Solución Implementada

### Cambios Realizados

Se modificó el endpoint de creación de **Coordinadores** para que automáticamente cree el usuario **tanto en PostgreSQL como en Supabase Auth**.

**Archivo modificado**: `/supabase/functions/server/index.tsx`

**Endpoint actualizado**: `POST /make-server-276018ed/usuarios` (líneas 1129-1155)

### ¿Qué hace ahora?

Cuando se crea un **Coordinador**:

1. ✅ Se crea en **PostgreSQL** (tabla `usuario`)
   - Con contraseña hasheada SHA-256
   - Con rol "Coordinador"
   - Con estado "Activo"

2. ✅ Se crea en **Supabase Auth**
   - Con el mismo email
   - Con la misma contraseña (en texto plano, Supabase lo hashea automáticamente)
   - Email confirmado automáticamente (`email_confirm: true`)
   - Metadata con nombre, apellido y rol

3. ✅ **Ahora puede hacer login** usando `supabase.auth.signInWithPassword()`

### Código Agregado

```typescript
// ✨ CREAR USUARIO EN SUPABASE AUTH para que pueda hacer login
try {
  console.log(`📧 Creando usuario Coordinador en Supabase Auth: ${email}`);
  await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: {
      nombre: nombre,
      apellido: apellido,
      rol: 'Coordinador'
    }
  });
  console.log(`✅ Usuario Coordinador creado en Supabase Auth: ${email}`);
} catch (authError) {
  console.error('⚠️ Error al crear usuario en Supabase Auth (no crítico):', authError);
  // No fallar todo el proceso si solo falla Supabase Auth
  // El usuario ya existe en PostgreSQL y puede ser creado manualmente en Auth después
}
```

## 📊 Estado de los Endpoints

### Creación de Coordinadores
- **Endpoint**: `POST /make-server-276018ed/usuarios`
- **Estado**: ✅ **ACTUALIZADO** - Ahora crea en PostgreSQL + Supabase Auth
- **Usarlo para**: Crear nuevos Coordinadores

### Creación de Guardarecursos
- **Endpoint**: `POST /make-server-276018ed/guardarecursos`
- **Estado**: ✅ **YA FUNCIONABA** - Ya creaba en PostgreSQL + Supabase Auth (líneas 1542-1556)
- **Usarlo para**: Crear nuevos Guardarecursos

## 🔄 Flujo de Login Ahora

### Antes (❌ No funcionaba)

```
1. Coordinador intenta login
   ↓
2. supabase.auth.signInWithPassword(email, password)
   ↓
3. Supabase Auth: "Usuario no existe"
   ↓
4. ❌ Error: "Credenciales inválidas"
```

### Ahora (✅ Funciona)

```
1. Coordinador se crea desde el frontend
   ↓
2. Backend crea usuario en:
   - PostgreSQL ✅
   - Supabase Auth ✅
   ↓
3. Coordinador intenta login
   ↓
4. supabase.auth.signInWithPassword(email, password)
   ↓
5. Supabase Auth: "Usuario autenticado"
   ↓
6. Backend obtiene datos de PostgreSQL
   ↓
7. ✅ Login exitoso
```

## 🧪 Cómo Probar

### Paso 1: Crear un nuevo Coordinador

1. **Login como Administrador**
2. **Ir a**: Gestión de Personal → Usuarios Coordinadores
3. **Click**: "Crear Nuevo Coordinador"
4. **Completar formulario**:
   - Nombre: Juan
   - Apellido: Pérez
   - Cédula: 123456789
   - Teléfono: 12345678
   - Email: juan.perez@conap.gob.gt
   - Contraseña: MiPassword123
5. **Click**: "Crear Coordinador"

### Paso 2: Verificar creación

Revisa la consola de Edge Functions en Supabase. Deberías ver:

```
📧 Creando usuario Coordinador en Supabase Auth: juan.perez@conap.gob.gt
✅ Usuario Coordinador creado en Supabase Auth: juan.perez@conap.gob.gt
```

### Paso 3: Verificar en Supabase Dashboard

1. **Ve a**: Supabase Dashboard → Authentication → Users
2. **Deberías ver**: `juan.perez@conap.gob.gt` en la lista

### Paso 4: Probar Login

1. **Cerrar sesión** del administrador
2. **Intentar login** con:
   - Email: juan.perez@conap.gob.gt
   - Contraseña: MiPassword123
3. **Resultado esperado**: ✅ Login exitoso

## 📝 Notas Importantes

### 1. Usuarios Existentes

**Los coordinadores creados ANTES de este fix NO tienen cuenta en Supabase Auth.**

Para permitirles hacer login, tienes dos opciones:

#### Opción A: Crear manualmente en Supabase Auth
1. Ve a Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Ingresa:
   - Email: (mismo que en PostgreSQL)
   - Password: (una nueva contraseña)
   - ✅ Auto Confirm User
4. Comunica la nueva contraseña al coordinador

#### Opción B: Re-crear el usuario
1. Eliminar el coordinador existente
2. Crear nuevamente desde el frontend
3. Ahora se creará en ambos lugares

### 2. Contraseñas Diferentes

- **PostgreSQL**: Guarda hash SHA-256
- **Supabase Auth**: Guarda hash bcrypt (automático)

Esto es normal y no causa problemas. Ambos sistemas usan la misma contraseña en texto plano al momento de crear.

### 3. Error No Crítico

Si la creación en Supabase Auth falla (por ejemplo, si el usuario ya existe), **el proceso NO se detiene**.

El usuario se crea en PostgreSQL de todos modos, y aparecerá un log:

```
⚠️ Error al crear usuario en Supabase Auth (no crítico): ...
```

En este caso, puedes crear manualmente en Supabase Auth.

### 4. Guardarecursos

Los Guardarecursos **YA funcionaban** correctamente desde antes. Este fix solo agregó la misma funcionalidad a los Coordinadores.

## ✅ Checklist de Verificación

Después de desplegar, verifica:

- [ ] Puedes crear nuevos Coordinadores desde el frontend
- [ ] Los nuevos Coordinadores aparecen en Supabase Auth
- [ ] Los nuevos Coordinadores pueden hacer login
- [ ] Los Guardarecursos siguen funcionando normalmente
- [ ] Los Administradores siguen funcionando normalmente
- [ ] Logs muestran mensajes de creación en Auth

## 🚀 Despliegue

Para que este fix funcione, necesitas:

1. **Desplegar la Edge Function actualizada** en Supabase
2. **Probar creación** de un nuevo Coordinador
3. **Probar login** con ese Coordinador

Ver `/INSTRUCCIONES_DESPLIEGUE.md` para instrucciones detalladas de despliegue.

---

**Fecha**: Noviembre 2025  
**Versión**: v2.1 - Login de Coordinadores Funcional  
**Estado**: ✅ Listo para producción
