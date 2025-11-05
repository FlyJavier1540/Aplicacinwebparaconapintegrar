# 🔐 Guía de Persistencia de Sesión - Sistema CONAP

## Descripción General

El sistema ahora implementa **persistencia de sesión** usando tokens JWT almacenados en `localStorage`. Esto permite que los usuarios permanezcan autenticados incluso después de recargar la página o cerrar el navegador.

---

## 🎯 Flujo Completo de Autenticación

### 1. **Login del Usuario**

```
Usuario ingresa credenciales
    ↓
Login.tsx: authService.authenticate(email, password)
    ↓
authService retorna { success: true, user, token }
    ↓
Login.tsx llama a onLogin({ user, token })
    ↓
App.tsx ejecuta handleLogin(authResult)
    ↓
setAuthToken(token) → Guarda en localStorage['conap_auth_token']
setCurrentUser(user) → Actualiza estado React
    ↓
Usuario autenticado ✅
```

### 2. **Recarga de Página (Restauración de Sesión)**

```
Usuario recarga la página
    ↓
App.tsx useEffect se ejecuta al montar
    ↓
getAuthToken() → Lee localStorage['conap_auth_token']
    ↓
¿Token existe?
    ├─ NO → Mostrar Login
    └─ SÍ → Continuar ↓
         ↓
    getUserFromToken(token)
         ↓
    ¿Token válido?
         ├─ NO → removeAuthToken() + Mostrar Login
         └─ SÍ → setCurrentUser(user) ✅
```

### 3. **Token Expirado Durante Uso**

```
Usuario hace una petición HTTP
    ↓
base-api-service incluye automáticamente el token en headers
    ↓
Backend responde 401 (Unauthorized)
    ↓
base-api-service detecta status 401
    ↓
removeAuthToken()
dispatchEvent('auth:unauthorized')
    ↓
App.tsx escucha el evento
    ↓
setCurrentUser(null)
toast.error('Sesión expirada')
    ↓
Usuario redirigido a Login
```

### 4. **Logout Manual**

```
Usuario hace clic en "Cerrar sesión"
    ↓
handleLogout() en App.tsx
    ↓
removeAuthToken() → Elimina localStorage['conap_auth_token']
setCurrentUser(null) → Limpia estado React
toast.success('Sesión cerrada')
    ↓
Redirigido a Login ✅
```

---

## 📁 Archivos Modificados

### `/utils/base-api-service.ts`

**Funciones de gestión de tokens:**

```typescript
// Guardar token
setAuthToken(token: string): void

// Obtener token
getAuthToken(): string | null

// Eliminar token
removeAuthToken(): void

// Verificar si hay token
hasAuthToken(): boolean
```

**Inclusión automática en requests:**
```typescript
if (requiresAuth) {
  const token = getAuthToken();
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }
}
```

**Detección de sesión expirada:**
```typescript
if (error.statusCode === 401) {
  removeAuthToken();
  window.dispatchEvent(new CustomEvent('auth:unauthorized'));
}
```

---

### `/utils/authService.ts`

**Nuevas funcionalidades:**

#### 1. Interface AuthResult actualizada
```typescript
export interface AuthResult {
  success: boolean;
  user?: any;
  token?: string;  // ✅ Token agregado
  error?: string;
}
```

#### 2. Generación de token JWT simulado
```typescript
function generateMockToken(usuario: any): string {
  const payload = {
    id: usuario.id,
    email: usuario.email,
    rol: usuario.rol,
    iat: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
  };
  
  return `mock.${btoa(JSON.stringify(payload))}.signature`;
}
```

**⚠️ IMPORTANTE:** Este token es **simulado** para desarrollo. En producción, el backend generará tokens JWT reales firmados con una clave secreta.

#### 3. Decodificación de token
```typescript
export function decodeMockToken(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3 || parts[0] !== 'mock') {
      return null;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Verificar expiración
    if (payload.exp && payload.exp < Date.now()) {
      return null; // Token expirado
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}
```

#### 4. Obtener usuario desde token
```typescript
export function getUserFromToken(token: string): any | null {
  const payload = decodeMockToken(token);
  if (!payload) return null;
  
  const usuario = getUserById(payload.id);
  
  // Verificar que esté activo
  if (!usuario || usuario.estado !== 'Activo') {
    return null;
  }
  
  return usuario;
}
```

#### 5. Función authenticate actualizada
```typescript
export function authenticate(email: string, password: string): AuthResult {
  const usuario = usuarios.find(u => u.email === email && u.password === password);
  
  // ... validaciones ...
  
  // Generar token
  const token = generateMockToken(usuario);

  return {
    success: true,
    user: usuario,
    token: token  // ✅ Incluido
  };
}
```

