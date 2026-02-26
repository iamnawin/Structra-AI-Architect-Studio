import { Router } from 'express';
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
} from '../repositories/projects.js';
import {
  getRequirements,
  createRequirements,
} from '../repositories/requirements.js';
import {
  listVersions,
  getVersion,
  createVersion,
  updateVersionStatus,
} from '../repositories/versions.js';
import { createError } from '../middleware/errorHandler.js';
import { createProvider } from '../services/ai/provider.js';

const router = Router();
const aiProvider = createProvider(process.env);

// --- Projects ---

router.get('/', (_req, res) => {
  res.json({ projects: listProjects() });
});

router.post('/', (req, res, next) => {
  try {
    const { title, location } = req.body ?? {};
    if (!title || !location) {
      return next(createError(400, 'validation_error', 'title and location are required'));
    }
    const project = createProject({ title: String(title), location: String(location) });
    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', (req, res, next) => {
  const project = getProject(Number(req.params.id));
  if (!project) return next(createError(404, 'not_found', 'Project not found'));
  res.json({ project });
});

router.patch('/:id', (req, res, next) => {
  try {
    const project = getProject(Number(req.params.id));
    if (!project) return next(createError(404, 'not_found', 'Project not found'));
    const updated = updateProject(Number(req.params.id), req.body ?? {});
    res.json({ project: updated });
  } catch (err) {
    next(err);
  }
});

// --- Requirements ---

router.get('/:id/requirements', (req, res, next) => {
  const project = getProject(Number(req.params.id));
  if (!project) return next(createError(404, 'not_found', 'Project not found'));
  const requirements = getRequirements(Number(req.params.id));
  res.json({ requirements });
});

router.post('/:id/requirements', (req, res, next) => {
  try {
    const project = getProject(Number(req.params.id));
    if (!project) return next(createError(404, 'not_found', 'Project not found'));

    const { plotSize, rooms, style, budgetRange, constraints, vastu } = req.body ?? {};
    const requirements = createRequirements({
      projectId: Number(req.params.id),
      plotSize,
      roomsJson: rooms,
      style,
      budgetRange,
      constraintsJson: constraints,
      vastu: Boolean(vastu),
    });
    res.status(201).json({ requirements });
  } catch (err) {
    next(err);
  }
});

// --- Versions ---

router.get('/:id/versions', (req, res, next) => {
  const project = getProject(Number(req.params.id));
  if (!project) return next(createError(404, 'not_found', 'Project not found'));
  const versions = listVersions(Number(req.params.id));
  res.json({ versions });
});

router.post('/:id/versions', async (req, res, next) => {
  try {
    const project = getProject(Number(req.params.id));
    if (!project) return next(createError(404, 'not_found', 'Project not found'));

    const requirements = getRequirements(Number(req.params.id));
    const { prompt } = req.body ?? {};

    const version = createVersion({
      projectId: Number(req.params.id),
      prompt,
      provider: aiProvider.name,
    });

    res.status(202).json({
      version,
      estimatedTime: '10-30s',
      message: 'Design generation queued',
    });

    // Run AI generation asynchronously
    setImmediate(async () => {
      try {
        const reqData = requirements
          ? {
              plotSize: requirements.plotSize,
              style: requirements.style,
              budgetRange: requirements.budgetRange,
              rooms: requirements.roomsJson ? JSON.parse(requirements.roomsJson) : null,
              vastu: Boolean(requirements.vastu),
            }
          : null;

        const result = await aiProvider.generateDesign({ requirements: reqData, prompt });
        updateVersionStatus(version.id, {
          status: 'completed',
          summaryJson: result,
          costEstimate: null,
        });
        console.log(`[ai] Version ${version.id} completed via ${aiProvider.name}`);
      } catch (err) {
        updateVersionStatus(version.id, { status: 'failed', summaryJson: { error: err.message } });
        console.error(`[ai] Version ${version.id} failed: ${err.message}`);
      }
    });
  } catch (err) {
    next(err);
  }
});

// --- Single version ---

router.get('/:projectId/versions/:versionId', (req, res, next) => {
  const version = getVersion(Number(req.params.versionId));
  if (!version || version.projectId !== Number(req.params.projectId)) {
    return next(createError(404, 'not_found', 'Version not found'));
  }
  const summary = version.summaryJson ? JSON.parse(version.summaryJson) : null;
  res.json({ version: { ...version, summary } });
});

export default router;
