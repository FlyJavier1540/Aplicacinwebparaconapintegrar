# 📑 ÍNDICE DEL PROYECTO CONAP

**Fecha:** 5 de noviembre de 2024  
**Estado:** Post-limpieza Dashboard

---

## 🎯 DOCUMENTACIÓN PRINCIPAL

### **Empezar aquí:**
1. 📖 **[README.md](./README.md)** → Descripción general del proyecto
2. 🏗️ **[ESTADO_ACTUAL_PROYECTO.md](./ESTADO_ACTUAL_PROYECTO.md)** → Estado completo y detallado
3. ✅ **[LIMPIEZA_COMPLETADA.md](./LIMPIEZA_COMPLETADA.md)** → Resumen de limpieza

### **Información específica:**
- 📊 **[DASHBOARD_RESUMEN.md](./DASHBOARD_RESUMEN.md)** → Dashboard limpiado
- 🧹 **[RESUMEN_LIMPIEZA.md](./RESUMEN_LIMPIEZA.md)** → Detalles de limpieza
- 🏛️ **[ARCHITECTURE_STATUS.md](./ARCHITECTURE_STATUS.md)** → Estado arquitectura
- 🎨 **[CENTRALIZATION_COMPLETE.md](./CENTRALIZATION_COMPLETE.md)** → Centralización
- 🔍 **[AUDIT_RESULTS.md](./AUDIT_RESULTS.md)** → Auditoría completa

---

## 💻 CÓDIGO FUENTE

### **Componentes React** (`/components/`)

#### **Sistema:**
- `Dashboard.tsx` - Dashboard principal (LIMPIO - 253 líneas)
- `Login.tsx` - Pantalla de login con JWT
- `ThemeProvider.tsx` - Proveedor de tema (modo oscuro)
- `ThemeToggle.tsx` - Toggle de tema

#### **Gestión de Personal:**
- `GestionUsuarios.tsx` - CRUD usuarios admin
- `RegistroGuardarecursos.tsx` - CRUD guardarrecursos
- `AsignacionZonas.tsx` - Asignación de áreas
- `ControlEquipos.tsx` - Control de equipos

#### **Operaciones de Campo:**
- `PlanificacionActividades.tsx` - Planificación actividades
- `RegistroDiario.tsx` - Registro diario de campo
- `RegistroIncidentes.tsx` - Registro de incidentes
- `ReporteHallazgos.tsx` - Reporte hallazgos
- `EvidenciasFotograficas.tsx` - Evidencias fotográficas
- `FormularioFotografia.tsx` - Formulario de fotos

#### **Control y Seguimiento:**
- `GeolocalizacionRutas.tsx` - Geolocalización y rutas
- `SeguimientoCumplimiento.tsx` - Seguimiento cumplimiento
- `ReporteActividadesMensual.tsx` - Reporte mensual

#### **Utilidades de UI:**
- `MapaAreasProtegidas.tsx` - Mapa interactivo
- `AreaProtegidaDetalle.tsx` - Detalle de área
- `CambiarContrasena.tsx` - Cambio password usuario
- `CambiarContrasenaAdmin.tsx` - Cambio password admin

#### **Componentes UI** (`/components/ui/`)
- 38 componentes de ShadCN (accordion, alert, badge, button, etc.)

---

### **Servicios** (`/utils/`)

#### **Core:**
- `base-api-service.ts` - Cliente HTTP centralizado (GET, POST, PUT, PATCH, DELETE)
- `authService.ts` - Autenticación JWT y persistencia de sesión
- `permissions.ts` - Sistema de permisos por rol
- `actividadesSync.ts` - Sincronización de actividades en memoria

#### **Servicios de Módulos:**
- `dashboardService.ts` - Dashboard (LIMPIO - 194 líneas)
- `gestionUsuariosService.ts` - Gestión usuarios
- `guardarecursosService.ts` - Guardarrecursos
- `areasProtegidasService.ts` - Áreas protegidas
- `equiposService.ts` - Control equipos
- `actividadesService.ts` - Actividades
- `registroDiarioService.ts` - Registro diario
- `incidentesService.ts` - Incidentes
- `hallazgosService.ts` - Hallazgos
- `registroFotograficoService.ts` - Evidencias fotográficas
- `geolocalizacionService.ts` - Geolocalización
- `seguimientoCumplimientoService.ts` - Seguimiento
- `reporteActividadesService.ts` - Reportes

