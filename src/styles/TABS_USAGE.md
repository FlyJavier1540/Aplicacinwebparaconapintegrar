# Tabs Minimalistas - Guía de Uso

## 📋 Descripción

Sistema de tabs minimalistas para la aplicación CONAP, con diseño limpio y profesional que sigue los estándares visuales del proyecto.

## 🎨 Características

- ✅ **Diseño Minimalista**: Fondo gris claro con pills redondeados
- ✅ **Modo Oscuro**: Soporte completo para tema oscuro
- ✅ **Responsive**: Adaptable a diferentes tamaños de pantalla
- ✅ **3 Variantes**: Normal, Compacta y Ancho Completo
- ✅ **Iconos Integrados**: Soporte para iconos de Lucide React
- ✅ **Transiciones Suaves**: Animaciones profesionales

## 📦 Import

```tsx
import { tabStyles } from '../styles/shared-styles';
import { Activity, History } from 'lucide-react';
```

## 💡 Variantes Disponibles

### 1. **Tabs Normal** (Inline)
Ideal para secciones secundarias o cuando necesitas tabs que no ocupen todo el ancho.

```tsx
const [activeTab, setActiveTab] = useState('activos');

<div className={tabStyles.container}>
  <button 
    onClick={() => setActiveTab('activos')}
    className={tabStyles.tab(activeTab === 'activos')}
  >
    <Activity className={tabStyles.icon} />
    Activos
  </button>
  <button 
    onClick={() => setActiveTab('historial')}
    className={tabStyles.tab(activeTab === 'historial')}
  >
    <History className={tabStyles.icon} />
    Historial
  </button>
</div>
```

### 2. **Tabs Compactas**
Para espacios reducidos o interfaces densas.

```tsx
<div className={tabStyles.containerCompact}>
  <button 
    onClick={() => setActiveTab('activos')}
    className={tabStyles.tabCompact(activeTab === 'activos')}
  >
    <Activity className={tabStyles.iconCompact} />
    Activos
  </button>
  <button 
    onClick={() => setActiveTab('historial')}
    className={tabStyles.tabCompact(activeTab === 'historial')}
  >
    <History className={tabStyles.iconCompact} />
    Historial
  </button>
</div>
```

### 3. **Tabs Ancho Completo** (Recomendado)
Para secciones principales donde los tabs deben ocupar todo el ancho disponible.

```tsx
<div className={tabStyles.containerFull}>
  <button 
    onClick={() => setActiveTab('activos')}
    className={tabStyles.tabFull(activeTab === 'activos')}
  >
    <Activity className={tabStyles.icon} />
    Activos
  </button>
  <button 
    onClick={() => setActiveTab('historial')}
    className={tabStyles.tabFull(activeTab === 'historial')}
  >
    <History className={tabStyles.icon} />
    Historial
  </button>
</div>
```

## 🔧 Ejemplo Completo

```tsx
import React, { useState } from 'react';
import { tabStyles } from '../styles/shared-styles';
import { Activity, History } from 'lucide-react';

export default function MiComponente() {
  const [activeTab, setActiveTab] = useState('activos');

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className={tabStyles.containerFull}>
        <button 
          onClick={() => setActiveTab('activos')}
          className={tabStyles.tabFull(activeTab === 'activos')}
        >
          <Activity className={tabStyles.icon} />
          Activos
        </button>
        <button 
          onClick={() => setActiveTab('historial')}
          className={tabStyles.tabFull(activeTab === 'historial')}
        >
          <History className={tabStyles.icon} />
          Historial
        </button>
      </div>

      {/* Contenido del Tab Activos */}
      {activeTab === 'activos' && (
        <div>
          {/* Tu contenido aquí */}
          <p>Contenido de Activos</p>
        </div>
      )}

      {/* Contenido del Tab Historial */}
      {activeTab === 'historial' && (
        <div>
          {/* Tu contenido aquí */}
          <p>Contenido de Historial</p>
        </div>
      )}
    </div>
  );
}
```

## 🎯 Casos de Uso

### ✅ Cuando Usar Tabs Ancho Completo (`containerFull`)
- Navegación principal de una sección
- Cuando solo hay 2-3 opciones
- En módulos como Registro de Incidentes, Control de Equipos

### ✅ Cuando Usar Tabs Normales (`container`)
- Filtros secundarios
- Cuando hay más de 3 opciones
- Secciones laterales o secundarias

### ✅ Cuando Usar Tabs Compactas (`containerCompact`)
- Interfaces muy densas
- Mobile first designs
- Espacios limitados

## 🎨 Personalización

Los tabs heredan los colores del sistema de diseño CONAP:

- **Activo**: Fondo blanco con borde y sombra sutil
- **Inactivo**: Fondo transparente con texto gris
- **Hover**: Fondo gris claro en tabs inactivos

### Colores por Tema:

**Light Mode:**
- Container: `bg-gray-100` con `border-gray-200`
- Tab Activo: `bg-white` con `text-gray-900` y `border-gray-200`
- Tab Inactivo: `text-gray-600` con hover `bg-gray-50`

**Dark Mode:**
- Container: `bg-gray-900` con `border-gray-700`
- Tab Activo: `bg-gray-800` con `text-gray-100` y `border-gray-600`
- Tab Inactivo: `text-gray-400` con hover `bg-gray-800/50`

## 📝 Notas Importantes

1. **Estado**: Siempre usa `useState` para manejar el tab activo
2. **Iconos**: Opcional pero recomendado para mejor UX
3. **Consistencia**: Usa la misma variante en todo el módulo
4. **Accesibilidad**: Los botones son naturalmente accesibles

## 🚀 Componentes que Usan Tabs

- ✅ `RegistroIncidentes.tsx` - Tabs Ancho Completo
- ✅ `ControlEquipos.tsx` - Tabs Ancho Completo (próximamente)
- ✅ `GestionUsuarios.tsx` - Tabs Ancho Completo (próximamente)

## 📚 Referencias

- Estilos definidos en: `/styles/shared-styles.ts`
- Ejemplo de implementación: `/components/RegistroIncidentes.tsx`
- Documentación de Motion: Para animaciones adicionales si es necesario
