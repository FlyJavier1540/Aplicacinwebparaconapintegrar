/**
 * 👤 Guardarecursos Service
 * 
 * Servicio centralizado que maneja toda la lógica funcional del módulo de Guardarecursos,
 * separando la lógica de negocio de la presentación.
 * 
 * @module utils/guardarecursosService
 */

import { Guardarecurso, Usuario, AreaProtegida } from '../types';

/**
 * Interface para los datos del formulario de guardarecursos
 */
export interface GuardarecursoFormData {
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  email: string;
  password: string;
  areaAsignada: string;
  estado: 'Activo' | 'Suspendido' | 'Desactivado';
}

/**
 * Interface para el estado pendiente de cambio
 */
export interface EstadoPendiente {
  id: string;
  nuevoEstado: 'Activo' | 'Suspendido' | 'Desactivado';
  nombre: string;
}

/**
 * Filtra guardarecursos excluyendo otros roles y desactivados
 * 
 * @param guardarecursos - Lista completa de guardarecursos
 * @param usuarios - Lista de usuarios del sistema
 * @param searchTerm - Término de búsqueda
 * @param selectedArea - Área seleccionada para filtrar
 * @returns Array de guardarecursos filtrados
 * 
 * @example
 * const filtered = filterGuardarecursos(guardarecursos, usuarios, 'Juan', 'area-1');
 */
export function filterGuardarecursos(
  guardarecursos: Guardarecurso[],
  usuarios: Usuario[],
  searchTerm: string,
  selectedArea: string
): Guardarecurso[] {
  return guardarecursos.filter(g => {
    // Solo mostrar guardarecursos (excluir otros roles)
    const usuarioAsociado = usuarios.find(u => u.email === g.email);
    const isGuardarecurso = !usuarioAsociado || usuarioAsociado.rol === 'Guardarecurso';
    
    // Excluir usuarios desactivados (no aparecen en ningún lado)
    if (g.estado === 'Desactivado') {
      return false;
    }
    
    // Filtrar por búsqueda
    const matchesSearch = 
      g.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.cedula.includes(searchTerm) ||
      g.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtrar por área
    const matchesArea = !selectedArea || selectedArea === 'all' || g.areaAsignada === selectedArea;
    
    return isGuardarecurso && matchesSearch && matchesArea;
  });
}

/**
 * Crea un nuevo guardarecurso con valores predeterminados
 * 
 * @param formData - Datos del formulario
 * @returns Nuevo objeto Guardarecurso
 * 
 * @example
 * const nuevoGuardarecurso = createGuardarecurso(formData);
 */
export function createGuardarecurso(formData: GuardarecursoFormData): Guardarecurso {
  const newId = Date.now().toString();
  
  return {
    id: newId,
    nombre: formData.nombre,
    apellido: formData.apellido,
    cedula: formData.cedula,
    telefono: formData.telefono,
    email: formData.email,
    password: formData.password,
    puesto: 'Guardarecurso',
    areaAsignada: formData.areaAsignada,
    fechaIngreso: new Date().toISOString().split('T')[0],
    estado: 'Activo', // Siempre se crea como Activo
    equiposAsignados: [],
    actividades: []
  };
}

/**
 * Crea un usuario asociado al guardarecurso
 * 
 * @param formData - Datos del formulario
 * @param guardarecursoId - ID del guardarecurso asociado
 * @returns Nuevo objeto Usuario
 * 
 * @example
 * const nuevoUsuario = createUsuarioForGuardarecurso(formData, '12345');
 */
export function createUsuarioForGuardarecurso(
  formData: GuardarecursoFormData,
  guardarecursoId: string
): Usuario {
  return {
    id: guardarecursoId, // Usar el mismo ID para mantener la relación
    nombre: formData.nombre,
    apellido: formData.apellido,
    email: formData.email,
    telefono: formData.telefono,
    password: formData.password,
    rol: 'Guardarecurso',
    estado: 'Activo', // Siempre se crea como Activo
    fechaCreacion: new Date().toISOString().split('T')[0],
    ultimoAcceso: new Date().toISOString(),
    permisos: ['guarda.view', 'guarda.create.incidentes', 'guarda.create.fotos'],
    areaAsignada: formData.areaAsignada
  };
}

