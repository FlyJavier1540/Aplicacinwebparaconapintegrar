# 📋 Pasos EXACTOS para Probar el Informe

## ⚠️ IMPORTANTE: Seguir en ORDEN

---

## 🔄 PASO 1: Refrescar Completamente la Página

1. **Cierra** todas las pestañas de la aplicación
2. **Abre** una nueva pestaña
3. **Presiona** Ctrl+Shift+R (Windows/Linux) o Cmd+Shift+R (Mac) para forzar recarga

---

## 🔐 PASO 2: Login

1. **Inicia sesión** como Coordinador o Administrador
2. **NO vayas** a "Registro de Guardarecursos" todavía

---

## 📊 PASO 3: Cargar Actividades (CRÍTICO)

1. **Abre la consola** (F12) - Mantenla abierta todo el tiempo
2. **Ve al menú**: Operaciones de Campo → **Planificación de Actividades**
3. **ESPERA** a que la página cargue completamente
4. **Busca en la consola** este log:

```
📡 Consultando actividades desde backend...
🔍 DEBUG: Datos recibidos del servidor: [...]
🔍 DEBUG: Primera actividad: {...}
🔍 DEBUG: Actividades transformadas: [...]
🔍 DEBUG: Primera actividad transformada: {...}
✅ 5 actividades cargadas y cacheadas
✅ actividadesSync actualizado con 5 actividades
```

5. **VERIFICA** que diga: `✅ actividadesSync actualizado con 5 actividades`
   - Si dice `0 actividades`, hay un problema con la API
   - Si no aparece el log, la página no se cargó bien

---

## 📝 PASO 4: Copiar Logs (Si hay problemas)

Si en el PASO 3 no ves `✅ actividadesSync actualizado con 5 actividades`, copia TODOS los logs de la consola y envíamelos.

**ESPECIALMENTE busca**:
```
🔍 DEBUG: Primera actividad transformada: {
  id: "1",
  tipo: "...",        ← ¿Qué dice aquí?
  estado: "...",      ← ¿Qué dice aquí?
  ...
}
```

---

## 📄 PASO 5: Generar Informe

1. **SIN CERRAR** la consola
2. **Ve al menú**: Gestión de Personal → **Registro de Guardarrecursos**
3. **Busca** el guardarrecurso "Alan Brito" (ID: 10)
4. **Click** en el botón "Generar Informe"
5. **Verifica en la consola** que ahora diga:

```
📊 Actividades encontradas para guardarecurso 10: 3
Total actividades en sistema: 5
Actividades filtradas: [
  { id: "1", tipo: "Patrullaje de Control y Vigilancia", estado: "Completada", ... },
  { id: "2", tipo: "Actividades de Prevención y Atención de Incendios Forestales", estado: "Completada", ... },
  { id: "6", tipo: "Patrullaje de Control y Vigilancia", estado: "Completada", ... }
]

🔍 Iniciando agrupación de actividades...
Actividades a agrupar: [...]

  - Actividad: "Patrullaje de Control y Vigilancia" → Categoría 1, Mes 10 (Nov), Clave: 1-10
  - Actividad: "Actividades de Prevención y Atención de Incendios Forestales" → Categoría 2, Mes 10 (Nov), Clave: 2-10
  - Actividad: "Patrullaje de Control y Vigilancia" → Categoría 1, Mes 10 (Nov), Clave: 1-10

📊 Datos agrupados finales: { "1-10": 2, "2-10": 1 }
```

6. **Abre el PDF** generado
7. **Verifica** que en la tabla aparezcan:
   - Fila 1 (Patrullajes): **2** en la columna "Nov"
   - Fila 2 (Prevención): **1** en la columna "Nov"
   - Filas 3, 4, 5: **-** en todas las columnas

---

## ✅ Resultado Esperado

### Logs en Consola:

```
PASO 3:
✅ actividadesSync actualizado con 5 actividades

PASO 5:
📊 Actividades encontradas para guardarecurso 10: 3
📊 Datos agrupados finales: { "1-10": 2, "2-10": 1 }
```

### PDF Generado:

Tabla con números en las columnas de los meses.

---

## 🐛 Si Algo Falla

### Problema A: En PASO 3 dice "0 actividades"

**Logs a buscar**:
```
🔍 DEBUG: Datos recibidos del servidor: [...]
🔍 DEBUG: Primera actividad: {...}
```

**Acción**: Copiar y enviar esos logs completos.

---

### Problema B: En PASO 3 no aparece ningún log

**Causa**: La página no se cargó o hay error de red.

**Acción**: 
1. Verificar que no haya errores rojos en consola
2. Verificar que la lista de actividades aparezca en pantalla
3. Refrescar la página (Ctrl+Shift+R)

---

### Problema C: En PASO 5 dice "Total actividades: 0"

**Causa**: No fuiste al PASO 3 primero.

**Acción**: Repetir desde el PASO 3.

---

### Problema D: En PASO 5 dice "Actividades encontradas: 0" pero "Total: 5"

**Causa**: El guardarrecurso no tiene actividades asignadas.

**Acción**: 
1. Verificar que el ID del guardarrecurso sea correcto
2. Probar con otro guardarrecurso (ej: Javier Cito, ID: 11)

---

## 📤 Qué Enviarme si Falla

1. **TODOS los logs** de la consola desde el PASO 3 hasta el PASO 5
2. **Captura de pantalla** de la consola
3. **Decirme** en qué paso exactamente falló

---

**Última actualización**: Noviembre 2025  
**Estado**: 🧪 Esperando prueba con pasos exactos
