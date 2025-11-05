/**
 * 📷 Registro Fotográfico Service
 * 
 * Servicio centralizado que maneja toda la lógica funcional del módulo de Evidencias Fotográficas,
 * incluyendo filtrado, creación, gestión y obtención de información relacionada.
 * 
 * @module utils/registroFotograficoService
 */

import { EvidenciaFotografica } from '../types';

/**
 * Interface para datos de formulario de evidencia fotográfica
 */
export interface EvidenciaFormularioData {
  descripcion: string;
  coordenadas: {
    lat: number;
    lng: number;
  };
  actividad: string;
  guardarecurso: string;
  observaciones: string;
}

/**
 * Interface para evidencia fotográfica extendida con datos adicionales
 */
export interface EvidenciaExtendida extends EvidenciaFotografica {
  actividad?: string;
  guardarecurso?: string;
  observaciones?: string;
}

/**
 * Interface para información relacionada de una evidencia
 */
export interface EvidenciaInfoRelacionada {
  guardarecurso?: any;
  actividad?: any;
  areaProtegida?: any;
}

// ============================================================================
// FILTRADO Y ORDENAMIENTO
// ============================================================================

/**
 * Filtra evidencias fotográficas según rol de usuario y búsqueda
 * - Guardarecursos: solo sus evidencias
 * - Admin/Coordinador: todas las evidencias
 * - Ordena de más reciente a más antigua
 * 
 * @param evidencias - Lista completa de evidencias
 * @param searchTerm - Término de búsqueda
 * @param isGuardarecurso - Si el usuario actual es guardarecurso
 * @param currentGuardarecursoId - ID del guardarecurso actual (si aplica)
 * @returns Array de evidencias filtradas y ordenadas
 * 
 * @example
 * // Guardarecurso ve solo sus evidencias
 * const filtered = filterEvidenciasPorRol(
 *   evidencias, 'jaguar', true, '1'
 * );
 * 
 * // Admin ve todas las evidencias
 * const filtered = filterEvidenciasPorRol(
 *   evidencias, 'jaguar', false, null
 * );
 */
export function filterEvidenciasPorRol(
  evidencias: EvidenciaExtendida[],
  searchTerm: string,
  isGuardarecurso: boolean,
  currentGuardarecursoId: string | null
): EvidenciaExtendida[] {
  return evidencias
    .filter(e => {
      // Filtrar por búsqueda en descripción
      const matchesSearch = 
        e.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtrar por guardarecurso si es un guardarecurso logueado
      if (isGuardarecurso && e.guardarecurso !== currentGuardarecursoId) {
        return false;
      }
      
      return matchesSearch;
    })
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()); // Ordenar de más reciente a más antigua
}

/**
 * Ordena evidencias por fecha (más reciente primero)
 * 
 * @param evidencias - Array de evidencias
 * @returns Array ordenado
 * 
 * @example
 * const sorted = sortEvidenciasByDate(evidencias);
 */
export function sortEvidenciasByDate(evidencias: EvidenciaExtendida[]): EvidenciaExtendida[] {
  return [...evidencias].sort((a, b) => 
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );
}

// ============================================================================
// CREACIÓN Y GESTIÓN DE EVIDENCIAS
// ============================================================================

/**
 * Crea un formulario vacío de evidencia fotográfica
 * 
 * @returns Formulario vacío
 * 
 * @example
 * const emptyForm = createEmptyEvidenciaForm();
 */
export function createEmptyEvidenciaForm(): EvidenciaFormularioData {
  return {
    descripcion: '',
    coordenadas: { lat: 0, lng: 0 },
    actividad: '',
    guardarecurso: '',
    observaciones: ''
  };
}

/**
 * Crea una nueva evidencia fotográfica
 * 
 * @param formData - Datos del formulario
 * @param tipo - Tipo de evidencia (opcional, default 'Otro')
 * @returns Nueva evidencia fotográfica
 * 
 * @example
 * const evidencia = createNuevaEvidencia(formData, 'Fauna');
 */
