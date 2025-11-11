# 📊 Métricas de Seguimiento de Cumplimiento - Documentación Detallada

## 🎯 Métricas Implementadas

El módulo de **Seguimiento de Cumplimiento** calcula automáticamente 3 métricas para cada guardarecurso:

### 1. 📋 Cumplimiento de Actividades
- **Fórmula**: `(Actividades Completadas / Total Actividades) × 100`
- **Ejemplo**: Si un guardarecurso tiene 8 actividades completadas de 10 totales = **80%**
- **Visualización**: Barra de progreso con porcentaje
- **Estados considerados**: Solo actividades con estado "Completada"

### 2. 🚶 Cumplimiento de Patrullajes
- **Fórmula**: `(Patrullajes Completados / Total Patrullajes) × 100`
- **Ejemplo**: Si un guardarecurso tiene 5 patrullajes completados de 7 totales = **71.4%**
- **Visualización**: Barra de progreso con porcentaje
- **Filtrado**: Solo actividades donde `tipo_actividad.tpact_nombre = 'Patrullaje'`
- **Estados considerados**: Solo patrullajes con estado "Completada"

### 3. 📍 Hallazgos Reportados
- **Fórmula**: `CANTIDAD` (no es porcentaje)
- **Ejemplo**: Si un guardarecurso reportó 12 hallazgos = **12 hallazgos**
- **Visualización**: Cantidad real de hallazgos
- **Descripción**: "{cantidad} hallazgos reportados en el período"

---

## 🔢 Cálculo de Métricas por Período

Las métricas se calculan según el período seleccionado:

| Período | Rango de Fechas | Ejemplo |
|---------|-----------------|---------|
| **Diario** | Desde inicio del día actual | Hoy 00:00:00 - 23:59:59 |
| **Semanal** | Últimos 7 días | Hoy - 7 días hasta hoy |
| **Mensual** | Desde el día 1 del mes actual | 2024-11-01 hasta hoy |
| **Trimestral** | Últimos 3 meses | Hoy - 3 meses hasta hoy |
| **Anual** | Desde el día 1 del año actual | 2024-01-01 hasta hoy |

**Nota**: Todos los cálculos usan **horario de Guatemala (GMT-6)**.

---

## 📊 Ejemplos de Métricas Reales

### Ejemplo 1: Guardarecurso Juan Pérez (Período: Mensual)

```
📋 Cumplimiento de Actividades
   Descripción: 15 de 20 actividades completadas
   Meta: 100%
   Actual: 75%
   Progreso: ████████████████████░░░░░ 75%

🚶 Cumplimiento de Patrullajes
   Descripción: 8 de 10 patrullajes completados
   Meta: 100%
   Actual: 80%
   Progreso: ████████████████████░░░░ 80%

📍 Hallazgos Reportados
   Descripción: 12 hallazgos reportados en el período
   Actual: 12 hallazgos
   Meta: 12 hallazgos
   Progreso: ████████████████████████ 100%
```

### Ejemplo 2: Guardarecurso María García (Período: Semanal)

```
📋 Cumplimiento de Actividades
   Descripción: 3 de 5 actividades completadas
   Meta: 100%
   Actual: 60%
   Progreso: ███████████████░░░░░░░░░ 60%

🚶 Cumplimiento de Patrullajes
   Descripción: 2 de 3 patrullajes completados
   Meta: 100%
   Actual: 67%
   Progreso: ████████████████░░░░░░░░ 67%

📍 Hallazgos Reportados
   Descripción: 4 hallazgos reportados en el período
   Actual: 4 hallazgos
   Meta: 4 hallazgos
   Progreso: ████████████████████████ 100%
```

---

## 🎨 Código de Colores

Las barras de progreso usan un código de colores automático:

| Rango | Color | Estado |
|-------|-------|--------|
| **90% - 100%** | 🟢 Verde | Excelente cumplimiento |
| **75% - 89%** | 🟡 Amarillo | Buen cumplimiento |
| **60% - 74%** | 🟠 Naranja | Cumplimiento moderado |
| **0% - 59%** | 🔴 Rojo | Cumplimiento bajo |

**Nota**: Para hallazgos, siempre se muestra en verde (100%) porque solo indica cantidad.

---

## 🔍 Consultas SQL Ejecutadas

### Para Actividades:
```sql
SELECT act_id, estado.std_nombre
FROM actividad
JOIN estado ON act_estado = std_id
WHERE act_usuario = :guardarecurso_id
  AND act_fechah_programcion >= :fecha_inicio
  AND act_fechah_programcion <= :fecha_fin
```

### Para Patrullajes:
```sql
SELECT act_id, estado.std_nombre, tipo.tpact_nombre
FROM actividad
JOIN estado ON act_estado = std_id
JOIN tipo_actividad ON act_tipo_actividad = tpact_id
WHERE act_usuario = :guardarecurso_id
  AND tipo.tpact_nombre = 'Patrullaje'
  AND act_fechah_programcion >= :fecha_inicio
  AND act_fechah_programcion <= :fecha_fin
```

