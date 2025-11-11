/**
 * 🔍 Reporte de Hallazgos Service
 * 
 * Servicio centralizado que maneja toda la lógica funcional del módulo de Reporte de Hallazgos,
 * incluyendo CRUD de hallazgos, gestión de estados, seguimiento, evidencias y generación de reportes PDF.
 * 
 * @module utils/hallazgosService
 */

import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AreaProtegida, Guardarecurso } from '../types';
import { Search, Clock, CheckCircle, FileText } from 'lucide-react';
import { projectId } from './supabase/info';
import { getRequiredAuthToken } from './base-api-service';

/**
 * Interface para hallazgo
 */
export interface Hallazgo {
  id: string;
  titulo: string;
  descripcion: string;
  prioridad: 'Leve' | 'Moderado' | 'Grave' | 'Crítico';
  estado: 'Reportado' | 'En Investigación' | 'En Proceso' | 'Resuelto';
  ubicacion: string;
  coordenadas?: { lat: number; lng: number };
  areaProtegida: string;
  areaProtegidaNombre?: string;
  actividadId?: string | null;
  guardarecurso: string;
  guardarecursoNombre?: string;
  fechaReporte: string;
  fechaResolucion?: string;
  observaciones?: string;
  accionesTomadas?: string;
  evidencias: string[];
  seguimiento: Array<{
    fecha: string;
    accion: string;
    responsable: string;
    observaciones: string;
  }>;
}

/**
 * Interface para datos de formulario de hallazgo
 */
export interface HallazgoFormData {
  titulo: string;
  descripcion: string;
  prioridad: string;
  ubicacion: string;
  coordenadas: { lat: number; lng: number };
  areaProtegida: string;
  observaciones: string;
}

/**
 * Interface para datos de seguimiento
 */
export interface SeguimientoFormData {
  accion: string;
  observaciones: string;
}

/**
 * Interface para configuración de siguiente estado
 */
export interface NextEstadoConfig {
  value: string;
  label: string;
  icon: any;
}

/**
 * 🔍 FILTRADO Y BÚSQUEDA
 */

/**
 * Filtra hallazgos según término de búsqueda y rol del usuario
 */
export function filterHallazgos(
  hallazgos: Hallazgo[],
  searchTerm: string,
  currentUser?: any
): Hallazgo[] {
  const isGuardarecurso = currentUser?.rol === 'Guardarecurso';
  const currentGuardarecursoId = isGuardarecurso ? currentUser?.id : null;

  return hallazgos.filter(h => {
    const matchesSearch = 
      h.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Si es guardarecurso, filtrar solo sus hallazgos
    const matchesGuardarecurso = isGuardarecurso 
      ? h.guardarecurso === currentGuardarecursoId
      : true;
    
    return matchesSearch && matchesGuardarecurso;
  });
}

/**
 * Separa hallazgos activos (no resueltos) y los ordena de más reciente a más antiguo
 */
export function getHallazgosActivos(hallazgos: Hallazgo[]): Hallazgo[] {
  return hallazgos
    .filter(h => h.estado !== 'Resuelto')
    .sort((a, b) => {
      const dateA = new Date(a.fechaReporte);
      const dateB = new Date(b.fechaReporte);
      return dateB.getTime() - dateA.getTime(); // Orden descendente (más reciente primero)
    });
}

/**
 * Separa hallazgos resueltos y los ordena de más reciente a más antiguo
 */
export function getHallazgosResueltos(hallazgos: Hallazgo[]): Hallazgo[] {
  return hallazgos
    .filter(h => h.estado === 'Resuelto')
    .sort((a, b) => {
      const dateA = new Date(a.fechaReporte);
      const dateB = new Date(b.fechaReporte);
      return dateB.getTime() - dateA.getTime(); // Orden descendente (más reciente primero)
    });
}

/**
 * 🎨 ESTILOS Y UI
 */

