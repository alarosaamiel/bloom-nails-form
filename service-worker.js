/* Bloom Nails Spa — Service worker v5
   - Páginas y contenido (/content): primero la red, para que los cambios del panel se vean al instante.
   - Fuentes, estilos, imágenes y videos: primero la memoria del teléfono, para cargar rápido. */
const CACHE = 'bloom-v5-20261014';
const BASE = ['/', '/index.html', '/assets/css/bloom.css?v=5.1', '/assets/js/bloom.js?v=5.2', '/assets/js/tracking.js?v=5.2', '/assets/manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;            // Analytics, mapas, WhatsApp: siempre directo
  if (req.headers.has('range')) return;                  // Videos: el navegador los maneja por partes

  const primeroRed = req.mode === 'navigate' || url.pathname.startsWith('/content/') || url.pathname.endsWith('.html') || url.pathname === '/';
  if (primeroRed) {
    e.respondWith(fetch(req).then((r) => {
      const copia = r.clone();
      caches.open(CACHE).then((c) => c.put(req, copia)).catch(() => {});
      return r;
    }).catch(() => caches.match(req).then((r) => r || caches.match('/'))));
    return;
  }
  if (url.pathname.startsWith('/assets/') && !url.pathname.endsWith('.mp4')) {
    e.respondWith(caches.match(req).then((cached) => cached || fetch(req).then((r) => {
      if (r.ok) { const copia = r.clone(); caches.open(CACHE).then((c) => c.put(req, copia)).catch(() => {}); }
      return r;
    })));
  }
});
