/**
 * Opciones centralizadas para componentes Select
 * Mantiene consistencia en todas las listas desplegables de la aplicación
 */

import { SelectItem } from '../components/ui/select';
import { guardarecursos, areasProtegidas } from '../data/mock-data';
import { ESTADOS_ACTIVIDAD, ESTADOS_INCIDENTE, NIVELES_GRAVEDAD, NIVELES_PRIORIDAD, TIPOS_ACTIVIDAD } from './constants';

// ============================================================================
// HELPER FUNCTIONS - Renderizado de opciones
// ============================================================================

/**
 * Renderiza una opción "Todos" genérica
 */
export const RenderAllOption = ({ label = 'Todos' }: { label?: string }) => (
  <SelectItem value="todos">{label}</SelectItem>
);

/**
 * Renderiza opciones desde un array de strings
 */
export const RenderStringOptions = ({ options }: { options: readonly string[] | string[] }) => (
  <>
    {options.map(option => (
      <SelectItem key={option} value={option}>
        {option}
      </SelectItem>
    ))}
  </>
);

// ============================================================================
// ESTADOS - Opciones de estados
// ============================================================================

/**
 * Opciones de estados de actividades
 */
export const ActividadEstadoOptions = () => (
  <>
    <SelectItem value="Programada">Programada</SelectItem>
    <SelectItem value="En Progreso">En Progreso</SelectItem>
    <SelectItem value="Completada">Completada</SelectItem>
    <SelectItem value="Cancelada">Cancelada</SelectItem>
  </>
);

/**
 * Opciones de estados de actividades con "Todos"
 */
export const ActividadEstadoOptionsWithAll = () => (
  <>
    <SelectItem value="todos">Todos los estados</SelectItem>
    <ActividadEstadoOptions />
  </>
);

/**
 * Opciones de estados de incidentes/hallazgos
 */
export const IncidenteEstadoOptions = () => (
  <>
    <SelectItem value="Reportado">Reportado</SelectItem>
    <SelectItem value="En Atención">En Atención</SelectItem>
    <SelectItem value="En Investigación">En Investigación</SelectItem>
    <SelectItem value="En Proceso">En Proceso</SelectItem>
    <SelectItem value="Escalado">Escalado</SelectItem>
    <SelectItem value="Resuelto">Resuelto</SelectItem>
  </>
);

/**
 * Opciones de estados de incidentes con "Todos"
 */
export const IncidenteEstadoOptionsWithAll = () => (
  <>
    <SelectItem value="todos">Todos los estados</SelectItem>
    <IncidenteEstadoOptions />
  </>
);

/**
 * Opciones de estados de equipos
 */
export const EquipoEstadoOptions = () => (
  <>
    <SelectItem value="Operativo">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        Operativo
      </div>
    </SelectItem>
    <SelectItem value="En Reparación">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
        En Reparación
      </div>
    </SelectItem>
    <SelectItem value="Deshabilitado">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500"></div>
        Deshabilitado
      </div>
    </SelectItem>
  </>
);

/**
 * Opciones de estados de equipos con "Todos"
 */
export const EquipoEstadoOptionsWithAll = () => (
  <>
    <SelectItem value="todos">Todos los estados</SelectItem>
    <EquipoEstadoOptions />
  </>
);

/**
 * Opciones de estados de guardarecursos
 */
export const GuardarecursoEstadoOptions = () => (
  <>
    <SelectItem value="Activo">Activo</SelectItem>
    <SelectItem value="Suspendido">Suspendido</SelectItem>
    <SelectItem value="Inactivo">Inactivo</SelectItem>
  </>
);

// ============================================================================
// NIVELES - Gravedad y Prioridad
// ============================================================================

/**
 * Opciones de niveles de gravedad
 */
export const GravedadOptions = () => (
  <>
    <SelectItem value="Leve">Leve</SelectItem>
    <SelectItem value="Moderado">Moderado</SelectItem>
    <SelectItem value="Grave">Grave</SelectItem>
    <SelectItem value="Crítico">Crítico</SelectItem>
  </>
);

/**
 * Opciones de niveles de gravedad con "Todos"
 */
