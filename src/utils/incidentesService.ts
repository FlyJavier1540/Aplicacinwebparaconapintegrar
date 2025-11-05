/**
 * 🚨 Registro de Incidentes Service
 * 
 * Servicio centralizado que maneja toda la lógica funcional del módulo de Registro de Incidentes,
 * incluyendo CRUD de incidentes, gestión de estados, seguimiento y generación de reportes PDF.
 * 
 * @module utils/incidentesService
 */

import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AreaProtegida, Guardarecurso } from '../types';
import { cardStyles } from '../styles/shared-styles';

/**
 * Interface para incidente
 */
export interface Incidente {
  id: string;
  titulo: string;
  descripcion: string;
  gravedad: 'Leve' | 'Moderado' | 'Grave' | 'Crítico';
  estado: 'Reportado' | 'En Atención' | 'Escalado' | 'Resuelto';
  areaProtegida: string;
  guardarecurso: string;
  fechaIncidente: string;
  fechaReporte: string;
  fechaResolucion?: string;
  acciones: string[];
  autoridades: string[];
  seguimiento: Array<{
    fecha: string;
    accion: string;
    responsable: string;
    observaciones: string;
  }>;
}

/**
 * Interface para datos de formulario de incidente
 */
export interface IncidenteFormData {
  titulo: string;
  descripcion: string;
  gravedad: string;
  areaProtegida: string;
}

/**
 * Interface para datos de seguimiento
 */
export interface SeguimientoFormData {
  accion: string;
  observaciones: string;
}

/**
 * 🔍 FILTRADO Y BÚSQUEDA
 */

/**
 * Filtra incidentes activos según búsqueda y rol del usuario
 */
export function filterIncidentesActivos(
  incidentes: Incidente[],
  searchTerm: string,
  currentUser?: any
): Incidente[] {
  const isGuardarecurso = currentUser?.rol === 'Guardarecurso';
  const currentGuardarecursoId = isGuardarecurso ? currentUser?.id : null;

  return incidentes.filter(i => {
    const esActivo = i.estado !== 'Resuelto';
    const matchesSearch = searchTerm === '' ||
      i.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGuardarecurso = isGuardarecurso 
      ? i.guardarecurso === currentGuardarecursoId
      : true;
    
    return esActivo && matchesSearch && matchesGuardarecurso;
  });
}

/**
 * Filtra incidentes resueltos según búsqueda y rol del usuario
 */
export function filterIncidentesResueltos(
  incidentes: Incidente[],
  searchTerm: string,
  currentUser?: any
): Incidente[] {
  const isGuardarecurso = currentUser?.rol === 'Guardarecurso';
  const currentGuardarecursoId = isGuardarecurso ? currentUser?.id : null;

  return incidentes.filter(i => {
    const esResuelto = i.estado === 'Resuelto';
    const matchesSearch = searchTerm === '' ||
      i.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGuardarecurso = isGuardarecurso 
      ? i.guardarecurso === currentGuardarecursoId
      : true;
    
    return esResuelto && matchesSearch && matchesGuardarecurso;
  });
}

/**
 * 📋 CRUD DE INCIDENTES
 */

/**
 * Crea un nuevo incidente
 */
export function createIncidente(
  formData: IncidenteFormData,
  currentUser?: any
): Incidente {
  const isGuardarecurso = currentUser?.rol === 'Guardarecurso';
  const currentGuardarecursoId = isGuardarecurso ? currentUser?.id : null;

  return {
    id: Date.now().toString(),
    ...formData,
    gravedad: formData.gravedad as any,
    estado: 'Reportado',
    areaProtegida: formData.areaProtegida || 'tikal',
    guardarecurso: currentGuardarecursoId || '1',
    fechaIncidente: new Date().toISOString(),
    fechaReporte: new Date().toISOString(),
    acciones: [],
    autoridades: [],
    seguimiento: [{
      fecha: new Date().toISOString(),
      accion: 'Reporte inicial',
      responsable: 'Sistema',
      observaciones: 'Incidente reportado a través del sistema'
    }]
  };
}

/**
 * Actualiza un incidente existente
 */
