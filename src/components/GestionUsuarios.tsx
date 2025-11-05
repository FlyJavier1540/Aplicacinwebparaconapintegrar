import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Plus, Edit, Search, Users, Mail, Phone, CheckCircle2, Ban, UserX, User, Shield, UserCheck, Lock, Eye, EyeOff, Info, KeyRound, ChevronDown, IdCard, Briefcase, MoreVertical, Calendar } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { CambiarContrasenaAdmin } from './CambiarContrasenaAdmin';
import { buttonStyles, filterStyles, formStyles, tableStyles, estadoAlertStyles, getEstadoBadgeClass, cardStyles } from '../styles/shared-styles';
import { gestionUsuariosService, Usuario, UsuarioFormData, EstadoPendiente } from '../utils/gestionUsuariosService';

interface GestionUsuariosProps {
  userPermissions: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
  currentUser?: any;
}

export function GestionUsuarios({ userPermissions, currentUser }: GestionUsuariosProps) {
  const [usuariosList, setUsuariosList] = useState<Usuario[]>(gestionUsuariosService.initializeUsuariosList());

  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [userToChangePassword, setUserToChangePassword] = useState<Usuario | null>(null);
  
  // Estados para el AlertDialog de cambio de estado
  const [isEstadoAlertOpen, setIsEstadoAlertOpen] = useState(false);
  const [estadoPendiente, setEstadoPendiente] = useState<EstadoPendiente | null>(null);

  const [userForm, setUserForm] = useState<UsuarioFormData>(gestionUsuariosService.createEmptyFormData());

  // Filtrar usuarios usando el servicio
  const filteredUsers = gestionUsuariosService.filterUsuarios(usuariosList, searchTerm);

  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      // Validar que se puede editar este usuario usando el servicio
      if (!gestionUsuariosService.canEditUser(currentUser, editingUser)) {
        toast.error('Permisos insuficientes', {
          description: 'No tienes permiso para editar este usuario.'
        });
        return;
      }
      
      // Editar existente usando el servicio
      const usuarioActualizado = gestionUsuariosService.updateUsuario(editingUser, userForm);
      
      setUsuariosList(prev => prev.map(u => 
        u.id === editingUser.id ? usuarioActualizado : u
      ));
      
      toast.success('Usuario actualizado', {
        description: 'Los datos del usuario han sido actualizados correctamente.'
      });
    } else {
      // Crear nuevo usuario usando el servicio
      const nuevoUsuario = gestionUsuariosService.createUsuario(userForm);
      
      setUsuariosList(prev => [...prev, nuevoUsuario]);
      
      toast.success('Coordinador creado exitosamente', {
        description: `Se ha creado la cuenta de Coordinador para ${userForm.nombre} ${userForm.apellido}.`
      });
    }
    
    resetUserForm();
    setIsDialogOpen(false);
  };

  const resetUserForm = () => {
    setUserForm(gestionUsuariosService.createEmptyFormData());
    setEditingUser(null);
    setShowPassword(false);
  };

  const handleEditUser = (usuario: Usuario) => {
    setUserForm(gestionUsuariosService.usuarioToFormData(usuario));
    setEditingUser(usuario);
    setIsDialogOpen(true);
  };

  const handleChangePassword = (usuario: Usuario) => {
    setUserToChangePassword(usuario);
    setIsPasswordDialogOpen(true);
  };

  // Función para manejar el click en cambio de estado (abre el AlertDialog)
  const handleEstadoClick = (id: string, nuevoEstado: 'Activo' | 'Desactivado' | 'Suspendido') => {
    const usuario = usuariosList.find(u => u.id === id);
    if (usuario) {
      setEstadoPendiente(gestionUsuariosService.prepareEstadoPendiente(usuario, nuevoEstado));
      setIsEstadoAlertOpen(true);
    }
  };

  // Función para confirmar el cambio de estado
  const handleConfirmEstadoChange = () => {
    if (estadoPendiente) {
      const usuario = usuariosList.find(u => u.id === estadoPendiente.id);
      if (usuario) {
        // Cambiar estado usando el servicio
        const usuarioActualizado = gestionUsuariosService.changeEstadoUsuario(usuario, estadoPendiente.nuevoEstado);
        
        setUsuariosList(prev => prev.map(u => 
          u.id === estadoPendiente.id ? usuarioActualizado : u
        ));
        
        const estadoTexto = gestionUsuariosService.getEstadoTexto(estadoPendiente.nuevoEstado);
        
        toast.success('Estado actualizado', {
          description: `El usuario ${estadoPendiente.nombre} ha sido ${estadoTexto} correctamente.`
        });
      }
    }
    setIsEstadoAlertOpen(false);
    setEstadoPendiente(null);
  };

  // Solo Coordinador - Los Guardarecursos se crean en el módulo de Registro de Guardarecursos
  const roles = gestionUsuariosService.ROLES_DISPONIBLES;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Barra superior con búsqueda y botón - Diseño Minimalista */}
      <div className={filterStyles.filterGroupNoBorder}>
        {/* Búsqueda */}
        <div className={filterStyles.searchContainer}>
          <div className={filterStyles.searchContainerWrapper}>
            <Search className={filterStyles.searchIcon} />
            <Input
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={filterStyles.searchInput}
            />
          </div>
        </div>

        {/* Botón de acción */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetUserForm}
              className={buttonStyles.createButton}
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
              Nuevo
            </Button>
          </DialogTrigger>
                <DialogContent className="w-[96vw] sm:w-[90vw] md:w-[85vw] max-w-3xl max-h-[92vh] sm:max-h-[88vh] overflow-hidden flex flex-col p-0">
                  <DialogHeader className="px-3 py-3 sm:px-5 sm:py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
                    <DialogTitle className="text-base sm:text-lg md:text-xl">
                      {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm">
                      Configure los datos del usuario administrativo
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-5 sm:py-4">
                    <form onSubmit={handleSubmitUser} className={formStyles.form}>
                      {/* Información Personal */}
                      <div className={formStyles.section}>
                        <h3 className={formStyles.sectionTitle}>Información del Coordinador</h3>
                        
                        <div className={formStyles.grid}>
                          <div className={formStyles.field}>
                            <Label htmlFor="nombre" className={formStyles.label}>Nombre *</Label>
                            <Input
                              id="nombre"
                              value={userForm.nombre}
                              onChange={(e) => setUserForm({...userForm, nombre: e.target.value})}
                              placeholder="Ingrese el nombre"
                              className={formStyles.input}
                              required
                            />
                          </div>
                          
                          <div className={formStyles.field}>
                            <Label htmlFor="apellido" className={formStyles.label}>Apellido *</Label>
                            <Input
                              id="apellido"
                              value={userForm.apellido}
                              onChange={(e) => setUserForm({...userForm, apellido: e.target.value})}
                              placeholder="Ingrese el apellido"
                              className={formStyles.input}
                              required
                            />
                          </div>

                          <div className={formStyles.field}>
                            <Label htmlFor="cedula" className={formStyles.label}>Cédula *</Label>
                            <Input
                              id="cedula"
                              value={userForm.cedula}
                              onChange={(e) => setUserForm({...userForm, cedula: e.target.value})}
                              placeholder="0000-00000-0000"
                              className={formStyles.input}
                              required
                            />
                          </div>
                          
                          <div className={formStyles.field}>
                            <Label htmlFor="telefono" className={formStyles.label}>Teléfono *</Label>
                            <Input
                              id="telefono"
                              value={userForm.telefono}
                              onChange={(e) => setUserForm({...userForm, telefono: e.target.value})}
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
                              value={userForm.email}
                              onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                              placeholder="correo@ejemplo.com"
                              className={formStyles.input}
                              required
                            />
                          </div>
                          
                          {!editingUser && (
                            <div className={formStyles.fieldFullWidth}>
                              <Label htmlFor="password" className={formStyles.label}>Contraseña *</Label>
                              <div className="relative">
                                <Input
                                  id="password"
                                  type={showPassword ? "text" : "password"}
                                  value={userForm.password}
                                  onChange={(e) => setUserForm({...userForm, password: e.target.value})}
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
                              <p className="text-xs text-muted-foreground">
                                Mínimo 6 caracteres. Esta será la contraseña de acceso al sistema.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 px-3 py-3 sm:px-5 sm:py-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
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
                      onClick={handleSubmitUser}
                      className={buttonStyles.createButton}
                    >
                      {editingUser ? (
                        <>
                          <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                          Actualizar
                        </>
                      ) : (
                        <>
                          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                          Crear Usuario
                        </>
                      )}
                    </Button>
                  </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vista de cards para móvil - visible solo en pantallas pequeñas */}
      <div className="md:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    No se encontraron usuarios
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Intenta ajustar los filtros de búsqueda
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((usuario) => {
            return (
              <Card key={usuario.id} className="relative overflow-hidden border-gray-200 dark:border-gray-700">
                {/* Línea superior indicando estado */}
                <div className={
                  usuario.estado === 'Activo'
                    ? cardStyles.topLine.green
                    : usuario.estado === 'Suspendido'
                    ? cardStyles.topLine.orange
                    : cardStyles.topLine.gray
                }></div>
                <CardContent className="p-4 pt-5">
                  {/* Header con avatar y badges */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className={
                      usuario.estado === 'Activo'
                        ? 'w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0'
                        : usuario.estado === 'Suspendido'
                        ? 'w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0'
                        : 'w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0'
                    }>
                      <User className={
                        usuario.estado === 'Activo'
                          ? 'h-6 w-6 text-green-600 dark:text-green-400'
                          : usuario.estado === 'Suspendido'
                          ? 'h-6 w-6 text-orange-600 dark:text-orange-400'
                          : 'h-6 w-6 text-gray-600 dark:text-gray-400'
                      } />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {usuario.nombre} {usuario.apellido}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {usuario.email}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge className={`${gestionUsuariosService.getRolBadgeClass(usuario.rol)} text-xs`}>
                          {usuario.rol}
                        </Badge>
                        <Badge className={`${gestionUsuariosService.getEstadoBadgeClass(usuario.estado)} text-xs`}>
                          {usuario.estado}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Información adicional */}
                  {usuario.telefono && (
                    <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">
                          {usuario.telefono}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="grid grid-cols-2 gap-2">
                    {gestionUsuariosService.canEditUser(currentUser, usuario) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(usuario)}
                        className="w-full h-10 text-xs"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    )}
                    {gestionUsuariosService.canChangeUserPassword(currentUser, usuario) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChangePassword(usuario)}
                        className="w-full h-10 text-xs"
                      >
                        <KeyRound className="h-4 w-4 mr-2" />
                        Contraseña
                      </Button>
                    )}
                    {gestionUsuariosService.canChangeUserEstado(currentUser, usuario) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={`w-full h-10 text-xs ${
                              usuario.estado === 'Activo'
                                ? 'text-green-600 dark:text-green-400 border-green-300 dark:border-green-700'
                                : usuario.estado === 'Suspendido'
                                ? 'text-orange-600 dark:text-orange-400 border-orange-300 dark:border-orange-700'
                                : 'text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700'
                            }`}
                          >
                            {usuario.estado === 'Activo' ? (
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                            ) : usuario.estado === 'Suspendido' ? (
                              <Ban className="h-4 w-4 mr-2" />
                            ) : (
                              <UserX className="h-4 w-4 mr-2" />
                            )}
                            Estado
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem 
                            onClick={() => handleEstadoClick(usuario.id, 'Activo')}
                            className="cursor-pointer text-xs"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-green-600" />
                            Activo
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleEstadoClick(usuario.id, 'Suspendido')}
                            className="cursor-pointer text-xs"
                          >
                            <Ban className="h-3.5 w-3.5 mr-2 text-orange-600" />
                            Suspendido
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleEstadoClick(usuario.id, 'Desactivado')}
                            className="cursor-pointer text-xs"
                          >
                            <UserX className="h-3.5 w-3.5 mr-2 text-gray-600" />
                            Desactivado
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
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
          <CardContent className={tableStyles.cardContent}>
            {/* Scroll horizontal container */}
            <div className={tableStyles.container}>
              <Table>
                <TableHeader>
                  <TableRow className={tableStyles.header}>
                    <TableHead className={tableStyles.headerCellMin}>Nombre</TableHead>
                    <TableHead className="min-w-[90px] text-xs font-medium text-gray-600 dark:text-gray-400 h-11">Rol</TableHead>
                    <TableHead className="min-w-[80px] text-xs font-medium text-gray-600 dark:text-gray-400 h-11">Estado</TableHead>
                    <TableHead className={tableStyles.headerCellRight}>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((usuario) => (
                    <TableRow key={usuario.id} className={tableStyles.row}>
                      <TableCell className={tableStyles.cell}>
                        <div className={tableStyles.userInfo.container}>
                          <div className={
                            usuario.estado === 'Activo'
                              ? tableStyles.avatarByEstado.activo.container
                              : usuario.estado === 'Suspendido'
                              ? tableStyles.avatarByEstado.suspendido.container
                              : tableStyles.avatarByEstado.desactivado.container
                          }>
                            <User className={
                              usuario.estado === 'Activo'
                                ? tableStyles.avatarByEstado.activo.icon
                                : usuario.estado === 'Suspendido'
                                ? tableStyles.avatarByEstado.suspendido.icon
                                : tableStyles.avatarByEstado.desactivado.icon
                            } />
                          </div>
                          <div className={tableStyles.userInfo.content}>
                            <div className={tableStyles.userInfo.name}>
                              {usuario.nombre} {usuario.apellido}
                            </div>
                            <div className={tableStyles.userInfo.email}>
                              {usuario.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell className={tableStyles.cell}>
                        <Badge className={`${gestionUsuariosService.getRolBadgeClass(usuario.rol)} ${tableStyles.badge}`}>
                          {usuario.rol}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className={tableStyles.cell}>
                        <Badge className={`${gestionUsuariosService.getEstadoBadgeClass(usuario.estado)} ${tableStyles.badge}`}>
                          {usuario.estado}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className={tableStyles.cell}>
                        <div className={tableStyles.actions.container}>
                          {gestionUsuariosService.canChangeUserPassword(currentUser, usuario) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleChangePassword(usuario)}
                              title="Cambiar contraseña"
                              className={tableStyles.actions.buttonPassword}
                            >
                              <KeyRound className={tableStyles.actions.icon} />
                            </Button>
                          )}
                          {gestionUsuariosService.canEditUser(currentUser, usuario) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(usuario)}
                              title="Editar información"
                              className={tableStyles.actions.buttonEdit}
                            >
                              <Edit className={tableStyles.actions.icon} />
                            </Button>
                          )}
                          
                          {/* Dropdown para cambiar estado */}
                          {gestionUsuariosService.canChangeUserEstado(currentUser, usuario) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title={`Cambiar estado (actual: ${usuario.estado})`}
                                  className={tableStyles.actions.buttonState(usuario.estado)}
                                >
                                  {usuario.estado === 'Activo' ? (
                                    <CheckCircle2 className={tableStyles.actions.icon} />
                                  ) : usuario.estado === 'Suspendido' ? (
                                    <Ban className={tableStyles.actions.icon} />
                                  ) : (
                                    <UserX className={tableStyles.actions.icon} />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem 
                                  onClick={() => handleEstadoClick(usuario.id, 'Activo')}
                                  className="cursor-pointer"
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                  Activo
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleEstadoClick(usuario.id, 'Suspendido')}
                                  className="cursor-pointer"
                                >
                                  <Ban className="h-4 w-4 mr-2 text-orange-500" />
                                  Suspendido
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleEstadoClick(usuario.id, 'Desactivado')}
                                  className="cursor-pointer"
                                >
                                  <UserX className="h-4 w-4 mr-2 text-gray-500" />
                                  Desactivado
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>No se encontraron usuarios que coincidan con los filtros</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Diálogo para cambiar contraseña de otro usuario */}
      {currentUser && userToChangePassword && (
        <CambiarContrasenaAdmin
          isOpen={isPasswordDialogOpen}
          onClose={() => {
            setIsPasswordDialogOpen(false);
            setUserToChangePassword(null);
          }}
          currentUser={currentUser}
          targetUser={userToChangePassword}
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
                          <>El usuario podrá acceder al sistema normalmente.</>
                        )}
                        {estadoPendiente.nuevoEstado === 'Suspendido' && (
                          <>El usuario no podrá acceder al sistema temporalmente.</>
                        )}
                        {estadoPendiente.nuevoEstado === 'Desactivado' && (
                          <>El usuario desaparecerá del sistema completamente.</>
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
              onClick={handleConfirmEstadoChange}
              className={estadoAlertStyles.confirmButton}
            >
              Confirmar cambio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
