# 🗺️ Configuración de Google Maps en Dashboard

**Fecha:** 10 de noviembre de 2025  
**Estado:** ✅ IMPLEMENTADO

## 🎯 Cambios Realizados

### Componente MapaAreasProtegidas Actualizado

El componente `MapaAreasProtegidas.tsx` ha sido completamente reescrito para usar **Google Maps API** en lugar del mapa SVG estático.

---

## 📋 Características del Nuevo Mapa

### ✨ Funcionalidades

1. **Mapa Interactivo de Google Maps**
   - Zoom, pan, y navegación completa
   - Vista satelital disponible (si se habilita)
   - Controles de zoom integrados

2. **Marcadores Dinámicos**
   - 🟢 Verde (`#0a9605ff`) para áreas no seleccionadas
   - 🟠 Naranja (`#fa9715ff`) para el área seleccionada
   - Borde amarillo (`#fff700ff`) para mejor visibilidad
   - Tooltip con nombre del área al hacer hover

3. **Modos de Visualización**
   - **Modo Normal**: Vista general de todas las áreas (zoom 8)
   - **Modo Centrado**: Enfocado en un área específica (zoom 12)
   - Ajuste automático de tamaño de marcadores según el modo

4. **Compatibilidad con Tema Oscuro**
   - Estilos adaptativos según el tema
   - Loading spinner temático
   - Bordes y texto con contraste adecuado

---

## 🔑 Configuración de Google Maps API Key

### Paso 1: Obtener la API Key

