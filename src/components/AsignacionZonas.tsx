import { useState, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Plus, MapPin, Edit, Search, Globe, Trees, Map, CheckCircle2, XCircle, TreePine } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { areasProtegidas, guardarecursos } from '../data/mock-data';
import { AreaProtegida } from '../types';
import { buttonStyles, filterStyles, formStyles, listCardStyles, layoutStyles, estadoAlertStyles, cardStyles, getEstadoTopLineColor, getEstadoBadgeClass } from '../styles/shared-styles';
import { toast } from 'sonner@2.0.3';
import { areasProtegidasService, AreaEstadoPendiente } from '../utils/areasProtegidasService';

interface AsignacionZonasProps {
  userPermissions: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
}

export function AsignacionZonas({ userPermissions }: AsignacionZonasProps) {
  // Estados principales
  const [areasList, setAreasList] = useState(areasProtegidas);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartamento, setSelectedDepartamento] = useState<string>('todos');
  
  // Estados para diálogo
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaProtegida | null>(null);
  
  // Estados para confirmación de cambio de estado
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [estadoPendiente, setEstadoPendiente] = useState<AreaEstadoPendiente | null>(null);
  
  // Form data usando el servicio
  const [formData, setFormData] = useState(areasProtegidasService.createEmptyFormData());

  // Opciones desde el servicio
  const ecosistemas = areasProtegidasService.ecosistemas;
  const departamentos = areasProtegidasService.departamentos;

  // Filtros usando el servicio
  const filteredAreas = useMemo(() => {
    return areasProtegidasService.filterAreasProtegidas(
      areasList,
      searchTerm,
      selectedDepartamento
    );
  }, [areasList, searchTerm, selectedDepartamento]);

  // Funciones de manejo usando el servicio
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingArea) {
      // Actualizar usando el servicio
      const areaActualizada = areasProtegidasService.updateAreaProtegida(editingArea, formData);
      setAreasList(prev => prev.map(a => 
        a.id === editingArea.id ? areaActualizada : a
      ));
    } else {
      // Crear usando el servicio
      const nuevaArea = areasProtegidasService.createAreaProtegida(formData);
      setAreasList(prev => [...prev, nuevaArea]);
    }
    
    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData(areasProtegidasService.createEmptyFormData());
    setEditingArea(null);
  };

  const handleEdit = (area: AreaProtegida) => {
    setFormData(areasProtegidasService.areaToFormData(area));
    setEditingArea(area);
    setIsDialogOpen(true);
  };

  const handleEstadoClick = (area: AreaProtegida) => {
    // Determinar nuevo estado usando el servicio
    const nuevoEstado = areasProtegidasService.toggleEstado(area.estado);
    
    // Validar cambio de estado
    if (!areasProtegidasService.isValidEstadoChange(area.estado, nuevoEstado)) {
      toast.info('Sin cambios', {
        description: `El área ya está en estado ${nuevoEstado}.`
      });
      return;
    }

    // Si intenta desactivar, validar usando el servicio
    if (nuevoEstado === 'Desactivado') {
      const validation = areasProtegidasService.validateAreaDeactivation(area, guardarecursos);
      
      if (!validation.isValid) {
        toast.error('No se puede desactivar', {
          description: validation.message,
          duration: 5000
        });
        return;
      }
    }

    // Preparar estado pendiente usando el servicio
    setEstadoPendiente(
      areasProtegidasService.prepareEstadoPendiente(area, nuevoEstado)
    );
    setConfirmDialogOpen(true);
  };

  const confirmEstadoChange = () => {
    if (!estadoPendiente) return;

    const { id, nuevoEstado, nombre } = estadoPendiente;

    // Actualizar el área usando el servicio
    setAreasList(prev => prev.map(area =>
      area.id === id ? areasProtegidasService.updateEstado(area, nuevoEstado) : area
    ));

    // Obtener mensaje usando el servicio
    const mensaje = areasProtegidasService.getEstadoMensaje(nuevoEstado);

    toast.success('Estado actualizado', {
      description: `${nombre} ha sido ${mensaje}.`
    });

    // Limpiar y cerrar
    setConfirmDialogOpen(false);
    setEstadoPendiente(null);
  };

  return (
    <div className={layoutStyles.container}>
      {/* Barra superior con búsqueda y botón - Diseño Minimalista */}
      <div className={filterStyles.filterGroupNoBorder}>
        {/* Búsqueda */}
        <div className={filterStyles.searchContainer}>
          <div className={filterStyles.searchContainerWrapper}>
            <Search className={filterStyles.searchIcon} />
            <Input
              placeholder="Buscar áreas protegidas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={filterStyles.searchInput}
            />
          </div>
        </div>
        
        {/* Filtro por departamento */}
        <div className={filterStyles.selectWrapper}>
          <Select value={selectedDepartamento} onValueChange={setSelectedDepartamento}>
            <SelectTrigger className={filterStyles.selectTrigger}>
              <SelectValue placeholder="Todos los departamentos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los departamentos</SelectItem>
              {departamentos.map(dep => (
                <SelectItem key={dep} value={dep}>{dep}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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


      {/* Diálogo para crear/editar área protegida */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className={formStyles.dialogContent}>
            <DialogHeader className={formStyles.dialogHeader}>
              <DialogTitle className={formStyles.dialogTitle}>
                {editingArea ? 'Editar Área Protegida' : 'Nueva Área Protegida'}
              </DialogTitle>
              <DialogDescription className={formStyles.dialogDescription}>
                Complete la información del área protegida
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className={formStyles.form}>
              {/* Información General */}
              <div className={formStyles.section}>
                <h3 className={formStyles.sectionTitle}>Información General</h3>
                
                <div className={formStyles.grid}>
                  <div className={formStyles.field}>
                    <Label htmlFor="nombre" className={formStyles.label}>Nombre del Área *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      placeholder="Ej: Parque Nacional Tikal"
                      className={formStyles.input}
                      required
                    />
                  </div>

                  <div className={formStyles.field}>
                    <Label htmlFor="departamento" className={formStyles.label}>Departamento *</Label>
                    <Select 
                      value={formData.departamento} 
                      onValueChange={(value) => setFormData({...formData, departamento: value})}
                    >
                      <SelectTrigger className={formStyles.selectTrigger}>
                        <SelectValue placeholder="Seleccione departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {departamentos.map(dep => (
                          <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className={formStyles.fieldFullWidth}>
                    <Label htmlFor="extension" className={formStyles.label}>Extensión (hectáreas) *</Label>
                    <Input
                      id="extension"
                      type="number"
                      min="1"
                      value={formData.extension || ''}
                      onChange={(e) => setFormData({...formData, extension: parseInt(e.target.value) || 0})}
                      placeholder="57500"
                      className={formStyles.input}
                      required
                    />
                  </div>

                  <div className={formStyles.fieldFullWidth}>
                    <Label htmlFor="descripcion" className={formStyles.label}>Descripción *</Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                      placeholder="Descripción del área protegida..."
                      rows={3}
                      className="resize-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div className={formStyles.section}>
                <h3 className={formStyles.sectionTitle}>Ubicación Geográfica</h3>
                
                <div className={formStyles.grid}>
                  <div className={formStyles.field}>
                    <Label htmlFor="lat" className={formStyles.label}>Latitud *</Label>
                    <Input
                      id="lat"
                      type="number"
                      step="0.0001"
                      value={formData.coordenadas.lat || ''}
                      onChange={(e) => setFormData({
                        ...formData, 
                        coordenadas: { ...formData.coordenadas, lat: parseFloat(e.target.value) || 0 }
                      })}
                      placeholder="17.2328"
                      className={formStyles.input}
                      required
                    />
                  </div>
                  
                  <div className={formStyles.field}>
                    <Label htmlFor="lng" className={formStyles.label}>Longitud *</Label>
                    <Input
                      id="lng"
                      type="number"
                      step="0.0001"
                      value={formData.coordenadas.lng || ''}
                      onChange={(e) => setFormData({
                        ...formData, 
                        coordenadas: { ...formData.coordenadas, lng: parseFloat(e.target.value) || 0 }
                      })}
                      placeholder="-89.6239"
                      className={formStyles.input}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Ecosistema */}
              <div className={formStyles.section}>
                <h3 className={formStyles.sectionTitle}>Ecosistema</h3>
                
                <div className={formStyles.gridSingle}>
                  <div className={formStyles.field}>
                    <Label className={formStyles.label}>Ecosistema Principal *</Label>
                    <Select 
                      value={formData.ecosistemas[0]} 
                      onValueChange={(value) => setFormData({...formData, ecosistemas: [value]})}
                    >
                      <SelectTrigger className={formStyles.selectTrigger}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ecosistemas.map(eco => (
                          <SelectItem key={eco} value={eco}>{eco}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
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

      {/* Grid de áreas protegidas */}
      <div className={layoutStyles.cardGrid}>
        {filteredAreas.map((area) => (
          <Card key={area.id} className={`${cardStyles.baseWithOverflow} ${listCardStyles.card}`}>
            <div className={getEstadoTopLineColor(area.estado)} />
            <CardContent className={listCardStyles.content}>
              {/* Header con nombre y acciones */}
              <div className={listCardStyles.header}>
                <div className={listCardStyles.headerContent}>
                  <h3 className={listCardStyles.title}>{area.nombre}</h3>
                  <Badge className={`${getEstadoBadgeClass(area.estado)} ${listCardStyles.badge}`}>
                    {area.estado}
                  </Badge>
                </div>
                <div className={listCardStyles.headerActions}>
                  {userPermissions.canEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(area)}
                      className={listCardStyles.actionButtonEdit}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {userPermissions.canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEstadoClick(area)}
                      className={
                        area.estado === 'Activo'
                          ? listCardStyles.actionButtonDeactivate
                          : listCardStyles.actionButtonActivate
                      }
                      title={area.estado === 'Activo' ? 'Desactivar área' : 'Activar área'}
                    >
                      {area.estado === 'Activo' ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Información del área */}
              <div className={listCardStyles.infoSection}>
                <div className={listCardStyles.infoItem}>
                  <MapPin className={listCardStyles.infoIcon} />
                  <span className={listCardStyles.infoText}>{area.departamento}</span>
                </div>

                <div className={listCardStyles.infoItem}>
                  <Globe className={listCardStyles.infoIcon} />
                  <span className={listCardStyles.infoText}>
                    {area.extension.toLocaleString()} ha
                  </span>
                </div>

                <div className={listCardStyles.infoItem}>
                  <TreePine className={listCardStyles.infoIcon} />
                  <span className={listCardStyles.infoText}>{area.ecosistemas[0]}</span>
                </div>

                <div className={listCardStyles.infoItem}>
                  <Map className={listCardStyles.infoIcon} />
                  <div className={listCardStyles.infoText}>
                    <div>Lat: {area.coordenadas.lat}</div>
                    <div>Lng: {area.coordenadas.lng}</div>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <p className={listCardStyles.description}>
                {area.descripcion}
              </p>
            </CardContent>
          </Card>
        ))}
      
        {filteredAreas.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-8 sm:p-12">
              <div className="text-center">
                <MapPin className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground opacity-30" />
                <h3 className="font-medium mb-2 text-sm sm:text-base">No se encontraron áreas protegidas</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Intente ajustar los filtros de búsqueda
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Diálogo de confirmación de cambio de estado */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent className={estadoAlertStyles.content}>
          <AlertDialogHeader className={estadoAlertStyles.header}>
            <AlertDialogTitle className={estadoAlertStyles.title}>
              ¿Confirmar cambio de estado?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className={estadoAlertStyles.description}>
                {estadoPendiente && (
                  <>
                    <p className={estadoAlertStyles.descriptionText}>
                      Está a punto de cambiar el estado de{' '}
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {estadoPendiente.nombre}
                      </span>{' '}
                      a{' '}
                      <span className={estadoAlertStyles.estadoHighlight(estadoPendiente.nuevoEstado)}>
                        {estadoPendiente.nuevoEstado}
                      </span>
                    </p>
                    <div className={estadoAlertStyles.infoBox(estadoPendiente.nuevoEstado)}>
                      <p className={estadoAlertStyles.infoText(estadoPendiente.nuevoEstado)}>
                        {estadoPendiente.nuevoEstado === 'Activo' && (
                          <>El área estará disponible para asignaciones de guardarecursos.</>
                        )}
                        {estadoPendiente.nuevoEstado === 'Desactivado' && (
                          <>El área desaparecerá del sistema completamente.</>
                        )}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={estadoAlertStyles.footer}>
            <AlertDialogCancel 
              onClick={() => {
                setConfirmDialogOpen(false);
                setEstadoPendiente(null);
              }}
              className={estadoAlertStyles.cancelButton}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmEstadoChange}
              className={estadoAlertStyles.confirmButton}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
