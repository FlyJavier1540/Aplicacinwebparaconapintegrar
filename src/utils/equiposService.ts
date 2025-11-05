/**
 * 📦 Equipos Service
 * 
 * Servicio centralizado que maneja toda la lógica funcional del módulo de Control de Equipos,
 * separando la lógica de negocio de la presentación.
 * 
 * @module utils/equiposService
 */

import { Equipo, Guardarecurso } from '../types';

/**
 * Interface para los datos del formulario de equipos
 */
export interface EquipoFormData {
  nombre: string;
  codigo: string;
  marca: string;
  modelo: string;
  observaciones: string;
  guardarecursoAsignado: string;
}

/**
 * Interface para usuario actual
 */
export interface CurrentUser {
  id: string;
  rol: string;
  nombre: string;
  apellido: string;
  email?: string;
}

/**
 * Tipos de estado de equipo
 */
export type EstadoEquipo = 'Operativo' | 'En Reparación' | 'Desactivado';

/**
 * Configuración de estados de equipos
 */
export const ESTADOS_CONFIG = {
  'Operativo': {
    label: 'Operativo',
    badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-300 dark:border-green-700',
    icon: 'CheckCircle2',
    color: '#10b981'
  },
  'En Reparación': {
    label: 'En Reparación',
    badgeClass: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-300 dark:border-orange-700',
    icon: 'Wrench',
    color: '#f97316'
  },
  'Desactivado': {
    label: 'Desactivado',
    badgeClass: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400 border border-gray-300 dark:border-gray-700',
    icon: 'XCircle',
    color: '#6b7280'
  }
} as const;

/**
 * Filtra equipos según rol y búsqueda
 * - Para Guardarecurso: solo sus equipos asignados (excluye desactivados)
 * - Para otros roles: todos excepto desactivados
 * 
 * @param equipos - Lista completa de equipos
 * @param searchTerm - Término de búsqueda
 * @param currentUser - Usuario actual
 * @param guardarecursos - Lista de guardarecursos para buscar ID
 * @returns Array de equipos filtrados
 * 
 * @example
 * const filtered = filterEquipos(equipos, searchTerm, currentUser, guardarecursos);
 */
export function filterEquipos(
  equipos: Equipo[],
  searchTerm: string,
  currentUser: CurrentUser | undefined,
  guardarecursos: Guardarecurso[]
): Equipo[] {
  const isGuardarecurso = currentUser?.rol === 'Guardarecurso';
  
  // Si es guardarecurso, solo mostrar sus equipos (excluir desactivados)
  if (isGuardarecurso) {
    // Buscar el ID del guardarecurso basado en el email o nombre del usuario actual
    const guardarecursoData = guardarecursos.find(g => 
      g.email === currentUser?.email || 
      (currentUser?.nombre && currentUser?.apellido && 
       g.nombre === currentUser.nombre && g.apellido === currentUser.apellido)
    );
    
    if (guardarecursoData) {
      return equipos.filter(e => 
        e.guardarecursoAsignado === guardarecursoData.id && 
        e.estado !== 'Desactivado' // Excluir equipos desactivados
      );
    }
    return [];
  }
  
  // Para otros roles, aplicar filtros normalmente (excluir desactivados)
  return equipos.filter(e => {
    // Excluir equipos desactivados (no aparecen en ningún lado)
    if (e.estado === 'Desactivado') {
      return false;
    }
    
    const matchesSearch = 
      e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.marca && e.marca.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });
}

/**
 * Crea un nuevo equipo con valores predeterminados
 * 
 * @param formData - Datos del formulario
 * @returns Nuevo objeto Equipo
 * 
 * @example
 * const nuevoEquipo = createEquipo(formData);
 */
export function createEquipo(formData: EquipoFormData): Equipo {
  return {
    id: Date.now().toString(),
    nombre: formData.nombre,
    codigo: formData.codigo,
    marca: formData.marca,
    modelo: formData.modelo,
    observaciones: formData.observaciones,
    guardarecursoAsignado: formData.guardarecursoAsignado === 'none' ? undefined : formData.guardarecursoAsignado,
    fechaAsignacion: new Date().toISOString().split('T')[0],
    estado: 'Operativo', // Siempre se crea como Operativo
    tipo: inferTipoEquipo(formData.nombre) // Inferir tipo basado en el nombre
  };
}

/**
 * Actualiza un equipo existente
 * 
 * @param equipo - Equipo a actualizar
 * @param formData - Datos del formulario
 * @returns Equipo actualizado
 * 
 * @example
 * const actualizado = updateEquipo(existente, formData);
 */
export function updateEquipo(
  equipo: Equipo,
  formData: EquipoFormData
): Equipo {
  return {
    ...equipo,
    nombre: formData.nombre,
    codigo: formData.codigo,
    marca: formData.marca,
    modelo: formData.modelo,
    observaciones: formData.observaciones,
    guardarecursoAsignado: formData.guardarecursoAsignado === 'none' ? undefined : formData.guardarecursoAsignado
  };
}

