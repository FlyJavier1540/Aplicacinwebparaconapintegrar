# 📡 Guía de Uso - Capa Base de API

## Descripción General

El archivo `/utils/base-api-service.ts` proporciona una capa de abstracción para todas las comunicaciones HTTP entre el frontend y el backend de CONAP.

## 🎯 Características Principales

### ✅ Funcionalidades Implementadas

- ✅ **Gestión centralizada de URL base** - Configurada desde variables de entorno
- ✅ **Métodos HTTP completos** - GET, POST, PUT, PATCH, DELETE
- ✅ **Autenticación JWT** - Gestión automática de tokens
- ✅ **Manejo de errores** - Errores HTTP personalizados con contexto
- ✅ **Timeout configurable** - Evita peticiones colgadas
- ✅ **Query strings** - Constructor de parámetros URL
- ✅ **Interceptores** - Para request y response (opcional)
- ✅ **TypeScript completo** - Tipado fuerte en todas las respuestas

---

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

### 2. Importar en tus Servicios

```typescript
import { get, post, put, del } from '../utils/base-api-service';
import type { Usuario } from '../types';

// GET - Obtener todos los usuarios
const usuarios = await get<Usuario[]>('/usuarios');

// POST - Crear nuevo usuario
const nuevoUsuario = await post<Usuario>('/usuarios', {
  nombre: 'Juan',
  apellido: 'Pérez',
  email: 'juan@example.com'
});

// PUT - Actualizar usuario
const actualizado = await put<Usuario>('/usuarios/123', {
  nombre: 'Juan Carlos'
});

// DELETE - Eliminar usuario
await del('/usuarios/123');
```

---

## 📖 API Reference

### Funciones Principales

#### `get<T>(endpoint, options?)`

Realiza una petición GET.

```typescript
const usuarios = await get<Usuario[]>('/usuarios');

// Con query parameters
const filtrados = await get<Usuario[]>('/usuarios?estado=Activo&area=1');

// Sin autenticación (para endpoints públicos)
const publico = await get('/public/info', { requiresAuth: false });
```

#### `post<T>(endpoint, body?, options?)`

Realiza una petición POST.

```typescript
const nuevo = await post<Usuario>('/usuarios', {
  nombre: 'Juan',
  apellido: 'Pérez',
  email: 'juan@example.com',
  password: 'secreto123'
});
```

#### `put<T>(endpoint, body?, options?)`

Realiza una petición PUT (actualización completa).

```typescript
const actualizado = await put<Usuario>('/usuarios/123', {
  nombre: 'Juan Carlos',
  apellido: 'Pérez García',
  email: 'juancarlos@example.com'
});
```

#### `patch<T>(endpoint, body?, options?)`

Realiza una petición PATCH (actualización parcial).

```typescript
const parcial = await patch<Usuario>('/usuarios/123', {
  estado: 'Suspendido'
});
```

#### `del<T>(endpoint, options?)`

Realiza una petición DELETE.

```typescript
await del('/usuarios/123');
```

---

### Gestión de Autenticación

#### `setAuthToken(token: string)`

Guarda el token JWT en localStorage.

```typescript
import { setAuthToken } from '../utils/base-api-service';

// Después del login exitoso
const response = await post('/auth/login', {
  email: 'usuario@example.com',
  password: 'password123'
});

setAuthToken(response.token);
```

#### `getAuthToken()`

Obtiene el token actual.

```typescript
const token = getAuthToken();
console.log('Token actual:', token);
```

#### `removeAuthToken()`

Elimina el token (logout).

```typescript
removeAuthToken();
// Redirigir al login
```

#### `hasAuthToken()`

Verifica si hay un token almacenado.

```typescript
if (!hasAuthToken()) {
  // Redirigir al login
}
```

---

### Utilidades

#### `buildQueryString(params)`

Construye un query string desde un objeto.

```typescript
import { buildQueryString } from '../utils/base-api-service';

const params = {
  page: 1,
  limit: 10,
  search: 'Juan',
  estado: 'Activo'
};

const queryString = buildQueryString(params);
// Resultado: "?page=1&limit=10&search=Juan&estado=Activo"

const usuarios = await get<Usuario[]>(`/usuarios${queryString}`);
```

