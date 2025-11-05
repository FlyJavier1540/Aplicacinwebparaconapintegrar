import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Plus, Edit, Search, Users, FileText, Mail, Phone, CheckCircle2, XCircle, Ban, UserX, User, IdCard, Briefcase, MapPin, Shield, Info, Lock, Eye, EyeOff, KeyRound, ChevronDown, FileBarChart } from 'lucide-react';
import { guardarecursos, areasProtegidas, usuarios } from '../data/mock-data';
import { Guardarecurso, Usuario } from '../types';
import { toast } from 'sonner@2.0.3';
import { CambiarContrasenaAdmin } from './CambiarContrasenaAdmin';
import { generarReporteActividadesMensual } from './ReporteActividadesMensual';
import { buttonStyles, filterStyles, formStyles, tableStyles, estadoAlertStyles, getEstadoBadgeClass, cardStyles } from '../styles/shared-styles';
import { guardarecursosService, EstadoPendiente } from '../utils/guardarecursosService';

interface RegistroGuardarecursosProps {
  userPermissions: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
  currentUser?: any;
}

export function RegistroGuardarecursos({ userPermissions, currentUser }: RegistroGuardarecursosProps) {
  const [guardarecursosList, setGuardarecursosList] = useState(guardarecursos);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGuardarecurso, setEditingGuardarecurso] = useState<Guardarecurso | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [guardarecursoToChangePassword, setGuardarecursoToChangePassword] = useState<any>(null);
  const [isEstadoAlertOpen, setIsEstadoAlertOpen] = useState(false);
  const [estadoPendiente, setEstadoPendiente] = useState<EstadoPendiente | null>(null);
  
  const [formData, setFormData] = useState(guardarecursosService.createEmptyFormData());

  // Filtrar guardarecursos usando el servicio
  const filteredGuardarecursos = guardarecursosService.filterGuardarecursos(
    guardarecursosList,
    usuarios,
    searchTerm,
    selectedArea
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingGuardarecurso) {
      // Editar existente usando el servicio
      const guardarecursoActualizado = guardarecursosService.updateGuardarecurso(
        editingGuardarecurso,
        formData
      );
      
      setGuardarecursosList(prev => prev.map(g => 
        g.id === editingGuardarecurso.id ? guardarecursoActualizado : g
      ));
      
      // Actualizar también el usuario correspondiente
      const usuarioIndex = usuarios.findIndex(u => u.email === editingGuardarecurso.email);
      if (usuarioIndex !== -1) {
        usuarios[usuarioIndex] = guardarecursosService.updateUsuarioForGuardarecurso(
          usuarios[usuarioIndex],
          formData
        );
      }
      
      toast.success('Guardarecurso actualizado', {
        description: 'Los datos del guardarecurso han sido actualizados correctamente.'
      });
    } else {
      // Crear nuevo guardarecurso usando el servicio
      const newGuardarecurso = guardarecursosService.createGuardarecurso(formData);
      setGuardarecursosList(prev => [...prev, newGuardarecurso]);
      
      // Crear automáticamente un usuario para el guardarecurso
      const newUsuario = guardarecursosService.createUsuarioForGuardarecurso(
        formData,
        newGuardarecurso.id
      );
      usuarios.push(newUsuario);
      
      toast.success('Guardarecurso creado exitosamente', {
        description: `Se ha creado el acceso al sistema para ${formData.nombre} ${formData.apellido} con la contraseña proporcionada.`
      });
    }
    
    resetForm();
    setIsDialogOpen(false);
  };

  const resetForm = () => {
    setFormData(guardarecursosService.createEmptyFormData());
    setEditingGuardarecurso(null);
  };

  const handleEdit = (guardarecurso: Guardarecurso) => {
    setFormData(guardarecursosService.guardarecursoToFormData(guardarecurso));
    setEditingGuardarecurso(guardarecurso);
    setIsDialogOpen(true);
  };

  const handleEstadoClick = (id: string, nuevoEstado: 'Activo' | 'Suspendido' | 'Desactivado') => {
    const guardarecurso = guardarecursosList.find(g => g.id === id);
    if (!guardarecurso) return;

    // Validar cambio de estado usando el servicio
    if (!guardarecursosService.isValidEstadoChange(guardarecurso.estado, nuevoEstado)) {
      toast.info('Sin cambios', {
        description: `El guardarecurso ya está en estado ${nuevoEstado}.`
      });
      return;
    }

    // Preparar estado pendiente usando el servicio
    setEstadoPendiente(
      guardarecursosService.prepareEstadoPendiente(guardarecurso, nuevoEstado)
    );
    setIsEstadoAlertOpen(true);
  };

  const handleGenerarReporte = (guardarecurso: Guardarecurso) => {
    generarReporteActividadesMensual({ guardarecurso });
  };

  const confirmarCambioEstado = () => {
    if (!estadoPendiente) return;

    const { id, nuevoEstado, nombre } = estadoPendiente;

    // Actualizar el guardarecurso usando el servicio
    setGuardarecursosList(prev => prev.map(g => 
      g.id === id ? guardarecursosService.updateEstado(g, nuevoEstado) : g
    ));

    // Actualizar también el usuario asociado
    const guardarecurso = guardarecursosList.find(g => g.id === id);
    if (guardarecurso) {
      const usuarioIndex = usuarios.findIndex(u => u.email === guardarecurso.email);
      if (usuarioIndex !== -1) {
        usuarios[usuarioIndex] = guardarecursosService.updateUsuarioEstado(
          usuarios[usuarioIndex],
          nuevoEstado
        );
      }
    }

    // Obtener mensaje usando el servicio
    const mensaje = guardarecursosService.getEstadoMensaje(nuevoEstado);

    toast.success('Estado actualizado', {
      description: `${nombre} ha sido ${mensaje}.`
    });

    // Limpiar y cerrar
    setIsEstadoAlertOpen(false);
    setEstadoPendiente(null);
  };

  const handleChangePassword = (guardarecurso: Guardarecurso) => {
    // Buscar el usuario asociado usando el servicio
    const usuario = guardarecursosService.getAssociatedUser(guardarecurso, usuarios);
    if (usuario) {
      setGuardarecursoToChangePassword(usuario);
      setIsPasswordDialogOpen(true);
    } else {
      toast.error('Error', {
        description: 'No se encontró el usuario asociado a este guardarecurso.'
      });
    }
  };



  return (
    <div className="space-y-4">
      {/* Barra superior con búsqueda y botón - Diseño Minimalista */}
      <div className={filterStyles.filterGroupNoBorder}>
        {/* Búsqueda */}
        <div className={filterStyles.searchContainer}>
          <div className={filterStyles.searchContainerWrapper}>
            <Search className={filterStyles.searchIcon} />
            <Input
              placeholder="Buscar por nombre, cédula o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={filterStyles.searchInput}
            />
          </div>
        </div>

        {/* Filtro por área */}
        <div className={filterStyles.selectWrapper}>
          <Select value={selectedArea} onValueChange={setSelectedArea}>
            <SelectTrigger className={filterStyles.selectTrigger}>
              <SelectValue placeholder="Filtrar por área" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las áreas</SelectItem>
              {areasProtegidas.map((area) => (
                <SelectItem key={area.id} value={area.id}>
                  {area.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Botón crear */}
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
      </div>

      {/* Dialog separado del Card */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={formStyles.dialogContent}>
            <DialogHeader className={formStyles.dialogHeader}>
              <DialogTitle className={formStyles.dialogTitle}>
                {editingGuardarecurso ? 'Editar Guardarecurso' : 'Nuevo Guardarecurso'}
              </DialogTitle>
              <DialogDescription className={formStyles.dialogDescription}>
                Complete los datos del personal de guardarrecursos
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className={formStyles.form}>
              {/* Información Personal */}
              <div className={formStyles.section}>
                <h3 className={formStyles.sectionTitle}>Información Personal</h3>
                
                <div className={formStyles.grid}>
                  <div className={formStyles.field}>
                    <Label htmlFor="nombre" className={formStyles.label}>Nombre *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      placeholder="Ingrese el nombre"
                      className={formStyles.input}
                      required
                    />
                  </div>
                  
                  <div className={formStyles.field}>
                    <Label htmlFor="apellido" className={formStyles.label}>Apellido *</Label>
                    <Input
                      id="apellido"
                      value={formData.apellido}
                      onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                      placeholder="Ingrese el apellido"
                      className={formStyles.input}
                      required
                    />
                  </div>

                  <div className={formStyles.field}>
                    <Label htmlFor="cedula" className={formStyles.label}>Cédula *</Label>
                    <Input
                      id="cedula"
                      value={formData.cedula}
                      onChange={(e) => setFormData({...formData, cedula: e.target.value})}
                      placeholder="0000-00000-0000"
                      className={formStyles.input}
                      required
                    />
                  </div>
                  
                  <div className={formStyles.field}>
                    <Label htmlFor="telefono" className={formStyles.label}>Teléfono *</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                      placeholder="+502 0000-0000"
                      className={formStyles.input}
                      required
                    />
                  </div>

                  <div className={formStyles.fieldFullWidth}>
                    <Label htmlFor="email" className={formStyles.label}>Correo Electrónico *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="correo@ejemplo.com"
                      className={formStyles.input}
                      required
                    />
                  </div>
                  
                  {/* Solo mostrar campo de contraseña al CREAR, no al EDITAR */}
                  {!editingGuardarecurso && (
                    <div className={formStyles.fieldFullWidth}>
                      <Label htmlFor="password" className={formStyles.label}>Contraseña *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          placeholder="Ingrese la contraseña"
                          className={formStyles.inputPassword}
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={formStyles.passwordToggle}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Mínimo 6 caracteres. Esta será la contraseña de acceso al sistema.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Información Laboral */}
              <div className={formStyles.section}>
                <h3 className={formStyles.sectionTitle}>Información Laboral</h3>
                
                <div className={formStyles.field}>
                  <Label htmlFor="area" className={formStyles.label}>Área Asignada *</Label>
                  <Select value={formData.areaAsignada} onValueChange={(value) => setFormData({...formData, areaAsignada: value})}>
                    <SelectTrigger className={formStyles.selectTrigger}>
                      <SelectValue placeholder="Seleccione área" />
                    </SelectTrigger>
                    <SelectContent>
                      {areasProtegidas.map(area => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className={formStyles.footer}>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
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

      {/* Vista de Cards para móvil */}
      <div className="md:hidden space-y-3">
        {filteredGuardarecursos.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    No se encontraron guardarecursos
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Intenta ajustar los filtros de búsqueda
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredGuardarecursos.map((guardarecurso) => {
            const area = areasProtegidas.find(a => a.id === guardarecurso.areaAsignada);
            return (
              <Card key={guardarecurso.id} className="relative overflow-hidden border-gray-200 dark:border-gray-700">
                {/* Línea superior indicando estado */}
                <div className={
                  guardarecurso.estado === 'Activo'
                    ? cardStyles.topLine.green
                    : guardarecurso.estado === 'Suspendido'
                    ? cardStyles.topLine.orange
                    : cardStyles.topLine.gray
                }></div>
                <CardContent className="p-4 pt-5">
                  {/* Header con avatar y estado */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className={
                      guardarecurso.estado === 'Activo'
                        ? 'w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0'
                        : guardarecurso.estado === 'Suspendido'
                        ? 'w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0'
                        : 'w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0'
                    }>
                      <User className={
                        guardarecurso.estado === 'Activo'
                          ? 'h-6 w-6 text-green-600 dark:text-green-400'
                          : guardarecurso.estado === 'Suspendido'
                          ? 'h-6 w-6 text-orange-600 dark:text-orange-400'
                          : 'h-6 w-6 text-gray-600 dark:text-gray-400'
                      } />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {guardarecurso.nombre} {guardarecurso.apellido}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {guardarecurso.email}
                      </p>
                      <div className="mt-2">
                        <Badge className={`${getEstadoBadgeClass(guardarecurso.estado)} text-xs`}>
                          {guardarecurso.estado}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Información */}
                  <div className="space-y-2.5 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 text-sm">
                      <IdCard className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">
                        {guardarecurso.cedula}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400 truncate">
                        {area?.nombre || 'Sin asignar'}
                      </span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerarReporte(guardarecurso)}
                      className="w-full h-10 text-xs"
                    >
                      <FileBarChart className="h-4 w-4 mr-2" />
                      Reporte
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(guardarecurso)}
                      className="w-full h-10 text-xs"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    {guardarecursosService.canChangePassword(currentUser) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChangePassword(guardarecurso)}
                        className="w-full h-10 text-xs"
                      >
                        <KeyRound className="h-4 w-4 mr-2" />
                        Contraseña
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`w-full h-10 text-xs ${
                            guardarecurso.estado === 'Activo'
                              ? 'text-green-600 dark:text-green-400 border-green-300 dark:border-green-700'
                              : guardarecurso.estado === 'Suspendido'
                              ? 'text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700'
                              : 'text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700'
                          }`}
                        >
                          {guardarecurso.estado === 'Activo' ? (
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                          ) : guardarecurso.estado === 'Suspendido' ? (
                            <Ban className="h-4 w-4 mr-2" />
                          ) : (
                            <UserX className="h-4 w-4 mr-2" />
                          )}
                          Estado
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem 
                          onClick={() => handleEstadoClick(guardarecurso.id, 'Activo')}
                          className="cursor-pointer text-xs"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-green-600" />
                          Activo
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleEstadoClick(guardarecurso.id, 'Suspendido')}
                          className="cursor-pointer text-xs"
                        >
                          <Ban className="h-3.5 w-3.5 mr-2 text-orange-600" />
                          Suspendido
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleEstadoClick(guardarecurso.id, 'Desactivado')}
                          className="cursor-pointer text-xs"
                        >
                          <UserX className="h-3.5 w-3.5 mr-2 text-gray-600" />
                          Desactivado
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Vista de Tabla para desktop */}
      <div className="hidden md:block">
        <Card className={tableStyles.card}>
          <CardContent className={tableStyles.cardContent}>
            {/* Scroll horizontal container */}
            <div className={tableStyles.container}>
              <Table>
                <TableHeader>
                  <TableRow className={tableStyles.header}>
                    <TableHead className={tableStyles.headerCellMin}>
                      Nombre Completo
                    </TableHead>
                    <TableHead className={tableStyles.headerCell}>
                      Estado
                    </TableHead>
                    <TableHead className={tableStyles.headerCell}>
                      Cédula
                    </TableHead>
                    <TableHead className={tableStyles.headerCell}>
                      Área Asignada
                    </TableHead>
                    <TableHead className={tableStyles.headerCellRight}>
                      Acciones
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGuardarecursos.map((guardarecurso) => {
                    const area = areasProtegidas.find(a => a.id === guardarecurso.areaAsignada);
                    return (
                      <TableRow 
                        key={guardarecurso.id}
                        className={tableStyles.row}
                      >
                        {/* Nombre Completo */}
                        <TableCell className={tableStyles.cell}>
                          <div className={tableStyles.userInfo.container}>
                            <div className={
                              guardarecurso.estado === 'Activo'
                                ? tableStyles.avatarByEstado.activo.container
                                : guardarecurso.estado === 'Suspendido'
                                ? tableStyles.avatarByEstado.suspendido.container
                                : tableStyles.avatarByEstado.desactivado.container
                            }>
                              <User className={
                                guardarecurso.estado === 'Activo'
                                  ? tableStyles.avatarByEstado.activo.icon
                                  : guardarecurso.estado === 'Suspendido'
                                  ? tableStyles.avatarByEstado.suspendido.icon
                                  : tableStyles.avatarByEstado.desactivado.icon
                              } />
                            </div>
                            <div className={tableStyles.userInfo.content}>
                              <div className={tableStyles.userInfo.name}>
                                {guardarecurso.nombre} {guardarecurso.apellido}
                              </div>
                              <div className={tableStyles.userInfo.email}>
                                {guardarecurso.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        
                        {/* Estado */}
                        <TableCell className={tableStyles.cell}>
                          <Badge 
                            className={`${getEstadoBadgeClass(guardarecurso.estado)} ${tableStyles.badge}`}
                          >
                            {guardarecurso.estado}
                          </Badge>
                        </TableCell>
                        
                        {/* Cédula */}
                        <TableCell className={tableStyles.cell}>
                          <div className={tableStyles.infoWithIcon.container}>
                            <IdCard className={tableStyles.infoWithIcon.icon} />
                            <span className={tableStyles.infoWithIcon.textMono}>{guardarecurso.cedula}</span>
                          </div>
                        </TableCell>
                        
                        {/* Área */}
                        <TableCell className={tableStyles.cell}>
                          <div className={tableStyles.infoWithIcon.container}>
                            <MapPin className={tableStyles.infoWithIcon.icon} />
                            <span className={tableStyles.infoWithIcon.text}>{area?.nombre || 'Sin asignar'}</span>
                          </div>
                        </TableCell>
                        
                        {/* Acciones */}
                        <TableCell className={tableStyles.cell}>
                          <div className={tableStyles.actions.container}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleGenerarReporte(guardarecurso)}
                              title="Generar informe mensual"
                              className={tableStyles.actions.buttonView}
                            >
                              <FileBarChart className={tableStyles.actions.icon} />
                            </Button>
                            {guardarecursosService.canChangePassword(currentUser) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleChangePassword(guardarecurso)}
                                title="Cambiar contraseña"
                                className={tableStyles.actions.buttonPassword}
                              >
                                <KeyRound className={tableStyles.actions.icon} />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(guardarecurso)}
                              title="Editar información"
                              className={tableStyles.actions.buttonEdit}
                            >
                              <Edit className={tableStyles.actions.icon} />
                            </Button>
                            
                            {/* Dropdown para cambiar estado */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title={`Cambiar estado (actual: ${guardarecurso.estado})`}
                                  className={tableStyles.actions.buttonState(guardarecurso.estado)}
                                >
                                  {guardarecurso.estado === 'Activo' ? (
                                    <CheckCircle2 className={tableStyles.actions.icon} />
                                  ) : guardarecurso.estado === 'Suspendido' ? (
                                    <Ban className={tableStyles.actions.icon} />
                                  ) : (
                                    <UserX className={tableStyles.actions.icon} />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem 
                                  onClick={() => handleEstadoClick(guardarecurso.id, 'Activo')}
                                  className="cursor-pointer text-xs"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-green-600" />
                                  Activo
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleEstadoClick(guardarecurso.id, 'Suspendido')}
                                  className="cursor-pointer text-xs"
                                >
                                  <Ban className="h-3.5 w-3.5 mr-2 text-orange-600" />
                                  Suspendido
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleEstadoClick(guardarecurso.id, 'Desactivado')}
                                  className="cursor-pointer text-xs"
                                >
                                  <UserX className="h-3.5 w-3.5 mr-2 text-gray-600" />
                                  Desactivado
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {filteredGuardarecursos.length === 0 && (
              <div className={tableStyles.emptyState.container}>
                <div className={tableStyles.emptyState.iconContainer}>
                  <Users className={tableStyles.emptyState.icon} />
                </div>
                <p className={tableStyles.emptyState.title}>
                  No se encontraron guardarecursos
                </p>
                <p className={tableStyles.emptyState.description}>
                  Intenta ajustar los filtros de búsqueda
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogo para cambiar contraseña de guardarecurso */}
      {currentUser && guardarecursoToChangePassword && (
        <CambiarContrasenaAdmin
          isOpen={isPasswordDialogOpen}
          onClose={() => {
            setIsPasswordDialogOpen(false);
            setGuardarecursoToChangePassword(null);
          }}
          currentUser={currentUser}
          targetUser={guardarecursoToChangePassword}
        />
      )}

      {/* Alert Dialog para confirmar cambio de estado */}
      <AlertDialog open={isEstadoAlertOpen} onOpenChange={setIsEstadoAlertOpen}>
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
                          <>El guardarecurso tendrá acceso completo al sistema.</>
                        )}
                        {estadoPendiente.nuevoEstado === 'Suspendido' && (
                          <>El guardarecurso NO podrá acceder al sistema.</>
                        )}
                        {estadoPendiente.nuevoEstado === 'Desactivado' && (
                          <>El guardarecurso desaparecerá del sistema completamente.</>
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
                setIsEstadoAlertOpen(false);
                setEstadoPendiente(null);
              }}
              className={estadoAlertStyles.cancelButton}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmarCambioEstado}
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