### Para Hallazgos:
```sql
SELECT hlz_id
FROM hallazgo
WHERE hlz_usuario = :guardarecurso_id
  AND hlz_fecha >= :fecha_inicio
  AND hlz_fecha <= :fecha_fin
```

---

## 🔐 Filtrado por Rol de Usuario

### Guardarecurso:
- ✅ Solo ve sus propias métricas
- ✅ No puede seleccionar otros guardarecursos
- ✅ Puede generar reporte de sus propias métricas

### Coordinador / Administrador:
- ✅ Ve métricas de todos los guardarecursos
- ✅ Puede filtrar por guardarecurso específico
- ✅ Puede generar reportes seleccionando múltiples guardarecursos

---

## 📄 Generación de Reportes PDF

Los reportes incluyen:

1. **Encabezado CONAP** con logo institucional
2. **Información del reporte**:
   - Período seleccionado
   - Fecha de generación
3. **Por cada guardarecurso**:
   - Nombre completo
   - Cumplimiento promedio (%)
   - Tabla detallada de métricas
4. **Pie de página** con número de página y fecha

**Formato del archivo**: `Reporte_Cumplimiento_{Período}_{YYYYMMDD_HHmmss}.pdf`

---

## ⚠️ Solución de Problemas

### Problema: Las métricas muestran 0 aunque hay datos

**Causa**: Row Level Security (RLS) está bloqueando las consultas.

**Solución**: Ejecuta este SQL en tu base de datos:

```sql
-- Deshabilitar RLS en las tablas necesarias
ALTER TABLE actividad DISABLE ROW LEVEL SECURITY;
ALTER TABLE hallazgo DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuario DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está deshabilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('actividad', 'hallazgo', 'usuario');
```

Ver archivo `/FIX_RLS_ACTIVIDAD.md` para más detalles.

### Problema: No aparecen hallazgos en las métricas

**Posibles causas**:
1. No hay hallazgos registrados en el período seleccionado
2. La tabla `hallazgo` tiene RLS habilitado
3. El campo `hlz_usuario` no está correctamente asignado

**Verificación**:
```sql
-- Verificar hallazgos existentes para un guardarecurso
SELECT hlz_id, hlz_fecha, hlz_usuario
FROM hallazgo
WHERE hlz_usuario = :guardarecurso_id
ORDER BY hlz_fecha DESC;
```

### Problema: Los patrullajes no se cuentan correctamente

**Posibles causas**:
1. El tipo de actividad no está nombrado exactamente "Patrullaje"
2. El JOIN con `tipo_actividad` está fallando

**Verificación**:
```sql
-- Ver los tipos de actividad disponibles
SELECT tpact_id, tpact_nombre
FROM tipo_actividad;

-- Ver patrullajes de un guardarecurso
SELECT act_id, tipo.tpact_nombre, estado.std_nombre
FROM actividad
JOIN tipo_actividad tipo ON act_tipo_actividad = tpact_id
JOIN estado ON act_estado = std_id
WHERE act_usuario = :guardarecurso_id
  AND tipo.tpact_nombre = 'Patrullaje';
```

---

## 🔧 Logging para Depuración

### En la Consola del Navegador:
```
📊 Cargando métricas de cumplimiento - Período: Mensual, Guardarecurso: todos
✅ Métricas cargadas correctamente: 12 métricas
```

### En los Logs del Servidor:
```
📊 Calculando métricas de cumplimiento para 4 guardarecursos
📅 Período: Mensual | Desde: 2024-11-01T06:00:00.000Z | Hasta: 2024-11-07T...

🔍 Procesando guardarecurso: Juan Pérez (ID: 1)
  ✅ Actividades: 15/20 completadas
  🚶 Patrullajes: 8/10 completados
  📍 Hallazgos: 12 reportados

🔍 Procesando guardarecurso: María García (ID: 2)
  ✅ Actividades: 12/15 completadas
  🚶 Patrullajes: 5/7 completados
  📍 Hallazgos: 8 reportados

✅ Total de métricas generadas: 12
```

---

## 📚 Archivos Relacionados

- `/components/SeguimientoCumplimiento.tsx` - Componente principal
- `/utils/seguimientoCumplimientoService.ts` - Lógica de negocio
- `/supabase/functions/server/index.tsx` - Endpoint API (línea 3910)
- `/FIX_RLS_ACTIVIDAD.md` - Solución a problemas de RLS

---

## ✅ Checklist de Verificación

Para que las métricas funcionen correctamente, verifica:

- [ ] RLS está deshabilitado en tablas: `actividad`, `hallazgo`, `usuario`
- [ ] Existen guardarecursos con rol ID = 3 en la tabla `usuario`
- [ ] Existen actividades asignadas a guardarecursos (`act_usuario`)
- [ ] El estado "Completada" existe en la tabla `estado`
- [ ] El tipo "Patrullaje" existe en la tabla `tipo_actividad`
- [ ] La tabla `hallazgo` tiene registros con `hlz_usuario` asignado
- [ ] El token de sesión es válido y no ha expirado

---

**Última actualización**: 7 de noviembre de 2024  
**Versión**: 1.0  
**Autor**: Sistema CONAP - Gestión de Guardarecursos
