/**
 * Local Persistence Adapter & Project Vault for Killa Playground
 * Standard Library & Native APIs First: Pure IndexedDB implementation.
 */

export interface VaultProjectStats {
  wallsCount: number;
  foundationsCount: number;
  stairsCount: number;
  propsCount: number;
  lightsCount: number;
  foliageCount: number;
}

export interface VaultProjectRecord {
  id: string;
  name: string;
  templateId: string;
  updatedAt: number;
  createdAt: number;
  stats: VaultProjectStats;
  packageBlob: Uint8Array;
}

export type VaultProjectMeta = Omit<VaultProjectRecord, 'packageBlob'>;

const DB_NAME = 'killa_vault_db';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';
const STORE_SESSION = 'session';

// In-memory fallback for SSR or environments without indexedDB (e.g. Node.js unit tests)
const memoryProjects = new Map<string, VaultProjectRecord>();
const memorySession = new Map<string, any>();

function isIndexedDBAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

function openVaultDB(): Promise<IDBDatabase | null> {
  if (!isIndexedDBAvailable()) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
          const store = db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
          store.createIndex('name', 'name', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_SESSION)) {
          db.createObjectStore(STORE_SESSION, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn('IndexedDB open error, falling back to memory vault:', request.error);
        resolve(null);
      };
    } catch (err) {
      console.warn('IndexedDB threw error, falling back to memory vault:', err);
      resolve(null);
    }
  });
}

/**
 * Returns all saved projects metadata sorted by updatedAt descending
 */
export async function getVaultProjects(): Promise<VaultProjectMeta[]> {
  const db = await openVaultDB();
  if (!db) {
    const list = Array.from(memoryProjects.values()).map(({ packageBlob, ...meta }) => meta);
    return list.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_PROJECTS, 'readonly');
      const store = tx.objectStore(STORE_PROJECTS);
      const req = store.getAll();

      req.onsuccess = () => {
        const records: VaultProjectRecord[] = req.result || [];
        const metas: VaultProjectMeta[] = records.map(({ packageBlob, ...meta }) => meta);
        metas.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(metas);
      };

      req.onerror = () => {
        console.warn('Failed to retrieve vault projects:', req.error);
        resolve([]);
      };
    } catch (err) {
      console.warn('Vault query failed:', err);
      resolve([]);
    }
  });
}

/**
 * Saves or updates a project in the vault.
 * If project with exact name exists, it updates it, otherwise creates a new ID.
 */
export async function saveVaultProject(
  name: string,
  packageBlob: Uint8Array,
  meta?: Partial<VaultProjectRecord>
): Promise<string> {
  const cleanName = name.trim() || 'Untitled Killa';
  const existingProjects = await getVaultProjects();
  const existing = existingProjects.find((p) => p.name.toLowerCase() === cleanName.toLowerCase());

  const id = existing?.id || meta?.id || `killa_${Date.now()}`;
  const now = Date.now();

  const record: VaultProjectRecord = {
    id,
    name: cleanName,
    templateId: meta?.templateId || 'raigad',
    updatedAt: now,
    createdAt: existing?.createdAt || meta?.createdAt || now,
    stats: meta?.stats || {
      wallsCount: 0,
      foundationsCount: 0,
      stairsCount: 0,
      propsCount: 0,
      lightsCount: 0,
      foliageCount: 0,
    },
    packageBlob,
  };

  const db = await openVaultDB();
  if (!db) {
    memoryProjects.set(id, record);
    return id;
  }

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = tx.objectStore(STORE_PROJECTS);
      const req = store.put(record);

      req.onsuccess = () => resolve(id);
      req.onerror = () => reject(req.error);
    } catch (err) {
      memoryProjects.set(id, record);
      resolve(id);
    }
  });
}

/**
 * Loads a project by ID, returning its full record including packageBlob
 */
export async function loadVaultProject(id: string): Promise<VaultProjectRecord | null> {
  const db = await openVaultDB();
  if (!db) {
    return memoryProjects.get(id) || null;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_PROJECTS, 'readonly');
      const store = tx.objectStore(STORE_PROJECTS);
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch (err) {
      resolve(memoryProjects.get(id) || null);
    }
  });
}

/**
 * Deletes a project from the vault
 */
export async function deleteVaultProject(id: string): Promise<void> {
  const db = await openVaultDB();
  if (!db) {
    memoryProjects.delete(id);
    return;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = tx.objectStore(STORE_PROJECTS);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    } catch {
      memoryProjects.delete(id);
      resolve();
    }
  });
}

/**
 * Saves current working draft for automatic session restoration across browser refreshes
 */
export async function saveActiveDraft(packageBlob: Uint8Array): Promise<void> {
  const item = {
    key: 'active_draft',
    packageBlob,
    updatedAt: Date.now(),
  };

  const db = await openVaultDB();
  if (!db) {
    memorySession.set('active_draft', item);
    return;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_SESSION, 'readwrite');
      const store = tx.objectStore(STORE_SESSION);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    } catch {
      memorySession.set('active_draft', item);
      resolve();
    }
  });
}

/**
 * Retrieves the working draft to restore on page load / refresh
 */
export async function loadActiveDraft(): Promise<Uint8Array | null> {
  const db = await openVaultDB();
  if (!db) {
    return memorySession.get('active_draft')?.packageBlob || null;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_SESSION, 'readonly');
      const store = tx.objectStore(STORE_SESSION);
      const req = store.get('active_draft');
      req.onsuccess = () => {
        resolve(req.result?.packageBlob || null);
      };
      req.onerror = () => resolve(null);
    } catch {
      resolve(memorySession.get('active_draft')?.packageBlob || null);
    }
  });
}

/**
 * Clears the active draft (e.g. when user explicitly starts a new fresh fort)
 */
export async function clearActiveDraft(): Promise<void> {
  const db = await openVaultDB();
  if (!db) {
    memorySession.delete('active_draft');
    return;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_SESSION, 'readwrite');
      const store = tx.objectStore(STORE_SESSION);
      const req = store.delete('active_draft');
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    } catch {
      memorySession.delete('active_draft');
      resolve();
    }
  });
}

export const killaVault = {
  saveProject: saveVaultProject,
  loadProject: loadVaultProject,
  deleteProject: deleteVaultProject,
  listProjects: getVaultProjects,
  saveActiveDraft,
  loadActiveDraft,
  clearActiveDraft,
};


