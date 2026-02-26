import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Home, MapPin, Plus, X } from 'lucide-react';
import { api, Project } from '../lib/api';

export function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await api.projects.list();
      setProjects(data.projects);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !location.trim()) return;
    setCreating(true);
    setError('');
    try {
      await api.projects.create({ title: title.trim(), location: location.trim() });
      setTitle('');
      setLocation('');
      setShowNew(false);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f2ed]">
      <div className="max-w-6xl mx-auto px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-light tracking-tight">My Projects</h1>
            <p className="text-black/50 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
          >
            <Plus className="w-5 h-5" /> New Project
          </button>
        </div>

        {/* New project modal */}
        {showNew && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-light tracking-tight">New Project</h2>
                <button onClick={() => setShowNew(false)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Title</label>
                  <input
                    className="w-full border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Modern Villa — Mumbai"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    className="w-full border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Bandra, Mumbai"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNew(false)}
                    className="flex-1 border border-black/10 rounded-xl px-4 py-3 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 bg-emerald-600 text-white rounded-xl px-4 py-3 font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
                  >
                    {creating ? 'Creating…' : 'Create Project'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Projects grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl h-48 animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Home className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-light mb-2">No projects yet</h3>
            <p className="text-black/50 mb-6">Create your first architectural project to get started.</p>
            <button
              onClick={() => setShowNew(true)}
              className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-emerald-700 transition-colors"
            >
              Create First Project
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/projects/${project.id}`}
                  className="block bg-white rounded-3xl p-6 border border-black/5 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <Home className="w-5 h-5 text-emerald-600" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-black/20 group-hover:text-black/60 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-bold text-lg mb-1 truncate">{project.title}</h3>
                  <div className="flex items-center gap-1 text-black/50 text-sm">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{project.location}</span>
                  </div>
                  <p className="text-xs text-black/30 mt-4">
                    {new Date(project.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
