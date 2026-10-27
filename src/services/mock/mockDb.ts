import { createSeedDatabase, MOCK_DB_VERSION } from '@/data/seed';
import type { MockDatabase } from '@/data/schema';
import { safeStorage } from '@/lib/storage';

/**
 * In-browser prototype database.
 * Persists non-sensitive sample data to localStorage so demo posts, listings and
 * messages survive a refresh. Nothing here leaves the browser. No passwords,
 * emails or phone numbers are ever stored.
 */
const STORAGE_KEY = 'ks.mockdb';

type Listener = () => void;
const listeners = new Set<Listener>();

let db: MockDatabase = load();

function load(): MockDatabase {
  const raw = safeStorage.get(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as MockDatabase;
      if (parsed.version === MOCK_DB_VERSION) return parsed;
    } catch {
      /* fall through to a fresh seed */
    }
  }
  return createSeedDatabase();
}

let quotaWarned = false;
function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (error) {
    // Storage full or blocked: keep working in memory for this session.
    if (!quotaWarned) {
      quotaWarned = true;
      console.warn('Prototype data could not be saved to this browser. Changes will last until you close the tab.', error);
    }
  }
}

export const mockDb = {
  /** Read the current snapshot. Treat as read-only; use `write` to change it. */
  read(): MockDatabase {
    return db;
  },
  /** Apply a change, persist it and notify subscribers. */
  write<T>(mutate: (draft: MockDatabase) => T): T {
    const result = mutate(db);
    persist();
    listeners.forEach((l) => l());
    return result;
  },
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  reset() {
    db = createSeedDatabase();
    safeStorage.remove(STORAGE_KEY);
    listeners.forEach((l) => l());
  },
};

// Keep tabs in sync: a change in one tab refreshes the others.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return;
    db = load();
    listeners.forEach((l) => l());
  });
}

let idCounter = 0;
export function newId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}${idCounter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export const nowIso = () => new Date().toISOString();
