# Guía de Uso - Opciones de Select Centralizadas

## 📋 Propósito

Este archivo centraliza todas las opciones de los componentes `Select` para mantener consistencia en toda la aplicación y evitar duplicación de código.

## 📦 Archivo: `/utils/selectOptions.tsx`

---

## 🚀 Uso Básico

### Importación

```typescript
import {
  ActividadEstadoOptionsWithAll,
  GuardarecursosOptionsWithAll,
  AreasProtegidasOptions,
  PrioridadOptions,
  // ... otros
} from '../utils/selectOptions';
```

### Ejemplo Simple

```typescript
<Select value={filtroEstado} onValueChange={setFiltroEstado}>
  <SelectTrigger>
    <SelectValue placeholder="Estado" />
  </SelectTrigger>
  <SelectContent>
    <ActividadEstadoOptionsWithAll />
  </SelectContent>
</Select>
```

---

## 📚 Catálogo de Opciones Disponibles

### 1️⃣ Estados

#### Estados de Actividades
- `ActividadEstadoOptions` - Sin opción "Todos"
- `ActividadEstadoOptionsWithAll` - Con opción "Todos los estados"

**Valores**: `Programada`, `En Progreso`, `Completada`, `Cancelada`

```typescript
<SelectContent>
  <ActividadEstadoOptionsWithAll />
</SelectContent>
```

#### Estados de Incidentes/Hallazgos
- `IncidenteEstadoOptions` - Sin opción "Todos"
- `IncidenteEstadoOptionsWithAll` - Con opción "Todos los estados"

**Valores**: `Reportado`, `En Atención`, `En Investigación`, `En Proceso`, `Escalado`, `Resuelto`

```typescript
<SelectContent>
  <IncidenteEstadoOptionsWithAll />
</SelectContent>
```

#### Estados de Equipos
- `EquipoEstadoOptions` - Con indicadores de color
- `EquipoEstadoOptionsWithAll` - Con opción "Todos"

**Valores**: `Operativo` (verde), `En Reparación` (naranja), `Deshabilitado` (rojo)

```typescript
<SelectContent>
  <EquipoEstadoOptionsWithAll />
</SelectContent>
```

#### Estados de Guardarrecursos
- `GuardarecursoEstadoOptions`

**Valores**: `Activo`, `Suspendido`, `Inactivo`

```typescript
<SelectContent>
  <GuardarecursoEstadoOptions />
</SelectContent>
```

---

### 2️⃣ Niveles (Gravedad y Prioridad)

#### Niveles de Gravedad
- `GravedadOptions` - Sin opción "Todos"
- `GravedadOptionsWithAll` - Con opción "Todas las gravedades"

**Valores**: `Leve`, `Moderado`, `Grave`, `Crítico`

```typescript
<SelectContent>
  <GravedadOptions />
</SelectContent>
```

#### Niveles de Prioridad
- `PrioridadOptions` - Sin opción "Todos"
- `PrioridadOptionsWithAll` - Con opción "Todas las prioridades" (orden descendente)

**Valores**: `Baja`, `Media`, `Alta`, `Crítica`

```typescript
<SelectContent>
  <PrioridadOptionsWithAll />
</SelectContent>
```

---

### 3️⃣ Tipos y Categorías

#### Tipos de Actividades
- `TipoActividadOptions` - Sin opción "Todos"
- `TipoActividadOptionsWithAll` - Con opción "Todos los tipos"
- `tiposActividad` - Array exportado de tipos

**Valores**: `Patrullaje`, `Control y Vigilancia`, `Mantenimiento`, etc.

```typescript
<SelectContent>
  <TipoActividadOptionsWithAll />
</SelectContent>
```

#### Categorías de Equipos
- `CategoriaEquipoOptions`
- `categoriasEquipo` - Array exportado de categorías

**Valores**: `Comunicación`, `Transporte`, `Seguridad`, `Medición`, `Campo`, `Tecnología`

```typescript
<SelectContent>
  <CategoriaEquipoOptions />
</SelectContent>
```

---

### 4️⃣ Períodos de Tiempo