/**
 * Obtiene información de estilo para prioridad
 */
export function getPrioridadInfo(prioridad: string) {
  switch (prioridad) {
    case 'Crítico':
      return {
        badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-700'
      };
    case 'Grave':
      return {
        badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300 dark:border-orange-700'
      };
    case 'Moderado':
      return {
        badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700'
      };
    case 'Leve':
      return {
        badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-700'
      };
    default:
      return {
        badge: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-300 dark:border-gray-700'
      };
  }
}

/**
 * Obtiene variante de badge para estado
 */
export function getEstadoBadgeVariant(estado: string): "default" | "secondary" | "destructive" | "outline" {
  switch (estado) {
    case 'Resuelto':
      return 'default';
    case 'En Proceso':
      return 'secondary';
    case 'Reportado':
      return 'outline';
    case 'En Investigación':
      return 'outline';
    default:
      return 'outline';
  }
}

/**
 * 📋 CRUD DE HALLAZGOS
 */

/**
 * Crea un nuevo hallazgo
 */
export function createHallazgo(
  formData: HallazgoFormData,
  evidencias: string[]
): Hallazgo {
  return {
    id: Date.now().toString(),
    ...formData,
    prioridad: formData.prioridad as any,
    estado: 'Reportado',
    guardarecurso: '1', // En producción vendría del usuario actual
    fechaReporte: new Date().toISOString(),
    evidencias: evidencias,
    seguimiento: [{
      fecha: new Date().toISOString(),
      accion: 'Reporte inicial',
      responsable: 'Sistema',
      observaciones: 'Hallazgo reportado a través del sistema'
    }]
  };
}

/**
 * Actualiza un hallazgo existente
 */
export function updateHallazgo(
  hallazgo: Hallazgo,
  formData: HallazgoFormData,
  evidencias: string[]
): Hallazgo {
  return {
    ...hallazgo,
    ...formData,
    prioridad: formData.prioridad as any,
    evidencias: evidencias
  };
}

/**
 * 📊 GESTIÓN DE ESTADOS
 */

/**
 * Obtiene los estados siguientes disponibles según el estado actual
 */
export function getNextEstados(estadoActual: string): NextEstadoConfig[] {
  const estadosOrden = ['Reportado', 'En Investigación', 'En Proceso', 'Resuelto'];
  const currentIndex = estadosOrden.indexOf(estadoActual);
  
  if (currentIndex === -1 || currentIndex === estadosOrden.length - 1) {
    return []; // No hay estados siguientes
  }
  
  const nextEstados = estadosOrden.slice(currentIndex + 1);
  
  return nextEstados.map(estado => {
    switch (estado) {
      case 'En Investigación':
        return { value: estado, label: estado, icon: Search };
      case 'En Proceso':
        return { value: estado, label: estado, icon: Clock };
      case 'Resuelto':
        return { value: estado, label: estado, icon: CheckCircle };
      default:
        return { value: estado, label: estado, icon: FileText };
    }
  });
}

/**
 * Cambia el estado de un hallazgo y agrega seguimiento automático
 */
export function cambiarEstado(
  hallazgo: Hallazgo,
  nuevoEstado: string
): Hallazgo {
  // Agregar seguimiento automático del cambio de estado
  const nuevoSeguimiento = {
    fecha: new Date().toISOString(),
    accion: `Cambio de estado a: ${nuevoEstado}`,
    responsable: 'Sistema',
    observaciones: `El hallazgo cambió de estado de "${hallazgo.estado}" a "${nuevoEstado}"`
  };
  
  const updates: Partial<Hallazgo> = {
    estado: nuevoEstado as any,
    seguimiento: [...hallazgo.seguimiento, nuevoSeguimiento]
  };
  
  // Si el estado es Resuelto, agregar fecha de resolución
  if (nuevoEstado === 'Resuelto') {
    updates.fechaResolucion = new Date().toISOString();
  }
  
  return { ...hallazgo, ...updates };
}

