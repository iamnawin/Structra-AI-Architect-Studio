import 'dotenv/config';
import express from 'express';
import { requestId } from './middleware/requestId.js';
import { logger } from './middleware/logger.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import projectsRouter from './routes/projects.js';

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

// Security headers
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
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

app.use('/api/v1/projects', projectsRouter);

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
