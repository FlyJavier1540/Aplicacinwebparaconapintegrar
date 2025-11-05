# 🏗️ Arquitectura de Servicios - CONAP

## 📋 Tabla de Contenidos

- [Introducción](#introducción)
- [Filosofía de Separación](#filosofía-de-separación)
- [Servicios Disponibles](#servicios-disponibles)
- [Patrones de Diseño](#patrones-de-diseño)
- [Guías de Uso](#guías-de-uso)
- [Mejores Prácticas](#mejores-prácticas)

---

## 🎯 Introducción

La arquitectura de servicios de CONAP sigue el principio de **Separación de Responsabilidades** (SoC - Separation of Concerns), donde la lógica de negocio está completamente separada de la capa de presentación.

### Beneficios

✅ **Mantenibilidad**: Cambios en la lógica no afectan la UI  
✅ **Testabilidad**: Servicios pueden ser probados independientemente  
✅ **Reutilización**: Lógica compartida entre múltiples componentes  
✅ **Escalabilidad**: Fácil agregar nuevas funcionalidades  
✅ **Claridad**: Código más limpio y comprensible  

---

## 🧠 Filosofía de Separación

### Arquitectura de 5 Capas

```
┌─────────────────────────────────────┐
│     1. PRESENTACIÓN (Components)    │  ← UI, Renderizado
├─────────────────────────────────────┤
│     2. LÓGICA DE NEGOCIO (Services) │  ← Cálculos, Filtros
├─────────────────────────────────────┤
│     3. ESTADO (Hooks, Context)      │  ← Gestión de Estado
├─────────────────────────────────────┤
│     4. DATOS (Types, Mock Data)     │  ← Estructuras de Datos
├─────────────────────────────────────┤
│     5. UTILIDADES (Utils)           │  ← Helpers, Formatters
└─────────────────────────────────────┘
```

### Principios SOLID Aplicados

- **S** - Single Responsibility: Cada servicio tiene un propósito único
- **O** - Open/Closed: Abierto para extensión, cerrado para modificación
- **L** - Liskov Substitution: Servicios son intercambiables
- **I** - Interface Segregation: Interfaces específicas y pequeñas
- **D** - Dependency Inversion: Depender de abstracciones, no implementaciones

---

## 📦 Servicios Disponibles

### 1. 🔐 Authentication Service

**Archivo**: `authService.ts`

**Responsabilidades**:
- Autenticación de usuarios con validación de credenciales
- Verificación de estados de usuario (Activo, Suspendido, Desactivado)
- Validación de contraseñas (longitud, coincidencia, diferencia)
- Cambio de contraseña propia
- Cambio de contraseña por administrador

**Funciones principales**:

```typescript
// Autenticación
authenticate(email, password): AuthResult

// Validación de contraseñas
validatePassword(password): PasswordValidationResult
validatePasswordMatch(password, confirmPassword): PasswordValidationResult
validatePasswordDifferent(currentPassword, newPassword): PasswordValidationResult
verifyCurrentPassword(userId, currentPassword): PasswordValidationResult

// Cambio de contraseñas
changeOwnPassword(userId, currentPassword, newPassword, confirmPassword): PasswordChangeResult
changeUserPasswordByAdmin(adminUserId, targetUserId, newPassword, confirmPassword): PasswordChangeResult

// Utilidades
getUserById(userId): Usuario | null
getUserByEmail(email): Usuario | null
isUserActive(userId): boolean
getUserStatus(userId): string | null
```

**Ejemplo de uso**:

```typescript
import { authService } from '../utils/authService';

// Autenticación en Login.tsx
const handleSubmit = (email, password) => {
  const result = authService.authenticate(email, password);
  
  if (result.success) {
    onLogin(result.user);
  } else {
    setError(result.error); // "Su cuenta ha sido suspendida..."
  }
};

// Cambio de contraseña propia
const handleChangePassword = (userId, currentPw, newPw, confirmPw) => {
  const result = authService.changeOwnPassword(userId, currentPw, newPw, confirmPw);
  
  if (result.success) {
    toast.success('Contraseña actualizada');
  } else {
    setError(result.error); // "La contraseña actual es incorrecta"
  }
};

// Cambio de contraseña por admin
const handleAdminChangePassword = (targetUserId, newPw, confirmPw) => {
  const result = authService.changeUserPasswordByAdmin(
    currentUser.id, 
    targetUserId, 
    newPw, 
    confirmPw
  );
  
  // El servicio valida automáticamente que:
  // - El admin sea realmente Administrador
  // - No se pueda cambiar contraseña de otro Administrador
  // - La nueva contraseña cumpla requisitos
};
```

**Patrones aplicados**:
- **Validation Pattern**: Validaciones separadas y reutilizables
- **Result Object Pattern**: Retorna objetos con success/error
- **Security Pattern**: Validaciones de permisos antes de ejecutar acciones

---

### 2. 📊 Reporte de Actividades Service

**Archivo**: `reporteActividadesService.ts`

**Responsabilidades**:
- Obtención de actividades completadas de guardarecursos
- Agrupación de actividades por tipo y mes
- Generación de PDF de reporte mensual completo
- Cálculo de estadísticas y totales
- Mapeo de tipos de actividad a categorías estándar

**Funciones principales**:

```typescript
// Procesamiento de datos
getActividadesGuardarecurso(guardarecursoId): Actividad[]
agruparActividadesPorTipoYMes(actividades): ActividadesAgrupadas
generarDatosTabla(datosActividades): any[][]

// Generación de PDF
generarReporteActividadesMensual(guardarecurso): ReporteResult

// Constantes
MESES: string[]
ACTIVIDAD_MAPPING: { [tipo]: número }
ACTIVIDADES_REPORTE: ActividadReporte[]
COLORES_CONAP: { verde, verdeOscuro, grisClaro }
```

**Ejemplo de uso**:

```typescript
import { reporteActividadesService } from '../utils/reporteActividadesService';

// Generar reporte mensual
const handleGenerarReporte = (guardarecurso) => {
  const result = reporteActividadesService.generarReporteActividadesMensual({
    id: '1',
    nombre: 'Carlos',
    apellido: 'Mendoza',
    areaAsignada: 'tikal'
  });
  
  if (result.success) {
    toast.success('Reporte generado', {
      description: `${result.totalActividades} actividades incluidas`
    });
    // El PDF se descarga automáticamente como:
    // Informe_Mensual_Mendoza_2024.pdf
  } else {
    toast.error('Error', { description: result.error });
  }
};

// El servicio automáticamente:
// 1. Obtiene actividades completadas del guardarecurso
// 2. Las agrupa por tipo y mes (según ACTIVIDAD_MAPPING)
// 3. Genera una tabla de 13 filas x 12 columnas (actividades x meses)
// 4. Crea PDF con formato CONAP oficial
// 5. Incluye encabezado, información del guardarecurso y totales
```

**Estructura del PDF generado**:
- Encabezado con logo CONAP
- Información del guardarecurso y área asignada
- Tabla de 13 actividades estándar x 12 meses
- Total de actividades completadas
- Fecha y hora de generación

**Patrones aplicados**:
- **Data Aggregation**: Agrupación inteligente de datos
- **PDF Generation Pattern**: Generación modular de documentos
- **Constants Management**: Centralización de configuración
- **Result Object Pattern**: Retorna success/error con detalles

---

### 3. 📊 Dashboard Service

**Archivo**: `dashboardService.ts`

**Responsabilidades**:
- Cálculo de estadísticas del dashboard
- Filtrado de áreas según roles de usuario
- Generación de configuración de tarjetas
- Validaciones de acceso

**Funciones principales**:

```typescript
// Filtrar áreas por rol
filterAreasByRole(areas, guardarecursos, currentUser): AreaProtegida[]

// Calcular estadísticas
calculateDashboardStats(areas, guardarecursos, actividades): DashboardEstadisticas

// Construir tarjetas
buildEstadisticasCards(estadisticas): EstadisticaCard[]

// Verificar rol
isGuardarecursoRole(currentUser): boolean

// Verificar asignación
hasAssignedAreas(areas): boolean

// Obtener título
getMapTitle(isGuardarecurso): string
```

**Ejemplo de uso**:

```typescript
import { dashboardService } from '../utils/dashboardService';

// En el componente Dashboard.tsx
export function Dashboard({ currentUser }: DashboardProps) {
  // Toda la lógica delegada al servicio
  const isGuardarecurso = dashboardService.isGuardarecursoRole(currentUser);
  const areasToShow = dashboardService.filterAreasByRole(areas, guardarecursos, currentUser);
  const estadisticas = dashboardService.calculateDashboardStats(areas, guardarecursos, actividades);
  const cards = dashboardService.buildEstadisticasCards(estadisticas);
  
  // Componente solo se encarga del renderizado
  return (
    <div>
      {cards.map(card => <StatCard {...card} />)}
    </div>
  );
}
```

**Tipos**:

```typescript
interface DashboardEstadisticas {
  totalAreas: number;
  totalGuardarecursos: number;
  totalActividades: number;
  actividadesHoy: number;
}

interface EstadisticaCard {
  title: string;
  value: number;
  gradient: string;
  iconColor: string;
  textColor: string;
  border: string;
  section: string;
}

interface CurrentUser {
  id: string;
  rol: 'Administrador' | 'Coordinador' | 'Guardarecurso';
  nombre?: string;
  apellido?: string;
  email?: string;
}
```

---

### 2. 👤 Guardarecursos Service

**Archivo**: `guardarecursosService.ts`

**Responsabilidades**:
- Filtrado y búsqueda de guardarecursos
- CRUD de guardarecursos y usuarios asociados
- Gestión de estados del ciclo de vida
- Validación de permisos
- Transformación entre modelos y formularios

**Funciones principales**:

```typescript
// Filtrado
filterGuardarecursos(guardarecursos, usuarios, searchTerm, selectedArea): Guardarecurso[]

// Creación
createGuardarecurso(formData): Guardarecurso
createUsuarioForGuardarecurso(formData, id): Usuario

// Actualización
updateGuardarecurso(guardarecurso, formData): Guardarecurso
updateUsuarioForGuardarecurso(usuario, formData): Usuario

// Estados
isValidEstadoChange(estadoActual, nuevoEstado): boolean
updateEstado(guardarecurso, nuevoEstado): Guardarecurso
updateUsuarioEstado(usuario, nuevoEstado): Usuario
getEstadoMensaje(nuevoEstado): string
prepareEstadoPendiente(guardarecurso, nuevoEstado): EstadoPendiente

// Permisos
canChangePassword(currentUser): boolean

// Utilidades
getAssociatedUser(guardarecurso, usuarios): Usuario | undefined
createEmptyFormData(): GuardarecursoFormData
guardarecursoToFormData(guardarecurso): GuardarecursoFormData
```

**Ejemplo de uso**:

```typescript
import { guardarecursosService } from '../utils/guardarecursosService';

// En el componente RegistroGuardarecursos.tsx
export function RegistroGuardarecursos({ currentUser }: Props) {
  // Filtrado delegado al servicio
  const filteredGuardarecursos = guardarecursosService.filterGuardarecursos(
    guardarecursosList,
    usuarios,
    searchTerm,
    selectedArea
  );
  
  // Creación usando el servicio
  const handleSubmit = (formData) => {
    const nuevo = guardarecursosService.createGuardarecurso(formData);
    const usuario = guardarecursosService.createUsuarioForGuardarecurso(formData, nuevo.id);
    // ...
  };
  
  // Actualización de estado
  const handleCambiarEstado = (guardarecurso, nuevoEstado) => {
    if (!guardarecursosService.isValidEstadoChange(guardarecurso.estado, nuevoEstado)) {
      toast.info('Sin cambios');
      return;
    }
    const actualizado = guardarecursosService.updateEstado(guardarecurso, nuevoEstado);
    // ...
  };
  
  // Componente solo se encarga del renderizado
  return (
    <div>
      {filteredGuardarecursos.map(g => <GuardarecursoCard {...g} />)}
    </div>
  );
}
```

**Tipos**:

```typescript
interface GuardarecursoFormData {
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  email: string;
  password: string;
  areaAsignada: string;
  estado: 'Activo' | 'Suspendido' | 'Desactivado';
}

interface EstadoPendiente {
  id: string;
  nuevoEstado: 'Activo' | 'Suspendido' | 'Desactivado';
  nombre: string;
}
```

**Patrones aplicados**:
- **Data Transformation**: Conversión entre Guardarecurso y GuardarecursoFormData
- **Validation**: Validación de cambios de estado antes de aplicarlos
- **Factory Pattern**: Creación de objetos con valores predeterminados
- **Pure Functions**: Funciones sin efectos secundarios

---

### 3. 🌳 Áreas Protegidas Service

**Archivo**: `areasProtegidasService.ts`

**Responsabilidades**:
- Filtrado y búsqueda de áreas protegidas
- CRUD de áreas protegidas
- Gestión de estados (Activo/Desactivado)
- Validación de desactivación (verifica guardarecursos)
- Cálculos geográficos y coordenadas SVG
- Gestión de constantes (departamentos, ecosistemas)

**Funciones principales**:

```typescript
// Filtrado
filterAreasProtegidas(areas, searchTerm, selectedDepartamento): AreaProtegida[]

// Creación y actualización
createAreaProtegida(formData): AreaProtegida
updateAreaProtegida(area, formData): AreaProtegida

// Estados
isValidEstadoChange(estadoActual, nuevoEstado): boolean
toggleEstado(estadoActual): 'Activo' | 'Desactivado'
updateEstado(area, nuevoEstado): AreaProtegida
getEstadoMensaje(nuevoEstado): string
prepareEstadoPendiente(area, nuevoEstado): AreaEstadoPendiente

// Validación
validateAreaDeactivation(area, guardarecursos): ValidationResult

// Cálculos de mapa
calculateSVGCoordinates(coordenadas): { x, y }
calculateCenteredViewBox(area): string
getDefaultViewBox(): string

// Utilidades
getGuardarecursosCount(area, guardarecursos): number
createEmptyFormData(): AreaProtegidaFormData
areaToFormData(area): AreaProtegidaFormData

// Constantes
departamentos: DEPARTAMENTOS_GUATEMALA
ecosistemas: ECOSISTEMAS_GUATEMALA
```

**Ejemplo de uso**:

```typescript
import { areasProtegidasService } from '../utils/areasProtegidasService';

// En el componente AsignacionZonas.tsx
export function AsignacionZonas() {
  // Usar constantes del servicio
  const departamentos = areasProtegidasService.departamentos;
  const ecosistemas = areasProtegidasService.ecosistemas;
  
  // Filtrado usando el servicio
  const filteredAreas = useMemo(() => {
    return areasProtegidasService.filterAreasProtegidas(
      areasList,
      searchTerm,
      selectedDepartamento
    );
  }, [areasList, searchTerm, selectedDepartamento]);
  
  // Validar antes de desactivar
  const handleEstadoClick = (area) => {
    const nuevoEstado = areasProtegidasService.toggleEstado(area.estado);
    
    if (nuevoEstado === 'Desactivado') {
      const validation = areasProtegidasService.validateAreaDeactivation(
        area, 
        guardarecursos
      );
      
      if (!validation.isValid) {
        toast.error(validation.message);
        return;
      }
    }
    // ...
  };
  
  // En el componente MapaAreasProtegidas.tsx
  const viewBox = areasProtegidasService.calculateCenteredViewBox(area);
  const { x, y } = areasProtegidasService.calculateSVGCoordinates(area.coordenadas);
  
  return (
    <svg viewBox={viewBox}>
      <circle cx={x} cy={y} r={10} />
    </svg>
  );
}
```

**Tipos**:

```typescript
interface AreaProtegidaFormData {
  nombre: string;
  departamento: string;
  extension: number;
  fechaCreacion: string;
  coordenadas: { lat: number; lng: number };
  descripcion: string;
  ecosistemas: string[];
}

interface AreaEstadoPendiente {
  id: string;
  nuevoEstado: 'Activo' | 'Desactivado';
  nombre: string;
}

interface ValidationResult {
  isValid: boolean;
  message?: string;
  guardarecursosAsignados?: number;
}
```

**Patrones aplicados**:
- **Validation Pattern**: Validación de desactivación antes de aplicar cambios
- **Data Transformation**: Conversión entre AreaProtegida y AreaProtegidaFormData
- **Constants Management**: Centralización de departamentos y ecosistemas
- **Pure Functions**: Cálculos de coordenadas sin efectos secundarios
- **Factory Pattern**: Creación de objetos con valores predeterminados

---

### 4. 📦 Equipos Service

**Archivo**: `equiposService.ts`

**Responsabilidades**:
- Filtrado de equipos por rol y búsqueda
- CRUD de equipos
- Gestión de estados (Operativo, En Reparación, Desactivado)
- Desasignación automática al cambiar a "En Reparación"
- Inferencia inteligente de tipo de equipo
- Estadísticas y conteo de equipos
- Validación de códigos duplicados

**Funciones principales**:

```typescript
// Filtrado
filterEquipos(equipos, searchTerm, currentUser, guardarecursos): Equipo[]

// Creación y actualización
createEquipo(formData): Equipo
updateEquipo(equipo, formData): Equipo
updateEstado(equipo, nuevoEstado): Equipo  // Desasigna si va a reparación

// Estilos y UI
getEstadoBadgeClass(estado): string
getEstadoIcon(estado): string
getEstadoColor(estado): string

// Inferencia inteligente
inferTipoEquipo(nombre): 'GPS' | 'Radio' | 'Binoculares' | 'Cámara' | 'Vehículo' | 'Herramienta' | 'Otro'

// Transformación de datos
createEmptyFormData(): EquipoFormData
equipoToFormData(equipo): EquipoFormData

// Validación y verificación
isGuardarecurso(currentUser): boolean
getGuardarecursoId(currentUser, guardarecursos): string | undefined
codigoExists(codigo, equipos, excludeId?): boolean

// Estadísticas
countEquiposByEstado(equipos): Record<EstadoEquipo, number>
countEquiposByGuardarecurso(guardarecursoId, equipos): number
getEquiposByGuardarecurso(guardarecursoId, equipos): Equipo[]

// Utilidades
getAllEstados(): EstadoEquipo[]

// Constantes
ESTADOS_CONFIG: { [estado]: { label, badgeClass, icon, color } }
```

**Ejemplo de uso**:

```typescript
import { equiposService } from '../utils/equiposService';

// En el componente ControlEquipos.tsx
export function ControlEquipos({ currentUser }) {
  // Verificar rol usando el servicio
  const isGuardarecurso = equiposService.isGuardarecurso(currentUser);
  
  // Filtrado usando el servicio (lógica diferente según rol)
  const filteredEquipos = useMemo(() => {
    return equiposService.filterEquipos(
      equiposList,
      searchTerm,
      currentUser,
      guardarecursos
    );
  }, [equiposList, searchTerm, currentUser]);
  
  // Crear equipo (tipo inferido automáticamente)
  const handleCreate = (formData) => {
    const nuevoEquipo = equiposService.createEquipo(formData);
    // Si formData.nombre === "GPS Garmin", nuevoEquipo.tipo === 'GPS'
    setEquiposList(prev => [...prev, nuevoEquipo]);
  };
  
  // Actualizar estado con desasignación automática
  const handleEstadoChange = (equipo, nuevoEstado) => {
    const actualizado = equiposService.updateEstado(equipo, nuevoEstado);
    // Si nuevoEstado === 'En Reparación'
    // actualizado.guardarecursoAsignado === undefined
    setEquiposList(prev => prev.map(e => 
      e.id === equipo.id ? actualizado : e
    ));
  };
  
  // Usar estilos del servicio
  const badgeClass = equiposService.getEstadoBadgeClass(equipo.estado);
  const iconName = equiposService.getEstadoIcon(equipo.estado);
  
  // Validar código duplicado
  const handleSubmit = (formData) => {
    if (equiposService.codigoExists(formData.codigo, equiposList, editingEquipo?.id)) {
      toast.error('El código de inventario ya existe');
      return;
    }
    // ...
  };
  
  // Estadísticas
  const stats = equiposService.countEquiposByEstado(equiposList);
  // { Operativo: 15, 'En Reparación': 3, Desactivado: 2 }
}
```

**Tipos**:

```typescript
interface EquipoFormData {
  nombre: string;
  codigo: string;
  marca: string;
  modelo: string;
  observaciones: string;
  guardarecursoAsignado: string;
}

interface CurrentUser {
  id: string;
  rol: string;
  nombre: string;
  apellido: string;
  email?: string;
}

type EstadoEquipo = 'Operativo' | 'En Reparación' | 'Desactivado';
```

**Patrones aplicados**:
- **Smart Filtering**: Filtrado diferente según rol del usuario
- **Auto-Assignment Logic**: Desasignación automática al cambiar a reparación
- **Type Inference**: Inferencia automática de tipo basada en nombre
- **Configuration Object**: ESTADOS_CONFIG centraliza toda la configuración de estados
- **Data Transformation**: Conversión entre Equipo y EquipoFormData
- **Validation Pattern**: Validación de códigos duplicados

**Lógica especial**:
1. **Filtrado por rol**:
   - Guardarecurso: Solo ve sus equipos asignados
   - Otros roles: Ven todos los equipos (excepto desactivados)

2. **Desasignación automática**:
   - Al cambiar estado a "En Reparación", se desasigna automáticamente
   - Evita que un guardarecurso tenga equipos en reparación asignados

3. **Inferencia de tipo**:
   - Analiza palabras clave en el nombre para determinar el tipo
   - Ejemplos: "GPS Garmin" → GPS, "Radio Motorola" → Radio

---

### 5. 📅 Actividades Service

**Archivo**: `actividadesService.ts`

**Responsabilidades**:
- Filtrado de actividades programadas
- CRUD de actividades
- **Carga masiva desde CSV** con validación robusta
- Generación de plantilla CSV para descarga
- Validación y formateo de fechas en múltiples formatos
- Configuración de tipos y estados de actividades
- Estilos y colores por tipo

**Funciones principales**:

```typescript
// Filtrado (solo actividades programadas)
filterActividadesProgramadas(actividades, searchTerm, tipo, guardarecurso): Actividad[]

// Creación y actualización
createActividad(formData): Actividad  // Siempre estado "Programada"
updateActividad(actividad, formData): Partial<Actividad>

// Estilos y UI
getTipoColor(tipo): { bg, text, badge, icon, color }
getTipoIcon(tipo): string
getEstadoBadgeClass(estado): string
getEstadoIcon(estado): string
getEstadoInfo(estado): { icon, color, bg, badge }

// Transformación de datos
createEmptyFormData(): ActividadFormData
actividadToFormData(actividad): ActividadFormData

// Utilidades
getAllTipos(): TipoActividad[]
getAllEstados(): EstadoActividad[]

// CARGA MASIVA (CSV) ⭐
validarYFormatearFecha(fechaStr): string | null  // Acepta YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY
generateTemplateCSV(): string  // Genera CSV con ejemplos
processBulkUploadCSV(csvText, guardarecursoId): BulkUploadResult
generateBulkUploadSummary(result): string

// Constantes
TIPOS_CONFIG: { [tipo]: { bg, text, badge, icon, color } }
ESTADOS_CONFIG: { [estado]: { label, badgeClass, icon, color, bg } }
```

**Ejemplo de uso**:

```typescript
import { actividadesService } from '../utils/actividadesService';

// En el componente PlanificacionActividades.tsx
export function PlanificacionActividades() {
  // Filtrado usando el servicio (solo muestra "Programadas")
  const filteredActividades = useMemo(() => {
    return actividadesService.filterActividadesProgramadas(
      actividadesList,
      searchTerm,
      selectedTipo,
      selectedGuardarecurso
    );
  }, [actividadesList, searchTerm, selectedTipo, selectedGuardarecurso]);
  
  // Crear actividad (siempre como "Programada")
  const handleCreate = (formData) => {
    const nuevaActividad = actividadesService.createActividad(formData);
    // nuevaActividad.estado === 'Programada'
    actividadesSync.addActividad(nuevaActividad);
  };
  
  // Descargar plantilla CSV
  const handleDownloadTemplate = () => {
    const csvContent = actividadesService.generateTemplateCSV();
    // csvContent incluye headers y 2 ejemplos + 3 filas vacías
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    // Descargar archivo...
  };
  
  // Procesar carga masiva
  const handleBulkUpload = (csvText, guardarecursoId) => {
    const result = actividadesService.processBulkUploadCSV(csvText, guardarecursoId);
    
    // result = {
    //   actividadesCargadas: 10,
    //   actividadesConError: 2,
    //   errores: ['Línea 3: Fecha inválida "invalid"', ...],
    //   actividades: [...]
    // }
    
    // Agregar actividades creadas
    result.actividades.forEach(act => actividadesSync.addActividad(act));
    
    // Mostrar resumen
    const mensaje = actividadesService.generateBulkUploadSummary(result);
    // '✓ 10 actividades cargadas exitosamente\n\n⚠ 2 actividades con errores:...'
    alert(mensaje);
    
    // Errores en consola
    if (result.errores.length > 0) {
      console.group('❌ Errores en la carga masiva:');
      result.errores.forEach(error => console.error(error));
      console.groupEnd();
    }
  };
  
  // Validar fechas en múltiples formatos
  const fecha1 = actividadesService.validarYFormatearFecha('2025-11-15'); // '2025-11-15'
  const fecha2 = actividadesService.validarYFormatearFecha('15/11/2025'); // '2025-11-15'
  const fecha3 = actividadesService.validarYFormatearFecha('11/15/2025'); // '2025-11-15'
  const fecha4 = actividadesService.validarYFormatearFecha('invalid'); // null
  
  // Usar estilos del servicio
  const colors = actividadesService.getTipoColor('Patrullaje de Control y Vigilancia');
  // colors = {
  //   bg: 'bg-gradient-to-br from-blue-100 to-cyan-100...',
  //   text: 'text-blue-700 dark:text-blue-300',
  //   badge: '...',
  //   icon: 'Binoculars',
  //   color: '#3b82f6'
  // }
}
```

**Tipos**:

```typescript
interface ActividadFormData {
  codigo: string;
  titulo: string;
  tipo: string;
  descripcion: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  ubicacion: string;
  coordenadas: { lat: number; lng: number };
  guardarecurso: string;
  observaciones: string;
}

type TipoActividad = 
  | 'Patrullaje de Control y Vigilancia'
  | 'Actividades de Prevención y Atención de Incendios Forestales'
  | 'Mantenimiento de Área Protegida'
  | 'Reforestación de Área Protegida'
  | 'Mantenimiento de Reforestación';

type EstadoActividad = 'Programada' | 'En Progreso' | 'Completada';

interface BulkUploadResult {
  actividadesCargadas: number;
  actividadesConError: number;
  errores: string[];
  actividades: Actividad[];
}
```

**Patrones aplicados**:
- **Smart Filtering**: Filtrado específico para actividades programadas
- **Factory Pattern**: Creación de actividades con valores predeterminados
- **Configuration Object**: TIPOS_CONFIG y ESTADOS_CONFIG centralizan configuración
- **Data Transformation**: Conversión entre Actividad y ActividadFormData
- **Bulk Operations**: Procesamiento masivo con validación y reporte de errores
- **Flexible Date Parsing**: Validación de fechas en múltiples formatos

**Lógica especial de carga masiva CSV**:

1. **Generación de plantilla**:
   - Headers con campos necesarios
   - 2 ejemplos completos con fechas futuras (hoy+7 días, hoy+14 días)
   - 3 filas vacías para facilitar llenado
   - Descarga directa como archivo CSV

2. **Procesamiento de CSV**:
   - Lee archivo línea por línea
   - Valida campos requeridos: codigo, titulo, fecha
   - Formatea fechas en múltiples formatos
   - Crea actividades con tipo predeterminado si falta
   - Asigna guardarecurso especificado a todas
   - Retorna resultado con éxitos y errores

3. **Validación de fechas flexible**:
   ```typescript
   // Acepta múltiples formatos
   '2025-11-15'     → '2025-11-15' ✓
   '15/11/2025'     → '2025-11-15' ✓
   '11/15/2025'     → '2025-11-15' ✓
   'invalid'        → null ✗
   ```

4. **Reporte de errores detallado**:
   - Indica línea exacta del error
   - Incluye código de actividad si existe
   - Especifica qué campo falta o es inválido
   - Muestra primeros 5 errores en alert
   - Todos los errores en consola

**Ejemplo de flujo completo de carga masiva**:

```typescript
// 1. Descargar plantilla
handleDownloadTemplate();
// Usuario recibe: plantilla_actividades_conap.csv

// 2. Usuario llena el CSV con 10 actividades

// 3. Subir archivo
const file = event.target.files[0];
const reader = new FileReader();
reader.onload = (e) => {
  const csvText = e.target.result;
  
  // 4. Procesar CSV
  const result = actividadesService.processBulkUploadCSV(csvText, '1');
  // result.actividadesCargadas: 8
  // result.actividadesConError: 2
  // result.errores: [
  //   'Línea 3 (ACT-003): Fecha inválida "32/11/2025"',
  //   'Línea 7: Falta título'
  // ]
  
  // 5. Agregar actividades exitosas
  result.actividades.forEach(act => actividadesSync.addActividad(act));
  
  // 6. Mostrar resumen
  const mensaje = actividadesService.generateBulkUploadSummary(result);
  alert(mensaje);
  // '✓ 8 actividades cargadas exitosamente
  //
  //  ⚠ 2 actividades con errores:
  //
  //  Línea 3 (ACT-003): Fecha inválida "32/11/2025"...
  //  Línea 7: Falta título'
};
```

---

### 6. 🔄 Actividades Sync Service

**Archivo**: `actividadesSync.ts`

**Responsabilidades**:
- Sincronización de actividades entre módulos
- Persistencia en localStorage
- CRUD completo de actividades
- Notificación de cambios (patrón Observer)

**Funciones principales**:

```typescript
// Obtener actividades
getActividades(): Actividad[]

// Agregar actividad
addActividad(actividad): void

// Actualizar actividad
updateActividad(id, updates): void

// Eliminar actividad
deleteActividad(id): void

// Suscribirse a cambios
subscribe(callback): UnsubscribeFn
```

**Ejemplo de uso**:

```typescript
import { actividadesSync } from '../utils/actividadesSync';

// Suscribirse a cambios
useEffect(() => {
  const unsubscribe = actividadesSync.subscribe((actividades) => {
    setActividadesList(actividades);
  });
  return unsubscribe;
}, []);

// Agregar actividad
const handleAdd = (nuevaActividad) => {
  actividadesSync.addActividad(nuevaActividad);
  // No necesitas actualizar el estado manualmente,
  // la suscripción lo hará automáticamente
};
```

---

## 🎨 Patrones de Diseño

### 1. Service Pattern

Encapsula lógica de negocio en servicios reutilizables.

```typescript
// ❌ ANTES: Lógica en el componente
export function Dashboard() {
  const isGuardarecurso = currentUser?.rol === 'Guardarecurso';
  const areasToShow = isGuardarecurso 
    ? areasProtegidas.filter(area => {
        const guardarecursoData = guardarecursos.find(g => g.id === currentUser?.id);
        return guardarecursoData?.areaAsignada === area.id && area.estado === 'Activo';
      })
    : areasProtegidas.filter(area => area.estado === 'Activo');
  
  // ... más lógica compleja
}

// ✅ DESPUÉS: Lógica en el servicio
export function Dashboard() {
  const isGuardarecurso = dashboardService.isGuardarecursoRole(currentUser);
  const areasToShow = dashboardService.filterAreasByRole(areas, guardarecursos, currentUser);
  
  // Componente limpio, solo renderizado
}
```

### 2. Observer Pattern

Notificación automática de cambios (usado en `actividadesSync`).

```typescript
// Servicio mantiene lista de observadores
const observers: Array<(data: T) => void> = [];

function subscribe(callback: (data: T) => void) {
  observers.push(callback);
  return () => {
    const index = observers.indexOf(callback);
    observers.splice(index, 1);
  };
}

function notify() {
  observers.forEach(callback => callback(data));
}
```

### 3. Singleton Pattern

Una única instancia del servicio compartida globalmente.

```typescript
// dashboardService es un singleton
export const dashboardService = {
  filterAreasByRole,
  calculateDashboardStats,
  // ...
};
```

---

## 📖 Guías de Uso

### Cuándo Crear un Servicio

✅ **SÍ crear servicio cuando**:
- La lógica se repite en múltiples componentes
- Los cálculos son complejos y no relacionados con UI
- Necesitas testear la lógica independientemente
- La lógica de negocio puede cambiar frecuentemente
- Hay transformación/filtrado de datos

❌ **NO crear servicio cuando**:
- Es lógica específica de un solo componente
- Solo maneja estado local del UI
- Es manipulación directa del DOM
- Es configuración de estilos/animaciones

### Estructura de un Servicio

```typescript
/**
 * 📦 [Nombre] Service
 * 
 * Descripción breve del propósito del servicio
 * 
 * @module utils/[nombre]Service
 */

// 1. Importaciones
import { Type1, Type2 } from '../types';

// 2. Interfaces y Tipos
export interface ServiceData {
  // ...
}

// 3. Funciones privadas (helpers internos)
function helperFunction() {
  // ...
}

// 4. Funciones públicas (API del servicio)
/**
 * Descripción de la función
 * 
 * @param param1 - Descripción
 * @returns Descripción del retorno
 * 
 * @example
 * const result = functionName(param1);
 */
export function functionName(param1: Type1): ReturnType {
  // Implementación
}

// 5. Objeto servicio (opcional, para agrupar)
export const serviceName = {
  functionName,
  // ...
};

// 6. Export por defecto (opcional)
export default serviceName;
```

### Testing de Servicios

```typescript
// dashboard.service.test.ts
import { dashboardService } from './dashboardService';

describe('dashboardService', () => {
  describe('calculateDashboardStats', () => {
    it('should calculate correct statistics', () => {
      const areas = [
        { id: '1', estado: 'Activo' },
        { id: '2', estado: 'Inactivo' },
      ];
      const guardarecursos = [
        { id: '1', estado: 'Activo' },
      ];
      const actividades = [
        { id: '1', fecha: '2024-11-03' },
      ];
      
      const stats = dashboardService.calculateDashboardStats(
        areas,
        guardarecursos,
        actividades
      );
      
      expect(stats.totalAreas).toBe(1);
      expect(stats.totalGuardarecursos).toBe(1);
      expect(stats.totalActividades).toBe(1);
    });
  });
});
```

---

## 🎯 Mejores Prácticas

### 1. Funciones Puras

✅ **Hacer**:
```typescript
// Función pura: mismo input = mismo output
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

❌ **Evitar**:
```typescript
// Impuro: depende de estado externo
let discount = 0.1;
export function calculateTotal(items: Item[]): number {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return total * (1 - discount); // Depende de variable externa
}
```

### 2. Tipos Estrictos

✅ **Hacer**:
```typescript
export function filterByRole(
  items: Item[],
  role: 'admin' | 'user'
): Item[] {
  // TypeScript previene errores
}
```

❌ **Evitar**:
```typescript
export function filterByRole(items: any, role: any): any {
  // Sin type safety
}
```

### 3. Documentación Clara

✅ **Hacer**:
```typescript
/**
 * Filtra actividades por fecha y estado
 * 
 * @param actividades - Lista de actividades a filtrar
 * @param fecha - Fecha en formato ISO (YYYY-MM-DD)
 * @param estado - Estado deseado ('Programada' | 'Completada')
 * @returns Array de actividades filtradas
 * 
 * @example
 * const actividadesHoy = filterActividades(
 *   actividades, 
 *   '2024-11-03', 
 *   'Completada'
 * );
 */
export function filterActividades(
  actividades: Actividad[],
  fecha: string,
  estado: ActividadEstado
): Actividad[] {
  // ...
}
```

### 4. Manejo de Errores

✅ **Hacer**:
```typescript
export function processData(data: unknown): Result {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format');
  }
  
  try {
    // Procesamiento
    return result;
  } catch (error) {
    console.error('Error processing data:', error);
    throw new Error('Failed to process data');
  }
}
```

### 5. Inmutabilidad

✅ **Hacer**:
```typescript
export function addItem(items: Item[], newItem: Item): Item[] {
  // Retorna nuevo array
  return [...items, newItem];
}
```

❌ **Evitar**:
```typescript
export function addItem(items: Item[], newItem: Item): Item[] {
  // Muta el array original
  items.push(newItem);
  return items;
}
```

---

## 🚀 Roadmap de Servicios

### Servicios Implementados

- [x] **dashboardService**: Lógica del dashboard principal
- [x] **guardarecursosService**: Gestión de guardarecursos
- [x] **areasProtegidasService**: Gestión de áreas protegidas
- [x] **equiposService**: Control de equipos
- [x] **actividadesService**: Planificación de actividades (incluye carga masiva CSV)
- [x] **actividadesSync**: Sincronización de actividades

### Servicios Futuros Planificados

- [ ] **reportesService**: Lógica de generación de reportes
- [ ] **incidentesService**: Gestión de incidentes
- [ ] **hallazgosService**: Gestión de hallazgos
- [ ] **permissionsService**: Lógica avanzada de permisos
- [ ] **notificationsService**: Sistema de notificaciones
- [ ] **exportService**: Exportación de datos (PDF, Excel)

### Criterios para Nuevos Servicios

1. **Complejidad**: Lógica compleja que merece separación
2. **Reutilización**: Usado en 2+ componentes
3. **Testabilidad**: Necesita ser probado independientemente
4. **Mantenibilidad**: Lógica que cambia frecuentemente
5. **Claridad**: Mejora la legibilidad del código

---

## 📚 Referencias

### Documentación Relacionada

- [utils/README.md](./README.md) - Índice general de utilidades
- [styles/shared-styles.ts](../styles/shared-styles.ts) - Sistema de estilos
- [types/index.ts](../types/index.ts) - Definiciones de tipos

### Recursos Externos

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Service Pattern](https://martinfowler.com/eaaCatalog/serviceLayer.html)

---

## 🎉 Conclusión

La arquitectura de servicios permite:

✨ **Código más limpio y mantenible**  
✨ **Separación clara de responsabilidades**  
✨ **Mayor testabilidad**  
✨ **Reutilización efectiva**  
✨ **Escalabilidad a largo plazo**  

**¡Usa servicios para mantener tu código profesional y escalable!** 🚀
