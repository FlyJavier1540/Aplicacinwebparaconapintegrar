/**
 * =============================================
 * CAPA BASE DE ACCESO A LA API
 * =============================================
 * 
 * Este archivo contiene la configuración base y funciones genéricas
 * para realizar peticiones HTTP al backend de CONAP.
 * 
 * IMPORTANTE: Este es el único lugar donde se define la URL base
 * y la lógica de manejo de errores HTTP.
 */

// ===== CONFIGURACIÓN =====

/**
 * URL base del backend API
 * En desarrollo, apunta a tu servidor local
 * En producción, debe apuntar a tu servidor de producción
 */
const getApiBaseUrl = (): string => {
  // Verificar si import.meta.env está disponible (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  }
  
  // Fallback para otros entornos
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Timeout para las peticiones (en milisegundos)
 */
const REQUEST_TIMEOUT = 30000; // 30 segundos

// ===== TIPOS =====

/**
 * Métodos HTTP soportados
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Opciones para las peticiones HTTP
 */
export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  requiresAuth?: boolean; // Si la petición requiere token JWT
}

/**
 * Respuesta genérica de la API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

/**
 * Error personalizado de la API
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ===== GESTIÓN DE TOKEN JWT =====

/**
 * Clave para almacenar el token en localStorage
 */
const TOKEN_KEY = 'conap_auth_token';

/**
 * Guarda el token JWT en localStorage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Obtiene el token JWT de localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Elimina el token JWT de localStorage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Verifica si hay un token almacenado
 */
export const hasAuthToken = (): boolean => {
  return !!getAuthToken();
};

// ===== FUNCIÓN PRINCIPAL DE PETICIONES =====

/**
 * Función genérica para realizar peticiones HTTP a la API
 * 
 * @param endpoint - Endpoint de la API (ej: '/usuarios', '/actividades/123')
 * @param options - Opciones de la petición
 * @returns Promesa con los datos de la respuesta
 * @throws ApiError si la petición falla
 * 
 * @example
 * ```typescript
 * // GET simple
 * const usuarios = await fetchApi<Usuario[]>('/usuarios');
 * 
 * // POST con body
 * const nuevoUsuario = await fetchApi<Usuario>('/usuarios', {
 *   method: 'POST',
 *   body: { nombre: 'Juan', apellido: 'Pérez' }
 * });
 * 
 * // PUT con autenticación
 * const actualizado = await fetchApi<Usuario>('/usuarios/123', {
 *   method: 'PUT',
 *   body: { nombre: 'Juan Carlos' },
 *   requiresAuth: true
 * });
 * 
 * // DELETE
 * await fetchApi('/usuarios/123', { method: 'DELETE' });
 * ```
 */
export async function fetchApi<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = REQUEST_TIMEOUT,
    requiresAuth = true, // Por defecto requiere autenticación
  } = options;

  // Construir URL completa
  const url = `${API_BASE_URL}${endpoint}`;

  // Construir headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Agregar token JWT si se requiere autenticación
  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // Construir opciones de fetch
  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
    credentials: 'include', // Incluir cookies si es necesario
  };

  // Agregar body si existe (excepto para GET)
  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  // Crear AbortController para timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Realizar petición
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    // Limpiar timeout
    clearTimeout(timeoutId);

    // Parsear respuesta JSON
    let data: any;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Manejar errores HTTP
    if (!response.ok) {
      throw new ApiError(
        data?.message || data?.error || `Error HTTP ${response.status}`,
        response.status,
        data
      );
    }

    // Retornar datos
    // Si la respuesta tiene estructura { success, data }, retornar solo data
    if (data && typeof data === 'object' && 'data' in data) {
      return data.data as T;
    }

    return data as T;

  } catch (error) {
    // Limpiar timeout en caso de error
    clearTimeout(timeoutId);

    // Manejar timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('La petición ha excedido el tiempo de espera', 408);
    }

    // Manejar error de red
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new ApiError(
        'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        0
      );
    }

    // Manejar errores HTTP específicos
    if (error instanceof ApiError) {
      // Error 401: Token inválido o expirado
      if (error.statusCode === 401) {
        removeAuthToken();
        // Puedes disparar un evento o redireccionar al login aquí
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }

      // Error 403: Sin permisos
      if (error.statusCode === 403) {
        console.error('Acceso denegado:', error.message);
      }

      // Error 404: Recurso no encontrado
      if (error.statusCode === 404) {
        console.error('Recurso no encontrado:', endpoint);
      }

      // Error 500: Error del servidor
      if (error.statusCode >= 500) {
        console.error('Error del servidor:', error.message);
      }

      throw error;
    }

    // Error desconocido
    throw new ApiError(
      error instanceof Error ? error.message : 'Error desconocido',
      500
    );
  }
}

