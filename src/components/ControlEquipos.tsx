import { useState, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Plus, Edit, Search, Package, AlertTriangle, CheckCircle, Clock, Radio, Navigation, Eye, Camera, Car, Wrench, Box, Shield, XCircle, Tag, Hash, FileText, User, CheckCircle2, MoreVertical } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { equiposAsignados, guardarecursos, areasProtegidas } from '../data/mock-data';
import { motion } from 'motion/react';
import { buttonStyles, filterStyles, formStyles, listCardStyles, layoutStyles, alertDialogStyles, cardStyles, getEstadoTopLineColor } from '../styles/shared-styles';
import { equiposService, EstadoEquipo } from '../utils/equiposService';

interface ControlEquiposProps {
  userPermissions: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
  currentUser?: {
    id: string;
    rol: string;
    nombre: string;
    apellido: string;
    email?: string;
  };
}

export function ControlEquipos({ userPermissions, currentUser }: ControlEquiposProps) {
  const isGuardarecurso = equiposService.isGuardarecurso(currentUser);
  const [equiposList, setEquiposList] = useState([
    ...equiposAsignados,
    {
      id: '4',
      nombre: 'Cámara Canon EOS R6',
      tipo: 'Cámara' as const,
      codigo: 'CAM-001',
      marca: 'Canon',
      modelo: 'EOS R6',
      fechaAsignacion: '2024-03-15',
      estado: 'Operativo' as const,
      guardarecursoAsignado: '1'
    },
    {
      id: '5',
      nombre: 'Vehículo Toyota Hilux',
      tipo: 'Vehículo' as const,
      codigo: 'VEH-001',
      marca: 'Toyota',
      modelo: 'Hilux 2023',
      fechaAsignacion: '2024-01-10',
      estado: 'Operativo' as const,
      observaciones: 'Mantenimiento completado'
    },
    {
      id: '6',
      nombre: 'Radio Motorola XTR',
      tipo: 'Radio' as const,
      codigo: 'RAD-004',
      marca: 'Motorola',
      modelo: 'XTR 446',
      fechaAsignacion: '2024-02-05',
      estado: 'Operativo' as const,
      guardarecursoAsignado: '3'
    },
    {
      id: '7',
      nombre: 'GPS Garmin Montana 700i',
      tipo: 'GPS' as const,
      codigo: 'GPS-003',
      marca: 'Garmin',
      modelo: 'Montana 700i',
      fechaAsignacion: '2024-03-10',
      estado: 'Operativo' as const,
      guardarecursoAsignado: '4'
    },
    {
      id: '8',
      nombre: 'Binoculares Bushnell Legend',
      tipo: 'Binoculares' as const,
      codigo: 'BIN-003',
      marca: 'Bushnell',
      modelo: 'Legend Ultra HD',
      fechaAsignacion: '2024-01-20',
      estado: 'Operativo' as const,
      guardarecursoAsignado: '5'
    },
    {
      id: '9',
      nombre: 'Cámara Nikon D850',
      tipo: 'Cámara' as const,
      codigo: 'CAM-002',
      marca: 'Nikon',
      modelo: 'D850',
      fechaAsignacion: '2024-02-15',
      estado: 'Operativo' as const,
      guardarecursoAsignado: '2'
    },
    {
      id: '10',
      nombre: 'Vehículo Ford Ranger',
      tipo: 'Vehículo' as const,
      codigo: 'VEH-002',
      marca: 'Ford',
      modelo: 'Ranger XLT 2023',
      fechaAsignacion: '2024-01-05',
      estado: 'Operativo' as const,
      observaciones: 'Asignado a Petén'
    },
    {
      id: '11',
      nombre: 'Machete Tramontina',
      tipo: 'Herramienta' as const,
      codigo: 'HER-001',
      marca: 'Tramontina',
      modelo: '18 pulgadas',
      fechaAsignacion: '2024-03-01',
      estado: 'Operativo' as const,
      guardarecursoAsignado: '6'
    },
    {
      id: '12',
      nombre: 'GPS Garmin eTrex 32x',
      tipo: 'GPS' as const,
      codigo: 'GPS-004',
      marca: 'Garmin',
      modelo: 'eTrex 32x',
      fechaAsignacion: '2024-02-20',
      estado: 'En Reparación' as const,
      observaciones: 'Pantalla dañada'
    },
    {
      id: '13',
      nombre: 'Radio Baofeng UV-5R',
      tipo: 'Radio' as const,
      codigo: 'RAD-005',
      marca: 'Baofeng',
      modelo: 'UV-5R',
      fechaAsignacion: '2024-03-05',
      estado: 'Operativo' as const,
      guardarecursoAsignado: '7'
    },
    {
      id: '14',
      nombre: 'Laptop Dell Latitude',
      tipo: 'Otro' as const,
      codigo: 'LAP-001',
      marca: 'Dell',
      modelo: 'Latitude 5420',
      fechaAsignacion: '2024-01-15',
      estado: 'Operativo' as const,
      guardarecursoAsignado: '8'
    },
    {
      id: '15',
      nombre: 'Cámara GoPro Hero 11',
      tipo: 'Cámara' as const,
      codigo: 'CAM-003',
      marca: 'GoPro',
      modelo: 'Hero 11 Black',
      fechaAsignacion: '2024-02-28',
      estado: 'Operativo' as const,
      guardarecursoAsignado: '9'
    },
    {
      id: '16',
      nombre: 'Binoculares Nikon Monarch',
      tipo: 'Binoculares' as const,
      codigo: 'BIN-004',
      marca: 'Nikon',
      modelo: 'Monarch 7',
      fechaAsignacion: '2024-03-12',
      estado: 'Operativo' as const,
      guardarecursoAsignado: '10'
    },
    {
      id: '17',
      nombre: 'Vehículo Chevrolet S10',
      tipo: 'Vehículo' as const,
      codigo: 'VEH-003',
      marca: 'Chevrolet',
      modelo: 'S10 High Country',
      fechaAsignacion: '2023-12-20',
      estado: 'En Reparación' as const,
      observaciones: 'Motor averiado, en espera de repuestos'
    },
    {
      id: '18',
      nombre: 'GPS Magellan eXplorist',
      tipo: 'GPS' as const,
      codigo: 'GPS-005',
      marca: 'Magellan',
      modelo: 'eXplorist 310',
      fechaAsignacion: '2024-01-25',
      estado: 'Operativo' as const,
      guardarecursoAsignado: '11'
    },
    {
      id: '19',
      nombre: 'Radio Kenwood TK-3402',
      tipo: 'Radio' as const,
      codigo: 'RAD-006',
      marca: 'Kenwood',
      modelo: 'TK-3402U16P',
      fechaAsignacion: '2024-02-10',
      estado: 'Operativo' as const,
      guardarecursoAsignado: '12'
    },
    {
      id: '20',
      nombre: 'Drone DJI Mavic 3',
      tipo: 'Otro' as const,
      codigo: 'DRO-001',
      marca: 'DJI',
      modelo: 'Mavic 3',
      fechaAsignacion: '2024-03-20',
      estado: 'Operativo' as const,
      observaciones: 'Para vigilancia aérea'
    },
    {
      id: '21',
      nombre: 'Kit de Primeros Auxilios',
      tipo: 'Otro' as const,
      codigo: 'MED-001',
      marca: 'Adventure Medical',
      modelo: 'Ultralight/Watertight',
      fechaAsignacion: '2024-01-30',
      estado: 'Operativo' as const,
      guardarecursoAsignado: '13'
    },
    {
      id: '22',
      nombre: 'Tableta Samsung Galaxy Tab',
      tipo: 'Otro' as const,
      codigo: 'TAB-001',
      marca: 'Samsung',
      modelo: 'Galaxy Tab S8',
      fechaAsignacion: '2024-02-22',
      estado: 'Desactivado' as const,
      observaciones: 'Actualización de software'
    },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState<any>(null);
  
  // Estados para confirmación de cambio de estado
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [equipoToChange, setEquipoToChange] = useState<any>(null);
  const [newEstado, setNewEstado] = useState<EstadoEquipo | ''>('');
  
  // Usar servicio para crear form data vacío
  const [formData, setFormData] = useState(equiposService.createEmptyFormData());

  // Filtrado usando el servicio
  const filteredEquipos = useMemo(() => {
    return equiposService.filterEquipos(
      equiposList,
      searchTerm,
      currentUser,
      guardarecursos
    );
  }, [equiposList, searchTerm, currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingEquipo) {
      // Actualizar usando el servicio
      const equipoActualizado = equiposService.updateEquipo(editingEquipo, formData);
      setEquiposList(prev => prev.map(eq => 
        eq.id === editingEquipo.id ? equipoActualizado : eq
      ));
    } else {
      // Crear usando el servicio
      const nuevoEquipo = equiposService.createEquipo(formData);
      setEquiposList(prev => [...prev, nuevoEquipo]);
    }
    
    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData(equiposService.createEmptyFormData());
    setEditingEquipo(null);
  };

  const handleEdit = (equipo: any) => {
    setFormData(equiposService.equipoToFormData(equipo));
    setEditingEquipo(equipo);
    setIsDialogOpen(true);
  };

  const handleEstadoClick = (equipo: any, estado: EstadoEquipo) => {
    setEquipoToChange(equipo);
    setNewEstado(estado);
    setConfirmDialogOpen(true);
  };

  const confirmEstadoChange = () => {
    if (equipoToChange && newEstado) {
      // Actualizar estado usando el servicio
      const equipoActualizado = equiposService.updateEstado(equipoToChange, newEstado as EstadoEquipo);
      setEquiposList(prev => prev.map(equipo => 
        equipo.id === equipoToChange.id ? equipoActualizado : equipo
      ));
    }
    setConfirmDialogOpen(false);
    setEquipoToChange(null);
    setNewEstado('');
  };

  // Usar funciones del servicio para estilos
  const getEstadoBadgeClass = (estado: EstadoEquipo) => {
    return equiposService.getEstadoBadgeClass(estado);
  };

  const getEstadoIcon = (estado: EstadoEquipo) => {
    const iconName = equiposService.getEstadoIcon(estado);
    switch (iconName) {
      case 'CheckCircle2': return CheckCircle2;
      case 'Wrench': return Wrench;
      case 'XCircle': return XCircle;
      default: return XCircle;
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra superior con búsqueda y botón - Diseño Minimalista - Solo para Administradores y Coordinadores */}
      {!isGuardarecurso && (
        <div className={filterStyles.filterGroupNoBorder}>
          {/* Búsqueda */}
          <div className={filterStyles.searchContainer}>
            <div className={filterStyles.searchContainerWrapper}>
              <Search className={filterStyles.searchIcon} />
              <Input
                placeholder="Buscar equipos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={filterStyles.searchInput}
              />
            </div>
          </div>
          
          {/* Botón crear */}
          {userPermissions.canCreate && (
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
          )}
        </div>
      )}
      
      {/* Vista especial para Guardarecursos */}
      {isGuardarecurso && (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-base sm:text-lg text-green-900 dark:text-green-100 truncate">
                  Mis Equipos Asignados
                </h3>
                <p className="text-xs sm:text-sm text-green-700 dark:text-green-300 truncate">
                  {currentUser?.nombre} {currentUser?.apellido} - Vista personal
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diálogo para crear/editar - Solo para usuarios con permiso */}
      {!isGuardarecurso && userPermissions.canCreate && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className={formStyles.dialogContent}>
            <DialogHeader className={formStyles.dialogHeader}>
              <DialogTitle className={formStyles.dialogTitle}>
                {editingEquipo ? 'Editar Equipo' : 'Nuevo Equipo'}
              </DialogTitle>
              <DialogDescription className={formStyles.dialogDescription}>
                Complete la información del equipo o recurso
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className={formStyles.form}>
              {/* Información General */}
              <div className={formStyles.section}>
                <h3 className={formStyles.sectionTitle}>Información General</h3>
                
                <div className={formStyles.grid}>
                  <div className={formStyles.field}>
                    <Label htmlFor="nombre" className={formStyles.label}>
                      Nombre del Equipo *
                    </Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      placeholder="Ej: Radio Motorola XTR"
                      className={formStyles.input}
                      required
                    />
                  </div>
                  
                  <div className={formStyles.field}>
                    <Label htmlFor="codigo" className={formStyles.label}>
                      Código de Inventario *
                    </Label>
                    <Input
                      id="codigo"
                      value={formData.codigo}
                      onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                      placeholder="Ej: RAD-001"
                      className={formStyles.input}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Especificaciones Técnicas */}
              <div className={formStyles.section}>
                <h3 className={formStyles.sectionTitle}>Especificaciones Técnicas</h3>
                
                <div className={formStyles.grid}>
                  <div className={formStyles.field}>
                    <Label htmlFor="marca" className={formStyles.label}>
                      Marca
                    </Label>
                    <Input
                      id="marca"
                      value={formData.marca}
                      onChange={(e) => setFormData({...formData, marca: e.target.value})}
                      placeholder="Ej: Motorola"
                      className={formStyles.input}
                    />
                  </div>
                  
                  <div className={formStyles.field}>
                    <Label htmlFor="modelo" className={formStyles.label}>
                      Modelo
                    </Label>
                    <Input
                      id="modelo"
                      value={formData.modelo}
                      onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                      placeholder="Ej: XTR 446"
                      className={formStyles.input}
                    />
                  </div>
                </div>
              </div>

              {/* Asignación */}
              <div className={formStyles.section}>
                <h3 className={formStyles.sectionTitle}>Asignación</h3>
                
                <div className={formStyles.gridSingle}>
                  <div className={formStyles.field}>
                    <Label htmlFor="guardarecurso" className={formStyles.label}>
                      Asignado a
                    </Label>
                    <Select value={formData.guardarecursoAsignado} onValueChange={(value) => setFormData({...formData, guardarecursoAsignado: value})}>
                      <SelectTrigger className={formStyles.selectTrigger}>
                        <SelectValue placeholder="Seleccione guardarecurso (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin asignar</SelectItem>
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
                </div>
              </div>

              {/* Observaciones */}
              <div className={formStyles.section}>
                <h3 className={formStyles.sectionTitle}>Observaciones</h3>
                
                <div className={formStyles.gridSingle}>
                  <div className={formStyles.field}>
                    <Label htmlFor="observaciones" className={formStyles.label}>
                      Notas Adicionales
                    </Label>
                    <Textarea
                      id="observaciones"
                      value={formData.observaciones}
                      onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                      placeholder="Notas adicionales sobre el equipo..."
                      className={formStyles.textarea}
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
      )}

      {/* Grid de equipos */}
      <div>
        <div>
          {filteredEquipos.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 sm:p-12">
                <div className="text-center">
                  <Package className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-30" />
                  <h3 className="mb-2 text-sm sm:text-base">
                    {isGuardarecurso ? 'No tienes equipos asignados' : 'No se encontraron equipos'}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                    {isGuardarecurso 
                      ? 'Actualmente no tienes ningún equipo asignado a tu cargo'
                      : 'No hay equipos que coincidan con los filtros seleccionados'
                    }
                  </p>
                  {!isGuardarecurso && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedEstado('todos');
                      }}
                      className="text-xs sm:text-sm"
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className={layoutStyles.cardGrid}>
              {filteredEquipos.map((equipo, index) => {
                const guardarecurso = guardarecursos.find(g => g.id === (equipo as any).guardarecursoAsignado);
                
                return (
                  <motion.div
                    key={equipo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className={`${cardStyles.baseWithOverflow} ${listCardStyles.card}`}>
                      <div className={getEstadoTopLineColor(equipo.estado)} />
                      <CardContent className={listCardStyles.content}>
                        {/* Header con nombre y acciones */}
                        <div className={listCardStyles.header}>
                          <div className={listCardStyles.headerContent}>
                            <h3 className={listCardStyles.title}>{equipo.nombre}</h3>
                            <Badge className={`${getEstadoBadgeClass(equipo.estado)} ${listCardStyles.badge}`}>
                              {equipo.estado}
                            </Badge>
                          </div>
                          <div className={listCardStyles.headerActions}>
                            {!isGuardarecurso && userPermissions.canEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(equipo)}
                                className={listCardStyles.actionButtonEdit}
                                title="Editar equipo"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {!isGuardarecurso && userPermissions.canDelete && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    title="Cambiar estado"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel className="text-xs">Cambiar Estado</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleEstadoClick(equipo, 'Operativo')}
                                    disabled={equipo.estado === 'Operativo'}
                                    className="text-xs"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-green-600" />
                                    Operativo
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleEstadoClick(equipo, 'En Reparación')}
                                    disabled={equipo.estado === 'En Reparación'}
                                    className="text-xs"
                                  >
                                    <Wrench className="h-3.5 w-3.5 mr-2 text-orange-600" />
                                    En Reparación
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleEstadoClick(equipo, 'Desactivado')}
                                    disabled={equipo.estado === 'Desactivado'}
                                    className="text-xs"
                                  >
                                    <XCircle className="h-3.5 w-3.5 mr-2 text-gray-600" />
                                    Desactivado
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>

                        {/* Información del equipo */}
                        <div className={listCardStyles.infoSection}>
                          <div className={listCardStyles.infoItem}>
                            <Hash className={listCardStyles.infoIcon} />
                            <span className={listCardStyles.infoText}>{equipo.codigo}</span>
                          </div>

                          {equipo.marca && (
                            <div className={listCardStyles.infoItem}>
                              <Tag className={listCardStyles.infoIcon} />
                              <span className={listCardStyles.infoText}>{equipo.marca} {equipo.modelo && `- ${equipo.modelo}`}</span>
                            </div>
                          )}

                          {/* Asignado a */}
                          <div className={listCardStyles.infoItem}>
                            <User className={listCardStyles.infoIcon} />
                            {guardarecurso ? (
                              <span className={listCardStyles.infoText}>
                                {guardarecurso.nombre} {guardarecurso.apellido}
                              </span>
                            ) : (
                              <span className="text-gray-500 dark:text-gray-400 italic text-sm">Sin asignar</span>
                            )}
                          </div>
                        </div>

                        {/* Observaciones */}
                        {equipo.observaciones && (
                          <p className={listCardStyles.description}>
                            {equipo.observaciones}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Diálogo de confirmación de cambio de estado */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent className={alertDialogStyles.contentLarge}>
          <AlertDialogHeader className={alertDialogStyles.header}>
            <AlertDialogTitle className={alertDialogStyles.title}>
              ¿Cambiar estado del equipo?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className={alertDialogStyles.description}>
                <p className={alertDialogStyles.descriptionText}>
                  Está a punto de cambiar el estado del equipo{' '}
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {equipoToChange?.nombre}
                  </span>{' '}
                  a{' '}
                  <span className={
                    newEstado === 'Operativo' 
                      ? alertDialogStyles.highlightGreen
                      : newEstado === 'En Reparación'
                      ? alertDialogStyles.highlightOrange
                      : alertDialogStyles.highlightGray
                  }>
                    {newEstado}
                  </span>
                </p>
                <div className={
                  newEstado === 'Operativo' 
                    ? alertDialogStyles.infoBoxGreen
                    : newEstado === 'En Reparación'
                    ? alertDialogStyles.infoBoxOrange
                    : alertDialogStyles.infoBoxGray
                }>
                  <p className={
                    newEstado === 'Operativo' 
                      ? alertDialogStyles.infoTextGreen
                      : newEstado === 'En Reparación'
                      ? alertDialogStyles.infoTextOrange
                      : alertDialogStyles.infoTextGray
                  }>
                    {newEstado === 'Operativo' && 'El equipo estará disponible para su uso normal.'}
                    {newEstado === 'En Reparación' && 'El equipo se marcará como en proceso de reparación y se desasignará automáticamente del guardarecurso actual.'}
                    {newEstado === 'Desactivado' && 'El equipo será desactivado y eliminado del sistema. No aparecerá más en los listados.'}
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={alertDialogStyles.footer}>
            <AlertDialogCancel className={alertDialogStyles.cancelButton}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmEstadoChange}
              className={alertDialogStyles.confirmButton}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
