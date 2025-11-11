# 🔐 Cambio de Contraseña de Usuarios

**Fecha de Implementación**: 7 de Noviembre de 2024  
**Módulo**: Gestión de Usuarios  
**Versión**: 1.1.0

---

## 🎯 Funcionalidad Implementada

Se ha habilitado la función de **cambiar contraseña** para usuarios del sistema CONAP, con permisos específicos según el rol.

---

## 🔒 Reglas de Permisos

### REGLA 1: Administradores
✅ **Pueden cambiar contraseñas de:**
- Coordinadores
- Guardarecursos

❌ **NO pueden cambiar contraseñas de:**
- Otros Administradores (solo ellos mismos usando el menú de perfil)

### REGLA 2: Coordinadores
✅ **Pueden cambiar contraseñas de:**
- Guardarecursos únicamente

❌ **NO pueden cambiar contraseñas de:**
- Administradores
- Otros Coordinadores

### REGLA 3: Guardarecursos
❌ **NO pueden cambiar contraseñas de otros usuarios**
✅ Solo pueden cambiar su propia contraseña desde el menú de perfil

---

## 📍 Dónde Cambiar Contraseñas

### Para Administradores y Coordinadores:

#### Opción 1: Desde Gestión de Usuarios (otros usuarios)
1. Ir a **"Gestión de Usuarios"** en el menú lateral
2. Buscar el usuario deseado
3. Click en el botón **🔑 Contraseña** (icono de llave)
4. Ingresar la nueva contraseña (mínimo 6 caracteres)
5. Confirmar la nueva contraseña
6. Click en **"Cambiar Contraseña"**

#### Opción 2: Desde su Perfil (propia contraseña)
1. Click en el menú de usuario (esquina superior derecha)
2. Seleccionar **"Cambiar Contraseña"**
3. Ingresar contraseña actual
4. Ingresar nueva contraseña
5. Confirmar nueva contraseña
6. Click en **"Cambiar Contraseña"**

### Para Guardarecursos:

Solo pueden cambiar su propia contraseña:
1. Click en el menú de usuario (esquina superior derecha)
2. Seleccionar **"Cambiar Contraseña"**
3. Ingresar contraseña actual
4. Ingresar nueva contraseña
5. Confirmar nueva contraseña
6. Click en **"Cambiar Contraseña"**

---

## 🎨 Interfaz de Usuario

### Vista de Gestión de Usuarios

#### Desktop (Tabla):
```
┌─────────────────────────────────────────────────────────────┐
│ Nombre          │ Rol         │ Estado  │ Acciones         │
├─────────────────────────────────────────────────────────────┤
│ Juan Pérez      │ Guardar..   │ Activo  │ 🔑 ✏️ ✓         │
│ juan@conap.gt   │             │         │                  │
└─────────────────────────────────────────────────────────────┘
```
Botones disponibles:
- 🔑 **Cambiar Contraseña** - Visible según permisos
- ✏️ **Editar** - Editar información del usuario
- ✓/⊗ **Estado** - Cambiar estado (Activo/Suspendido/Desactivado)

#### Móvil (Cards):
```
┌──────────────────────────────────────┐
│ 👤 Juan Pérez                        │
│    juan@conap.gt                     │
│    [Guardarecurso] [Activo]          │
│                                      │
│ [✏️ Editar]    [🔑 Contraseña]       │
│ [✓ Estado]                           │
└──────────────────────────────────────┘
```

---

## 🔧 Implementación Técnica

### Archivos Modificados:

#### Backend
**`/supabase/functions/server/index.tsx`** (línea 591)
- Actualizado endpoint `/make-server-276018ed/usuarios/:userId/cambiar-password`
- Agregado soporte para Coordinadores (antes solo Administradores)
- Validación completa de permisos según reglas
- Logging detallado para auditoría

**Cambios principales**:
```typescript
// ANTES: Solo Administradores
if (currentUserRole !== 'Administrador') {
  return error 403
}

// AHORA: Administradores Y Coordinadores
if (currentUserRole !== 'Administrador' && currentUserRole !== 'Coordinador') {
  return error 403
}

// Nueva validación: Coordinadores solo pueden cambiar contraseñas de Guardarecursos
if (currentUserRole === 'Coordinador' && targetUserRole !== 'Guardarecurso') {
  return error 403
}
```

#### Frontend - Servicio
**`/utils/gestionUsuariosService.ts`**
- Actualizada función `canChangeUserPassword()`
- Agregadas reglas para Coordinadores

