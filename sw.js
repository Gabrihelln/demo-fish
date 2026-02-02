
const CACHE_NAME = 'sga-v1';
const ASSETS = [
  './',
  './index.html',
  './index.tsx',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Ignora requisições para o Supabase e API do Google para permitir modo offline de dados
  if (event.request.url.includes('supabase.co') || event.request.url.includes('google')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
