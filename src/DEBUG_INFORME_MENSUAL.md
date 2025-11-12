# 🔍 Debugging - Informe Mensual de Actividades

## Problema Actual

Los conteos de actividades **NO** aparecen en el informe mensual (todo muestra "-").

---

## ✅ Cambios Realizados

He agregado **logs de debugging** en el servicio de reportes para identificar el problema.

### Modificaciones en `/utils/reporteActividadesService.ts`

1. **✅ Filtro por año actual** - Agregado
2. **✅ Logs en `getActividadesGuardarecurso()`** - Para ver cuántas actividades se encuentran
3. **✅ Logs en `agruparActividadesPorTipoYMes()`** - Para ver cómo se agrupan

---

## 🧪 Pasos para Debugging

### Paso 1: Abrir la Consola del Navegador

1. **Abre tu navegador** (Chrome, Edge, Firefox)
2. **Presiona F12** o **Click derecho → Inspeccionar**
3. **Ve a la pestaña "Console"**

### Paso 2: Generar un Informe

1. **Login** como Coordinador o Administrador
2. **Ve a**: Gestión de Personal → Registro de Guardarecursos
3. **Click** en el botón "Generar Informe" de un guardarecurso
4. **Observa la consola**

---

## 📊 Logs Esperados

Cuando generes un informe, deberías ver en la consola:

```
📊 Actividades encontradas para guardarecurso [ID]: X
Total actividades en sistema: Y
Actividades filtradas: [Array de actividades]

🔍 Iniciando agrupación de actividades...
Actividades a agrupar: [Array de actividades]

  - Actividad: "Patrullaje" → Categoría 1, Mes 0 (Ene), Clave: 1-0
  - Actividad: "Mantenimiento" → Categoría 3, Mes 2 (Mar), Clave: 3-2
  ... etc

📊 Datos agrupados finales: { "1-0": 5, "3-2": 2, ... }
```

---

## 🔎 Posibles Problemas y Soluciones

### Problema 1: "Total actividades en sistema: 0"

**Causa**: `actividadesSync` está vacío

**Solución**: Las actividades NO se están cargando en `actividadesSync`

**Verificar**:
1. ¿El componente que muestra las actividades carga correctamente?
2. ¿El componente `RegistroGuardarecursos` actualiza `actividadesSync`?

**Buscar en el código**:
```typescript
// ¿Dónde se llama a actividadesSync.updateActividades()?
```

---

### Problema 2: "Actividades encontradas para guardarecurso: 0"

**Causas posibles**:
1. El guardarecurso NO tiene actividades
2. El ID del guardarecurso no coincide
3. Ninguna actividad está en estado "Completada"
4. No hay actividades del año actual (2025)

**Solución**:
1. Verifica que el guardarecurso tenga actividades **completadas**
2. Verifica que las actividades sean del año **2025**

---

### Problema 3: "Datos agrupados finales: {}"

**Causa**: El mapeo de tipos de actividad no está funcionando

**Solución**: Verificar que los tipos de actividad coincidan con `ACTIVIDAD_MAPPING`

**Tipos válidos** (según ACTIVIDAD_MAPPING):
```
Categoría 1:
- Patrullaje
- Patrullaje de Control y Vigilancia
- Control y Vigilancia
- Ronda

Categoría 2:
- Prevención de Incendios
- Atención a Incendios Forestales
- Prevención y Atención a Incendios Forestales

Categoría 3:
- Mantenimiento
- Mantenimiento de Área Protegida
- Mantenimiento del Área Protegida
- Educación Ambiental
- Investigación

Categoría 4:
- Reforestación
- Reforestación de Área Protegida
- Reforestación del Área Protegida

Categoría 5:
- Mantenimiento de Reforestación
```

**Si el tipo de actividad NO coincide**, se asigna a la categoría 12 (que no aparece en el reporte).

---

## 🛠️ Soluciones Según el Log

### Si ves: "Total actividades en sistema: 0"

**Problema**: `actividadesSync` NO tiene datos

