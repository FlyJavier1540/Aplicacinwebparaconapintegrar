/**
 * 📊 Reporte de Actividades Service
 * 
 * Servicio centralizado que maneja toda la lógica de generación de reportes mensuales de actividades,
 * incluyendo procesamiento de datos, agrupación y generación de PDF.
 * 
 * @module utils/reporteActividadesService
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { areasProtegidas } from '../data/mock-data';
import { actividadesSync } from './actividadesSync';
import { Actividad } from '../types';

/**
 * Interface para guardarecurso
 */
export interface GuardarecursoData {
  id: string;
  nombre: string;
  apellido: string;
  areaAsignada: string;
}

/**
 * Interface para datos agrupados de actividades
 */
export interface ActividadesAgrupadas {
  [key: string]: number;
}

/**
 * Interface para resultado de generación de reporte
 */
export interface ReporteResult {
  success: boolean;
  fileName?: string;
  error?: string;
  totalActividades?: number;
}

/**
 * Interface para actividad del reporte
 */
export interface ActividadReporte {
  no: number;
  nombre: string;
  unidad: string;
}

/**
 * 📅 CONSTANTES
 */

/**
 * Nombres de los meses (abreviados)
 */
export const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/**
 * Mapeo de tipos de actividad a categorías del reporte
 */
export const ACTIVIDAD_MAPPING: { [key: string]: number } = {
  'Patrullaje': 1,
  'Patrullaje de Control y Vigilancia': 1, // Mismo que Patrullaje
  'Control y Vigilancia': 2,
  'Ronda': 3,
  'Mantenimiento': 11,
  'Mantenimiento de Área Protegida': 11, // Mismo que Mantenimiento
  'Educación Ambiental': 13,
  'Investigación': 9,
};

/**
 * 13 actividades estándar del reporte
 */
export const ACTIVIDADES_REPORTE: ActividadReporte[] = [
  { no: 1, nombre: 'Patrullaje de control y combate', unidad: 'Día' },
  { no: 2, nombre: 'Patrullaje de control y combate según lo establecido en el plan de protección de fauna silvestre', unidad: 'Día' },
  { no: 3, nombre: 'Rondas de vigilancia', unidad: 'Día' },
  { no: 4, nombre: 'Coordinación de pesca y recolección', unidad: 'Día' },
  { no: 5, nombre: 'Coordinación con el SAT', unidad: 'Día' },
  { no: 6, nombre: 'Protección de fauna silvestre', unidad: 'Día' },
  { no: 7, nombre: 'Verificación de permisos de pesca', unidad: 'Día' },
  { no: 8, nombre: 'Referencia o denuncia', unidad: 'Día' },
  { no: 9, nombre: 'Inventarios de equipos, coordinación con INAB', unidad: 'Informe' },
  { no: 10, nombre: 'Reuniones, coordinación con SAT', unidad: 'Informe' },
  { no: 11, nombre: 'Mantenimiento de instalaciones', unidad: 'Informe' },
  { no: 12, nombre: 'Preparación de estadísticas y otros', unidad: 'Día' },
  { no: 13, nombre: 'Preparación de capacitaciones / Educación Ambiental', unidad: 'Día' }
];

/**
 * Colores CONAP
 */
export const COLORES_CONAP = {
  verde: [22, 163, 74] as [number, number, number],
  verdeOscuro: [22, 101, 52] as [number, number, number],
  grisClaro: [243, 244, 246] as [number, number, number]
};

/**
 * 📊 PROCESAMIENTO DE DATOS
 */

/**
 * Obtiene las actividades completadas de un guardarecurso
 */
export function getActividadesGuardarecurso(guardarecursoId: string): Actividad[] {
  const todasActividades = actividadesSync.getActividades();
  return todasActividades.filter(
    act => act.guardarecurso === guardarecursoId && act.estado === 'Completada'
  );
}

/**
 * Agrupa actividades por tipo y mes
 */
export function agruparActividadesPorTipoYMes(actividades: Actividad[]): ActividadesAgrupadas {
  const datosActividades: ActividadesAgrupadas = {};
  
  actividades.forEach((actividad: Actividad) => {
    const fecha = new Date(actividad.fecha);
    const mes = fecha.getMonth(); // 0-11
    const categoriaNo = ACTIVIDAD_MAPPING[actividad.tipo] || 12;
    const clave = `${categoriaNo}-${mes}`;
    
    if (!datosActividades[clave]) {
      datosActividades[clave] = 0;
    }
    datosActividades[clave]++;
  });

  return datosActividades;
}

/**
 * Genera los datos de la tabla para el PDF
 */
export function generarDatosTabla(datosActividades: ActividadesAgrupadas): any[][] {
  return ACTIVIDADES_REPORTE.map(act => {
    const fila: any[] = [act.no, act.nombre, act.unidad];
    // Agregar datos de cada mes
    for (let mes = 0; mes < 12; mes++) {
      const clave = `${act.no}-${mes}`;
      fila.push(datosActividades[clave] || '-');
    }
    return fila;
  });
}

/**
 * 📄 GENERACIÓN DE PDF
 */

/**
 * Agrega el encabezado al PDF
 */