**Cambios principales**:
```typescript
// ANTES: Solo permitía Admin → Coordinador
if (currentUser.rol === 'Administrador' && targetUser.rol === 'Coordinador') {
  return true;
}

// AHORA: Permisos completos
if (currentUser.rol === 'Administrador') {
  return targetUser.rol === 'Coordinador' || targetUser.rol === 'Guardarecurso';
}

if (currentUser.rol === 'Coordinador' && targetUser.rol === 'Guardarecurso') {
  return true;
}
```

#### Frontend - Componente
**`/components/GestionUsuarios.tsx`**
- Agregada función `handleChangePassword()`
- Botón de cambiar contraseña ya estaba implementado
- Diálogo `CambiarContrasenaAdmin` ya estaba implementado

**Función agregada**:
```typescript
const handleChangePassword = (usuario: Usuario) => {
  setUserToChangePassword(usuario);
  setIsPasswordDialogOpen(true);
};
```

#### Componente de Cambio de Contraseña
**`/components/CambiarContrasenaAdmin.tsx`**
- Ya existente, no requirió cambios
- Validación de permisos en el frontend
- Interfaz limpia y minimalista

---

## 📊 Flujo de Cambio de Contraseña

### Paso 1: Usuario hace click en botón 🔑
```
Frontend: Verifica permisos con canChangeUserPassword()
          ↓
Si tiene permisos → Abre diálogo
Si NO tiene permisos → Botón oculto
```

### Paso 2: Usuario ingresa nueva contraseña
```
Validaciones Frontend:
  ✓ Mínimo 6 caracteres
  ✓ Las contraseñas coinciden
  ✓ Campo no vacío
```

### Paso 3: Submit al servidor
```
POST /make-server-276018ed/usuarios/:userId/cambiar-password
Headers: Authorization: Bearer <token>
Body: { newPassword: "nueva123" }
```

### Paso 4: Validación en el servidor
```
Servidor valida:
  ✓ Token válido
  ✓ Usuario existe
  ✓ Rol del usuario actual (Admin/Coordinador)
  ✓ Rol del usuario objetivo
  ✓ Permisos según reglas
  ✓ Contraseña >= 6 caracteres
```

### Paso 5: Actualización en Supabase Auth
```
Servidor → Supabase Auth Admin API
  ↓
auth.admin.updateUserById(userId, { password: newPassword })
  ↓
✅ Contraseña actualizada
```

### Paso 6: Respuesta al frontend
```
Success: Toast de confirmación
Error: Toast con mensaje de error
```

---

## 🔍 Logging y Auditoría

El servidor registra todas las operaciones de cambio de contraseña:

```
🔐 Solicitud de cambio de contraseña para usuario ID: 5
👤 Usuario actual: María García (Rol: Coordinador)
🎯 Usuario objetivo: Juan Pérez (Rol: Guardarecurso)
✅ Permisos validados: Coordinador puede cambiar contraseña de Guardarecurso
🔄 Actualizando contraseña en Supabase Auth...
✅ Contraseña actualizada exitosamente para Juan Pérez
   Cambiada por: María García (Coordinador)
```

---

## 🧪 Casos de Prueba

### Test 1: Administrador cambia contraseña de Coordinador
```
Usuario actual: Admin
Usuario objetivo: Coordinador
Resultado esperado: ✅ Éxito
```

### Test 2: Administrador cambia contraseña de Guardarecurso
```
Usuario actual: Admin
Usuario objetivo: Guardarecurso
Resultado esperado: ✅ Éxito
```

### Test 3: Coordinador cambia contraseña de Guardarecurso
```
Usuario actual: Coordinador
Usuario objetivo: Guardarecurso
Resultado esperado: ✅ Éxito
```

### Test 4: Coordinador intenta cambiar contraseña de otro Coordinador
```
Usuario actual: Coordinador
Usuario objetivo: Coordinador
Resultado esperado: ❌ Botón oculto (sin permisos)
```

### Test 5: Coordinador intenta cambiar contraseña de Administrador
```
Usuario actual: Coordinador
Usuario objetivo: Administrador
Resultado esperado: ❌ Botón oculto (sin permisos)
```

### Test 6: Admin intenta cambiar contraseña de otro Admin
```
Usuario actual: Administrador
Usuario objetivo: Administrador
Resultado esperado: ❌ Botón oculto (sin permisos)
```

### Test 7: Guardarecurso intenta cambiar contraseña de otro usuario
```
Usuario actual: Guardarecurso
Usuario objetivo: Cualquiera
Resultado esperado: ❌ No tiene acceso a Gestión de Usuarios
```

