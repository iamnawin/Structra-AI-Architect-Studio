import { db } from '../db.js';

const SELECT_COLS = `
  id, project_id as projectId, version_no as versionNo, status,
  prompt, summary_json as summaryJson, provider, cost_estimate as costEstimate,
  created_at as createdAt, updated_at as updatedAt
`;

export function listVersions(projectId) {
  return db.prepare(`SELECT ${SELECT_COLS} FROM design_versions WHERE project_id = ? ORDER BY version_no DESC`).all(projectId);
}

export function getVersion(id) {
  return db.prepare(`SELECT ${SELECT_COLS} FROM design_versions WHERE id = ?`).get(id) ?? null;
}

export function createVersion({ projectId, prompt, provider }) {
  const lastVersion = db.prepare(
    `SELECT MAX(version_no) as max FROM design_versions WHERE project_id = ?`
  ).get(projectId);
  const versionNo = (lastVersion?.max ?? 0) + 1;

  const result = db.prepare(`
    INSERT INTO design_versions (project_id, version_no, status, prompt, provider)
    VALUES (?, ?, 'queued', ?, ?)
  `).run(projectId, versionNo, prompt ?? null, provider ?? 'mock');

  return getVersion(result.lastInsertRowid);
}

export function updateVersionStatus(id, { status, summaryJson, costEstimate }) {
  db.prepare(`
    UPDATE design_versions
    SET status = ?,
        summary_json = ?,
        cost_estimate = ?,
        updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
    WHERE id = ?
  `).run(status, summaryJson ? JSON.stringify(summaryJson) : null, costEstimate ?? null, id);
  return getVersion(id);
}
