# 🔒 REDIRECCIÓN AUTOMÁTICA AL LOGIN EN CASO DE ERROR

## ✅ IMPLEMENTACIÓN COMPLETADA

### 📋 OBJETIVO
Asegurar que CUALQUIER error al cargar o manipular datos en los módulos del sistema resulte en una limpieza inmediata de datos y redirección automática al login.

---

## 🎯 MÓDULO ACTUALIZADO: REGISTRO DE GUARDARECURSOS

### 📍 Ubicación
`/components/RegistroGuardarecursos.tsx`

### 🔐 OPERACIONES PROTEGIDAS

#### 1. **Carga Inicial de Guardarecursos** ✅
```typescript
const loadGuardarecursos = useCallback(async () => {
  setIsLoading(true);
  try {
    const data = await guardarecursosService.fetchGuardarecursos();
    setGuardarecursosList(data);
  } catch (error) {
    console.error('❌ ERROR AL CARGAR GUARDARECURSOS - REDIRIGIENDO AL LOGIN:', error);
    
    // Limpiar TODO inmediatamente
    localStorage.clear();
    sessionStorage.clear();
    
    // IR AL LOGIN INMEDIATAMENTE
    window.location.href = '/';
  } finally {
    setIsLoading(false);
  }
}, []);
```

**Escenarios cubiertos:**
- ❌ Token JWT expirado → LOGIN
- ❌ Token JWT inválido → LOGIN
- ❌ Error 401 del backend → LOGIN
- ❌ Error de red → LOGIN
- ❌ Error de base de datos → LOGIN
- ❌ Cualquier otro error → LOGIN

---

#### 2. **Carga de Áreas Protegidas** ✅
```typescript
const loadAreasProtegidas = useCallback(async () => {
  try {
    const data = await areasProtegidasService.fetchAreasProtegidas();
    setAreasProtegidas(data);
  } catch (error) {
    console.error('❌ ERROR AL CARGAR ÁREAS PROTEGIDAS - REDIRIGIENDO AL LOGIN:', error);
    
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  }
}, []);
```

---

#### 3. **Carga de Usuarios** ✅
```typescript
const loadUsuarios = useCallback(async () => {
  try {
    const data = await gestionUsuariosService.fetchUsuarios();
    setUsuariosList(data);
  } catch (error) {
    console.error('❌ ERROR AL CARGAR USUARIOS - REDIRIGIENDO AL LOGIN:', error);
    
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  }
}, []);
```

---

#### 4. **Crear/Actualizar Guardarecurso** ✅
```typescript
const handleSubmit = useCallback(async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    if (editingGuardarecurso) {
      await guardarecursosService.updateGuardarecursoAPI(...);
      toast.success('Guardarecurso actualizado', {...});
    } else {
      await guardarecursosService.createGuardarecursoAPI(formData);
      toast.success('Guardarecurso creado exitosamente', {...});
    }
    
    await loadGuardarecursos();
    resetForm();
    setIsDialogOpen(false);
  } catch (error: any) {
    console.error('❌ ERROR AL GUARDAR GUARDARECURSO - REDIRIGIENDO AL LOGIN:', error);
    
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  }
}, [...]);
```

**Escenarios cubiertos:**
- ❌ Error al crear → LOGIN
- ❌ Error al actualizar → LOGIN
- ❌ Token expirado durante la operación → LOGIN

---

#### 5. **Cambiar Estado de Guardarecurso** ✅
```typescript
const confirmarCambioEstado = useCallback(async () => {
  if (!estadoPendiente) return;

  const { id, nuevoEstado, nombre } = estadoPendiente;

  try {
    console.log('🔄 Cambiando estado del guardarecurso:', { id, nuevoEstado, nombre });
    
    await guardarecursosService.cambiarEstadoGuardarecursoAPI(id, nuevoEstado);

    toast.success('Estado actualizado', {...});

    await loadGuardarecursos();

    setIsEstadoAlertOpen(false);
    setEstadoPendiente(null);
  } catch (error: any) {
    console.error('❌ ERROR AL CAMBIAR ESTADO - REDIRIGIENDO AL LOGIN:', error);
    
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  }
}, [estadoPendiente, loadGuardarecursos]);
```

**Escenarios cubiertos:**
- ❌ Error al activar → LOGIN
- ❌ Error al suspender → LOGIN
- ❌ Error al desactivar → LOGIN

---

## 🚀 COMPORTAMIENTO FINAL

### ✅ Usuario con sesión válida
```
1. Usuario abre módulo de Guardarecursos
2. Se cargan guardarecursos, áreas y usuarios
3. Todo funciona normalmente ✓
```

