// Music Creations — Service Worker mínimo y seguro.
// No intercepta peticiones y no cachea HTML, imágenes ni archivos de audio.
// Su única función es mantener compatibilidad PWA y retirar cachés antiguas
// creadas por versiones previas del Service Worker de Music Creations.

const MUSIC_CREATIONS_OLD_CACHE_PREFIX = 'music-creations-v';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith(MUSIC_CREATIONS_OLD_CACHE_PREFIX))
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Deliberadamente NO existe listener "fetch".
// Las canciones, carátulas y demás recursos siguen yendo directamente a la red.
