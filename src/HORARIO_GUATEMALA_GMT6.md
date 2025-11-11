# 🕐 Implementación de Horario de Guatemala (GMT-6)

## Fecha de Implementación
9 de noviembre de 2024

## Descripción del Cambio

Se ha implementado el uso del horario de Guatemala (GMT-6) en **TODAS** las fechas y horas que se guardan en la base de datos del sistema CONAP.

Guatemala está en la zona horaria **CST (Central Standard Time)** que es **GMT-6** y **NO usa horario de verano** (Daylight Saving Time), por lo que siempre mantiene el mismo offset de -6 horas respecto a UTC.

## Funciones Implementadas

Se crearon dos funciones helper en `/supabase/functions/server/index.tsx`:

### `getGuatemalaDateTime()`
Retorna la fecha y hora actual en formato ISO string ajustada al horario de Guatemala.

**Ejemplo:**
```typescript
const horaGuatemala = getGuatemalaDateTime();
// "2024-11-09T14:30:00.000Z" (representa 08:30 AM en Guatemala)
```

### `getGuatemalaDate()`
Retorna solo la fecha actual en formato YYYY-MM-DD ajustada al horario de Guatemala.

**Ejemplo:**
```typescript
const fechaGuatemala = getGuatemalaDate();
// "2024-11-09"
```

## Campos Afectados

Las siguientes columnas de la base de datos ahora se guardan en horario de Guatemala:

### Tabla `actividad`
- ✅ `act_fechah_iniciio` - Hora de inicio de actividad
- ✅ `act_fechah_fin` - Hora de finalización de actividad

### Tabla `geolocalizacion`
- ✅ `glc_fecha` - Fecha/hora de cada punto GPS registrado durante el patrullaje

### Tabla `hallazgo`
- ✅ `hlz_fecha` - Fecha del hallazgo

### Tabla `fotografia`
- ✅ `ftg_fecha` - Fecha/hora de la fotografía

### Tabla `incidente`
- ✅ `inc_fecha` - Fecha/hora del incidente

### Tabla `seguimiento`
- ✅ `sgm_fecha` - Fecha del seguimiento (para incidentes y hallazgos)

## Endpoints Actualizados

Los siguientes endpoints del servidor fueron actualizados para usar el horario de Guatemala:

### Actividades
- ✅ `PUT /make-server-276018ed/actividades/:id/iniciar` - Al iniciar una actividad
- ✅ `PUT /make-server-276018ed/actividades/:id/finalizar` - Al finalizar una actividad
- ✅ `POST /make-server-276018ed/actividades/:id/coordenadas` - Al guardar puntos GPS

### Hallazgos
- ✅ `POST /make-server-276018ed/actividades/:id/hallazgos` - Al crear hallazgo desde actividad
- ✅ `POST /make-server-276018ed/hallazgos` - Al crear hallazgo general

### Evidencias Fotográficas
- ✅ `PUT /make-server-276018ed/actividades/:id/finalizar` - Al guardar evidencias en finalización
- ✅ `POST /make-server-276018ed/fotografia` - Al subir fotografía

### Incidentes
- ✅ `POST /make-server-276018ed/incidentes` - Al crear un incidente

### Seguimientos
- ✅ `POST /make-server-276018ed/incidentes/:id/seguimientos` - Al agregar seguimiento a incidente
- ✅ `POST /make-server-276018ed/hallazgos/:id/seguimientos` - Al agregar seguimiento a hallazgo

### Dashboard
- ✅ `GET /make-server-276018ed/dashboard/stats` - Al calcular "actividades de hoy"

## Impacto en el Sistema

### ✅ Beneficios
1. **Consistencia de datos**: Todas las horas se guardan en el mismo huso horario
2. **Precisión temporal**: Las horas reflejan el momento exacto en Guatemala
3. **Cálculos correctos**: Las duraciones y diferencias de tiempo son precisas
4. **Visualización correcta**: Los usuarios ven las horas en su zona horaria local

### ⚠️ Consideraciones
1. Los datos **ya existentes** en la base de datos pueden estar en UTC y necesitan ser interpretados correctamente
2. Las consultas de filtrado por fecha deben tener en cuenta el horario de Guatemala
3. Los reportes y estadísticas ahora reflejan el horario correcto de Guatemala

## Ejemplo de Flujo

### Antes (UTC)
1. Usuario inicia patrullaje a las **08:00 AM** hora de Guatemala
2. Se guardaba como `2024-11-09T14:00:00.000Z` (UTC)
3. Al calcular duraciones había confusión de 6 horas

### Ahora (GMT-6)
1. Usuario inicia patrullaje a las **08:00 AM** hora de Guatemala  
2. Se guarda como `2024-11-09T08:00:00.000Z` (GMT-6)
3. Las duraciones y cálculos son correctos

## Código de Referencia

```typescript
// Función principal para obtener fecha/hora de Guatemala
function getGuatemalaDateTime(): string {
  const now = new Date();
  const guatemalaOffset = -6 * 60; // GMT-6 en minutos
  const guatemalaTime = new Date(now.getTime() + (guatemalaOffset + now.getTimezoneOffset()) * 60000);
  return guatemalaTime.toISOString();
}

// Ejemplo de uso al iniciar actividad
const { data, error } = await supabaseAdmin
  .from('actividad')
  .update({
    act_fechah_iniciio: getGuatemalaDateTime(), // ✅ Hora de Guatemala
    // ...otros campos
  });
```

## Testing

Para verificar que el horario es correcto:

1. **Iniciar una actividad** a las 10:00 AM hora local de Guatemala
2. **Verificar en la base de datos** que `act_fechah_iniciio` muestre aproximadamente `10:00:00`
3. **Guardar un punto GPS** y verificar que `glc_fecha` muestre la hora actual de Guatemala
4. **Calcular duración** entre inicio y fin debe dar el tiempo real transcurrido

## Responsable
Sistema de Gestión CONAP - Módulo de Guardarecursos

## Notas Adicionales
- Guatemala usa GMT-6 todo el año (no hay cambio de horario)
- El servidor puede estar en cualquier zona horaria, las funciones se encargan de la conversión
- Todos los cálculos de duración y distancia ahora usan los tiempos correctos
