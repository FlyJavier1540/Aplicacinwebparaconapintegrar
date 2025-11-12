# 🔍 Pasos para Identificar Por Qué No Se Llenan los Datos

## ✅ Tabla Centrada y Tamaño Restaurado

Ya restauré el tamaño original de la tabla y la centré en la página.

---

## 🐛 Problema: Los Datos NO se Llenan (todo muestra "-")

Necesito que sigas estos pasos para identificar el problema:

---

## 📋 PASO 1: Verificar que actividadesSync se Actualice

### 1.1 Ir a Planificación de Actividades

1. **Abre** la aplicación
2. **Login** como Coordinador o Administrador
3. **Ve a**: Operaciones de Campo → **Planificación de Actividades**
4. **Abre la Consola del Navegador** (F12)

### 1.2 Buscar el Log

En la consola deberías ver:

```
✅ actividadesSync actualizado con X actividades
```

### 1.3 Reportar

**¿Ves el log?**
- ✅ **SÍ** → Continúa al PASO 2
- ❌ **NO** → Hay un problema con la carga de actividades

**¿Cuántas actividades dice?**
- Anota el número: **_____ actividades**

---

## 📋 PASO 2: Verificar Actividades del Guardarrecurso

### 2.1 Generar el Informe

1. **Ve a**: Gestión de Personal → **Registro de Guardarecursos**
2. **Mantén abierta la consola** (F12)
3. **Click** en el botón "Generar Informe" de un guardarrecurso

### 2.2 Buscar los Logs

Deberías ver en la consola:

```
📊 Actividades encontradas para guardarecurso [ID]: X
Total actividades en sistema: Y
Actividades filtradas: [Array]

🔍 Iniciando agrupación de actividades...
Actividades a agrupar: [Array]

  - Actividad: "TIPO" → Categoría Z, Mes M (NOMBRE_MES), Clave: Z-M
  ...

📊 Datos agrupados finales: {objeto}
```

### 2.3 Reportar

**Por favor, copia y pega TODOS los logs que veas aquí:**

```
[PEGA LOS LOGS AQUÍ]
```

---

## 📋 PASO 3: Verificar Actividades en la Base de Datos

### 3.1 Ver Actividades

1. **Ve a**: Operaciones de Campo → **Planificación de Actividades**
2. **Cuenta** cuántas actividades hay en la lista

### 3.2 Verificar Detalles de una Actividad

1. **Haz click** en una actividad para editarla
2. **Anota**:
   - **Tipo**: _________________
   - **Estado**: _________________
   - **Fecha**: _________________
   - **Guardarrecurso**: _________________

### 3.3 Reportar

**¿Cuántas actividades hay en total?** _____

**¿Cuántas están en estado "Completada"?** _____

**¿Cuántas son del año 2025?** _____

---

## 📋 PASO 4: Crear una Actividad de Prueba

Para asegurarnos de que funciona, crea una actividad de prueba:

### 4.1 Crear Actividad

1. **Ve a**: Planificación de Actividades
2. **Click** en "Nuevo"
3. **Completa**:
   - **Código**: TEST-2025-001
   - **Tipo**: **Patrullaje** (importante: selecciona exactamente este)
   - **Guardarrecurso**: [Selecciona el mismo guardarrecurso del informe]
   - **Descripción**: Prueba para informe
   - **Fecha**: Cualquier día de **Noviembre 2025**
   - **Hora**: 08:00
4. **Guardar**

### 4.2 Cambiar Estado a Completada

1. **Ve a**: Control y Seguimiento → **Seguimiento de Actividades**
2. **Busca** la actividad TEST-2025-001
3. **Cambia** el estado a **"Completada"**

### 4.3 Generar Informe Nuevamente

1. **Ve a**: Registro de Guardarecursos
2. **Genera** el informe del mismo guardarrecurso
3. **Revisa** la consola

### 4.4 Reportar

**¿Ahora aparece un número en la columna "Nov" de la fila 1 (Patrullajes)?**
- ✅ **SÍ** → El problema es que no hay actividades completadas
- ❌ **NO** → Hay un problema en el código

---

## 🚨 Posibles Problemas

### Problema A: "actividadesSync actualizado con 0 actividades"

**Causa**: No hay actividades en la base de datos

**Solución**: Crear actividades desde "Planificación de Actividades"

---

### Problema B: "Total actividades en sistema: 0"

**Causa**: `actividadesSync` no se actualizó correctamente

**Solución**: 
1. Ir a "Planificación de Actividades" primero
2. Esperar a que cargue
3. Luego generar el informe

---

### Problema C: "Actividades encontradas: 0" pero "Total actividades: > 0"

**Causas posibles**:
1. El guardarrecurso NO tiene actividades asignadas
2. Las actividades NO están en estado "Completada"
3. Las actividades NO son del año 2025

**Solución**: Verificar en "Seguimiento de Actividades"

---

### Problema D: "Datos agrupados finales: {}"

**Causa**: El tipo de actividad no coincide con `ACTIVIDAD_MAPPING`

**Verificar en logs**: 
```
  - Actividad: "Mi Tipo" → Categoría 12
```

Si ves "Categoría 12", el tipo NO está mapeado.

**Tipos válidos**:
- Patrullaje
- Control y Vigilancia
- Ronda
- Prevención de Incendios
- Mantenimiento
- Reforestación
- Mantenimiento de Reforestación

---

## 📝 Checklist

Antes de reportar, verifica:

- [ ] Fui a "Planificación de Actividades" primero
- [ ] Vi el log "✅ actividadesSync actualizado con X actividades"
- [ ] Generé el informe desde "Registro de Guardarecursos"
- [ ] Copié TODOS los logs de la consola
- [ ] Verifiqué que hay actividades en estado "Completada"
- [ ] Verifiqué que las actividades son del año 2025
- [ ] Creé una actividad de prueba siguiendo el PASO 4

---

## 📤 Reportar Resultados

Por favor, envíame:

1. **Logs completos de la consola** (PASO 2.3)
2. **Cantidad de actividades** (PASO 3.3)
3. **Resultado de la actividad de prueba** (PASO 4.4)

Con esa información podré identificar exactamente qué está fallando.

---

**Última actualización**: Noviembre 2025  
**Estado**: 🔍 Esperando logs para debugging
