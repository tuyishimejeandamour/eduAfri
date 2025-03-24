const CACHE_NAME = 'eduafri-offline-v1';
const OFFLINE_URL = '/offline';
const DOWNLOADS_URL = '/downloads';
const CONTENT_URL_PATTERN = '/content/';

const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/downloads',
  '/manifest.json',
  '/file.svg',
  '/globe.svg',
  '/window.svg',
  CONTENT_URL_PATTERN,
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
      const isOnline = navigator.onLine;

      // Special handling for auth-related requests when offline
      if (!isOnline && event.request.url.includes('/api/auth/')) {
        // Return empty successful response for auth checks when offline
        return new Response(JSON.stringify({ data: null }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Special handling for content page requests
      if (event.request.mode === 'navigate' && event.request.url.includes(CONTENT_URL_PATTERN)) {
        // If online, always try network first
        if (isOnline) {
          try {
            console.log('Online - Fetching fresh content from network:', event.request.url);
            const networkResponse = await fetch(event.request, { cache: 'no-store' });
            // Cache the fresh response for offline use
            await cache.put(event.request, networkResponse.clone());
            return networkResponse;
          } catch (error) {
            console.log('Network request failed, falling back to cache:', error);
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) {
              return cachedResponse;
            }
          }
        } else {
          // If offline, check cache first
          console.log('Offline content access attempt, checking cache...');
          const cachedResponse = await cache.match(event.request);
          if (cachedResponse) {
            console.log('Found cached content page');
            return cachedResponse;
          }
          
          // If not found directly, try to find by content ID
          const contentId = event.request.url.split('/').pop();
          console.log('Looking for content with ID:', contentId);
          
          const cachedContent = await findCachedContent(contentId);
          if (cachedContent) {
            console.log('Found cached content through content ID');
            return cachedContent;
          }
          
          // If we can't find the content, return the offline page
          console.log('Content not found in cache, returning offline page');
          return await cache.match(OFFLINE_URL);
        }
      }

      // If online, always prioritize network for ALL requests
      if (isOnline) {
        try {
          console.log('Online - Fetching from network:', event.request.url);
          const networkResponse = await fetch(event.request, { cache: 'no-store' });
          
          // Cache successful GET responses for offline use later
          if (event.request.method === 'GET') {
            await cache.put(event.request, networkResponse.clone());
          }
          
          return networkResponse;
        } catch (error) {
          console.log('Network request failed, trying cache:', error);
          // If network fails, fall back to cache
          const cachedResponse = await cache.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
        }
      } else {
        // If offline, try to get it from cache
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // If the request is for a page (HTML)
        if (event.request.mode === 'navigate') {
          // Check if this is a content view request
          if (event.request.url.includes(CONTENT_URL_PATTERN)) {
            const contentId = event.request.url.split('/').pop();
            // Try to find the content in cache
            const cachedContent = await findCachedContent(contentId);
            if (cachedContent) {
              return cachedContent;
            }
          }

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
      }

      // If nothing found in cache or network, fail
      console.log('Resource not found in cache or network:', event.request.url);
      if (event.request.mode === 'navigate') {
        return await cache.match(OFFLINE_URL);
      }
      
      throw new Error(`Resource not available: ${event.request.url}`);
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
        
        // Explicitly cache the content page URL
        if (download.content_id) {
          try {
            const contentPageUrl = new URL(`/content/${download.content_id}`, self.location.origin).href;
            console.log('Caching content page URL:', contentPageUrl);
            const response = await fetch(contentPageUrl);
            await cache.put(contentPageUrl, response);
          } catch (error) {
            console.error('Failed to cache content page:', error);
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
  
  if (event.data && event.data.type === 'ONLINE_STATUS_CHANGED') {
    const isOnline = event.data.isOnline;
    console.log(`Service Worker received online status change: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
    
    // When coming back online, notify all clients
    if (isOnline) {
      event.waitUntil(
        (async () => {
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'BACK_ONLINE',
              message: 'Network connection restored'
            });
          });
        })()
      );
    }
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

// Helper function to find cached content by ID
async function findCachedContent(contentId) {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  
  // First try to match the exact content page URL
  const contentPageUrl = new URL(`/content/${contentId}`, self.location.origin).href;
  const exactMatch = await cache.match(contentPageUrl);
  if (exactMatch) {
    return exactMatch;
  }
  
  // If no exact match, look for any cached request that includes the content ID
  for (const request of keys) {
    if (request.url.includes(`/content/${contentId}`)) {
      return cache.match(request);
    }
  }
  
  return null;
}

