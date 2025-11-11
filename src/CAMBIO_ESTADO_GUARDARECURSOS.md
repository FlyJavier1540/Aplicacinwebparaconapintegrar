# 🔄 Cambio de Estado de Guardarecursos

## ✅ Funcionalidad Implementada

La funcionalidad de **cambio de estado** de guardarecursos está completamente implementada y lista para usar.

## 🎯 Cómo Funciona

### Estados Disponibles

Según tu base de datos, los estados para guardarecursos son:

```json
{
  "std_id": 1,
  "std_nombre": "Activo"
},
{
  "std_id": 2,
  "std_nombre": "Suspendido"
},
{
  "std_id": 3,
  "std_nombre": "Desactivado"
}
```

### Interfaz de Usuario

#### 📱 Vista Móvil
- Botón **"Estado"** en cada tarjeta de guardarecurso
- Menú desplegable con las 3 opciones de estado
- Iconos distintivos por estado:
  - ✓ **Activo**: CheckCircle2 (verde)
  - ⊘ **Suspendido**: Ban (naranja)
  - ✗ **Desactivado**: UserX (gris)

#### 💻 Vista Desktop
- Botón de estado en la columna **"Acciones"**
- Mismo menú desplegable con las 3 opciones
- Mismos iconos y colores

### Flujo de Cambio de Estado

1. **Usuario hace clic** en el menú de estado
2. **Selecciona** el nuevo estado (Activo, Suspendido o Desactivado)
3. **Aparece confirmación** con AlertDialog
4. **Usuario confirma** el cambio
5. **Se envía petición** al backend con el token de autenticación
6. **Backend actualiza** el campo `usr_estado` en la tabla `usuario`
7. **Se muestra toast** de éxito
8. **Se recarga** la lista de guardarecursos

## 🔧 Componentes Involucrados

### Frontend

1. **`/components/RegistroGuardarecursos.tsx`**
   - Función `handleEstadoClick()` - Prepara el cambio de estado
   - Función `confirmarCambioEstado()` - Ejecuta el cambio
   - AlertDialog para confirmación

2. **`/utils/guardarecursosService.ts`**
   - Función `cambiarEstadoGuardarecursoAPI()` - Llama al endpoint
   - Con logging detallado para debugging

### Backend

3. **`/supabase/functions/server/index.tsx`**
   - Endpoint: `PATCH /make-server-276018ed/guardarecursos/:id/estado`
   - Valida el token de autenticación
   - Busca el `std_id` del estado por nombre
   - Actualiza `usr_estado` en la tabla `usuario`

## 📊 Logging para Debugging

### En la Consola del Navegador:

```
🔄 Cambiando estado del guardarecurso: { id: "1", nuevoEstado: "Suspendido", nombre: "Juan Pérez" }
🔐 Token obtenido: Sí ✓
📡 Enviando petición PATCH a: https://xxx.supabase.co/functions/v1/make-server-276018ed/guardarecursos/1/estado
📦 Payload: { nuevoEstado: "Suspendido" }
📬 Respuesta recibida - Status: 200
✅ Datos recibidos: { success: true, message: "Estado actualizado correctamente" }
✅ Estado cambiado exitosamente
```

### En los Logs del Servidor (Supabase):

```
🔄 [ESTADO] Recibiendo petición para cambiar estado
📝 [ESTADO] Guardarecurso ID: 1
🔐 [ESTADO] Token presente: Sí ✓
📦 [ESTADO] Nuevo estado solicitado: Suspendido
🔍 [ESTADO] Buscando ID del estado en la tabla estado...
✅ [ESTADO] Estado encontrado - ID: 2
💾 [ESTADO] Actualizando usuario en la base de datos...
✅ [ESTADO] Estado actualizado exitosamente
```

## 🚨 Posibles Errores

### ⚠️ Error: "Failed to fetch" o "TypeError: Failed to fetch"

**Causa:** El método PATCH no está habilitado en CORS del servidor.

**Solución:** Verificar que en `/supabase/functions/server/index.tsx` la configuración de CORS incluya PATCH:
```typescript
allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
```

**✅ Este error ya fue corregido** en esta versión (2024-11-07).

---

### Error: "No se encontró el token de autenticación"