/**
 * Actualiza un guardarecurso existente
 * 
 * @param guardarecurso - Guardarecurso a actualizar
 * @param formData - Datos del formulario
 * @returns Guardarecurso actualizado
 * 
 * @example
 * const actualizado = updateGuardarecurso(existente, formData);
 */
export function updateGuardarecurso(
  guardarecurso: Guardarecurso,
  formData: GuardarecursoFormData
): Guardarecurso {
  return {
    ...guardarecurso,
    nombre: formData.nombre,
    apellido: formData.apellido,
    cedula: formData.cedula,
    telefono: formData.telefono,
    email: formData.email,
    areaAsignada: formData.areaAsignada
    // NO actualizar estado ni contraseña aquí
  };
}

/**
 * Actualiza el usuario asociado al guardarecurso
 * 
 * @param usuario - Usuario a actualizar
 * @param formData - Datos del formulario
 * @returns Usuario actualizado
 * 
 * @example
 * const usuarioActualizado = updateUsuarioForGuardarecurso(usuario, formData);
 */
export function updateUsuarioForGuardarecurso(
  usuario: Usuario,
  formData: GuardarecursoFormData
): Usuario {
  return {
    ...usuario,
    nombre: formData.nombre,
    apellido: formData.apellido,
    email: formData.email,
    telefono: formData.telefono,
    areaAsignada: formData.areaAsignada
    // NO actualizar contraseña ni estado aquí
  };
}

/**
 * Valida si un cambio de estado es válido
 * 
 * @param estadoActual - Estado actual del guardarecurso
 * @param nuevoEstado - Nuevo estado propuesto
 * @returns true si el cambio es válido, false si no hay cambio
 * 
 * @example
 * if (!isValidEstadoChange('Activo', 'Activo')) {
 *   // No hacer nada, es el mismo estado
 * }
 */
export function isValidEstadoChange(
  estadoActual: string,
  nuevoEstado: string
): boolean {
  return estadoActual !== nuevoEstado;
}

/**
 * Actualiza el estado de un guardarecurso
 * 
 * @param guardarecurso - Guardarecurso a actualizar
 * @param nuevoEstado - Nuevo estado
 * @returns Guardarecurso con estado actualizado
 * 
 * @example
 * const suspendido = updateEstado(guardarecurso, 'Suspendido');
 */
export function updateEstado(
  guardarecurso: Guardarecurso,
  nuevoEstado: 'Activo' | 'Suspendido' | 'Desactivado'
): Guardarecurso {
  return {
    ...guardarecurso,
    estado: nuevoEstado
  };
}

/**
 * Actualiza el estado del usuario asociado
 * 
 * @param usuario - Usuario a actualizar
 * @param nuevoEstado - Nuevo estado
 * @returns Usuario con estado actualizado
 * 
 * @example
 * const usuarioSuspendido = updateUsuarioEstado(usuario, 'Suspendido');
 */
export function updateUsuarioEstado(
  usuario: Usuario,
  nuevoEstado: 'Activo' | 'Suspendido' | 'Desactivado'
): Usuario {
  return {
    ...usuario,
    estado: nuevoEstado as any
  };
}

/**
 * Obtiene el mensaje de confirmación según el estado
 * 
 * @param nuevoEstado - Estado al que se quiere cambiar
 * @returns Verbo del mensaje
 * 
 * @example
 * const mensaje = getEstadoMensaje('Suspendido'); // "suspendido"
 */