### ❌ Usuario con token expirado
```
1. Usuario abre módulo de Guardarecursos
2. loadGuardarecursos() llama al servicio
3. Servicio usa getRequiredAuthToken()
4. No hay token válido
5. LIMPIA localStorage y sessionStorage
6. REDIRIGE a '/' (Login)
7. Usuario ve pantalla de Login limpia
```

### ❌ Token expira DURANTE el uso
```
1. Usuario está viendo lista de guardarecursos
2. Hace clic en "Editar"
3. handleSubmit() llama al servicio
4. Backend retorna 401
5. Interceptor de base-api-service detecta 401
6. LIMPIA TODO
7. REDIRIGE a Login
```

### ❌ Error de red
```
1. Usuario intenta crear guardarecurso
2. No hay conexión a internet
3. fetch() lanza error
4. catch captura el error
5. LIMPIA TODO
6. REDIRIGE a Login
```

### ❌ Error de base de datos
```
1. Usuario intenta cargar guardarecursos
2. Backend retorna error 500
3. Servicio lanza error
4. catch captura el error
5. LIMPIA TODO
6. REDIRIGE a Login
```

---

## 🛡️ CAPAS DE PROTECCIÓN

### Capa 1: Función `getRequiredAuthToken()`
Ubicación: `/utils/base-api-service.ts`
- Verifica token antes de cada petición
- Si no hay token → REDIRIGE

### Capa 2: Interceptor de Errores 401
Ubicación: `/utils/base-api-service.ts` → `fetchApi()`
- Detecta errores 401 del backend
- Si hay 401 → LIMPIA y REDIRIGE

### Capa 3: Try-Catch en Componentes
Ubicación: `/components/RegistroGuardarecursos.tsx`
- Captura CUALQUIER error en operaciones
- Si hay error → LIMPIA y REDIRIGE

---

## 📊 COBERTURA DE ERRORES

### ✅ Errores Cubiertos
- ❌ Token JWT expirado
- ❌ Token JWT inválido
- ❌ Token JWT ausente
- ❌ Error 401 (No autorizado)
- ❌ Error 403 (Sin permisos)
- ❌ Error 404 (No encontrado)
- ❌ Error 500 (Error del servidor)
- ❌ Error de red (sin conexión)
- ❌ Error de timeout
- ❌ Error de base de datos
- ❌ Cualquier otro error no previsto

### 🎯 Resultado
**100% de errores** resultan en redirección al login

---

## 🔧 PRÓXIMOS PASOS

### Aplicar el mismo patrón a TODOS los módulos:
1. ✅ **Registro de Guardarecursos** (COMPLETADO)
2. ⏳ Áreas Protegidas (AsignacionZonas)
3. ⏳ Control de Equipos
4. ⏳ Planificación de Actividades
5. ⏳ Registro Diario
6. ⏳ Geolocalización de Rutas
7. ⏳ Reporte de Hallazgos
8. ⏳ Registro de Incidentes
9. ⏳ Gestión de Usuarios
10. ⏳ Dashboard

### Patrón a seguir en cada módulo:
```typescript
// En TODAS las funciones de carga:
try {
  const data = await servicio.fetch();
  setData(data);
} catch (error) {
  console.error('❌ ERROR - REDIRIGIENDO AL LOGIN:', error);
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = '/';
}

// En TODAS las funciones de creación/edición:
try {
  await servicio.create/update();
  toast.success('Operación exitosa');
  await loadData();
} catch (error) {
  console.error('❌ ERROR - REDIRIGIENDO AL LOGIN:', error);
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = '/';
}
```

---

## 📝 VENTAJAS DE ESTE ENFOQUE

### ✅ Seguridad Máxima
- No hay forma de ver datos con sesión expirada
- Limpieza automática de credenciales
- Sin datos residuales en memoria

### ✅ Experiencia de Usuario
- Sin alertas molestas
- Redirección inmediata y limpia
- Usuario sabe que debe iniciar sesión

### ✅ Mantenibilidad
- Patrón consistente en todos los módulos
- Fácil de aplicar a nuevos módulos
- Código predecible y mantenible

---

## 🎯 CONCLUSIÓN

El módulo de **Registro de Guardarecursos** ahora está **100% protegido** contra errores. Cualquier problema al cargar o manipular datos resulta en una redirección automática al login, garantizando que:

1. ✅ **Nunca se muestran datos** con sesión expirada
2. ✅ **Siempre se limpia TODO** antes de redirigir
3. ✅ **No hay alertas molestas** que interrumpan
4. ✅ **Experiencia consistente** en todos los escenarios de error

**Última actualización:** Noviembre 2024
**Estado:** ✅ COMPLETADO PARA GUARDARECURSOS
**Siguiente:** Aplicar a todos los demás módulos
