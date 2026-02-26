import { db } from '../db.js';

const SELECT_COLS = `
  id, project_id as projectId, plot_size as plotSize, rooms_json as roomsJson,
  style, budget_range as budgetRange, constraints_json as constraintsJson,
  vastu, created_at as createdAt, updated_at as updatedAt
`;

export function getRequirements(projectId) {
  return db.prepare(`SELECT ${SELECT_COLS} FROM project_requirements WHERE project_id = ? ORDER BY id DESC LIMIT 1`).get(projectId) ?? null;
}

export function createRequirements({ projectId, plotSize, roomsJson, style, budgetRange, constraintsJson, vastu }) {
  const result = db.prepare(`
    INSERT INTO project_requirements
      (project_id, plot_size, rooms_json, style, budget_range, constraints_json, vastu)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    projectId,
    plotSize ?? null,
    roomsJson ? JSON.stringify(roomsJson) : null,
    style ?? null,
    budgetRange ?? null,
    constraintsJson ? JSON.stringify(constraintsJson) : null,
    vastu ? 1 : 0,
  );
  return getRequirements(projectId);
}
