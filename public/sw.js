const CACHE_NAME = 'eduafri-offline-v1';
const OFFLINE_URL = '/offline';
const DOWNLOADS_URL = '/downloads';

const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/downloads',
  '/content',
  '/manifest.json',
  '/file.svg',
  '/globe.svg',
  '/window.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Precache core assets
      await cache.addAll(PRECACHE_ASSETS);
      // Activate immediately
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
      // Take control of all pages immediately
      await clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // Special handling for auth-related requests when offline
      if (!navigator.onLine && event.request.url.includes('/api/auth/')) {
        // Return empty successful response for auth checks when offline
        return new Response(JSON.stringify({ data: null }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Try to get the response from the network first
      try {
        const networkResponse = await fetch(event.request);
        
        // Cache successful GET responses
        if (event.request.method === 'GET') {
          await cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        // If network request fails, try to get it from cache
        const cachedResponse = await cache.match(event.request);
        
        if (cachedResponse) {
          return cachedResponse;
        }

        // If the request is for a page (HTML)
        if (event.request.mode === 'navigate') {
          // If it's the downloads page or any downloaded content, return it from cache
          if (event.request.url.includes(DOWNLOADS_URL) || await isDownloadedContent(event.request.url)) {
            const cachedPage = await cache.match(event.request);
            if (cachedPage) {
              return cachedPage;
            }
          }
          
          // For other pages, return the offline page
          const offlineResponse = await cache.match(OFFLINE_URL);
          if (offlineResponse) {
            return offlineResponse;
          }
        }

        // If nothing found in cache, fail
        throw error;
      }
    })()
  );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_DOWNLOAD_CONTENT') {
    // Cache the download content and its assets
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const download = event.data.download;
        
        // Add the content URL to cache if it exists
        if (download.url) {
          try {
            const response = await fetch(download.url);
            await cache.put(download.url, response);
          } catch (error) {
            console.error('Failed to cache download content:', error);
          }
        }
        
        // Cache any associated assets (images, etc.)
        if (download.assets && Array.isArray(download.assets)) {
          await Promise.all(
            download.assets.map(async (asset) => {
              try {
                const response = await fetch(asset);
                await cache.put(asset, response);
              } catch (error) {
                console.error('Failed to cache asset:', error);
              }
            })
          );
        }
      })()
    );
  }

  if (event.data && event.data.type === 'DOWNLOADS_CLEARED') {
    // Clear all cached downloads
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();
        await Promise.all(
          keys.map(async (request) => {
            // Only delete cached downloads, not core assets
            if (!PRECACHE_ASSETS.includes(request.url)) {
              await cache.delete(request);
            }
          })
        );
      })()
    );
  }
  
  if (event.data && event.data.type === 'CHECK_DOWNLOADS') {
    // Check if we have any downloads cached
    event.waitUntil(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();
        const hasDownloads = keys.some(request => 
          !PRECACHE_ASSETS.includes(request.url)
        );
        
        // Notify all clients about the download status
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'HAS_DOWNLOADS',
            hasDownloads
          });
        });
      })()
    );
  }
});

async function isDownloadedContent(url) {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  return keys.some(request => request.url === url);
}

