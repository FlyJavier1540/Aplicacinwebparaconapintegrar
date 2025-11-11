# 🔒 Restricciones de Administradores - CONAP

**Fecha de implementación:** 10 de noviembre de 2024

## 📋 Resumen

Se implementaron restricciones de seguridad para que los administradores NO puedan realizar acciones sobre otros administradores del sistema.

---

## 🚫 Restricciones Implementadas

### 1. **NO Editar Otros Administradores**
- Un administrador **NO** puede editar la información de otro administrador
- Solo puede editar su propia información
- Puede editar la información completa de Coordinadores

### 2. **NO Cambiar Estados de Otros Administradores**
- Un administrador **NO** puede cambiar el estado (Activo/Suspendido/Desactivado) de otro administrador
- Puede cambiar el estado de Coordinadores
- No puede cambiar su propio estado

### 3. **NO Cambiar Contraseñas de Otros Administradores**
- Un administrador **NO** puede cambiar la contraseña de otro administrador
- Puede cambiar contraseñas de Coordinadores y Guardarecursos
- Esta restricción ya existía previamente

### 4. **Campos Limitados en Auto-Edición**
Cuando un administrador se edita a **sí mismo**:
- ✅ **PUEDE** modificar: Teléfono
- ❌ **NO PUEDE** modificar: Nombre, Apellido, DPI, Email

---

## 🎨 Cambios en la Interfaz

### **Vista de Tabla (Desktop)**
- Los botones de acciones (Editar, Cambiar Estado) NO se muestran para otros administradores
- Solo se muestra el botón de edición para el propio administrador
- Indicadores visuales claros de estado

### **Vista de Cards (Mobile)**
- Los botones de acciones están ocultos para otros administradores
- Solo el propio administrador ve su botón de edición
- Estados mostrados sin opción de cambio

### **Formulario de Edición**
Cuando un administrador se edita a sí mismo:
- ⚠️ **Alert azul informativo** en la parte superior
- 🔒 Campos bloqueados (nombre, apellido, DPI, email) con mensaje "No puedes modificar..."
- ✓ Campo de teléfono habilitado con mensaje "Este es el único campo que puedes modificar"
- 📝 Descripción del dialog actualizada

---

## 🔧 Archivos Modificados

### 1. **`/utils/gestionUsuariosService.ts`**

#### Función `canEditUser()` actualizada:
```typescript
/**
 * Verifica si el usuario actual puede editar a otro usuario
 * 
 * REGLAS:
 * - Un Administrador SOLO puede editarse a sí mismo (solo su teléfono)
 * - Un Administrador NO puede editar a otros Administradores
 * - Un Administrador puede editar a Coordinadores (todos los campos)
 */
export function canEditUser(
  currentUser: any,
  targetUser: Usuario
): boolean {
  if (!currentUser) return false;
  
  if (currentUser.rol === 'Administrador') {
    // Puede editar a sí mismo (solo teléfono)
    if (currentUser.id === targetUser.id) return true;
    
    // NO puede editar a otros Administradores
    if (targetUser.rol === 'Administrador') return false;
    
    // Puede editar a Coordinadores
    if (targetUser.rol === 'Coordinador') return true;
  }
  
  return false;
}
```

#### Nueva función `isEditingSelf()`:
```typescript
/**
 * Verifica si un administrador se está editando a sí mismo
 * Solo en este caso puede cambiar su teléfono
 */
export function isEditingSelf(
  currentUser: any,
  targetUser: Usuario
): boolean {
  if (!currentUser || !targetUser) return false;
  return currentUser.id === targetUser.id && currentUser.rol === 'Administrador';
}
```

#### Función `canChangeUserEstado()` actualizada:
```typescript
/**
 * Verifica si el usuario actual puede cambiar el estado de otro usuario
 * 
 * REGLAS:
 * - NO se puede cambiar el estado del usuario actual (sí mismo)
 * - Un Administrador NO puede cambiar el estado de otros Administradores
 * - Un Administrador puede cambiar el estado de Coordinadores
 */
export function canChangeUserEstado(
  currentUser: any,
  targetUser: Usuario
): boolean {
  if (!currentUser) return false;
  
  // No se puede cambiar el estado del usuario actual (sí mismo)
  if (currentUser.id === targetUser.id) return false;
  
  if (currentUser.rol === 'Administrador') {
    // NO puede cambiar el estado de otros Administradores
    if (targetUser.rol === 'Administrador') return false;
    
    // Puede cambiar el estado de Coordinadores
    if (targetUser.rol === 'Coordinador') return true;
  }
  
  return false;
}
```

### 2. **`/components/GestionUsuarios.tsx`**

