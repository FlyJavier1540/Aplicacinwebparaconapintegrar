/**
 * 🔧 Service Worker para Sistema CONAP
 * 
 * Proporciona funcionalidad offline y caching optimizado
 * para la Progressive Web App (PWA)
 */

const CACHE_NAME = 'conap-v1.0.0';
const RUNTIME_CACHE = 'conap-runtime-v1.0.0';

// Recursos críticos que se cachean durante la instalación
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// URLs que NO deben cachearse (APIs externas, endpoints del backend)
const NETWORK_ONLY_URLS = [
  '/functions/v1/',
  'supabase.co/functions',
  'maps.googleapis.com',
  'maps.gstatic.com'
];

/**
 * Evento: Instalación del Service Worker
 * Cachea los recursos críticos
 */
self.addEventListener('install', (event) => {
  console.log('✅ [Service Worker] Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 [Service Worker] Cacheando recursos críticos');
        // No bloquear la instalación si falla el precache
        return cache.addAll(PRECACHE_URLS).catch((err) => {
          console.warn('⚠️ [Service Worker] Error al cachear algunos recursos:', err);
        });
      })
      .then(() => {
        console.log('✅ [Service Worker] Instalación completada');
        // Activar inmediatamente sin esperar
        return self.skipWaiting();
      })
  );
});

/**
 * Evento: Activación del Service Worker
 * Limpia cachés antiguos
 */
self.addEventListener('activate', (event) => {
  console.log('🔄 [Service Worker] Activando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('🗑️ [Service Worker] Eliminando caché antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ [Service Worker] Activación completada');
        // Tomar control inmediato de todas las páginas
        return self.clients.claim();
      })
  );
});

/**
 * Evento: Fetch (intercepta peticiones de red)
 * Estrategia: Network First con fallback a Cache
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ===== ESTRATEGIA 1: Network Only =====
  // Para APIs y servicios externos
  const isNetworkOnly = NETWORK_ONLY_URLS.some((pattern) => 
    request.url.includes(pattern)
  );
  
  if (isNetworkOnly) {
    // Siempre usar red, sin caché
    event.respondWith(fetch(request));
    return;
  }

  // ===== ESTRATEGIA 2: Network First =====
  // Intenta red primero, si falla usa caché
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Si la respuesta es válida, cachearla
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          
          caches.open(RUNTIME_CACHE)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
        }
        
        return response;
      })
      .catch(() => {
        // Si falla la red, buscar en caché
        return caches.match(request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              console.log('📦 [Service Worker] Sirviendo desde caché:', request.url);
              return cachedResponse;
            }
            
            // Si no está en caché, devolver página offline personalizada
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            // Para otros recursos, devolver respuesta vacía
            return new Response('Recurso no disponible offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

/**
 * Evento: Message (comunicación con la app)
 * Permite limpiar caché desde la aplicación
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏭️ [Service Worker] Saltando espera y activando');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('🗑️ [Service Worker] Limpiando caché por petición');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

/**
 * Evento: Sync (sincronización en segundo plano)
 * Para futuras implementaciones de sync offline
 */
self.addEventListener('sync', (event) => {
  console.log('🔄 [Service Worker] Sincronización en segundo plano:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // Aquí se puede implementar lógica de sincronización
      Promise.resolve()
    );
  }
});

/**
 * Evento: Push (notificaciones push)
 * Para futuras implementaciones de notificaciones
 */
self.addEventListener('push', (event) => {
  console.log('📬 [Service Worker] Notificación push recibida');
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'conap-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('Sistema CONAP', options)
  );
});

/**
 * Evento: NotificationClick (clic en notificación)
 */
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ [Service Worker] Clic en notificación');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('🚀 [Service Worker] Script cargado correctamente');
