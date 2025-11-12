import { toast } from 'sonner@2.0.3';
import { reporteActividadesService, GuardarecursoData } from '../utils/reporteActividadesService';
import { fetchActividades } from '../utils/actividadesAPI';
import { actividadesSync } from '../utils/actividadesSync';
import { authService } from '../utils/authService';

interface ReporteActividadesMensualProps {
  guardarecurso: GuardarecursoData;
  areaNombre: string;
}

/**
 * Genera un reporte mensual de actividades en PDF
 * ACTUALIZADO: Carga actividades desde el backend antes de generar el reporte
 */
export async function generarReporteActividadesMensual({ guardarecurso, areaNombre }: ReporteActividadesMensualProps) {
  try {
    // 🔄 PASO 1: Cargar actividades desde el backend
    console.log('📡 Cargando actividades desde backend antes de generar reporte...');
    
    const accessToken = authService.getCurrentToken();
    if (!accessToken) {
      toast.error('Sesión expirada', {
        description: 'Por favor inicia sesión nuevamente'
      });
      return;
    }
    
    // Cargar y actualizar actividades en actividadesSync
    const actividadesFromServer = await fetchActividades(accessToken);
    actividadesSync.updateActividades(actividadesFromServer);
    console.log('✅ actividadesSync actualizado con', actividadesFromServer.length, 'actividades antes de generar reporte');
    
    // 📊 PASO 2: Generar el reporte con las actividades actualizadas
    const result = reporteActividadesService.generarReporteActividadesMensual(guardarecurso, areaNombre);
    
    if (result.success) {
      toast.success('Reporte generado exitosamente', {
        description: `Informe mensual de ${guardarecurso.nombre} ${guardarecurso.apellido} - ${new Date().getFullYear()} (${result.totalActividades} actividades)`
      });
    } else {
      toast.error('Error al generar el reporte', {
        description: result.error || 'No se pudo crear el archivo PDF'
      });
    }
  } catch (error) {
    console.error('❌ Error al cargar actividades o generar reporte:', error);
    toast.error('Error', {
      description: 'No se pudieron cargar las actividades. Intenta de nuevo.'
    });
  }
}

// Componente dummy - la función real es generarReporteActividadesMensual
export function ReporteActividadesMensual() {
  return null;
}