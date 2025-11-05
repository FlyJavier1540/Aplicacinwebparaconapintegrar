/**
 * 🌳 Áreas Protegidas Service
 * 
 * Servicio centralizado que maneja toda la lógica funcional del módulo de Áreas Protegidas,
 * separando la lógica de negocio de la presentación.
 * 
 * @module utils/areasProtegidasService
 */

import { AreaProtegida, Guardarecurso } from '../types';

/**
 * Interface para los datos del formulario de áreas protegidas
 */
export interface AreaProtegidaFormData {
  nombre: string;
  departamento: string;
  extension: number;
  fechaCreacion: string;
  coordenadas: {
    lat: number;
    lng: number;
  };
  descripcion: string;
  ecosistemas: string[];
}

/**
 * Interface para el estado pendiente de cambio
 */
export interface AreaEstadoPendiente {
  id: string;
  nuevoEstado: 'Activo' | 'Desactivado';
  nombre: string;
}

/**
 * Interface para resultado de validación
 */
export interface ValidationResult {
  isValid: boolean;
  message?: string;
  guardarecursosAsignados?: number;
}

/**
 * Lista de departamentos de Guatemala
 */
export const DEPARTAMENTOS_GUATEMALA = [
  'Petén', 'Alta Verapaz', 'Baja Verapaz', 'Chimaltenango', 
  'Escuintla', 'Guatemala', 'Quetzaltenango', 'Huehuetenango',
  'Izabal', 'Jalapa', 'Jutiapa', 'Quiché', 'Retalhuleu',
  'Sacatepéquez', 'San Marcos', 'Santa Rosa', 'Sololá',
  'Suchitepéquez', 'Totonicapán', 'Zacapa', 'El Progreso', 'Chiquimula'
] as const;

/**
 * Lista de ecosistemas típicos de Guatemala
 */
export const ECOSISTEMAS_GUATEMALA = [
  'Bosque Tropical Húmedo',
  'Bosque Tropical Seco', 
  'Bosque Nublado',
  'Humedales',
  'Manglares',
  'Sabanas',
  'Bosque Mixto',
  'Matorral Volcánico',
  'Karst'
] as const;

/**
 * Filtra áreas protegidas excluyendo desactivadas
 * 
 * @param areas - Lista completa de áreas protegidas
 * @param searchTerm - Término de búsqueda
 * @param selectedDepartamento - Departamento seleccionado para filtrar
 * @returns Array de áreas protegidas filtradas
 * 
 * @example
 * const filtered = filterAreasProtegidas(areas, 'tikal', 'Petén');
 */
export function filterAreasProtegidas(
  areas: AreaProtegida[],
  searchTerm: string,
  selectedDepartamento: string
): AreaProtegida[] {
  return areas.filter(area => {
    // Excluir áreas desactivadas
    const isActive = area.estado === 'Activo';
    
    // Filtrar por búsqueda (nombre, departamento, descripción)
    const matchSearch = 
      area.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar por departamento
    const matchDepartamento = selectedDepartamento === 'todos' || area.departamento === selectedDepartamento;
    
    return isActive && matchSearch && matchDepartamento;
  });
}

/**
 * Crea una nueva área protegida con valores predeterminados
 * 
 * @param formData - Datos del formulario
 * @returns Nuevo objeto AreaProtegida
 * 
 * @example
 * const nuevaArea = createAreaProtegida(formData);
 */
export function createAreaProtegida(formData: AreaProtegidaFormData): AreaProtegida {
  return {
    id: Date.now().toString(),
    nombre: formData.nombre,
    departamento: formData.departamento,
    extension: formData.extension,
    fechaCreacion: formData.fechaCreacion,
    coordenadas: formData.coordenadas,
    descripcion: formData.descripcion,
    ecosistemas: formData.ecosistemas,
    estado: 'Activo', // Siempre se crea como Activo
    guardarecursos: []
  };
}

/**
 * Actualiza un área protegida existente
 * 
 * @param area - Área a actualizar
 * @param formData - Datos del formulario
 * @returns Área protegida actualizada
 * 
 * @example
 * const actualizada = updateAreaProtegida(existente, formData);
 */