---

### `/App.tsx`

**Nuevos imports:**
```typescript
import { setAuthToken, getAuthToken, removeAuthToken } from './utils/base-api-service';
import { getUserFromToken } from './utils/authService';
import { toast } from 'sonner@2.0.3';
```

**Nuevo estado:**
```typescript
const [isLoadingSession, setIsLoadingSession] = useState(true);
```

**Hook de restauración de sesión:**
```typescript
useEffect(() => {
  const loadSession = () => {
    try {
      const token = getAuthToken();
      
      if (token) {
        const user = getUserFromToken(token);
        
        if (user) {
          setCurrentUser(user);
          console.log('✅ Sesión restaurada:', user.email);
        } else {
          removeAuthToken();
          console.log('⚠️ Token inválido o expirado');
        }
      }
    } catch (error) {
      console.error('❌ Error al cargar sesión:', error);
      removeAuthToken();
    } finally {
      setIsLoadingSession(false);
    }
  };

  loadSession();
}, []);
```

**Hook de listener de sesión expirada:**
```typescript
useEffect(() => {
  const handleUnauthorized = () => {
    setCurrentUser(null);
    removeAuthToken();
    toast.error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
  };

  window.addEventListener('auth:unauthorized', handleUnauthorized);

  return () => {
    window.removeEventListener('auth:unauthorized', handleUnauthorized);
  };
}, []);
```

**Función handleLogin actualizada:**
```typescript
const handleLogin = (authResult: { user: any; token: string }) => {
  // Guardar token JWT
  setAuthToken(authResult.token);
  
  // Guardar usuario en estado
  setCurrentUser(authResult.user);
  
  console.log('✅ Login exitoso:', authResult.user.email);
};
```

**Función handleLogout actualizada:**
```typescript
const handleLogout = () => {
  removeAuthToken();
  setCurrentUser(null);
  setActiveSection('dashboard');
  toast.success('Sesión cerrada exitosamente');
};
```

**Pantalla de carga de sesión:**
```typescript
if (isLoadingSession) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="conap-theme">
      <div className="min-h-screen flex items-center justify-center ...">
        <div className="text-center">
          <div className="w-16 h-16 border-4 ... rounded-full animate-spin ..."></div>
          <p className="text-muted-foreground">Cargando sesión...</p>
        </div>
      </div>
    </ThemeProvider>
  );
}
```

---

### `/components/Login.tsx`

**Interface actualizada:**
```typescript
interface LoginProps {
  onLogin: (authResult: { user: any; token: string }) => void;
}
```

**HandleSubmit actualizado:**
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  setTimeout(() => {
    const result = authService.authenticate(email, password);
    
    if (result.success && result.user && result.token) {
      onLogin({
        user: result.user,
        token: result.token
      });
    } else {
      setError(result.error || 'Error de autenticación');
    }
    
    setIsLoading(false);
  }, 800);
};
```

---

## 🔍 Debugging y Pruebas

### Ver Token en Console

```javascript
// En la consola del navegador
localStorage.getItem('conap_auth_token')
```

### Decodificar Token Manualmente

```javascript
const token = localStorage.getItem('conap_auth_token');
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('Token payload:', payload);
```

### Verificar Expiración

```javascript
const payload = JSON.parse(atob(token.split('.')[1]));
const expDate = new Date(payload.exp);
console.log('Token expira:', expDate);
console.log('¿Expirado?', payload.exp < Date.now());
```

### Simular Sesión Expirada

```javascript
// En la consola
window.dispatchEvent(new CustomEvent('auth:unauthorized'));
```

### Eliminar Token Manualmente

```javascript
localStorage.removeItem('conap_auth_token');
location.reload();
```

---

## 🔒 Seguridad

### ✅ Implementado

- ✅ Token almacenado en localStorage (mejor que cookies sin httpOnly para SPA)
- ✅ Validación de expiración del token
- ✅ Limpieza automática de token inválido
- ✅ Verificación de estado del usuario (Activo/Suspendido/Desactivado)
- ✅ Evento global para sesión expirada
- ✅ Logout limpia token completamente

### ⚠️ Consideraciones para Producción

1. **Token JWT Real:**
   - El backend debe generar tokens JWT firmados con algoritmo HS256 o RS256
   - Usar librería como `jsonwebtoken` en Node.js
   - Incluir claims estándar: `iat`, `exp`, `sub`, `iss`

2. **Refresh Tokens:**
   - Implementar tokens de corta duración (15 min - 1 hora)
   - Usar refresh tokens para renovar sin re-login
   - Almacenar refresh token en httpOnly cookie (más seguro)

3. **Validación en Backend:**
   - Cada endpoint debe validar el token JWT
   - Verificar firma, expiración y claims
   - Rechazar tokens manipulados

4. **HTTPS Obligatorio:**
   - Todos los tokens deben transmitirse sobre HTTPS
   - Configurar HSTS headers

5. **XSS Protection:**
   - Sanitizar inputs del usuario
   - Usar Content Security Policy (CSP)
   - Evitar `innerHTML` con datos no sanitizados

---

## 🚀 Migración a Backend Real

Cuando conectes al backend real:

### 1. Actualizar authService.authenticate()

```typescript
export async function authenticate(
  email: string, 
  password: string
): Promise<AuthResult> {
  try {
    const response = await post<{ user: Usuario; token: string }>(
      '/auth/login',
      { email, password },
      { requiresAuth: false }
    );

    return {
      success: true,
      user: response.user,
      token: response.token
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error)
    };
  }
}
```

### 2. Eliminar generateMockToken y decodeMockToken

Ya no serán necesarios, el backend manejará todo.

### 3. Actualizar getUserFromToken()

```typescript
export async function getUserFromToken(token: string): Promise<any | null> {
  try {
    // El backend validará el token y retornará el usuario
    const user = await get<Usuario>('/auth/me', { requiresAuth: true });
    return user;
  } catch (error) {
    return null;
  }
}
```

### 4. Endpoint de Backend Necesario

```javascript
// POST /api/auth/login
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Validar credenciales
  const user = await User.findOne({ where: { email } });
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ 
      success: false, 
      error: 'Credenciales incorrectas' 
    });
  }
  
  // Generar token JWT
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      rol: user.rol 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  res.json({
    success: true,
    data: {
      user: user.toJSON(),
      token: token
    }
  });
});

