import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { CheckSquare, Clock, Activity, TrendingUp, FileText, Download } from 'lucide-react';
import { actividades, guardarecursos } from '../data/mock-data';
import { filterStyles, tableStyles, buttonStyles, formStyles, cardStyles } from '../styles/shared-styles';
import { toast } from 'sonner@2.0.3';
import { seguimientoCumplimientoService, MetricaCumplimiento } from '../utils/seguimientoCumplimientoService';

interface SeguimientoCumplimientoProps {
  userPermissions: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
  currentUser?: any;
}

export function SeguimientoCumplimiento({ userPermissions, currentUser }: SeguimientoCumplimientoProps) {
  const [metricas] = useState<MetricaCumplimiento[]>([
    {
      id: '1',
      nombre: 'Actividades Completadas',
      descripcion: 'Número de actividades completadas exitosamente',
      tipo: 'Actividades',
      meta: 30,
      actual: 28,
      unidad: 'actividades',
      periodo: 'Mensual',
      guardarecurso: '1',
      fechaInicio: '2024-09-01',
      fechaFin: '2024-09-30'
    },
    {
      id: '2',
      nombre: 'Puntualidad en Actividades',
      descripcion: 'Porcentaje de actividades iniciadas a tiempo',
      tipo: 'Tiempo',
      meta: 95,
      actual: 92,
      unidad: '%',
      periodo: 'Mensual',
      guardarecurso: '1',
      fechaInicio: '2024-09-01',
      fechaFin: '2024-09-30'
    },
    {
      id: '3',
      nombre: 'Calidad de Reportes',
      descripcion: 'Calificación promedio de calidad en reportes',
      tipo: 'Calidad',
      meta: 4.5,
      actual: 4.2,
      unidad: '/5',
      periodo: 'Mensual',
      guardarecurso: '2',
      fechaInicio: '2024-09-01',
      fechaFin: '2024-09-30'
    },
    {
      id: '4',
      nombre: 'Cobertura de Área',
      descripcion: 'Porcentaje del área cubierta en patrullajes',
      tipo: 'Objetivos',
      meta: 100,
      actual: 85,
      unidad: '%',
      periodo: 'Mensual',
      guardarecurso: '1',
      fechaInicio: '2024-09-01',
      fechaFin: '2024-09-30'
    },
    {
      id: '5',
      nombre: 'Reportes Entregados',
      descripcion: 'Número de reportes entregados a tiempo',
      tipo: 'Actividades',
      meta: 20,
      actual: 19,
      unidad: 'reportes',
      periodo: 'Mensual',
      guardarecurso: '2',
      fechaInicio: '2024-09-01',
      fechaFin: '2024-09-30'
    },
    {
      id: '6',
      nombre: 'Hallazgos Reportados',
      descripcion: 'Número de hallazgos identificados y reportados',
      tipo: 'Objetivos',
      meta: 15,
      actual: 18,
      unidad: 'hallazgos',
      periodo: 'Mensual',
      guardarecurso: '1',
      fechaInicio: '2024-09-01',
      fechaFin: '2024-09-30'
    }
  ]);

  const [selectedPeriodo, setSelectedPeriodo] = useState('Mensual');
  const [selectedGuardarecurso, setSelectedGuardarecurso] = useState<string>('todos');
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedGuardarecursosForReport, setSelectedGuardarecursosForReport] = useState<string[]>([]);

  // Determinar si el usuario actual es un guardarecurso usando el servicio
  const isGuardarecurso = seguimientoCumplimientoService.isGuardarecursoRole(currentUser);

  // Filtrar métricas usando el servicio
  const filteredMetricas = useMemo(() => {
    return seguimientoCumplimientoService.filterMetricas(
      metricas,
      selectedPeriodo,
      selectedGuardarecurso,
      currentUser
    );
  }, [metricas, selectedPeriodo, selectedGuardarecurso, currentUser]);

  // Calcular estadísticas generales usando el servicio
  const estadisticasGenerales = useMemo(() => {
    return seguimientoCumplimientoService.calcularEstadisticasGenerales(
      actividades,
      metricas,
      currentUser
    );
  }, [actividades, metricas, currentUser]);

  const handleToggleGuardarecurso = (guardarecursoId: string) => {
    setSelectedGuardarecursosForReport(
      seguimientoCumplimientoService.toggleGuardarecurso(
        selectedGuardarecursosForReport,
        guardarecursoId
      )
    );
  };

  const handleToggleAllGuardarecursos = () => {
    setSelectedGuardarecursosForReport(
      seguimientoCumplimientoService.toggleAllGuardarecursos(
        selectedGuardarecursosForReport,
        guardarecursos
      )
    );
  };

  const handleGenerarReporte = () => {
    if (isGuardarecurso) {
      // Si es guardarecurso, generar reporte directamente
      const guardarecursosIds = seguimientoCumplimientoService.getGuardarecursosIdsForReport(currentUser);
      if (guardarecursosIds) {
        generarPDFReporte(guardarecursosIds);
      }
    } else {
      // Si es admin/coordinador, abrir diálogo de selección
      setSelectedGuardarecursosForReport([]);
      setIsReportDialogOpen(true);
    }
  };

  const handleConfirmarGenerarReporte = () => {
    // Validar usando el servicio
    const validation = seguimientoCumplimientoService.validateReportGeneration(
      selectedGuardarecursosForReport
    );

    if (!validation.valid) {
      toast.error('Error', {
        description: validation.message
      });
      return;
    }

    generarPDFReporte(selectedGuardarecursosForReport);
    setIsReportDialogOpen(false);
  };

  const generarPDFReporte = (guardarecursosIds: string[]) => {
    toast.info('Generando reporte', {
      description: 'Preparando documento PDF...'
    });

    const result = seguimientoCumplimientoService.generarReportePDF(
      guardarecursosIds,
      metricas,
      guardarecursos,
      selectedPeriodo
    );

    if (result.success) {
      toast.success('Reporte generado', {
        description: 'El archivo PDF ha sido descargado correctamente'
      });
    } else {
      toast.error('Error al generar reporte', {
        description: result.error || 'No se pudo generar el archivo PDF. Por favor intente de nuevo.'
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de filtros - Diseño Minimalista */}
      <div className={filterStyles.filterGroupNoBorder}>
        <div className={filterStyles.selectWrapper}>
          <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
            <SelectTrigger className={filterStyles.selectTrigger}>
              <SelectValue placeholder="Seleccionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Diario">Diario</SelectItem>
              <SelectItem value="Semanal">Semanal</SelectItem>
              <SelectItem value="Mensual">Mensual</SelectItem>
              <SelectItem value="Trimestral">Trimestral</SelectItem>
              <SelectItem value="Anual">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Filtro por guardarecurso - Solo visible para Administrador y Coordinador */}
        {!isGuardarecurso && (
          <div className={filterStyles.selectWrapper}>
            <Select value={selectedGuardarecurso} onValueChange={setSelectedGuardarecurso}>
              <SelectTrigger className={filterStyles.selectTrigger}>
                <SelectValue placeholder="Todos los guardarecursos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los guardarecursos</SelectItem>
                {guardarecursos.map(g => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.nombre} {g.apellido}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Botón Generar Reporte */}
        <Button
          onClick={handleGenerarReporte}
          className={buttonStyles.primary}
        >
          <FileText className="h-4 w-4 mr-2" />
          Generar Reporte
        </Button>
      </div>

      {/* Diálogo de selección de guardarecursos para reporte */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className={formStyles.dialogContent}>
          <DialogHeader className={formStyles.dialogHeader}>
            <DialogTitle className={formStyles.dialogTitle}>
              Generar Reporte de Cumplimiento
            </DialogTitle>
            <DialogDescription className={formStyles.dialogDescription}>
              Seleccione los guardarecursos a incluir en el reporte
            </DialogDescription>
          </DialogHeader>

          <div className={formStyles.form}>
            {/* Opción para seleccionar todos */}
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <Checkbox
                id="select-all"
                checked={selectedGuardarecursosForReport.length === guardarecursos.length}
                onCheckedChange={handleToggleAllGuardarecursos}
              />
              <Label
                htmlFor="select-all"
                className="text-sm font-medium cursor-pointer flex-1"
              >
                Seleccionar todos los guardarecursos
              </Label>
            </div>

            {/* Lista de guardarecursos */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {guardarecursos.map((guardarecurso) => (
                <div
                  key={guardarecurso.id}
                  className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <Checkbox
                    id={`guardarecurso-${guardarecurso.id}`}
                    checked={selectedGuardarecursosForReport.includes(guardarecurso.id)}
                    onCheckedChange={() => handleToggleGuardarecurso(guardarecurso.id)}
                  />
                  <Label
                    htmlFor={`guardarecurso-${guardarecurso.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {guardarecurso.nombre} {guardarecurso.apellido}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {guardarecurso.area}
                    </div>
                  </Label>
                </div>
              ))}
            </div>

            {/* Contador de seleccionados */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {selectedGuardarecursosForReport.length} de {guardarecursos.length} guardarecursos seleccionados
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReportDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleConfirmarGenerarReporte}
                className={`${buttonStyles.primary} w-full sm:w-auto`}
              >
                <Download className="h-4 w-4 mr-2" />
                Generar Reporte
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vista de cards para móvil - visible solo en pantallas pequeñas */}
      <div className="md:hidden space-y-3">
        {filteredMetricas.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Activity className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    No hay métricas disponibles
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Intenta ajustar los filtros seleccionados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredMetricas.map((metrica) => {
            const porcentaje = seguimientoCumplimientoService.calcularPorcentajeCumplimiento(metrica.actual, metrica.meta);
            const guardarecurso = guardarecursos.find(g => g.id === metrica.guardarecurso);
            
            return (
              <Card key={metrica.id} className="relative overflow-hidden border-gray-200 dark:border-gray-700">
                {/* Línea superior indicando nivel de cumplimiento */}
                <div className={
                  porcentaje >= 90
                    ? cardStyles.topLine.green
                    : porcentaje >= 75
                    ? cardStyles.topLine.yellow
                    : porcentaje >= 60
                    ? cardStyles.topLine.orange
                    : cardStyles.topLine.red
                }></div>
                <CardContent className="p-4 pt-5">
                  {/* Header con nombre y descripción */}
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {metrica.nombre}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {metrica.descripcion}
                    </p>
                    {!isGuardarecurso && guardarecurso && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {guardarecurso.nombre} {guardarecurso.apellido}
                      </p>
                    )}
                  </div>

                  {/* Barra de progreso */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Progreso</span>
                      <span className={`text-lg font-semibold ${seguimientoCumplimientoService.getColorPorcentaje(porcentaje)}`}>
                        {porcentaje.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={porcentaje} 
                      className={`h-2.5 ${seguimientoCumplimientoService.getProgressBarClass(porcentaje)}`}
                    />
                  </div>

                  {/* Información de meta y actual */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Actual</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {metrica.actual} {metrica.unidad}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Meta</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {metrica.meta} {metrica.unidad}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Vista de tabla para desktop - visible solo en pantallas grandes */}
      <div className="hidden md:block">
        <Card className={tableStyles.card}>
          <div className={tableStyles.wrapper}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={tableStyles.headerCell}>Métrica</TableHead>
                  <TableHead className={tableStyles.headerCell}>Progreso</TableHead>
                  <TableHead className={`${tableStyles.headerCell} hidden lg:table-cell`}>Actual / Meta</TableHead>
                  <TableHead className={tableStyles.headerCellRight}>Cumplimiento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMetricas.map((metrica) => {
                  const porcentaje = seguimientoCumplimientoService.calcularPorcentajeCumplimiento(metrica.actual, metrica.meta);
                  const guardarecurso = guardarecursos.find(g => g.id === metrica.guardarecurso);
                  
                  return (
                    <TableRow key={metrica.id} className={tableStyles.row}>
                      <TableCell className={tableStyles.cell}>
                        <div className="space-y-1">
                          <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            {metrica.nombre}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                            {metrica.descripcion}
                          </div>
                          {!isGuardarecurso && guardarecurso && (
                            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {guardarecurso.nombre} {guardarecurso.apellido}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={tableStyles.cell}>
                        <div className="w-full min-w-[100px] max-w-[200px]">
                          <Progress 
                            value={porcentaje} 
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell className={`${tableStyles.cell} hidden lg:table-cell`}>
                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          {metrica.actual} / {metrica.meta} {metrica.unidad}
                        </div>
                      </TableCell>
                      <TableCell className={`${tableStyles.cell} text-right`}>
                        <div className={`text-lg font-semibold ${seguimientoCumplimientoService.getColorPorcentaje(porcentaje)}`}>
                          {porcentaje.toFixed(1)}%
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            
            {filteredMetricas.length === 0 && (
              <div className="text-center py-12 text-muted-foreground border-t border-gray-100 dark:border-gray-800">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm">No hay métricas disponibles para los filtros seleccionados</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