export function updateAreaProtegida(
  area: AreaProtegida,
  formData: AreaProtegidaFormData
): AreaProtegida {
  return {
    ...area,
    nombre: formData.nombre,
    departamento: formData.departamento,
    extension: formData.extension,
    fechaCreacion: formData.fechaCreacion,
    coordenadas: formData.coordenadas,
    descripcion: formData.descripcion,
    ecosistemas: formData.ecosistemas
    // Mantener guardarecursos y estado sin cambios
  };
}

/**
 * Valida si un área puede ser desactivada
 * Verifica que no tenga guardarecursos asignados
 * 
 * @param area - Área a validar
 * @param guardarecursos - Lista de todos los guardarecursos
 * @returns Resultado de validación
 * 
 * @example
 * const validation = validateAreaDeactivation(area, guardarecursos);
 * if (!validation.isValid) {
 *   toast.error(validation.message);
 * }
 */
export function validateAreaDeactivation(
  area: AreaProtegida,
  guardarecursos: Guardarecurso[]
): ValidationResult {
  const guardarecursosAsignados = guardarecursos.filter(g => g.areaAsignada === area.id);
  
  if (guardarecursosAsignados.length > 0) {
    return {
      isValid: false,
      message: `Esta área tiene ${guardarecursosAsignados.length} guardarecurso(s) asignado(s). Reasigne o elimine los guardarecursos antes de desactivar el área.`,
      guardarecursosAsignados: guardarecursosAsignados.length
    };
  }
  
  return {
    isValid: true
  };
}

/**
 * Valida si un cambio de estado es válido
 * 
 * @param estadoActual - Estado actual del área
 * @param nuevoEstado - Nuevo estado propuesto
 * @returns true si el cambio es válido, false si no hay cambio
 * 
 * @example
 * if (!isValidEstadoChange('Activo', 'Activo')) {
 *   toast.info('Sin cambios');
 * }
 */
export function isValidEstadoChange(
  estadoActual: string,
  nuevoEstado: string
): boolean {
  return estadoActual !== nuevoEstado;
}

/**
 * Determina el nuevo estado al hacer toggle
 * 
 * @param estadoActual - Estado actual
 * @returns Nuevo estado (Activo -> Desactivado o Desactivado -> Activo)
 * 
 * @example
 * const nuevoEstado = toggleEstado('Activo'); // 'Desactivado'
 */
export function toggleEstado(
  estadoActual: 'Activo' | 'Desactivado'
): 'Activo' | 'Desactivado' {
  return estadoActual === 'Activo' ? 'Desactivado' : 'Activo';
}

/**
 * Actualiza el estado de un área protegida
 * 
 * @param area - Área a actualizar
 * @param nuevoEstado - Nuevo estado
 * @returns Área con estado actualizado
 * 
 * @example
 * const desactivada = updateEstado(area, 'Desactivado');
 */
export function updateEstado(
  area: AreaProtegida,
  nuevoEstado: 'Activo' | 'Desactivado'
): AreaProtegida {
  return {
    ...area,
    estado: nuevoEstado
  };
}

/**
 * Obtiene el mensaje de confirmación según el estado
 * 
 * @param nuevoEstado - Estado al que se quiere cambiar
 * @returns Verbo del mensaje
 * 
 * @example
 * const mensaje = getEstadoMensaje('Desactivado'); // "desactivado"
 */
export function getEstadoMensaje(
  nuevoEstado: 'Activo' | 'Desactivado'
): string {
  const mensajes = {
    'Activo': 'activado',
    'Desactivado': 'desactivado'
  };
  
  return mensajes[nuevoEstado];
}

/**
 * Prepara un objeto EstadoPendiente para confirmación
 * 
 * @param area - Área que cambiará de estado
 * @param nuevoEstado - Nuevo estado propuesto
 * @returns Objeto con información del cambio pendiente
 * 
 * @example
 * const pendiente = prepareEstadoPendiente(area, 'Desactivado');
 */