#### **Helpers:**
- `constants.ts` - Constantes del sistema
- `formatters.ts` - Formateadores de datos
- `hooks.ts` - Custom hooks
- `pdfHelpers.ts` - Generación de PDFs
- `selectOptions.tsx` - Opciones de selects
- `validators.ts` - Validaciones

---

### **Estilos** (`/styles/`)

- `globals.css` - Estilos base y configuración de tema
- `shared-styles.ts` - 22 sistemas de estilos compartidos:
  1. cardStyles
  2. buttonStyles
  3. badgeStyles
  4. iconStyles
  5. textStyles
  6. layoutStyles
  7. animationStyles
  8. dashboardStyles
  9. filterStyles
  10. imageStyles
  11. timelineStyles
  12. modalStyles
  13. formStyles
  14. tableStyles
  15. tabStyles
  16. loginStyles
  17. passwordFormStyles
  18. mapStyles
  19. detailCardStyles
  20. estadoStyles
  21. radarStyles
  22. equipoStyles

---

### **Types** (`/types/`)

- `index.ts` - Todas las interfaces TypeScript del sistema

---

### **Datos** (`/data/`)

- `mock-data.ts` - Datos de ejemplo para desarrollo

---

## 🗄️ BASE DE DATOS (`/database/`)

### **Scripts SQL:**

1. **Dashboard:**
   - `vistas_dashboard_final.sql` - Vistas del Dashboard
     - Vista: `vista_dashboard`
     - Vista: `vista_areas_mapa_dashboard`

2. **Gestión de Usuarios:**
   - `gestion_usuarios.sql` - Módulo usuarios
     - Vista: `vista_gestion_usuarios`
     - Procedimientos: CRUD completo

3. **Registro de Guardarecursos:**
   - `registro_guardarecursos.sql` - Módulo guardarrecursos
     - Vista: `vista_registro_guardarecursos`
     - Procedimientos: CRUD completo

4. **Áreas Protegidas:**
   - `areas_protegidas.sql` - Módulo áreas
     - Vista: `vista_areas_protegidas`
     - Vista: `vista_asignaciones_zonas`
     - Procedimientos: CRUD y asignación

5. **Control de Equipos:**
   - `control_equipos.sql` - Módulo equipos
     - Vista: `vista_control_equipos` (Admin/Coordinador)
     - Función: `fn_obtener_equipos_guardarrecurso(id)` (Guardarrecurso)
     - Procedimientos: CRUD completo

6. **Registro de Incidentes:**
   - `registro_incidentes.sql` - Módulo incidentes
     - Vista: `vista_incidentes_activos_admin`
     - Vista: `vista_incidentes_resueltos_admin`
     - Función: `fn_obtener_incidentes_activos_guardarrecurso(id)`
     - Procedimientos: CRUD, cambio estado, seguimiento

7. **Documentación:**
   - Archivos complementarios (NUEVO):
     - `MAPEO_CAMPOS_CONTROL_EQUIPOS.txt`
     - `README_CONTROL_EQUIPOS.md`
     - `MAPEO_CAMPOS_REGISTRO_INCIDENTES.txt`
     - `README_INCIDENTES.md`
     - `VERIFICACION_VISTAS_UI_INCIDENTES.md`
     - `RESUMEN_INCIDENTES.md`

---

## 📚 DOCUMENTACIÓN TÉCNICA (`/utils/`)

### **Guías Esenciales:**

