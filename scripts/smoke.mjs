import { spawn } from 'node:child_process';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(path, options) {
  const response = await fetch(`http://127.0.0.1:8787${path}`, options);
  const json = await response.json();
  return { status: response.status, json };
}

async function run() {
  const api = spawn('node', ['server/src/index.js'], {
    stdio: 'inherit',
  });

  try {
    await sleep(700);

    const health = await request('/api/v1/health');
    if (health.status !== 200 || health.json.status !== 'ok') {
      throw new Error('health check failed');
    }

    const created = await request('/api/v1/projects', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title: 'Smoke Project', location: 'Chennai' }),
    });

    if (created.status !== 201 || !created.json.project?.id) {
      throw new Error('project creation failed');
    }

    const projectId = created.json.project.id;

    const requirements = await request(`/api/v1/projects/${projectId}/requirements`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        plotSize: '30x40',
        rooms: ['Living', 'Kitchen', 'Bedroom'],
        style: 'Contemporary',
        budgetRange: '50L-70L',
        constraints: { vastu: true },
      }),
    });

    if (requirements.status !== 201 || requirements.json.requirements?.rooms?.length !== 3) {
      throw new Error('requirements save failed');
    }

    const version = await request(`/api/v1/projects/${projectId}/versions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ provider: 'mock' }),
    });

    if (version.status !== 201 || !version.json.version?.id) {
      throw new Error('version creation failed');
    }

    const versions = await request(`/api/v1/projects/${projectId}/versions`);
    if (versions.status !== 200 || !Array.isArray(versions.json.versions) || versions.json.versions.length === 0) {
      throw new Error('versions list failed');
    }

    console.log('Smoke test passed.');
  } finally {
    api.kill('SIGTERM');
  }
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
