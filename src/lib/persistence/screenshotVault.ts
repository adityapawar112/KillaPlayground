/**
 * screenshotVault.ts
 * Local IndexedDB persistence for diorama screenshots.
 * Stores screenshots captured from the viewport and makes them available
 * in the Festive Poster Studio gallery.
 * 
 * Standard Library & Native APIs First: Pure IndexedDB implementation with memory fallback.
 */

export interface LocalScreenshot {
  id: string;
  timestamp: number;
  dataUrl: string;
  width: number;
  height: number;
}

const DB_NAME = 'killa_vault_db';
const DB_VERSION = 2; // Bumped to 2 for screenshots store
const STORE_SCREENSHOTS = 'screenshots';
const STORE_PROJECTS = 'projects';
const STORE_SESSION = 'session';

// In-memory fallback for SSR or environments without indexedDB (e.g. Node.js unit tests)
const memoryScreenshots = new Map<string, LocalScreenshot>();

function isIndexedDBAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

function openScreenshotDB(): Promise<IDBDatabase | null> {
  if (!isIndexedDBAvailable()) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
          const store = db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
          store.createIndex('name', 'name', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_SESSION)) {
          db.createObjectStore(STORE_SESSION, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(STORE_SCREENSHOTS)) {
          const store = db.createObjectStore(STORE_SCREENSHOTS, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn('IndexedDB open error in screenshotVault, using memory fallback:', request.error);
        resolve(null);
      };
    } catch (err) {
      console.warn('IndexedDB threw error in screenshotVault, using memory fallback:', err);
      resolve(null);
    }
  });
}

/**
 * Saves a screenshot to local IndexedDB storage (or memory fallback)
 */
export async function saveLocalScreenshot(
  dataUrl: string,
  width: number = 1920,
  height: number = 1080
): Promise<LocalScreenshot> {
  const screenshot: LocalScreenshot = {
    id: `shot-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    dataUrl,
    width,
    height,
  };

  const db = await openScreenshotDB();
  if (!db) {
    memoryScreenshots.set(screenshot.id, screenshot);
    return screenshot;
  }

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_SCREENSHOTS, 'readwrite');
      const store = tx.objectStore(STORE_SCREENSHOTS);
      const req = store.put(screenshot);

      req.onsuccess = () => resolve(screenshot);
      req.onerror = () => {
        console.warn('Failed to save screenshot to IndexedDB, saving to memory fallback:', req.error);
        memoryScreenshots.set(screenshot.id, screenshot);
        resolve(screenshot);
      };
    } catch (err) {
      console.warn('IndexedDB transaction failed in saveLocalScreenshot:', err);
      memoryScreenshots.set(screenshot.id, screenshot);
      resolve(screenshot);
    }
  });
}

/**
 * Returns all saved screenshots sorted by timestamp descending (newest first)
 */
export async function listLocalScreenshots(): Promise<LocalScreenshot[]> {
  const db = await openScreenshotDB();
  if (!db) {
    return Array.from(memoryScreenshots.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_SCREENSHOTS, 'readonly');
      const store = tx.objectStore(STORE_SCREENSHOTS);
      const req = store.getAll();

      req.onsuccess = () => {
        const list = (req.result || []) as LocalScreenshot[];
        list.sort((a, b) => b.timestamp - a.timestamp);
        resolve(list);
      };
      req.onerror = () => {
        resolve(Array.from(memoryScreenshots.values()).sort((a, b) => b.timestamp - a.timestamp));
      };
    } catch (err) {
      resolve(Array.from(memoryScreenshots.values()).sort((a, b) => b.timestamp - a.timestamp));
    }
  });
}

/**
 * Deletes a single screenshot by ID from local storage
 */
export async function deleteLocalScreenshot(id: string): Promise<void> {
  memoryScreenshots.delete(id);

  const db = await openScreenshotDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_SCREENSHOTS, 'readwrite');
      const store = tx.objectStore(STORE_SCREENSHOTS);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    } catch (err) {
      resolve();
    }
  });
}

/**
 * Clears all screenshots from local storage
 */
export async function clearAllLocalScreenshots(): Promise<void> {
  memoryScreenshots.clear();

  const db = await openScreenshotDB();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_SCREENSHOTS, 'readwrite');
      const store = tx.objectStore(STORE_SCREENSHOTS);
      const req = store.clear();

      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    } catch (err) {
      resolve();
    }
  });
}

