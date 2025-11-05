/**
 * 👥 Gestión de Usuarios Service
 * 
 * Servicio centralizado que maneja toda la lógica funcional del módulo de Gestión de Usuarios,
 * incluyendo CRUD de usuarios, validación de permisos, gestión de estados y transformación de datos.
 * 
 * @module utils/gestionUsuariosService
 */

import { usuarios } from '../data/mock-data';

/**
 * Interface para usuario
 */
export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: 'Administrador' | 'Coordinador' | 'Guardarecurso';
  estado: 'Activo' | 'Desactivado' | 'Suspendido';
  fechaCreacion: string;
  ultimoAcceso?: string;
  permisos: {
    gestionPersonal: boolean;
    operacionesCampo: boolean;
    controlSeguimiento: boolean;
    administracion: boolean;
    reportes: boolean;
  };
  configuracion: {
    notificacionesEmail: boolean;
    notificacionesSMS: boolean;
    tema: 'claro' | 'oscuro' | 'sistema';
    idioma: 'es' | 'en';
  };
}

/**
 * Interface para datos de formulario de usuario
 */
export interface UsuarioFormData {
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  email: string;
  password: string;
  rol: string;
}

/**
 * Interface para estado pendiente
 */
export interface EstadoPendiente {
  id: string;
  nombre: string;
  nuevoEstado: 'Activo' | 'Desactivado' | 'Suspendido';
}

/**
 * 🔍 FILTRADO Y BÚSQUEDA
 */

/**
 * Filtra usuarios (solo Administradores y Coordinadores, excluyendo Desactivados)
 */
export function filterUsuarios(
  usuarios: Usuario[],
  searchTerm: string
): Usuario[] {
  return usuarios.filter(u => {
    // Solo mostrar Administradores y Coordinadores
    const isAdminOrCoordinator = u.rol === 'Administrador' || u.rol === 'Coordinador';
    
    // Excluir usuarios desactivados (no aparecen en ningún lado)
    if (u.estado === 'Desactivado') {
      return false;
    }
    
    const matchesSearch = 
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return isAdminOrCoordinator && matchesSearch;
  });
}

/**
 * 🔐 VALIDACIÓN DE PERMISOS
 */

/**
 * Verifica si se puede cambiar la contraseña de un usuario
 */
export function canChangeUserPassword(
  currentUser: any,
  targetUser: Usuario
): boolean {
  if (!currentUser) return false;
  
  // NUNCA se puede cambiar la contraseña de un Administrador (solo ellos mismos)
  if (targetUser.rol === 'Administrador') return false;
  
  // Administradores pueden cambiar contraseñas de Coordinadores
  if (currentUser.rol === 'Administrador' && targetUser.rol === 'Coordinador') return true;
  
  return false;
}

/**
 * Verifica si el usuario actual puede editar a otro usuario
 */
export function canEditUser(
  currentUser: any,
  targetUser: Usuario
): boolean {
  if (!currentUser) return false;
  
  // Un Administrador solo puede editar:
  // 1. A sí mismo
  // 2. A Coordinadores
  // NO puede editar a otros Administradores
  if (currentUser.rol === 'Administrador') {
    // Puede editar a sí mismo
    if (currentUser.id === targetUser.id) return true;
    
    // NO puede editar a otros Administradores
    if (targetUser.rol === 'Administrador') return false;
    
    // Puede editar a Coordinadores
    if (targetUser.rol === 'Coordinador') return true;
  }
  
  return false;
}

/**
 * Verifica si el usuario actual puede cambiar el estado de otro usuario
 */
export function canChangeUserEstado(
  currentUser: any,
  targetUser: Usuario
): boolean {
  if (!currentUser) return false;
  
  // No se puede cambiar el estado del usuario actual
  if (currentUser.id === targetUser.id) return false;
  
  // Un Administrador SÍ puede cambiar el estado de otros Administradores
  return true;
}

/**
 * 📋 CRUD DE USUARIOS
 */

/**
 * Crea un nuevo usuario (siempre Coordinador y Activo)
 */
export function createUsuario(formData: UsuarioFormData): Usuario {
  const nuevoUsuario: Usuario = {
    id: Date.now().toString(),
    nombre: formData.nombre,
    apellido: formData.apellido,
    email: formData.email,
    telefono: formData.telefono,
    rol: 'Coordinador', // Siempre Coordinador
    estado: 'Activo', // Siempre activo al crear
    fechaCreacion: new Date().toISOString().split('T')[0],
    permisos: {
      gestionPersonal: true,
      operacionesCampo: true,
      controlSeguimiento: true,
      administracion: false,
      reportes: true
    },
    configuracion: {
      notificacionesEmail: true,
      notificacionesSMS: false,
      tema: 'sistema',
      idioma: 'es'
    }
  };

  // Agregar usuario con contraseña a los datos globales
  usuarios.push({
    id: nuevoUsuario.id,
    nombre: nuevoUsuario.nombre,
    apellido: nuevoUsuario.apellido,
    email: nuevoUsuario.email,
    telefono: nuevoUsuario.telefono || '',
    password: formData.password,
    rol: 'Coordinador',
    estado: nuevoUsuario.estado,
    fechaCreacion: nuevoUsuario.fechaCreacion,
    permisos: [],
    areaAsignada: undefined
  });

  return nuevoUsuario;
}

/**
 * Actualiza un usuario existente (sin cambiar contraseña ni rol)
 */
