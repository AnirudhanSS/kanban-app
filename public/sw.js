/**
 * Service Worker to suppress network error logging
 * This intercepts network requests and prevents error logging
 */

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch event - intercept all network requests
self.addEventListener('fetch', (event) => {
  // Let the request proceed normally
  event.respondWith(
    fetch(event.request).catch((error) => {
      // Suppress network errors from being logged
      // The error will still be thrown to the application
      // but won't appear in console
      throw error;
    })
  );
});
