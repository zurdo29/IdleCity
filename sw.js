// IdleCity Service Worker
// Provides offline functionality and advanced caching

const CACHE_NAME = 'idlecity-v1.0.0';
const STATIC_CACHE = 'idlecity-static-v1.0.0';
const DYNAMIC_CACHE = 'idlecity-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/game.js',
  '/js/ui.js',
  '/js/storage.js',
  '/js/achievements.js',
  '/js/statistics.js',
  '/js/performance.js',
  '/js/testing.js',
  '/manifest.json',
  'https://cdn.tailwindcss.com/3.3.0'
];

// Dynamic content patterns
const DYNAMIC_PATTERNS = [
  /\/api\//,
  /\/data\//,
  /\.json$/
];

// Network-first patterns (always try network first)
const NETWORK_FIRST_PATTERNS = [
  /\/api\/save/,
  /\/api\/load/,
  /\/api\/sync/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Caching static assets...');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })));
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(handleFetch(request));
});

// Main fetch handler with different strategies
async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // Network-first strategy for critical API calls
    if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      return await networkFirst(request);
    }
    
    // Cache-first strategy for static assets
    if (STATIC_ASSETS.some(asset => url.pathname === asset || url.href === asset)) {
      return await cacheFirst(request);
    }
    
    // Stale-while-revalidate for dynamic content
    if (DYNAMIC_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      return await staleWhileRevalidate(request);
    }
    
    // Default: Cache-first with network fallback
    return await cacheFirst(request);
    
  } catch (error) {
    console.error('❌ Fetch error:', error);
    return await handleFetchError(request, error);
  }
}

// Cache-first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Update cache in background if needed
    updateCacheInBackground(request);
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    // Cache the response
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Update cache with fresh data
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  // Always try to fetch fresh data in background
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network error, ignore for this strategy
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // No cached version, wait for network
  return await fetchPromise;
}

// Update cache in background
async function updateCacheInBackground(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
  } catch (error) {
    // Ignore background update errors
    console.log('Background cache update failed:', error.message);
  }
}

