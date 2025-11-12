# 🔧 Solución - Mapeo de IDs a Nombres

## 🐛 Problema Identificado

El servidor está devolviendo:
```json
{
  "act_tipo": 1,      // ID numérico
  "act_estado": 8,    // ID numérico
  "act_usuario": 10   // ID numérico
}
```

Pero el código espera:
```json
{
  "tipo": { "tp_nombre": "Patrullaje" },
  "estado": { "std_nombre": "Completada" },
  "usuario": { "usr_id": 10, "usr_nombre": "...", "usr_apellido": "..." }
}
```

---

## ✅ Dos Soluciones Posibles

### **Solución A: Backend hace JOINs** (Recomendado)

El backend debe modificar la consulta SQL para incluir los joins:

```sql
SELECT 
  a.*,
  t.tp_nombre,
  e.std_nombre,
  u.usr_id, u.usr_nombre, u.usr_apellido
FROM actividad a
LEFT JOIN tipo t ON a.act_tipo = t.tp_id
LEFT JOIN estado e ON a.act_estado = e.std_id
LEFT JOIN usuario u ON a.act_usuario = u.usr_id
```

**Ventajas**:
- ✅ Más eficiente
- ✅ Una sola petición
- ✅ Datos consistentes

---

### **Solución B: Frontend hace mapeo local** (Temporal)

Crear un mapeo en el frontend mientras se arregla el backend:

```typescript
// Mapeo de IDs a nombres
const TIPO_MAPPING: { [key: number]: string } = {
  1: 'Patrullaje',
  2: 'Prevención de Incendios',
  3: 'Mantenimiento',
  4: 'Reforestación',
  5: 'Mantenimiento de Reforestación',
  // ... otros tipos
};

const ESTADO_MAPPING: { [key: number]: string } = {
  1: 'Programada',
  2: 'En Progreso',
  8: 'Completada',
  // ... otros estados
};

// Al transformar:
tipo: TIPO_MAPPING[act.act_tipo] || 'Desconocido',
estado: ESTADO_MAPPING[act.act_estado] || 'Programada',
```

**Ventajas**:
- ✅ Funciona inmediatamente
- ✅ No requiere cambios en backend

**Desventajas**:
- ❌ Mapeo manual
- ❌ Difícil de mantener

---

## 🔍 Necesito Información

Para implementar la **Solución B** (temporal), necesito saber los IDs de:

### 1. Tipos de Actividad

```
ID → Nombre
1  → ???
2  → ???
3  → ???
4  → ???
5  → ???
```

### 2. Estados

```
ID → Nombre
1  → ???
2  → ???
8  → ???
```

**Por favor, ejecuta esta consulta en tu base de datos:**

```sql
-- Tipos de actividad
SELECT tp_id, tp_nombre FROM tipo ORDER BY tp_id;

-- Estados
SELECT std_id, std_nombre FROM estado ORDER BY std_id;
```

O dime qué representa cada ID según tu base de datos.

---

## 📋 Pasos para Solucionar (Opción B - Temporal)

1. **Obtener mapeos** de tipos y estados
2. **Modificar** `/utils/actividadesAPI.ts` para agregar mapeos
3. **Probar** que funcione
4. **Más adelante**: Pedir al backend que incluya los joins (Solución A)

---

## 🚨 Logs Necesarios

Por favor:

1. **Recarga** la página
2. **Ve a** "Planificación de Actividades"
3. **Abre consola** (F12)
4. **Busca** los logs:

```
🔍 DEBUG: Datos recibidos del servidor: [...]
🔍 DEBUG: Primera actividad: {...}
🔍 DEBUG: Actividades transformadas: [...]
🔍 DEBUG: Primera actividad transformada: {...}
```

5. **Copia y pega** esos logs aquí

---

## 💡 Basándome en tus datos

De los datos que me enviaste, puedo inferir:

```javascript
// INFERENCIA (necesita confirmación):
const TIPO_MAPPING = {
  1: 'Patrullaje',              // act_id: 1, 4, 6
  2: 'Prevención de Incendios', // act_id: 2, 5
};

const ESTADO_MAPPING = {
  8: 'Completada', // Todas las que me mostraste tienen estado 8
};
```

¿Es correcto este mapeo?

---

**Última actualización**: Noviembre 2025  
**Estado**: 🔍 Esperando mapeo de IDs