#### `getErrorMessage(error)`

Convierte errores en mensajes amigables.

```typescript
import { getErrorMessage } from '../utils/base-api-service';

try {
  await post('/usuarios', data);
} catch (error) {
  const mensaje = getErrorMessage(error);
  toast.error(mensaje);
}
```

---

## 🔐 Manejo de Autenticación

### Flujo Completo de Login

```typescript
// authService.ts
import { post, setAuthToken, removeAuthToken } from './base-api-service';

export const login = async (email: string, password: string) => {
  try {
    const response = await post<{ token: string; usuario: Usuario }>(
      '/auth/login',
      { email, password },
      { requiresAuth: false } // Login no requiere token
    );

    // Guardar token
    setAuthToken(response.token);

    return response.usuario;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    // Opcional: notificar al backend
    await post('/auth/logout');
  } finally {
    // Siempre eliminar el token
    removeAuthToken();
  }
};
```

### Manejo de Token Expirado

La capa base automáticamente:

1. Detecta error 401 (Unauthorized)
2. Elimina el token automáticamente
3. Dispara evento personalizado `auth:unauthorized`

Puedes escuchar este evento en tu aplicación:

```typescript
// App.tsx
useEffect(() => {
  const handleUnauthorized = () => {
    // Redirigir al login
    navigate('/login');
    toast.error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
  };

  window.addEventListener('auth:unauthorized', handleUnauthorized);

  return () => {
    window.removeEventListener('auth:unauthorized', handleUnauthorized);
  };
}, [navigate]);
```

---

## 🚨 Manejo de Errores

### Tipos de Errores

```typescript
import { ApiError, getErrorMessage } from './base-api-service';

try {
  await post('/usuarios', data);
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 400:
        console.error('Datos inválidos:', error.message);
        break;
      case 401:
        console.error('No autorizado:', error.message);
        // Token será removido automáticamente
        break;
      case 403:
        console.error('Sin permisos:', error.message);
        break;
      case 404:
        console.error('No encontrado:', error.message);
        break;
      case 500:
        console.error('Error del servidor:', error.message);
        break;
      default:
        console.error('Error:', error.message);
    }
  }
}
```

### Ejemplo con Toast

```typescript
import { toast } from 'sonner@2.0.3';
import { getErrorMessage } from './base-api-service';

const guardarUsuario = async (data: Usuario) => {
  try {
    const usuario = await post<Usuario>('/usuarios', data);
    toast.success('Usuario guardado exitosamente');
    return usuario;
  } catch (error) {
    const mensaje = getErrorMessage(error);
    toast.error(`Error al guardar: ${mensaje}`);
    throw error;
  }
};
```

---

## 🔧 Ejemplos de Servicios

### Servicio de Usuarios

```typescript
// gestionUsuariosService.ts
import { get, post, put, del, buildQueryString } from './base-api-service';
import type { Usuario } from '../types';

export const usuariosService = {
  // Obtener todos
  getAll: async (): Promise<Usuario[]> => {
    return get<Usuario[]>('/usuarios');
  },

  // Obtener por ID
  getById: async (id: string): Promise<Usuario> => {
    return get<Usuario>(`/usuarios/${id}`);
  },

  // Crear
  create: async (usuario: Partial<Usuario>): Promise<Usuario> => {
    return post<Usuario>('/usuarios', usuario);
  },

  // Actualizar
  update: async (id: string, usuario: Partial<Usuario>): Promise<Usuario> => {
    return put<Usuario>(`/usuarios/${id}`, usuario);
  },

  // Eliminar
  delete: async (id: string): Promise<void> => {
    return del(`/usuarios/${id}`);
  },

  // Filtrar con parámetros
  filter: async (filters: {
    estado?: string;
    rol?: string;
    area?: string;
    search?: string;
  }): Promise<Usuario[]> => {
    const queryString = buildQueryString(filters);
    return get<Usuario[]>(`/usuarios${queryString}`);
  },
};
```

### Servicio de Actividades