export function createNuevaEvidencia(
  formData: EvidenciaFormularioData,
  tipo: EvidenciaFotografica['tipo'] = 'Otro'
): EvidenciaExtendida {
  return {
    id: Date.now().toString(),
    url: '/evidencia/nueva-evidencia.jpg', // Placeholder URL
    descripcion: formData.descripcion,
    fecha: new Date().toISOString(),
    tipo: tipo,
    coordenadas: formData.coordenadas,
    actividad: formData.actividad,
    guardarecurso: formData.guardarecurso,
    observaciones: formData.observaciones
  };
}

/**
 * Valida que un formulario de evidencia esté completo
 * 
 * @param formData - Datos del formulario
 * @returns true si es válido (requiere al menos descripción)
 * 
 * @example
 * if (!isEvidenciaFormValid(formData)) {
 *   alert('Complete la descripción');
 * }
 */
export function isEvidenciaFormValid(formData: EvidenciaFormularioData): boolean {
  return !!(formData.descripcion && formData.descripcion.trim().length > 0);
}

// ============================================================================
// INFORMACIÓN RELACIONADA
// ============================================================================

/**
 * Obtiene información relacionada de una evidencia (guardarecurso, actividad, área)
 * 
 * @param evidencia - Evidencia fotográfica
 * @param guardarecursos - Lista de guardarecursos
 * @param actividades - Lista de actividades
 * @param areasProtegidas - Lista de áreas protegidas
 * @returns Objeto con información relacionada
 * 
 * @example
 * const info = getEvidenciaInfoRelacionada(
 *   evidencia, guardarecursos, actividades, areasProtegidas
 * );
 * console.log(info.guardarecurso.nombre);
 * console.log(info.actividad.tipo);
 * console.log(info.areaProtegida.nombre);
 */
export function getEvidenciaInfoRelacionada(
  evidencia: EvidenciaExtendida,
  guardarecursos: any[],
  actividades: any[],
  areasProtegidas: any[]
): EvidenciaInfoRelacionada {
  const guardarecurso = guardarecursos.find(g => g.id === evidencia.guardarecurso);
  const actividad = actividades.find(a => a.id === evidencia.actividad);
  
  let areaProtegida = null;
  if (guardarecurso?.areaAsignada) {
    areaProtegida = areasProtegidas.find(a => a.id === guardarecurso.areaAsignada);
  }
  
  return {
    guardarecurso,
    actividad,
    areaProtegida
  };
}

/**
 * Obtiene el guardarecurso asociado a una evidencia
 * 
 * @param evidencia - Evidencia fotográfica
 * @param guardarecursos - Lista de guardarecursos
 * @returns Guardarecurso o undefined
 * 
 * @example
 * const guardarecurso = getGuardarecursoDeEvidencia(evidencia, guardarecursos);
 */
export function getGuardarecursoDeEvidencia(
  evidencia: EvidenciaExtendida,
  guardarecursos: any[]
): any | undefined {
  return guardarecursos.find(g => g.id === evidencia.guardarecurso);
}

/**
 * Obtiene la actividad asociada a una evidencia
 * 
 * @param evidencia - Evidencia fotográfica
 * @param actividades - Lista de actividades
 * @returns Actividad o undefined
 * 
 * @example
 * const actividad = getActividadDeEvidencia(evidencia, actividades);
 */
export function getActividadDeEvidencia(
  evidencia: EvidenciaExtendida,
  actividades: any[]
): any | undefined {
  return actividades.find(a => a.id === evidencia.actividad);
}

/**
 * Obtiene el área protegida asociada a una evidencia (a través del guardarecurso)
 * 
 * @param evidencia - Evidencia fotográfica
 * @param guardarecursos - Lista de guardarecursos
 * @param areasProtegidas - Lista de áreas protegidas
 * @returns Área protegida o undefined
 * 
 * @example
 * const area = getAreaProtegidaDeEvidencia(evidencia, guardarecursos, areasProtegidas);
 */
