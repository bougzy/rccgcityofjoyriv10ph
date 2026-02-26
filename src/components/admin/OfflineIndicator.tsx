'use client';

import { useEffect, useState, useCallback } from 'react';
import { getPendingCount } from '@/lib/pwa/offline-store';
import { syncPendingAttendance, isOnline } from '@/lib/pwa/background-sync';

/**
 * OfflineIndicator
 *
 * A compact status widget for admin pages that displays:
 * - Online/offline connection status (green/red dot)
 * - Count of pending offline records awaiting sync
 * - A "Sync Now" button when pending records exist
 *
 * Designed for placement in an admin sidebar, header, or toolbar.
 */
export default function OfflineIndicator() {
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refreshPendingCount = useCallback(async () => {
    try {
      const count = await getPendingCount();
      setPending(count);
    } catch {
      // IndexedDB may not be available; silently ignore
    }
  }, []);

  // Track online/offline status
  useEffect(() => {
    setOnline(isOnline());

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Periodically refresh the pending count (every 10 seconds)
  useEffect(() => {
    refreshPendingCount();
    const interval = setInterval(refreshPendingCount, 10_000);
    return () => clearInterval(interval);
  }, [refreshPendingCount]);

  // Refresh pending count whenever online status changes
  useEffect(() => {
    refreshPendingCount();
  }, [online, refreshPendingCount]);

  const handleSyncNow = async () => {
    if (syncing || !online) return;
    setSyncing(true);
    try {
      await syncPendingAttendance();
      await refreshPendingCount();
    } catch {
      // Errors are logged inside syncPendingAttendance
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Connection status dot */}
      <span
        className={`inline-block h-2.5 w-2.5 rounded-full ${
          online ? 'bg-green-500' : 'bg-red-500'
        }`}
        aria-label={online ? 'Online' : 'Offline'}
        title={online ? 'Online' : 'Offline'}
      />

      <span className="text-gray-600 dark:text-gray-300">
        {online ? 'Online' : 'Offline'}
      </span>

      {/* Pending count badge */}
      {pending > 0 && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200">
          {pending}
        </span>
      )}

      {/* Sync Now button */}
      {pending > 0 && online && (
        <button
          onClick={handleSyncNow}
          disabled={syncing}
          className="ml-1 rounded-md bg-blue-900 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
        >
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      )}
    </div>
  );
}
