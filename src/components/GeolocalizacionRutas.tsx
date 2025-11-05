import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Route, Navigation, Eye, Calendar, User, FileText } from 'lucide-react';
import { guardarecursos, areasProtegidas } from '../data/mock-data';
import { Actividad } from '../types';
import { motion } from 'motion/react';
import { actividadesSync } from '../utils/actividadesSync';
import { 
  filterStyles, 
  listCardStyles, 
  formStyles, 
  buttonStyles,
  badgeStyles,
  layoutStyles,
  animationStyles,
  getActividadTopLineColor 
} from '../styles/shared-styles';
import { geolocalizacionService } from '../utils/geolocalizacionService';

interface GeolocalizacionRutasProps {
  userPermissions: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
  currentUser?: any;
}

export function GeolocalizacionRutas({ userPermissions, currentUser }: GeolocalizacionRutasProps) {
  const [actividadesList, setActividadesList] = useState<Actividad[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRuta, setSelectedRuta] = useState<Actividad | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Estados para el reporte
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportGuardarecurso, setReportGuardarecurso] = useState('');
  const [reportFechaInicio, setReportFechaInicio] = useState('');
  const [reportFechaFin, setReportFechaFin] = useState('');

  // Determinar si el usuario actual es un guardarecurso
  const isGuardarecurso = currentUser?.rol === 'Guardarecurso';
  const currentGuardarecursoId = isGuardarecurso ? currentUser?.id : null;

  // Suscribirse a cambios en actividades
  useEffect(() => {
    const unsubscribe = actividadesSync.subscribe((actividades) => {
      setActividadesList(actividades);
    });

    return unsubscribe;
  }, []);

  // Filtrar rutas completadas usando el servicio
  const rutasCompletadas = useMemo(() => {
    return geolocalizacionService.filterRutasCompletadas(
      actividadesList,
      searchTerm,
      isGuardarecurso,
      currentGuardarecursoId
    );
  }, [actividadesList, isGuardarecurso, currentGuardarecursoId, searchTerm]);

  const handleViewRuta = (actividad: Actividad) => {
    setSelectedRuta(actividad);
    setIsViewDialogOpen(true);
  };

  const handleGenerarReporte = () => {
    // Validar parámetros usando el servicio
    const validacion = geolocalizacionService.validarParametrosReporte({
      guardarecurso: reportGuardarecurso,
      fechaInicio: reportFechaInicio,
      fechaFin: reportFechaFin
    });
    
    if (!validacion.valido) {
      alert(validacion.mensaje);
      return;
    }
    
    // Filtrar rutas usando el servicio
    const rutasParaReporte = geolocalizacionService.filtrarRutasParaReporte(
      rutasCompletadas,
      {
        guardarecurso: reportGuardarecurso,
        fechaInicio: reportFechaInicio,
        fechaFin: reportFechaFin
      }
    );
    
    // Generar contenido del reporte usando el servicio
    const reportContent = geolocalizacionService.generarContenidoReporte(
      rutasParaReporte,
      guardarecursos,
      areasProtegidas,
      {
        guardarecurso: reportGuardarecurso,
        fechaInicio: reportFechaInicio,
        fechaFin: reportFechaFin
      }
    );
    
    // Descargar reporte usando el servicio
    geolocalizacionService.descargarReporte(reportContent);
    
    // Cerrar el diálogo
    setIsReportDialogOpen(false);
  };

  // Calcular estadísticas usando el servicio
  const estadisticas = useMemo(() => {
    return geolocalizacionService.calcularEstadisticasRutas(rutasCompletadas);
  }, [rutasCompletadas]);

  const renderRutaCard = (actividad: Actividad, index: number) => {
    const guardarecurso = guardarecursos.find(g => g.id === actividad.guardarecurso);
    
    return (
      <motion.div
        key={actividad.id}
        {...animationStyles.cardMotion(index)}
      >
        <Card className={`${listCardStyles.card} relative overflow-hidden`}>
          {/* Línea decorativa superior VERDE (actividad completada) */}
          <div className={getActividadTopLineColor(actividad.estado)} />
          
          <CardContent className={listCardStyles.content}>
            {/* Header con título y badge */}
            <div className={listCardStyles.header}>
              <div className={listCardStyles.headerContent}>
                <h3 className={listCardStyles.title}>
                  {actividad.descripcion}
                </h3>
                <Badge className={badgeStyles.estado.completada}>
                  Completada
                </Badge>
              </div>
            </div>

            {/* Información de la ruta */}
            <div className={listCardStyles.infoSection}>
              {/* Fecha usando el servicio */}
              <div className={listCardStyles.infoItem}>
                <Calendar className={listCardStyles.infoIcon} />
                <div className={listCardStyles.infoText}>
                  <div>{geolocalizacionService.formatearFechaRuta(actividad.fecha)}</div>
                </div>
              </div>

              {/* Guardarecurso */}
              {guardarecurso && !isGuardarecurso && (
                <div className={listCardStyles.infoItem}>
                  <User className={listCardStyles.infoIcon} />
                  <div className={listCardStyles.infoText}>
                    <div>{guardarecurso.nombre} {guardarecurso.apellido}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Botón de ver detalles */}
            <Button
              size="sm"
              variant="outline"
              className={buttonStyles.outlineFull}
              onClick={() => handleViewRuta(actividad)}
            >
              <Eye className="h-4 w-4 mr-1.5" />
              Ver Ruta Completa
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Búsqueda - Diseño Minimalista sin filtros */}
      <div className={filterStyles.filterGroupNoBorder}>
        {/* Búsqueda */}
        <div className={filterStyles.searchContainer}>
          <div className={filterStyles.searchContainerWrapper}>
            <Search className={filterStyles.searchIcon} />
            <Input
              placeholder="Buscar rutas por descripción o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={filterStyles.searchInput}
            />
          </div>
        </div>
        
        {/* Botón de Generar Reporte */}
        <Button
          variant="outline"
          onClick={() => setIsReportDialogOpen(true)}
          className={buttonStyles.bulkUploadButton}
        >
          <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
          Generar Reporte
        </Button>
      </div>

      {/* Grid principal: Rutas */}
      <div className="grid grid-cols-1 gap-4">
        {/* Grid de rutas */}
        <div>
          {rutasCompletadas.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 sm:p-12">
                <div className="text-center">
                  <Route className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-30" />
                  <h3 className="mb-2 text-sm sm:text-base">No hay rutas disponibles</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                    {searchTerm 
                      ? 'No se encontraron rutas que coincidan con tu búsqueda'
                      : 'No hay rutas de patrullaje completadas en el sistema'}
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchTerm('')}
                  >
                    Limpiar búsqueda
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {rutasCompletadas.map((actividad, index) => renderRutaCard(actividad, index))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog de detalles con visualización de ruta */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className={formStyles.dialogContentLarge}>
          <DialogHeader className={formStyles.dialogHeader}>
            <DialogTitle className={formStyles.dialogTitle}>
              Detalles de Ruta de Patrullaje
            </DialogTitle>
            <DialogDescription className={formStyles.dialogDescription}>
              Información detallada y visualización GPS de la ruta completada
            </DialogDescription>
          </DialogHeader>
          
          {selectedRuta && (() => {
            const guardarecurso = guardarecursos.find(g => g.id === selectedRuta.guardarecurso);
            
            return (
              <div className={formStyles.form}>
                {/* Información general en grid */}
                <div className={formStyles.grid}>
                  {/* Descripción */}
                  <div className={formStyles.field}>
                    <Label className={formStyles.label}>Descripción</Label>
                    <p className={formStyles.readOnlyValue}>{selectedRuta.descripcion}</p>
                  </div>

                  {/* Estado */}
                  <div className={formStyles.field}>
                    <Label className={formStyles.label}>Estado</Label>
                    <div className="mt-1">
                      <Badge className={badgeStyles.estado.completada}>
                        Completada
                      </Badge>
                    </div>
                  </div>

                  {/* Fecha usando el servicio */}
                  <div className={formStyles.field}>
                    <Label className={formStyles.label}>Fecha</Label>
                    <p className={formStyles.readOnlyValue}>
                      {geolocalizacionService.formatearFechaRutaCompleta(selectedRuta.fecha)}
                    </p>
                  </div>

                  {/* Guardarecurso */}
                  <div className={formStyles.field}>
                    <Label className={formStyles.label}>Usuario</Label>
                    <p className={formStyles.readOnlyValue}>
                      {guardarecurso ? `${guardarecurso.nombre} ${guardarecurso.apellido}` : 'No asignado'}
                    </p>
                  </div>
                </div>

              {/* Mapa de la ruta */}
              {geolocalizacionService.tieneGPS(selectedRuta) ? (
                <div className={formStyles.section}>
                  <div className="mb-3">
                    <Label className={formStyles.sectionTitle}>
                      <Navigation className="h-4 w-4 text-green-600 dark:text-green-400 inline-block mr-2" />
                      Visualización de Ruta GPS
                    </Label>
                  </div>
                  
                  {/* Mapa SVG - Usando el servicio para convertir coordenadas */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900/50">
                    <svg viewBox="0 0 400 300" className="w-full h-auto">
                      {/* Fondo limpio */}
                      <rect width="400" height="300" fill="currentColor" className="text-gray-50 dark:text-gray-900/50" />
                      
                      {(() => {
                        // Convertir ruta a coordenadas SVG usando el servicio
                        const puntosSVG = geolocalizacionService.convertirRutaASVG(selectedRuta.ruta!);
                        const pathD = geolocalizacionService.generarPathSVG(puntosSVG);
                        
                        return (
                          <>
                            {/* Línea de la ruta */}
                            <path
                              d={pathD}
                              stroke="currentColor"
                              strokeWidth="2.5"
                              fill="none"
                              className="text-blue-500 dark:text-blue-400"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            
                            {/* Puntos de la ruta */}
                            {puntosSVG.map((point, index) => (
                              <g key={index}>
                                <circle
                                  cx={point.x}
                                  cy={point.y}
                                  r="5"
                                  fill="currentColor"
                                  className={
                                    index === 0 
                                      ? "text-green-500 dark:text-green-400" 
                                      : index === puntosSVG.length - 1 
                                      ? "text-red-500 dark:text-red-400" 
                                      : "text-blue-500 dark:text-blue-400"
                                  }
                                />
                                
                                {/* Etiqueta de Inicio - posicionada arriba */}
                                {index === 0 && (
                                  <text
                                    x={point.x}
                                    y={point.y - 12}
                                    textAnchor="middle"
                                    className="text-xs fill-green-600 dark:fill-green-400"
                                    style={{ fontWeight: 600 }}
                                  >
                                    Inicio
                                  </text>
                                )}
                                
                                {/* Etiqueta de Fin - posicionada abajo */}
                                {index === puntosSVG.length - 1 && (
                                  <text
                                    x={point.x}
                                    y={point.y + 18}
                                    textAnchor="middle"
                                    className="text-xs fill-red-600 dark:fill-red-400"
                                    style={{ fontWeight: 600 }}
                                  >
                                    Fin
                                  </text>
                                )}
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                    
                    {/* Leyenda minimalista */}
                    <div className="flex items-center justify-center gap-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        Punto Inicial
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                        Recorrido
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        Punto Final
                      </div>
                    </div>
                  </div>
                  
                  {/* Estadísticas usando el servicio */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="flex flex-col items-center p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-2xl text-gray-900 dark:text-gray-100 mb-0.5">
                        {selectedRuta.ruta!.length}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Puntos GPS</p>
                    </div>
                    
                    <div className="flex flex-col items-center p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-2xl text-gray-900 dark:text-gray-100 mb-0.5">
                        {geolocalizacionService.calcularDuracionRuta(selectedRuta.ruta!.length)} min
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Duración</p>
                    </div>
                    
                    <div className="flex flex-col items-center p-2.5 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-2xl text-gray-900 dark:text-gray-100 mb-0.5">
                        {geolocalizacionService.calcularDistanciaRuta()} km
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Distancia</p>
                    </div>
                  </div>
                </div>
              ) : (
                <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Navigation className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      <div>
                        <p className="font-medium text-yellow-800 dark:text-yellow-200">Sin datos GPS</p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Esta ruta no tiene información de geolocalización registrada
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Observaciones */}
              {selectedRuta.observaciones && (
                <div className={formStyles.field}>
                  <Label className={formStyles.label}>Observaciones</Label>
                  <Card className="mt-2 border-gray-200 dark:border-gray-700">
                    <CardContent className="p-3">
                      <p className="text-sm">{selectedRuta.observaciones}</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Footer con botón de cerrar */}
              <div className={formStyles.footer}>
                <Button
                  variant="outline"
                  className={formStyles.cancelButton}
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Dialog para generar reporte */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className={formStyles.dialogContent}>
          <DialogHeader className={formStyles.dialogHeader}>
            <DialogTitle className={formStyles.dialogTitle}>
              Generar Reporte de Rutas
            </DialogTitle>
            <DialogDescription className={formStyles.dialogDescription}>
              Configure los parámetros para generar el reporte de geolocalización
            </DialogDescription>
          </DialogHeader>

          <div className={formStyles.form}>
            {/* Selección de Guardarecurso */}
            <div className={formStyles.field}>
              <Label className={formStyles.label}>Guardarecurso *</Label>
              <Select value={reportGuardarecurso} onValueChange={setReportGuardarecurso}>
                <SelectTrigger className={formStyles.input}>
                  <SelectValue placeholder="Seleccionar guardarecurso" />
                </SelectTrigger>
                <SelectContent>
                  {guardarecursos.map(g => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.nombre} {g.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rango de Fechas */}
            <div className={formStyles.grid}>
              <div className={formStyles.field}>
                <Label className={formStyles.label}>Fecha Inicio</Label>
                <Input
                  type="date"
                  value={reportFechaInicio}
                  onChange={(e) => setReportFechaInicio(e.target.value)}
                  className={formStyles.input}
                />
              </div>

              <div className={formStyles.field}>
                <Label className={formStyles.label}>Fecha Fin</Label>
                <Input
                  type="date"
                  value={reportFechaFin}
                  onChange={(e) => setReportFechaFin(e.target.value)}
                  className={formStyles.input}
                />
              </div>
            </div>

            {/* Footer con botones */}
            <div className={formStyles.footer}>
              <Button
                variant="outline"
                className={formStyles.cancelButton}
                onClick={() => setIsReportDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className={formStyles.submitButton}
                onClick={handleGenerarReporte}
                disabled={!reportGuardarecurso}
              >
                <FileText className="h-4 w-4 mr-2" />
                Generar Reporte
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
