# 📊 API de Dashboard - Documentación

## Resumen

El Dashboard de CONAP consume 2 endpoints del backend que mapean directamente a las vistas SQL de PostgreSQL.

**IMPORTANTE:** 
- ✅ Estos endpoints solo son accesibles para usuarios con rol **Administrador** o **Coordinador**
- ❌ Los Guardarecursos **NO** tienen acceso al Dashboard
- 🔒 Ambos endpoints requieren autenticación JWT (token en header `Authorization: Bearer <token>`)

---

## 📍 Endpoints

### 1. GET `/api/dashboard/stats`

Retorna las 4 estadísticas principales del sistema.

**Vista SQL:** `vista_dashboard`

**Autenticación:** ✅ Requerida (JWT)

**Permisos:** Solo Administrador y Coordinador

**Request:**
```http
GET /api/dashboard/stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "total_areas_activas": 4,
    "total_guardarecursos_activos": 14,
    "total_actividades": 31,
    "actividades_hoy": 2
  }
}
```

**Respuesta de Error 401:**
```json
{
  "success": false,
  "error": "Token inválido o expirado"
}
```

**Respuesta de Error 403:**
```json
{
  "success": false,
  "error": "No tienes permisos para acceder al dashboard"
}
```

---

### 2. GET `/api/dashboard/areas`

Retorna todas las áreas protegidas **ACTIVAS** con sus datos para mostrar en el mapa.

**Vista SQL:** `vista_areas_mapa_dashboard`

**Autenticación:** ✅ Requerida (JWT)

**Permisos:** Solo Administrador y Coordinador

**IMPORTANTE:** La vista SQL ya filtra por `estado = 'Activo'`, no es necesario filtrar en el backend ni frontend.

**Request:**
```http
GET /api/dashboard/areas
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "area_id": "1",
      "area_nombre": "Parque Nacional Tikal",
      "latitud": 17.2221,
      "longitud": -89.6233,
      "area_descripcion": "Sitio arqueológico y reserva natural...",
      "area_extension": 57600,
      "depto_nombre": "Petén",
      "eco_nombre": "Bosque Tropical Húmedo"
    },
    {
      "area_id": "2",
      "area_nombre": "Reserva de la Biósfera Maya",
      "latitud": 17.4833,
      "longitud": -89.8167,
      "area_descripcion": "La reserva natural más grande...",
      "area_extension": 2112940,
      "depto_nombre": "Petén",
      "eco_nombre": "Bosque Tropical Húmedo"
    }
  ]
}
```

**Respuesta de Error 401:**
```json
{
  "success": false,
  "error": "Token inválido o expirado"
}
```

**Respuesta de Error 403:**
```json
{
  "success": false,
  "error": "No tienes permisos para acceder al dashboard"
}
```

---

## 🔐 Implementación de Seguridad en el Backend

### Middleware de Autenticación

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token no proporcionado'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { usr_id, usr_rol, usr_nombre, ... }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido o expirado'
    });
  }
}

module.exports = { authenticateToken };
```

### Middleware de Autorización para Dashboard

```javascript
// middleware/checkDashboardAccess.js
function checkDashboardAccess(req, res, next) {
  const userRole = req.user.usr_rol; // Viene del token JWT decodificado

  // ID de roles: Administrador = 1, Coordinador = 2, Guardarecurso = 3
  if (userRole !== 1 && userRole !== 2) {
    return res.status(403).json({
      success: false,
      error: 'No tienes permisos para acceder al dashboard'
    });
  }

  next();
}

module.exports = { checkDashboardAccess };
```

---

## 📝 Ejemplo de Implementación Completa en el Backend

### Archivo: `routes/dashboard.js`

```javascript
const express = require('express');
const router = express.Router();
const pool = require('../config/database'); // Conexión a PostgreSQL
const { authenticateToken } = require('../middleware/auth');
const { checkDashboardAccess } = require('../middleware/checkDashboardAccess');

/**
 * GET /api/dashboard/stats
 * Obtiene estadísticas del dashboard
 */
router.get('/stats', authenticateToken, checkDashboardAccess, async (req, res) => {
  try {
    // Ejecutar vista SQL
    const result = await pool.query('SELECT * FROM vista_dashboard');
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No se encontraron datos'
      });
    }

    // Retornar primera fila (la vista siempre retorna 1 fila)
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas del dashboard',
      details: error.message
    });
  }
});

/**
 * GET /api/dashboard/areas
 * Obtiene áreas protegidas activas para el mapa
 */
router.get('/areas', authenticateToken, checkDashboardAccess, async (req, res) => {
  try {
    // Ejecutar vista SQL (ya filtra por activos)
    const result = await pool.query('SELECT * FROM vista_areas_mapa_dashboard');

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al obtener áreas del dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener áreas protegidas',
      details: error.message
    });
  }
});

module.exports = router;
```

### Registro de rutas en `index.js` o `app.js`

```javascript
const express = require('express');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// ... otras configuraciones ...

// Registrar rutas del dashboard
app.use('/api/dashboard', dashboardRoutes);

// ... resto del código ...
```

---

## 🧪 Pruebas con curl

### Probar endpoint de estadísticas

```bash
curl -X GET http://localhost:3000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Probar endpoint de áreas

```bash
curl -X GET http://localhost:3000/api/dashboard/areas \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

---

## ✅ Checklist de Implementación

### Backend:
- [ ] Ejecutar `/database/vistas_dashboard_final.sql` en PostgreSQL
- [ ] Crear middleware `authenticateToken`
- [ ] Crear middleware `checkDashboardAccess`
- [ ] Implementar `GET /api/dashboard/stats`
- [ ] Implementar `GET /api/dashboard/areas`
- [ ] Registrar rutas en el servidor
- [ ] Probar endpoints con Postman o curl

### Frontend (Ya implementado ✅):
- [x] Tipos TypeScript en `/types/index.ts`
- [x] Servicio de API en `/utils/dashboardService.ts`
- [x] Componente Dashboard actualizado en `/components/Dashboard.tsx`
- [x] Manejo de estados de carga y error
- [x] Integración con base-api-service para JWT

---

## 🔍 Notas Importantes

1. **Estado "Activo" = 1**: En la BD, el estado activo tiene `std_id = 1` y `std_nombre = 'Activo'`

2. **Rol "Guardarrecurso" = 3**: En la BD, el rol guardarrecurso tiene `rl_id = 3` y `rl_nombre = 'Guardarrecurso'`

3. **Sin filtros adicionales**: La vista `vista_areas_mapa_dashboard` ya filtra por estado activo, no es necesario agregar filtros adicionales en el backend.

4. **JWT Secret**: Asegúrate de tener `JWT_SECRET` configurado en las variables de entorno del backend.

5. **CORS**: Si el frontend y backend están en diferentes dominios/puertos, configura CORS correctamente:

```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173', // URL del frontend
  credentials: true
}));
```

---

## 🚀 ¿Siguiente paso?

Una vez que implementes los endpoints en el backend, el Dashboard del frontend estará completamente funcional y conectado a la base de datos real. 

**El frontend YA está listo para consumir estos endpoints.** 🎉