/**
 * Actualiza el estado de un equipo
 * - Si se cambia a "En Reparación", desasigna automáticamente
 * - Si se cambia a "Desactivado", solo cambia el estado
 * 
 * @param equipo - Equipo a actualizar
 * @param nuevoEstado - Nuevo estado
 * @returns Equipo con estado actualizado
 * 
 * @example
 * const enReparacion = updateEstado(equipo, 'En Reparación');
 * // enReparacion.guardarecursoAsignado === undefined
 */
export function updateEstado(
  equipo: Equipo,
  nuevoEstado: EstadoEquipo
): Equipo {
  // Si se cambia a "En Reparación", desasignar automáticamente
  if (nuevoEstado === 'En Reparación') {
    return { 
      ...equipo, 
      estado: nuevoEstado, 
      guardarecursoAsignado: undefined 
    };
  }
  
  // Si se cambia a "Desactivado", solo cambiar el estado (se ocultará automáticamente)
  return { 
    ...equipo, 
    estado: nuevoEstado 
  };
}

/**
 * Obtiene la clase CSS del badge según el estado
 * 
 * @param estado - Estado del equipo
 * @returns Clase CSS para el badge
 * 
 * @example
 * const badgeClass = getEstadoBadgeClass('Operativo');
 * <Badge className={badgeClass}>Operativo</Badge>
 */
export function getEstadoBadgeClass(estado: EstadoEquipo): string {
  return ESTADOS_CONFIG[estado]?.badgeClass || ESTADOS_CONFIG['Desactivado'].badgeClass;
}

/**
 * Obtiene el nombre del icono según el estado
 * 
 * @param estado - Estado del equipo
 * @returns Nombre del icono de lucide-react
 * 
 * @example
 * const iconName = getEstadoIcon('Operativo'); // 'CheckCircle2'
 */
export function getEstadoIcon(estado: EstadoEquipo): string {
  return ESTADOS_CONFIG[estado]?.icon || ESTADOS_CONFIG['Desactivado'].icon;
}

/**
 * Obtiene el color según el estado
 * 
 * @param estado - Estado del equipo
 * @returns Color hexadecimal
 * 
 * @example
 * const color = getEstadoColor('Operativo'); // '#10b981'
 */
export function getEstadoColor(estado: EstadoEquipo): string {
  return ESTADOS_CONFIG[estado]?.color || ESTADOS_CONFIG['Desactivado'].color;
}

/**
 * Infiere el tipo de equipo basado en palabras clave en el nombre
 * 
 * @param nombre - Nombre del equipo
 * @returns Tipo inferido
 * 
 * @example
 * inferTipoEquipo('Radio Motorola'); // 'Radio'
 * inferTipoEquipo('GPS Garmin'); // 'GPS'
 * inferTipoEquipo('Kit de Primeros Auxilios'); // 'Otro'
 */
export function inferTipoEquipo(nombre: string): 'GPS' | 'Radio' | 'Binoculares' | 'Cámara' | 'Vehículo' | 'Herramienta' | 'Otro' {
  const nombreLower = nombre.toLowerCase();
  
  if (nombreLower.includes('gps')) return 'GPS';
  if (nombreLower.includes('radio')) return 'Radio';
  if (nombreLower.includes('binocular')) return 'Binoculares';
  if (nombreLower.includes('cámara') || nombreLower.includes('camara') || nombreLower.includes('gopro')) return 'Cámara';
  if (nombreLower.includes('vehículo') || nombreLower.includes('vehiculo') || nombreLower.includes('toyota') || nombreLower.includes('ford') || nombreLower.includes('chevrolet')) return 'Vehículo';
  if (nombreLower.includes('machete') || nombreLower.includes('herramienta')) return 'Herramienta';
  
  return 'Otro';
}

/**
 * Crea un formulario vacío con valores predeterminados
 * 
 * @returns Objeto de formulario vacío
 * 
 * @example
 * const emptyForm = createEmptyFormData();
 */
export function createEmptyFormData(): EquipoFormData {
  return {
    nombre: '',
    codigo: '',
    marca: '',
    modelo: '',
    observaciones: '',
    guardarecursoAsignado: ''
  };
}

/**
 * Convierte un equipo a datos de formulario
 * 
 * @param equipo - Equipo a convertir
 * @returns Datos de formulario
 * 
 * @example
 * const formData = equipoToFormData(equipo);
 */
export function equipoToFormData(
  equipo: Equipo
): EquipoFormData {
  return {
    nombre: equipo.nombre,
    codigo: equipo.codigo,
    marca: equipo.marca || '',
    modelo: equipo.modelo || '',
    observaciones: equipo.observaciones || '',
    guardarecursoAsignado: equipo.guardarecursoAsignado || ''
  };
}

