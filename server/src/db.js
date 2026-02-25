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

  CREATE TABLE IF NOT EXISTS project_requirements (
    project_id INTEGER PRIMARY KEY,
    plot_size TEXT NOT NULL,
    rooms_json TEXT NOT NULL,
    style TEXT NOT NULL,
    budget_range TEXT NOT NULL,
    constraints_json TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(project_id) REFERENCES projects(id)
  );

  CREATE TABLE IF NOT EXISTS design_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    version_no INTEGER NOT NULL,
    status TEXT NOT NULL,
    provider TEXT NOT NULL,
    summary_json TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(project_id) REFERENCES projects(id)
  );
`);

export function listProjects() {
  return db
    .prepare('SELECT id, title, location, created_at as createdAt FROM projects ORDER BY id DESC')
    .all();
}

export function getProjectById(id) {
  return db
    .prepare('SELECT id, title, location, created_at as createdAt FROM projects WHERE id = ?')
    .get(id);
}

export function createProject({ title, location }) {
  const insert = db.prepare('INSERT INTO projects (title, location) VALUES (?, ?)');
  const result = insert.run(title, location);
  return getProjectById(result.lastInsertRowid);
}

export function getRequirementsByProjectId(projectId) {
  return db
    .prepare(
      `SELECT
        project_id as projectId,
        plot_size as plotSize,
        rooms_json as roomsJson,
        style,
        budget_range as budgetRange,
        constraints_json as constraintsJson,
        updated_at as updatedAt
       FROM project_requirements
       WHERE project_id = ?`
    )
    .get(projectId);
}

export function upsertRequirementsByProjectId(projectId, payload) {
  const statement = db.prepare(
    `INSERT INTO project_requirements
      (project_id, plot_size, rooms_json, style, budget_range, constraints_json, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(project_id) DO UPDATE SET
      plot_size = excluded.plot_size,
      rooms_json = excluded.rooms_json,
      style = excluded.style,
      budget_range = excluded.budget_range,
      constraints_json = excluded.constraints_json,
      updated_at = CURRENT_TIMESTAMP`
  );

  statement.run(
    projectId,
    payload.plotSize,
    JSON.stringify(payload.rooms),
    payload.style,
    payload.budgetRange,
    JSON.stringify(payload.constraints)
  );

  return getRequirementsByProjectId(projectId);
}

function nextVersionNo(projectId) {
  const row = db
    .prepare('SELECT COALESCE(MAX(version_no), 0) + 1 as versionNo FROM design_versions WHERE project_id = ?')
    .get(projectId);
  return row.versionNo;
}

export function createDesignVersion(projectId, provider = 'mock') {
  const versionNo = nextVersionNo(projectId);
  const requirements = getRequirementsByProjectId(projectId);
  const parsedRooms = requirements ? JSON.parse(requirements.roomsJson) : [];

  const summary = {
    conceptTitle: `Concept v${versionNo}`,
    overview: `A ${requirements?.style ?? 'Contemporary'} home concept for ${parsedRooms.length || 2} key rooms.`,
    recommendedNextStep: 'Review layout and request iteration changes.',
  };

  const insert = db.prepare(
    `INSERT INTO design_versions (project_id, version_no, status, provider, summary_json)
     VALUES (?, ?, 'completed', ?, ?)`
  );

  const result = insert.run(projectId, versionNo, provider, JSON.stringify(summary));

  return db
    .prepare(
      `SELECT id, project_id as projectId, version_no as versionNo, status, provider, summary_json as summaryJson, created_at as createdAt
       FROM design_versions WHERE id = ?`
    )
    .get(result.lastInsertRowid);
}

export function listDesignVersionsByProjectId(projectId) {
  return db
    .prepare(
      `SELECT id, project_id as projectId, version_no as versionNo, status, provider, summary_json as summaryJson, created_at as createdAt
       FROM design_versions WHERE project_id = ?
       ORDER BY version_no DESC`
    )
    .all(projectId);
}
