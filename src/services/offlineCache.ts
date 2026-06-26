import { Platform } from 'react-native';
import type { SQLiteDatabase } from 'expo-sqlite';

const DB_NAME = 'taleem_cache.db';
const IS_WEB = Platform.OS === 'web';

const webCache = new Map<string, string>();

let dbPromise: Promise<SQLiteDatabase> | null = null;

function loadSQLite(): typeof import('expo-sqlite') {
  return require('expo-sqlite');
}

async function initDatabase(): Promise<SQLiteDatabase> {
  const SQLite = loadSQLite();
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS cache (
      key        TEXT PRIMARY KEY,
      payload    TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);

  return db;
}

function getDb(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = initDatabase();
  }
  return dbPromise;
}

export async function readCache<T>(key: string): Promise<T | null> {
  if (IS_WEB) {
    const hit = webCache.get(key);
    if (hit === undefined) {
      return null;
    }
    try {
      return JSON.parse(hit) as T;
    } catch {
      return null;
    }
  }

  const db = await getDb();
  const row = await db.getFirstAsync<{ payload: string }>(
    'SELECT payload FROM cache WHERE key = ?',
    key
  );
  if (!row) {
    return null;
  }
  try {
    return JSON.parse(row.payload) as T;
  } catch {
    return null;
  }
}

export async function writeCache(key: string, value: unknown): Promise<void> {
  const payload = JSON.stringify(value);

  if (IS_WEB) {
    webCache.set(key, payload);
    return;
  }

  const db = await getDb();
  await db.runAsync(
    `INSERT INTO cache (key, payload, created_at)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET
       payload = excluded.payload,
       created_at = excluded.created_at`,
    key,
    payload,
    Date.now()
  );
}

export async function clearCache(): Promise<void> {
  if (IS_WEB) {
    webCache.clear();
    return;
  }

  const db = await getDb();
  await db.runAsync('DELETE FROM cache');
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return false;
}

export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const hit = await readCache<T>(key);
  if (hit !== null) {
    return hit;
  }

  const fresh = await fetcher();
  if (!isEmpty(fresh)) {
    await writeCache(key, fresh);
  }
  return fresh;
}

async function revalidate<T>(
  key: string,
  current: T,
  fetcher: () => Promise<T>
): Promise<void> {
  try {
    const fresh = await fetcher();
    if (!isEmpty(fresh) && JSON.stringify(fresh) !== JSON.stringify(current)) {
      await writeCache(key, fresh);
    }
  } catch {
    return;
  }
}

export async function cachedRevalidate<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const hit = await readCache<T>(key);
  if (hit !== null) {
    void revalidate(key, hit, fetcher);
    return hit;
  }

  const fresh = await fetcher();
  if (!isEmpty(fresh)) {
    await writeCache(key, fresh);
  }
  return fresh;
}
