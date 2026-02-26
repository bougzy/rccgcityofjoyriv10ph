'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/pwa/register-sw';
import { setupAutoSync } from '@/lib/pwa/background-sync';

/**
 * PWARegister
 *
 * A client component that registers the service worker and sets up
 * background sync on mount. Renders nothing visible -- it exists
 * solely for its side effects.
 *
 * Include this component once in the root layout so that PWA
 * capabilities are initialized on every page.
 */
export default function PWARegister() {
  useEffect(() => {
    registerServiceWorker();
    setupAutoSync();
  }, []);

  return null;
}
