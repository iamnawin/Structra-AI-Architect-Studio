import { FormEvent, useEffect, useState } from 'react';

type Project = {
  id: number;
  title: string;
  location: string;
  createdAt: string;
};

export function MvpKickoffSection() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [health, setHealth] = useState('checking');

  async function refreshProjects() {
    const response = await fetch('/api/v1/projects');
    const data = await response.json();
    setProjects(data.projects ?? []);
  }

  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => res.json())
      .then((data) => setHealth(data.status === 'ok' ? 'connected' : 'degraded'))
      .catch(() => setHealth('offline'));

    refreshProjects().catch(() => setProjects([]));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title || !location) {
      return;
    }

    const response = await fetch('/api/v1/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, location }),
    });

    if (!response.ok) {
      return;
    }

    setTitle('');
    setLocation('');
    await refreshProjects();
  }

  return (
    <section className="mt-20 bg-white rounded-3xl border border-black/5 p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-light tracking-tight">MVP Kickoff Console</h2>
        <span className="text-xs font-mono uppercase tracking-widest px-2 py-1 rounded bg-emerald-50 text-emerald-700">
          API {health}
        </span>
      </div>

      <form className="grid md:grid-cols-3 gap-3" onSubmit={onSubmit}>
        <input
          className="border border-black/10 rounded-xl px-4 py-3"
          placeholder="Project title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <input
          className="border border-black/10 rounded-xl px-4 py-3"
          placeholder="Location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />
        <button className="bg-emerald-600 text-white rounded-xl px-4 py-3 font-semibold hover:bg-emerald-700 transition-colors">
          Create Project
        </button>
      </form>

      <div className="mt-6 space-y-3">
        {projects.length === 0 ? (
          <p className="text-black/50 text-sm">No projects yet. Create your first one above.</p>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="border border-black/5 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-medium">{project.title}</p>
                <p className="text-black/50 text-sm">{project.location}</p>
              </div>
              <span className="text-xs text-black/40">#{project.id}</span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
