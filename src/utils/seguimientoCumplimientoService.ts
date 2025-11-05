/**
 * 📊 Seguimiento de Cumplimiento Service
 * 
 * Servicio centralizado que maneja toda la lógica funcional del módulo de Seguimiento de Cumplimiento,
 * incluyendo filtrado de métricas, cálculos de porcentajes, estadísticas y generación de reportes PDF.
 * 
 * @module utils/seguimientoCumplimientoService
 */

import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Actividad, Guardarecurso } from '../types';

/**
 * Interface para métrica de cumplimiento
 */
export interface MetricaCumplimiento {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'Actividades' | 'Tiempo' | 'Calidad' | 'Objetivos';
  meta: number;
  actual: number;
  unidad: string;
  periodo: 'Diario' | 'Semanal' | 'Mensual' | 'Trimestral' | 'Anual';
  guardarecurso?: string;
  fechaInicio: string;
  fechaFin: string;
}

/**
 * Interface para estadísticas generales
 */
export interface EstadisticasGenerales {
  totalActividades: number;
  completadas: number;
  enProgreso: number;
  programadas: number;
  cumplimientoPromedio: number;
}

/**
 * 🔍 FILTRADO DE MÉTRICAS
 */

/**
 * Filtra métricas según período, guardarecurso y rol del usuario
 */
export function filterMetricas(
  metricas: MetricaCumplimiento[],
  periodo: string,
  selectedGuardarecurso: string,
  currentUser?: any
): MetricaCumplimiento[] {
  const isGuardarecurso = currentUser?.rol === 'Guardarecurso';
  const currentGuardarecursoId = isGuardarecurso ? currentUser?.id : null;

  return metricas.filter(m => {
    const matchesPeriodo = m.periodo === periodo;
    
    // Si es guardarecurso, filtrar solo sus métricas
    const matchesGuardarecurso = isGuardarecurso 
      ? m.guardarecurso === currentGuardarecursoId
      : selectedGuardarecurso === 'todos' || m.guardarecurso === selectedGuardarecurso;
    
    return matchesPeriodo && matchesGuardarecurso;
  });
}

/**
 * 📊 CÁLCULOS Y ESTADÍSTICAS
 */

/**
 * Calcula el porcentaje de cumplimiento
 */
export function calcularPorcentajeCumplimiento(actual: number, meta: number): number {
  return Math.min((actual / meta) * 100, 100);
}

/**
 * Obtiene la clase de color según el porcentaje
 */
