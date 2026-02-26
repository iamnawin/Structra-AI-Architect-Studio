import { db } from '../db.js';

const SELECT_COLS = `id, title, location, status, created_at as createdAt, updated_at as updatedAt`;

export function listProjects() {
  return db.prepare(`SELECT ${SELECT_COLS} FROM projects ORDER BY id DESC`).all();
}

export function getProject(id) {
  return db.prepare(`SELECT ${SELECT_COLS} FROM projects WHERE id = ?`).get(id) ?? null;
}

export function createProject({ title, location }) {
  const result = db
    .prepare(`INSERT INTO projects (title, location) VALUES (?, ?)`)
    .run(title, location);
  return getProject(result.lastInsertRowid);
}

export function updateProject(id, { title, location, status }) {
  const fields = [];
  const values = [];
  if (title !== undefined) { fields.push('title = ?'); values.push(title); }
  if (location !== undefined) { fields.push('location = ?'); values.push(location); }
  if (status !== undefined) { fields.push('status = ?'); values.push(status); }
  if (fields.length === 0) return getProject(id);

  fields.push(`updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')`);
  values.push(id);

  db.prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  return getProject(id);
}
