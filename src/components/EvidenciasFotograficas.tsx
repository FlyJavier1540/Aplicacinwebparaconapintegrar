import { useState, useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Search, Camera, MapPin, Eye, Calendar, Download, User } from 'lucide-react';
import { evidenciasFotograficas, guardarecursos, actividades, areasProtegidas } from '../data/mock-data';
import { motion } from 'motion/react';
import { 
  filterStyles, 
  buttonStyles, 
  galleryStyles, 
  formStyles, 
  layoutStyles,
  animationStyles,
  cardStyles
} from '../styles/shared-styles';
import { 
  registroFotograficoService,
  EvidenciaFormularioData
} from '../utils/registroFotograficoService';

interface EvidenciasFotograficasProps {
  userPermissions?: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
  currentUser?: any;
}

export function EvidenciasFotograficas({ 
  userPermissions = { canView: true, canCreate: true, canEdit: true, canDelete: true }, 
  currentUser 
}: EvidenciasFotograficasProps) {
  const [evidenciasList, setEvidenciasList] = useState([
    ...evidenciasFotograficas,
    {
      id: '3',
      url: '/evidencia/mantenimiento-1.jpg',
      descripcion: 'Reparación de sendero principal',
      coordenadas: { lat: 17.2365, lng: -89.6195 },
      fecha: '2024-10-08T10:30:00Z',
      tipo: 'Mantenimiento' as const,
      actividad: '1',
      guardarecurso: '1'
    },
    {
      id: '4',
      url: '/evidencia/flora-1.jpg',
      descripcion: 'Orquídea endémica encontrada en zona protegida',
      coordenadas: { lat: 17.2390, lng: -89.6205 },
      fecha: '2024-10-07T15:45:00Z',
      tipo: 'Flora' as const,
      actividad: '2',
      guardarecurso: '2'
    },
    {
      id: '5',
      url: '/evidencia/infraestructura-1.jpg',
      descripcion: 'Señalización dañada por vandalismo',
      coordenadas: { lat: 17.2375, lng: -89.6185 },
      fecha: '2024-10-07T08:15:00Z',
      tipo: 'Irregularidad' as const,
      actividad: '1',
      guardarecurso: '1'
    },
    {
      id: '6',
      url: '/evidencia/fauna-2.jpg',
      descripcion: 'Jaguar capturado por cámara trampa',
      coordenadas: { lat: 17.2455, lng: -89.6320 },
      fecha: '2024-10-06T03:20:00Z',
      tipo: 'Fauna' as const,
      actividad: '3',
      guardarecurso: '3'
    },
    {
      id: '7',
      url: '/evidencia/infraestructura-2.jpg',
      descripcion: 'Mirador renovado - antes y después',
      coordenadas: { lat: 17.2410, lng: -89.6150 },
      fecha: '2024-10-06T14:00:00Z',
      tipo: 'Infraestructura' as const,
      actividad: '4',
      guardarecurso: '4'
    },
    {
      id: '8',
      url: '/evidencia/irregularidad-1.jpg',
      descripcion: 'Tala ilegal detectada en sector norte',
      coordenadas: { lat: 17.2550, lng: -89.6400 },
      fecha: '2024-10-05T09:30:00Z',
      tipo: 'Irregularidad' as const,
      actividad: '5',
      guardarecurso: '5'
    },
    {
      id: '9',
      url: '/evidencia/flora-2.jpg',
      descripcion: 'Ceiba pentandra en floración',
      coordenadas: { lat: 17.2300, lng: -89.6100 },
      fecha: '2024-10-05T11:45:00Z',
      tipo: 'Flora' as const,
      actividad: '6',
      guardarecurso: '6'
    },
    {
      id: '10',
      url: '/evidencia/fauna-3.jpg',
      descripcion: 'Quetzal observado en zona de anidación',
      coordenadas: { lat: 17.2480, lng: -89.6280 },
      fecha: '2024-10-04T06:15:00Z',
      tipo: 'Fauna' as const,
      actividad: '2',
      guardarecurso: '7'
    },
    {
      id: '11',
      url: '/evidencia/mantenimiento-2.jpg',
      descripcion: 'Limpieza de senderos después de tormenta',
      coordenadas: { lat: 17.2340, lng: -89.6180 },
      fecha: '2024-10-04T13:20:00Z',
      tipo: 'Mantenimiento' as const,
      actividad: '1',
      guardarecurso: '8'
    },
    {
      id: '12',
      url: '/evidencia/otro-1.jpg',
      descripcion: 'Educación ambiental con comunidad local',
      coordenadas: { lat: 17.2260, lng: -89.6050 },
      fecha: '2024-10-03T10:00:00Z',
      tipo: 'Otro' as const,
      actividad: '3',
      guardarecurso: '9'
    },
    {
      id: '13',
      url: '/evidencia/fauna-4.jpg',
      descripcion: 'Grupo de monos aulladores en dosel',
      coordenadas: { lat: 17.2520, lng: -89.6350 },
      fecha: '2024-10-03T07:30:00Z',
      tipo: 'Fauna' as const,
      actividad: '2',
      guardarecurso: '10'
    },
    {
      id: '14',
      url: '/evidencia/irregularidad-2.jpg',
      descripcion: 'Residuos dejados por visitantes',
      coordenadas: { lat: 17.2380, lng: -89.6220 },
      fecha: '2024-10-02T16:45:00Z',
      tipo: 'Irregularidad' as const,
      actividad: '5',
      guardarecurso: '11'
    },
    {
      id: '15',
      url: '/evidencia/flora-3.jpg',
      descripcion: 'Bromelias epífitas en recuperación',
      coordenadas: { lat: 17.2420, lng: -89.6190 },
      fecha: '2024-10-02T12:15:00Z',
      tipo: 'Flora' as const,
      actividad: '6',
      guardarecurso: '12'
    },
    {
      id: '16',
      url: '/evidencia/infraestructura-3.jpg',
      descripcion: 'Nueva señalización instalada',
      coordenadas: { lat: 17.2290, lng: -89.6080 },
      fecha: '2024-10-01T15:30:00Z',
      tipo: 'Infraestructura' as const,
      actividad: '4',
      guardarecurso: '1'
    },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedEvidencia, setSelectedEvidencia] = useState<any>(null);
  
  // Formulario usando el servicio
  const [formData, setFormData] = useState<EvidenciaFormularioData>(
    registroFotograficoService.createEmptyEvidenciaForm()
  );

  const isGuardarecurso = currentUser?.rol === 'Guardarecurso';
  const currentGuardarecursoId = isGuardarecurso ? currentUser?.id : null;

  // Filtrado usando el servicio
  const filteredEvidencias = useMemo(() => {
    return registroFotograficoService.filterEvidenciasPorRol(
      evidenciasList,
      searchTerm,
      isGuardarecurso,
      currentGuardarecursoId
    );
  }, [evidenciasList, searchTerm, isGuardarecurso, currentGuardarecursoId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registroFotograficoService.isEvidenciaFormValid(formData)) {
      return;
    }
    
    // Crear nueva evidencia usando el servicio
    const nuevaEvidencia = registroFotograficoService.createNuevaEvidencia(formData, 'Otro');
    
    setEvidenciasList(prev => [...prev, nuevaEvidencia]);
    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData(registroFotograficoService.createEmptyEvidenciaForm());
  };

  const handleView = (evidencia: any) => {
    setSelectedEvidencia(evidencia);
    setIsViewDialogOpen(true);
  };

  return (
    <div className={layoutStyles.container}>
      {/* Búsqueda - Diseño Minimalista sin filtros */}
      <div className={filterStyles.filterGroupNoBorder}>
        <div className={filterStyles.searchContainer}>
          <div className={filterStyles.searchContainerWrapper}>
            <Search className={filterStyles.searchIcon} />
            <Input
              placeholder="Buscar por descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={filterStyles.searchInput}
            />
          </div>
        </div>
      </div>

      {/* Diálogo para registrar evidencia */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={formStyles.dialogContentLarge}>
          <DialogHeader className={formStyles.dialogHeader}>
            <DialogTitle className={formStyles.dialogTitle}>
              Registrar Nueva Evidencia
            </DialogTitle>
            <DialogDescription className={formStyles.dialogDescription}>
              Suba y clasifique evidencia fotográfica de campo
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className={formStyles.form}>
            {/* Upload de fotografía */}
            <div className={formStyles.section}>
              <h3 className={formStyles.sectionTitle}>Fotografía</h3>
              
              <div className={galleryStyles.uploadArea}>
                <Camera className={galleryStyles.uploadIcon} />
                <p className={galleryStyles.uploadText}>
                  Haga clic para seleccionar una fotografía o arrástrela aquí
                </p>
                <Button type="button" variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Seleccionar Archivo
                </Button>
                <p className={galleryStyles.uploadHint}>
                  Formatos soportados: JPG, PNG. Máximo 10MB.
                </p>
              </div>
            </div>

            {/* Clasificación */}
            <div className={formStyles.section}>
              <h3 className={formStyles.sectionTitle}>Clasificación</h3>
              
              <div className={formStyles.grid}>
                <div className={formStyles.field}>
                  <Label className={formStyles.label}>Actividad Relacionada</Label>
                  <Select value={formData.actividad} onValueChange={(value) => setFormData({...formData, actividad: value})}>
                    <SelectTrigger className={formStyles.selectTrigger}>
                      <SelectValue placeholder="Seleccione actividad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguna</SelectItem>
                      {actividades.map(a => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.tipo} - {a.fecha}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className={formStyles.field}>
                  <Label className={formStyles.label}>Guardarecurso</Label>
                  <Select value={formData.guardarecurso} onValueChange={(value) => setFormData({...formData, guardarecurso: value})}>
                    <SelectTrigger className={formStyles.selectTrigger}>
                      <SelectValue placeholder="Seleccione guardarecurso" />
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

                <div className={formStyles.fieldFullWidth}>
                  <Label className={formStyles.label}>Descripción *</Label>
                  <Textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    placeholder="Describa la evidencia fotográfica..."
                    rows={3}
                    required
                    className="resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div className={formStyles.section}>
              <h3 className={formStyles.sectionTitle}>Ubicación</h3>
              
              <div className={formStyles.grid}>
                <div className={formStyles.field}>
                  <Label className={formStyles.label}>Latitud</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={formData.coordenadas.lat || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      coordenadas: { ...formData.coordenadas, lat: parseFloat(e.target.value) || 0 }
                    })}
                    placeholder="Ej: 17.2328"
                    className={formStyles.input}
                  />
                </div>
                
                <div className={formStyles.field}>
                  <Label className={formStyles.label}>Longitud</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={formData.coordenadas.lng || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      coordenadas: { ...formData.coordenadas, lng: parseFloat(e.target.value) || 0 }
                    })}
                    placeholder="Ej: -89.6239"
                    className={formStyles.input}
                  />
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div className={formStyles.section}>
              <h3 className={formStyles.sectionTitle}>Observaciones</h3>
              
              <div className={formStyles.gridSingle}>
                <div className={formStyles.field}>
                  <Label className={formStyles.label}>Observaciones Adicionales</Label>
                  <Textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                    placeholder="Observaciones adicionales sobre la evidencia..."
                    rows={3}
                    className="resize-none"
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

      {/* Galería de evidencias */}
      {filteredEvidencias.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={cardStyles.base}>
            <CardContent className="p-12">
              <div className="text-center">
                <Camera className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="mb-2">No se encontraron evidencias</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  No hay evidencias fotográficas que coincidan con los filtros
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
        </motion.div>
      ) : (
        <div className={galleryStyles.gridCompact}>
          {filteredEvidencias.map((evidencia, index) => {
            // Obtener información relacionada usando el servicio
            const info = registroFotograficoService.getEvidenciaInfoRelacionada(
              evidencia, guardarecursos, actividades, areasProtegidas
            );
            
            return (
              <motion.div
                key={evidencia.id}
                {...animationStyles.cardMotion(index)}
              >
                <Card className={galleryStyles.photoCard}>
                  {/* Imagen placeholder */}
                  <div 
                    className={galleryStyles.imageContainer}
                    onClick={() => handleView(evidencia)}
                  >
                    <Camera className={galleryStyles.imagePlaceholderIcon} />
                    
                    <div className={galleryStyles.imageOverlay}>
                      <div className={galleryStyles.imageOverlayButton}>
                        <Eye className={galleryStyles.imageOverlayIcon} />
                      </div>
                    </div>
                  </div>

                  <CardContent className={galleryStyles.photoContent}>
                    {/* Título */}
                    <h3 className={galleryStyles.photoTitle}>
                      {evidencia.descripcion}
                    </h3>
                    
                    {/* Información */}
                    <div className={galleryStyles.photoInfoSection}>
                      {/* Fecha usando el servicio */}
                      <div className={galleryStyles.photoInfoItem}>
                        <Calendar className={galleryStyles.photoInfoIcon} />
                        <span className={galleryStyles.photoInfoText}>
                          {registroFotograficoService.formatEvidenciaFechaCorta(evidencia.fecha)}
                        </span>
                      </div>
                      
                      {/* Guardarecurso */}
                      {info.guardarecurso && (
                        <div className={galleryStyles.photoInfoItem}>
                          <User className={galleryStyles.photoInfoIcon} />
                          <span className={galleryStyles.photoInfoText}>
                            {info.guardarecurso.nombre} {info.guardarecurso.apellido}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Botones de acción */}
                    <div className={galleryStyles.photoActions}>
                      <Button
                        size="sm"
                        variant="outline"
                        className={galleryStyles.photoActionButton}
                        onClick={() => handleView(evidencia)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        Ver
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className={galleryStyles.photoActionButtonIcon}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Dialog para ver evidencia detallada */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className={galleryStyles.viewDialog}>
          <DialogHeader className={formStyles.dialogHeader}>
            <DialogTitle className={formStyles.dialogTitle}>
              Detalle de Evidencia Fotográfica
            </DialogTitle>
            <DialogDescription className={formStyles.dialogDescription}>
              Vista detallada de la evidencia seleccionada
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvidencia && (() => {
            // Obtener información relacionada usando el servicio
            const info = registroFotograficoService.getEvidenciaInfoRelacionada(
              selectedEvidencia, guardarecursos, actividades, areasProtegidas
            );
            
            return (
              <div className={layoutStyles.verticalSpacingLarge}>
                {/* Imagen grande */}
                <div className={galleryStyles.viewImageContainer}>
                  <Camera className={galleryStyles.viewImagePlaceholder} />
                </div>
                
                {/* Información */}
                <div className={galleryStyles.viewInfoGrid}>
                  <div className={galleryStyles.viewInfoSection}>
                    <div>
                      <Label className={galleryStyles.viewInfoLabel}>Descripción</Label>
                      <p className={galleryStyles.viewInfoValue}>{selectedEvidencia.descripcion}</p>
                    </div>

                    <div>
                      <Label className={galleryStyles.viewInfoLabel}>Fecha</Label>
                      <p className={galleryStyles.viewInfoValue}>
                        {registroFotograficoService.formatEvidenciaFechaSinHora(selectedEvidencia.fecha)}
                      </p>
                    </div>

                    <div>
                      <Label className={galleryStyles.viewInfoLabel}>Área Protegida</Label>
                      {info.areaProtegida ? (
                        <>
                          <p className={galleryStyles.viewInfoValue}>{info.areaProtegida.nombre}</p>
                          {info.areaProtegida.departamento && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {info.areaProtegida.departamento}
                            </p>
                          )}
                        </>
                      ) : <p className={galleryStyles.viewInfoValue}>No disponible</p>}
                    </div>

                    <div>
                      <Label className={galleryStyles.viewInfoLabel}>Registrado por</Label>
                      {info.guardarecurso ? (
                        <div className={galleryStyles.viewUserContainer}>
                          <div className={galleryStyles.viewUserAvatar}>
                            <User className={galleryStyles.viewUserAvatarIcon} />
                          </div>
                          <div className={galleryStyles.viewUserInfo}>
                            <p className={galleryStyles.viewUserName}>
                              {info.guardarecurso.nombre} {info.guardarecurso.apellido}
                            </p>
                            <p className={galleryStyles.viewUserRole}>Guardarecurso</p>
                          </div>
                        </div>
                      ) : <p className={galleryStyles.viewInfoValue}>No disponible</p>}
                    </div>
                  </div>

                  <div className={galleryStyles.viewInfoSection}>
                    {selectedEvidencia.coordenadas && (() => {
                      const coords = registroFotograficoService.formatCoordenadasEvidencia(
                        selectedEvidencia.coordenadas.lat,
                        selectedEvidencia.coordenadas.lng
                      );
                      return (
                        <div>
                          <Label className={galleryStyles.viewInfoLabel}>Coordenadas</Label>
                          <p className={galleryStyles.viewInfoValue}>
                            Lat: {coords.lat}
                          </p>
                          <p className={galleryStyles.viewInfoValue}>
                            Lng: {coords.lng}
                          </p>
                        </div>
                      );
                    })()}

                    {info.actividad && (
                      <div>
                        <Label className={galleryStyles.viewInfoLabel}>Actividad Relacionada</Label>
                        <p className={galleryStyles.viewInfoValue}>{info.actividad.tipo}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {registroFotograficoService.formatEvidenciaFechaCorta(info.actividad.fecha)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

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
    </div>
  );
}
