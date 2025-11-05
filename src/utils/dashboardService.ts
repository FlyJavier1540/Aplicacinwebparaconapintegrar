/**
 * 📊 Dashboard Service
 * 
 * Servicio centralizado que maneja toda la lógica funcional del Dashboard.
 * 
 * IMPORTANTE: El Dashboard solo se muestra para roles Administrador y Coordinador.
 * Los Guardarecursos NO tienen acceso al Dashboard.
 * 
 * BACKEND:
 * - GET /dashboard/stats -> Retorna vista_dashboard
 * - GET /dashboard/areas -> Retorna vista_areas_mapa_dashboard
 * 
 * @module utils/dashboardService
 */

import { 
  AreaProtegida, 
  DashboardStatsResponse, 
  AreaMapaResponse 
} from '../types';
import { get } from './base-api-service';

/**
 * Interface para las estadísticas del dashboard (formato frontend)
 */
export interface DashboardEstadisticas {
  totalAreas: number;
  totalGuardarecursos: number;
  totalActividades: number;
  actividadesHoy: number;
}

/**
 * Interface para las tarjetas de estadísticas
 */
export interface EstadisticaCard {
  title: string;
  value: number;
  gradient: string;
  iconColor: string;
  textColor: string;
  border: string;
  section: string;
}

// ===== FUNCIONES DE API =====

/**
 * Obtiene las estadísticas del dashboard desde el backend
 * 
 * Endpoint: GET /dashboard/stats
 * Vista SQL: vista_dashboard
 * Permisos: Solo Administrador y Coordinador
 * 
 * @returns Promesa con las estadísticas del dashboard
 * @throws ApiError si falla la petición
 * 
 * @example
 * ```typescript
 * try {
 *   const stats = await fetchDashboardStats();
 *   console.log(`Áreas activas: ${stats.totalAreas}`);
 * } catch (error) {
 *   console.error('Error al cargar estadísticas:', error);
 * }
 * ```
 */
export async function fetchDashboardStats(): Promise<DashboardEstadisticas> {
  const response = await get<DashboardStatsResponse>('/dashboard/stats', {
    requiresAuth: true
  });

  // Mapear respuesta de BD al formato del frontend
  return {
    totalAreas: response.total_areas_activas,
    totalGuardarecursos: response.total_guardarecursos_activos,
    totalActividades: response.total_actividades,
    actividadesHoy: response.actividades_hoy
  };
}

/**
 * Obtiene las áreas protegidas para mostrar en el mapa
 * 
 * Endpoint: GET /dashboard/areas
 * Vista SQL: vista_areas_mapa_dashboard
 * Permisos: Solo Administrador y Coordinador
 * 
 * NOTA: La vista ya filtra por estado = 'Activo', no es necesario filtrar en el frontend
 * 
 * @returns Promesa con array de áreas protegidas activas
 * @throws ApiError si falla la petición
 * 
 * @example
 * ```typescript
 * try {
 *   const areas = await fetchAreasProtegidas();
 *   console.log(`Total áreas: ${areas.length}`);
 * } catch (error) {
 *   console.error('Error al cargar áreas:', error);
 * }
 * ```
 */
export async function fetchAreasProtegidas(): Promise<AreaProtegida[]> {
  const response = await get<AreaMapaResponse[]>('/dashboard/areas', {
    requiresAuth: true
  });

  // Mapear respuesta de BD al formato AreaProtegida del frontend
  return response.map(area => ({
    id: area.area_id,
    nombre: area.area_nombre,
    coordenadas: {
      lat: area.latitud,
      lng: area.longitud
    },
    descripcion: area.area_descripcion,
    extension: area.area_extension,
    departamento: area.depto_nombre,
    ecosistema: area.eco_nombre,
    estado: 'Activo' // La vista ya filtra por activos
  }));
}

// ===== FUNCIONES DE UI =====

/**
 * Genera la configuración de las tarjetas de estadísticas principales
 * 
 * @param estadisticas - Estadísticas calculadas
 * @returns Array de configuración de tarjetas
 * 
 * @example
 * const stats = calculateDashboardStats(areas, guardarecursos, actividades);
 * const cards = buildEstadisticasCards(stats);
 */
export function buildEstadisticasCards(
  estadisticas: DashboardEstadisticas
): EstadisticaCard[] {
  return [
    {
      title: "Áreas Protegidas",
      value: estadisticas.totalAreas,
      gradient: "bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/40 dark:to-green-900/40",
      iconColor: "text-green-600 dark:text-green-400",
      textColor: "text-gray-900 dark:text-gray-100",
      border: "border border-green-200 dark:border-green-800",
      section: "asignacion-zonas"
    },
    {
      title: "Guardarecursos",
      value: estadisticas.totalGuardarecursos,
      gradient: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/40",
      iconColor: "text-blue-600 dark:text-blue-400",
      textColor: "text-gray-900 dark:text-gray-100",
      border: "border border-blue-200 dark:border-blue-800",
      section: "registro-guarda"
    },
    {
      title: "Actividades",
      value: estadisticas.totalActividades,
      gradient: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/40",
      iconColor: "text-purple-600 dark:text-purple-400",
      textColor: "text-gray-900 dark:text-gray-100",
      border: "border border-purple-200 dark:border-purple-800",
      section: "planificacion"
    },
    {
      title: "Actividades Hoy",
      value: estadisticas.actividadesHoy,
      gradient: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/40 dark:to-orange-900/40",
      iconColor: "text-orange-600 dark:text-orange-400",
      textColor: "text-gray-900 dark:text-gray-100",
      border: "border border-orange-200 dark:border-orange-800",
      section: "registro-diario"
    }
  ];
}

/**
 * Servicio principal del Dashboard
 * Agrupa todas las funcionalidades en un objeto cohesivo
 */
export const dashboardService = {
  // Funciones de API
  fetchDashboardStats,
  fetchAreasProtegidas,
  
  // Funciones de UI
  buildEstadisticasCards
};

export default dashboardService;
