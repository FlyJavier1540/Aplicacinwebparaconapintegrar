/**
 * 🔧 Registro del Service Worker para PWA
 * 
 * Maneja el registro, actualización y comunicación
 * con el Service Worker
 */

/**
 * Verifica si el navegador soporta Service Workers
 */
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

/**
 * Verifica si el navegador soporta notificaciones push
 */
export function isPushNotificationSupported(): boolean {
  return 'PushManager' in window;
}

/**
 * Verifica si la app está instalada como PWA
 */
export function isPWAInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://');
}

/**
 * Registra el Service Worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    console.log('⚠️ Service Workers no son soportados en este navegador');
    return null;
  }

  try {
    console.log('🔄 Registrando Service Worker...');
    
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    });

    console.log('✅ Service Worker registrado correctamente:', registration.scope);

    // Escuchar actualizaciones del Service Worker
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('🔄 Nueva versión del Service Worker encontrada');

      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('✅ Nueva versión lista. Recarga la página para actualizar.');
            
            // Mostrar notificación al usuario (opcional)
            if (confirm('Nueva versión disponible. ¿Deseas actualizar ahora?')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });
      }
    });

    // Escuchar cambios de controlador (Service Worker actualizado)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker actualizado. Recargando página...');
      window.location.reload();
    });

    return registration;
  } catch (error) {
    console.error('❌ Error al registrar Service Worker:', error);
    return null;
  }
}

/**
 * Desregistra el Service Worker (útil para debugging)
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!isServiceWorkerSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (registration) {
      const success = await registration.unregister();
      console.log('✅ Service Worker desregistrado:', success);
      return success;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error al desregistrar Service Worker:', error);
    return false;
  }
}

/**
 * Limpia la caché del Service Worker
 */
export async function clearServiceWorkerCache(): Promise<void> {
  if (!isServiceWorkerSupported()) {
    return;
  }

  try {
    // Enviar mensaje al Service Worker para limpiar caché
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (registration && registration.active) {
      registration.active.postMessage({ type: 'CLEAR_CACHE' });
      console.log('✅ Solicitud de limpieza de caché enviada');
    }

    // También limpiar caché del navegador directamente
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
      console.log('✅ Caché del navegador limpiada');
    }
  } catch (error) {
    console.error('❌ Error al limpiar caché:', error);
  }
}

/**
 * Verifica si hay actualizaciones del Service Worker
 */
export async function checkForUpdates(): Promise<void> {
  if (!isServiceWorkerSupported()) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (registration) {
      console.log('🔄 Verificando actualizaciones...');
      await registration.update();
    }
  } catch (error) {
    console.error('❌ Error al verificar actualizaciones:', error);
  }
}

/**
 * Solicita permisos de notificación
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.log('⚠️ Notificaciones no soportadas');
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('🔔 Permiso de notificaciones:', permission);
    return permission;
  } catch (error) {
    console.error('❌ Error al solicitar permisos de notificación:', error);
    return 'denied';
  }
}

/**
 * Muestra información de instalación PWA
 */
export function showPWAInstallInfo(): {
  isInstalled: boolean;
  isStandalone: boolean;
  canInstall: boolean;
  platform: string;
} {
  const isInstalled = isPWAInstalled();
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const canInstall = !isInstalled && isServiceWorkerSupported();
  
  // Detectar plataforma
  const userAgent = navigator.userAgent.toLowerCase();
  let platform = 'unknown';
  
  if (userAgent.includes('android')) {
    platform = 'android';
  } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
    platform = 'ios';
  } else if (userAgent.includes('windows')) {
    platform = 'windows';
  } else if (userAgent.includes('mac')) {
    platform = 'macos';
  } else if (userAgent.includes('linux')) {
    platform = 'linux';
  }

  console.log('📱 Info PWA:', {
    isInstalled,
    isStandalone,
    canInstall,
    platform
  });

  return {
    isInstalled,
    isStandalone,
    canInstall,
    platform
  };
}

/**
 * Hook de evento beforeinstallprompt (para mostrar botón de instalación personalizado)
 */
export function setupInstallPrompt(
  onInstallPromptAvailable: (prompt: any) => void
): () => void {
  const handleBeforeInstallPrompt = (event: Event) => {
    // Prevenir el prompt automático
    event.preventDefault();
    console.log('📥 Prompt de instalación disponible');
    onInstallPromptAvailable(event);
  };

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

  // Retornar función de limpieza
  return () => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  };
}

/**
 * Hook de evento appinstalled (cuando la PWA se instala)
 */
export function onPWAInstalled(callback: () => void): () => void {
  const handleAppInstalled = () => {
    console.log('✅ PWA instalada correctamente');
    callback();
  };

  window.addEventListener('appinstalled', handleAppInstalled);

  return () => {
    window.removeEventListener('appinstalled', handleAppInstalled);
  };
}
