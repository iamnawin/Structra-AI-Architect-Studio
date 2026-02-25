import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const dataDir = path.resolve('server/data');
fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'structra.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

export function listProjects() {
  return db
    .prepare('SELECT id, title, location, created_at as createdAt FROM projects ORDER BY id DESC')
    .all();
}

export function createProject({ title, location }) {
  const insert = db.prepare('INSERT INTO projects (title, location) VALUES (?, ?)');
  const result = insert.run(title, location);
  return db
    .prepare('SELECT id, title, location, created_at as createdAt FROM projects WHERE id = ?')
    .get(result.lastInsertRowid);
}
