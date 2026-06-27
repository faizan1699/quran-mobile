import { Platform } from 'react-native';
import type { SQLiteDatabase } from 'expo-sqlite';

const DB_NAME = 'taleem_notes.db';
const SCHEMA_VERSION = 1;
const IS_WEB = Platform.OS === 'web';

export const NOTE_COLORS = ['green', 'gold', 'blue', 'rose', 'purple'] as const;

export type NoteColor = (typeof NOTE_COLORS)[number];

export interface Note {
  id: number;
  title: string;
  body: string;
  surahNumber: number | null;
  ayahNumber: number | null;
  surahName: string | null;
  color: NoteColor | null;
  isPinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface NoteInput {
  title: string;
  body: string;
  surahNumber?: number | null;
  ayahNumber?: number | null;
  surahName?: string | null;
  color?: NoteColor | null;
}

interface NoteRow {
  id: number;
  title: string;
  body: string;
  surah_number: number | null;
  ayah_number: number | null;
  surah_name: string | null;
  color: string | null;
  is_pinned: number;
  created_at: number;
  updated_at: number;
}

function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    surahNumber: row.surah_number,
    ayahNumber: row.ayah_number,
    surahName: row.surah_name,
    color: (row.color as NoteColor | null) ?? null,
    isPinned: row.is_pinned === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

let webNotes: Note[] = [];
let webSeq = 1;

function webSorted(list: Note[]): Note[] {
  return [...list].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }
    return b.updatedAt - a.updatedAt;
  });
}

function webListNotes(search?: string): Note[] {
  const q = (search ?? '').trim().toLowerCase();
  let list = webNotes;
  if (q.length > 0) {
    list = list.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        (n.surahName ?? '').toLowerCase().includes(q)
    );
  }
  return webSorted(list).map((n) => ({ ...n }));
}

let dbPromise: Promise<SQLiteDatabase> | null = null;

function loadSQLite(): typeof import('expo-sqlite') {
  return require('expo-sqlite');
}

async function initDatabase(): Promise<SQLiteDatabase> {
  const SQLite = loadSQLite();
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS notes (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      title        TEXT    NOT NULL DEFAULT '',
      body         TEXT    NOT NULL DEFAULT '',
      surah_number INTEGER,
      ayah_number  INTEGER,
      surah_name   TEXT,
      color        TEXT,
      is_pinned    INTEGER NOT NULL DEFAULT 0,
      created_at   INTEGER NOT NULL,
      updated_at   INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_notes_pinned_updated
      ON notes (is_pinned DESC, updated_at DESC);
  `);

  await runMigrations(db);
  return db;
}

async function runMigrations(db: SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  const current = result?.user_version ?? 0;
  if (current >= SCHEMA_VERSION) {
    return;
  }
  await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}

function getDb(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = initDatabase();
  }
  return dbPromise;
}

export async function listNotes(search?: string): Promise<Note[]> {
  if (IS_WEB) {
    return webListNotes(search);
  }
  const db = await getDb();
  const trimmed = (search ?? '').trim();

  if (trimmed.length > 0) {
    const like = `%${escapeLike(trimmed)}%`;
    const rows = await db.getAllAsync<NoteRow>(
      `SELECT * FROM notes
       WHERE title LIKE ? ESCAPE '\\'
          OR body LIKE ? ESCAPE '\\'
          OR surah_name LIKE ? ESCAPE '\\'
       ORDER BY is_pinned DESC, updated_at DESC`,
      like,
      like,
      like
    );
    return rows.map(rowToNote);
  }

  const rows = await db.getAllAsync<NoteRow>(
    `SELECT * FROM notes ORDER BY is_pinned DESC, updated_at DESC`
  );
  return rows.map(rowToNote);
}

export async function listNotesForSurah(surahNumber: number): Promise<Note[]> {
  if (IS_WEB) {
    return webNotes
      .filter((n) => n.surahNumber === surahNumber && n.ayahNumber != null)
      .sort(
        (a, b) =>
          (a.ayahNumber ?? 0) - (b.ayahNumber ?? 0) || b.updatedAt - a.updatedAt
      )
      .map((n) => ({ ...n }));
  }
  const db = await getDb();
  const rows = await db.getAllAsync<NoteRow>(
    `SELECT * FROM notes
     WHERE surah_number = ? AND ayah_number IS NOT NULL
     ORDER BY ayah_number ASC, updated_at DESC`,
    surahNumber
  );
  return rows.map(rowToNote);
}

export async function getNote(id: number): Promise<Note | null> {
  if (IS_WEB) {
    const n = webNotes.find((x) => x.id === id);
    return n ? { ...n } : null;
  }
  const db = await getDb();
  const row = await db.getFirstAsync<NoteRow>(
    'SELECT * FROM notes WHERE id = ?',
    id
  );
  return row ? rowToNote(row) : null;
}

export async function createNote(input: NoteInput): Promise<Note> {
  const now = Date.now();
  if (IS_WEB) {
    const note: Note = {
      id: webSeq++,
      title: input.title.trim(),
      body: input.body,
      surahNumber: input.surahNumber ?? null,
      ayahNumber: input.ayahNumber ?? null,
      surahName: input.surahName ?? null,
      color: input.color ?? null,
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    };
    webNotes.push(note);
    return { ...note };
  }
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO notes
       (title, body, surah_number, ayah_number, surah_name, color, is_pinned, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    input.title.trim(),
    input.body,
    input.surahNumber ?? null,
    input.ayahNumber ?? null,
    input.surahName ?? null,
    input.color ?? null,
    now,
    now
  );
  const created = await getNote(result.lastInsertRowId);
  if (!created) {
    throw new Error('Failed to read back created note');
  }
  return created;
}

export async function updateNote(id: number, input: NoteInput): Promise<void> {
  const now = Date.now();
  if (IS_WEB) {
    const n = webNotes.find((x) => x.id === id);
    if (n) {
      n.title = input.title.trim();
      n.body = input.body;
      n.surahNumber = input.surahNumber ?? null;
      n.ayahNumber = input.ayahNumber ?? null;
      n.surahName = input.surahName ?? null;
      n.color = input.color ?? null;
      n.updatedAt = now;
    }
    return;
  }
  const db = await getDb();
  await db.runAsync(
    `UPDATE notes SET
       title = ?,
       body = ?,
       surah_number = ?,
       ayah_number = ?,
       surah_name = ?,
       color = ?,
       updated_at = ?
     WHERE id = ?`,
    input.title.trim(),
    input.body,
    input.surahNumber ?? null,
    input.ayahNumber ?? null,
    input.surahName ?? null,
    input.color ?? null,
    now,
    id
  );
}

export async function deleteNote(id: number): Promise<void> {
  if (IS_WEB) {
    webNotes = webNotes.filter((x) => x.id !== id);
    return;
  }
  const db = await getDb();
  await db.runAsync('DELETE FROM notes WHERE id = ?', id);
}

export async function setNotePinned(id: number, pinned: boolean): Promise<void> {
  if (IS_WEB) {
    const n = webNotes.find((x) => x.id === id);
    if (n) {
      n.isPinned = pinned;
    }
    return;
  }
  const db = await getDb();
  await db.runAsync(
    'UPDATE notes SET is_pinned = ? WHERE id = ?',
    pinned ? 1 : 0,
    id
  );
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}