---

## 🛡️ Seguridad

### Validaciones Implementadas:

#### Frontend:
- ✅ Verificación de permisos antes de mostrar botón
- ✅ Validación de longitud de contraseña (mínimo 6 caracteres)
- ✅ Confirmación de contraseña
- ✅ Campo no vacío

#### Backend:
- ✅ Validación de token de sesión
- ✅ Verificación de usuario autenticado
- ✅ Validación de rol del usuario actual
- ✅ Validación de rol del usuario objetivo
- ✅ Reglas de permisos estrictas
- ✅ Validación de longitud de contraseña
- ✅ Logging completo para auditoría

### Protecciones:
- 🔒 NUNCA se puede cambiar la contraseña de un Administrador (excepto él mismo)
- 🔒 Tokens expirados son rechazados
- 🔒 Usuarios no autenticados no pueden acceder
- 🔒 Validación doble (frontend + backend)

---

## ⚠️ Errores Comunes y Soluciones

### Error: "No tienes permisos para cambiar contraseñas"
**Causa**: El rol actual no tiene permisos suficientes  
**Solución**: Verificar que el usuario es Admin o Coordinador

### Error: "Los Coordinadores solo pueden cambiar contraseñas de Guardarecursos"
**Causa**: Coordinador intentó cambiar contraseña de Coordinador o Admin  
**Solución**: Solo puede cambiar contraseñas de Guardarecursos

### Error: "No se puede cambiar la contraseña de un Administrador"
**Causa**: Intento de cambiar contraseña de un Admin  
**Solución**: Los Administradores solo pueden cambiar su propia contraseña desde su perfil

### Error: "La contraseña debe tener al menos 6 caracteres"
**Causa**: Contraseña muy corta  
**Solución**: Usar mínimo 6 caracteres

### Error: "Usuario no encontrado en Supabase Auth"
**Causa**: El usuario no existe en la tabla de autenticación  
**Solución**: Verificar que el usuario fue creado correctamente

---

## 📚 Archivos Relacionados

### Backend
- `/supabase/functions/server/index.tsx` - Endpoint de cambio de contraseña

### Frontend - Componentes
- `/components/GestionUsuarios.tsx` - Módulo de gestión
- `/components/CambiarContrasenaAdmin.tsx` - Diálogo de cambio de contraseña

### Frontend - Servicios
- `/utils/gestionUsuariosService.ts` - Lógica de permisos
- `/utils/authService.ts` - Servicio de autenticación

### Estilos
- `/styles/shared-styles.ts` - Estilos compartidos (passwordFormStyles)

---

## 📋 Checklist de Verificación

Para verificar que la funcionalidad está funcionando correctamente:

### Como Administrador:
- [ ] Puedo ver el botón 🔑 en usuarios Coordinadores
- [ ] Puedo ver el botón 🔑 en usuarios Guardarecursos
- [ ] NO veo el botón 🔑 en otros Administradores
- [ ] Puedo cambiar contraseñas exitosamente
- [ ] Recibo confirmación al cambiar contraseña

### Como Coordinador:
- [ ] Puedo ver el botón 🔑 en usuarios Guardarecursos
- [ ] NO veo el botón 🔑 en Coordinadores
- [ ] NO veo el botón 🔑 en Administradores
- [ ] Puedo cambiar contraseñas de Guardarecursos exitosamente
- [ ] Recibo confirmación al cambiar contraseña

### Como Guardarecurso:
- [ ] NO tengo acceso al módulo de Gestión de Usuarios
- [ ] Puedo cambiar mi propia contraseña desde mi perfil

### Validaciones:
- [ ] Contraseñas menores a 6 caracteres son rechazadas
- [ ] Se requiere confirmación de contraseña
- [ ] Los logs del servidor muestran las operaciones
- [ ] Las contraseñas funcionan inmediatamente después de cambiarlas

---

## 🚀 Próximos Pasos (Opcional)

Mejoras futuras que se podrían implementar:

1. **Historial de cambios**: Registrar quién cambió la contraseña de quién
2. **Notificación por email**: Enviar email al usuario cuando se cambia su contraseña
3. **Política de contraseñas**: Requerir mayúsculas, números, símbolos
4. **Expiración de contraseñas**: Forzar cambio cada X días
5. **Contraseñas temporales**: Generar contraseña temporal automáticamente

---

**Documentado por**: Sistema CONAP - Gestión de Guardarecursos  
**Fecha**: 7 de Noviembre de 2024  
**Versión**: 1.1.0
