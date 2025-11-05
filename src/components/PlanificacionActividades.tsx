import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Plus, Edit, Search, Calendar as CalendarIcon, Clock, MapPin, Users, Shield, CheckCircle, AlertCircle, XCircle, Play, MoreVertical, Binoculars, Wrench, GraduationCap, Eye, Map, ChevronDown, Activity, User, FileText, Flame, TreePine, Sprout, Upload, Download } from 'lucide-react';
import { actividades, guardarecursos, areasProtegidas } from '../data/mock-data';
import { Actividad } from '../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'motion/react';
import { actividadesSync } from '../utils/actividadesSync';
import { buttonStyles, filterStyles, badgeStyles, formStyles, listCardStyles, layoutStyles, cardStyles, getActividadTopLineColor } from '../styles/shared-styles';
import { actividadesService, ActividadFormData, TipoActividad, EstadoActividad } from '../utils/actividadesService';

interface PlanificacionActividadesProps {
  userPermissions: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
}

export function PlanificacionActividades({ userPermissions }: PlanificacionActividadesProps) {
  const [actividadesList, setActividadesList] = useState<any[]>([]);

  // Inicializar y sincronizar actividades
  useEffect(() => {
    // Inicializar el sync con todas las actividades desde mock-data
    actividadesSync.updateActividades(actividades);
    
    // Suscribirse a cambios
    const unsubscribe = actividadesSync.subscribe((actividades) => {
      setActividadesList(actividades);
    });

    return unsubscribe;
  }, []); // Solo ejecutar una vez al montar
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<string>('todos');
  const [selectedGuardarecurso, setSelectedGuardarecurso] = useState<string>('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [editingActividad, setEditingActividad] = useState<Actividad | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [bulkGuardarecurso, setBulkGuardarecurso] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  

  
  // Usar servicio para crear form data vacío
  const [formData, setFormData] = useState<ActividadFormData>(actividadesService.createEmptyFormData());

  // Filtrado usando el servicio
  const filteredActividades = useMemo(() => {
    return actividadesService.filterActividadesProgramadas(
      actividadesList,
      searchTerm,
      selectedTipo,
      selectedGuardarecurso
    );
  }, [actividadesList, searchTerm, selectedTipo, selectedGuardarecurso]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingActividad) {
      // Actualizar usando el servicio
      const actividadActualizada = actividadesService.updateActividad(editingActividad, formData);
      actividadesSync.updateActividad(editingActividad.id, actividadActualizada);
    } else {
      // Crear usando el servicio
      const nuevaActividad = actividadesService.createActividad(formData);
      actividadesSync.addActividad(nuevaActividad);
    }
    
    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData(actividadesService.createEmptyFormData());
    setSelectedDate(undefined);
    setEditingActividad(null);
  };

  // Función para descargar plantilla Excel (usando servicio)
  const handleDownloadTemplate = () => {
    const csvContent = actividadesService.generateTemplateCSV();
    
    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_actividades_conap.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para manejar la carga del archivo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Función para procesar el archivo CSV (usando servicio)
  const handleProcessBulkUpload = () => {
    if (!selectedFile || !bulkGuardarecurso) {
      alert('Por favor seleccione un guardarecurso y un archivo');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      
      // Procesar CSV usando el servicio
      const result = actividadesService.processBulkUploadCSV(text, bulkGuardarecurso);
      
      // Agregar las actividades creadas al sync
      result.actividades.forEach(actividad => {
        actividadesSync.addActividad(actividad);
      });
      
      // Mostrar errores en consola
      if (result.errores.length > 0) {
        console.group('❌ Errores en la carga masiva:');
        result.errores.forEach(error => console.error(error));
        console.groupEnd();
      }
      
      // Mostrar resumen usando el servicio
      const mensaje = actividadesService.generateBulkUploadSummary(result);
      alert(mensaje);
      
      setIsBulkUploadOpen(false);
      setBulkGuardarecurso('');
      setSelectedFile(null);
    };
    
    reader.readAsText(selectedFile);
  };

  const handleEdit = (actividad: Actividad) => {
    setFormData(actividadesService.actividadToFormData(actividad));
    // Validar que la fecha sea válida antes de crear el objeto Date
    if (actividad.fecha && actividad.horaInicio) {
      const fechaHora = `${actividad.fecha}T${actividad.horaInicio}`;
      const fechaObj = new Date(fechaHora);
      if (!isNaN(fechaObj.getTime())) {
        setSelectedDate(fechaObj);
      } else {
        setSelectedDate(undefined);
      }
    } else {
      setSelectedDate(undefined);
    }
    setEditingActividad(actividad);
    setIsDialogOpen(true);
  };



  // Usar funciones del servicio para estilos
  const getTipoColor = (tipo: string) => {
    return actividadesService.getTipoColor(tipo);
  };

  const getEstadoInfo = (estado: EstadoActividad) => {
    const info = actividadesService.getEstadoInfo(estado);
    const iconMap: Record<string, any> = {
      'Clock': Clock,
      'Play': Play,
      'CheckCircle': CheckCircle,
      'AlertCircle': AlertCircle
    };
    return {
      ...info,
      icon: iconMap[info.icon] || AlertCircle
    };
  };

  const getTipoIcon = (tipo: string) => {
    const iconName = actividadesService.getTipoIcon(tipo);
    const iconMap: Record<string, any> = {
      'Binoculars': Binoculars,
      'Flame': Flame,
      'Wrench': Wrench,
      'TreePine': TreePine,
      'Sprout': Sprout,
      'CalendarIcon': CalendarIcon
    };
    return iconMap[iconName] || CalendarIcon;
  };

  const getEstadoBadgeClass = (estado: EstadoActividad) => {
    return actividadesService.getEstadoBadgeClass(estado);
  };

  const getEstadoIcon = (estado: EstadoActividad) => {
    const iconName = actividadesService.getEstadoIcon(estado);
    const iconMap: Record<string, any> = {
      'Clock': Clock,
      'Play': Play,
      'CheckCircle': CheckCircle,
      'XCircle': XCircle
    };
    return iconMap[iconName] || XCircle;
  };

  const tiposActividad = actividadesService.getAllTipos();

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda y filtros - Diseño Minimalista */}
      <div className={filterStyles.filterGroupNoBorder}>
        {/* Búsqueda */}
        <div className={filterStyles.searchContainer}>
          <div className={filterStyles.searchContainerWrapper}>
            <Search className={filterStyles.searchIcon} />
            <Input
              placeholder="Buscar actividades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={filterStyles.searchInput}
            />
          </div>
        </div>
        
        {/* Filtro por tipo */}
        <div className={filterStyles.selectWrapper}>
          <Select value={selectedTipo} onValueChange={setSelectedTipo}>
            <SelectTrigger className={filterStyles.selectTrigger}>
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los tipos</SelectItem>
              {tiposActividad.map(tipo => (
                <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por guardarecurso */}
        <div className={filterStyles.selectWrapper}>
          <Select value={selectedGuardarecurso} onValueChange={setSelectedGuardarecurso}>
            <SelectTrigger className={filterStyles.selectTrigger}>
              <SelectValue placeholder="Todos los guardarecursos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los guardarecursos</SelectItem>
              {guardarecursos.map(gr => (
                <SelectItem key={gr.id} value={gr.id}>
                  {gr.nombre} {gr.apellido}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Botones de acción */}
        {userPermissions.canCreate && (
          <>
            <Button 
              variant="outline"
              onClick={() => {
                setBulkGuardarecurso('');
                setSelectedFile(null);
                setIsBulkUploadOpen(true);
              }}
              className={buttonStyles.bulkUploadButton}
            >
              <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
              Carga Masiva
            </Button>
            
            <Button 
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className={buttonStyles.createButton}
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
              Nuevo
            </Button>
          </>
        )}
      </div>

      {/* Diálogo para crear/editar */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className={formStyles.dialogContent}>
            <DialogHeader className={formStyles.dialogHeader}>
              <DialogTitle className={formStyles.dialogTitle}>
                {editingActividad ? 'Editar Actividad' : 'Nueva Actividad'}
              </DialogTitle>
              <DialogDescription className={formStyles.dialogDescription}>
                Complete la información de la actividad
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className={formStyles.form}>
              {/* Información General */}
              <div className={formStyles.section}>
                <h3 className={formStyles.sectionTitle}>Información General</h3>
                
                <div className={formStyles.grid}>
                  <div className={formStyles.field}>
                    <Label htmlFor="codigo" className={formStyles.label}>Código *</Label>
                    <Input
                      id="codigo"
                      value={formData.codigo || ''}
                      onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                      placeholder="ACT-2024-001"
                      className={formStyles.input}
                      required
                    />
                  </div>
                  
                  <div className={formStyles.field}>
                    <Label htmlFor="tipo" className={formStyles.label}>Tipo de Actividad *</Label>
                    <Select value={formData.tipo} onValueChange={(value) => setFormData({...formData, tipo: value})}>
                      <SelectTrigger className={formStyles.selectTrigger}>
                        <SelectValue placeholder="Seleccione tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposActividad.map(tipo => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className={formStyles.field}>
                    <Label htmlFor="guardarecurso" className={formStyles.label}>Guardarecurso Asignado *</Label>
                    <Select value={formData.guardarecurso} onValueChange={(value) => setFormData({...formData, guardarecurso: value})}>
                      <SelectTrigger className={formStyles.selectTrigger}>
                        <SelectValue placeholder="Seleccione guardarecurso" />
                      </SelectTrigger>
                      <SelectContent>
                        {guardarecursos.map(g => {
                          const area = areasProtegidas.find(a => a.id === g.areaAsignada);
                          return (
                            <SelectItem key={g.id} value={g.id}>
                              {g.nombre} {g.apellido} - {area?.nombre || 'Sin área asignada'}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className={formStyles.fieldFullWidth}>
                    <Label htmlFor="descripcion" className={formStyles.label}>Descripción *</Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                      placeholder="Describa la actividad a realizar..."
                      rows={3}
                      required
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Programación */}
              <div className={formStyles.section}>
                <h3 className={formStyles.sectionTitle}>Programación</h3>
                
                <div className={formStyles.grid}>
                  <div className={formStyles.field}>
                    <Label htmlFor="fechaHoraProgramacion" className={formStyles.label}>Fecha y Hora de Programación *</Label>
                    <Input
                      id="fechaHoraProgramacion"
                      type="datetime-local"
                      value={formData.fecha && formData.horaInicio 
                        ? `${formData.fecha}T${formData.horaInicio}` 
                        : ''}
                      onChange={(e) => {
                        const datetime = e.target.value;
                        if (datetime) {
                          const [fecha, hora] = datetime.split('T');
                          setFormData({
                            ...formData, 
                            fecha: fecha,
                            horaInicio: hora
                          });
                          // Actualizar selectedDate para consistencia
                          setSelectedDate(new Date(datetime));
                        }
                      }}
                      className={formStyles.input}
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Footer con botones */}
              <div className={formStyles.footer}>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                  className={formStyles.cancelButton}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className={formStyles.submitButton}
                >
                  Guardar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      {/* Diálogo de Carga Masiva */}
      <Dialog open={isBulkUploadOpen} onOpenChange={setIsBulkUploadOpen}>
        <DialogContent className={formStyles.dialogContent}>
          <DialogHeader className={formStyles.dialogHeader}>
            <DialogTitle className={formStyles.dialogTitle}>
              Carga Masiva de Actividades
            </DialogTitle>
            <DialogDescription className={formStyles.dialogDescription}>
              Descargue la plantilla, complete la información y cargue el archivo
            </DialogDescription>
          </DialogHeader>
          
          <div className={formStyles.form}>
            {/* Alerta informativa */}
            <div className={`${formStyles.alertWithIcon} bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800`}>
              <div className={formStyles.alertWithIconContainer}>
                <AlertCircle className={`${formStyles.alertWithIconIcon} text-green-600 dark:text-green-400`} />
                <div className={formStyles.alertWithIconContent}>
                  <p className={`${formStyles.alertWithIconTitle} text-green-800 dark:text-green-300`}>
                    <strong>Instrucciones:</strong>
                  </p>
                  <ol className={`${formStyles.alertWithIconList} text-green-700 dark:text-green-300`}>
                    <li>Descargue la plantilla CSV haciendo clic en el botón</li>
                    <li>Complete la información de las actividades en Excel o cualquier editor CSV</li>
                    <li><strong>Importante:</strong> Use el formato de fecha <code className={`${formStyles.codeInline} bg-green-100 dark:bg-green-900/40`}>YYYY-MM-DD</code> (ej: 2025-11-15)</li>
                    <li>Seleccione el guardarecurso que será asignado a todas las actividades</li>
                    <li>Cargue el archivo completado</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Sección de descarga */}
            <div className={formStyles.section}>
              <h3 className={formStyles.sectionTitle}>1. Descargar Plantilla</h3>
              
              <div className="flex flex-col gap-3">
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    La plantilla incluye dos ejemplos con el formato correcto:
                  </p>
                  <ul className="text-xs text-gray-500 dark:text-gray-500 ml-4 space-y-1">
                    <li>• <strong>Fecha:</strong> Formato YYYY-MM-DD (ej: 2025-11-15)</li>
                    <li>• <strong>Hora:</strong> Formato HH:MM (ej: 08:00)</li>
                    <li>• <strong>Tipo:</strong> Debe coincidir con los tipos disponibles</li>
                  </ul>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDownloadTemplate}
                  className="w-full sm:w-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Plantilla CSV
                </Button>
              </div>
            </div>

            {/* Sección de selección de guardarecurso */}
            <div className={formStyles.section}>
              <h3 className={formStyles.sectionTitle}>2. Seleccionar Guardarecurso</h3>
              
              <div className={formStyles.field}>
                <Label htmlFor="bulk-guardarecurso" className={formStyles.label}>
                  Guardarecurso Asignado *
                </Label>
                <Select 
                  value={bulkGuardarecurso} 
                  onValueChange={setBulkGuardarecurso}
                >
                  <SelectTrigger className={formStyles.selectTrigger}>
                    <SelectValue placeholder="Seleccione un guardarecurso" />
                  </SelectTrigger>
                  <SelectContent>
                    {guardarecursos.map(gr => (
                      <SelectItem key={gr.id} value={gr.id}>
                        {gr.nombre} {gr.apellido}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Todas las actividades cargadas serán asignadas a este guardarecurso
                </p>
              </div>
            </div>

            {/* Sección de carga de archivo */}
            <div className={formStyles.section}>
              <h3 className={formStyles.sectionTitle}>3. Cargar Archivo</h3>
              
              <div className={formStyles.field}>
                <Label htmlFor="bulk-file" className={formStyles.label}>
                  Archivo CSV *
                </Label>
                <Input
                  id="bulk-file"
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className={formStyles.input}
                />
                {selectedFile && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    ✓ Archivo seleccionado: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>

            {/* Footer con botones */}
            <div className={formStyles.footer}>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  setIsBulkUploadOpen(false);
                  setBulkGuardarecurso('');
                  setSelectedFile(null);
                }}
                className={formStyles.cancelButton}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleProcessBulkUpload}
                disabled={!bulkGuardarecurso || !selectedFile}
                className={formStyles.submitButton}
              >
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Grid de actividades */}
      <div>
        <div>
          {filteredActividades.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 sm:p-12">
                <div className="text-center">
                  <CalendarIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-30" />
                  <h3 className="mb-2 text-sm sm:text-base">No se encontraron actividades</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                    No hay actividades que coincidan con los filtros seleccionados
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedTipo('todos');
                      setSelectedGuardarecurso('todos');
                    }}
                    className="text-xs sm:text-sm"
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className={layoutStyles.cardGrid}>
              {filteredActividades.map((actividad, index) => {
                const guardarecurso = guardarecursos.find(g => g.id === actividad.guardarecurso);
                const tipoColor = getTipoColor(actividad.tipo);
                const estadoInfo = getEstadoInfo(actividad.estado);
                const EstadoIcon = estadoInfo.icon;
                const TipoIcon = getTipoIcon(actividad.tipo);
                
                return (
                  <motion.div
                    key={actividad.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className={`${cardStyles.baseWithOverflow} ${listCardStyles.card}`}>
                      <div className={getActividadTopLineColor(actividad.estado)} />
                      <CardContent className={listCardStyles.content}>
                        {/* Header con título y acciones */}
                        <div className={listCardStyles.header}>
                          <div className={listCardStyles.headerContent}>
                            <h3 className={`${listCardStyles.title} line-clamp-2`}>
                              {actividad.descripcion}
                            </h3>
                            <div className={listCardStyles.badgeContainer}>
                              <Badge className={`${estadoInfo.badge} border ${listCardStyles.badge}`}>
                                {actividad.estado}
                              </Badge>
                            </div>
                          </div>
                          {userPermissions.canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(actividad)}
                              className={listCardStyles.actionButtonEdit}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {/* Información de la actividad */}
                        <div className={listCardStyles.infoSection}>
                          {/* Fecha */}
                          <div className={listCardStyles.infoItem}>
                            <CalendarIcon className={listCardStyles.infoIcon} />
                            <span className={listCardStyles.infoText}>
                              {actividad.fecha && !isNaN(new Date(actividad.fecha).getTime()) 
                                ? new Date(actividad.fecha).toLocaleDateString('es-GT', { 
                                    weekday: 'long',
                                    day: 'numeric', 
                                    month: 'long',
                                    year: 'numeric'
                                  })
                                : 'Fecha no especificada'
                              }
                            </span>
                          </div>

                          {/* Hora de Programación */}
                          <div className={listCardStyles.infoItem}>
                            <Clock className={listCardStyles.infoIcon} />
                            <span className={listCardStyles.infoText}>
                              {actividad.horaInicio}
                            </span>
                          </div>

                          {/* Tipo de Actividad */}
                          <div className={listCardStyles.infoItem}>
                            <FileText className={listCardStyles.infoIcon} />
                            <span className={listCardStyles.infoText}>
                              {actividad.tipo}
                            </span>
                          </div>

                          {/* Guardarecurso */}
                          {guardarecurso && (
                            <div className={listCardStyles.infoItem}>
                              <User className={listCardStyles.infoIcon} />
                              <span className={listCardStyles.infoText}>
                                {guardarecurso.nombre} {guardarecurso.apellido}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
