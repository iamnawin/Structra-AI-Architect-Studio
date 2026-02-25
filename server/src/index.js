import 'dotenv/config';
import express from 'express';
import { createProject, listProjects } from './db.js';

const app = express();
const port = Number(process.env.API_PORT || 8787);

app.use(express.json());

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
