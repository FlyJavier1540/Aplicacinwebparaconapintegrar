/**
 * 🌐 API de Actividades - Comunicación con el servidor
 * 
 * Este archivo maneja todas las llamadas HTTP al backend para el módulo
 * de Planificación de Actividades.
 * 
 * OPTIMIZADO: Cache de peticiones, reducción de consultas redundantes
 */

import { projectId } from './supabase/info';
import { getRequiredAuthToken } from './base-api-service';
import { Actividad } from '../types';
import { ActividadFormData } from './actividadesService';

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-276018ed`;

// ===== CACHE DE PETICIONES (OPTIMIZACIÓN) =====

/**
 * Cache simple para la última petición de actividades
 * Reduce peticiones innecesarias al backend
 */
let actividadesCache: {
  data: Actividad[] | null;
  timestamp: number | null;
  ttl: number; // Time to live en milisegundos
} = {
  data: null,
  timestamp: null,
  ttl: 30000 // 30 segundos
};

/**
 * Limpia el cache de actividades
 * Útil después de crear/actualizar/eliminar una actividad
 */
export function clearActividadesCache(): void {
  actividadesCache.data = null;
  actividadesCache.timestamp = null;
  console.log('🧹 Cache de actividades limpiado');
}

/**
 * Verifica si el cache es válido
 */
function isCacheValid(): boolean {
  if (!actividadesCache.data || !actividadesCache.timestamp) {
    return false;
  }
  const now = Date.now();
  return (now - actividadesCache.timestamp) < actividadesCache.ttl;
}

// ===== API CALLS (OPTIMIZADAS) =====

/**
 * Obtiene todas las actividades desde el servidor
 * OPTIMIZADO: Usa cache para reducir peticiones redundantes
 */
export async function fetchActividades(accessToken: string, forceRefresh: boolean = false): Promise<Actividad[]> {
  try {
    // Si tenemos cache válido y no es refresh forzado, retornar del cache
    if (!forceRefresh && isCacheValid() && actividadesCache.data) {
      console.log('✅ Usando actividades desde cache');
      return actividadesCache.data;
    }

    console.log('📡 Consultando actividades desde backend...');
    const response = await fetch(
      `${BASE_URL}/actividades`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = await response.json();
    
    if (!result.success) {
      console.error('❌ Error al obtener actividades:', result.error);
      return [];
    }

    // Transformar datos del servidor al formato del frontend
    const actividades = result.actividades.map((act: any) => ({
      id: act.act_id.toString(),
      codigo: act.act_codigo,
      tipo: act.tipo?.tp_nombre || '',
      descripcion: act.act_descripcion,
      fecha: act.act_fechah_programacion?.split('T')[0] || '',
      horaInicio: act.act_fechah_programacion?.split('T')[1]?.substring(0, 5) || '',
      horaFin: act.act_fechah_fin?.split('T')[1]?.substring(0, 5) || '',
      fechaHoraInicio: act.act_fechah_iniciio,
      fechaHoraFin: act.act_fechah_fin,
      coordenadasInicio: (act.act_latitud_inicio && act.act_longitud_inicio) ? {
        lat: parseFloat(act.act_latitud_inicio),
        lng: parseFloat(act.act_longitud_inicio)
      } : undefined,
      coordenadasFin: (act.act_latitud_fin && act.act_longitud_fin) ? {
        lat: parseFloat(act.act_latitud_fin),
        lng: parseFloat(act.act_longitud_fin)
      } : undefined,
      coordenadas: (act.act_latitud_inicio && act.act_longitud_inicio) ? {
        lat: parseFloat(act.act_latitud_inicio),
        lng: parseFloat(act.act_longitud_inicio)
      } : undefined,
      guardarecurso: act.usuario?.usr_id?.toString() || '',
      guardarecursoNombre: act.usuario ? `${act.usuario.usr_nombre} ${act.usuario.usr_apellido}` : '',
      estado: act.estado?.std_nombre || 'Programada',
      evidencias: [],
      hallazgos: [],
      areaProtegida: ''
    }));

    // Guardar en cache
    actividadesCache.data = actividades;
    actividadesCache.timestamp = Date.now();
    
    console.log(`✅ ${actividades.length} actividades cargadas y cacheadas`);
    return actividades;
  } catch (error) {
    console.error('❌ Error en fetchActividades:', error);
    return [];
  }
}

/**
 * Crea una nueva actividad en el servidor
 * OPTIMIZADO: Limpia cache automáticamente
 */
export async function createActividadAPI(formData: ActividadFormData, accessToken: string): Promise<Actividad> {
  try {
    const response = await fetch(
      `${BASE_URL}/actividades`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      }
    );

    const result = await response.json();
    
    if (!result.success) {
      console.error('❌ Error al crear actividad:', result.error);
      throw new Error(result.error);
    }

    // Limpiar cache
    clearActividadesCache();

    // Transformar respuesta al formato del frontend
    const act = result.actividad;
    return {
      id: act.act_id.toString(),
      codigo: act.act_codigo,
      tipo: act.tipo?.tp_nombre || formData.tipo,
      descripcion: act.act_descripcion,
      fecha: act.act_fechah_programacion?.split('T')[0] || formData.fecha,
      horaInicio: act.act_fechah_programacion?.split('T')[1]?.substring(0, 5) || formData.horaInicio,
      horaFin: formData.horaFin,
      coordenadas: formData.coordenadas,
      guardarecurso: formData.guardarecurso,
      estado: act.estado?.std_nombre || 'Programada',
      evidencias: [],
      hallazgos: [],
      areaProtegida: ''
    };
  } catch (error) {
    console.error('❌ Error en createActividadAPI:', error);
    throw error;
  }
}

/**
 * Actualiza una actividad existente en el servidor
 * OPTIMIZADO: Limpia cache automáticamente
 */
export async function updateActividadAPI(actividadId: string, formData: ActividadFormData, accessToken: string): Promise<Actividad> {
  try {
    const response = await fetch(
      `${BASE_URL}/actividades/${actividadId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      }
    );

    const result = await response.json();
    
    if (!result.success) {
      console.error('❌ Error al actualizar actividad:', result.error);
      throw new Error(result.error);
    }

    // Limpiar cache
    clearActividadesCache();

    // Transformar respuesta al formato del frontend
    const act = result.actividad;
    return {
      id: act.act_id.toString(),
      codigo: act.act_codigo,
      tipo: act.tipo?.tp_nombre || formData.tipo,
      descripcion: act.act_descripcion,
      fecha: act.act_fechah_programacion?.split('T')[0] || formData.fecha,
      horaInicio: act.act_fechah_programacion?.split('T')[1]?.substring(0, 5) || formData.horaInicio,
      horaFin: formData.horaFin,
      coordenadas: formData.coordenadas,
      guardarecurso: formData.guardarecurso,
      estado: act.estado?.std_nombre || 'Programada',
      evidencias: [],
      hallazgos: [],
      areaProtegida: ''
    };
  } catch (error) {
    console.error('❌ Error en updateActividadAPI:', error);
    throw error;
  }
}