export function getColorPorcentaje(porcentaje: number): string {
  if (porcentaje >= 90) return 'text-green-600 dark:text-green-400';
  if (porcentaje >= 75) return 'text-yellow-600 dark:text-yellow-400';
  if (porcentaje >= 60) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

/**
 * Obtiene la clase de color para la línea superior del card
 */
export function getTopLineClass(porcentaje: number): string {
  if (porcentaje >= 90) return 'h-1 bg-gradient-to-r from-green-500 to-emerald-500';
  if (porcentaje >= 75) return 'h-1 bg-gradient-to-r from-yellow-500 to-amber-500';
  if (porcentaje >= 60) return 'h-1 bg-gradient-to-r from-orange-500 to-red-500';
  return 'h-1 bg-gradient-to-r from-red-500 to-rose-500';
}

/**
 * Obtiene la clase de color para la barra de progreso
 */
export function getProgressBarClass(porcentaje: number): string {
  if (porcentaje >= 90) return '[&>*]:bg-green-600 dark:[&>*]:bg-green-500';
  if (porcentaje >= 75) return '[&>*]:bg-yellow-600 dark:[&>*]:bg-yellow-500';
  if (porcentaje >= 60) return '[&>*]:bg-orange-600 dark:[&>*]:bg-orange-500';
  return '[&>*]:bg-red-600 dark:[&>*]:bg-red-500';
}

/**
 * Calcula estadísticas generales del cumplimiento
 */
export function calcularEstadisticasGenerales(
  actividades: Actividad[],
  metricas: MetricaCumplimiento[],
  currentUser?: any
): EstadisticasGenerales {
  const isGuardarecurso = currentUser?.rol === 'Guardarecurso';
  const currentGuardarecursoId = isGuardarecurso ? currentUser?.id : null;

  // Filtrar actividades según el rol del usuario
  const actividadesParaEstadisticas = isGuardarecurso 
    ? actividades.filter(a => a.guardarecurso === currentGuardarecursoId)
    : actividades;
  
  // Filtrar métricas según el rol del usuario
  const metricasParaEstadisticas = isGuardarecurso 
    ? metricas.filter(m => m.guardarecurso === currentGuardarecursoId)
    : metricas;
  
  return {
    totalActividades: actividadesParaEstadisticas.length,
    completadas: actividadesParaEstadisticas.filter(a => a.estado === 'Completada').length,
    enProgreso: actividadesParaEstadisticas.filter(a => a.estado === 'En Progreso').length,
    programadas: actividadesParaEstadisticas.filter(a => a.estado === 'Programada').length,
    cumplimientoPromedio: metricasParaEstadisticas.length > 0 
      ? metricasParaEstadisticas.reduce((acc, m) => acc + calcularPorcentajeCumplimiento(m.actual, m.meta), 0) / metricasParaEstadisticas.length
      : 0
  };
}

/**
 * 👥 GESTIÓN DE SELECCIÓN DE GUARDARECURSOS
 */

/**
 * Alterna la selección de un guardarecurso
 */
export function toggleGuardarecurso(
  selectedIds: string[],
  guardarecursoId: string
): string[] {
  if (selectedIds.includes(guardarecursoId)) {
    return selectedIds.filter(id => id !== guardarecursoId);
  } else {
    return [...selectedIds, guardarecursoId];
  }
}

/**
 * Alterna la selección de todos los guardarecursos
 */
export function toggleAllGuardarecursos(
  selectedIds: string[],
  allGuardarecursos: Guardarecurso[]
): string[] {
  if (selectedIds.length === allGuardarecursos.length) {
    return [];
  } else {
    return allGuardarecursos.map(g => g.id);
  }
}

/**
 * Verifica si debe mostrar el diálogo de selección
 */
export function shouldShowSelectionDialog(currentUser?: any): boolean {
  return currentUser?.rol !== 'Guardarecurso';
}

/**
 * Obtiene los IDs de guardarecursos para el reporte
 */
export function getGuardarecursosIdsForReport(
  currentUser?: any
): string[] | null {
  if (currentUser?.rol === 'Guardarecurso') {
    return [currentUser.id];
  }
  return null; // Requiere selección
}

/**
 * 📄 GENERACIÓN DE REPORTES PDF
 */

/**
 * Genera un reporte PDF de cumplimiento
 */
export function generarReportePDF(
  guardarecursosIds: string[],
  metricas: MetricaCumplimiento[],
  guardarecursos: Guardarecurso[],
  periodo: string
): { success: boolean; fileName?: string; error?: string } {
  try {
    const pdf = new jsPDF();
    let yPosition = 20;
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Encabezado
    pdf.setFillColor(34, 139, 34);
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
    pdf.text('REPORTE DE CUMPLIMIENTO', margin, yPosition);
    yPosition += 8;

    pdf.setFontSize(12);
    pdf.text(`Período: ${periodo}`, margin, yPosition);
    yPosition += 6;
    pdf.text(`Fecha de generación: ${format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })}`, margin, yPosition);
    yPosition += 10;

    // Línea separadora
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Iterar por cada guardarecurso seleccionado
    guardarecursosIds.forEach((guardarecursoId, index) => {
      const guardarecurso = guardarecursos.find(g => g.id === guardarecursoId);
      if (!guardarecurso) return;

      // Verificar si necesitamos una nueva página
      if (yPosition > 250 && index > 0) {
        pdf.addPage();
        yPosition = 20;
      }

      // Información del guardarecurso
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Guardarecurso: ${guardarecurso.nombre} ${guardarecurso.apellido}`, margin, yPosition);
      yPosition += 8;

      // Obtener métricas del guardarecurso
      const metricasGuardarecurso = metricas.filter(
        m => m.guardarecurso === guardarecursoId && m.periodo === periodo
      );

      if (metricasGuardarecurso.length === 0) {
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text('No hay métricas disponibles para este período', margin + 5, yPosition);
        yPosition += 15;
        return;
      }

      // Calcular cumplimiento promedio
      const cumplimientoPromedio = metricasGuardarecurso.reduce(
        (acc, m) => acc + calcularPorcentajeCumplimiento(m.actual, m.meta),
        0
      ) / metricasGuardarecurso.length;

      pdf.setFontSize(11);
      pdf.setFont(undefined, 'bold');
      pdf.text(`Cumplimiento Promedio: ${cumplimientoPromedio.toFixed(1)}%`, margin + 5, yPosition);
      yPosition += 10;

      // Tabla de métricas
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      
      // Encabezados de tabla
      pdf.text('Métrica', margin + 5, yPosition);
      pdf.text('Meta', margin + 100, yPosition);
      pdf.text('Actual', margin + 130, yPosition);
      pdf.text('Cumpl.', margin + 160, yPosition);
      yPosition += 5;

      // Línea bajo encabezados
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 5;

      pdf.setFont(undefined, 'normal');

      metricasGuardarecurso.forEach((metrica) => {
        // Verificar si necesitamos una nueva página
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
          
          // Re-imprimir encabezados de tabla
          pdf.setFont(undefined, 'bold');
          pdf.text('Métrica', margin + 5, yPosition);
          pdf.text('Meta', margin + 100, yPosition);
          pdf.text('Actual', margin + 130, yPosition);
          pdf.text('Cumpl.', margin + 160, yPosition);
          yPosition += 5;
          pdf.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 5;
          pdf.setFont(undefined, 'normal');
        }

        const porcentaje = calcularPorcentajeCumplimiento(metrica.actual, metrica.meta);
        
        // Nombre de la métrica (con truncamiento si es muy largo)
        const nombreLines = pdf.splitTextToSize(metrica.nombre, 90);
        pdf.text(nombreLines[0], margin + 5, yPosition);
        
        pdf.text(`${metrica.meta} ${metrica.unidad}`, margin + 100, yPosition);
        pdf.text(`${metrica.actual} ${metrica.unidad}`, margin + 130, yPosition);
        
        // Color según porcentaje
        if (porcentaje >= 90) {
          pdf.setTextColor(34, 139, 34); // Verde
        } else if (porcentaje >= 75) {
          pdf.setTextColor(234, 179, 8); // Amarillo
        } else if (porcentaje >= 60) {
          pdf.setTextColor(249, 115, 22); // Naranja
        } else {
          pdf.setTextColor(220, 38, 38); // Rojo
        }
        
        pdf.text(`${porcentaje.toFixed(1)}%`, margin + 160, yPosition);
        pdf.setTextColor(0, 0, 0); // Resetear color
        
        yPosition += 6;
      });

      yPosition += 10;
    });

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
    const fileName = `Reporte_Cumplimiento_${periodo}_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
    pdf.save(fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error al generar el reporte:', error);
    return { success: false, error: 'No se pudo generar el archivo PDF' };
  }
}

/**
 * 🔧 VALIDACIONES
 */

/**
 * Valida si se puede generar un reporte
 */
export function validateReportGeneration(selectedIds: string[]): { valid: boolean; message?: string } {
  if (selectedIds.length === 0) {
    return {
      valid: false,
      message: 'Por favor seleccione al menos un guardarecurso'
    };
  }
  return { valid: true };
}

/**
 * Verifica si el usuario es guardarecurso
 */
export function isGuardarecursoRole(currentUser?: any): boolean {
  return currentUser?.rol === 'Guardarecurso';
}

/**
 * Servicio de Seguimiento de Cumplimiento - Export centralizado
 */
export const seguimientoCumplimientoService = {
  // Filtrado
  filterMetricas,
  
  // Cálculos
  calcularPorcentajeCumplimiento,
  getColorPorcentaje,
  getTopLineClass,
  getProgressBarClass,
  calcularEstadisticasGenerales,
  
  // Gestión de selección
  toggleGuardarecurso,
  toggleAllGuardarecursos,
  shouldShowSelectionDialog,
  getGuardarecursosIdsForReport,
  
  // PDF
  generarReportePDF,
  
  // Validaciones
  validateReportGeneration,
  isGuardarecursoRole
};
