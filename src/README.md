# Sistema CONAP - Gestión de Guardarecursos

Sistema web para la gestión de guardarecursos del Consejo Nacional de Áreas Protegidas (CONAP) de Guatemala.

## 📋 Descripción

Aplicación web moderna desarrollada con React + TypeScript + Tailwind CSS para la gestión integral de guardarecursos, áreas protegidas, actividades de campo, incidentes y reportes. Sistema con arquitectura limpia, servicios centralizados y listo para integración con backend PostgreSQL.

## ✨ Características Principales

### 🔐 Sistema de Autenticación y Permisos
- Sistema de login con validación de credenciales
- 3 roles de usuario: **Administrador**, **Coordinador**, **Guardarecurso**
- Sistema de permisos granular basado en roles
- Cambio de contraseña seguro
- Funciona con datos mock (sin backend requerido)

### 📊 Módulos del Sistema

#### 1. **Gestión de Personal** (Administrador/Coordinador)
- **Dashboard**: Vista general del sistema
- **Registro de Guardarecursos**: Gestión completa de personal
- **Áreas Protegidas**: Visualización de áreas de Guatemala
- **Control de Equipos**: Asignación y seguimiento de equipos

#### 2. **Operaciones de Campo** (Todos los roles)
- **Planificación de Actividades**: Gestión de actividades programadas
- **Registro Diario de Campo**: Bitácora diaria de actividades
- **Registro Fotográfico**: Evidencias fotográficas geo-etiquetadas
- **Geolocalización de Rutas**: Seguimiento GPS de rutas

#### 3. **Control y Seguimiento** (Administrador/Coordinador)
- **Reporte de Hallazgos**: Registro de hallazgos en campo
- **Seguimiento de Cumplimiento**: Métricas y KPIs
- **Incidentes con Visitantes**: Gestión de incidentes

#### 4. **Administración** (Solo Administrador)
- **Gestión de Usuarios**: CRUD completo de usuarios y roles

### 🎨 Interfaz y UX
- Diseño moderno y responsivo
- Modo oscuro completo
- Animaciones fluidas con Motion React
- Sidebar colapsable
- Componentes reutilizables (ShadCN UI)

## 🛠️ Tecnologías

### Frontend
- **React** 18+ con TypeScript
- **Tailwind CSS** 4.0 para estilos
- **ShadCN UI** para componentes
- **Motion React** (Framer Motion) para animaciones
- **Lucide React** para iconos
- **Recharts** para gráficos
- **React Hook Form** + **Zod** para formularios

### Estado Actual (Noviembre 2024)
- ✅ Frontend 100% completo y funcional
- ✅ 17 servicios centralizados listos para backend
- ✅ 22 sistemas de estilos compartidos
- ✅ Scripts SQL completos para PostgreSQL
- ✅ Dashboard limpiado y optimizado
- 🔄 Listo para conectar con backend REST API
- 📚 Documentación esencial consolidada

## 📁 Estructura del Proyecto

```
/
├── components/              # Componentes React
│   ├── ui/                 # Componentes ShadCN UI
│   ├── Dashboard.tsx       # Dashboard principal
│   ├── Login.tsx           # Pantalla de login
│   ├── GestionUsuarios.tsx # Gestión de usuarios
│   ├── PlanificacionActividades.tsx
│   ├── RegistroDiario.tsx
│   ├── GeolocalizacionRutas.tsx
│   └── ...                 # Otros módulos (12 en total)
├── utils/
│   ├── permissions.ts      # ⭐ Sistema de permisos por roles
│   ├── actividadesSync.ts  # ⭐ Sincronización de actividades
│   ├── dashboardService.ts # ⭐ Servicio de Dashboard
│   ├── guardarecursosService.ts # ⭐ Servicio de Guardarecursos
│   ├── areasProtegidasService.ts # ⭐ Servicio de Áreas Protegidas
│   ├── equiposService.ts   # ⭐ Servicio de Control de Equipos
│   ├── actividadesService.ts # ⭐ Servicio de Actividades
│   ├── registroDiarioService.ts # ⭐ Servicio de Registro Diario
│   ├── registroFotograficoService.ts # ⭐ Servicio de Evidencias
│   ├── geolocalizacionService.ts # ⭐ Servicio de Geolocalización
│   └── README.md          # 📚 Documentación completa de servicios
├── types/
│   └── index.ts           # ⭐ Tipos TypeScript del sistema
├── data/
│   └── mock-data.ts       # ⭐ Todos los datos de ejemplo
└── styles/
    └── globals.css        # Estilos globales y temas
```

