/**
 * Validadores compartidos para formularios
 */

/**
 * Valida que un email tenga formato correcto
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida que una contraseña cumpla los requisitos mínimos
 */
export function isValidPassword(password: string, minLength: number = 6): boolean {
  return password.length >= minLength;
}

/**
 * Valida que un DPI guatemalteco sea válido
 */
export function isValidDPI(dpi: string): boolean {
  const dpiRegex = /^\d{13}$/;
  return dpiRegex.test(dpi);
}

/**
 * Valida que un teléfono guatemalteco sea válido
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s|-/g, ''));
}

/**
 * Valida coordenadas geográficas
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Valida que un campo no esté vacío
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Valida múltiples campos requeridos
 */
export function validateRequiredFields(fields: Record<string, any>): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  
  for (const [key, value] of Object.entries(fields)) {
    if (value === '' || value === null || value === undefined) {
      missingFields.push(key);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}