// GET /api/auth/me (validar token y retornar usuario actual)
router.get('/auth/me', authenticateJWT, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  res.json({ success: true, data: user });
});
```

---

## ✅ Checklist de Implementación

### Frontend
- [x] `base-api-service.ts` - Funciones de gestión de token
- [x] `authService.ts` - Generación y validación de token mock
- [x] `App.tsx` - Restauración de sesión al cargar
- [x] `App.tsx` - Listener de sesión expirada
- [x] `App.tsx` - handleLogin guarda token
- [x] `App.tsx` - handleLogout elimina token
- [x] `Login.tsx` - Pasa token a App.tsx
- [x] Pantalla de loading al restaurar sesión

### Backend (Pendiente)
- [ ] Endpoint `/auth/login` que retorna token JWT
- [ ] Endpoint `/auth/me` que valida token y retorna usuario
- [ ] Middleware `authenticateJWT` para proteger rutas
- [ ] Configurar variables de entorno (JWT_SECRET)
- [ ] Implementar bcrypt para hashear contraseñas
- [ ] Configurar expiración de tokens
- [ ] (Opcional) Implementar refresh tokens

---

## 📊 Testing

### Casos de Prueba

1. **Login Exitoso**
   - [x] Token se guarda en localStorage
   - [x] Usuario se autentica correctamente
   - [x] Redirección al dashboard

2. **Recarga de Página**
   - [x] Sesión se restaura automáticamente
   - [x] Usuario no necesita re-login
   - [x] Estado de la app se mantiene

3. **Token Expirado**
   - [x] Token expirado no restaura sesión
   - [x] Token se elimina automáticamente
   - [x] Usuario redirigido a login

4. **Logout**
   - [x] Token se elimina completamente
   - [x] Estado se limpia
   - [x] Redirección a login
   - [x] Toast de confirmación

5. **Sesión Expirada Durante Uso**
   - [x] Evento `auth:unauthorized` se dispara
   - [x] Token se elimina
   - [x] Toast de error se muestra
   - [x] Redirección a login

---

## 🎓 Conceptos Clave

### JWT (JSON Web Token)

Formato: `header.payload.signature`

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "id": "1",
  "email": "admin@conap.gob.gt",
  "rol": "Administrador",
  "iat": 1699123456,
  "exp": 1699209856
}
```

**Signature:**
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

### localStorage vs sessionStorage vs Cookies

| Storage | Persistencia | Acceso | Seguridad | Uso en CONAP |
|---------|--------------|--------|-----------|--------------|
| localStorage | Permanente | JavaScript | XSS vulnerable | ✅ Token JWT |
| sessionStorage | Sesión del tab | JavaScript | XSS vulnerable | ❌ No usado |
| httpOnly Cookie | Configurable | Solo backend | CSRF vulnerable | 🔄 Considerar para refresh token |

---

**Última actualización:** 4 de noviembre de 2025
