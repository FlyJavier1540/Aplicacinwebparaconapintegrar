/**
 * 🗺️ Geolocalización de Rutas Service
 * 
 * Servicio centralizado para la gestión de geolocalización de rutas de patrullaje,
 * incluyendo filtrado, cálculo de estadísticas GPS, generación de reportes y
 * procesamiento de coordenadas para visualización.
 * 
 * @module utils/geolocalizacionService
 */

import { Actividad } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Interface para estadísticas de rutas
 */
export interface EstadisticasRutas {
  total: number;
  conGPS: number;
  distanciaTotal: string;
}

/**
 * Interface para coordenadas normalizadas en SVG
 */
export interface CoordenadasSVG {
  x: number;
  y: number;
}

/**
 * Interface para bounds (límites) de coordenadas
 */
export interface CoordenadasBounds {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
}

/**
 * Interface para parámetros de reporte
 */
export interface ReporteParams {
  guardarecurso: string;
  fechaInicio?: string;
  fechaFin?: string;
}

/**
 * Interface para validación de reporte
 */
export interface ReporteValidacion {
  valido: boolean;
  mensaje?: string;
}

// ============================================================================
// FILTRADO DE RUTAS
// ============================================================================

/**
 * Filtra actividades para obtener solo rutas de patrullaje completadas
 * - Tipo: Patrullaje
 * - Estado: Completada
 * - Filtrado por rol (Guardarecurso ve solo las suyas)
 * - Ordenadas por fecha descendente
 * 
 * @param actividades - Lista completa de actividades
 * @param searchTerm - Término de búsqueda
 * @param isGuardarecurso - Si el usuario es guardarecurso
 * @param currentGuardarecursoId - ID del guardarecurso actual
 * @returns Array de rutas completadas filtradas y ordenadas
 * 
 * @example
 * const rutas = filterRutasCompletadas(
 *   actividades, 'sector norte', true, '1'
 * );
 */