export function updateIncidente(
  incidente: Incidente,
  formData: IncidenteFormData
): Incidente {
  return {
    ...incidente,
    ...formData,
    gravedad: formData.gravedad as any
  };
}

/**
 * 📊 GESTIÓN DE ESTADOS
 */

/**
 * Obtiene los estados permitidos según el estado actual
 */
export function getEstadosPermitidos(estadoActual: string): string[] {
  const estadosPermitidos: Record<string, string[]> = {
    'Reportado': ['En Atención', 'Escalado'],
    'En Atención': ['Escalado', 'Resuelto'],
    'Escalado': ['En Atención', 'Resuelto'],
    'Resuelto': []
  };

  return estadosPermitidos[estadoActual] || [];
}

/**
 * Valida si un cambio de estado es permitido
 */
export function isEstadoChangeValid(estadoActual: string, nuevoEstado: string): boolean {
  const permitidos = getEstadosPermitidos(estadoActual);
  return permitidos.includes(nuevoEstado);
}

/**
 * Cambia el estado de un incidente
 */
export function cambiarEstado(
  incidente: Incidente,
  nuevoEstado: string
): Incidente {
  const nuevoSeguimiento = {
    fecha: new Date().toISOString(),
    accion: `Cambio de estado a ${nuevoEstado}`,
    responsable: 'Usuario Actual',
    observaciones: `Estado cambiado de ${incidente.estado} a ${nuevoEstado}`
  };

  const updates: Partial<Incidente> = {
    estado: nuevoEstado as any,
    seguimiento: [...incidente.seguimiento, nuevoSeguimiento]
  };

  if (nuevoEstado === 'Resuelto') {
    updates.fechaResolucion = new Date().toISOString();
  }

  return { ...incidente, ...updates };
}

/**
 * 📝 GESTIÓN DE SEGUIMIENTO
 */

/**
 * Agrega un nuevo seguimiento a un incidente
 */
export function agregarSeguimiento(
  incidente: Incidente,
  seguimientoData: SeguimientoFormData
): Incidente {
  const nuevoSeguimiento = {
    fecha: new Date().toISOString(),
    accion: seguimientoData.accion,
    responsable: 'Usuario Actual',
    observaciones: seguimientoData.observaciones
  };

  return {
    ...incidente,
    seguimiento: [...incidente.seguimiento, nuevoSeguimiento]
  };
}

/**
 * 🎨 FUNCIONES DE UI
 */

/**
 * Obtiene la clase de color para la línea superior del card según el estado
 */
export function getIncidenteTopLineColor(estado: string): string {
  const estadoLower = estado.toLowerCase().replace(/\s+/g, '');
  
  switch (estadoLower) {
    case 'reportado':
      return cardStyles.topLine.blue;
    case 'enatencion':
    case 'enatención':
      return cardStyles.topLine.gray;
    case 'escalado':
      return cardStyles.topLine.orange;
    case 'resuelto':
      return cardStyles.topLine.green;
    default:
      return cardStyles.topLine.blue;
  }
}

/**
 * 📄 TRANSFORMACIÓN DE DATOS
 */

/**
 * Crea datos de formulario vacíos
 */
