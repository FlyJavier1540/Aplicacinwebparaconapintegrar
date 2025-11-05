import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Search, Clock, MapPin, Camera, AlertTriangle, Activity, CheckCircle, Play, Calendar, X, Plus, Trash2, MapPinned, FileText, Image as ImageIcon, Pause, StopCircle, Binoculars, Wrench, GraduationCap, Eye, Map, Search as SearchIcon, User } from 'lucide-react';
import { actividades, guardarecursos } from '../data/mock-data';
import { motion, AnimatePresence } from 'motion/react';
import { actividadesSync } from '../utils/actividadesSync';
import { Hallazgo, EvidenciaFotografica, PuntoCoordenada } from '../types';
import { buttonStyles, filterStyles, badgeStyles, cardStyles, layoutStyles, iconStyles, formStyles, textStyles, listCardStyles, imageStyles } from '../styles/shared-styles';
import { 
  registroDiarioService, 
  HallazgoFormData, 
  FotoHallazgoFormData, 
  EvidenciaFormData, 
  PuntoCoordenadaFormData 
} from '../utils/registroDiarioService';
import { FormularioFotografia, FotografiaFormData } from './FormularioFotografia';

interface RegistroDiarioProps {
  userPermissions: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
  currentUser?: any;
}

// Interfaces movidas al servicio y reimportadas