export function filterRutasCompletadas(
  actividades: Actividad[],
  searchTerm: string,
  isGuardarecurso: boolean,
  currentGuardarecursoId: string | null
): Actividad[] {
  let filtered = actividades.filter(a => 
    a.tipo === 'Patrullaje' && a.estado === 'Completada'
  );
  
  // Si es guardarecurso, filtrar solo sus actividades
  if (isGuardarecurso && currentGuardarecursoId) {
    filtered = filtered.filter(a => a.guardarecurso === currentGuardarecursoId);
  }
  
  // Filtrar por búsqueda
  if (searchTerm) {
    filtered = filtered.filter(a =>
      a.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Ordenar por fecha descendente (más recientes primero)
  return filtered.sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/**
 * Filtra rutas por guardarecurso específico
 * 
 * @param rutas - Array de rutas
 * @param guardarecursoId - ID del guardarecurso
 * @returns Rutas filtradas
 * 
 * @example
 * const rutasGuardarecurso = filterRutasByGuardarecurso(rutas, '1');
 */
export function filterRutasByGuardarecurso(
  rutas: Actividad[],
  guardarecursoId: string
): Actividad[] {
  return rutas.filter(r => r.guardarecurso === guardarecursoId);
}

/**
 * Filtra rutas por rango de fechas
 * 
 * @param rutas - Array de rutas
 * @param fechaInicio - Fecha inicio (opcional)
 * @param fechaFin - Fecha fin (opcional)
 * @returns Rutas filtradas
 * 
 * @example
 * const rutasFiltradas = filterRutasByDateRange(
 *   rutas, '2024-01-01', '2024-12-31'
 * );
 */
export function filterRutasByDateRange(
  rutas: Actividad[],
  fechaInicio?: string,
  fechaFin?: string
): Actividad[] {
  let filtered = [...rutas];
  
  if (fechaInicio) {
    filtered = filtered.filter(r => r.fecha >= fechaInicio);
  }
  
  if (fechaFin) {
    filtered = filtered.filter(r => r.fecha <= fechaFin);
  }
  
  return filtered;
}

// ============================================================================
// ESTADÍSTICAS GPS
// ============================================================================

/**
 * Calcula estadísticas de rutas (total, con GPS, distancia)
 * 
 * @param rutas - Array de rutas
 * @returns Objeto con estadísticas
 * 
 * @example
 * const stats = calcularEstadisticasRutas(rutas);
 * // {
 * //   total: 25,
 * //   conGPS: 20,
 * //   distanciaTotal: "52.3"
 * // }
 */
export function calcularEstadisticasRutas(rutas: Actividad[]): EstadisticasRutas {
  const totalRutas = rutas.length;
  const rutasConGPS = rutas.filter(r => r.ruta && r.ruta.length > 0).length;
  
  // Calcular distancia total estimada
  const distanciaTotal = rutas.reduce((acc, ruta) => {
    if (ruta.ruta && ruta.ruta.length > 0) {
      // Estimación simple de distancia (2-5 km por ruta)
      return acc + (Math.random() * 3 + 2);
    }
    return acc;
  }, 0);

  return {
    total: totalRutas,
    conGPS: rutasConGPS,
    distanciaTotal: distanciaTotal.toFixed(1),
  };
}

/**
 * Calcula la duración estimada de una ruta en minutos
 * Basado en el número de puntos GPS (5 minutos entre puntos)
 * 
 * @param numeroPuntos - Número de puntos GPS en la ruta
 * @returns Duración en minutos
 * 
 * @example
 * const duracion = calcularDuracionRuta(12);
 * // 55 minutos (11 intervalos × 5 min)
 */
export function calcularDuracionRuta(numeroPuntos: number): number {
  return Math.round((numeroPuntos - 1) * 5);
}

/**
 * Calcula la distancia estimada de una ruta en km
 * Estimación aleatoria entre 2-5 km
 * 
 * @returns Distancia en km
 * 
 * @example
 * const distancia = calcularDistanciaRuta();
 * // "3.7"
 */
export function calcularDistanciaRuta(): string {
  return (Math.random() * 3 + 2).toFixed(1);
}

/**
 * Verifica si una ruta tiene datos GPS
 * 
 * @param ruta - Actividad/ruta
 * @returns true si tiene datos GPS
 * 
 * @example
 * if (tieneGPS(ruta)) {
 *   // Mostrar mapa
 * }
 */
export function tieneGPS(ruta: Actividad): boolean {
  return !!(ruta.ruta && ruta.ruta.length > 0);
}

// ============================================================================
// PROCESAMIENTO DE COORDENADAS PARA SVG
// ============================================================================

/**
 * Calcula los límites (bounds) de un conjunto de coordenadas
 * 
 * @param puntos - Array de coordenadas {lat, lng}
 * @returns Objeto con límites min/max
 * 
 * @example
 * const bounds = calcularBounds(ruta.ruta);
 * // {
 * //   minLat: 14.5,
 * //   maxLat: 14.7,
 * //   minLng: -90.6,
 * //   maxLng: -90.4
 * // }
 */
export function calcularBounds(
  puntos: Array<{ lat: number; lng: number }>
): CoordenadasBounds {
  const lats = puntos.map(p => p.lat);
  const lngs = puntos.map(p => p.lng);
  
  return {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs)
  };
}

/**
 * Normaliza coordenadas geográficas a coordenadas SVG
 * Convierte lat/lng a coordenadas x/y dentro del viewBox SVG
 * 
 * @param lat - Latitud
 * @param lng - Longitud
 * @param bounds - Límites de las coordenadas
 * @param svgWidth - Ancho del SVG (default: 400)
 * @param svgHeight - Alto del SVG (default: 300)
 * @param padding - Padding interno (default: 40)
 * @returns Coordenadas x/y para SVG
 * 
 * @example
 * const bounds = calcularBounds(ruta.ruta);
 * const punto = normalizarCoordenadasASVG(
 *   14.634, -90.506, bounds
 * );
 * // { x: 120, y: 85 }
 */
export function normalizarCoordenadasASVG(
  lat: number,
  lng: number,
  bounds: CoordenadasBounds,
  svgWidth: number = 400,
  svgHeight: number = 300,
  padding: number = 40
): CoordenadasSVG {
  const { minLat, maxLat, minLng, maxLng } = bounds;
  
  return {
    x: padding + ((lng - minLng) / (maxLng - minLng || 0.001)) * (svgWidth - 2 * padding),
    y: padding + ((maxLat - lat) / (maxLat - minLat || 0.001)) * (svgHeight - 2 * padding)
  };
}

/**
 * Convierte array de coordenadas geográficas a puntos SVG
 * 
 * @param puntos - Array de coordenadas {lat, lng}
 * @param svgWidth - Ancho del SVG (default: 400)
 * @param svgHeight - Alto del SVG (default: 300)
 * @param padding - Padding interno (default: 40)
 * @returns Array de coordenadas SVG
 * 
 * @example
 * const puntosSVG = convertirRutaASVG(ruta.ruta);
 * // [{ x: 50, y: 60 }, { x: 120, y: 85 }, ...]
 */
export function convertirRutaASVG(
  puntos: Array<{ lat: number; lng: number }>,
  svgWidth: number = 400,
  svgHeight: number = 300,
  padding: number = 40
): CoordenadasSVG[] {
  const bounds = calcularBounds(puntos);
  
  return puntos.map(p => 
    normalizarCoordenadasASVG(p.lat, p.lng, bounds, svgWidth, svgHeight, padding)
  );
}

/**
 * Genera el path SVG para dibujar una ruta
 * 
 * @param puntos - Array de coordenadas SVG
 * @returns String del path SVG (formato "M x,y L x,y L x,y...")
 * 
 * @example
 * const puntosSVG = convertirRutaASVG(ruta.ruta);
 * const pathD = generarPathSVG(puntosSVG);
 * // "M 50,60 L 120,85 L 180,120 L 250,95"
 * 
 * <path d={pathD} stroke="blue" fill="none" />
 */
export function generarPathSVG(puntos: CoordenadasSVG[]): string {
  return `M ${puntos.map(p => `${p.x},${p.y}`).join(' L ')}`;
}

// ============================================================================
// GENERACIÓN DE REPORTES
// ============================================================================

/**
 * Valida parámetros para generar un reporte
 * 
 * @param params - Parámetros del reporte
 * @returns Objeto con validación
 * 
 * @example
 * const validacion = validarParametrosReporte({ guardarecurso: '' });
 * if (!validacion.valido) {
 *   alert(validacion.mensaje);
 * }
 */
export function validarParametrosReporte(params: ReporteParams): ReporteValidacion {
  if (!params.guardarecurso) {
    return {
      valido: false,
      mensaje: 'Por favor seleccione un guardarecurso para generar el reporte'
    };
  }
  
  return { valido: true };
}

/**
 * Filtra rutas según criterios de reporte
 * 
 * @param rutas - Array de rutas
 * @param params - Parámetros del reporte
 * @returns Rutas filtradas
 * 
 * @example
 * const rutasReporte = filtrarRutasParaReporte(rutas, {
 *   guardarecurso: '1',
 *   fechaInicio: '2024-01-01',
 *   fechaFin: '2024-12-31'
 * });
 */
export function filtrarRutasParaReporte(
  rutas: Actividad[],
  params: ReporteParams
): Actividad[] {
  let filtradas = filterRutasByGuardarecurso(rutas, params.guardarecurso);
  filtradas = filterRutasByDateRange(filtradas, params.fechaInicio, params.fechaFin);
  return filtradas;
}

/**
 * Genera el contenido de texto del reporte de rutas
 * 
 * @param rutas - Rutas a incluir en el reporte
 * @param guardarecursos - Lista de guardarecursos
 * @param areasProtegidas - Lista de áreas protegidas
 * @param params - Parámetros del reporte
 * @returns Contenido del reporte en texto plano
 * 
 * @example
 * const contenido = generarContenidoReporte(
 *   rutas, guardarecursos, areasProtegidas,
 *   { guardarecurso: '1', fechaInicio: '2024-01-01' }
 * );
 */
export function generarContenidoReporte(
  rutas: Actividad[],
  guardarecursos: any[],
  areasProtegidas: any[],
  params: ReporteParams
): string {
  const gr = guardarecursos.find(g => g.id === params.guardarecurso);
  const area = gr ? areasProtegidas.find(a => a.id === gr.areaAsignada) : null;
  
  let content = '═══════════════════════════════════════════════════════════\n';
  content += '            REPORTE DE GEOLOCALIZACIÓN DE RUTAS\n';
  content += '     Consejo Nacional de Áreas Protegidas - CONAP\n';
  content += '═══════════════════════════════════════════════════════════\n\n';
  
  // Información del reporte
  content += `Fecha de generación: ${format(new Date(), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}\n`;
  
  if (gr) {
    content += `Guardarecurso: ${gr.nombre} ${gr.apellido}\n`;
    if (area) content += `Área Protegida: ${area.nombre}\n`;
  }
  
  if (params.fechaInicio || params.fechaFin) {
    content += 'Período: ';
    if (params.fechaInicio) content += `Desde ${format(new Date(params.fechaInicio), "d 'de' MMMM 'de' yyyy", { locale: es })}`;
    if (params.fechaInicio && params.fechaFin) content += ' ';
    if (params.fechaFin) content += `Hasta ${format(new Date(params.fechaFin), "d 'de' MMMM 'de' yyyy", { locale: es })}`;
    content += '\n';
  }
  
  content += `\nTotal de rutas: ${rutas.length}\n`;
  const rutasConGPS = rutas.filter(r => tieneGPS(r)).length;
  content += `Rutas con GPS: ${rutasConGPS}\n\n`;
  
  content += '───────────────────────────────────────────────────────────\n\n';
  
  // Listado de rutas
  rutas.forEach((ruta, index) => {
    const gr = guardarecursos.find(g => g.id === ruta.guardarecurso);
    const area = gr ? areasProtegidas.find(a => a.id === gr.areaAsignada) : null;
    
    content += `${index + 1}. ${ruta.descripcion}\n`;
    content += `   Fecha: ${format(new Date(ruta.fecha), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}\n`;
    content += `   Ubicación: ${ruta.ubicacion}\n`;
    if (gr) content += `   Guardarecurso: ${gr.nombre} ${gr.apellido}\n`;
    if (area) content += `   Área Protegida: ${area.nombre}\n`;
    
    if (tieneGPS(ruta)) {
      content += `   Puntos GPS: ${ruta.ruta!.length}\n`;
      content += `   Duración estimada: ${calcularDuracionRuta(ruta.ruta!.length)} minutos\n`;
      content += `   Distancia estimada: ${calcularDistanciaRuta()} km\n`;
    } else {
      content += '   Sin datos GPS\n';
    }
    
    if (ruta.observaciones) {
      content += `   Observaciones: ${ruta.observaciones}\n`;
    }
    
    content += '\n';
  });
  
  content += '═══════════════════════════════════════════════════════════\n';
  content += '                    FIN DEL REPORTE\n';
  content += '═══════════════════════════════════════════════════════════\n';
  
  return content;
}

/**
 * Genera el nombre de archivo para el reporte
 * 
 * @returns Nombre de archivo con fecha
 * 
 * @example
 * const filename = generarNombreArchivoReporte();
 * // "reporte_rutas_2024-11-03.txt"
 */
export function generarNombreArchivoReporte(): string {
  return `reporte_rutas_${new Date().toISOString().split('T')[0]}.txt`;
}

/**
 * Descarga un reporte como archivo de texto
 * 
 * @param contenido - Contenido del reporte
 * @param nombreArchivo - Nombre del archivo (opcional)
 * 
 * @example
 * const contenido = generarContenidoReporte(...);
 * descargarReporte(contenido);
 */
export function descargarReporte(
  contenido: string,
  nombreArchivo?: string
): void {
  const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo || generarNombreArchivoReporte();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// FORMATEO DE FECHAS
// ============================================================================

/**
 * Formatea fecha para visualización en lista
 * 
 * @param fecha - Fecha ISO string
 * @returns Fecha formateada (ej: "15 de noviembre de 2024")
 * 
 * @example
 * const fecha = formatearFechaRuta('2024-11-15');
 * // "15 de noviembre de 2024"
 */
export function formatearFechaRuta(fecha: string): string {
  return format(new Date(fecha), "d 'de' MMMM 'de' yyyy", { locale: es });
}

/**
 * Formatea fecha completa con día de la semana
 * 
 * @param fecha - Fecha ISO string
 * @returns Fecha formateada (ej: "Viernes, 15 de noviembre de 2024")
 * 
 * @example
 * const fecha = formatearFechaRutaCompleta('2024-11-15');
 * // "viernes, 15 de noviembre de 2024"
 */
export function formatearFechaRutaCompleta(fecha: string): string {
  return format(new Date(fecha), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
}

// ============================================================================
// SERVICIO PRINCIPAL
// ============================================================================

/**
 * Servicio principal de Geolocalización de Rutas
 * Agrupa todas las funcionalidades en un objeto cohesivo
 */
export const geolocalizacionService = {
  // Filtrado
  filterRutasCompletadas,
  filterRutasByGuardarecurso,
  filterRutasByDateRange,
  
  // Estadísticas
  calcularEstadisticasRutas,
  calcularDuracionRuta,
  calcularDistanciaRuta,
  tieneGPS,
  
  // Procesamiento de coordenadas
  calcularBounds,
  normalizarCoordenadasASVG,
  convertirRutaASVG,
  generarPathSVG,
  
  // Reportes
  validarParametrosReporte,
  filtrarRutasParaReporte,
  generarContenidoReporte,
  generarNombreArchivoReporte,
  descargarReporte,
  
  // Formateo
  formatearFechaRuta,
  formatearFechaRutaCompleta
};

export default geolocalizacionService;