export function prepareEstadoPendiente(
  area: AreaProtegida,
  nuevoEstado: 'Activo' | 'Desactivado'
): AreaEstadoPendiente {
  return {
    id: area.id,
    nuevoEstado,
    nombre: area.nombre
  };
}

/**
 * Calcula coordenadas para el mapa SVG
 * 
 * @param coordenadas - Coordenadas geográficas (lat, lng)
 * @returns Coordenadas SVG (x, y)
 * 
 * @example
 * const { x, y } = calculateSVGCoordinates({ lat: 15.5, lng: -90.25 });
 */
export function calculateSVGCoordinates(
  coordenadas: { lat: number; lng: number }
): { x: number; y: number } {
  const x = (coordenadas.lng + 92) * 180;
  const y = (19 - coordenadas.lat) * 80;
  
  return { x, y };
}

/**
 * Calcula viewBox centrado para un área específica
 * 
 * @param area - Área a centrar
 * @returns ViewBox string para SVG
 * 
 * @example
 * const viewBox = calculateCenteredViewBox(area);
 * <svg viewBox={viewBox}>...</svg>
 */
export function calculateCenteredViewBox(
  area: AreaProtegida
): string {
  const { x, y } = calculateSVGCoordinates(area.coordenadas);
  const width = 300;
  const height = 225;
  
  return `${x - width/2} ${y - height/2} ${width} ${height}`;
}

/**
 * Calcula viewBox por defecto para el mapa completo
 * 
 * @returns ViewBox string para SVG
 * 
 * @example
 * const viewBox = getDefaultViewBox();
 */
export function getDefaultViewBox(): string {
  return "0 0 800 600";
}

/**
 * Obtiene el número de guardarecursos asignados a un área
 * 
 * @param area - Área protegida
 * @param guardarecursos - Lista de guardarecursos
 * @returns Número de guardarecursos asignados
 * 
 * @example
 * const count = getGuardarecursosCount(area, guardarecursos);
 */
export function getGuardarecursosCount(
  area: AreaProtegida,
  guardarecursos: Guardarecurso[]
): number {
  return guardarecursos.filter(g => g.areaAsignada === area.id).length;
}

/**
 * Crea un formulario vacío con valores predeterminados
 * 
 * @returns Objeto de formulario vacío
 * 
 * @example
 * const emptyForm = createEmptyFormData();
 */
export function createEmptyFormData(): AreaProtegidaFormData {
  return {
    nombre: '',
    departamento: '',
    extension: 0,
    fechaCreacion: new Date().toISOString().split('T')[0],
    coordenadas: { lat: 0, lng: 0 },
    descripcion: '',
    ecosistemas: ['Bosque Tropical Húmedo']
  };
}

/**
 * Convierte un área protegida a datos de formulario
 * 
 * @param area - Área protegida a convertir
 * @returns Datos de formulario
 * 
 * @example
 * const formData = areaToFormData(area);
 */
export function areaToFormData(
  area: AreaProtegida
): AreaProtegidaFormData {
  return {
    nombre: area.nombre,
    departamento: area.departamento,
    extension: area.extension,
    fechaCreacion: area.fechaCreacion,
    coordenadas: area.coordenadas,
    descripcion: area.descripcion,
    ecosistemas: area.ecosistemas
  };
}

/**
 * Servicio principal de Áreas Protegidas
 * Agrupa todas las funcionalidades en un objeto cohesivo
 */
export const areasProtegidasService = {
  // Constantes
  departamentos: DEPARTAMENTOS_GUATEMALA,
  ecosistemas: ECOSISTEMAS_GUATEMALA,
  
  // Filtrado
  filterAreasProtegidas,
  
  // Creación y actualización
  createAreaProtegida,
  updateAreaProtegida,
  
  // Estado
  isValidEstadoChange,
  toggleEstado,
  updateEstado,
  getEstadoMensaje,
  prepareEstadoPendiente,
  
  // Validación
  validateAreaDeactivation,
  
  // Cálculos de mapa
  calculateSVGCoordinates,
  calculateCenteredViewBox,
  getDefaultViewBox,
  
  // Utilidades
  getGuardarecursosCount,
  createEmptyFormData,
  areaToFormData
};

export default areasProtegidasService;
