# 🔐 Configuración de Variables de Entorno - CONAP

Este documento explica cómo configurar y utilizar las variables de entorno del sistema CONAP.

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Archivos de Configuración](#archivos-de-configuración)
3. [Variables Disponibles](#variables-disponibles)
4. [Configuración Inicial](#configuración-inicial)
5. [Actualización de Variables](#actualización-de-variables)
6. [Seguridad](#seguridad)
7. [Troubleshooting](#troubleshooting)

---

## 📖 Introducción

El sistema CONAP utiliza variables de entorno para almacenar configuraciones sensibles y específicas del entorno. Esto permite:

- ✅ Separar configuración de código
- ✅ Mantener secretos seguros
- ✅ Facilitar el despliegue en diferentes entornos
- ✅ Evitar hardcodear valores sensibles

---

## 📁 Archivos de Configuración

### `.env`
- **Ubicación**: Raíz del proyecto
- **Propósito**: Contiene las variables reales con valores sensibles
- **Git**: ❌ NO versionar (está en `.gitignore`)
- **Uso**: Solo local y en el servidor de producción

### `.env.example`
- **Ubicación**: Raíz del proyecto
- **Propósito**: Plantilla con todas las variables necesarias (sin valores sensibles)
- **Git**: ✅ SÍ versionar (es seguro)
- **Uso**: Referencia para saber qué variables configurar

---

## 🔑 Variables Disponibles

### 🗄️ Supabase - Base de Datos

| Variable | Descripción | Ejemplo | Dónde se usa |
|----------|-------------|---------|--------------|
| `SUPABASE_URL` | URL del proyecto Supabase | `https://xxx.supabase.co` | Backend + Frontend |
| `SUPABASE_ANON_KEY` | Clave pública (anon) | `eyJhbGci...` | Frontend |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada (admin) | `eyJhbGci...` | Solo Backend |
| `SUPABASE_DB_URL` | URL de PostgreSQL | `postgresql://postgres:...` | Backend (opcional) |

**⚠️ IMPORTANTE:** 
- `SERVICE_ROLE_KEY` NUNCA debe exponerse al frontend
- Solo se usa en Edge Functions (backend)

### 🗺️ Google Maps

| Variable | Descripción | Ejemplo | Dónde se usa |
|----------|-------------|---------|--------------|
| `VITE_GOOGLE_MAPS_API_KEY` | API Key de Google Maps | `AIzaSyC...` | Frontend |

**📌 Nota:** Variables con prefijo `VITE_` están disponibles en el frontend

### 🔐 Autenticación y Seguridad

| Variable | Descripción | Valor por Defecto | Editable |
|----------|-------------|-------------------|----------|
| `JWT_DURATION_MS` | Duración del JWT (ms) | `86400000` (24h) | ✅ |
| `PASSWORD_SALT` | Salt para contraseñas | `ConApGuatemala...` | ⚠️ No cambiar en producción |
| `BCRYPT_ROUNDS` | Rondas de encriptación | `10` | ✅ |
| `MIN_PASSWORD_LENGTH` | Long. mínima contraseña | `6` | ✅ |

**⚠️ SEGURIDAD:**
- `PASSWORD_SALT`: NO cambiar después de crear usuarios (invalidaría contraseñas)
- `BCRYPT_ROUNDS`: 8-12 recomendado (mayor = más seguro pero más lento)

### 🌍 Configuración Regional

| Variable | Descripción | Valor |
|----------|-------------|-------|
| `TIMEZONE` | Zona horaria | `America/Guatemala` |
| `TIMEZONE_OFFSET` | Offset GMT | `-6` |
| `LOCALE` | Idioma/región | `es-GT` |

### 🔧 Configuración de Aplicación

| Variable | Descripción | Valor |
|----------|-------------|-------|
| `APP_NAME` | Nombre de la app | `CONAP - Gestión de Guardarecursos` |
| `APP_VERSION` | Versión | `1.0.0` |
| `NODE_ENV` | Entorno | `production` / `development` |

### 📊 Límites y Paginación

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `DEFAULT_PAGE_SIZE` | Registros por página | `10` |
| `MAX_FILE_SIZE_MB` | Tamaño máx. archivos | `10` |
| `MAX_GPS_POINTS_PER_ROUTE` | Puntos GPS por ruta | `1000` |

### 🗺️ Configuración de Mapas

| Variable | Descripción | Valor |
|----------|-------------|-------|
| `DEFAULT_MAP_CENTER_LAT` | Latitud centro Guatemala | `15.5` |
| `DEFAULT_MAP_CENTER_LNG` | Longitud centro Guatemala | `-90.25` |
| `DEFAULT_MAP_ZOOM` | Zoom mapa principal | `7` |
| `AREA_MAP_ZOOM` | Zoom área protegida | `13` |
| `ROUTE_MAP_ZOOM` | Zoom ruta patrullaje | `15` |

---

## 🚀 Configuración Inicial

### Paso 1: Copiar plantilla

```bash
cp .env.example .env
```

### Paso 2: Completar variables obligatorias

Abre `.env` y completa:

1. **Supabase** (obtener de https://app.supabase.com):
   ```env
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_ANON_KEY=eyJ... (copiar de Supabase Settings > API)
   SUPABASE_SERVICE_ROLE_KEY=eyJ... (copiar de Supabase Settings > API)
   ```

2. **Google Maps** (obtener de https://console.cloud.google.com):
   ```env
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyC... (copiar de Google Cloud Console)
   ```

### Paso 3: Verificar configuración

Las demás variables ya tienen valores por defecto razonables.

---

## 🔄 Actualización de Variables

### En Desarrollo Local

1. Edita el archivo `.env`
2. Reinicia el servidor de desarrollo
3. Limpia la caché del navegador si es necesario

```bash
# Detener servidor
Ctrl + C

# Reiniciar
npm run dev
```

### En Producción (Supabase/Vercel/etc)

1. Ve al panel de tu plataforma de hosting
2. Encuentra la sección de "Environment Variables" o "Variables de Entorno"
3. Agrega/actualiza las variables necesarias
4. Redespliega la aplicación

**Ejemplo en Supabase Edge Functions:**
```bash
supabase secrets set SUPABASE_URL=https://...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 🔒 Seguridad

### ✅ Buenas Prácticas

1. **NUNCA** subir `.env` a Git
   - Verificar que está en `.gitignore`
   
2. **NUNCA** compartir variables sensibles
   - `SERVICE_ROLE_KEY`
   - `PASSWORD_SALT`
   - `JWT secrets`

3. **Rotar claves regularmente**
   - Google Maps API Key cada 6-12 meses
   - Supabase Keys si hay sospecha de compromiso

4. **Usar diferentes valores por entorno**
   ```
   .env.development  → Desarrollo local
   .env.staging      → Servidor de pruebas
   .env.production   → Producción
   ```

5. **Verificar permisos de archivos**
   ```bash
   chmod 600 .env  # Solo lectura/escritura para el propietario
   ```

### ⚠️ Variables Sensibles

Estas variables **NUNCA** deben exponerse al frontend:

- ❌ `SUPABASE_SERVICE_ROLE_KEY`
- ❌ `PASSWORD_SALT`
- ❌ `SUPABASE_DB_URL`
- ❌ Cualquier variable sin prefijo `VITE_`

### ✅ Variables Públicas (Frontend)

Solo las variables con prefijo `VITE_` se exponen al frontend:

- ✅ `VITE_GOOGLE_MAPS_API_KEY`

---

## 🔍 Cómo Usar Variables en el Código

### En el Frontend (React)

```typescript
// ✅ Correcto - Variable con prefijo VITE_
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// ❌ Incorrecto - No funcionará en frontend
const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY; // undefined
```

### En el Backend (Supabase Edge Functions)

```typescript
// ✅ Correcto - Usar Deno.env.get()
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
```

### En archivos TypeScript de servicios

```typescript
// Importar desde el archivo centralizado
import { projectId, publicAnonKey } from './utils/supabase/info';

// O acceder directamente a variables VITE_
const mapsKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
```

---

## 🐛 Troubleshooting

### Problema: "Variables de entorno no definidas"

**Solución:**
1. Verificar que el archivo `.env` existe
2. Verificar que las variables tienen el prefijo correcto (`VITE_` para frontend)
3. Reiniciar el servidor de desarrollo
4. Limpiar caché: `rm -rf node_modules/.vite`

### Problema: "Google Maps no carga"

**Solución:**
1. Verificar que `VITE_GOOGLE_MAPS_API_KEY` está definida
2. Verificar que la API key es válida en Google Cloud Console
3. Verificar que Maps JavaScript API está habilitado
4. Verificar restricciones de dominio en la API key

### Problema: "Error de autenticación en Supabase"

**Solución:**
1. Verificar que `SUPABASE_URL` y `SUPABASE_ANON_KEY` son correctos
2. En backend, verificar que `SUPABASE_SERVICE_ROLE_KEY` es correcto
3. Verificar que las keys no tienen espacios extra al inicio/final

### Problema: "Password Salt cambió y usuarios no pueden iniciar sesión"

**⚠️ CRÍTICO:**
- Si cambiaste `PASSWORD_SALT` después de crear usuarios, debes:
  1. Restaurar el valor original de `PASSWORD_SALT`
  2. O resetear todas las contraseñas de usuarios en la BD

---

## 📝 Checklist de Configuración

### Desarrollo Local
- [ ] Copiar `.env.example` a `.env`
- [ ] Configurar `SUPABASE_URL`
- [ ] Configurar `SUPABASE_ANON_KEY`
- [ ] Configurar `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Configurar `VITE_GOOGLE_MAPS_API_KEY`
- [ ] Verificar que `.env` está en `.gitignore`
- [ ] Reiniciar servidor de desarrollo

### Producción
- [ ] Configurar todas las variables en el hosting
- [ ] Usar `PASSWORD_SALT` único y seguro
- [ ] Rotar `SUPABASE_SERVICE_ROLE_KEY` si es necesario
- [ ] Configurar restricciones de dominio en Google Maps API
- [ ] Verificar que `NODE_ENV=production`
- [ ] Redesplegar aplicación

---

## 🔗 Enlaces Útiles

- [Supabase Dashboard](https://app.supabase.com)
- [Google Cloud Console](https://console.cloud.google.com)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase Edge Functions Secrets](https://supabase.com/docs/guides/functions/secrets)

---

## 📞 Soporte

Si tienes problemas con la configuración:

1. Revisa este documento
2. Verifica los logs de consola (frontend y backend)
3. Contacta al equipo de desarrollo

---

**Última actualización:** Noviembre 2024  
**Versión:** 1.0.0
