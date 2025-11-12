# 📊 Informe Mensual de Actividades - Actualizado

## ✅ Cambios Implementados

He actualizado el diseño del **Informe Mensual de Actividades** de guardarecursos para que coincida exactamente con el formato oficial de CONAP que me mostraste.

---

## 🎨 Nuevo Diseño

### Encabezado
- **✅ Logo de CONAP** en la esquina superior izquierda
- **✅ Título centrado**: "Consejo Nacional de Áreas Protegidas"
- **✅ Subtítulo**: "Dirección Regional Altiplano Occidental"
- **✅ Informe**: "Informe Mensual de Actividades 2025" (año actual)
- **✅ Guardarrecursos**: [Nombre completo del guardarecurso]
- **✅ Área Protegida**: [Nombre del área asignada]

### Tabla de Actividades
- **5 actividades estándar** (según formato CONAP):
  1. Patrullajes de control y vigilancia
  2. Actividades de Prevención y atención a incendios forestales
  3. Mantenimiento del área protegida
  4. Reforestación del área protegida
  5. Mantenimiento de reforestación

- **Columnas**:
  - No.
  - Actividad
  - Unidad de Medida (Día)
  - MES PROGRAMADO: Ene, Feb, Mar, Abr, May, Jun, Jul, Ago, Sep, Oct, Nov, Dic

- **Conteo de actividades**: En cada celda se muestra el **número de actividades completadas** de ese tipo en ese mes específico

### Pie de Página
- **✅ Nota oficial**: "* Se adjunta el informe descriptivo en ____ hojas papel bond"
- **Información del sistema**: Total de actividades y fecha de generación

---

## 📋 Mapeo de Actividades

El sistema cuenta automáticamente las actividades según su tipo:

| Tipo de Actividad (Sistema) | Categoría en Informe | No. |
|------------------------------|----------------------|-----|
| Patrullaje | Patrullajes de control y vigilancia | 1 |
| Patrullaje de Control y Vigilancia | Patrullajes de control y vigilancia | 1 |
| Control y Vigilancia | Patrullajes de control y vigilancia | 1 |
| Ronda | Patrullajes de control y vigilancia | 1 |
| Prevención de Incendios | Actividades de Prevención y atención a incendios forestales | 2 |
| Atención a Incendios Forestales | Actividades de Prevención y atención a incendios forestales | 2 |
| Prevención y Atención a Incendios Forestales | Actividades de Prevención y atención a incendios forestales | 2 |
| Mantenimiento | Mantenimiento del área protegida | 3 |
| Mantenimiento de Área Protegida | Mantenimiento del área protegida | 3 |
| Mantenimiento del Área Protegida | Mantenimiento del área protegida | 3 |
| Educación Ambiental | Mantenimiento del área protegida | 3 |
| Investigación | Mantenimiento del área protegida | 3 |
| Reforestación | Reforestación del área protegida | 4 |
| Reforestación de Área Protegida | Reforestación del área protegida | 4 |
| Reforestación del Área Protegida | Reforestación del área protegida | 4 |
| Mantenimiento de Reforestación | Mantenimiento de reforestación | 5 |

---

## 📅 Ejemplo de Informe Generado

### Datos del Guardarecurso
- **Guardarrecursos**: Juan Pérez López
- **Área Protegida**: Parque Nacional Laguna del Tigre
- **Año**: 2025

### Tabla de Actividades

| No. | Actividad | Unidad de Medida | Ene | Feb | Mar | Abr | May | Jun | Jul | Ago | Sep | Oct | Nov | Dic |
|-----|-----------|------------------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| 1 | Patrullajes de control y vigilancia | Día | 5 | 8 | 12 | 10 | 7 | 9 | 11 | 6 | 8 | 10 | 5 | 7 |
| 2 | Actividades de Prevención y atención a incendios forestales | Día | 2 | 3 | 5 | 8 | 4 | 2 | 1 | 0 | 3 | 4 | 2 | 1 |
| 3 | Mantenimiento del área protegida | Día | 4 | 5 | 6 | 5 | 7 | 6 | 5 | 8 | 6 | 5 | 4 | 6 |
| 4 | Reforestación del área protegida | Día | 1 | 2 | 3 | 2 | 1 | 2 | 1 | 1 | 2 | 3 | 1 | 1 |
| 5 | Mantenimiento de reforestación | Día | 0 | 1 | 2 | 1 | 2 | 1 | 1 | 2 | 1 | 1 | 0 | 1 |

**Nota**: Los números representan el **conteo de actividades completadas** de ese tipo en cada mes del presente año (2025).

---

## 🚀 Cómo Generar el Informe

### Desde Coordinador o Administrador

1. **Ve a**: Gestión de Personal → Registro de Guardarecursos
2. **Busca** al guardarecurso en la tabla
3. **Click** en el botón de **"Generar Informe"** (ícono de documento)
4. **Resultado**: Se descarga automáticamente el PDF con:
   - Logo de CONAP
   - Nombre del guardarecurso
   - Área protegida asignada
   - Conteo de actividades por mes y tipo
   - Del presente año (2025)