/**
 * 📝 GESTIÓN DE SEGUIMIENTO
 */

/**
 * Agrega un nuevo seguimiento a un hallazgo
 */
export function agregarSeguimiento(
  hallazgo: Hallazgo,
  seguimientoData: SeguimientoFormData
): Hallazgo {
  const nuevoSeguimiento = {
    fecha: new Date().toISOString(),
    accion: seguimientoData.accion,
    responsable: 'Sistema', // En producción sería el usuario actual
    observaciones: seguimientoData.observaciones
  };
  
  return {
    ...hallazgo,
    seguimiento: [...hallazgo.seguimiento, nuevoSeguimiento]
  };
}

/**
 * 🖼️ GESTIÓN DE EVIDENCIAS
 */

/**
 * Procesa archivos de imagen y genera previews
 */
export function processImageFiles(
  files: FileList,
  currentPreviews: string[],
  callback: (previews: string[]) => void
): void {
  const fileArray = Array.from(files);

  fileArray.forEach((file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          callback([...currentPreviews, event.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  });
}

/**
 * Remueve una imagen de la lista de previews
 */
export function removeImage(previews: string[], index: number): string[] {
  return previews.filter((_, i) => i !== index);
}

/**
 * 📄 TRANSFORMACIÓN DE DATOS
 */

/**
 * Crea datos de formulario vacíos
 */
export function createEmptyFormData(): HallazgoFormData {
  return {
    titulo: '',
    descripcion: '',
    prioridad: 'Media',
    ubicacion: '',
    coordenadas: { lat: 0, lng: 0 },
    areaProtegida: '',
    observaciones: ''
  };
}

/**
 * Convierte un hallazgo a datos de formulario para edición
 */
export function hallazgoToFormData(hallazgo: Hallazgo): HallazgoFormData {
  return {
    titulo: hallazgo.titulo,
    descripcion: hallazgo.descripcion,
    prioridad: hallazgo.prioridad,
    ubicacion: hallazgo.ubicacion,
    coordenadas: hallazgo.coordenadas || { lat: 0, lng: 0 },
    areaProtegida: hallazgo.areaProtegida,
    observaciones: hallazgo.observaciones || ''
  };
}

/**
 * Crea datos de seguimiento vacíos
 */
export function createEmptySeguimientoFormData(): SeguimientoFormData {
  return {
    accion: '',
    observaciones: ''
  };
}

/**
 * ============================================================================
 * 🌐 LLAMADAS A LA API CON CACHÉ
 * ============================================================================
 */

/**
 * Cache para hallazgos con TTL (Time To Live) de 30 segundos
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_TTL = 30000; // 30 segundos
let hallazgosCache: CacheEntry<Hallazgo[]> | null = null;

/**
 * Verifica si el cache es válido (no ha expirado)
 */
function isCacheValid(cache: CacheEntry<any> | null): boolean {
  if (!cache) return false;
  return Date.now() - cache.timestamp < CACHE_TTL;
}

/**
 * Invalida el cache de hallazgos
 */
export function invalidarCacheHallazgos(): void {
  hallazgosCache = null;
}

/**
 * Obtiene todos los hallazgos desde la base de datos
 * @param accessToken - Token de autenticación
 * @returns Promise con array de hallazgos
 */
export async function fetchHallazgos(accessToken: string): Promise<Hallazgo[]> {
  try {
    // Verificar cache
    if (isCacheValid(hallazgosCache)) {
      console.log('📦 [HallazgosService] Usando hallazgos desde caché');
      return hallazgosCache!.data;
    }

    const url = `https://${projectId}.supabase.co/functions/v1/make-server-276018ed/hallazgos`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al obtener hallazgos');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Error al obtener hallazgos');
    }

    const hallazgos = data.hallazgos || [];

    // Guardar en cache
    hallazgosCache = {
      data: hallazgos,
      timestamp: Date.now()
    };
    console.log('💾 [HallazgosService] Hallazgos guardados en caché');

    return hallazgos;
  } catch (error) {
    console.error('Error fetching hallazgos:', error);
    throw error;
  }
}

