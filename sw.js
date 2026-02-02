
const CACHE_NAME = 'sga-v1';
const ASSETS = [
  './',
  './index.html',
  './index.tsx',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'https://esm.sh/lucide-react@^0.463.0',
  'https://esm.sh/react-dom@^19.2.4/client',
  'https://esm.sh/@supabase/supabase-js@^2.45.0'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => {
      // Notifica todos os clientes abertos que o cache está pronto
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'OFFLINE_READY' }));
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('supabase.co') || event.request.url.includes('google')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