export function createEmptyFormData(): IncidenteFormData {
  return {
    titulo: '',
    descripcion: '',
    gravedad: 'Leve',
    areaProtegida: '',
    personasInvolucradas: '',
    observaciones: ''
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
 * 🔧 VALIDACIONES
 */

/**
 * Verifica si el usuario es guardarecurso
 */
export function isGuardarecursoRole(currentUser?: any): boolean {
  return currentUser?.rol === 'Guardarecurso';
}

/**
 * 📄 GENERACIÓN DE REPORTES PDF
 */

/**
 * Genera un reporte PDF de un incidente
 */
export function generarReportePDF(
  incidente: Incidente,
  areasProtegidas: AreaProtegida[],
  guardarecursos: Guardarecurso[]
): { success: boolean; fileName?: string; error?: string } {
  try {
    const pdf = new jsPDF();
    const area = areasProtegidas.find(a => a.id === incidente.areaProtegida);
    const guardarecurso = guardarecursos.find(g => g.id === incidente.guardarecurso);
    
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
    pdf.text('REPORTE DE INCIDENTE', margin, yPosition);
    yPosition += 10;

    // Línea separadora
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Información del incidente
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
    const tituloLines = pdf.splitTextToSize(incidente.titulo, contentWidth - 30);
    pdf.text(tituloLines, margin + 30, yPosition);
    yPosition += (tituloLines.length * 5) + 3;

    // Gravedad
    pdf.setFont(undefined, 'bold');
    pdf.text('Gravedad:', margin, yPosition);
    pdf.setFont(undefined, 'normal');
    pdf.text(incidente.gravedad, margin + 30, yPosition);
    yPosition += 6;

    // Estado
    pdf.setFont(undefined, 'bold');
    pdf.text('Estado:', margin, yPosition);
    pdf.setFont(undefined, 'normal');
    pdf.text(incidente.estado, margin + 30, yPosition);
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

    // Fecha de incidente
    pdf.setFont(undefined, 'bold');
    pdf.text('Fecha del Incidente:', margin, yPosition);
    pdf.setFont(undefined, 'normal');
    pdf.text(format(new Date(incidente.fechaIncidente), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es }), margin + 30, yPosition);
    yPosition += 6;

    // Fecha de reporte
    pdf.setFont(undefined, 'bold');
    pdf.text('Fecha de Reporte:', margin, yPosition);
    pdf.setFont(undefined, 'normal');
    pdf.text(format(new Date(incidente.fechaReporte), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es }), margin + 30, yPosition);
    yPosition += 6;

    // Fecha de resolución
    if (incidente.fechaResolucion) {
      pdf.setFont(undefined, 'bold');
      pdf.text('Fecha de Resolución:', margin, yPosition);
      pdf.setFont(undefined, 'normal');
      pdf.text(format(new Date(incidente.fechaResolucion), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es }), margin + 30, yPosition);
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
    const descripcionLines = pdf.splitTextToSize(incidente.descripcion, contentWidth);
    pdf.text(descripcionLines, margin, yPosition);
    yPosition += (descripcionLines.length * 5) + 8;

    // Personas Involucradas
    if (incidente.personasInvolucradas && incidente.personasInvolucradas.trim()) {
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('PERSONAS INVOLUCRADAS', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      const personasLines = pdf.splitTextToSize(incidente.personasInvolucradas, contentWidth);
      pdf.text(personasLines, margin, yPosition);
      yPosition += (personasLines.length * 5) + 8;
    }

    // Acciones Tomadas
    if (incidente.acciones && incidente.acciones.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('ACCIONES TOMADAS', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      incidente.acciones.forEach((accion) => {
        pdf.text(`• ${accion}`, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 3;
    }

    // Observaciones
    if (incidente.observaciones) {
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('OBSERVACIONES', margin, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont(undefined, 'normal');
      const observacionesLines = pdf.splitTextToSize(incidente.observaciones, contentWidth);
      pdf.text(observacionesLines, margin, yPosition);
      yPosition += (observacionesLines.length * 5) + 8;
    }

    // Verificar si necesitamos una nueva página
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    // Historial de seguimiento
    if (incidente.seguimiento && incidente.seguimiento.length > 0) {
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
      incidente.seguimiento.forEach((seg, index) => {
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
    const fileName = `Reporte_Incidente_${incidente.id}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
    pdf.save(fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error al generar el reporte:', error);
    return { success: false, error: 'No se pudo generar el archivo PDF' };
  }
}

/**
 * Servicio de Incidentes - Export centralizado
 */
export const incidentesService = {
  // Filtrado
  filterIncidentesActivos,
  filterIncidentesResueltos,
  
  // CRUD
  createIncidente,
  updateIncidente,
  
  // Estados
  getEstadosPermitidos,
  isEstadoChangeValid,
  cambiarEstado,
  
  // Seguimiento
  agregarSeguimiento,
  
  // UI
  getIncidenteTopLineColor,
  
  // Transformación
  createEmptyFormData,
  createEmptySeguimientoFormData,
  
  // Validaciones
  isGuardarecursoRole,
  
  // PDF
  generarReportePDF
};