/**
 * Crea un nuevo hallazgo en la base de datos
 * @param accessToken - Token de autenticación
 * @param hallazgoData - Datos del hallazgo a crear
 * @returns Promise con el hallazgo creado
 */
export async function createHallazgoAPI(
  accessToken: string,
  hallazgoData: HallazgoFormData
): Promise<Hallazgo> {
  try {
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-276018ed/hallazgos`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(hallazgoData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al crear hallazgo');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Error al crear hallazgo');
    }

    // Invalidar cache después de crear
    invalidarCacheHallazgos();

    return data.hallazgo;
  } catch (error) {
    console.error('Error creating hallazgo:', error);
    throw error;
  }
}

/**
 * Cambia el estado de un hallazgo
 * @param accessToken - Token de autenticación
 * @param hallazgoId - ID del hallazgo
 * @param nuevoEstado - Nuevo estado
 * @returns Promise con el hallazgo actualizado
 */
export async function cambiarEstadoAPI(
  accessToken: string,
  hallazgoId: string,
  nuevoEstado: string
): Promise<Hallazgo> {
  try {
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-276018ed/hallazgos/${hallazgoId}/estado`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nuevoEstado })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al cambiar estado');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Error al cambiar estado');
    }

    // Invalidar cache después de cambiar estado
    invalidarCacheHallazgos();

    return data.hallazgo;
  } catch (error) {
    console.error('Error changing estado:', error);
    throw error;
  }
}

/**
 * Elimina un hallazgo de la base de datos
 * @param accessToken - Token de autenticación
 * @param hallazgoId - ID del hallazgo a eliminar
 * @returns Promise<void>
 */
export async function deleteHallazgoAPI(
  accessToken: string,
  hallazgoId: string
): Promise<void> {
  try {
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-276018ed/hallazgos/${hallazgoId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al eliminar hallazgo');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Error al eliminar hallazgo');
    }

    // Invalidar cache después de eliminar
    invalidarCacheHallazgos();
  } catch (error) {
    console.error('Error deleting hallazgo:', error);
    throw error;
  }
}

/**
 * Agrega un seguimiento a un hallazgo en la base de datos
 * @param accessToken - Token de autenticación
 * @param hallazgoId - ID del hallazgo
 * @param seguimientoData - Datos del seguimiento
 * @returns Promise con el seguimiento creado
 */