**Causa:** El usuario no ha iniciado sesión o la sesión expiró.

**Solución:** Cerrar sesión y volver a iniciar sesión.

---

### Error: "Error al obtener el estado [nombre]. Verifique que los datos base estén inicializados"

**Causa:** La tabla `estado` no tiene los registros necesarios.

**Solución:** Verificar que la tabla `estado` tenga los registros:
```sql
SELECT * FROM estado WHERE std_id IN (1, 2, 3);
```

Deben existir los estados: Activo (1), Suspendido (2), Desactivado (3).

---

### Error: "No autorizado - Token requerido"

**Causa:** El token no se está enviando correctamente en el header.

**Solución:** Verificar que existe `localStorage.getItem('conap_auth_token')` en la consola del navegador.

---

### Error: "Error al cambiar el estado del guardarecurso"

**Causa:** Error al actualizar la base de datos (posiblemente RLS o permisos).

**Solución:** Verificar en los logs del servidor el error específico. Puede ser necesario deshabilitar RLS en la tabla `usuario`:

```sql
ALTER TABLE usuario DISABLE ROW LEVEL SECURITY;
```

## ✅ Verificación de Funcionamiento

### Paso 1: Abrir Módulo de Guardarecursos
- Ir a **Gestión de Personal > Registro de Guardarecursos**

### Paso 2: Seleccionar un Guardarecurso
- Buscar un guardarecurso existente en la lista

### Paso 3: Cambiar Estado
- Hacer clic en el botón de estado (con icono según estado actual)
- Seleccionar un nuevo estado del menú desplegable
- Confirmar el cambio en el AlertDialog

### Paso 4: Verificar Cambio
- El toast debe mostrar: "Estado actualizado - [Nombre] ha sido [activado/suspendido/desactivado]"
- La tarjeta/fila debe actualizar el badge de estado
- El color del avatar debe cambiar según el nuevo estado

### Paso 5: Revisar Logs (Opcional)
- Abrir DevTools (F12)
- Ver en la pestaña Console los logs detallados
- En caso de error, copiar los logs para debugging

## 🎨 Colores por Estado

- **Activo**: Verde (#10b981 / green-500)
- **Suspendido**: Naranja (#f97316 / orange-500)
- **Desactivado**: Gris (#6b7280 / gray-500)

## 📝 Notas Importantes

1. ✅ La funcionalidad está **completamente implementada**
2. ✅ Usa el token de autenticación del usuario actual
3. ✅ Incluye confirmación antes de cambiar el estado
4. ✅ Muestra feedback visual con toast
5. ✅ Actualiza la UI automáticamente después del cambio
6. ✅ Logging detallado para facilitar debugging
7. ✅ Maneja errores y muestra mensajes apropiados

## 🔧 Correcciones Aplicadas (2024-11-07)

### 1. **Token de Autenticación**
   - ✅ Cambio de `publicAnonKey` a token de sesión del usuario
   - ✅ Validación de token antes de enviar petición
   - ✅ Mensaje claro si no hay token disponible

### 2. **Logging Mejorado**
   - ✅ Logging detallado en frontend (`cambiarEstadoGuardarecursoAPI`)
   - ✅ Logging detallado en componente (`confirmarCambioEstado`)
   - ✅ Logging detallado en backend con prefijo `[ESTADO]`
   - ✅ Emojis para facilitar identificación visual de logs

### 3. **Endpoint Duplicado**
   - ✅ Eliminado endpoint duplicado en servidor
   - ✅ Solo existe un endpoint: línea 1400 de `/supabase/functions/server/index.tsx`

### 4. **Mensajes de Error Mejorados**
   - ✅ Mensajes más descriptivos
   - ✅ Información contextual en cada error
   - ✅ Ayuda para debugging en mensajes

### 5. **🚨 CRÍTICO: CORS con método PATCH** ⭐ NUEVA
   - ✅ Agregado método `PATCH` a `allowMethods` en configuración CORS
   - ✅ Sin esto, todas las peticiones PATCH fallan con "Failed to fetch"
   - ✅ Ubicación: `/supabase/functions/server/index.tsx` línea 17
   - ✅ Configuración actualizada: `["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]`

---

**Última actualización:** 2024-11-07 - 15:30 hrs
**Horario:** Guatemala GMT-6