export const GravedadOptionsWithAll = () => (
  <>
    <SelectItem value="todos">Todas las gravedades</SelectItem>
    <GravedadOptions />
  </>
);

/**
 * Opciones de niveles de prioridad
 */
export const PrioridadOptions = () => (
  <>
    <SelectItem value="Baja">Baja</SelectItem>
    <SelectItem value="Media">Media</SelectItem>
    <SelectItem value="Alta">Alta</SelectItem>
    <SelectItem value="Crítica">Crítica</SelectItem>
  </>
);

/**
 * Opciones de niveles de prioridad con "Todos" (orden inverso para filtros)
 */
export const PrioridadOptionsWithAll = () => (
  <>
    <SelectItem value="todos">Todas las prioridades</SelectItem>
    <SelectItem value="Crítica">Crítica</SelectItem>
    <SelectItem value="Alta">Alta</SelectItem>
    <SelectItem value="Media">Media</SelectItem>
    <SelectItem value="Baja">Baja</SelectItem>
  </>
);

// ============================================================================
// TIPOS - Tipos de actividades
// ============================================================================

/**
 * Lista de tipos de actividades disponibles
 */
export const tiposActividad = [
  'Patrullaje',
  'Patrullaje de Control y Vigilancia',
  'Control y Vigilancia',
  'Ronda',
  'Mantenimiento',
  'Mantenimiento de Área Protegida',
  'Educación Ambiental',
  'Investigación'
] as const;

/**
 * Opciones de tipos de actividades
 */
export const TipoActividadOptions = () => (
  <>
    {tiposActividad.map(tipo => (
      <SelectItem key={tipo} value={tipo}>
        {tipo}
      </SelectItem>
    ))}
  </>
);

/**
 * Opciones de tipos de actividades con "Todos"
 */
export const TipoActividadOptionsWithAll = () => (
  <>
    <SelectItem value="todos">Todos los tipos</SelectItem>
    <TipoActividadOptions />
  </>
);

// ============================================================================
// CATEGORÍAS - Categorías de equipos
// ============================================================================

/**
 * Lista de categorías de equipos disponibles
 */
export const categoriasEquipo = [
  'Comunicación',
  'Transporte',
  'Seguridad',
  'Medición',
  'Campo',
  'Tecnología'
] as const;

/**
 * Opciones de categorías de equipos
 */
export const CategoriaEquipoOptions = () => (
  <>
    {categoriasEquipo.map(categoria => (
      <SelectItem key={categoria} value={categoria}>
        {categoria}
      </SelectItem>
    ))}
  </>
);

// ============================================================================
// PERIODOS - Períodos de tiempo
// ============================================================================

/**
 * Opciones de períodos de tiempo
 */
export const PeriodoOptions = () => (
  <>
    <SelectItem value="Diario">Diario</SelectItem>
    <SelectItem value="Semanal">Semanal</SelectItem>
    <SelectItem value="Mensual">Mensual</SelectItem>
    <SelectItem value="Trimestral">Trimestral</SelectItem>
    <SelectItem value="Anual">Anual</SelectItem>
  </>
);

// ============================================================================
// DATOS DINÁMICOS - Áreas Protegidas
// ============================================================================

/**
 * Opciones de áreas protegidas (desde mock-data)
 */
export const AreasProtegidasOptions = () => (
  <>
    {areasProtegidas.map(area => (
      <SelectItem key={area.id} value={area.id}>
        {area.nombre}
      </SelectItem>
    ))}
  </>
);

/**
 * Opciones de áreas protegidas con "Todas" (filtro general)
 */
export const AreasProtegidasOptionsWithAll = ({ label = 'Todas las áreas' }: { label?: string } = {}) => (
  <>
    <SelectItem value="todos">{label}</SelectItem>
    <AreasProtegidasOptions />
  </>
);

/**
 * Opciones de áreas protegidas con "all" como valor (para filtros legacy)
 */
export const AreasProtegidasOptionsWithAllLegacy = () => (
  <>
    <SelectItem value="all">Todas las áreas</SelectItem>
    <AreasProtegidasOptions />
  </>
);

