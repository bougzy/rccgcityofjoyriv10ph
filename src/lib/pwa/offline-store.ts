/**
 * IndexedDB Wrapper for Offline Attendance Data
 *
 * Provides a zero-dependency IndexedDB abstraction for storing attendance
 * records offline and managing a sync queue. Records are persisted locally
 * and synced when connectivity is restored.
 *
 * Database: 'cojf-offline'
 * Object stores:
 *   - attendance: offline attendance records
 *   - sync-queue: generic queue for pending API calls
 */

const DB_NAME = 'cojf-offline';
const DB_VERSION = 1;

const STORE_ATTENDANCE = 'attendance';
const STORE_SYNC_QUEUE = 'sync-queue';

export type SyncStatus = 'pending' | 'synced' | 'failed';

export interface AttendanceRecord {
  id?: number;
  eventId: string;
  fullName: string;
  phone: string;
  email: string;
  parishName: string;
  naturalGroup: string;
  isFirstTimer: boolean;
  checkInTime: string;
  syncStatus: SyncStatus;
}

export interface SyncQueueItem {
  id?: number;
  url: string;
  method: string;
  body: string;
  createdAt: string;
}

// ─── Database Connection ───────────────────────────────────────────────────────

/**
 * Open (or create) the IndexedDB database.
 * Creates object stores on first run or version upgrade.
 */
export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB is not available in this environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Attendance store with auto-incrementing ID and sync index
      if (!db.objectStoreNames.contains(STORE_ATTENDANCE)) {
        const attendanceStore = db.createObjectStore(STORE_ATTENDANCE, {
          keyPath: 'id',
          autoIncrement: true,
        });
        attendanceStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        attendanceStore.createIndex('eventId', 'eventId', { unique: false });
      }

      // Generic sync queue
      if (!db.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
        db.createObjectStore(STORE_SYNC_QUEUE, {
          keyPath: 'id',
          autoIncrement: true,
        });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject(
        new Error(
          `Failed to open IndexedDB: ${(event.target as IDBOpenDBRequest).error?.message}`
        )
      );
    };
  });
}

// ─── Attendance Operations ─────────────────────────────────────────────────────

/**
 * Save an attendance record to the offline store.
 * Sets syncStatus to 'pending' by default.
 *
 * @param record - The attendance data (id is auto-generated).
 * @returns The auto-generated ID of the new record.
 */
export async function saveAttendance(
  record: Omit<AttendanceRecord, 'id' | 'syncStatus'> & { syncStatus?: SyncStatus }
): Promise<number> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ATTENDANCE, 'readwrite');
    const store = tx.objectStore(STORE_ATTENDANCE);

    const data: Omit<AttendanceRecord, 'id'> = {
      ...record,
      syncStatus: record.syncStatus || 'pending',
    };

    const request = store.add(data);

    request.onsuccess = () => {
      resolve(request.result as number);
    };

    request.onerror = () => {
      reject(new Error(`Failed to save attendance record: ${request.error?.message}`));
    };

    tx.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Get all attendance records with syncStatus = 'pending'.
 */
export async function getPendingAttendance(): Promise<AttendanceRecord[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ATTENDANCE, 'readonly');
    const store = tx.objectStore(STORE_ATTENDANCE);
    const index = store.index('syncStatus');
    const request = index.getAll('pending');

    request.onsuccess = () => {
      resolve(request.result as AttendanceRecord[]);
    };

    request.onerror = () => {
      reject(new Error(`Failed to get pending attendance: ${request.error?.message}`));
    };

    tx.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Mark a specific attendance record as synced.
 */
export async function markSynced(id: number): Promise<void> {
  await updateSyncStatus(id, 'synced');
}

/**
 * Mark a specific attendance record as failed.
 */
export async function markFailed(id: number): Promise<void> {
  await updateSyncStatus(id, 'failed');
}

/**
 * Count the number of pending attendance records.
 */
export async function getPendingCount(): Promise<number> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ATTENDANCE, 'readonly');
    const store = tx.objectStore(STORE_ATTENDANCE);
    const index = store.index('syncStatus');
    const request = index.count('pending');

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(new Error(`Failed to count pending records: ${request.error?.message}`));
    };

    tx.oncomplete = () => {
      db.close();
    };
  });
}

/**
 * Remove all attendance records that have been synced.
 * Keeps pending and failed records for retry.
 */
export async function clearSynced(): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ATTENDANCE, 'readwrite');
    const store = tx.objectStore(STORE_ATTENDANCE);
    const index = store.index('syncStatus');
    const request = index.openCursor('synced');

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    request.onerror = () => {
      reject(new Error(`Failed to clear synced records: ${request.error?.message}`));
    };

    tx.oncomplete = () => {
      db.close();
      resolve();
    };

    tx.onerror = () => {
      reject(new Error(`Transaction failed: ${tx.error?.message}`));
    };
  });
}

// ─── Internal Helpers ──────────────────────────────────────────────────────────

/**
 * Update the syncStatus field of a specific attendance record.
 */
async function updateSyncStatus(id: number, status: SyncStatus): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_ATTENDANCE, 'readwrite');
    const store = tx.objectStore(STORE_ATTENDANCE);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const record = getRequest.result;
      if (!record) {
        reject(new Error(`Attendance record with id ${id} not found.`));
        return;
      }
      record.syncStatus = status;
      const putRequest = store.put(record);

      putRequest.onerror = () => {
        reject(new Error(`Failed to update record ${id}: ${putRequest.error?.message}`));
      };
    };

    getRequest.onerror = () => {
      reject(new Error(`Failed to get record ${id}: ${getRequest.error?.message}`));
    };

    tx.oncomplete = () => {
      db.close();
      resolve();
    };

    tx.onerror = () => {
      reject(new Error(`Transaction failed: ${tx.error?.message}`));
    };
  });
}