// ===== FUNCIONES DE CONVENIENCIA =====

/**
 * Realiza una petición GET
 */
export async function get<T = any>(
  endpoint: string,
  options?: Omit<RequestOptions, 'method'>
): Promise<T> {
  return fetchApi<T>(endpoint, { ...options, method: 'GET' });
}

/**
 * Realiza una petición POST
 */
export async function post<T = any>(
  endpoint: string,
  body?: any,
  options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
  return fetchApi<T>(endpoint, { ...options, method: 'POST', body });
}

/**
 * Realiza una petición PUT
 */
export async function put<T = any>(
  endpoint: string,
  body?: any,
  options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
  return fetchApi<T>(endpoint, { ...options, method: 'PUT', body });
}

/**
 * Realiza una petición PATCH
 */
export async function patch<T = any>(
  endpoint: string,
  body?: any,
  options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
  return fetchApi<T>(endpoint, { ...options, method: 'PATCH', body });
}

/**
 * Realiza una petición DELETE
 */
export async function del<T = any>(
  endpoint: string,
  options?: Omit<RequestOptions, 'method'>
): Promise<T> {
  return fetchApi<T>(endpoint, { ...options, method: 'DELETE' });
}

// ===== UTILIDADES =====

/**
 * Construye una query string a partir de un objeto
 * 
 * @example
 * buildQueryString({ page: 1, limit: 10, search: 'test' })
 * // Retorna: "?page=1&limit=10&search=test"
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Obtiene la URL base de la API (exportada)
 */
export function getApiUrl(): string {
  return API_BASE_URL;
}

/**
 * Maneja errores de la API y los convierte en mensajes amigables
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ha ocurrido un error desconocido';
}

// ===== INTERCEPTORES (OPCIONAL) =====

/**
 * Tipo para funciones interceptoras de request
 */
export type RequestInterceptor = (
  endpoint: string,
  options: RequestOptions
) => RequestOptions | Promise<RequestOptions>;

/**
 * Tipo para funciones interceptoras de response
 */
export type ResponseInterceptor = <T>(
  response: T,
  endpoint: string
) => T | Promise<T>;

/**
 * Lista de interceptores de request
 */
const requestInterceptors: RequestInterceptor[] = [];

/**
 * Lista de interceptores de response
 */
const responseInterceptors: ResponseInterceptor[] = [];

/**
 * Agrega un interceptor de request
 */
export function addRequestInterceptor(interceptor: RequestInterceptor): void {
  requestInterceptors.push(interceptor);
}

/**
 * Agrega un interceptor de response
 */
export function addResponseInterceptor(interceptor: ResponseInterceptor): void {
  responseInterceptors.push(interceptor);
}

/**
 * Ejecuta los interceptores de request
 */
export async function runRequestInterceptors(
  endpoint: string,
  options: RequestOptions
): Promise<RequestOptions> {
  let modifiedOptions = options;

  for (const interceptor of requestInterceptors) {
    modifiedOptions = await interceptor(endpoint, modifiedOptions);
  }

  return modifiedOptions;
}

/**
 * Ejecuta los interceptores de response
 */
export async function runResponseInterceptors<T>(
  response: T,
  endpoint: string
): Promise<T> {
  let modifiedResponse = response;

  for (const interceptor of responseInterceptors) {
    modifiedResponse = await interceptor(modifiedResponse, endpoint);
  }

  return modifiedResponse;
}

// ===== EXPORTACIONES POR DEFECTO =====

export default {
  fetchApi,
  get,
  post,
  put,
  patch,
  del,
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  hasAuthToken,
  buildQueryString,
  getApiUrl,
  getErrorMessage,
  addRequestInterceptor,
  addResponseInterceptor,
};
