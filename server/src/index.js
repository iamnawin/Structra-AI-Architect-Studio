import 'dotenv/config';
import express from 'express';
import {
  createDesignVersion,
  createProject,
  getProjectById,
  getRequirementsByProjectId,
  listDesignVersionsByProjectId,
  listProjects,
  upsertRequirementsByProjectId,
} from './db.js';

const app = express();
const port = Number(process.env.API_PORT || 8787);

app.use(express.json());

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

function requireProject(req, res) {
  const projectId = parseId(req.params.id);
  if (!projectId) {
    res.status(400).json({ error: 'invalid project id' });
    return null;
  }

  const project = getProjectById(projectId);
  if (!project) {
    res.status(404).json({ error: 'project not found' });
    return null;
  }

  return { projectId, project };
}

app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', service: 'structra-api', timestamp: new Date().toISOString() });
});

app.get('/api/v1/pipeline/status', (_req, res) => {
  res.json({
    stages: [
      { key: 'intake', status: 'ready' },
      { key: 'layout', status: 'ready' },
      { key: 'render', status: 'pending' },
    ],
  });
});

app.get('/api/v1/projects', (_req, res) => {
  res.json({ projects: listProjects() });
});

app.get('/api/v1/projects/:id', (req, res) => {
  const required = requireProject(req, res);
  if (!required) {
    return;
  }

  res.json({ project: required.project });
});

app.post('/api/v1/projects', (req, res) => {
  const { title, location } = req.body ?? {};
  if (!title || !location) {
    res.status(400).json({ error: 'title and location are required' });
    return;
  }

  const project = createProject({ title: String(title), location: String(location) });
  res.status(201).json({ project });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Structra API running on http://0.0.0.0:${port}`);
});