#### Campos del formulario bloqueados:
```typescript
// Nombre - bloqueado para auto-edición
<Input
  id="nombre"
  value={userForm.nombre}
  onChange={(e) => setUserForm({...userForm, nombre: e.target.value})}
  placeholder="Ingrese el nombre"
  className={formStyles.input}
  required
  readOnly={editingUser && gestionUsuariosService.isEditingSelf(currentUser, editingUser)}
  disabled={editingUser && gestionUsuariosService.isEditingSelf(currentUser, editingUser)}
/>

// Apellido - bloqueado para auto-edición
<Input
  id="apellido"
  value={userForm.apellido}
  onChange={(e) => setUserForm({...userForm, apellido: e.target.value})}
  placeholder="Ingrese el apellido"
  className={formStyles.input}
  required
  readOnly={editingUser && gestionUsuariosService.isEditingSelf(currentUser, editingUser)}
  disabled={editingUser && gestionUsuariosService.isEditingSelf(currentUser, editingUser)}
/>

// DPI - siempre bloqueado en edición (ya existía)
// Email - siempre bloqueado en edición (ya existía)

// Teléfono - único campo editable para auto-edición
<Input
  id="telefono"
  value={userForm.telefono}
  onChange={(e) => setUserForm({...userForm, telefono: e.target.value})}
  placeholder="+502 0000-0000"
  className={formStyles.input}
  required
/>
```

#### Alert informativo agregado:
```typescript
{editingUser && gestionUsuariosService.isEditingSelf(currentUser, editingUser) && (
  <Alert className="mb-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
    <AlertDescription className="text-xs text-blue-800 dark:text-blue-300">
      Por seguridad, los administradores solo pueden modificar su número de teléfono. 
      Los demás campos están bloqueados.
    </AlertDescription>
  </Alert>
)}
```

---

## ✅ Validaciones de Seguridad

### **Backend (Servidor)**
El backend ya tiene validaciones de permisos basadas en roles JWT, por lo que aunque se intentara manipular el frontend, el servidor rechazaría:
- Intentos de editar otros administradores
- Intentos de cambiar estados de otros administradores
- Intentos de modificar campos no autorizados

### **Frontend (Interfaz)**
- Botones de acción ocultos mediante `canEditUser()` y `canChangeUserEstado()`
- Campos bloqueados mediante `readOnly` y `disabled`
- Validaciones antes de enviar al servidor
- Mensajes informativos claros

---

## 🎯 Casos de Uso

### **Caso 1: Administrador ve a otro Administrador**
- ❌ NO ve botón de editar
- ❌ NO ve botón de cambiar estado
- ❌ NO ve botón de cambiar contraseña
- ✅ Solo visualiza la información

### **Caso 2: Administrador se ve a sí mismo**
- ✅ Ve botón de editar
- ❌ NO ve botón de cambiar estado (no puede cambiarse su propio estado)
- ❌ NO ve botón de cambiar contraseña (debe usar "Cambiar Contraseña" desde su perfil)
- ✅ Al editar, solo puede cambiar teléfono

### **Caso 3: Administrador ve a un Coordinador**
- ✅ Ve botón de editar (puede modificar todos los campos)
- ✅ Ve botón de cambiar estado
- ✅ Ve botón de cambiar contraseña
- ✅ Control total sobre el Coordinador

---

## 📊 Matriz de Permisos

| Acción | Admin → Admin (otro) | Admin → Sí mismo | Admin → Coordinador |
|--------|---------------------|------------------|---------------------|
| **Ver información** | ✅ | ✅ | ✅ |
| **Editar nombre/apellido** | ❌ | ❌ | ✅ |
| **Editar teléfono** | ❌ | ✅ | ✅ |
| **Editar DPI** | ❌ | ❌ | ❌ |
| **Editar email** | ❌ | ❌ | ❌ |
| **Cambiar estado** | ❌ | ❌ | ✅ |
| **Cambiar contraseña** | ❌ | ❌ | ✅ |

---

## 🔐 Seguridad Implementada

1. **Validación en el servicio**: Las funciones `canEditUser()` y `canChangeUserEstado()` validan permisos
2. **Ocultamiento de UI**: Los botones no se renderizan si no hay permisos
3. **Campos bloqueados**: Los inputs tienen `readOnly` y `disabled` cuando corresponde
4. **Validación backend**: El servidor valida permisos antes de ejecutar acciones
5. **Mensajes informativos**: El usuario entiende por qué no puede realizar ciertas acciones

---

## 📝 Notas Importantes

- ⚠️ **DPI y Email** ya estaban bloqueados en edición (implementación anterior de validación de duplicados)
- ✅ Esta implementación refuerza la seguridad entre administradores
- 🔒 Un administrador nunca puede modificar información crítica de otro administrador
- 📞 El único campo que un administrador puede modificar de sí mismo es el teléfono
- 🎭 Los Coordinadores mantienen permisos normales (pueden ser editados completamente por admins)

---

## 🚀 Próximos Pasos Sugeridos

1. ✅ **Completado**: Restricciones de administradores
2. 🔄 **Pendiente**: Auditoría de cambios en usuarios (quién modificó qué y cuándo)
3. 🔄 **Pendiente**: Log de intentos de acceso no autorizados
4. 🔄 **Pendiente**: Notificaciones cuando un administrador intenta acciones restringidas

---

**Desarrollado para CONAP - Sistema de Gestión de Guardarecursos**
