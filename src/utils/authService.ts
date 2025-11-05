/**
 * 🔐 Authentication Service
 * 
 * Servicio centralizado que maneja toda la lógica de autenticación y gestión de contraseñas,
 * incluyendo validación de credenciales, cambio de contraseñas y verificación de estados.
 * 
 * @module utils/authService
 */

import { usuarios } from '../data/mock-data';

/**
 * Interface para resultado de autenticación
 */
export interface AuthResult {
  success: boolean;
  user?: any;
  token?: string;  // Token JWT agregado
  error?: string;
}

/**
 * Interface para resultado de validación de contraseña
 */
export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Interface para resultado de cambio de contraseña
 */
export interface PasswordChangeResult {
  success: boolean;
  error?: string;
}

/**
 * 🔑 AUTENTICACIÓN
 */

/**
 * Genera un token JWT simulado para desarrollo
 * NOTA: En producción, esto debe venir del backend
 */
function generateMockToken(usuario: any): string {
  // Token simulado en formato JWT (base64)
  // En producción, el backend generará el token real
  const payload = {
    id: usuario.id,
    email: usuario.email,
    rol: usuario.rol,
    iat: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
  };
  
  return `mock.${btoa(JSON.stringify(payload))}.signature`;
}

/**
 * Decodifica un token JWT simulado
 * NOTA: En producción, usa una librería JWT real
 */
export function decodeMockToken(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || parts[0] !== 'mock') {
      return null;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Verificar si el token ha expirado
    if (payload.exp && payload.exp < Date.now()) {
      return null; // Token expirado
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Autentica a un usuario con email y contraseña
 */
export function authenticate(email: string, password: string): AuthResult {
  const usuario = usuarios.find(u => u.email === email && u.password === password);
  
  if (!usuario) {
    return {
      success: false,
      error: 'Credenciales incorrectas. Intente nuevamente.'
    };
  }

  // Verificar estado del usuario
  if (usuario.estado === 'Suspendido') {
    return {
      success: false,
      error: 'Su cuenta ha sido suspendida. Contacte al administrador.'
    };
  }
  
  if (usuario.estado === 'Desactivado') {
    return {
      success: false,
      error: 'Credenciales incorrectas. Intente nuevamente.'
    };
  }

  // Solo permitir login si está Activo
  if (usuario.estado !== 'Activo') {
    return {
      success: false,
      error: 'Credenciales incorrectas. Intente nuevamente.'
    };
  }

  // Generar token JWT (simulado por ahora)
  const token = generateMockToken(usuario);

  return {
    success: true,
    user: usuario,
    token: token  // Token incluido en la respuesta
  };
}

/**
 * 🔒 VALIDACIÓN DE CONTRASEÑAS
 */

/**
 * Valida que una contraseña cumpla con los requisitos mínimos
 */
export function validatePassword(password: string): PasswordValidationResult {
  if (!password || password.length < 6) {
    return {
      isValid: false,
      error: 'La contraseña debe tener al menos 6 caracteres'
    };
  }

  return { isValid: true };
}

/**
 * Valida que dos contraseñas coincidan
 */
export function validatePasswordMatch(password: string, confirmPassword: string): PasswordValidationResult {
  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: 'Las contraseñas no coinciden'
    };
  }

  return { isValid: true };
}

/**
 * Valida que la contraseña nueva sea diferente a la actual
 */
export function validatePasswordDifferent(currentPassword: string, newPassword: string): PasswordValidationResult {
  if (newPassword === currentPassword) {
    return {
      isValid: false,
      error: 'La nueva contraseña debe ser diferente a la actual'
    };
  }

  return { isValid: true };
}

/**
 * Verifica que la contraseña actual sea correcta
 */
export function verifyCurrentPassword(userId: string, currentPassword: string): PasswordValidationResult {
  const usuario = usuarios.find(u => u.id === userId);
  
  if (!usuario) {
    return {
      isValid: false,
      error: 'Usuario no encontrado'
    };
  }

  if (currentPassword !== usuario.password) {
    return {
      isValid: false,
      error: 'La contraseña actual es incorrecta'
    };
  }

  return { isValid: true };
}

/**
 * 🔄 CAMBIO DE CONTRASEÑAS
 */

/**
 * Cambia la contraseña de un usuario (el usuario cambia su propia contraseña)
 */