export function getAreaProtegidaDeEvidencia(
  evidencia: EvidenciaExtendida,
  guardarecursos: any[],
  areasProtegidas: any[]
): any | undefined {
  const guardarecurso = getGuardarecursoDeEvidencia(evidencia, guardarecursos);
  if (guardarecurso?.areaAsignada) {
    return areasProtegidas.find(a => a.id === guardarecurso.areaAsignada);
  }
  return undefined;
}

// ============================================================================
// FORMATEO DE FECHAS
// ============================================================================

/**
 * Formatea fecha de evidencia para visualización corta
 * 
 * @param fecha - Fecha ISO string
 * @returns Fecha formateada (ej: "15 oct 2024")
 * 
 * @example
 * const fecha = formatEvidenciaFechaCorta('2024-10-15T10:30:00Z');
 * // "15 oct 2024"
 */
export function formatEvidenciaFechaCorta(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Formatea fecha de evidencia para visualización completa
 * 
 * @param fecha - Fecha ISO string
 * @returns Fecha formateada con día de la semana y hora
 * 
 * @example
 * const fecha = formatEvidenciaFechaCompleta('2024-10-15T10:30:00Z');
 * // "martes, 15 de octubre de 2024, 10:30 a. m."
 */
export function formatEvidenciaFechaCompleta(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-GT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formatea fecha de evidencia sin hora (solo fecha completa)
 * 
 * @param fecha - Fecha ISO string
 * @returns Fecha formateada con día de la semana sin hora
 * 
 * @example
 * const fecha = formatEvidenciaFechaSinHora('2024-10-15T10:30:00Z');
 * // "martes, 15 de octubre de 2024"
 */
export function formatEvidenciaFechaSinHora(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-GT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// ============================================================================
// COORDENADAS
// ============================================================================

/**
 * Formatea coordenadas para visualización
 * 
 * @param lat - Latitud
 * @param lng - Longitud
 * @param decimals - Número de decimales (default: 6)
 * @returns Objeto con coordenadas formateadas
 * 
 * @example
 * const coords = formatCoordenadasEvidencia(14.6349, -90.5069);
 * // { lat: "14.634900", lng: "-90.506900" }
 */
export function formatCoordenadasEvidencia(
  lat: number,
  lng: number,
  decimals: number = 6
): { lat: string; lng: string } {
  return {
    lat: lat.toFixed(decimals),
    lng: lng.toFixed(decimals)
  };
}

/**
 * Valida que las coordenadas sean válidas
 * 
 * @param lat - Latitud
 * @param lng - Longitud
 * @returns true si las coordenadas son válidas
 * 
 * @example
 * if (isCoordenadasValid(lat, lng)) {
 *   // Procesar coordenadas
 * }
 */
export function isCoordenadasValid(lat: number, lng: number): boolean {
  return !isNaN(lat) && !isNaN(lng) && 
         lat >= -90 && lat <= 90 && 
         lng >= -180 && lng <= 180;
}

// ============================================================================
// ESTADÍSTICAS Y CONTADORES
// ============================================================================

/**
 * Cuenta evidencias por tipo
 * 
 * @param evidencias - Array de evidencias
 * @returns Objeto con contadores por tipo
 * 
 * @example
 * const conteo = contarEvidenciasPorTipo(evidencias);
 * // { Fauna: 5, Flora: 3, Infraestructura: 2, ... }
 */
export function contarEvidenciasPorTipo(
  evidencias: EvidenciaExtendida[]
): Record<string, number> {
  return evidencias.reduce((acc, evidencia) => {
    const tipo = evidencia.tipo || 'Otro';
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Cuenta evidencias por guardarecurso
 * 
 * @param evidencias - Array de evidencias
 * @returns Objeto con contadores por guardarecurso
 * 
 * @example
 * const conteo = contarEvidenciasPorGuardarecurso(evidencias);
 * // { '1': 10, '2': 8, '3': 6 }
 */
export function contarEvidenciasPorGuardarecurso(
  evidencias: EvidenciaExtendida[]
): Record<string, number> {
  return evidencias.reduce((acc, evidencia) => {
    const guardarecurso = evidencia.guardarecurso || 'sin-asignar';
    acc[guardarecurso] = (acc[guardarecurso] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Obtiene estadísticas generales de evidencias
 * 
 * @param evidencias - Array de evidencias
 * @returns Objeto con estadísticas
 * 
 * @example
 * const stats = getEstadisticasEvidencias(evidencias);
 * // {
 * //   total: 50,
 * //   porTipo: { Fauna: 15, Flora: 10, ... },
 * //   porGuardarecurso: { '1': 20, '2': 15, ... }
 * // }
 */
export function getEstadisticasEvidencias(
  evidencias: EvidenciaExtendida[]
): {
  total: number;
  porTipo: Record<string, number>;
  porGuardarecurso: Record<string, number>;
} {
  return {
    total: evidencias.length,
    porTipo: contarEvidenciasPorTipo(evidencias),
    porGuardarecurso: contarEvidenciasPorGuardarecurso(evidencias)
  };
}

// ============================================================================
// TIPOS DE EVIDENCIA
// ============================================================================

/**
 * Obtiene todos los tipos de evidencia disponibles
 * 
 * @returns Array de tipos de evidencia
 */
export function getAllTiposEvidencia(): EvidenciaFotografica['tipo'][] {
  return ['Fauna', 'Flora', 'Infraestructura', 'Irregularidad', 'Mantenimiento', 'Otro'];
}

/**
 * Obtiene color asociado a un tipo de evidencia
 * 
 * @param tipo - Tipo de evidencia
 * @returns Objeto con bg y text para Tailwind
 * 
 * @example
 * const colors = getTipoEvidenciaColor('Fauna');
 * <div className={colors.bg}>
 *   <span className={colors.text}>Fauna</span>
 * </div>
 */
export function getTipoEvidenciaColor(tipo: string): { bg: string; text: string } {
  const mapping: Record<string, { bg: string; text: string }> = {
    'Fauna': { 
      bg: 'bg-emerald-100 dark:bg-emerald-900/30', 
      text: 'text-emerald-700 dark:text-emerald-300' 
    },
    'Flora': { 
      bg: 'bg-green-100 dark:bg-green-900/30', 
      text: 'text-green-700 dark:text-green-300' 
    },
    'Infraestructura': { 
      bg: 'bg-blue-100 dark:bg-blue-900/30', 
      text: 'text-blue-700 dark:text-blue-300' 
    },
    'Irregularidad': { 
      bg: 'bg-red-100 dark:bg-red-900/30', 
      text: 'text-red-700 dark:text-red-300' 
    },
    'Mantenimiento': { 
      bg: 'bg-orange-100 dark:bg-orange-900/30', 
      text: 'text-orange-700 dark:text-orange-300' 
    },
    'Otro': { 
      bg: 'bg-gray-100 dark:bg-gray-700', 
      text: 'text-gray-700 dark:text-gray-300' 
    }
  };

  return mapping[tipo] || mapping['Otro'];
}

// ============================================================================
// SERVICIO PRINCIPAL
// ============================================================================

/**
 * Servicio principal de Registro Fotográfico
 * Agrupa todas las funcionalidades en un objeto cohesivo
 */
export const registroFotograficoService = {
  // Filtrado y ordenamiento
  filterEvidenciasPorRol,
  sortEvidenciasByDate,
  
  // Creación y gestión
  createEmptyEvidenciaForm,
  createNuevaEvidencia,
  isEvidenciaFormValid,
  
  // Información relacionada
  getEvidenciaInfoRelacionada,
  getGuardarecursoDeEvidencia,
  getActividadDeEvidencia,
  getAreaProtegidaDeEvidencia,
  
  // Formateo de fechas
  formatEvidenciaFechaCorta,
  formatEvidenciaFechaCompleta,
  formatEvidenciaFechaSinHora,
  
  // Coordenadas
  formatCoordenadasEvidencia,
  isCoordenadasValid,
  
  // Estadísticas
  contarEvidenciasPorTipo,
  contarEvidenciasPorGuardarecurso,
  getEstadisticasEvidencias,
  
  // Tipos
  getAllTiposEvidencia,
  getTipoEvidenciaColor
};

export default registroFotograficoService;
