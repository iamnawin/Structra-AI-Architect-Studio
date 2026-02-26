-- Migration 002: Project requirements and design versions
CREATE TABLE IF NOT EXISTS project_requirements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  plot_size TEXT,
  rooms_json TEXT,
  style TEXT,
  budget_range TEXT,
  constraints_json TEXT,
  vastu INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE IF NOT EXISTS design_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  version_no INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'queued',
  prompt TEXT,
  summary_json TEXT,
  provider TEXT NOT NULL DEFAULT 'mock',
  cost_estimate REAL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE IF NOT EXISTS exports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version_id INTEGER NOT NULL REFERENCES design_versions(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'pdf',
  path_or_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