export function updateUsuario(
  usuario: Usuario,
  formData: UsuarioFormData
): Usuario {
  const usuarioActualizado = {
    ...usuario,
    nombre: formData.nombre,
    apellido: formData.apellido,
    email: formData.email,
    telefono: formData.telefono
  };

  // Actualizar también en los datos globales
  const userIndex = usuarios.findIndex(u => u.id === usuario.id);
  if (userIndex !== -1) {
    usuarios[userIndex] = {
      ...usuarios[userIndex],
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      telefono: formData.telefono
    };
  }

  return usuarioActualizado;
}

/**
 * 📊 GESTIÓN DE ESTADOS
 */

/**
 * Cambia el estado de un usuario
 */
export function changeEstadoUsuario(
  usuario: Usuario,
  nuevoEstado: 'Activo' | 'Desactivado' | 'Suspendido'
): Usuario {
  const usuarioActualizado = {
    ...usuario,
    estado: nuevoEstado
  };

  // Actualizar también en los datos globales
  const userIndex = usuarios.findIndex(u => u.id === usuario.id);
  if (userIndex !== -1) {
    usuarios[userIndex].estado = nuevoEstado;
  }

  return usuarioActualizado;
}

/**
 * Obtiene el texto del estado en pasado para mostrar en notificaciones
 */
export function getEstadoTexto(estado: 'Activo' | 'Desactivado' | 'Suspendido'): string {
  return estado === 'Activo' ? 'activado' 
    : estado === 'Suspendido' ? 'suspendido' 
    : 'desactivado';
}

/**
 * Prepara los datos para el estado pendiente
 */
export function prepareEstadoPendiente(
  usuario: Usuario,
  nuevoEstado: 'Activo' | 'Desactivado' | 'Suspendido'
): EstadoPendiente {
  return {
    id: usuario.id,
    nombre: `${usuario.nombre} ${usuario.apellido}`,
    nuevoEstado
  };
}

/**
 * 🎨 ESTILOS Y UI
 */

/**
 * Obtiene la clase de badge para el estado
 */
export function getEstadoBadgeClass(estado: string): string {
  switch (estado) {
    case 'Activo': 
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-300 dark:border-green-700';
    case 'Suspendido': 
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-300 dark:border-orange-700';
    case 'Inactivo': 
      return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400 border border-gray-300 dark:border-gray-700';
    default: 
      return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400 border border-gray-300 dark:border-gray-700';
  }
}

/**
 * Obtiene la clase de badge para el rol
 */
export function getRolBadgeClass(rol: string): string {
  switch (rol) {
    case 'Administrador': 
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-300 dark:border-red-700';
    case 'Coordinador': 
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-300 dark:border-blue-700';
    case 'Guardarecurso': 
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-300 dark:border-green-700';
    default: 
      return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400 border border-gray-300 dark:border-gray-700';
  }
}

/**
 * 📄 TRANSFORMACIÓN DE DATOS
 */

/**
 * Crea datos de formulario vacíos
 */
export function createEmptyFormData(): UsuarioFormData {
  return {
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    email: '',
    password: '',
    rol: 'Coordinador' // Siempre Coordinador
  };
}

/**
 * Convierte un usuario a datos de formulario para edición
 */
export function usuarioToFormData(usuario: Usuario): UsuarioFormData {
  return {
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    cedula: '',
    telefono: usuario.telefono || '',
    email: usuario.email,
    password: '', // No mostrar contraseña en edición
    rol: 'Coordinador' // Siempre Coordinador
  };
}

/**
 * Inicializa la lista de usuarios desde mock-data
 */
export function initializeUsuariosList(): Usuario[] {
  return usuarios.map(u => ({
    ...u,
    // Convertir roles anteriores al nuevo sistema de 3 roles
    rol: (u.rol === 'Guardarecurso Senior' || u.rol === 'Guardarecurso Auxiliar') 
      ? 'Guardarecurso' as const
      : u.rol as 'Administrador' | 'Coordinador' | 'Guardarecurso',
    estado: 'Activo' as const,
    fechaCreacion: '2024-01-15',
    ultimoAcceso: '2024-10-08T10:30:00Z',
    permisos: {
      gestionPersonal: u.rol === 'Administrador' || u.rol === 'Coordinador',
      operacionesCampo: true,
      controlSeguimiento: u.rol === 'Administrador' || u.rol === 'Coordinador',
      administracion: u.rol === 'Administrador',
      reportes: u.rol === 'Administrador' || u.rol === 'Coordinador'
    },
    configuracion: {
      notificacionesEmail: true,
      notificacionesSMS: false,
      tema: 'sistema' as const,
      idioma: 'es' as const
    }
  }));
}

/**
 * 🔧 CONSTANTES
 */

/**
 * Roles disponibles (solo Coordinador)
 * Los Guardarecursos se crean en el módulo de Registro de Guardarecursos
 */
export const ROLES_DISPONIBLES = ['Coordinador'];

/**
 * Servicio de Gestión de Usuarios - Export centralizado
 */
export const gestionUsuariosService = {
  // Filtrado
  filterUsuarios,
  
  // Validación de permisos
  canChangeUserPassword,
  canEditUser,
  canChangeUserEstado,
  
  // CRUD
  createUsuario,
  updateUsuario,
  
  // Estados
  changeEstadoUsuario,
  getEstadoTexto,
  prepareEstadoPendiente,
  
  // Estilos
  getEstadoBadgeClass,
  getRolBadgeClass,
  
  // Transformación
  createEmptyFormData,
  usuarioToFormData,
  initializeUsuariosList,
  
  // Constantes
  ROLES_DISPONIBLES
};
