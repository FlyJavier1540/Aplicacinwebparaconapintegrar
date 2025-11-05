/**
 * Utilidades de formateo compartidas
 */

import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha a formato legible en español
 */
export function formatDate(dateString: string, formatStr: string = "d 'de' MMMM, yyyy"): string {
  try {
    return format(new Date(dateString), formatStr, { locale: es });
  } catch {
    return 'Fecha inválida';
  }
}

/**
 * Formatea una fecha con hora
 */
export function formatDateTime(dateString: string): string {
  return formatDate(dateString, "d 'de' MMMM, yyyy 'a las' HH:mm");
}

/**
 * Formatea coordenadas a string legible
 */
export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

/**
 * Formatea un nombre completo
 */
export function formatFullName(nombre: string, apellido: string): string {
  return `${nombre} ${apellido}`;
}

/**
 * Capitaliza la primera letra de cada palabra
 */
export function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Trunca un texto a una longitud máxima
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Genera un ID único simple
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