1. Ve a [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - **Maps JavaScript API**
   - **Geocoding API** (opcional, para futuras funcionalidades)
4. Ve a "Credenciales" y crea una API Key
5. **IMPORTANTE**: Restringe la API Key por:
   - **Restricciones HTTP**: Agrega tus dominios permitidos
   - **Restricciones de API**: Limita solo a Maps JavaScript API

### Paso 2: Configurar la Variable de Entorno

#### Opción A: Archivo `.env` (Desarrollo Local)

Crea un archivo `.env` en la raíz del proyecto:

```bash
# .env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyC1XVfrE8CmVg3nhd-6Sps087JmARuSNWc
```

**Nota:** Reemplaza con tu propia API key.

#### Opción B: Variables de Entorno en Producción

Si despliegas en Vercel, Netlify, u otra plataforma:

1. Ve a la configuración de variables de entorno
2. Agrega: `VITE_GOOGLE_MAPS_API_KEY` con tu API key
3. Redespliega la aplicación

### Paso 3: Verificar la Configuración

El componente tiene un **fallback** integrado:

```typescript
const { isLoaded } = useJsApiLoader({
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyC1XVfrE8CmVg3nhd-6Sps087JmARuSNWc',
});
```

- Si `VITE_GOOGLE_MAPS_API_KEY` existe, la usa
- Si no, usa la API key de fallback (solo para desarrollo)

---

## 📊 Uso en el Dashboard

### Integración Actual

El Dashboard ya está configurado para usar el mapa:

```typescript
<MapaAreasProtegidas 
  areas={areas} 
  onAreaSelect={handleAreaSelect}
  selectedAreaId={selectedArea?.id}
  title="Áreas Protegidas de Guatemala"
  showLegend={false}
/>
```

### Props del Componente

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `areas` | `AreaProtegida[]` | **Requerido** | Array de áreas a mostrar |
| `onAreaSelect` | `(area: AreaProtegida) => void` | **Requerido** | Callback al seleccionar área |
| `selectedAreaId` | `string \| null` | `undefined` | ID del área seleccionada |
| `title` | `string` | `'Mapa de Áreas Protegidas'` | Título del card |
| `className` | `string` | `''` | Clases CSS adicionales |
| `showLegend` | `boolean` | `true` | *Mantenido por compatibilidad* |
| `centered` | `boolean` | `false` | Centrar en área específica |

---

## 🎨 Personalización de Marcadores

### Colores Actuales

```typescript
icon={{
  path: window.google.maps.SymbolPath.CIRCLE,
  fillColor: selectedAreaId === area.id ? '#fa9715ff' : '#0a9605ff',
  fillOpacity: 1,
  strokeColor: '#fff700ff',
  strokeWeight: 2,
  scale: centered ? 10 : 7,
}}
```

### Modificar Colores

Para cambiar los colores, edita el componente:

```typescript
// Color del área seleccionada (naranja)
fillColor: selectedAreaId === area.id ? '#fa9715ff' : '#0a9605ff',
                                          ↑ Cambiar aquí

// Color de áreas no seleccionadas (verde)
fillColor: selectedAreaId === area.id ? '#fa9715ff' : '#0a9605ff',
                                                         ↑ Cambiar aquí

// Color del borde (amarillo)
strokeColor: '#fff700ff',
              ↑ Cambiar aquí
```

---

## 🔧 Opciones Avanzadas del Mapa

### Configuración Actual

```typescript
options={{ 
  mapTypeControl: false,      // Sin selector de tipo de mapa
  streetViewControl: false,   // Sin Street View
  fullscreenControl: false,   // Sin pantalla completa
  zoomControl: true,          // Con controles de zoom
  styles: [
    {
      featureType: 'poi',     // Ocultar puntos de interés
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
}}
```

### Habilitar Controles Adicionales

Para agregar más funcionalidades, modifica las opciones:

```typescript
options={{ 
  mapTypeControl: true,          // ✅ Selector de vista (mapa/satélite)
  streetViewControl: true,       // ✅ Street View
  fullscreenControl: true,       // ✅ Pantalla completa
  zoomControl: true,
  mapTypeControlOptions: {
    style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU
  }
}}
```

---

## 📱 Responsividad

El mapa es completamente responsive:

### Móvil (< 640px)
- Padding: `p-2` (8px)
- Marcadores: Escala 7
- Header compacto

### Tablet (640px - 1024px)
- Padding: `p-3` (12px)
- Marcadores: Escala 7

### Desktop (> 1024px)
- Padding: `p-4` (16px)
- Marcadores: Escala 7
- Marcadores centrados: Escala 10

---

## 🚀 Estado de Carga

### Loading Spinner

Mientras se carga Google Maps API:

```tsx
<div className="flex items-center justify-center h-full">
  <div className="text-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 dark:border-green-400 mx-auto mb-3"></div>
    <p className="text-sm text-gray-500 dark:text-gray-400">Cargando mapa...</p>
  </div>
</div>
```

### Verificar si Cargó

```typescript
const { isLoaded } = useJsApiLoader({
  googleMapsApiKey: 'YOUR_API_KEY'
});

if (!isLoaded) {
  return <LoadingSpinner />;
}
```

---

## 🐛 Troubleshooting

### Problema: El mapa no carga

**Solución 1:** Verificar API Key
```bash
# Verificar que la variable de entorno existe
echo $VITE_GOOGLE_MAPS_API_KEY

# O en el navegador
console.log(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
```

**Solución 2:** Verificar restricciones de API
- Ve a Google Cloud Console
- Verifica que tu dominio está en la lista de permitidos
- Verifica que Maps JavaScript API está habilitada

**Solución 3:** Verificar errores en consola
```javascript
// Abrir consola del navegador (F12)
// Buscar errores de Google Maps API
```

### Problema: Marcadores no aparecen

**Verificar coordenadas:**
```typescript
// Las coordenadas deben tener lat y lng válidos
area.coordenadas.lat  // Entre -90 y 90
area.coordenadas.lng  // Entre -180 y 180
```

**Para Guatemala:**
- Latitud: ~13° a 18° Norte
- Longitud: ~88° a 92° Oeste (valor negativo)

### Problema: "RefererNotAllowedMapError"

**Solución:** Agregar tu dominio a las restricciones HTTP:
1. Ve a Google Cloud Console → Credenciales
2. Edita tu API Key
3. En "Restricciones de aplicación" → "Referencias HTTP (sitios web)"
4. Agrega:
   - `localhost:*` (para desarrollo)
   - `yourdomain.com` (para producción)
   - `*.yourdomain.com` (para subdominios)

---

## 📦 Dependencias

El componente requiere:

```json
{
  "dependencies": {
    "@react-google-maps/api": "^2.19.0",
    "react": "^18.0.0"
  }
}
```

**Instalación:**
```bash
npm install @react-google-maps/api
# o
yarn add @react-google-maps/api
```

---

## 🔐 Seguridad

### ⚠️ IMPORTANTE: Proteger tu API Key

1. **NUNCA** commits tu API key en Git
   ```bash
   # Agregar a .gitignore
   echo ".env" >> .gitignore
   ```

2. **Restringir por dominio** en Google Cloud Console

3. **Monitorear uso** de la API
   - Ve a Google Cloud Console → APIs & Services → Dashboard
   - Configura alertas de cuota

4. **Límites de cuota**
   - Google Maps ofrece $200 USD/mes gratis
   - ~28,000 cargas de mapa gratis al mes
   - Configura alertas antes de alcanzar el límite

---

## ✅ Checklist de Implementación

- [x] Componente MapaAreasProtegidas actualizado a Google Maps
- [x] Integrado en Dashboard
- [x] Soporte para tema oscuro
- [x] Loading state implementado
- [x] Marcadores interactivos con colores personalizados
- [x] Tooltip con nombre del área
- [x] Modo centrado para vista detallada
- [x] Responsivo en todos los dispositivos
- [x] Documentación completa

---

## 🎯 Próximas Mejoras Sugeridas

### Funcionalidades Futuras

1. **Clusters de Marcadores**
   - Agrupar áreas cercanas en niveles de zoom bajo
   - Usar `@googlemaps/markerclusterer`

2. **Información en InfoWindow**
   - Mostrar preview del área al hacer click
   - Con botón "Ver Detalles"

3. **Filtros en el Mapa**
   - Filtrar por departamento
   - Filtrar por ecosistema
   - Mostrar/ocultar áreas según estado

4. **Capas Adicionales**
   - Polígonos con límites reales de las áreas
   - Rutas de patrullaje superpuestas
   - Heatmap de incidentes

5. **Geocoding Inverso**
   - Convertir coordenadas a direcciones
   - Mostrar departamento/municipio automáticamente

---

## 📚 Recursos

- [Google Maps JavaScript API Docs](https://developers.google.com/maps/documentation/javascript)
- [@react-google-maps/api Docs](https://react-google-maps-api-docs.netlify.app/)
- [Marker Customization](https://developers.google.com/maps/documentation/javascript/markers)
- [Styling Maps](https://developers.google.com/maps/documentation/javascript/styling)

---

**Última actualización:** 10 de noviembre de 2025  
**Desarrollado para:** CONAP - Consejo Nacional de Áreas Protegidas de Guatemala  
**Mapa Powered by:** Google Maps Platform