export async function agregarSeguimientoAPI(
  accessToken: string,
  hallazgoId: string,
  seguimientoData: SeguimientoFormData
): Promise<any> {
  try {
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-276018ed/hallazgos/${hallazgoId}/seguimiento`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(seguimientoData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al agregar seguimiento');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Error al agregar seguimiento');
    }

    // Invalidar cache después de agregar seguimiento
    invalidarCacheHallazgos();

    return data.seguimiento;
  } catch (error) {
    console.error('Error adding seguimiento:', error);
    throw error;
  }
}

/**
 * 📊 GENERACIÓN DE REPORTES PDF
 */

/**
 * Genera un reporte PDF de un hallazgo
 */
export function generarReportePDF(
  hallazgo: Hallazgo,
  areasProtegidas: AreaProtegida[],
  guardarecursos: Guardarecurso[]
): { success: boolean; fileName?: string; error?: string } {
  try {
    const pdf = new jsPDF();
    const area = areasProtegidas.find(a => a.id === hallazgo.areaProtegida);
    const guardarecurso = guardarecursos.find(g => g.id === hallazgo.guardarecurso);
    
    let yPosition = 20;
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Encabezado
    pdf.setFillColor(34, 139, 34); // Verde CONAP
    pdf.rect(0, 0, pageWidth, 40, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.text('CONAP', margin, 15);
    
    pdf.setFontSize(12);
    pdf.text('Consejo Nacional de Áreas Protegidas', margin, 25);
    pdf.text('Guatemala', margin, 32);
    
    yPosition = 50;

    // Título del reporte
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.text('REPORTE DE HALLAZGO', margin, yPosition);
    yPosition += 10;

    // Línea separadora
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Información del hallazgo
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('INFORMACIÓN GENERAL', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    
    // Título
    pdf.setFont(undefined, 'bold');
    pdf.text('Título:', margin, yPosition);
    pdf.setFont(undefined, 'normal');
    const tituloLines = pdf.splitTextToSize(hallazgo.titulo, contentWidth - 30);
    pdf.text(tituloLines, margin + 30, yPosition);
    yPosition += (tituloLines.length * 5) + 3;

    // Prioridad
    pdf.setFont(undefined, 'bold');
    pdf.text('Prioridad:', margin, yPosition);
    pdf.setFont(undefined, 'normal');
    pdf.text(hallazgo.prioridad, margin + 30, yPosition);
    yPosition += 6;

    // Estado
    pdf.setFont(undefined, 'bold');
    pdf.text('Estado:', margin, yPosition);
    pdf.setFont(undefined, 'normal');
    pdf.text(hallazgo.estado, margin + 30, yPosition);
    yPosition += 6;

    // Área Protegida
    pdf.setFont(undefined, 'bold');
    pdf.text('Área Protegida:', margin, yPosition);
    pdf.setFont(undefined, 'normal');
    pdf.text(area?.nombre || 'N/A', margin + 30, yPosition);
    yPosition += 6;

    // Guardarecurso
    pdf.setFont(undefined, 'bold');
    pdf.text('Reportado por:', margin, yPosition);
    pdf.setFont(undefined, 'normal');
    pdf.text(guardarecurso ? `${guardarecurso.nombre} ${guardarecurso.apellido}` : 'N/A', margin + 30, yPosition);
    yPosition += 6;

    // Ubicación
    pdf.setFont(undefined, 'bold');
    pdf.text('Ubicación:', margin, yPosition);
    pdf.setFont(undefined, 'normal');
    const ubicacionLines = pdf.splitTextToSize(hallazgo.ubicacion, contentWidth - 30);
    pdf.text(ubicacionLines, margin + 30, yPosition);
    yPosition += (ubicacionLines.length * 5) + 3;

    // Coordenadas
    if (hallazgo.coordenadas) {
      pdf.setFont(undefined, 'bold');
      pdf.text('Coordenadas:', margin, yPosition);
      pdf.setFont(undefined, 'normal');
      pdf.text(`${hallazgo.coordenadas.lat.toFixed(6)}, ${hallazgo.coordenadas.lng.toFixed(6)}`, margin + 30, yPosition);
      yPosition += 6;
    }

    // Fecha de reporte
    pdf.setFont(undefined, 'bold');
    pdf.text('Fecha de Reporte:', margin, yPosition);
    pdf.setFont(undefined, 'normal');
    pdf.text(format(new Date(hallazgo.fechaReporte), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es }), margin + 30, yPosition);
    yPosition += 6;

    // Fecha de resolución
    if (hallazgo.fechaResolucion) {
      pdf.setFont(undefined, 'bold');
      pdf.text('Fecha de Resolución:', margin, yPosition);
      pdf.setFont(undefined, 'normal');
      pdf.text(format(new Date(hallazgo.fechaResolucion), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es }), margin + 30, yPosition);
      yPosition += 8;
    }

    yPosition += 5;

    // Descripción
    pdf.setFontSize(14);
    pdf.setFont(undefined, 'bold');
    pdf.text('DESCRIPCIÓN', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(10);
    pdf.setFont(undefined, 'normal');
    const descripcionLines = pdf.splitTextToSize(hallazgo.descripcion, contentWidth);
    pdf.text(descripcionLines, margin, yPosition);
    yPosition += (descripcionLines.length * 5) + 8;

    // Observaciones
    if (hallazgo.observaciones) {
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('OBSERVACIONES', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      const observacionesLines = pdf.splitTextToSize(hallazgo.observaciones, contentWidth);
      pdf.text(observacionesLines, margin, yPosition);
      yPosition += (observacionesLines.length * 5) + 8;
    }

    // Acciones tomadas
    if (hallazgo.accionesTomadas) {
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('ACCIONES TOMADAS', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      const accionesLines = pdf.splitTextToSize(hallazgo.accionesTomadas, contentWidth);
      pdf.text(accionesLines, margin, yPosition);
      yPosition += (accionesLines.length * 5) + 8;
    }

    // Verificar si necesitamos una nueva página
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    // Evidencias
    if (hallazgo.evidencias && hallazgo.evidencias.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('EVIDENCIAS FOTOGRÁFICAS', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Se registraron ${hallazgo.evidencias.length} evidencia(s) fotográfica(s)`, margin, yPosition);
      yPosition += 8;
    }

    // Historial de seguimiento
    if (hallazgo.seguimiento && hallazgo.seguimiento.length > 0) {
      // Verificar si necesitamos una nueva página
      if (yPosition > 220) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('HISTORIAL DE SEGUIMIENTO', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(9);
      hallazgo.seguimiento.forEach((seg, index) => {
        // Verificar si necesitamos una nueva página
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFont(undefined, 'bold');
        pdf.text(`${index + 1}. ${format(new Date(seg.fecha), "d/MM/yyyy HH:mm", { locale: es })}`, margin, yPosition);
        yPosition += 5;

        pdf.setFont(undefined, 'normal');
        pdf.text(`Acción: ${seg.accion}`, margin + 5, yPosition);
        yPosition += 5;

        pdf.text(`Responsable: ${seg.responsable}`, margin + 5, yPosition);
        yPosition += 5;

        if (seg.observaciones) {
          const obsLines = pdf.splitTextToSize(`Observaciones: ${seg.observaciones}`, contentWidth - 5);
          pdf.text(obsLines, margin + 5, yPosition);
          yPosition += (obsLines.length * 4) + 5;
        } else {
          yPosition += 3;
        }
      });
    }

    // Pie de página
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pdf.internal.pageSize.height - 10,
        { align: 'center' }
      );
      pdf.text(
        `Generado el ${format(new Date(), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}`,
        margin,
        pdf.internal.pageSize.height - 10
      );
    }

    // Guardar el PDF
    const fileName = `Reporte_Hallazgo_${hallazgo.id}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
    pdf.save(fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error al generar el reporte:', error);
    return { success: false, error: 'No se pudo generar el archivo PDF' };
  }
}

/**
 * Servicio de Hallazgos - Export centralizado
 */
export const hallazgosService = {
  // API
  fetchHallazgos,
  createHallazgoAPI,
  cambiarEstadoAPI,
  deleteHallazgoAPI,
  agregarSeguimientoAPI,
  
  // Cache
  invalidarCacheHallazgos,
  
  // Filtrado
  filterHallazgos,
  getHallazgosActivos,
  getHallazgosResueltos,
  
  // Estilos
  getPrioridadInfo,
  getEstadoBadgeVariant,
  
  // CRUD (local)
  createHallazgo,
  updateHallazgo,
  
  // Estados
  getNextEstados,
  cambiarEstado,
  
  // Seguimiento
  agregarSeguimiento,
  
  // Evidencias
  processImageFiles,
  removeImage,
  
  // Transformación
  createEmptyFormData,
  hallazgoToFormData,
  createEmptySeguimientoFormData,
  
  // PDF
  generarReportePDF
};