## 💾 Sistema de Datos

### Datos de Ejemplo (Mock Data)

Todo el sistema funciona con datos de ejemplo almacenados en `/data/mock-data.ts`:
- ✅ 5 áreas protegidas de Guatemala
- ✅ 18 guardarecursos de ejemplo
- ✅ 18+ actividades programadas y completadas
- ✅ Usuarios de prueba para cada rol
- ✅ Hallazgos, evidencias fotográficas, incidentes

### Sistema de Sincronización

El archivo `/utils/actividadesSync.ts` implementa un patrón Observer optimizado:
- Estado compartido entre componentes sin props drilling
- Actualizaciones en tiempo real
- Prevención de renders innecesarios
- API simple para agregar, editar y eliminar actividades

```typescript
// Ejemplo de uso
import { actividadesSync } from '../utils/actividadesSync';

// Suscribirse a cambios
useEffect(() => {
  const unsubscribe = actividadesSync.subscribe((actividades) => {
    setActividadesList(actividades);
  });
  return unsubscribe;
}, []);

// Actualizar una actividad
actividadesSync.updateActividad(id, { estado: 'Completada' });
```

## 🏗️ Arquitectura de Servicios (Separación de Responsabilidades)

El sistema implementa una **arquitectura centralizada** con 17 servicios funcionales que separan completamente la lógica de negocio de la presentación:

### Servicios Disponibles (17 servicios funcionales)

1. **`authService.ts`** - Autenticación JWT y persistencia
2. **`dashboardService.ts`** - Dashboard y estadísticas (LIMPIO)
3. **`gestionUsuariosService.ts`** - Gestión de usuarios admin
4. **`guardarecursosService.ts`** - Gestión de guardarrecursos
5. **`areasProtegidasService.ts`** - Áreas protegidas y mapas
6. **`equiposService.ts`** - Control de equipos
7. **`actividadesService.ts`** - Planificación de actividades
8. **`registroDiarioService.ts`** - Registro diario de campo
9. **`incidentesService.ts`** - Registro de incidentes
10. **`hallazgosService.ts`** - Reporte de hallazgos
11. **`registroFotograficoService.ts`** - Evidencias fotográficas
12. **`geolocalizacionService.ts`** - Geolocalización y rutas
13. **`seguimientoCumplimientoService.ts`** - Seguimiento
14. **`reporteActividadesService.ts`** - Reportes mensuales
15. **`base-api-service.ts`** - Cliente HTTP centralizado
16. **`actividadesSync.ts`** - Sincronización de actividades
17. **`permissions.ts`** - Sistema de permisos por rol

### Beneficios de la Arquitectura

✅ **Mantenibilidad**: Cambios en lógica no afectan UI  
✅ **Testabilidad**: Servicios probables independientemente  
✅ **Reutilización**: Lógica compartida entre componentes  
✅ **Escalabilidad**: Fácil agregar nuevas funcionalidades  
✅ **Claridad**: Código limpio y comprensible  

### Ejemplo de Uso

```typescript
// Antes (lógica en componente) ❌
const filteredData = data.filter(item => 
  item.nombre.includes(search) && item.estado === 'Activo'
).sort((a, b) => a.fecha - b.fecha);

// Después (usando servicio) ✅
import { registroDiarioService } from '../utils/registroDiarioService';
const filteredData = registroDiarioService.filterActividadesPorRol(
  data, search, isGuardarecurso, currentId
);
```

📚 **Documentación completa**: Ver [`/ESTADO_ACTUAL_PROYECTO.md`](./ESTADO_ACTUAL_PROYECTO.md) para estado del proyecto y [`/utils/README.md`](./utils/README.md) para servicios

## 🚀 Instalación y Desarrollo

### Requisitos
- Node.js 16+
- npm o yarn

### Instalación
```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

**¡Eso es todo!** No necesitas configurar backend, base de datos ni servicios externos. La aplicación funciona completamente con datos de ejemplo.

## 👥 Usuarios de Prueba

El sistema incluye usuarios de ejemplo listos para usar:

```typescript
// Administrador (acceso completo)
email: "admin@conap.gob.gt"
password: "admin123"