/**
 * Elimina una actividad del servidor
 * OPTIMIZADO: Limpia cache automáticamente
 */
export async function deleteActividadAPI(actividadId: string, accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${BASE_URL}/actividades/${actividadId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = await response.json();
    
    if (!result.success) {
      console.error('❌ Error al eliminar actividad:', result.error);
      throw new Error(result.error);
    }

    // Limpiar cache
    clearActividadesCache();

    return true;
  } catch (error) {
    console.error('❌ Error en deleteActividadAPI:', error);
    throw error;
  }
}

/**
 * Crea múltiples actividades de forma masiva en el servidor
 * OPTIMIZADO: Limpia cache automáticamente
 */
export async function createActividadesBulkAPI(
  actividades: ActividadFormData[], 
  accessToken: string
): Promise<{
  success: boolean;
  actividadesCargadas: number;
  actividadesConError: number;
  actividades: Actividad[];
  errores: Array<{ index: number; codigo: string; error: string }>;
}> {
  try {
    const response = await fetch(
      `${BASE_URL}/actividades/bulk`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ actividades })
      }
    );

    const result = await response.json();
    
    if (!result.success) {
      console.error('❌ Error al crear actividades masivamente:', result.error);
      throw new Error(result.error);
    }

    // Limpiar cache
    clearActividadesCache();

    // Transformar las actividades de la respuesta al formato del frontend
    const actividadesTransformadas = result.actividades.map((act: any) => ({
      id: act.act_id.toString(),
      codigo: act.act_codigo,
      tipo: act.tipo?.tp_nombre || '',
      descripcion: act.act_descripcion,
      fecha: act.act_fechah_programacion?.split('T')[0] || '',
      horaInicio: act.act_fechah_programacion?.split('T')[1]?.substring(0, 5) || '',
      horaFin: '',
      guardarecurso: act.usuario?.usr_id?.toString() || '',
      guardarecursoNombre: act.usuario ? `${act.usuario.usr_nombre} ${act.usuario.usr_apellido}` : '',
      estado: act.estado?.std_nombre || 'Programada',
      evidencias: [],
      hallazgos: [],
      areaProtegida: ''
    }));

    return {
      success: true,
      actividadesCargadas: result.actividadesCargadas,
      actividadesConError: result.actividadesConError,
      actividades: actividadesTransformadas,
      errores: result.errores || []
    };
  } catch (error) {
    console.error('❌ Error en createActividadesBulkAPI:', error);
    throw error;
  }
}
