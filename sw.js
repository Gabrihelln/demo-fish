
const CACHE_NAME = 'sga-v2';
// Apenas arquivos que garantidamente existem no ambiente de execução
const ASSETS = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap',
  'https://esm.sh/lucide-react@^0.463.0',
  'https://esm.sh/react-dom@^19.2.4/client',
  'https://esm.sh/@supabase/supabase-js@^2.45.0'
];

self.addEventListener('install', (event) => {
  console.log('SW: Instalando...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Tenta adicionar um por um para evitar que um erro 404 em um arquivo mate todo o processo
      return Promise.allSettled(
        ASSETS.map(url => {
          return cache.add(url).catch(err => console.warn(`SW: Falha ao cachear ${url}`, err));
        })
      );
    }).then(() => {
      console.log('SW: Cache finalizado.');
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'OFFLINE_READY' }));
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('SW: Ativado.');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Ignora chamadas externas do Supabase e Google para não quebrar a sincronização
  if (event.request.url.includes('supabase.co') || event.request.url.includes('google')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retorna do cache se existir, senão busca na rede
      return response || fetch(event.request).catch(() => {
        // Se falhar rede e não tiver no cache (e for navegação), retorna a raiz (SPA handle)
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