export function getEstadoMensaje(
  nuevoEstado: 'Activo' | 'Suspendido' | 'Desactivado'
): string {
  const mensajes = {
    'Activo': 'activado',
    'Suspendido': 'suspendido',
    'Desactivado': 'desactivado'
  };
  
  return mensajes[nuevoEstado];
}

/**
 * Prepara un objeto EstadoPendiente para confirmación
 * 
 * @param guardarecurso - Guardarecurso que cambiará de estado
 * @param nuevoEstado - Nuevo estado propuesto
 * @returns Objeto con información del cambio pendiente
 * 
 * @example
 * const pendiente = prepareEstadoPendiente(guardarecurso, 'Suspendido');
 */
export function prepareEstadoPendiente(
  guardarecurso: Guardarecurso,
  nuevoEstado: 'Activo' | 'Suspendido' | 'Desactivado'
): EstadoPendiente {
  return {
    id: guardarecurso.id,
    nuevoEstado,
    nombre: `${guardarecurso.nombre} ${guardarecurso.apellido}`
  };
}

/**
 * Verifica si un usuario puede cambiar contraseñas
 * 
 * @param currentUser - Usuario actual del sistema
 * @returns true si puede cambiar contraseñas, false si no
 * 
 * @example
 * if (canChangePassword(currentUser)) {
 *   // Mostrar botón de cambiar contraseña
 * }
 */
export function canChangePassword(currentUser?: any): boolean {
  if (!currentUser) return false;
  // Administradores y Coordinadores pueden cambiar contraseñas de guardarecursos
  return currentUser.rol === 'Administrador' || currentUser.rol === 'Coordinador';
}

/**
 * Obtiene el usuario asociado a un guardarecurso
 * 
 * @param guardarecurso - Guardarecurso
 * @param usuarios - Lista de usuarios
 * @returns Usuario asociado o undefined
 * 
 * @example
 * const usuario = getAssociatedUser(guardarecurso, usuarios);
 */
export function getAssociatedUser(
  guardarecurso: Guardarecurso,
  usuarios: Usuario[]
): Usuario | undefined {
  return usuarios.find(u => u.email === guardarecurso.email);
}

/**
 * Crea un formulario vacío con valores predeterminados
 * 
 * @returns Objeto de formulario vacío
 * 
 * @example
 * const emptyForm = createEmptyFormData();
 */
export function createEmptyFormData(): GuardarecursoFormData {
  return {
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    email: '',
    password: '',
    areaAsignada: '',
    estado: 'Activo'
  };
}

/**
 * Convierte un guardarecurso a datos de formulario
 * 
 * @param guardarecurso - Guardarecurso a convertir
 * @returns Datos de formulario
 * 
 * @example
 * const formData = guardarecursoToFormData(guardarecurso);
 */
export function guardarecursoToFormData(
  guardarecurso: Guardarecurso
): GuardarecursoFormData {
  return {
    nombre: guardarecurso.nombre,
    apellido: guardarecurso.apellido,
    cedula: guardarecurso.cedula,
    telefono: guardarecurso.telefono,
    email: guardarecurso.email,
    password: '', // Dejar vacío para no cambiar la contraseña
    areaAsignada: guardarecurso.areaAsignada,
    estado: guardarecurso.estado
  };
}

/**
 * Servicio principal de Guardarecursos
 * Agrupa todas las funcionalidades en un objeto cohesivo
 */
export const guardarecursosService = {
  // Filtrado
  filterGuardarecursos,
  
  // Creación
  createGuardarecurso,
  createUsuarioForGuardarecurso,
  
  // Actualización
  updateGuardarecurso,
  updateUsuarioForGuardarecurso,
  
  // Estado
  isValidEstadoChange,
  updateEstado,
  updateUsuarioEstado,
  getEstadoMensaje,
  prepareEstadoPendiente,
  
  // Permisos
  canChangePassword,
  
  // Utilidades
  getAssociatedUser,
  createEmptyFormData,
  guardarecursoToFormData
};

export default guardarecursosService;