// Handle fetch errors with fallbacks
async function handleFetchError(request, error) {
  const url = new URL(request.url);
  
  // Try to serve from cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // For HTML requests, serve offline page
  if (request.headers.get('accept')?.includes('text/html')) {
    return await caches.match('/') || new Response(
      createOfflinePage(),
      { 
        headers: { 'Content-Type': 'text/html' },
        status: 200
      }
    );
  }
  
  // For other requests, return a generic error response
  return new Response(
    JSON.stringify({ 
      error: 'Offline', 
      message: 'This content is not available offline' 
    }),
    {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

// Create offline page HTML
function createOfflinePage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>IdleCity - Offline</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
          padding: 20px;
        }
        .offline-container {
          max-width: 400px;
          background: rgba(255, 255, 255, 0.1);
          padding: 40px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        .city-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }
        h1 {
          margin: 0 0 20px 0;
          font-size: 2rem;
        }
        p {
          margin: 0 0 30px 0;
          opacity: 0.9;
          line-height: 1.6;
        }
        .retry-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.3s;
        }
        .retry-btn:hover {
          background: #2563eb;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="city-icon">🏙️</div>
        <h1>You're Offline</h1>
        <p>IdleCity is not available right now. Check your internet connection and try again.</p>
        <button class="retry-btn" onclick="window.location.reload()">
          Try Again
        </button>
      </div>
    </body>
    </html>
  `;
}

// Background sync for save data
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'save-game-data') {
    event.waitUntil(syncGameData());
  }
});

// Sync game data when connection is restored
async function syncGameData() {
  try {
    // Get pending save data from IndexedDB or localStorage
    const clients = await self.clients.matchAll();
    
    for (const client of clients) {
      client.postMessage({
        type: 'SYNC_GAME_DATA',
        timestamp: Date.now()
      });
    }
    
    console.log('✅ Game data sync completed');
  } catch (error) {
    console.error('❌ Game data sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received');
  
  const options = {
    body: 'Your city is generating resources!',
    icon: '/manifest.json',
    badge: '/manifest.json',
    tag: 'idle-notification',
    requireInteraction: false,
    actions: [
      {
        action: 'open-game',
        title: 'Open Game',
        icon: '/manifest.json'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };
  
  if (event.data) {
    try {
      const payload = event.data.json();
      options.body = payload.message || options.body;
      options.data = { ...options.data, ...payload.data };
    } catch (error) {
      console.error('❌ Error parsing push payload:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('IdleCity', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'open-game' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Check if game is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            return client.focus();
          }
        }
        
        // Open new window
        return clients.openWindow('/');
      })
    );
  }
});

// Periodic background sync for idle notifications
self.addEventListener('periodicsync', (event) => {
  console.log('⏰ Periodic sync triggered:', event.tag);
  
  if (event.tag === 'idle-check') {
    event.waitUntil(checkIdleProgress());
  }
});

// Check idle progress and send notifications
async function checkIdleProgress() {
  try {
    const clients = await self.clients.matchAll();
    
    if (clients.length === 0) {
      // No active clients, check if we should send idle notification
      const lastActiveTime = await getLastActiveTime();
      const gameState = await getCachedGameState();
      const now = Date.now();
      const idleTime = now - lastActiveTime;
      
      // Send notification if idle for more than 30 minutes
      if (idleTime > 30 * 60 * 1000) {
        let message = 'Your city has been generating resources while you were away!';
        
        // Calculate estimated progress if we have game state
        if (gameState && gameState.resources) {
          const coinsPerSecond = gameState.resources.coinsPerSecond || 0;
          const idleSeconds = Math.floor(idleTime / 1000);
          const estimatedCoins = Math.floor(coinsPerSecond * idleSeconds);
          
          if (estimatedCoins > 0) {
            message = `Your city earned approximately ${estimatedCoins} coins while you were away!`;
          }
        }
        
        await self.registration.showNotification('IdleCity', {
          body: message,
          icon: '/manifest.json',
          tag: 'idle-progress',
          requireInteraction: true,
          actions: [
            {
              action: 'open-game',
              title: 'Collect Resources'
            },
            {
              action: 'dismiss',
              title: 'Later'
            }
          ],
          data: {
            idleTime: idleTime,
            timestamp: now
          }
        });
      }
    }
  } catch (error) {
    console.error('❌ Idle check failed:', error);
  }
}

// Get last active time from storage
async function getLastActiveTime() {
  try {
    // Try to get from cache first
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = await cache.match('/last-active-time');
    
    if (response) {
      const data = await response.json();
      return data.timestamp;
    }
  } catch (error) {
    console.log('Could not retrieve last active time from cache');
  }
  
  // Default to 1 hour ago if no data available
  return Date.now() - (60 * 60 * 1000);
}

// Get cached game state
async function getCachedGameState() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = await cache.match('/offline-game-state');
    
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.log('Could not retrieve cached game state');
  }
  
  return null;
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('💬 Message received:', event.data);
  
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'UPDATE_LAST_ACTIVE':
      // Store last active time for idle notifications
      storeLastActiveTime(data.timestamp);
      break;
      
    case 'CACHE_GAME_STATE':
      // Cache current game state for offline access
      cacheGameState(data.gameState);
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
});

// Store last active time
async function storeLastActiveTime(timestamp) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = new Response(JSON.stringify({ timestamp }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put('/last-active-time', response);
    console.log('📝 Stored last active time:', new Date(timestamp));
  } catch (error) {
    console.error('❌ Failed to store last active time:', error);
  }
}

// Cache game state for offline access
async function cacheGameState(gameState) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const response = new Response(JSON.stringify(gameState), {
      headers: { 'Content-Type': 'application/json' }
    });
    
    await cache.put('/offline-game-state', response);
    console.log('💾 Game state cached for offline access');
  } catch (error) {
    console.error('❌ Failed to cache game state:', error);
  }
}