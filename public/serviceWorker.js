const CACHE_NAME = 'hospital-management-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/static/css/main.chunk.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

const API_CACHE_NAME = 'hospital-api-cache-v1';
const API_BASE_URL = '/api';

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Helper function to determine if a request is an API call
const isApiRequest = (url) => url.startsWith(API_BASE_URL);

// Helper function to determine if a request should be cached
const isCacheableRequest = (request) => {
  return (
    request.method === 'GET' &&
    !request.url.includes('/auth/') &&
    !request.url.includes('/websocket')
  );
};

// Network-first strategy for API requests
const handleApiRequest = async (request) => {
  try {
    // Try network first
    const response = await fetch(request);
    
    // Cache successful GET requests
    if (isCacheableRequest(request) && response.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // If network fails, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
};

// Cache-first strategy for static assets
const handleStaticRequest = async (request) => {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
};

// Background sync for offline mutations
const syncManager = {
  async addToSyncQueue(request) {
    try {
      const db = await this.getDB();
      const tx = db.transaction('sync-queue', 'readwrite');
      const store = tx.objectStore('sync-queue');
      
      const serializedRequest = await this.serializeRequest(request);
      await store.add(serializedRequest);
      
      // Register for background sync if supported
      if ('sync' in self.registration) {
        await self.registration.sync.register('sync-queue');
      }
    } catch (error) {
      console.error('Error adding to sync queue:', error);
    }
  },

  async getDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('hospital-offline-db', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('sync-queue')) {
          db.createObjectStore('sync-queue', { autoIncrement: true });
        }
      };
    });
  },

  async serializeRequest(request) {
    const serialized = {
      url: request.url,
      method: request.method,
      headers: {},
      body: null
    };

    // Clone headers
    for (const [key, value] of request.headers.entries()) {
      serialized.headers[key] = value;
    }

    // Clone body if present
    if (request.method !== 'GET') {
      serialized.body = await request.clone().text();
    }

    return serialized;
  },

  async processSyncQueue() {
    const db = await this.getDB();
    const tx = db.transaction('sync-queue', 'readwrite');
    const store = tx.objectStore('sync-queue');
    
    const requests = await store.getAll();
    
    for (const serializedRequest of requests) {
      try {
        const response = await fetch(new Request(serializedRequest.url, {
          method: serializedRequest.method,
          headers: serializedRequest.headers,
          body: serializedRequest.body
        }));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Remove from queue if successful
        await store.delete(serializedRequest.id);
      } catch (error) {
        console.error('Error processing sync request:', error);
      }
    }
  }
};

// Handle fetch events
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Handle API requests
  if (isApiRequest(request.url)) {
    if (request.method === 'GET') {
      event.respondWith(handleApiRequest(request));
    } else {
      // For mutations, try online first
      event.respondWith(
        fetch(request).catch(async (error) => {
          // If offline, queue for later
          await syncManager.addToSyncQueue(request);
          return new Response(JSON.stringify({ 
            status: 'queued',
            message: 'Your request has been queued and will be processed when online'
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
      );
    }
  } else {
    // Handle static asset requests
    event.respondWith(handleStaticRequest(request));
  }
});

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-queue') {
    event.waitUntil(syncManager.processSyncQueue());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: data.data,
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