1. **[README.md](./utils/README.md)** - Overview de servicios
2. **[BASE_API_GUIDE.md](./utils/BASE_API_GUIDE.md)** - Cliente HTTP
3. **[DASHBOARD_API.md](./utils/DASHBOARD_API.md)** - Endpoints Dashboard
4. **[SESSION_PERSISTENCE_GUIDE.md](./utils/SESSION_PERSISTENCE_GUIDE.md)** - Persistencia JWT
5. **[SELECT_OPTIONS_USAGE.md](./utils/SELECT_OPTIONS_USAGE.md)** - Uso de selects
6. **[SERVICES_ARCHITECTURE.md](./utils/SERVICES_ARCHITECTURE.md)** - Arquitectura
7. **[SERVICES_COMPLETE.md](./utils/SERVICES_COMPLETE.md)** - Lista completa servicios

---

## 📖 GUÍAS DE ESTILOS (`/styles/`)

- **[TABS_USAGE.md](./styles/TABS_USAGE.md)** - Guía de uso de tabs

---

## 🎯 NAVEGACIÓN RÁPIDA POR TAREA

### **🆕 Nuevo en el proyecto:**
```
1. README.md
2. ESTADO_ACTUAL_PROYECTO.md
3. DASHBOARD_QUICK_START.md
```

### **🔧 Implementar backend:**
```
1. utils/BASE_API_GUIDE.md (entender cliente HTTP)
2. utils/DASHBOARD_API.md (endpoints Dashboard)
3. database/vistas_dashboard_final.sql (ejecutar en PostgreSQL)
```

### **📊 Trabajar en Dashboard:**
```
1. DASHBOARD_RESUMEN.md (resumen)
2. components/Dashboard.tsx (código)
3. utils/dashboardService.ts (lógica)
4. utils/DASHBOARD_API.md (especificación API)
```

### **🗄️ Configurar base de datos:**
```
1. database/vistas_dashboard_final.sql
2. database/gestion_usuarios.sql
3. database/registro_guardarecursos.sql
4. database/areas_protegidas.sql
5. database/control_equipos.sql
6. database/registro_incidentes.sql
```

### **🎨 Modificar estilos:**
```
1. styles/shared-styles.ts (sistemas compartidos)
2. styles/globals.css (tema y base)
```

### **🔐 Sistema de permisos:**
```
1. utils/permissions.ts (lógica permisos)
2. utils/authService.ts (autenticación)
```

### **🧪 Testing:**
```
1. Servicios en /utils/*Service.ts (unit tests)
2. Componentes en /components/*.tsx (integration tests)
```

---

## 🔍 BUSCAR INFORMACIÓN

### **Por Módulo:**

| Módulo | Componente | Servicio | Script SQL | Docs |
|--------|------------|----------|------------|------|
| Dashboard | Dashboard.tsx | dashboardService.ts | vistas_dashboard_final.sql | DASHBOARD_RESUMEN.md |
| Usuarios | GestionUsuarios.tsx | gestionUsuariosService.ts | gestion_usuarios.sql | - |
| Guardarecursos | RegistroGuardarecursos.tsx | guardarecursosService.ts | registro_guardarecursos.sql | - |
| Áreas | AsignacionZonas.tsx | areasProtegidasService.ts | areas_protegidas.sql | - |
| Equipos | ControlEquipos.tsx | equiposService.ts | control_equipos.sql | README_CONTROL_EQUIPOS.md |
| Actividades | PlanificacionActividades.tsx | actividadesService.ts | - | - |
| Registro Diario | RegistroDiario.tsx | registroDiarioService.ts | - | - |
| Incidentes | RegistroIncidentes.tsx | incidentesService.ts | registro_incidentes.sql | README_INCIDENTES.md |
| Hallazgos | ReporteHallazgos.tsx | hallazgosService.ts | - | - |
| Evidencias | EvidenciasFotograficas.tsx | registroFotograficoService.ts | - | - |
| Geolocalización | GeolocalizacionRutas.tsx | geolocalizacionService.ts | - | - |
| Seguimiento | SeguimientoCumplimiento.tsx | seguimientoCumplimientoService.ts | - | - |
| Reportes | ReporteActividadesMensual.tsx | reporteActividadesService.ts | - | - |

---

## 📋 ARCHIVOS POR CATEGORÍA

