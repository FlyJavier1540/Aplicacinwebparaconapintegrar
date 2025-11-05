import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Plus, AlertTriangle, Users, MapPin, Eye, FileText, Clock, CheckCircle, AlertCircle, ListPlus, History, Search, Activity, TrendingUp, XCircle, User, Camera, Download } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { guardarecursos, areasProtegidas } from '../data/mock-data';
import { toast } from 'sonner@2.0.3';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cardStyles, badgeStyles, iconStyles, textStyles, layoutStyles, buttonStyles, filterStyles, tabStyles, formStyles, getEstadoBadgeClass, getGravedadBadgeClass, getTopLineColorByEstado } from '../styles/shared-styles';
import { incidentesService, Incidente, IncidenteFormData, SeguimientoFormData } from '../utils/incidentesService';

interface RegistroIncidentesProps {
  userPermissions?: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
  currentUser?: any;
}

export function RegistroIncidentes({ userPermissions = { canView: true, canCreate: true, canEdit: true, canDelete: true }, currentUser }: RegistroIncidentesProps) {
  const [incidentesList, setIncidentesList] = useState<Incidente[]>([
    {
      id: '1',
      titulo: 'Conflicto con visitantes por acceso restringido',
      descripcion: 'Grupo de turistas intentó acceder a zona restringida sin autorización y se mostró agresivo al ser detenido',
      gravedad: 'Moderado',
      estado: 'Resuelto',
      areaProtegida: 'tikal',
      guardarecurso: '1',
      fechaIncidente: '2024-09-01T14:30:00Z',
      fechaReporte: '2024-09-01T14:45:00Z',
      fechaResolucion: '2024-09-01T16:00:00Z',
      acciones: ['Explicación de normas', 'Redirección a zona permitida', 'Registro de incidente'],
      autoridades: [],
      seguimiento: [
        {
          fecha: '2024-09-01T14:45:00Z',
          accion: 'Reporte inicial',
          responsable: 'Carlos Mendoza',
          observaciones: 'Incidente controlado sin mayores complicaciones'
        },
        {
          fecha: '2024-09-01T15:15:00Z',
          accion: 'Intervención y mediación',
          responsable: 'Carlos Mendoza',
          observaciones: 'Se explicó la importancia de respetar las zonas restringidas'
        },
        {
          fecha: '2024-09-01T16:00:00Z',
          accion: 'Resolución',
          responsable: 'Carlos Mendoza',
          observaciones: 'Visitantes aceptaron explicación y continuaron tour en zona permitida'
        }
      ]
    },
    {
      id: '2',
      titulo: 'Solicitud de comunidad local por recursos',
      descripcion: 'Representantes de comunidad solicitan permiso para recolección de plantas medicinales',
      gravedad: 'Leve',
      estado: 'En Atención',
      areaProtegida: 'biotopo-cerro-cahui',
      guardarecurso: '2',
      fechaIncidente: '2024-08-30T10:00:00Z',
      fechaReporte: '2024-08-30T10:15:00Z',
      acciones: ['Reunión informativa', 'Documentación de solicitud'],
      autoridades: ['CONAP Regional'],
      seguimiento: [
        {
          fecha: '2024-08-30T10:15:00Z',
          accion: 'Reporte y escalación',
          responsable: 'María García',
          observaciones: 'Solicitud enviada a oficinas centrales para evaluación'
        },
        {
          fecha: '2024-09-02T09:00:00Z',
          accion: 'Reunión con comunidad',
          responsable: 'María García',
          observaciones: 'Se estableció diálogo para encontrar soluciones conjuntas'
        }
      ]
    },
    {
      id: '3',
      titulo: 'Visitantes alimentando fauna silvestre',
      descripcion: 'Turistas fueron observados alimentando monos en zona prohibida',
      gravedad: 'Leve',
      estado: 'Reportado',
      areaProtegida: 'tikal',
      guardarecurso: '1',
      fechaIncidente: '2024-09-08T11:00:00Z',
      fechaReporte: '2024-09-08T11:15:00Z',
      acciones: ['Intervención educativa', 'Decomiso de alimentos'],
      autoridades: [],
      seguimiento: [
        {
          fecha: '2024-09-08T11:15:00Z',
          accion: 'Reporte inicial',
          responsable: 'Carlos Mendoza',
          observaciones: 'Visitantes fueron educados sobre el impacto de alimentar fauna'
        }
      ]
    },
    {
      id: '4',
      titulo: 'Turistas extraviados en sendero del volcán',
      descripcion: 'Pareja de turistas se desvió del sendero principal y se extravió durante aproximadamente 2 horas en la zona de descenso del volcán',
      gravedad: 'Moderado',
      estado: 'Resuelto',
      areaProtegida: '2',
      guardarecurso: '3',
      fechaIncidente: '2024-10-14T16:30:00Z',
      fechaReporte: '2024-10-14T16:45:00Z',
      fechaResolucion: '2024-10-14T18:30:00Z',
      acciones: ['Búsqueda y rescate', 'Primeros auxilios básicos', 'Orientación y acompañamiento'],
      autoridades: [],
      seguimiento: [
        {
          fecha: '2024-10-14T16:45:00Z',
          accion: 'Reporte de emergencia',
          responsable: 'José López',
          observaciones: 'Se recibió reporte de guía turístico sobre pareja extraviada. Se inició protocolo de búsqueda.'
        },
        {
          fecha: '2024-10-14T17:15:00Z',
          accion: 'Localización de visitantes',
          responsable: 'José López',
          observaciones: 'Turistas localizados a 500 metros del sendero principal, desorientados pero en buen estado de salud.'
        },
        {
          fecha: '2024-10-14T17:45:00Z',
          accion: 'Atención y evaluación',
          responsable: 'José López',
          observaciones: 'Se proporcionó agua e hidratación. Ambos presentaban cansancio leve pero sin lesiones. Se verificó estado general.'
        },
        {
          fecha: '2024-10-14T18:30:00Z',
          accion: 'Resolución exitosa',
          responsable: 'José López',
          observaciones: 'Turistas acompañados de regreso al sendero principal y punto de partida. Se les educó sobre importancia de permanecer en senderos marcados.'
        }
      ]
    },
    {
      id: '5',
      titulo: 'Incidente con ceniza volcánica en zona turística',
      descripcion: 'Visitante sufrió irritación ocular por contacto con ceniza volcánica activa durante el recorrido cerca del cráter',
      gravedad: 'Leve',
      estado: 'En Atención',
      areaProtegida: '2',
      guardarecurso: '3',
      fechaIncidente: '2024-10-16T10:30:00Z',
      fechaReporte: '2024-10-16T10:35:00Z',
      acciones: ['Primeros auxilios', 'Lavado ocular', 'Recomendación médica'],
      autoridades: [],
      seguimiento: [
        {
          fecha: '2024-10-16T10:35:00Z',
          accion: 'Atención inmediata',
          responsable: 'José López',
          observaciones: 'Se aplicó lavado ocular con agua limpia. Visitante reporta mejoría pero persiste molestia leve.'
        },
        {
          fecha: '2024-10-16T11:00:00Z',
          accion: 'Evaluación y seguimiento',
          responsable: 'José López',
          observaciones: 'Se recomienda al visitante acudir a centro de salud más cercano para evaluación médica. Se proporcionó información de ubicación.'
        }
      ]
    },
    {
      id: '6',
      titulo: 'Visitante con lesión en tobillo durante ascenso',
      descripcion: 'Turista nacional sufrió esguince de tobillo al tropezar con roca suelta en la zona de ascenso al cráter',
      gravedad: 'Moderado',
      estado: 'Reportado',
      areaProtegida: '2',
      guardarecurso: '3',
      fechaIncidente: '2024-10-16T14:15:00Z',
      fechaReporte: '2024-10-16T14:20:00Z',
      acciones: ['Evaluación de lesión', 'Inmovilización básica', 'Asistencia en descenso'],
      autoridades: [],
      seguimiento: [
        {
          fecha: '2024-10-16T14:20:00Z',
          accion: 'Reporte inicial',
          responsable: 'José López',
          observaciones: 'Visitante presenta inflamación en tobillo derecho. Se aplicó vendaje de compresión y se asistió en el descenso con apoyo.'
        }
      ]
    },
    {
      id: '7',
      titulo: 'Grupo excedió horario permitido en área del volcán',
      descripcion: 'Grupo de 8 turistas permaneció en el área del cráter más allá del horario establecido, requiriendo escolta de regreso en condiciones de baja visibilidad',
      gravedad: 'Leve',
      estado: 'Resuelto',
      areaProtegida: '2',
      guardarecurso: '3',
      fechaIncidente: '2024-10-15T17:45:00Z',
      fechaReporte: '2024-10-15T17:50:00Z',
      fechaResolucion: '2024-10-15T18:45:00Z',
      acciones: ['Ubicación del grupo', 'Escolta segura al punto de partida', 'Educación sobre normativas'],
      autoridades: [],
      seguimiento: [
        {
          fecha: '2024-10-15T17:50:00Z',
          accion: 'Reporte y búsqueda',
          responsable: 'José López',
          observaciones: 'Grupo localizado en zona del cráter 45 minutos después del horario límite. Condiciones de visibilidad comenzaban a deteriorarse.'
        },
        {
          fecha: '2024-10-15T18:15:00Z',
          accion: 'Escolta de regreso',
          responsable: 'José López',
          observaciones: 'Se proporcionó escolta al grupo utilizando linternas. Todos los visitantes descendieron sin incidentes.'
        },
        {
          fecha: '2024-10-15T18:45:00Z',
          accion: 'Resolución y educación',
          responsable: 'José López',
          observaciones: 'Se explicó la importancia de respetar horarios por seguridad. Guía turístico fue informado sobre las normativas y consecuencias.'
        }
      ]
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIncidente, setEditingIncidente] = useState<Incidente | null>(null);
  const [selectedIncidente, setSelectedIncidente] = useState<Incidente | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isSeguimientoDialogOpen, setIsSeguimientoDialogOpen] = useState(false);
  const [incidenteParaSeguimiento, setIncidenteParaSeguimiento] = useState<Incidente | null>(null);
  const [activeTab, setActiveTab] = useState('activos');
  
  const [formData, setFormData] = useState<IncidenteFormData>(incidentesService.createEmptyFormData());
  const [seguimientoFormData, setSeguimientoFormData] = useState<SeguimientoFormData>(incidentesService.createEmptySeguimientoFormData());

  // Determinar si el usuario actual es un guardarecurso usando el servicio
  const isGuardarecurso = incidentesService.isGuardarecursoRole(currentUser);

  // Separar incidentes activos y resueltos usando el servicio
  const incidentesActivos = useMemo(() => {
    return incidentesService.filterIncidentesActivos(incidentesList, searchTerm, currentUser);
  }, [incidentesList, searchTerm, currentUser]);

  const incidentesResueltos = useMemo(() => {
    return incidentesService.filterIncidentesResueltos(incidentesList, searchTerm, currentUser);
  }, [incidentesList, searchTerm, currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingIncidente) {
      // Actualizar usando el servicio
      const incidenteActualizado = incidentesService.updateIncidente(editingIncidente, formData);
      setIncidentesList(prev => prev.map(i => 
        i.id === editingIncidente.id ? incidenteActualizado : i
      ));
      toast.success('Incidente actualizado', {
        description: 'El incidente ha sido actualizado correctamente'
      });
    } else {
      // Crear usando el servicio
      const nuevoIncidente = incidentesService.createIncidente(formData, currentUser);
      setIncidentesList(prev => [...prev, nuevoIncidente]);
      toast.success('Incidente creado', {
        description: 'El incidente ha sido reportado correctamente'
      });
    }
    
    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData(incidentesService.createEmptyFormData());
    setEditingIncidente(null);
  };

  const handleView = (incidente: Incidente) => {
    setSelectedIncidente(incidente);
    setIsViewDialogOpen(true);
  };

  const handleAgregarSeguimiento = (incidente: Incidente) => {
    setIncidenteParaSeguimiento(incidente);
    setSeguimientoFormData(incidentesService.createEmptySeguimientoFormData());
    setIsSeguimientoDialogOpen(true);
  };

  const handleSeguimientoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!incidenteParaSeguimiento) return;
    
    // Agregar seguimiento usando el servicio
    const incidenteActualizado = incidentesService.agregarSeguimiento(incidenteParaSeguimiento, seguimientoFormData);
    
    setIncidentesList(prev => prev.map(i => 
      i.id === incidenteParaSeguimiento.id ? incidenteActualizado : i
    ));
    
    toast.success('Seguimiento agregado', {
      description: 'Se ha registrado la nueva acción de seguimiento'
    });
    
    setSeguimientoFormData(incidentesService.createEmptySeguimientoFormData());
    setIsSeguimientoDialogOpen(false);
    setIncidenteParaSeguimiento(null);
  };

  const handleCambiarEstado = (incidenteId: string, nuevoEstado: string) => {
    const incidente = incidentesList.find(i => i.id === incidenteId);
    if (!incidente) return;

    // Validar cambio de estado usando el servicio
    if (!incidentesService.isEstadoChangeValid(incidente.estado, nuevoEstado)) {
      toast.error('Cambio de estado no permitido', {
        description: `No se puede cambiar de ${incidente.estado} a ${nuevoEstado}`
      });
      return;
    }

    // Cambiar estado usando el servicio
    const incidenteActualizado = incidentesService.cambiarEstado(incidente, nuevoEstado);

    setIncidentesList(prev => prev.map(i =>
      i.id === incidenteId ? incidenteActualizado : i
    ));

    toast.success('Estado actualizado', {
      description: `El incidente ahora está en estado: ${nuevoEstado}`
    });
  };

  const handleGenerarReporte = (incidente: Incidente) => {
    toast.info('Generando reporte', {
      description: 'Preparando documento PDF...'
    });

    const result = incidentesService.generarReportePDF(incidente, areasProtegidas, guardarecursos);

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

  const renderIncidenteCard = (incidente: Incidente, index: number, showActions: boolean = true) => {
    const area = areasProtegidas.find(a => a.id === incidente.areaProtegida);
    const guardarecurso = guardarecursos.find(g => g.id === incidente.guardarecurso);
    
    return (
      <motion.div
        key={incidente.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card className={cardStyles.baseWithOverflow}>
          {/* Línea decorativa superior según estado */}
          <div className={incidentesService.getIncidenteTopLineColor(incidente.estado)} />
          
          <CardContent className={cardStyles.content}>
            {/* Header con título y badges */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className={textStyles.cardTitle}>
                  {incidente.titulo}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getEstadoBadgeClass(incidente.estado)}>
                    {incidente.estado}
                  </Badge>
                  <Badge className={getGravedadBadgeClass(incidente.gravedad)}>
                    {incidente.gravedad}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Información del incidente */}
            <div className={layoutStyles.verticalSpacing}>
              {/* Ubicación */}
              {area && (
                <div className={layoutStyles.flexGap}>
                  <MapPin className={iconStyles.muted} />
                  <div className={textStyles.primary}>
                    {area.nombre}
                  </div>
                </div>
              )}

              {/* Fecha */}
              <div className={layoutStyles.flexGap}>
                <Clock className={iconStyles.muted} />
                <div className={textStyles.primary}>
                  {format(new Date(incidente.fechaIncidente), "d 'de' MMMM, yyyy", { locale: es })}
                </div>
              </div>

              {/* Guardarecurso */}
              {guardarecurso && !isGuardarecurso && (
                <div className={layoutStyles.flexGap}>
                  <FileText className={iconStyles.muted} />
                  <div className={textStyles.primary}>
                    <div>{guardarecurso.nombre} {guardarecurso.apellido}</div>
                    <div className={textStyles.secondary}>
                      Reportado por
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Descripción */}
            <p className={`${textStyles.muted} text-sm line-clamp-2 mt-4 ${layoutStyles.separatorWithPadding}`}>
              {incidente.descripcion}
            </p>

            {/* Botones de acción */}
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                className={`flex-1 ${buttonStyles.outline}`}
                onClick={() => handleView(incidente)}
              >
                <Eye className={iconStyles.withMargin} />
                <span className="text-xs">Ver</span>
              </Button>
              
              {incidente.estado === 'Resuelto' && !isGuardarecurso && (
                <Button
                  size="sm"
                  variant="outline"
                  className={`flex-1 ${buttonStyles.outline}`}
                  onClick={() => handleGenerarReporte(incidente)}
                >
                  <FileText className={iconStyles.withMargin} />
                  <span className="text-xs">Reporte</span>
                </Button>
              )}
              
              {showActions && userPermissions.canEdit && !isGuardarecurso && incidente.estado !== 'Resuelto' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className={buttonStyles.iconOnly}>
                      <ListPlus className={iconStyles.small} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-xs">Acciones</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleAgregarSeguimiento(incidente)} className="text-xs">
                      <ListPlus className="mr-2 h-3.5 w-3.5" />
                      Agregar Seguimiento
                    </DropdownMenuItem>
                    {incidente.estado === 'Reportado' && (
                      <>
                        <DropdownMenuItem onClick={() => handleCambiarEstado(incidente.id, 'En Atención')} className="text-xs">
                          <Clock className="mr-2 h-3.5 w-3.5" />
                          Pasar a En Atención
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCambiarEstado(incidente.id, 'Escalado')} className="text-xs">
                          <AlertCircle className="mr-2 h-3.5 w-3.5" />
                          Escalar Incidente
                        </DropdownMenuItem>
                      </>
                    )}
                    {incidente.estado === 'En Atención' && (
                      <>
                        <DropdownMenuItem onClick={() => handleCambiarEstado(incidente.id, 'Escalado')} className="text-xs">
                          <AlertCircle className="mr-2 h-3.5 w-3.5" />
                          Escalar Incidente
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCambiarEstado(incidente.id, 'Resuelto')} className="text-xs">
                          <CheckCircle className="mr-2 h-3.5 w-3.5" />
                          Marcar como Resuelto
                          </DropdownMenuItem>
                        </>
                      )}
                      {incidente.estado === 'Escalado' && (
                        <>
                          <DropdownMenuItem onClick={() => handleCambiarEstado(incidente.id, 'En Atención')} className="text-xs">
                            <Clock className="mr-2 h-3.5 w-3.5" />
                            Regresar a En Atención
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCambiarEstado(incidente.id, 'Resuelto')} className="text-xs">
                            <CheckCircle className="mr-2 h-3.5 w-3.5" />
                            Marcar como Resuelto
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Barra de búsqueda - Diseño Minimalista */}
      <div className={filterStyles.filterGroupNoBorder}>
        {/* Búsqueda */}
        <div className={filterStyles.searchContainer}>
          <div className={filterStyles.searchContainerWrapper}>
            <Search className={filterStyles.searchIcon} />
            <Input
              placeholder="Buscar incidentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={filterStyles.searchInput}
            />
          </div>
        </div>
        
        {/* Botón crear */}
        {userPermissions.canCreate && (
          <Button 
            onClick={() => { resetForm(); setIsDialogOpen(true); }}
            className={buttonStyles.createButton}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo
          </Button>
        )}
      </div>

      {/* Tabs e Incidentes */}
      <div>
        {/* Título para Guardarecursos */}
        {isGuardarecurso && (
          <div className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Activity className="h-5 w-5" />
            <h2 className="text-base font-medium">Mis Incidentes Activos</h2>
          </div>
        )}

        {/* Tabs Minimalistas - Solo para Admin/Coordinador */}
        {!isGuardarecurso && (
          <div className="mb-4">
            <div className={tabStyles.containerFull}>
              <button 
                onClick={() => setActiveTab('activos')}
                className={tabStyles.tabFull(activeTab === 'activos')}
              >
                <Activity className={tabStyles.icon} />
                Activos
              </button>
              <button 
                onClick={() => setActiveTab('historial')}
                className={tabStyles.tabFull(activeTab === 'historial')}
              >
                <History className={tabStyles.icon} />
                Historial
              </button>
            </div>
          </div>
        )}
        
        {/* Contenido del Tab Activos o Vista Principal para Guardarecursos */}
        {(activeTab === 'activos' || isGuardarecurso) && (
          <div className="space-y-3">
              {incidentesActivos.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No hay incidentes activos</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {incidentesActivos.map((incidente, index) => renderIncidenteCard(incidente, index, true))}
                </div>
              )}
          </div>
        )}
        
        {/* Contenido del Tab Historial - Solo para usuarios que NO son guardarecursos */}
        {activeTab === 'historial' && !isGuardarecurso && (
          <div className="space-y-3">
            {incidentesResueltos.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No hay incidentes resueltos</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {incidentesResueltos.map((incidente, index) => renderIncidenteCard(incidente, index, false))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialog para crear/editar incidente */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={formStyles.dialogContentLarge}>
          <DialogHeader className={formStyles.dialogHeader}>
            <DialogTitle className={formStyles.dialogTitle}>
              {editingIncidente ? 'Editar Incidente' : 'Nuevo Incidente'}
            </DialogTitle>
            <DialogDescription className={formStyles.dialogDescription}>
              {editingIncidente ? 'Modifica la información del incidente' : 'Completa los datos del nuevo incidente'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className={formStyles.form}>
            {/* Información básica */}
            <div className={formStyles.section}>
              <h3 className={formStyles.sectionTitle}>Información del Incidente</h3>
              
              <div className={formStyles.gridSingle}>
                <div className={formStyles.field}>
                  <Label htmlFor="titulo" className={formStyles.label}>Título del Incidente *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    placeholder="Resumen del incidente..."
                    className={formStyles.input}
                    required
                  />
                </div>

                <div className={formStyles.field}>
                  <Label htmlFor="descripcion" className={formStyles.label}>Descripción Detallada *</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    placeholder="Describa detalladamente el incidente..."
                    rows={4}
                    className={formStyles.textarea}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Clasificación */}
            <div className={formStyles.section}>
              <h3 className={formStyles.sectionTitle}>Clasificación</h3>
              
              <div className={formStyles.gridSingle}>
                <div className={formStyles.field}>
                  <Label htmlFor="gravedad" className={formStyles.label}>Gravedad *</Label>
                  <Select value={formData.gravedad} onValueChange={(value) => setFormData({...formData, gravedad: value})}>
                    <SelectTrigger className={formStyles.select}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Leve">Leve</SelectItem>
                      <SelectItem value="Moderado">Moderado</SelectItem>
                      <SelectItem value="Grave">Grave</SelectItem>
                      <SelectItem value="Crítico">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
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
                {editingIncidente ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para agregar seguimiento */}
      <Dialog open={isSeguimientoDialogOpen} onOpenChange={setIsSeguimientoDialogOpen}>
        <DialogContent className={formStyles.dialogContent}>
          <DialogHeader className={formStyles.dialogHeader}>
            <DialogTitle className={formStyles.dialogTitle}>
              Agregar Seguimiento
            </DialogTitle>
            <DialogDescription className={formStyles.dialogDescription}>
              Registra una nueva acción de seguimiento para este incidente
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSeguimientoSubmit} className={formStyles.form}>
            <div className={formStyles.field}>
              <Label htmlFor="accion" className={formStyles.label}>Acción Realizada *</Label>
              <Input
                id="accion"
                value={seguimientoFormData.accion}
                onChange={(e) => setSeguimientoFormData({...seguimientoFormData, accion: e.target.value})}
                placeholder="Ej: Reunión con autoridades..."
                className={formStyles.input}
                required
              />
            </div>
            
            <div className={formStyles.field}>
              <Label htmlFor="obs" className={formStyles.label}>Observaciones *</Label>
              <Textarea
                id="obs"
                value={seguimientoFormData.observaciones}
                onChange={(e) => setSeguimientoFormData({...seguimientoFormData, observaciones: e.target.value})}
                placeholder="Detalles adicionales sobre la acción..."
                rows={4}
                className={formStyles.textarea}
                required
              />
            </div>
            
            <div className={formStyles.footer}>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsSeguimientoDialogOpen(false)}
                className={formStyles.cancelButton}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className={formStyles.submitButton}
              >
                Agregar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para ver detalles con línea temporal */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className={formStyles.dialogContentLarge}>
          <DialogHeader className={formStyles.dialogHeader}>
            <DialogTitle className={formStyles.dialogTitle}>Detalles del Incidente</DialogTitle>
            <DialogDescription className={formStyles.dialogDescription}>
              Información completa del incidente registrado
            </DialogDescription>
          </DialogHeader>
          
          {selectedIncidente && (() => {
            const area = areasProtegidas.find(a => a.id === selectedIncidente.areaProtegida);
            const guardarecurso = guardarecursos.find(g => g.id === selectedIncidente.guardarecurso);
            
            return (
              <div className={formStyles.form}>
                {/* Información General */}
                <div className="space-y-3">
                  <h3 className={formStyles.sectionTitle}>
                    Información General
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Título */}
                    <div className={`${formStyles.field} sm:col-span-2`}>
                      <Label className={formStyles.label}>Título</Label>
                      <p className={textStyles.primary}>{selectedIncidente.titulo}</p>
                    </div>
                    
                    {/* Gravedad */}
                    <div className={formStyles.field}>
                      <Label className={formStyles.label}>Gravedad</Label>
                      <Badge variant="outline" className={getGravedadBadgeClass(selectedIncidente.gravedad)}>
                        {selectedIncidente.gravedad}
                      </Badge>
                    </div>
                    
                    {/* Estado */}
                    <div className={formStyles.field}>
                      <Label className={formStyles.label}>Estado</Label>
                      <Badge variant="outline" className={getEstadoBadgeClass(selectedIncidente.estado)}>
                        {selectedIncidente.estado}
                      </Badge>
                    </div>
                    
                    {/* Descripción */}
                    <div className={`${formStyles.field} sm:col-span-2`}>
                      <Label className={formStyles.label}>Descripción</Label>
                      <p className={textStyles.primary}>{selectedIncidente.descripcion}</p>
                    </div>
                    
                    {/* Área Protegida */}
                    <div className={formStyles.field}>
                      <Label className={formStyles.label}>Área Protegida</Label>
                      <p className={textStyles.primary}>{area?.nombre || 'No especificada'}</p>
                    </div>
                    
                    {/* Guardarecurso */}
                    <div className={formStyles.field}>
                      <Label className={formStyles.label}>Guardarecurso</Label>
                      <p className={textStyles.primary}>{guardarecurso?.nombre} {guardarecurso?.apellido}</p>
                    </div>
                    
                    {/* Fecha de Incidente */}
                    <div className={formStyles.field}>
                      <Label className={formStyles.label}>Fecha del Incidente</Label>
                      <p className={textStyles.primary}>
                        {format(new Date(selectedIncidente.fechaIncidente), "d 'de' MMMM, yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Personas Involucradas */}
                {selectedIncidente.personasInvolucradas && selectedIncidente.personasInvolucradas.trim() && (
                  <div className="space-y-3">
                    <h3 className={formStyles.sectionTitle}>
                      Personas Involucradas
                    </h3>
                    <div className="flex gap-2">
                      <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className={textStyles.primary}>{selectedIncidente.personasInvolucradas}</span>
                    </div>
                  </div>
                )}

                {/* Línea Temporal de Seguimiento */}
                {selectedIncidente.seguimiento.length > 0 && (
                  <div className="space-y-3">
                    <h3 className={formStyles.sectionTitle}>
                      Línea Temporal de Seguimiento
                    </h3>
                    <div className="space-y-3">
                      {selectedIncidente.seguimiento.map((seg, index) => (
                        <div key={index} className="border-l-2 border-blue-500 dark:border-blue-400 pl-4 py-2">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-medium text-xs">{seg.accion}</p>
                            <span className={textStyles.mutedSmall}>
                              {format(new Date(seg.fecha), "d MMM yyyy", { locale: es })}
                            </span>
                          </div>
                          <p className={`${textStyles.mutedSmall} mb-1`}>
                            {seg.observaciones}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className={textStyles.mutedSmall}>{seg.responsable}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observaciones Finales */}
                {selectedIncidente.observaciones && (
                  <div className="space-y-3">
                    <h3 className={formStyles.sectionTitle}>
                      Observaciones Finales
                    </h3>
                    <p className={`${textStyles.primary} p-3 rounded-lg bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700`}>
                      {selectedIncidente.observaciones}
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className={formStyles.footer}>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsViewDialogOpen(false)}
                    className={formStyles.cancelButton}
                  >
                    Cerrar
                  </Button>
                  {selectedIncidente.estado === 'Resuelto' && (
                    <Button 
                      onClick={() => handleGenerarReporte(selectedIncidente)}
                      className={buttonStyles.primary}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar Reporte
                    </Button>
                  )}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