// Coordinador (acceso a gestión y reportes)
email: "coordinador@conap.gob.gt"
password: "coord123"

// Guardarecurso (acceso a operaciones de campo)
email: "guarda@conap.gob.gt"
password: "guarda123"
```

Los datos están definidos en `/data/mock-data.ts`.

## 📝 Personalización

### Cambiar Permisos por Rol

Edita `/utils/permissions.ts`:

```typescript
export const MODULE_PERMISSIONS = {
  'modulo-id': {
    Administrador: { canView: true, canEdit: true, canDelete: true },
    Coordinador: { canView: true, canEdit: true, canDelete: false },
    Guardarecurso: { canView: false, canEdit: false, canDelete: false }
  }
}
```

### Agregar Nuevo Módulo

1. Crear componente en `/components/MiModulo.tsx`
2. Agregar al menú en `/App.tsx` en `navigationCategories`
3. Agregar permisos en `/utils/permissions.ts`
4. Agregar caso en el `renderContent()` de `/App.tsx`

### Modificar Datos de Ejemplo

Edita `/data/mock-data.ts` para agregar o modificar datos:

```typescript
// Agregar nueva área protegida
export const areasProtegidas: AreaProtegida[] = [
  {
    id: '6',
    nombre: 'Mi Nueva Área',
    categoria: 'Reserva Natural',
    departamento: 'Guatemala',
    extension: 5000,
    // ...
  }
];
```

## 🎨 Temas y Estilos

### Modo Oscuro
El sistema incluye modo oscuro completo. El usuario puede cambiar entre temas con el botón en el header.

### Personalizar Colores
Edita `/styles/globals.css`:

```css
:root {
  --color-primary: /* tu color */;
  --color-secondary: /* tu color */;
}
```

## 🔒 Seguridad

### Autenticación
- Sistema de login con validación de credenciales
- Sesión almacenada en `localStorage`
- Cierre de sesión seguro

### Permisos
- Sistema granular de permisos por rol definido en `/utils/permissions.ts`
- Validación en frontend basada en roles
- Control de acceso a nivel de módulo y operación (ver, crear, editar, eliminar)
- ⚠️ **Nota**: En producción con backend real, validar permisos también en servidor

## 📚 Documentación del Proyecto

### Documentación Principal
- **[ESTADO_ACTUAL_PROYECTO.md](./ESTADO_ACTUAL_PROYECTO.md)** - Estado completo del proyecto
- **[DASHBOARD_RESUMEN.md](./DASHBOARD_RESUMEN.md)** - Resumen del Dashboard limpiado
- **[RESUMEN_LIMPIEZA.md](./RESUMEN_LIMPIEZA.md)** - Detalles de la limpieza realizada
- **[ARCHITECTURE_STATUS.md](./ARCHITECTURE_STATUS.md)** - Estado de arquitectura
- **[CENTRALIZATION_COMPLETE.md](./CENTRALIZATION_COMPLETE.md)** - Centralización completa

### Documentación Técnica
- **[/utils/README.md](./utils/README.md)** - Documentación de servicios
- **[/utils/BASE_API_GUIDE.md](./utils/BASE_API_GUIDE.md)** - Guía del cliente HTTP
- **[/utils/DASHBOARD_API.md](./utils/DASHBOARD_API.md)** - Endpoints del Dashboard
- **[/utils/SESSION_PERSISTENCE_GUIDE.md](./utils/SESSION_PERSISTENCE_GUIDE.md)** - Persistencia JWT
- **[/database/](./database/)** - Scripts SQL para PostgreSQL

### Estado del Código
✅ **Código limpio y optimizado**
- Sin código duplicado
- Sin archivos innecesarios
- Documentación consolidada
- Servicios bien organizados
- Estilos centralizados

## 📦 Build para Producción

```bash
# Crear build optimizado
npm run build

# La carpeta dist/ contendrá los archivos estáticos
```

## 🤝 Contribuir

Este es un proyecto interno de CONAP. Para contribuir, contacta al equipo de desarrollo.

## 📄 Licencia

Propiedad del Consejo Nacional de Áreas Protegidas (CONAP) de Guatemala.

---

**Desarrollado para CONAP Guatemala** 🇬🇹 🌳