#### Períodos
- `PeriodoOptions`

**Valores**: `Diario`, `Semanal`, `Mensual`, `Trimestral`, `Anual`

```typescript
<SelectContent>
  <PeriodoOptions />
</SelectContent>
```

---

### 5️⃣ Datos Dinámicos (desde mock-data)

#### Áreas Protegidas
- `AreasProtegidasOptions` - Solo áreas
- `AreasProtegidasOptionsWithAll` - Con "Todas las áreas" (personalizable)
- `AreasProtegidasOptionsWithAllLegacy` - Con value="all" (legacy)

```typescript
// Básico
<SelectContent>
  <AreasProtegidasOptions />
</SelectContent>

// Con "Todos" personalizado
<SelectContent>
  <AreasProtegidasOptionsWithAll label="Todas las zonas" />
</SelectContent>

// Legacy (value="all")
<SelectContent>
  <AreasProtegidasOptionsWithAllLegacy />
</SelectContent>
```

#### Guardarrecursos
- `GuardarecursosOptions` - Solo nombre y apellido
- `GuardarecursosOptionsWithAll` - Con "Todos" (personalizable)
- `GuardarecursosOptionsWithArea` - Con área asignada
- `GuardarecursoNoneOption` - Opción "Sin asignar"
- `GuardarecursosByAreaOptions` - Filtrado por área

```typescript
// Básico
<SelectContent>
  <GuardarecursosOptions />
</SelectContent>

// Con información de área
<SelectContent>
  <GuardarecursosOptionsWithArea />
</SelectContent>

// Con "Sin asignar"
<SelectContent>
  <GuardarecursoNoneOption />
  <GuardarecursosOptions />
</SelectContent>

// Filtrado por área
<SelectContent>
  <GuardarecursosByAreaOptions areaId={selectedArea} />
</SelectContent>
```

#### Departamentos
- `DepartamentosOptions` - Solo departamentos
- `DepartamentosOptionsWithAll` - Con "Todos los departamentos"
- `departamentos` - Array exportado

```typescript
<SelectContent>
  <DepartamentosOptionsWithAll />
</SelectContent>
```

#### Ecosistemas
- `EcosistemasOptions`
- `ecosistemas` - Array exportado

```typescript
<SelectContent>
  <EcosistemasOptions />
</SelectContent>
```

---

### 6️⃣ Helpers Genéricos

#### Opciones Personalizadas
- `AllOption` - Opción "Todos" personalizable
- `NoneOption` - Opción "Ninguna" personalizable
- `RenderAllOption` - Renderiza "Todos" genérico
- `RenderStringOptions` - Renderiza array de strings

```typescript
// Opción "Todos" personalizada
<SelectContent>
  <AllOption value="all" label="Mostrar todo" />
  {/* ... otras opciones */}
</SelectContent>

// Opción "Ninguna" personalizada
<SelectContent>
  <NoneOption label="No seleccionar" />
  {/* ... otras opciones */}
</SelectContent>

// Array de strings
<SelectContent>
  <RenderStringOptions options={['Opción 1', 'Opción 2', 'Opción 3']} />
</SelectContent>
```

#### Actividades Dinámicas
- `ActividadesOptions` - Recibe array de actividades

```typescript
<SelectContent>
  <NoneOption />
  <ActividadesOptions actividades={actividadesList} />
</SelectContent>
```

---

## 🔄 Migración de Código Existente

### Antes (código duplicado)
```typescript
<SelectContent>
  <SelectItem value="todos">Todos los estados</SelectItem>
  <SelectItem value="Programada">Programada</SelectItem>
  <SelectItem value="En Progreso">En Progreso</SelectItem>
  <SelectItem value="Completada">Completada</SelectItem>
  <SelectItem value="Cancelada">Cancelada</SelectItem>
</SelectContent>
```

### Después (centralizado)
```typescript
import { ActividadEstadoOptionsWithAll } from '../utils/selectOptions';

<SelectContent>
  <ActividadEstadoOptionsWithAll />
</SelectContent>
```

---

## 💡 Beneficios