```typescript
// actividadesService.ts
import { get, post, put, del, buildQueryString } from './base-api-service';
import type { Actividad } from '../types';

export const actividadesService = {
  // Obtener todas las actividades
  getAll: async (): Promise<Actividad[]> => {
    return get<Actividad[]>('/actividades');
  },

  // Obtener por guardarecurso
  getByGuardarecurso: async (guardarecursoId: string): Promise<Actividad[]> => {
    return get<Actividad[]>(`/actividades?guardarecurso=${guardarecursoId}`);
  },

  // Crear actividad
  create: async (actividad: Partial<Actividad>): Promise<Actividad> => {
    return post<Actividad>('/actividades', actividad);
  },

  // Actualizar estado
  updateEstado: async (id: string, estado: string): Promise<Actividad> => {
    return patch<Actividad>(`/actividades/${id}/estado`, { estado });
  },

  // Filtrar por rango de fechas
  filterByDateRange: async (
    fechaInicio: string,
    fechaFin: string
  ): Promise<Actividad[]> => {
    const params = buildQueryString({ fechaInicio, fechaFin });
    return get<Actividad[]>(`/actividades${params}`);
  },
};
```

---

## 🎨 Interceptores (Avanzado)

Los interceptores te permiten modificar requests/responses globalmente.

### Request Interceptor

```typescript
import { addRequestInterceptor } from './base-api-service';

// Agregar timestamp a todas las peticiones
addRequestInterceptor((endpoint, options) => {
  console.log(`[${new Date().toISOString()}] ${options.method} ${endpoint}`);
  return options;
});

// Agregar header personalizado
addRequestInterceptor((endpoint, options) => {
  return {
    ...options,
    headers: {
      ...options.headers,
      'X-Client-Version': '1.0.0',
    },
  };
});
```

### Response Interceptor

```typescript
import { addResponseInterceptor } from './base-api-service';

// Log de todas las respuestas
addResponseInterceptor((response, endpoint) => {
  console.log(`Respuesta de ${endpoint}:`, response);
  return response;
});

// Transformar fechas
addResponseInterceptor((response, endpoint) => {
  // Convertir strings de fecha a objetos Date
  if (typeof response === 'object' && response !== null) {
    Object.keys(response).forEach(key => {
      if (key.includes('fecha') && typeof response[key] === 'string') {
        response[key] = new Date(response[key]);
      }
    });
  }
  return response;
});
```

---

## 📝 Configuración Backend Necesaria

Tu backend Express/Node.js debe:

### 1. Exponer endpoints con la estructura esperada

```javascript
// Ejemplo con Express
app.get('/api/usuarios', authenticateJWT, async (req, res) => {
  try {
    const usuarios = await db.query('SELECT * FROM usuario');
    res.json({
      success: true,
      data: usuarios.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### 2. Configurar CORS

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:5173', // Tu frontend
  credentials: true
}));
```

### 3. Middleware de autenticación JWT

```javascript
const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer TOKEN

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(401).json({
          success: false,
          error: 'Token inválido o expirado'
        });
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Token no proporcionado'
    });
  }
};
```

---

## ✅ Checklist de Integración

### Frontend
- [x] Crear `.env` con `VITE_API_BASE_URL`
- [ ] Actualizar servicios para usar `base-api-service`
- [ ] Implementar manejo de evento `auth:unauthorized`
- [ ] Probar flujo de login/logout
- [ ] Manejar errores en componentes

### Backend
- [ ] Configurar CORS
- [ ] Implementar autenticación JWT
- [ ] Crear endpoints REST para cada tabla
- [ ] Validar datos de entrada
- [ ] Retornar estructura consistente `{ success, data/error }`

---

## 🐛 Debugging

### Ver peticiones en la consola

```typescript
import { addRequestInterceptor } from './base-api-service';

if (import.meta.env.DEV) {
  addRequestInterceptor((endpoint, options) => {
    console.log('🚀 Request:', options.method, endpoint, options.body);
    return options;
  });
}
```

### Simular latencia de red

```typescript
addRequestInterceptor(async (endpoint, options) => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
  return options;
});
```

---

## 📚 Recursos Adicionales

- [Fetch API - MDN](https://developer.mozilla.org/es/docs/Web/API/Fetch_API)
- [JWT - JSON Web Tokens](https://jwt.io/)
- [Express.js - Middleware](https://expressjs.com/en/guide/using-middleware.html)
- [TypeScript - Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)

---

**Última actualización:** 4 de noviembre de 2025
