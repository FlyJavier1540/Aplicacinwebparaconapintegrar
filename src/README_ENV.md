# 🔐 Variables de Entorno - Guía Rápida

## 🚀 Setup Rápido (5 minutos)

### 1. Copia el archivo de plantilla
```bash
cp .env.example .env
```

### 2. Completa las variables críticas en `.env`

```env
# Supabase (obtener de: https://app.supabase.com > Project Settings > API)
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Google Maps (obtener de: https://console.cloud.google.com)
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
```

### 3. Reinicia el servidor
```bash
npm run dev
```

¡Listo! 🎉

---

## 📋 Variables Críticas

| Variable | ¿Dónde obtenerla? | ¿Obligatoria? |
|----------|-------------------|---------------|
| `VITE_SUPABASE_URL` | Supabase Dashboard > Settings > API | ✅ Sí |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard > Settings > API | ✅ Sí |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard > Settings > API | ✅ Sí (solo backend) |
| `VITE_GOOGLE_MAPS_API_KEY` | Google Cloud Console | ✅ Sí |

---

## 📚 Documentación Completa

Para más detalles, ver: [CONFIGURACION_ENV.md](./CONFIGURACION_ENV.md)

---

## ⚠️ Importante

1. **NUNCA** subir `.env` a Git (ya está en `.gitignore`)
2. **NUNCA** compartir `SUPABASE_SERVICE_ROLE_KEY` públicamente
3. Las variables con `VITE_` están disponibles en el frontend
4. Las variables sin `VITE_` solo están en el backend

---

## 🔧 Uso en el Código

### Frontend
```typescript
// Usar el helper centralizado
import config from './utils/env';

const apiKey = config.googleMaps.apiKey;
const supabaseUrl = config.supabase.url;
```

### Backend (Supabase Edge Functions)
```typescript
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const salt = Deno.env.get('PASSWORD_SALT');
```

---

## 🆘 Problemas Comunes

### "Google Maps no carga"
✅ Verifica que `VITE_GOOGLE_MAPS_API_KEY` está definida y es válida

### "Error de Supabase"
✅ Verifica `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`

### "Variables undefined"
✅ Reinicia el servidor después de cambiar `.env`

---

## 📞 Contacto

¿Problemas? Revisa [CONFIGURACION_ENV.md](./CONFIGURACION_ENV.md) para troubleshooting detallado.
