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

// Core middleware
app.use(express.json({ limit: '2mb' }));
app.use(requestId);
app.use(logger);

// CORS (allow Vite dev server + same-origin prod)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowed = [process.env.APP_URL, 'http://localhost:3000', 'http://localhost:5173'];
  if (!origin || allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin ?? '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-request-id');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

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

// Routes
app.get('/api/v1/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'structra-api',
    version: '0.1.0',
    provider: process.env.AI_PROVIDER ?? 'mock',
    timestamp: new Date().toISOString(),
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

// 404 + error handling (must be last)
app.use(notFound);
app.use(errorHandler);

app.listen(port, '0.0.0.0', () => {
  console.log(JSON.stringify({
    type: 'startup',
    message: `Structra API running on http://0.0.0.0:${port}`,
    provider: process.env.AI_PROVIDER ?? 'mock',
    env: process.env.NODE_ENV ?? 'development',
    ts: new Date().toISOString(),
  }));
});
