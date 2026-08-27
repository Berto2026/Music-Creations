// Music Creations — Service Worker
// IMPORTANTE: sube este número cada vez que cambies iconos, manifest.json
// o cualquier archivo de la app. Si no lo subes, los navegadores seguirán
// sirviendo la versión antigua desde la caché ("los cambios no se vuelcan").
const CACHE_VERSION = 'music-creations-v2';

const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icons/favicon-32.png',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-384.png',
  './icons/icon-512.png'
];

// Instala la nueva versión y la activa de inmediato, sin esperar a que
// se cierren las pestañas abiertas.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Borra cualquier caché de una versión anterior y toma el control
// de todas las páginas abiertas inmediatamente.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_VERSION)
            .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Estrategia de red:
// - Para el documento HTML y el manifest: red primero, así cualquier
//   cambio que subas se ve al instante; si no hay conexión, se usa la copia
//   guardada como último recurso.
// - Para el resto (iconos, imágenes, etc.): caché primero (más rápido),
//   y se actualiza la caché en segundo plano con lo que llegue de la red.
self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const isHTMLOrManifest = request.mode === 'navigate' ||
    request.url.endsWith('.html') ||
    request.url.endsWith('manifest.json');

  if (isHTMLOrManifest) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
        return response;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});
