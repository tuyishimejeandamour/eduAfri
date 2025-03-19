const CACHE_NAME = "eduafri-cache-v1"
const OFFLINE_URL = "/offline"

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  "/",
  "/offline",
  "/dashboard",
  "/courses",
  "/auth",
  "/manifest.json",
  "/favicon.ico",
  "/globals.css",
]

// Install event - precache key resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Opened cache")
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => self.skipWaiting()),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME
            })
            .map((cacheName) => {
              return caches.delete(cacheName)
            }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests and browser extensions
  if (event.request.method !== "GET" || !event.request.url.startsWith(self.location.origin)) {
    return
  }

  // Handle API requests differently - don't cache by default
  if (event.request.url.includes("/api/")) {
    return handleApiRequest(event)
  }

  // For page navigations, try network first, then cache
  if (event.request.mode === "navigate") {
    return event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request).then((response) => {
          if (response) {
            return response
          }
          // If both network and cache fail, show offline page
          return caches.match(OFFLINE_URL)
        })
      }),
    )
  }

  // For other requests (assets, etc.), try cache first, then network
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }

      // Clone the request because it's a one-time use stream
      const fetchRequest = event.request.clone()

      return fetch(fetchRequest)
        .then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone the response because it's a one-time use stream
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // If both cache and network fail for assets, return offline fallback
          if (event.request.destination === "image") {
            return caches.match("/placeholder.svg")
          }
          return new Response("Network error occurred", { status: 408 })
        })
    }),
  )
})

// Handle API requests
function handleApiRequest(event) {
  // For API requests, try network first
  event.respondWith(
    fetch(event.request).catch(() => {
      // If network fails, check if this is a GET request we can serve from cache
      if (event.request.method === "GET") {
        return caches.match(event.request)
      }

      // For failed non-GET API requests, queue them for later
      return queueFailedRequest(event.request.clone()).then(() => {
        // Return a response indicating the request was queued
        return new Response(
          JSON.stringify({
            success: false,
            error: "You are offline. Request has been queued for when you are back online.",
          }),
          {
            headers: { "Content-Type": "application/json" },
            status: 503,
          },
        )
      })
    }),
  )
}

// Queue failed requests for later processing
async function queueFailedRequest(request) {
  // We'll implement this with IndexedDB in the main app
  // For now, just post a message to the client
  const clients = await self.clients.matchAll()
  clients.forEach((client) => {
    client.postMessage({
      type: "QUEUE_REQUEST",
      request: {
        url: request.url,
        method: request.method,
        headers: Array.from(request.headers.entries()),
        body: request.body, // Note: this might not work directly, we'll handle it in the app
      },
    })
  })
}

// Listen for messages from the client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

