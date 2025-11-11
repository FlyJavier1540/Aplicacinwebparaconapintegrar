import { toast } from 'sonner@2.0.3';
import { reporteActividadesService, GuardarecursoData } from '../utils/reporteActividadesService';

interface ReporteActividadesMensualProps {
  guardarecurso: GuardarecursoData;
  areaNombre: string;
}

/**
 * Genera un reporte mensual de actividades en PDF
 * ACTUALIZADO: Ya no usa mock-data, recibe el nombre del área desde base de datos
 */
export function generarReporteActividadesMensual({ guardarecurso, areaNombre }: ReporteActividadesMensualProps) {
  const result = reporteActividadesService.generarReporteActividadesMensual(guardarecurso, areaNombre);
  
  if (result.success) {
    toast.success('Reporte generado exitosamente', {
      description: `Informe mensual de ${guardarecurso.nombre} ${guardarecurso.apellido} - ${new Date().getFullYear()}`
    });
  } else {
    toast.error('Error al generar el reporte', {
      description: result.error || 'No se pudo crear el archivo PDF'
    });
  }
}

// Componente dummy - la función real es generarReporteActividadesMensual
export function ReporteActividadesMensual() {
  return null;
}