function agregarEncabezado(doc: jsPDF): void {
  const { verde } = COLORES_CONAP;
  
  doc.setFillColor(verde[0], verde[1], verde[2]);
  doc.rect(0, 0, 280, 25, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('CONAP', 15, 12);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Consejo Nacional de Áreas Protegidas', 15, 18);
}

/**
 * Agrega la información del guardarecurso al PDF
 */
function agregarInformacionGuardarecurso(
  doc: jsPDF,
  guardarecurso: GuardarecursoData,
  areaNombre: string,
  año: number
): void {
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  
  // Guardarecurso
  doc.setFont('helvetica', 'bold');
  doc.text('Guardarecurso:', 15, 35);
  doc.setFont('helvetica', 'normal');
  doc.text(`${guardarecurso.nombre} ${guardarecurso.apellido}`, 50, 35);
  
  // Área Protegida
  doc.setFont('helvetica', 'bold');
  doc.text('Área Protegida:', 15, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(areaNombre, 50, 42);
  
  // Año
  doc.setFont('helvetica', 'bold');
  doc.text('Año:', 150, 35);
  doc.setFont('helvetica', 'normal');
  doc.text(año.toString(), 165, 35);
  
  // Fecha
  doc.setFont('helvetica', 'bold');
  doc.text('Fecha:', 150, 42);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('es-GT'), 165, 42);
}

/**
 * Agrega el título del reporte al PDF
 */
function agregarTitulo(doc: jsPDF, año: number): void {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Informe Mensual de Actividades ${año}`, 280/2, 52, { align: 'center' });
}

/**
 * Agrega la tabla de actividades al PDF
 */
function agregarTabla(doc: jsPDF, tableData: any[][]): void {
  const { grisClaro } = COLORES_CONAP;
  
  autoTable(doc, {
    head: [
      [
        { content: 'No.', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Actividad', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Unidad', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Meses del Año', colSpan: 12, styles: { halign: 'center' } }
      ],
      ['', '', '', ...MESES]
    ],
    body: tableData,
    startY: 60,
    theme: 'grid',
    styles: {
      fontSize: 6.5,
      cellPadding: 1,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: grisClaro,
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 6.5
    },
    columnStyles: {
      0: { cellWidth: 7, halign: 'center' },   // No.
      1: { cellWidth: 90, halign: 'left' },    // Actividad
      2: { cellWidth: 14, halign: 'center' },  // Unidad
      // Meses (12 columnas x 11mm = 132mm)
      3: { cellWidth: 11, halign: 'center' },
      4: { cellWidth: 11, halign: 'center' },
      5: { cellWidth: 11, halign: 'center' },
      6: { cellWidth: 11, halign: 'center' },
      7: { cellWidth: 11, halign: 'center' },
      8: { cellWidth: 11, halign: 'center' },
      9: { cellWidth: 11, halign: 'center' },
      10: { cellWidth: 11, halign: 'center' },
      11: { cellWidth: 11, halign: 'center' },
      12: { cellWidth: 11, halign: 'center' },
      13: { cellWidth: 11, halign: 'center' },
      14: { cellWidth: 11, halign: 'center' }
    },
    margin: { left: 15, right: 15 },
    tableWidth: 243
  });
}

/**
 * Agrega el pie de página al PDF
 */
function agregarFooter(doc: jsPDF, totalActividades: number): void {
  const finalY = (doc as any).lastAutoTable?.finalY || 180;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Total de actividades completadas: ${totalActividades}`, 15, finalY + 10);
  doc.text(`Documento generado automáticamente desde el Sistema de Gestión CONAP`, 15, finalY + 15);
  doc.text(`Fecha de generación: ${new Date().toLocaleString('es-GT')}`, 15, finalY + 20);
}

/**
 * 🎯 FUNCIÓN PRINCIPAL
 */

/**
 * Genera el reporte mensual de actividades en PDF
 */
export function generarReporteActividadesMensual(guardarecurso: GuardarecursoData): ReporteResult {
  try {
    // Obtener datos
    const area = areasProtegidas.find(a => a.id === guardarecurso.areaAsignada);
    const año = new Date().getFullYear();
    
    // Obtener y procesar actividades
    const actividadesGuardarecurso = getActividadesGuardarecurso(guardarecurso.id);
    const datosActividades = agruparActividadesPorTipoYMes(actividadesGuardarecurso);
    const tableData = generarDatosTabla(datosActividades);
    
    // Crear PDF
    const doc = new jsPDF('landscape', 'mm', 'letter');
    
    // Agregar secciones
    agregarEncabezado(doc);
    agregarInformacionGuardarecurso(doc, guardarecurso, area?.nombre || 'No asignada', año);
    agregarTitulo(doc, año);
    agregarTabla(doc, tableData);
    agregarFooter(doc, actividadesGuardarecurso.length);
    
    // Guardar PDF
    const nombreArchivo = `Informe_Mensual_${guardarecurso.apellido}_${año}.pdf`;
    doc.save(nombreArchivo);
    
    return {
      success: true,
      fileName: nombreArchivo,
      totalActividades: actividadesGuardarecurso.length
    };
    
  } catch (error) {
    console.error('Error al generar PDF:', error);
    return {
      success: false,
      error: 'No se pudo crear el archivo PDF'
    };
  }
}

/**
 * Servicio de Reporte de Actividades - Export centralizado
 */
export const reporteActividadesService = {
  // Procesamiento de datos
  getActividadesGuardarecurso,
  agruparActividadesPorTipoYMes,
  generarDatosTabla,
  
  // Generación de PDF
  generarReporteActividadesMensual,
  
  // Constantes
  MESES,
  ACTIVIDAD_MAPPING,
  ACTIVIDADES_REPORTE,
  COLORES_CONAP
};