/**
 * Verifica si un usuario es guardarecurso
 * 
 * @param currentUser - Usuario actual
 * @returns true si es guardarecurso
 * 
 * @example
 * if (isGuardarecurso(currentUser)) {
 *   // Mostrar vista especial
 * }
 */
export function isGuardarecurso(currentUser: CurrentUser | undefined): boolean {
  return currentUser?.rol === 'Guardarecurso';
}

/**
 * Obtiene el ID del guardarecurso del usuario actual
 * 
 * @param currentUser - Usuario actual
 * @param guardarecursos - Lista de guardarecursos
 * @returns ID del guardarecurso o undefined
 * 
 * @example
 * const guardarecursoId = getGuardarecursoId(currentUser, guardarecursos);
 */
export function getGuardarecursoId(
  currentUser: CurrentUser | undefined,
  guardarecursos: Guardarecurso[]
): string | undefined {
  if (!currentUser) return undefined;
  
  const guardarecursoData = guardarecursos.find(g => 
    g.email === currentUser.email || 
    (currentUser.nombre && currentUser.apellido && 
     g.nombre === currentUser.nombre && g.apellido === currentUser.apellido)
  );
  
  return guardarecursoData?.id;
}

/**
 * Cuenta los equipos por estado
 * 
 * @param equipos - Lista de equipos
 * @returns Objeto con conteo por estado
 * 
 * @example
 * const stats = countEquiposByEstado(equipos);
 * // { Operativo: 10, 'En Reparación': 2, Desactivado: 1 }
 */
export function countEquiposByEstado(
  equipos: Equipo[]
): Record<EstadoEquipo, number> {
  return equipos.reduce((acc, equipo) => {
    acc[equipo.estado] = (acc[equipo.estado] || 0) + 1;
    return acc;
  }, {} as Record<EstadoEquipo, number>);
}

/**
 * Cuenta los equipos asignados a un guardarecurso
 * 
 * @param guardarecursoId - ID del guardarecurso
 * @param equipos - Lista de equipos
 * @returns Número de equipos asignados
 * 
 * @example
 * const count = countEquiposByGuardarecurso('1', equipos);
 */
export function countEquiposByGuardarecurso(
  guardarecursoId: string,
  equipos: Equipo[]
): number {
  return equipos.filter(e => e.guardarecursoAsignado === guardarecursoId).length;
}

/**
 * Obtiene los equipos asignados a un guardarecurso
 * 
 * @param guardarecursoId - ID del guardarecurso
 * @param equipos - Lista de equipos
 * @returns Array de equipos asignados
 * 
 * @example
 * const misEquipos = getEquiposByGuardarecurso('1', equipos);
 */
export function getEquiposByGuardarecurso(
  guardarecursoId: string,
  equipos: Equipo[]
): Equipo[] {
  return equipos.filter(e => e.guardarecursoAsignado === guardarecursoId);
}

/**
 * Valida si un código de inventario ya existe
 * 
 * @param codigo - Código a validar
 * @param equipos - Lista de equipos
 * @param excludeId - ID del equipo a excluir (para edición)
 * @returns true si el código ya existe
 * 
 * @example
 * if (codigoExists('GPS-001', equipos, currentEquipoId)) {
 *   toast.error('El código ya existe');
 * }
 */
export function codigoExists(
  codigo: string,
  equipos: Equipo[],
  excludeId?: string
): boolean {
  return equipos.some(e => 
    e.codigo === codigo && e.id !== excludeId
  );
}

/**
 * Obtiene todos los estados disponibles
 * 
 * @returns Array de estados
 * 
 * @example
 * const estados = getAllEstados();
 * estados.map(e => <option>{e}</option>)
 */
export function getAllEstados(): EstadoEquipo[] {
  return ['Operativo', 'En Reparación', 'Desactivado'];
}

/**
 * Servicio principal de Equipos
 * Agrupa todas las funcionalidades en un objeto cohesivo
 */
export const equiposService = {
  // Configuración
  ESTADOS_CONFIG,
  
  // Filtrado
  filterEquipos,
  
  // Creación y actualización
  createEquipo,
  updateEquipo,
  updateEstado,
  
  // Estilos y UI
  getEstadoBadgeClass,
  getEstadoIcon,
  getEstadoColor,
  
  // Inferencia
  inferTipoEquipo,
  
  // Transformación de datos
  createEmptyFormData,
  equipoToFormData,
  
  // Validación y verificación
  isGuardarecurso,
  getGuardarecursoId,
  codigoExists,
  
  // Estadísticas
  countEquiposByEstado,
  countEquiposByGuardarecurso,
  getEquiposByGuardarecurso,
  
  // Utilidades
  getAllEstados
};

export default equiposService;
