/**
 * Background Sync Logic
 *
 * Handles syncing offline attendance records to the server when
 * connectivity is restored. Each record is sent individually so
 * a single failure does not block the entire batch.
 */

import {
  getPendingAttendance,
  markSynced,
  markFailed,
  type AttendanceRecord,
} from './offline-store';

/**
 * Check whether the browser currently reports an online connection.
 */
export function isOnline(): boolean {
  if (typeof navigator === 'undefined') {
    return true;
  }
  return navigator.onLine;
}

/**
 * Sync all pending attendance records to the server.
 *
 * - Fetches every record with syncStatus = 'pending'.
 * - POSTs each to `/api/events/[eventId]/attendance`.
 * - Marks individual records as 'synced' or 'failed'.
 * - Never throws -- failures are handled per-record.
 *
 * @returns An object with counts of synced and failed records.
 */
export async function syncPendingAttendance(): Promise<{
  synced: number;
  failed: number;
  total: number;
}> {
  const result = { synced: 0, failed: 0, total: 0 };

  if (!isOnline()) {
    return result;
  }

  let pending: AttendanceRecord[];
  try {
    pending = await getPendingAttendance();
  } catch (error) {
    console.error('[Sync] Failed to read pending attendance from IndexedDB:', error);
    return result;
  }

  result.total = pending.length;

  if (pending.length === 0) {
    return result;
  }

  console.info(`[Sync] Starting sync of ${pending.length} pending attendance record(s).`);

  // Process each record independently so one failure doesn't stop the batch
  const syncPromises = pending.map(async (record) => {
    try {
      const { id, syncStatus, ...payload } = record;

      const response = await fetch(`/api/events/${record.eventId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (id != null) {
          await markSynced(id);
        }
        result.synced++;
        console.info(`[Sync] Record ${id} synced successfully.`);
      } else {
        if (id != null) {
          await markFailed(id);
        }
        result.failed++;
        console.warn(
          `[Sync] Record ${id} failed with status ${response.status}: ${response.statusText}`
        );
      }
    } catch (error) {
      if (record.id != null) {
        try {
          await markFailed(record.id);
        } catch {
          // If we cannot even update the local record, log and move on
          console.error(`[Sync] Could not mark record ${record.id} as failed.`);
        }
      }
      result.failed++;
      console.error(`[Sync] Record ${record.id} threw during sync:`, error);
    }
  });

  await Promise.allSettled(syncPromises);

  console.info(
    `[Sync] Complete. Synced: ${result.synced}, Failed: ${result.failed}, Total: ${result.total}`
  );

  return result;
}

// ─── Auto-Sync Setup ───────────────────────────────────────────────────────────

let isAutoSyncSetup = false;

/**
 * Set up automatic sync that triggers when the browser comes back online.
 *
 * Safe to call multiple times -- it will only attach listeners once.
 * Should be called early in the client-side lifecycle (e.g., in a
 * layout or provider component).
 */
export function setupAutoSync(): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (isAutoSyncSetup) {
    return;
  }

  isAutoSyncSetup = true;

  window.addEventListener('online', () => {
    console.info('[Sync] Connection restored. Triggering auto-sync...');
    syncPendingAttendance().catch((error) => {
      console.error('[Sync] Auto-sync failed unexpectedly:', error);
    });
  });

  // Also attempt a sync on initial setup if already online
  if (isOnline()) {
    syncPendingAttendance().catch((error) => {
      console.error('[Sync] Initial sync attempt failed:', error);
    });
  }
}