// ============================================================================
// DATOS DINÁMICOS - Guardarecursos
// ============================================================================

/**
 * Opciones de guardarecursos (desde mock-data)
 */
export const GuardarecursosOptions = () => (
  <>
    {guardarecursos.map(g => (
      <SelectItem key={g.id} value={g.id}>
        {g.nombre} {g.apellido}
      </SelectItem>
    ))}
  </>
);

/**
 * Opciones de guardarecursos con "Todos"
 */
export const GuardarecursosOptionsWithAll = ({ label = 'Todos los guardarecursos' }: { label?: string } = {}) => (
  <>
    <SelectItem value="todos">{label}</SelectItem>
    <GuardarecursosOptions />
  </>
);

/**
 * Opciones de guardarecursos con información de área asignada
 */
export const GuardarecursosOptionsWithArea = () => (
  <>
    {guardarecursos.map(g => {
      const area = areasProtegidas.find(a => a.id === g.areaAsignada);
      return (
        <SelectItem key={g.id} value={g.id}>
          {g.nombre} {g.apellido} - {area?.nombre || 'Sin área asignada'}
        </SelectItem>
      );
    })}
  </>
);

/**
 * Opción de "Sin asignar" para guardarecursos
 */
export const GuardarecursoNoneOption = ({ label = 'Sin asignar' }: { label?: string } = {}) => (
  <SelectItem value="none">{label}</SelectItem>
);

// ============================================================================
// DATOS DINÁMICOS - Departamentos
// ============================================================================

/**
 * Lista de departamentos de Guatemala extraídos de áreas protegidas
 */
export const departamentos = Array.from(new Set(areasProtegidas.map(a => a.departamento))).sort();

/**
 * Opciones de departamentos
 */
export const DepartamentosOptions = () => (
  <>
    {departamentos.map(dep => (
      <SelectItem key={dep} value={dep}>
        {dep}
      </SelectItem>
    ))}
  </>
);

/**
 * Opciones de departamentos con "Todos"
 */
export const DepartamentosOptionsWithAll = () => (
  <>
    <SelectItem value="todos">Todos los departamentos</SelectItem>
    <DepartamentosOptions />
  </>
);

// ============================================================================
// DATOS DINÁMICOS - Ecosistemas
// ============================================================================

/**
 * Lista de ecosistemas únicos extraídos de áreas protegidas
 */
export const ecosistemas = Array.from(
  new Set(areasProtegidas.flatMap(a => a.ecosistemas))
).sort();

/**
 * Opciones de ecosistemas
 */
export const EcosistemasOptions = () => (
  <>
    {ecosistemas.map(eco => (
      <SelectItem key={eco} value={eco}>
        {eco}
      </SelectItem>
    ))}
  </>
);

// ============================================================================
// HELPER FUNCTIONS AVANZADAS
// ============================================================================

/**
 * Filtra guardarecursos por área y renderiza opciones
 */
export const GuardarecursosByAreaOptions = ({ areaId }: { areaId?: string }) => {
  const filtered = areaId 
    ? guardarecursos.filter(g => g.areaAsignada === areaId)
    : guardarecursos;
    
  return (
    <>
      {filtered.map(g => (
        <SelectItem key={g.id} value={g.id}>
          {g.nombre} {g.apellido}
        </SelectItem>
      ))}
    </>
  );
};

/**
 * Renderiza opciones de actividades con formato personalizado
 */
export const ActividadesOptions = ({ actividades }: { actividades: any[] }) => (
  <>
    {actividades.map(a => (
      <SelectItem key={a.id} value={a.id}>
        {a.tipo} - {a.fecha}
      </SelectItem>
    ))}
  </>
);

/**
 * Opción de "Ninguna" genérica
 */
export const NoneOption = ({ label = 'Ninguna' }: { label?: string } = {}) => (
  <SelectItem value="none">{label}</SelectItem>
);

/**
 * Opción de "Todos" genérica
 */
export const AllOption = ({ value = 'todos', label = 'Todos' }: { value?: string; label?: string } = {}) => (
  <SelectItem value={value}>{label}</SelectItem>
);
