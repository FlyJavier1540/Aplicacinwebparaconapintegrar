# 📊 Métricas de Seguimiento de Cumplimiento - Guía Rápida

> **Última actualización**: 7 de Noviembre de 2024

---

## 🎯 ¿Qué Hace Este Módulo?

El módulo de **Seguimiento de Cumplimiento** muestra métricas específicas para cada guardarecurso:

1. **📋 Actividades**: % de actividades completadas vs total
2. **🚶 Patrullajes**: % de patrullajes completados vs total  
3. **📍 Hallazgos**: Cantidad real de hallazgos reportados

---

## ⚠️ PROBLEMA COMÚN: Las Métricas Muestran 0

### ¿Por qué pasa esto?
**Row Level Security (RLS)** de PostgreSQL está bloqueando las consultas.

### ✅ Solución en 3 Pasos:

#### 1. Abre el Script SQL
Abre el archivo: **[SCRIPT_FIX_RLS.sql](./SCRIPT_FIX_RLS.sql)**

#### 2. Ejecuta en Supabase
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Click en **SQL Editor** 
4. Copia y pega TODO el contenido de `SCRIPT_FIX_RLS.sql`
5. Click en **RUN** (o `Ctrl+Enter`)

#### 3. Verifica los Resultados
El script te mostrará:
- ✅ RLS deshabilitado en todas las tablas
- 📊 Cantidad de datos existentes
- 👤 Desglose por guardarecurso

---

## 📖 Documentación Completa

| Archivo | Descripción |
|---------|-------------|
| **[SCRIPT_FIX_RLS.sql](./SCRIPT_FIX_RLS.sql)** | Script SQL listo para ejecutar ⚡ |
| **[FIX_RLS_ACTIVIDAD.md](./FIX_RLS_ACTIVIDAD.md)** | Explicación del problema de RLS |
| **[METRICAS_SEGUIMIENTO_DETALLE.md](./METRICAS_SEGUIMIENTO_DETALLE.md)** | Documentación técnica completa |
| **[CAMBIOS_METRICAS_NOVIEMBRE_2024.md](./CAMBIOS_METRICAS_NOVIEMBRE_2024.md)** | Log de cambios implementados |

---

## 🔍 ¿Cómo Sé que Funciona?

### En el Servidor (Logs de Supabase):
```
📊 Calculando métricas de cumplimiento para 4 guardarecursos
🔍 Procesando guardarecurso: Juan Pérez (ID: 1)
  ✅ Actividades: 15/20 completadas
  🚶 Patrullajes: 8/10 completados
  📍 Hallazgos: 12 reportados
```

### En el Navegador (Consola F12):
```
📊 Cargando métricas de cumplimiento - Período: Mensual
✅ Métricas cargadas correctamente: 12 métricas
```

### En la Interfaz:
Deberías ver las 3 métricas para cada guardarecurso con **datos reales**.

---

## 🎨 Ejemplo Visual

```
┌─────────────────────────────────────────────┐
│ 📋 Cumplimiento de Actividades              │
│ 15 de 20 actividades completadas            │
│ ████████████████████░░░░ 75%                │
│ Actual: 15 actividades | Meta: 20           │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 🚶 Cumplimiento de Patrullajes              │
│ 8 de 10 patrullajes completados             │
│ ████████████████████░░░░ 80%                │
│ Actual: 8 patrullajes | Meta: 10            │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 📍 Hallazgos Reportados                     │
│ 12 hallazgos reportados en el período       │
│ ████████████████████████ 100%               │
│ Actual: 12 hallazgos | Meta: 12             │
└─────────────────────────────────────────────┘
```

---

## 🚨 Solución de Problemas Rápida

### Las métricas siguen en 0 después del script
1. ✅ Verifica que ejecutaste TODO el script
2. ✅ Refresca la aplicación web (Ctrl+F5)
3. ✅ Verifica los logs del servidor
4. ✅ Consulta [FIX_RLS_ACTIVIDAD.md](./FIX_RLS_ACTIVIDAD.md)

### No aparecen patrullajes
1. ✅ Verifica que el tipo de actividad se llama exactamente **"Patrullaje"**
2. ✅ Ejecuta: `SELECT * FROM tipo_actividad;`
3. ✅ Consulta [METRICAS_SEGUIMIENTO_DETALLE.md](./METRICAS_SEGUIMIENTO_DETALLE.md) sección "Patrullajes"

### No aparecen hallazgos
1. ✅ Verifica que existen hallazgos con `hlz_usuario` asignado
2. ✅ Ejecuta: `SELECT * FROM hallazgo WHERE hlz_usuario = 1;`
3. ✅ Consulta [METRICAS_SEGUIMIENTO_DETALLE.md](./METRICAS_SEGUIMIENTO_DETALLE.md) sección "Hallazgos"

---

## 📊 Periodos Disponibles

- **Diario**: Hoy (00:00 - 23:59)
- **Semanal**: Últimos 7 días
- **Mensual**: Del 1 del mes hasta hoy
- **Trimestral**: Últimos 3 meses
- **Anual**: Del 1 de enero hasta hoy

**Zona Horaria**: Guatemala GMT-6 🇬🇹

---

## 🎯 Roles y Permisos

| Rol | Puede Ver | Puede Filtrar |
|-----|-----------|---------------|
| **Guardarecurso** | Solo sus métricas | ❌ No |
| **Coordinador** | Todas las métricas | ✅ Sí |
| **Administrador** | Todas las métricas | ✅ Sí |

---

## 📄 Generar Reportes PDF

1. Click en **"Generar Reporte"**
2. Selecciona los guardarecursos (Admin/Coordinador)
3. El PDF se descarga automáticamente

**Contenido del reporte**:
- 📋 Encabezado CONAP
- 📅 Período y fecha de generación
- 👤 Métricas por guardarecurso
- 📊 Cumplimiento promedio
- 📄 Tabla detallada de métricas

---

## 🔧 Archivos del Sistema

### Backend
- `/supabase/functions/server/index.tsx` - Endpoint API (línea 3910)

### Frontend
- `/components/SeguimientoCumplimiento.tsx` - Componente principal
- `/utils/seguimientoCumplimientoService.ts` - Lógica de negocio

### Base de Datos
- `actividad` - Actividades de guardarecursos
- `hallazgo` - Hallazgos reportados
- `usuario` - Datos de guardarecursos
- `tipo_actividad` - Tipos de actividad (Patrullaje, etc.)
- `estado` - Estados (Completada, En Progreso, etc.)

---

## ✅ Checklist Rápido

Antes de reportar un problema, verifica:

- [ ] Ejecutaste `SCRIPT_FIX_RLS.sql` completo
- [ ] Refrescaste la aplicación (Ctrl+F5)
- [ ] Revisaste logs del servidor (busca 📊)
- [ ] Revisaste logs del navegador (F12 → Console)
- [ ] Verificaste que existen datos en las tablas
- [ ] El token de sesión es válido

---

## 📞 Ayuda Adicional

Si necesitas más información:

1. 📖 Lee [METRICAS_SEGUIMIENTO_DETALLE.md](./METRICAS_SEGUIMIENTO_DETALLE.md) - Documentación completa
2. 🔧 Lee [FIX_RLS_ACTIVIDAD.md](./FIX_RLS_ACTIVIDAD.md) - Solución de RLS
3. 📋 Lee [CAMBIOS_METRICAS_NOVIEMBRE_2024.md](./CAMBIOS_METRICAS_NOVIEMBRE_2024.md) - Log de cambios

---

**Sistema CONAP - Gestión de Guardarecursos**  
Versión 1.1.0 | Noviembre 2024