### **1. Documentación General (9):**
```
README.md
ESTADO_ACTUAL_PROYECTO.md
LIMPIEZA_COMPLETADA.md
DASHBOARD_RESUMEN.md
RESUMEN_LIMPIEZA.md
ARCHITECTURE_STATUS.md
CENTRALIZATION_COMPLETE.md
AUDIT_RESULTS.md
Attributions.md
```

### **2. Guías Rápidas (2):**
```
DASHBOARD_QUICK_START.md
INDICE_PROYECTO.md (este archivo)
```

### **3. Código React (26 componentes):**
```
components/Dashboard.tsx
components/Login.tsx
components/GestionUsuarios.tsx
... (ver sección completa arriba)
```

### **4. Servicios (17):**
```
utils/base-api-service.ts
utils/authService.ts
utils/dashboardService.ts
... (ver sección completa arriba)
```

### **5. Helpers (7):**
```
utils/constants.ts
utils/formatters.ts
utils/hooks.ts
utils/pdfHelpers.ts
utils/selectOptions.tsx
utils/validators.ts
utils/supabase/info.tsx
```

### **6. Estilos (3):**
```
styles/globals.css
styles/shared-styles.ts
styles/TABS_USAGE.md
```

### **7. Base de Datos (6 scripts + docs):**
```
database/vistas_dashboard_final.sql
database/gestion_usuarios.sql
database/registro_guardarecursos.sql
database/areas_protegidas.sql
database/control_equipos.sql
database/registro_incidentes.sql
+ archivos de documentación
```

### **8. Documentación Técnica (7):**
```
utils/README.md
utils/BASE_API_GUIDE.md
utils/DASHBOARD_API.md
utils/SESSION_PERSISTENCE_GUIDE.md
utils/SELECT_OPTIONS_USAGE.md
utils/SERVICES_ARCHITECTURE.md
utils/SERVICES_COMPLETE.md
```

### **9. Types (1):**
```
types/index.ts
```

### **10. Datos (1):**
```
data/mock-data.ts
```

### **11. Componentes UI (38):**
```
components/ui/*.tsx (ShadCN)
```

---

## 🎯 TOTAL DE ARCHIVOS

```
📊 Estadística General:
─────────────────────────────────────
📄 Documentación:     ~20 archivos
💻 Código React:      ~65 archivos
🛠️ Servicios:         17 archivos
🎨 Estilos:           2 archivos
🗄️ Base de Datos:     ~15 archivos
─────────────────────────────────────
📦 TOTAL:            ~119 archivos
```

---

## 🚀 FLUJO DE TRABAJO RECOMENDADO

### **1. Para Desarrolladores Frontend:**
```
1. Leer README.md
2. Revisar components/Dashboard.tsx (ejemplo)
3. Revisar utils/dashboardService.ts (ejemplo)
4. Leer utils/BASE_API_GUIDE.md
5. Empezar a desarrollar
```

### **2. Para Desarrolladores Backend:**
```
1. Leer ESTADO_ACTUAL_PROYECTO.md
2. Revisar utils/DASHBOARD_API.md (especificación)
3. Ejecutar database/vistas_dashboard_final.sql
4. Implementar endpoints
5. Probar con frontend
```

### **3. Para Desarrolladores Full Stack:**
```
1. Leer README.md
2. Ejecutar scripts SQL
3. Implementar endpoints backend
4. Conectar frontend con backend
5. Testing completo
```

---

## 📞 SOPORTE

### **Documentación Completa:**
- Estado del proyecto: `ESTADO_ACTUAL_PROYECTO.md`
- Arquitectura: `ARCHITECTURE_STATUS.md`
- Servicios: `utils/SERVICES_ARCHITECTURE.md`

### **Guías Rápidas:**
- Dashboard: `DASHBOARD_QUICK_START.md`
- Cliente HTTP: `utils/BASE_API_GUIDE.md`
- Persistencia JWT: `utils/SESSION_PERSISTENCE_GUIDE.md`

---

**Última actualización:** 5 de noviembre de 2024  
**Versión:** Post-limpieza Dashboard  
**Estado:** ✅ Completo y actualizado