**Necesitas verificar**:
1. ¿Dónde se cargan las actividades?
2. ¿Se llama a `actividadesSync.updateActividades()`?

**Busca en tu código**:
```bash
# Buscar dónde se actualiza actividadesSync
grep -r "actividadesSync.updateActividades" .
```

**Probablemente necesitas**:
- En el componente que lista actividades, agregar:
  ```typescript
  useEffect(() => {
    // Cuando se carguen las actividades desde la API
    actividadesSync.updateActividades(actividadesFromAPI);
  }, [actividadesFromAPI]);
  ```

---

### Si ves: "Actividades encontradas para guardarecurso: 0" pero "Total actividades en sistema: > 0"

**Problema**: Las actividades NO cumplen los filtros

**Filtros aplicados**:
1. ✅ `act.guardarecurso === guardarecursoId` - ID del guardarecurso
2. ✅ `act.estado === 'Completada'` - Solo completadas
3. ✅ `año actual === 2025` - Solo del presente año

**Verificar en la consola**:
```javascript
// Busca en el array "Actividades filtradas" y verifica:
actividad.guardarecurso // ¿Coincide con el ID?
actividad.estado // ¿Es "Completada"?
new Date(actividad.fecha).getFullYear() // ¿Es 2025?
```

---

### Si ves actividades pero "Datos agrupados finales: {}"

**Problema**: Los tipos de actividad NO coinciden con `ACTIVIDAD_MAPPING`

**Verificar en la consola**:
```
  - Actividad: "TIPO_AQUI" → Categoría 12
```

Si ves "Categoría 12", significa que el tipo NO está en `ACTIVIDAD_MAPPING`.

**Solución**:
1. Verifica el tipo exacto de la actividad en la base de datos
2. Agrégalo a `ACTIVIDAD_MAPPING` en `/utils/reporteActividadesService.ts`:

```typescript
export const ACTIVIDAD_MAPPING: { [key: string]: number } = {
  // ... tipos existentes
  'TU_NUEVO_TIPO': 1, // o 2, 3, 4, 5 según corresponda
};
```

---

## 📋 Checklist de Verificación

Antes de generar el informe, verifica:

### 1. Actividades en el Sistema
- [ ] Hay actividades creadas
- [ ] Las actividades están en la base de datos
- [ ] Las actividades se cargan correctamente en la UI

### 2. Actividades del Guardarecurso
- [ ] El guardarrecurso tiene actividades asignadas
- [ ] El campo `guardarecurso` de la actividad coincide con el ID del guardarrecurso
- [ ] Al menos 1 actividad tiene estado "Completada"

### 3. Filtros
- [ ] Las actividades son del año **2025**
- [ ] El tipo de actividad está en `ACTIVIDAD_MAPPING`

### 4. actividadesSync
- [ ] `actividadesSync.updateActividades()` se llama cuando se cargan las actividades
- [ ] `actividadesSync.getActividades()` devuelve las actividades correctas

---

## 🔧 Siguiente Paso

**Por favor, genera un informe y copia aquí los logs de la consola.**

Específicamente necesito ver:

```
📊 Actividades encontradas para guardarecurso [ID]: ???
Total actividades en sistema: ???
Actividades filtradas: [???]

🔍 Iniciando agrupación de actividades...
Actividades a agrupar: [???]

📊 Datos agrupados finales: {???}
```

Con esa información podré identificar exactamente dónde está el problema.

---

## 💡 Pista Adicional

Si `actividadesSync` está vacío, probablemente necesitas:

1. **Buscar el componente que lista actividades** (probablemente `AsignacionActividades.tsx` o similar)
2. **Agregar actualización de `actividadesSync`** cuando se carguen actividades desde la API:

```typescript
import { actividadesSync } from '../utils/actividadesSync';

// Dentro de useEffect o cuando se carguen actividades:
useEffect(() => {
  if (actividades && actividades.length > 0) {
    actividadesSync.updateActividades(actividades);
  }
}, [actividades]);
```

---

**Última actualización**: Noviembre 2025  
**Estado**: 🔍 En debugging  
**Siguiente paso**: Obtener logs de la consola