export function changeOwnPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): PasswordChangeResult {
  // Validar contraseña actual
  const currentPasswordValidation = verifyCurrentPassword(userId, currentPassword);
  if (!currentPasswordValidation.isValid) {
    return {
      success: false,
      error: currentPasswordValidation.error
    };
  }

  // Validar nueva contraseña
  const newPasswordValidation = validatePassword(newPassword);
  if (!newPasswordValidation.isValid) {
    return {
      success: false,
      error: newPasswordValidation.error
    };
  }

  // Validar que coincidan
  const matchValidation = validatePasswordMatch(newPassword, confirmPassword);
  if (!matchValidation.isValid) {
    return {
      success: false,
      error: matchValidation.error
    };
  }

  // Validar que sea diferente
  const differentValidation = validatePasswordDifferent(currentPassword, newPassword);
  if (!differentValidation.isValid) {
    return {
      success: false,
      error: differentValidation.error
    };
  }

  // Actualizar contraseña
  const usuario = usuarios.find(u => u.id === userId);
  if (usuario) {
    usuario.password = newPassword;
  }

  return { success: true };
}

/**
 * Cambia la contraseña de otro usuario (administrador cambia contraseña)
 */
export function changeUserPasswordByAdmin(
  adminUserId: string,
  targetUserId: string,
  newPassword: string,
  confirmPassword: string
): PasswordChangeResult {
  const adminUser = usuarios.find(u => u.id === adminUserId);
  const targetUser = usuarios.find(u => u.id === targetUserId);

  // Validar que el admin existe y es Administrador
  if (!adminUser || adminUser.rol !== 'Administrador') {
    return {
      success: false,
      error: 'No tienes permisos para realizar esta acción'
    };
  }

  // Validar que el usuario objetivo existe
  if (!targetUser) {
    return {
      success: false,
      error: 'Usuario no encontrado'
    };
  }

  // NUNCA se puede cambiar la contraseña de un Administrador (solo ellos mismos)
  if (targetUser.rol === 'Administrador') {
    return {
      success: false,
      error: 'No se puede cambiar la contraseña de un Administrador'
    };
  }

  // Validar nueva contraseña
  const newPasswordValidation = validatePassword(newPassword);
  if (!newPasswordValidation.isValid) {
    return {
      success: false,
      error: newPasswordValidation.error
    };
  }

  // Validar que coincidan
  const matchValidation = validatePasswordMatch(newPassword, confirmPassword);
  if (!matchValidation.isValid) {
    return {
      success: false,
      error: matchValidation.error
    };
  }

  // Actualizar contraseña
  targetUser.password = newPassword;

  return { success: true };
}

/**
 * 🔍 UTILIDADES
 */

/**
 * Obtiene un usuario por su ID
 */
export function getUserById(userId: string): any | null {
  return usuarios.find(u => u.id === userId) || null;
}

/**
 * Obtiene el usuario desde un token JWT
 * NOTA: En producción, el backend validará el token
 */
export function getUserFromToken(token: string): any | null {
  const payload = decodeMockToken(token);
  if (!payload) {
    return null;
  }
  
  // Obtener el usuario desde la base de datos usando el ID del token
  const usuario = getUserById(payload.id);
  
  // Verificar que el usuario aún esté activo
  if (!usuario || usuario.estado !== 'Activo') {
    return null;
  }
  
  return usuario;
}

/**
 * Obtiene un usuario por su email
 */
export function getUserByEmail(email: string): any | null {
  return usuarios.find(u => u.email === email) || null;
}

/**
 * Verifica si un usuario está activo
 */
export function isUserActive(userId: string): boolean {
  const usuario = usuarios.find(u => u.id === userId);
  return usuario?.estado === 'Activo';
}

/**
 * Obtiene el estado de un usuario
 */
export function getUserStatus(userId: string): string | null {
  const usuario = usuarios.find(u => u.id === userId);
  return usuario?.estado || null;
}

/**
 * Servicio de Autenticación - Export centralizado
 */
export const authService = {
  // Autenticación
  authenticate,
  getUserFromToken,
  decodeMockToken,
  
  // Validación de contraseñas
  validatePassword,
  validatePasswordMatch,
  validatePasswordDifferent,
  verifyCurrentPassword,
  
  // Cambio de contraseñas
  changeOwnPassword,
  changeUserPasswordByAdmin,
  
  // Utilidades
  getUserById,
  getUserByEmail,
  isUserActive,
  getUserStatus
};
