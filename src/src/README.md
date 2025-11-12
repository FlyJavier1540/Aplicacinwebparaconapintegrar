# Carpeta /src - Recursos del Sistema

Esta carpeta contiene recursos estáticos y configuraciones centralizadas de la aplicación.

## 📋 Contenido

### `logo.ts` - Logo de CONAP
Archivo que centraliza la importación y exportación del logo oficial de CONAP.

### `logo_conap.png` - Imagen del Logo (⚠️ DEBES SUBIRLO)
Este es el archivo de imagen que debes subir a esta carpeta.

---

## 🚀 INSTRUCCIONES PARA SUBIR EL LOGO

### Paso 1: Prepara tu imagen
- **Nombre del archivo**: Debe llamarse **EXACTAMENTE** `logo_conap.png`
- **Formato**: PNG (preferible con transparencia) o renombra tu archivo a .png
- **Tamaño recomendado**: 512x512 px o superior
- **Peso**: Menor a 500KB para mejor rendimiento

### Paso 2: Sube el archivo
1. Abre la carpeta `/src/` en tu proyecto
2. Sube o arrastra tu archivo `logo_conap.png` aquí
3. ¡Listo! No necesitas modificar ningún código

### Paso 3: Verifica
Una vez subido, el logo aparecerá automáticamente en:
- ✅ Sidebar principal (barra lateral izquierda)
- ✅ Pantalla de Login
- ✅ Favicon del navegador (pestaña)
- ✅ Reportes PDF de patrullajes

---

## ⚠️ IMPORTANTE

El nombre del archivo **DEBE SER EXACTAMENTE**: `logo_conap.png`

Si tu archivo tiene otro nombre (como `logo.png`, `CONAP.png`, etc.), debes renombrarlo a `logo_conap.png`

---

## 📍 Componentes que usan el logo

El logo se importa desde `/src/logo.ts` y se usa en:

- **App.tsx**: Sidebar y Favicon del navegador
- **Login.tsx**: Pantalla de inicio de sesión
- **GeolocalizacionRutas.tsx**: Reportes PDF de patrullajes

---

## 🔧 Estructura Técnica

```
/src/
├── logo.ts              ← Exporta el logo
└── logo_conap.png       ← TU IMAGEN (súbela aquí)
```

El archivo `logo.ts` contiene:
```typescript
import conapLogoImage from './logo_conap.png';
export const conapLogo = conapLogoImage;
```

Todos los componentes importan así:
```typescript
import { conapLogo } from './src/logo';  // Desde raíz
import { conapLogo } from '../src/logo'; // Desde /components
```