export function RegistroDiario({ userPermissions, currentUser }: RegistroDiarioProps) {
  const [actividadesList, setActividadesList] = useState(actividades);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuardarecurso, setSelectedGuardarecurso] = useState<string>('todos');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Modales
  const [isPatrullajeDialogOpen, setIsPatrullajeDialogOpen] = useState(false);
  const [isCompletarDialogOpen, setIsCompletarDialogOpen] = useState(false);
  const [isAddHallazgoOpen, setIsAddHallazgoOpen] = useState(false);
  const [isAddEvidenciaOpen, setIsAddEvidenciaOpen] = useState(false);
  const [isReportarHallazgoIndependienteOpen, setIsReportarHallazgoIndependienteOpen] = useState(false);
  const [isIniciarActividadDialogOpen, setIsIniciarActividadDialogOpen] = useState(false);
  const [isAddCoordenadaOpen, setIsAddCoordenadaOpen] = useState(false);
  const [isFinalizandoDesdeModal, setIsFinalizandoDesdeModal] = useState(false);
  
  const [actividadActiva, setActividadActiva] = useState<any>(null);
  const [selectedActividad, setSelectedActividad] = useState<any>(null);
  const [actividadPorIniciar, setActividadPorIniciar] = useState<any>(null);
  
  // Hallazgos independientes (no vinculados a actividades)
  const [hallazgosIndependientes, setHallazgosIndependientes] = useState<Hallazgo[]>([]);
  
  // Formularios usando el servicio
  const [hallazgoForm, setHallazgoForm] = useState<HallazgoFormData>(
    registroDiarioService.createEmptyHallazgoForm()
  );

  const [isAgregarFotoHallazgoOpen, setIsAgregarFotoHallazgoOpen] = useState(false);
  const [isAgregarFotoEvidenciaOpen, setIsAgregarFotoEvidenciaOpen] = useState(false);

  const [hallazgosTemporales, setHallazgosTemporales] = useState<Hallazgo[]>([]);
  const [evidenciasTemporales, setEvidenciasTemporales] = useState<EvidenciaFotografica[]>([]);
  const [coordenadasTemporales, setCoordenadasTemporales] = useState<PuntoCoordenada[]>([]);
  const [isFormularioHallazgoAbierto, setIsFormularioHallazgoAbierto] = useState(false);
  
  // Formulario de coordenadas usando el servicio
  const [coordenadaForm, setCoordenadaForm] = useState<PuntoCoordenadaFormData>(
    registroDiarioService.createEmptyCoordenadaForm()
  );
  
  // Formulario de inicio de actividad
  const [horaInicio, setHoraInicio] = useState('');
  const [latitudInicio, setLatitudInicio] = useState('');
  const [longitudInicio, setLongitudInicio] = useState('');
  
  // Formulario de finalización de actividad
  const [horaFin, setHoraFin] = useState('');
  const [latitudFin, setLatitudFin] = useState('');
  const [longitudFin, setLongitudFin] = useState('');

  // Suscribirse a cambios en actividades
  useEffect(() => {
    const unsubscribe = actividadesSync.subscribe((actividades) => {
      setActividadesList(actividades);
      // Actualizar actividad activa si existe
      if (actividadActiva) {
        const actividadActualizada = actividades.find(a => a.id === actividadActiva.id);
        if (actividadActualizada) {
          setActividadActiva(actividadActualizada);
        }
      }
    });

    return unsubscribe;
  }, [actividadActiva]);

  // Determinar si el usuario actual es un guardarecurso
  const isGuardarecurso = currentUser?.rol === 'Guardarecurso';
  const currentGuardarecursoId = isGuardarecurso ? currentUser?.id : null;

  const tiposActividad = registroDiarioService.getAllTiposActividad();

  // Filtrado usando el servicio
  const actividadesFiltradas = useMemo(() => {
    return registroDiarioService.filterActividadesPorRol(
      actividadesList,
      searchTerm,
      selectedDate,
      selectedGuardarecurso,
      isGuardarecurso,
      currentGuardarecursoId,
      guardarecursos
    );
  }, [actividadesList, selectedDate, searchTerm, selectedGuardarecurso, isGuardarecurso, currentGuardarecursoId]);

  const handleIniciarActividad = (actividad: any) => {
    // Abrir modal para capturar hora y coordenadas de inicio
    setHoraInicio(registroDiarioService.getCurrentTime());
    setLatitudInicio('');
    setLongitudInicio('');
    setActividadPorIniciar(actividad);
    setIsIniciarActividadDialogOpen(true);
  };

  const handleConfirmarInicioActividad = () => {
    if (!actividadPorIniciar) return;
    
    // Crear datos de inicio usando el servicio
    const inicioData = registroDiarioService.createInicioActividadData(
      horaInicio,
      latitudInicio,
      longitudInicio
    );
    
    // Actualizar estado a "En Progreso" con datos del formulario
    actividadesSync.updateActividad(actividadPorIniciar.id, inicioData);

    // Si es patrullaje, abrir modal especial que no se puede cerrar
    if (registroDiarioService.isPatrullaje(actividadPorIniciar.tipo)) {
      const actividadActualizada = { 
        ...actividadPorIniciar, 
        ...inicioData
      };
      setActividadActiva(actividadActualizada);
      setHallazgosTemporales([]);
      setEvidenciasTemporales([]);
      setCoordenadasTemporales([]);
      // Resetear formulario de hallazgos usando el servicio
      setHallazgoForm(registroDiarioService.createEmptyHallazgoForm());
      setIsPatrullajeDialogOpen(true);
    }

    // Cerrar modal de inicio
    setIsIniciarActividadDialogOpen(false);
    setActividadPorIniciar(null);
  };

  const handleCompletarActividad = (actividad: any) => {
    setSelectedActividad(actividad);
    setHallazgosTemporales(actividad.hallazgos || []);
    setEvidenciasTemporales(actividad.evidencias || []);
    setCoordenadasTemporales(actividad.puntosRecorrido || []);
    
    // Si es patrullaje, pedir coordenadas finales primero
    if (registroDiarioService.isPatrullaje(actividad.tipo)) {
      // Prellenar hora de fin con hora actual usando el servicio
      setHoraFin(registroDiarioService.getCurrentTime());
      setLatitudFin('');
      setLongitudFin('');
      
      setIsCompletarDialogOpen(true);
    } else {
      // Para otras actividades, ir directo al formulario completo
      setActividadActiva(actividad);
      setIsPatrullajeDialogOpen(true);
    }
  };

  const handlePasarAFormularioCompleto = () => {
    if (selectedActividad && horaFin && latitudFin && longitudFin) {
      // Actualizar actividad con coordenadas y hora de fin
      actividadesSync.updateActividad(selectedActividad.id, {
        estado: 'En Progreso', // Temporalmente en progreso hasta completar el formulario completo
        horaFin: horaFin,
        coordenadasFin: {
          lat: parseFloat(latitudFin),
          lng: parseFloat(longitudFin)
        }
      });

      // Cerrar modal de coordenadas y abrir modal completo
      setIsCompletarDialogOpen(false);
      setIsFinalizandoDesdeModal(false);
      setActividadActiva(selectedActividad);
      setIsPatrullajeDialogOpen(true);
    }
  };

  const handleCompletarPatrullaje = () => {
    // Cerrar modal actual y abrir modal de coordenadas finales para TODAS las actividades
    setIsPatrullajeDialogOpen(false);
    setSelectedActividad(actividadActiva);
    setIsFinalizandoDesdeModal(true);
    
    // Prellenar hora de fin con hora actual usando el servicio
    setHoraFin(registroDiarioService.getCurrentTime());
    setLatitudFin('');
    setLongitudFin('');
    
    setIsCompletarDialogOpen(true);
  };

  const handleFinalizarConCoordenadas = () => {
    if (selectedActividad && horaFin && latitudFin && longitudFin) {
      // Crear datos de finalización usando el servicio
      const finalizacionData = registroDiarioService.createFinalizacionActividadData(
        horaFin,
        latitudFin,
        longitudFin,
        '',
        hallazgosTemporales,
        evidenciasTemporales,
        coordenadasTemporales
      );
      
      actividadesSync.updateActividad(selectedActividad.id, finalizacionData);

      // Limpiar todo y cerrar
      setIsCompletarDialogOpen(false);
      setIsFinalizandoDesdeModal(false);
      setActividadActiva(null);
      setSelectedActividad(null);
      setHallazgosTemporales([]);
      setEvidenciasTemporales([]);
      setCoordenadasTemporales([]);
      setHoraFin('');
      setLatitudFin('');
      setLongitudFin('');
    }
  };

  const handleAgregarHallazgo = () => {
    if (!registroDiarioService.isHallazgoFormValid(hallazgoForm)) return;

    // Crear hallazgo usando el servicio
    const nuevoHallazgo = registroDiarioService.createHallazgo(
      hallazgoForm,
      actividadActiva?.ubicacion || selectedActividad?.ubicacion || '',
      currentUser?.id || ''
    );

    setHallazgosTemporales([...hallazgosTemporales, nuevoHallazgo]);
    
    // Limpiar formulario usando el servicio
    setHallazgoForm(registroDiarioService.createEmptyHallazgoForm());
    setIsAddHallazgoOpen(false);
  };

  const handleReportarHallazgoIndependiente = () => {
    if (!registroDiarioService.isHallazgoFormValid(hallazgoForm)) return;

    // Crear hallazgo independiente usando el servicio
    const nuevoHallazgo = registroDiarioService.createHallazgoIndependiente(
      hallazgoForm,
      currentUser?.id || ''
    );

    setHallazgosIndependientes([...hallazgosIndependientes, nuevoHallazgo]);
    setHallazgoForm(registroDiarioService.createEmptyHallazgoForm());
    setIsReportarHallazgoIndependienteOpen(false);
  };

  const handleAgregarCoordenada = () => {
    if (!registroDiarioService.isCoordenadaFormValid(coordenadaForm)) return;

    // Crear coordenada usando el servicio
    const nuevaCoordenada = registroDiarioService.createPuntoCoordenada(coordenadaForm);

    setCoordenadasTemporales([...coordenadasTemporales, nuevaCoordenada]);
    
    // Limpiar formulario usando el servicio
    setCoordenadaForm(registroDiarioService.createEmptyCoordenadaForm());
    setIsAddCoordenadaOpen(false);
  };

  const handleEliminarCoordenada = (id: string) => {
    setCoordenadasTemporales(coordenadasTemporales.filter(coord => coord.id !== id));
  };

  // Handler para agregar fotografía al hallazgo
  const handleSubmitFotoHallazgo = (data: FotografiaFormData) => {
    const fotoData: FotoHallazgoFormData = {
      url: data.url,
      descripcion: data.descripcion,
      latitud: data.latitud,
      longitud: data.longitud
    };

    setHallazgoForm({
      ...hallazgoForm,
      fotografias: [...hallazgoForm.fotografias, fotoData]
    });
  };

  // Handler para eliminar fotografía del hallazgo
  const handleEliminarFotoHallazgo = (index: number) => {
    setHallazgoForm({
      ...hallazgoForm,
      fotografias: hallazgoForm.fotografias.filter((_, i) => i !== index)
    });
  };

  // Handler para agregar evidencia fotográfica general
  const handleSubmitFotoEvidencia = (data: FotografiaFormData) => {
    const nuevaEvidencia = registroDiarioService.createEvidencia({
      url: data.url,
      descripcion: data.descripcion,
      tipo: 'Otro',
      latitud: data.latitud,
      longitud: data.longitud
    });

    setEvidenciasTemporales([...evidenciasTemporales, nuevaEvidencia]);
  };

  const handleEliminarHallazgo = (id: string) => {
    setHallazgosTemporales(hallazgosTemporales.filter(h => h.id !== id));
  };

  const handleEliminarEvidencia = (id: string) => {
    setEvidenciasTemporales(evidenciasTemporales.filter(e => e.id !== id));
  };

  // Usar funciones del servicio para estilos
  const getEstadoInfo = (estado: 'Programada' | 'En Progreso' | 'Completada') => {
    const info = registroDiarioService.getEstadoInfo(estado);
    const iconMap: Record<string, any> = {
      'Clock': Clock,
      'Play': Play,
      'CheckCircle': CheckCircle,
      'AlertTriangle': AlertTriangle
    };
    return {
      icon: iconMap[info.icon] || AlertTriangle,
      badge: info.badge
    };
  };

  const getTipoColor = (tipo: string) => {
    return registroDiarioService.getTipoColor(tipo);
  };

  const getTipoIcon = (tipo: string) => {
    const iconName = registroDiarioService.getTipoIcon(tipo);
    const iconMap: Record<string, any> = {
      'Binoculars': Binoculars,
      'Wrench': Wrench,
      'GraduationCap': GraduationCap,
      'SearchIcon': SearchIcon,
      'Eye': Eye,
      'Map': Map,
      'Activity': Activity
    };
    return iconMap[iconName] || Activity;
  };

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

        {/* Filtros - Solo para Admin/Coordinador */}
        {!isGuardarecurso && (
          <>
            {/* Filtro por guardarecurso */}
            <div className={filterStyles.selectWrapperSmall}>
              <Select value={selectedGuardarecurso} onValueChange={setSelectedGuardarecurso}>
                <SelectTrigger className={filterStyles.selectTrigger}>
                  <SelectValue placeholder="Guardarecurso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {guardarecursos.map(g => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.nombre} {g.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {/* Selector de fecha - Solo para Admin/Coordinador */}
        {!isGuardarecurso && (
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="!h-11 w-full sm:w-auto bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-white dark:focus:bg-gray-800 focus:border-gray-300 dark:focus:border-gray-600 transition-all duration-200"
          />
        )}
        
        {/* Botón de acción rápida */}
        {userPermissions.canCreate && (
          <Button
            onClick={() => setIsReportarHallazgoIndependienteOpen(true)}
            className="!h-11 px-4 bg-orange-600 hover:bg-orange-700 text-white dark:bg-orange-600 dark:hover:bg-orange-700"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Hallazgo</span>
            <span className="sm:hidden">Nuevo</span>
          </Button>
        )}
      </div>

      {/* Hallazgos Independientes */}
      {hallazgosIndependientes.length > 0 && (
        <div className="mb-6">
          <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Hallazgos Reportados Hoy ({hallazgosIndependientes.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {hallazgosIndependientes.map((hallazgo) => (
                  <motion.div
                    key={hallazgo.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-800 rounded-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant="outline" className={`text-xs ${
                            hallazgo.gravedad === 'Crítica' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                            hallazgo.gravedad === 'Alta' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                            hallazgo.gravedad === 'Media' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                            {hallazgo.gravedad}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(hallazgo.fecha).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="font-medium text-sm">{hallazgo.titulo}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{hallazgo.descripcion}</p>
                        {hallazgo.evidencias && hallazgo.evidencias.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Camera className="h-3 w-3 text-blue-600" />
                            <span className="text-xs text-muted-foreground">
                              {hallazgo.evidencias.length} {hallazgo.evidencias.length === 1 ? 'fotografía' : 'fotografías'}
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => {
                          setHallazgosIndependientes(hallazgosIndependientes.filter(h => h.id !== hallazgo.id));
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actividades */}
      <div>
        {actividadesFiltradas.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 sm:p-12">
                <div className="text-center">
                  <Calendar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-30" />
                  <h3 className="mb-2 text-sm sm:text-base">No hay actividades</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                    No se encontraron actividades con los filtros seleccionados
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      if (!isGuardarecurso) setSelectedGuardarecurso('todos');
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
              {actividadesFiltradas.map((actividad, index) => {
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
                      {/* Línea decorativa superior según estado */}
                      <div className={
                        actividad.estado === 'Programada' ? cardStyles.topLine.blue :
                        actividad.estado === 'En Progreso' ? cardStyles.topLine.orange :
                        cardStyles.topLine.green
                      } />
                      
                      <CardContent className={listCardStyles.content}>
                        {/* Título */}
                        <h3 className={`${listCardStyles.title} line-clamp-2 mb-3`}>
                          {actividad.descripcion}
                        </h3>

                        {/* Estado */}
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={
                            actividad.estado === 'En Progreso'
                              ? `bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-300 dark:border-orange-700`
                              : actividad.estado === 'Completada'
                              ? `bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-300 dark:border-green-700`
                              : `${estadoInfo.badge} border`
                          }>
                            {actividad.estado}
                          </Badge>
                        </div>

                        {/* Información de la actividad */}
                        <div className="space-y-2 mb-3">
                          {/* Hora programada */}
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {actividad.horaInicio}
                              {actividad.horaFin && actividad.estado === 'Completada' ? ` - ${actividad.horaFin}` : ''}
                            </span>
                          </div>

                          {/* Tipo */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {actividad.tipo}
                            </span>
                          </div>

                          {/* Guardarecurso */}
                          {guardarecurso && (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {guardarecurso.nombre} {guardarecurso.apellido}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Hallazgos y Evidencias */}
                        {(actividad.hallazgos?.length > 0 || actividad.evidencias?.length > 0) && (
                          <div className={`flex items-center gap-2 ${layoutStyles.separatorWithMargin}`}>
                            {actividad.hallazgos?.length > 0 && (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-300">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-xs font-medium">
                                  {actividad.hallazgos.length} {actividad.hallazgos.length === 1 ? 'hallazgo' : 'hallazgos'}
                                </span>
                              </div>
                            )}
                            {actividad.evidencias?.length > 0 && (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300">
                                <Camera className="h-4 w-4" />
                                <span className="text-xs font-medium">
                                  {actividad.evidencias.length} {actividad.evidencias.length === 1 ? 'foto' : 'fotos'}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Botones de acción */}
                        <div className="flex gap-2 pt-4">
                          {actividad.estado === 'Programada' && userPermissions.canEdit && (
                            <Button
                              onClick={() => handleIniciarActividad(actividad)}
                              className={`${buttonStyles.cardAction} bg-blue-600 hover:bg-blue-700 text-white`}
                              size="sm"
                            >
                              <Play className="h-4 w-4 mr-1.5" />
                              <span className="text-xs">Iniciar</span>
                            </Button>
                          )}
                          {actividad.estado === 'En Progreso' && userPermissions.canEdit && (
                            <Button
                              onClick={() => handleCompletarActividad(actividad)}
                              className={`${buttonStyles.cardAction} bg-green-600 hover:bg-green-700 text-white`}
                              size="sm"
                            >
                              <CheckCircle className="h-4 w-4 mr-1.5" />
                              <span className="text-xs">Completar</span>
                            </Button>
                          )}
                          {actividad.estado === 'Completada' && (
                            <div className="flex-1 flex items-center justify-center h-9 px-3 rounded-md bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                              <CheckCircle className="h-4 w-4 mr-1.5" />
                              <span className="text-sm font-medium">Finalizada</span>
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

      {/* Modal para Iniciar Actividad (captura horario y coordenadas) */}
      <Dialog open={isIniciarActividadDialogOpen} onOpenChange={setIsIniciarActividadDialogOpen}>
        <DialogContent className={formStyles.dialogContent}>
          <DialogHeader className={formStyles.dialogHeader}>
            <DialogTitle className={formStyles.dialogTitle}>Iniciar Actividad</DialogTitle>
            <DialogDescription className={formStyles.dialogDescription}>
              {actividadPorIniciar?.descripcion}
            </DialogDescription>
          </DialogHeader>

          <div className={formStyles.form}>
            <div className={formStyles.section}>
              <h3 className={formStyles.sectionTitle}>Información de Inicio</h3>
              
              <div className={formStyles.grid}>
                <div className={formStyles.field}>
                  <Label htmlFor="hora-inicio" className={formStyles.label}>
                    Hora de Inicio *
                  </Label>
                  <Input
                    id="hora-inicio"
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className={formStyles.input}
                    required
                  />
                </div>

                <div className={formStyles.field}>
                  <Label htmlFor="latitud-inicio" className={formStyles.label}>
                    Latitud de Inicio *
                  </Label>
                  <Input
                    id="latitud-inicio"
                    type="number"
                    step="0.000001"
                    value={latitudInicio}
                    onChange={(e) => setLatitudInicio(e.target.value)}
                    placeholder="14.6349"
                    className={formStyles.input}
                    required
                  />
                </div>

                <div className={formStyles.field}>
                  <Label htmlFor="longitud-inicio" className={formStyles.label}>
                    Longitud de Inicio *
                  </Label>
                  <Input
                    id="longitud-inicio"
                    type="number"
                    step="0.000001"
                    value={longitudInicio}
                    onChange={(e) => setLongitudInicio(e.target.value)}
                    placeholder="-90.5069"
                    className={formStyles.input}
                    required
                  />
                </div>
              </div>

              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Las coordenadas de inicio quedarán registradas como punto de partida de la actividad.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={formStyles.footer}>
            <Button
              type="button"
              onClick={() => {
                setIsIniciarActividadDialogOpen(false);
                setActividadPorIniciar(null);
              }}
              variant="outline"
              className={formStyles.cancelButton}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmarInicioActividad}
              disabled={!horaInicio || !latitudInicio || !longitudInicio}
              className={formStyles.submitButton}
            >
              <Play className="h-4 w-4 mr-2" />
              Iniciar Actividad
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para Completar Actividad (captura horario y coordenadas de finalización) */}
      <Dialog open={isCompletarDialogOpen} onOpenChange={setIsCompletarDialogOpen}>
        <DialogContent className={formStyles.dialogContent}>
          <DialogHeader className={formStyles.dialogHeader}>
            <DialogTitle className={formStyles.dialogTitle}>Completar Actividad</DialogTitle>
            <DialogDescription className={formStyles.dialogDescription}>
              {selectedActividad?.descripcion}
            </DialogDescription>
          </DialogHeader>

          <div className={formStyles.form}>
            <div className={formStyles.section}>
              <h3 className={formStyles.sectionTitle}>Información de Finalización</h3>
              
              <div className={formStyles.grid}>
                <div className={formStyles.field}>
                  <Label htmlFor="hora-fin" className={formStyles.label}>
                    Hora de Finalización *
                  </Label>
                  <Input
                    id="hora-fin"
                    type="time"
                    value={horaFin}
                    onChange={(e) => setHoraFin(e.target.value)}
                    className={formStyles.input}
                    required
                  />
                </div>

                <div className={formStyles.field}>
                  <Label htmlFor="latitud-fin" className={formStyles.label}>
                    Latitud de Finalización *
                  </Label>
                  <Input
                    id="latitud-fin"
                    type="number"
                    step="0.000001"
                    value={latitudFin}
                    onChange={(e) => setLatitudFin(e.target.value)}
                    placeholder="14.6349"
                    className={formStyles.input}
                    required
                  />
                </div>

                <div className={formStyles.field}>
                  <Label htmlFor="longitud-fin" className={formStyles.label}>
                    Longitud de Finalización *
                  </Label>
                  <Input
                    id="longitud-fin"
                    type="number"
                    step="0.000001"
                    value={longitudFin}
                    onChange={(e) => setLongitudFin(e.target.value)}
                    placeholder="-90.5069"
                    className={formStyles.input}
                    required
                  />
                </div>
              </div>

              <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Las coordenadas de finalización quedarán registradas como punto final de la actividad.
                  </p>
                </div>
              </div>
            </div>

            {/* Puntos de Coordenadas (solo para patrullajes y NO cuando se está finalizando) */}
            {selectedActividad?.tipo.includes('Patrullaje') && !isFinalizandoDesdeModal && (
              <div className={formStyles.section}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={formStyles.sectionTitle}>
                    Puntos de Coordenadas Registrados ({coordenadasTemporales.length})
                  </h3>
                  <Button
                    type="button"
                    onClick={() => setIsAddCoordenadaOpen(true)}
                    size="sm"
                    variant="outline"
                    className="h-8"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar Punto
                  </Button>
                </div>

                {coordenadasTemporales.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <MapPin className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p className={textStyles.muted}>No se han registrado puntos de coordenadas</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Agregue puntos GPS del recorrido</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {coordenadasTemporales.map((coord) => (
                      <motion.div
                        key={coord.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {coord.latitud.toFixed(6)}, {coord.longitud.toFixed(6)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(coord.fecha).toLocaleDateString('es-GT')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {coord.hora}
                              </span>
                            </div>
                            {coord.descripcion && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{coord.descripcion}</p>
                            )}
                          </div>
                          <Button
                            type="button"
                            onClick={() => handleEliminarCoordenada(coord.id)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 flex-shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-gray-500 hover:text-red-600" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <MapPinned className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Los puntos de coordenadas permiten trazar la ruta completa del patrullaje.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={formStyles.footer}>
            {isFinalizandoDesdeModal && (
              <Button
                type="button"
                onClick={() => {
                  setIsCompletarDialogOpen(false);
                  setIsFinalizandoDesdeModal(false);
                  setIsPatrullajeDialogOpen(true);
                }}
                variant="outline"
                className={formStyles.cancelButton}
              >
                Volver
              </Button>
            )}
            {!isFinalizandoDesdeModal && (
              <Button
                type="button"
                onClick={() => {
                  setIsCompletarDialogOpen(false);
                  setSelectedActividad(null);
                }}
                variant="outline"
                className={formStyles.cancelButton}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="button"
              onClick={isFinalizandoDesdeModal ? handleFinalizarConCoordenadas : handlePasarAFormularioCompleto}
              disabled={!horaFin || !latitudFin || !longitudFin}
              className={formStyles.submitButton}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isFinalizandoDesdeModal ? 'Finalizar Patrullaje' : 'Continuar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Patrullaje/Actividad en Progreso (no se puede cerrar hasta completar) */}
      <Dialog open={isPatrullajeDialogOpen} onOpenChange={() => {}}>
        <DialogContent 
          className={`${formStyles.dialogContent} [&>button]:hidden`}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className={formStyles.dialogHeader}>
            <DialogTitle className={formStyles.dialogTitle}>
              {actividadActiva?.tipo.includes('Patrullaje') ? 'Patrullaje en Progreso' : 'Completar Actividad'}
            </DialogTitle>
            <DialogDescription className={formStyles.dialogDescription}>
              {actividadActiva?.descripcion}
            </DialogDescription>
          </DialogHeader>

          <div className={formStyles.form}>
            {/* Puntos de Coordenadas (solo para patrullajes) */}
            {actividadActiva?.tipo.includes('Patrullaje') && (
              <div className={formStyles.section}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={formStyles.sectionTitle}>
                    Puntos de Coordenadas Registrados ({coordenadasTemporales.length})
                  </h3>
                  <Button
                    onClick={() => setIsAddCoordenadaOpen(true)}
                    size="sm"
                    variant="outline"
                    className="h-8"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar Punto
                  </Button>
                </div>

                {coordenadasTemporales.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <MapPin className="h-10 w-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p className={textStyles.muted}>No se han registrado puntos de coordenadas</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Agregue puntos GPS del recorrido</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {coordenadasTemporales.map((coord) => (
                      <motion.div
                        key={coord.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                              <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {coord.latitud.toFixed(6)}, {coord.longitud.toFixed(6)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(coord.fecha).toLocaleDateString('es-GT')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {coord.hora}
                              </span>
                            </div>
                            {coord.descripcion && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{coord.descripcion}</p>
                            )}
                          </div>
                          <Button
                            onClick={() => handleEliminarCoordenada(coord.id)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 flex-shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-gray-500 hover:text-red-600" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-2">
                    <MapPinned className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Los puntos de coordenadas permiten trazar la ruta completa del patrullaje.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Hallazgos Reportados */}
            <div className={formStyles.section}>
              <h3 className={formStyles.sectionTitle}>
                Hallazgos Reportados ({hallazgosTemporales.length})
              </h3>

              {hallazgosTemporales.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <p className={textStyles.muted}>No se han reportado hallazgos</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Agregue hallazgos usando el formulario abajo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {hallazgosTemporales.map((hallazgo) => (
                    <div key={hallazgo.id} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={`${badgeStyles.base} ${
                              hallazgo.gravedad === 'Crítica' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-700' :
                              hallazgo.gravedad === 'Alta' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300 dark:border-orange-700' :
                              hallazgo.gravedad === 'Media' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700' :
                              'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-700'
                            }`}>
                              {hallazgo.gravedad}
                            </Badge>
                          </div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{hallazgo.titulo}</p>
                          <p className={`${textStyles.muted} mt-1`}>{hallazgo.descripcion}</p>
                          {hallazgo.evidencias && hallazgo.evidencias.length > 0 && (
                            <div className="grid grid-cols-4 gap-2 mt-3">
                              {hallazgo.evidencias.map((evidencia, idx) => (
                                <div key={idx} className="aspect-square bg-gray-100 dark:bg-gray-800 rounded overflow-hidden border border-gray-200 dark:border-gray-700">
                                  <img src={evidencia.url} alt="" className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          onClick={() => handleEliminarHallazgo(hallazgo.id)}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botón para mostrar/ocultar formulario de hallazgo */}
            <Button
              type="button"
              onClick={() => setIsFormularioHallazgoAbierto(!isFormularioHallazgoAbierto)}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white border-0 h-10"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Reportar Nuevo Hallazgo
            </Button>

            {/* Formulario de Hallazgo Integrado (colapsable) */}
            <AnimatePresence>
              {isFormularioHallazgoAbierto && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className={formStyles.section}>
                    <div className="flex items-center justify-between">
                      <h3 className={formStyles.sectionTitle}>Información del Hallazgo</h3>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsFormularioHallazgoAbierto(false)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className={formStyles.grid}>
                      <div className={formStyles.field}>
                        <Label htmlFor="hallazgo-gravedad" className={formStyles.label}>Gravedad</Label>
                        <Select value={hallazgoForm.gravedad} onValueChange={(value: any) => setHallazgoForm({...hallazgoForm, gravedad: value})}>
                          <SelectTrigger className={formStyles.selectTrigger}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Baja">Baja</SelectItem>
                            <SelectItem value="Media">Media</SelectItem>
                            <SelectItem value="Alta">Alta</SelectItem>
                            <SelectItem value="Crítica">Crítica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className={formStyles.fieldFullWidth}>
                        <Label htmlFor="hallazgo-titulo" className={formStyles.label}>Título</Label>
                        <Input
                          id="hallazgo-titulo"
                          value={hallazgoForm.titulo}
                          onChange={(e) => setHallazgoForm({...hallazgoForm, titulo: e.target.value})}
                          placeholder="Título breve del hallazgo"
                          className={formStyles.input}
                        />
                      </div>

                      <div className={formStyles.fieldFullWidth}>
                        <Label htmlFor="hallazgo-descripcion" className={formStyles.label}>Descripción</Label>
                        <Textarea
                          id="hallazgo-descripcion"
                          value={hallazgoForm.descripcion}
                          onChange={(e) => setHallazgoForm({...hallazgoForm, descripcion: e.target.value})}
                          placeholder="Describa detalladamente el hallazgo..."
                          rows={3}
                          className="resize-none"
                        />
                      </div>

                      <div className={formStyles.field}>
                        <Label htmlFor="hallazgo-lat" className={formStyles.label}>Latitud (opcional)</Label>
                        <Input
                          id="hallazgo-lat"
                          type="number"
                          step="0.000001"
                          value={hallazgoForm.latitud}
                          onChange={(e) => setHallazgoForm({...hallazgoForm, latitud: e.target.value})}
                          placeholder="14.6349"
                          className={formStyles.input}
                        />
                      </div>

                      <div className={formStyles.field}>
                        <Label htmlFor="hallazgo-lng" className={formStyles.label}>Longitud (opcional)</Label>
                        <Input
                          id="hallazgo-lng"
                          type="number"
                          step="0.000001"
                          value={hallazgoForm.longitud}
                          onChange={(e) => setHallazgoForm({...hallazgoForm, longitud: e.target.value})}
                          placeholder="-90.5069"
                          className={formStyles.input}
                        />
                      </div>
                    </div>

                    <div className={formStyles.field}>
                  <div className="flex items-center justify-between mb-2">
                    <Label className={formStyles.label}>
                      Fotografías ({hallazgoForm.fotografias.length})
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAgregarFotoHallazgoOpen(true)}
                      className="h-8"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </Button>
                  </div>

                  {/* Lista de fotografías */}
                  {hallazgoForm.fotografias.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {hallazgoForm.fotografias.map((foto, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group"
                        >
                          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <img
                              src={foto.url}
                              alt={foto.titulo}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <p className="text-xs text-white font-medium truncate">{foto.titulo}</p>
                            {foto.latitud && foto.longitud && (
                              <p className="text-xs text-white/70 truncate">
                                {foto.latitud}, {foto.longitud}
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            onClick={() => handleEliminarFotoHallazgo(index)}
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">No hay fotografías</p>
                    </div>
                  )}
                </div>

                {/* Botón para agregar hallazgo */}
                <div className="flex justify-end">
                  <Button 
                    onClick={handleAgregarHallazgo} 
                    disabled={!hallazgoForm.titulo || !hallazgoForm.descripcion}
                    className={formStyles.submitButton}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Hallazgo
                  </Button>
                </div>
                  </div>
                </motion.div>
            )}
          </AnimatePresence>

            {/* Evidencias Fotográficas Generales */}
            <div className={formStyles.section}>
              <div className="flex items-center justify-between">
                <h3 className={formStyles.sectionTitle}>
                  Fotografías Generales ({evidenciasTemporales.length})
                </h3>
                <Button
                  onClick={() => setIsAddEvidenciaOpen(true)}
                  size="sm"
                  variant="outline"
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar
                </Button>
              </div>

              {evidenciasTemporales.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                  <Camera className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                  <p className={textStyles.muted}>No se han agregado fotografías generales</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {evidenciasTemporales.map((evidencia) => (
                    <div key={evidencia.id} className="relative group">
                      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img
                          src={evidencia.url}
                          alt={evidencia.descripcion}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-xs text-white font-medium">{evidencia.tipo}</p>
                        {evidencia.descripcion && (
                          <p className="text-xs text-white/80 truncate">{evidencia.descripcion}</p>
                        )}
                      </div>
                      <Button
                        onClick={() => handleEliminarEvidencia(evidencia.id)}
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className={formStyles.footer}>
            <Button
              type="button"
              onClick={handleCompletarPatrullaje}
              className={`${formStyles.submitButton} w-full`}
            >
              <StopCircle className="h-4 w-4 mr-2" />
              {actividadActiva?.tipo.includes('Patrullaje') ? 'Finalizar Patrullaje' : 'Guardar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para agregar hallazgo */}
      <Dialog open={isAddHallazgoOpen} onOpenChange={setIsAddHallazgoOpen}>
        <DialogContent className={formStyles.dialogContentLarge}>
          <DialogHeader className={formStyles.dialogHeader}>
            <DialogTitle className={formStyles.dialogTitle}>Reportar Hallazgo</DialogTitle>
            <DialogDescription className={formStyles.dialogDescription}>
              Registre un hallazgo encontrado durante la actividad
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => { e.preventDefault(); handleAgregarHallazgo(); }} className={formStyles.form}>
            {/* Información del Hallazgo */}
            <div className={formStyles.section}>
              <h3 className={formStyles.sectionTitle}>Información del Hallazgo</h3>
              
              <div className={formStyles.gridSingle}>
                <div className={formStyles.field}>
                  <Label htmlFor="hallazgo-gravedad" className={formStyles.label}>Gravedad *</Label>
                  <Select value={hallazgoForm.gravedad} onValueChange={(value: any) => setHallazgoForm({...hallazgoForm, gravedad: value})}>
                    <SelectTrigger className={formStyles.select}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baja">Baja</SelectItem>
                      <SelectItem value="Media">Media</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Crítica">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className={formStyles.gridSingle}>
                <div className={formStyles.field}>
                  <Label htmlFor="hallazgo-titulo" className={formStyles.label}>Título *</Label>
                  <Input
                    id="hallazgo-titulo"
                    value={hallazgoForm.titulo}
                    onChange={(e) => setHallazgoForm({...hallazgoForm, titulo: e.target.value})}
                    placeholder="Título breve del hallazgo"
                    className={formStyles.input}
                    required
                  />
                </div>

                <div className={formStyles.field}>
                  <Label htmlFor="hallazgo-descripcion" className={formStyles.label}>Descripción *</Label>
                  <Textarea
                    id="hallazgo-descripcion"
                    value={hallazgoForm.descripcion}
                    onChange={(e) => setHallazgoForm({...hallazgoForm, descripcion: e.target.value})}
                    placeholder="Describa detalladamente el hallazgo..."
                    rows={4}
                    className={formStyles.textarea}
                    required
                  />
                </div>
              </div>

              <div className={formStyles.grid}>
                <div className={formStyles.field}>
                  <Label htmlFor="hallazgo-lat" className={formStyles.label}>Latitud</Label>
                  <Input
                    id="hallazgo-lat"
                    type="number"
                    step="0.000001"
                    value={hallazgoForm.latitud}
                    onChange={(e) => setHallazgoForm({...hallazgoForm, latitud: e.target.value})}
                    placeholder="14.6349"
                    className={formStyles.input}
                  />
                </div>

                <div className={formStyles.field}>
                  <Label htmlFor="hallazgo-lng" className={formStyles.label}>Longitud</Label>
                  <Input
                    id="hallazgo-lng"
                    type="number"
                    step="0.000001"
                    value={hallazgoForm.longitud}
                    onChange={(e) => setHallazgoForm({...hallazgoForm, longitud: e.target.value})}
                    placeholder="-90.5069"
                    className={formStyles.input}
                  />
                </div>
              </div>
            </div>

            {/* Fotografías */}
            <div className={formStyles.section}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={formStyles.sectionTitle}>
                  <Camera className="inline-block h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                  Fotografías ({hallazgoForm.fotografias.length})
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAgregarFotoHallazgoOpen(true)}
                  className={buttonStyles.outline}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Foto
                </Button>
              </div>

              {/* Lista de fotografías */}
              {hallazgoForm.fotografias.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {hallazgoForm.fotografias.map((foto, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                        <img
                          src={foto.url}
                          alt={foto.descripcion}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => handleEliminarFotoHallazgo(index)}
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-xs text-white font-medium truncate">{foto.descripcion}</p>
                        {foto.latitud && foto.longitud && (
                          <p className="text-xs text-white/70 truncate">
                            {foto.latitud}, {foto.longitud}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">No hay fotografías agregadas</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Haz clic en "Agregar Foto" para incluir evidencia fotográfica
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={formStyles.footer}>
              <Button 
                type="button"
                onClick={() => setIsAddHallazgoOpen(false)} 
                variant="outline"
                className={formStyles.cancelButton}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!hallazgoForm.titulo || !hallazgoForm.descripcion}
                className={formStyles.submitButton}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Hallazgo
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Componente reutilizable para agregar fotografía a hallazgos */}
      <FormularioFotografia
        isOpen={isAgregarFotoHallazgoOpen}
        onClose={() => setIsAgregarFotoHallazgoOpen(false)}
        onSubmit={handleSubmitFotoHallazgo}
      />

      {/* Componente reutilizable para agregar fotografía general (evidencia) */}
      <FormularioFotografia
        isOpen={isAddEvidenciaOpen}
        onClose={() => setIsAddEvidenciaOpen(false)}
        onSubmit={handleSubmitFotoEvidencia}
      />

      {/* Modal para agregar punto de coordenada */}
      <Dialog open={isAddCoordenadaOpen} onOpenChange={setIsAddCoordenadaOpen}>
        <DialogContent className={formStyles.dialogContent}>
          <DialogHeader className={formStyles.dialogHeader}>
            <DialogTitle className={formStyles.dialogTitle}>
              <MapPinned className="inline-block h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
              Registrar Punto de Coordenadas
            </DialogTitle>
            <DialogDescription className={formStyles.dialogDescription}>
              Registre un punto GPS durante el recorrido del patrullaje
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => { e.preventDefault(); handleAgregarCoordenada(); }} className={formStyles.form}>
            <div className={formStyles.section}>
              <div className={formStyles.gridSingle}>
                <div className={formStyles.field}>
                  <Label htmlFor="coord-hora" className={formStyles.label}>Hora *</Label>
                  <Input
                    id="coord-hora"
                    type="time"
                    value={coordenadaForm.hora}
                    onChange={(e) => setCoordenadaForm({...coordenadaForm, hora: e.target.value})}
                    className={formStyles.input}
                    required
                  />
                </div>
              </div>

              <div className={formStyles.grid}>
                <div className={formStyles.field}>
                  <Label htmlFor="coord-lat" className={formStyles.label}>Latitud *</Label>
                  <Input
                    id="coord-lat"
                    type="number"
                    step="0.000001"
                    value={coordenadaForm.latitud}
                    onChange={(e) => setCoordenadaForm({...coordenadaForm, latitud: e.target.value})}
                    placeholder="14.6349"
                    className={formStyles.input}
                    required
                  />
                </div>

                <div className={formStyles.field}>
                  <Label htmlFor="coord-lng" className={formStyles.label}>Longitud *</Label>
                  <Input
                    id="coord-lng"
                    type="number"
                    step="0.000001"
                    value={coordenadaForm.longitud}
                    onChange={(e) => setCoordenadaForm({...coordenadaForm, longitud: e.target.value})}
                    placeholder="-90.5069"
                    className={formStyles.input}
                    required
                  />
                </div>
              </div>
            </div>

            <div className={formStyles.footer}>
              <Button 
                type="button"
                onClick={() => setIsAddCoordenadaOpen(false)}
                variant="outline"
                className={formStyles.cancelButton}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!coordenadaForm.latitud || !coordenadaForm.longitud || !coordenadaForm.hora}
                className={formStyles.submitButton}
              >
                <MapPinned className="h-4 w-4 mr-2" />
                Guardar Punto
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para reportar hallazgo independiente */}
      <Dialog open={isReportarHallazgoIndependienteOpen} onOpenChange={setIsReportarHallazgoIndependienteOpen}>
        <DialogContent className={formStyles.dialogContentLarge}>
          <DialogHeader className={formStyles.dialogHeader}>
            <DialogTitle className={formStyles.dialogTitle}>
              <AlertTriangle className="inline-block h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
              Reportar Hallazgo
            </DialogTitle>
            <DialogDescription className={formStyles.dialogDescription}>
              Registre un hallazgo encontrado en el área protegida
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => { e.preventDefault(); handleReportarHallazgoIndependiente(); }} className={formStyles.form}>
            {/* Información del Hallazgo */}
            <div className={formStyles.section}>
              <h3 className={formStyles.sectionTitle}>
                <FileText className="inline-block h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                Información del Hallazgo
              </h3>
              
              <div className={formStyles.gridSingle}>
                <div className={formStyles.field}>
                  <Label htmlFor="hallazgo-ind-gravedad" className={formStyles.label}>Gravedad *</Label>
                  <Select value={hallazgoForm.gravedad} onValueChange={(value: any) => setHallazgoForm({...hallazgoForm, gravedad: value})}>
                    <SelectTrigger className={formStyles.select}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Baja">Baja</SelectItem>
                      <SelectItem value="Media">Media</SelectItem>
                      <SelectItem value="Alta">Alta</SelectItem>
                      <SelectItem value="Crítica">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className={formStyles.gridSingle}>
                <div className={formStyles.field}>
                  <Label htmlFor="hallazgo-ind-titulo" className={formStyles.label}>Título *</Label>
                  <Input
                    id="hallazgo-ind-titulo"
                    value={hallazgoForm.titulo}
                    onChange={(e) => setHallazgoForm({...hallazgoForm, titulo: e.target.value})}
                    placeholder="Título breve del hallazgo"
                    className={formStyles.input}
                    required
                  />
                </div>

                <div className={formStyles.field}>
                  <Label htmlFor="hallazgo-ind-descripcion" className={formStyles.label}>Descripción *</Label>
                  <Textarea
                    id="hallazgo-ind-descripcion"
                    value={hallazgoForm.descripcion}
                    onChange={(e) => setHallazgoForm({...hallazgoForm, descripcion: e.target.value})}
                    placeholder="Describa detalladamente el hallazgo..."
                    rows={4}
                    className={formStyles.textarea}
                    required
                  />
                </div>
              </div>

              <div className={formStyles.grid}>
                <div className={formStyles.field}>
                  <Label htmlFor="hallazgo-ind-lat" className={formStyles.label}>Latitud</Label>
                  <Input
                    id="hallazgo-ind-lat"
                    type="number"
                    step="0.000001"
                    value={hallazgoForm.latitud}
                    onChange={(e) => setHallazgoForm({...hallazgoForm, latitud: e.target.value})}
                    placeholder="14.6349"
                    className={formStyles.input}
                  />
                </div>

                <div className={formStyles.field}>
                  <Label htmlFor="hallazgo-ind-lng" className={formStyles.label}>Longitud</Label>
                  <Input
                    id="hallazgo-ind-lng"
                    type="number"
                    step="0.000001"
                    value={hallazgoForm.longitud}
                    onChange={(e) => setHallazgoForm({...hallazgoForm, longitud: e.target.value})}
                    placeholder="-90.5069"
                    className={formStyles.input}
                  />
                </div>
              </div>
            </div>

            {/* Fotografías */}
            <div className={formStyles.section}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={formStyles.sectionTitle}>
                  <Camera className="inline-block h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                  Fotografías ({hallazgoForm.fotografias.length})
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAgregarFotoHallazgoOpen(true)}
                  className={buttonStyles.outline}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Foto
                </Button>
              </div>

              {/* Lista de fotografías */}
              {hallazgoForm.fotografias.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {hallazgoForm.fotografias.map((foto, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                        <img
                          src={foto.url}
                          alt={foto.descripcion}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => handleEliminarFotoHallazgo(index)}
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-xs text-white font-medium truncate">{foto.descripcion}</p>
                        {foto.latitud && foto.longitud && (
                          <p className="text-xs text-white/70 truncate">
                            {foto.latitud}, {foto.longitud}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">No hay fotografías agregadas</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Haz clic en "Agregar Foto" para incluir evidencia fotográfica
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={formStyles.footer}>
              <Button 
                type="button"
                onClick={() => {
                  setIsReportarHallazgoIndependienteOpen(false);
                  setHallazgoForm({
                    tipo: 'Ambiental',
                    titulo: '',
                    descripcion: '',
                    gravedad: 'Media',
                    latitud: '',
                    longitud: '',
                    fotografias: []
                  });
                }} 
                variant="outline"
                className={formStyles.cancelButton}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={!hallazgoForm.titulo || !hallazgoForm.descripcion}
                className={formStyles.submitButton}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Reportar Hallazgo
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
