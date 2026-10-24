import Database from 'better-sqlite3'
import { DB_PATH, DEFAULT_ABOUT_IMAGE } from './config.js'

export const db = new Database(DB_PATH)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL DEFAULT '',
    sender_name TEXT,
    recipient_name TEXT,
    image_file TEXT,
    music_json TEXT,
    paper TEXT NOT NULL DEFAULT 'cream',
    ink TEXT NOT NULL DEFAULT 'ink',
    font TEXT NOT NULL DEFAULT 'hand',
    doodle TEXT NOT NULL DEFAULT 'star',
    owner_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS notes_created_at_idx
    ON notes (created_at DESC);

  CREATE INDEX IF NOT EXISTS notes_owner_hash_idx
    ON notes (owner_hash);

  CREATE TABLE IF NOT EXISTS about (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    text TEXT NOT NULL DEFAULT '',
    image_file TEXT,
    owner_hash TEXT,
    updated_at TEXT NOT NULL
  );
`)

export const DEFAULT_ABOUT_TEXT =
  'A little space for unsent words, hidden feelings, and quiet confessions. Leave a note, share a memory, and let your words find their way to someone.'

const now = new Date().toISOString()

db.prepare(
  `INSERT OR IGNORE INTO about (id, text, image_file, owner_hash, updated_at)
   VALUES (1, ?, ?, NULL, ?)`,
).run(DEFAULT_ABOUT_TEXT, DEFAULT_ABOUT_IMAGE, now)

export interface NoteMusic {
  trackId: string
  title: string
  artist: string
  artworkUrl: string
  previewUrl: string
}

export interface NoteRow {
  id: string
  text: string
  sender_name: string | null
  recipient_name: string | null
  image_file: string | null
  music_json: string | null
  paper: string
  ink: string
  font: string
  doodle: string
  owner_hash: string
  created_at: string
  updated_at: string
}

export interface PublicNote {
  id: string
  text: string
  senderName: string | null
  recipientName: string | null
  imageUrl: string | null
  music: NoteMusic | null
  design: {
    paper: string
    ink: string
    font: string
    doodle: string
  }
  createdAt: string
  updatedAt: string
}

export interface AboutRow {
  id: number
  text: string
  image_file: string | null
  owner_hash: string | null
  updated_at: string
}

function parseMusic(raw: string | null): NoteMusic | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<NoteMusic>
    if (
      typeof parsed.trackId === 'string' &&
      typeof parsed.title === 'string' &&
      typeof parsed.artist === 'string' &&
      typeof parsed.artworkUrl === 'string' &&
      typeof parsed.previewUrl === 'string'
    ) {
      return {
        trackId: parsed.trackId,
        title: parsed.title,
        artist: parsed.artist,
        artworkUrl: parsed.artworkUrl,
        previewUrl: parsed.previewUrl,
      }
    }
  } catch {
    // A malformed row should not break the feed.
  }
  return null
}

export function toPublicNote(row: NoteRow): PublicNote {
  return {
    id: row.id,
    text: row.text,
    senderName: row.sender_name,
    recipientName: row.recipient_name,
    imageUrl: row.image_file ? `/uploads/${row.image_file}` : null,
    music: parseMusic(row.music_json),
    design: {
      paper: row.paper,
      ink: row.ink,
      font: row.font,
      doodle: row.doodle,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function getFeed(): NoteRow[] {
  return db
    .prepare('SELECT * FROM notes ORDER BY created_at DESC, rowid DESC LIMIT 200')
    .all() as NoteRow[]
}

export function getNotesForOwner(ownerHash: string): NoteRow[] {
  return db
    .prepare(
      'SELECT * FROM notes WHERE owner_hash = ? ORDER BY created_at DESC, rowid DESC',
    )
    .all(ownerHash) as NoteRow[]
}

export function getNote(id: string): NoteRow | undefined {
  return db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as
    | NoteRow
    | undefined
}

export function getAbout(): AboutRow {
  return db.prepare('SELECT * FROM about WHERE id = 1').get() as AboutRow
}

export function updateAbout(
  text: string,
  imageFile: string | null,
  ownerHash: string,
): void {
  db.prepare(
    `UPDATE about
     SET text = ?, image_file = ?, owner_hash = ?, updated_at = ?
     WHERE id = 1`,
  ).run(text, imageFile, ownerHash, new Date().toISOString())
}