1. ✅ **Consistencia**: Mismos valores en toda la app
2. ✅ **Mantenimiento**: Cambiar en un solo lugar
3. ✅ **DRY**: No repetir código
4. ✅ **Type Safety**: TypeScript infiere tipos
5. ✅ **Legibilidad**: Código más limpio
6. ✅ **Reutilización**: Componentes reutilizables

---

## 📝 Convenciones

### Nomenclatura
- `{Entity}Options` - Sin opción "Todos"
- `{Entity}OptionsWithAll` - Con opción "Todos"
- `{entity}s` (lowercase) - Array de datos exportado

### Valores
- **"todos"** - Valor estándar para filtro "Todos"
- **"none"** - Valor estándar para "Sin asignar" / "Ninguna"
- **"all"** - Valor legacy (usar "todos" en código nuevo)

### Props Personalizables
- `label` - Personaliza el texto mostrado

---

## 🎯 Casos de Uso Comunes

### Filtro de Estado de Actividades
```typescript
<Select value={filtroEstado} onValueChange={setFiltroEstado}>
  <SelectTrigger className={filterStyles.selectTrigger}>
    <SelectValue placeholder="Estado" />
  </SelectTrigger>
  <SelectContent>
    <ActividadEstadoOptionsWithAll />
  </SelectContent>
</Select>
```

### Asignación de Guardarrecurso con Área
```typescript
<Select value={formData.guardarecurso} onValueChange={(v) => handleFieldChange('guardarecurso', v)}>
  <SelectTrigger className={formStyles.selectTrigger}>
    <SelectValue placeholder="Seleccionar guardarrecurso" />
  </SelectTrigger>
  <SelectContent>
    <GuardarecursosOptionsWithArea />
  </SelectContent>
</Select>
```

### Selección de Prioridad en Formulario
```typescript
<Select value={formData.prioridad} onValueChange={(v) => setFormData({...formData, prioridad: v})}>
  <SelectTrigger className={formStyles.selectTrigger}>
    <SelectValue placeholder="Seleccionar prioridad" />
  </SelectTrigger>
  <SelectContent>
    <PrioridadOptions />
  </SelectContent>
</Select>
```

### Filtro de Área Protegida
```typescript
<Select value={filtroArea} onValueChange={setFiltroArea}>
  <SelectTrigger className={filterStyles.selectTrigger}>
    <SelectValue placeholder="Área protegida" />
  </SelectTrigger>
  <SelectContent>
    <AreasProtegidasOptionsWithAll label="Todas las zonas" />
  </SelectContent>
</Select>
```

---

## ⚙️ Actualización de Datos

Las opciones que usan `mock-data.ts` se actualizan automáticamente cuando se modifica el archivo:

- `AreasProtegidasOptions` → usa `areasProtegidas`
- `GuardarecursosOptions` → usa `guardarecursos`
- `DepartamentosOptions` → extrae de `areasProtegidas`
- `EcosistemasOptions` → extrae de `areasProtegidas`

---

## 🔮 Futuras Mejoras

Cuando se migre a base de datos real, se puede:

1. Crear hooks personalizados que carguen datos
2. Mantener la misma API de componentes
3. Agregar loading states
4. Implementar caché de datos

```typescript
// Ejemplo futuro con hook
export const GuardarecursosOptionsAsync = () => {
  const { data, loading } = useGuardarecursos();
  
  if (loading) return <SelectItem value="">Cargando...</SelectItem>;
  
  return (
    <>
      {data.map(g => (
        <SelectItem key={g.id} value={g.id}>
          {g.nombre} {g.apellido}
        </SelectItem>
      ))}
    </>
  );
};
```

---

## ✨ Tips

1. **Siempre importa lo que necesitas**, no importes todo el archivo
2. **Usa componentes WithAll** para filtros
3. **Usa componentes sin All** para formularios
4. **Personaliza labels** cuando sea necesario con props
5. **Verifica valores** en la documentación antes de usar

---

## 📞 Soporte

Para agregar nuevas opciones o modificar existentes, edita `/utils/selectOptions.tsx` siguiendo las convenciones establecidas.