### Desde Guardarecurso

Los guardarecursos **NO** tienen acceso a generar informes. Solo Coordinadores y Administradores pueden generar informes.

---

## 📄 Archivos Modificados

### `/utils/reporteActividadesService.ts`
**Cambios principales**:
1. ✅ Actualizado `ACTIVIDAD_MAPPING` para mapear actividades a las 5 categorías
2. ✅ Actualizado `ACTIVIDADES_REPORTE` con las 5 actividades estándar
3. ✅ Modificado `agregarEncabezado()` para incluir:
   - Logo de CONAP
   - Títulos oficiales
   - Nombre del guardarrecurso
   - Área protegida
4. ✅ Modificado `agregarTabla()` para formato "MES PROGRAMADO"
5. ✅ Modificado `agregarFooter()` para incluir nota oficial
6. ✅ Importado logo de CONAP desde `/src/logo.ts`

---

## 🔍 Detalles Técnicos

### Agrupación de Actividades

El sistema agrupa las actividades de la siguiente manera:

1. **Filtra** todas las actividades del guardarecurso con estado "Completada"
2. **Agrupa** por tipo de actividad según `ACTIVIDAD_MAPPING`
3. **Cuenta** cuántas actividades de cada tipo se completaron en cada mes
4. **Genera** la tabla con los conteos

### Código de Agrupación

```typescript
export function agruparActividadesPorTipoYMes(actividades: Actividad[]): ActividadesAgrupadas {
  const datosActividades: ActividadesAgrupadas = {};
  
  actividades.forEach((actividad: Actividad) => {
    const fecha = new Date(actividad.fecha);
    const mes = fecha.getMonth(); // 0-11 (Enero = 0, Diciembre = 11)
    const categoriaNo = ACTIVIDAD_MAPPING[actividad.tipo] || 12;
    const clave = `${categoriaNo}-${mes}`;
    
    if (!datosActividades[clave]) {
      datosActividades[clave] = 0;
    }
    datosActividades[clave]++; // Incrementar contador
  });

  return datosActividades;
}
```

### Ejemplo de Datos Agrupados

```javascript
{
  "1-0": 5,   // Categoría 1 (Patrullajes), Enero: 5 actividades
  "1-1": 8,   // Categoría 1 (Patrullajes), Febrero: 8 actividades
  "2-0": 2,   // Categoría 2 (Incendios), Enero: 2 actividades
  "3-5": 6,   // Categoría 3 (Mantenimiento), Junio: 6 actividades
  // ... etc
}
```

---

## 📊 Datos del Año Actual

El informe **siempre** se genera para el **año actual** (2025).

Si se registran actividades de años anteriores, **NO** aparecerán en el informe.

Filtro aplicado:
```typescript
const año = new Date().getFullYear(); // 2025
// Solo se cuentan actividades del año 2025
```

---

## ✅ Validaciones y Seguridad

### Validaciones Implementadas

1. **Actividades completadas**: Solo cuenta actividades con estado "Completada"
2. **Guardarecurso específico**: Solo cuenta actividades del guardarecurso seleccionado
3. **Año actual**: Solo cuenta actividades del presente año
4. **Área protegida**: Se muestra el nombre del área asignada desde la base de datos

### Seguridad

- ✅ Solo Coordinadores y Administradores pueden generar informes
- ✅ Cada informe es específico para un guardarecurso
- ✅ Los datos se obtienen en tiempo real desde la base de datos

---

## 🎯 Próximos Pasos (Opcional)

Si necesitas agregar más funcionalidades:

1. **Filtro por rango de fechas**: Permitir generar informes de meses específicos
2. **Exportar a Excel**: Además de PDF, exportar a formato Excel
3. **Gráficas**: Agregar gráficas de barras para visualizar actividades por mes
4. **Firmas**: Agregar espacios para firmas del guardarecurso y coordinador
5. **Comparativa**: Comparar actividades de diferentes guardarecursos

---

## 📝 Ejemplo de Uso

```typescript
// Generar informe desde componente
import { reporteActividadesService } from '../utils/reporteActividadesService';

const handleGenerarInforme = () => {
  const guardarecurso = {
    id: '123',
    nombre: 'Juan',
    apellido: 'Pérez',
    areaAsignada: 'Parque Nacional Laguna del Tigre'
  };
  
  const resultado = reporteActividadesService.generarReporteActividadesMensual(
    guardarecurso,
    'Parque Nacional Laguna del Tigre' // Nombre del área desde BD
  );
  
  if (resultado.success) {
    console.log('✅ Informe generado:', resultado.fileName);
    console.log('📊 Total actividades:', resultado.totalActividades);
  }
};
```

---

**Última actualización**: Noviembre 2025  
**Versión**: v2.2 - Informe Mensual con Diseño Oficial CONAP  
**Estado**: ✅ Listo para usar
