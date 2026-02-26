/**
 * Service Worker Registration Utility
 *
 * Handles registering the service worker for PWA capabilities.
 * Should only be called in the browser environment.
 */

/**
 * Register the service worker at /sw.js.
 *
 * - Checks for browser support before attempting registration.
 * - Waits for the window load event to avoid blocking initial render.
 * - Logs registration outcome for debugging.
 *
 * @returns A promise that resolves with the ServiceWorkerRegistration,
 *          or null if service workers are not supported.
 */
export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }

  if (!('serviceWorker' in navigator)) {
    console.warn('[PWA] Service workers are not supported in this browser.');
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        console.info('[PWA] Service worker registered successfully.', registration.scope);

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // A new service worker is available
                console.info('[PWA] New service worker available. Refresh to update.');
              }
            });
          }
        });

        resolve(registration);
      } catch (error) {
        console.error('[PWA] Service worker registration failed:', error);
        resolve(null);
      }
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register);
    }
  });
}
