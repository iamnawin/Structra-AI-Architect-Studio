import React, { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, Cpu, FileText, Home, Layers, Plus, RefreshCw, Sparkles, Wand2 } from 'lucide-react';
import { api, Project, Requirements, Version } from '../lib/api';
import { StatusBadge } from '../components/ui/Badge';

const ROOM_OPTIONS = ['Living Room', 'Master Bedroom', 'Bedroom', 'Kitchen', 'Dining Room', 'Study', 'Puja Room', 'Guest Room', 'Balcony', 'Garage'];
const STYLE_OPTIONS = ['Contemporary', 'Modern Minimalist', 'Traditional', 'Colonial', 'Mediterranean', 'Industrial', 'Tropical', 'Transitional'];

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const projectId = Number(id);

  const [project, setProject] = useState<Project | null>(null);
  const [requirements, setRequirements] = useState<Requirements | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requirements' | 'versions'>('requirements');

  // Requirements form state
  const [plotSize, setPlotSize] = useState('');
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [style, setStyle] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [vastu, setVastu] = useState(false);
  const [savingReqs, setSavingReqs] = useState(false);
  const [reqSaved, setReqSaved] = useState(false);

  // Version generation
  const [genPrompt, setGenPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const [projectData, reqData, versionsData] = await Promise.all([
        api.projects.get(projectId),
        api.requirements.get(projectId),
        api.versions.list(projectId),
      ]);
      setProject(projectData.project);
      if (reqData.requirements) {
        const r = reqData.requirements;
        setRequirements(r);
        setPlotSize(r.plotSize ?? '');
        setSelectedRooms(r.roomsJson ? JSON.parse(r.roomsJson) : []);
        setStyle(r.style ?? '');
        setBudgetRange(r.budgetRange ?? '');
        setVastu(Boolean(r.vastu));
      }
      setVersions(versionsData.versions);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  // Poll versions that are queued or running
  useEffect(() => {
    const hasActive = versions.some((v) => v.status === 'queued' || v.status === 'running');
    if (hasActive && !pollingRef.current) {
      pollingRef.current = setInterval(async () => {
        const data = await api.versions.list(projectId);
        setVersions(data.versions);
        const stillActive = data.versions.some((v) => v.status === 'queued' || v.status === 'running');
        if (!stillActive && pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }, 3000);
    }
    return () => {
      if (!hasActive && pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [versions, projectId]);

  async function handleSaveRequirements(e: FormEvent) {
    e.preventDefault();
    setSavingReqs(true);
    try {
      await api.requirements.create(projectId, {
        plotSize,
        rooms: selectedRooms,
        style,
        budgetRange,
        vastu,
      });
      setReqSaved(true);
      setTimeout(() => setReqSaved(false), 2000);
      await load();
    } finally {
      setSavingReqs(false);
    }
  }

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();
    setGenerating(true);
    try {
      await api.versions.create(projectId, { prompt: genPrompt });
      setGenPrompt('');
      setActiveTab('versions');
      await load();
    } finally {
      setGenerating(false);
    }
  }

  function toggleRoom(room: string) {
    setSelectedRooms((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room],
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f2ed] flex items-center justify-center">
        <div className="text-black/40 animate-pulse">Loading project…</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#f5f2ed] flex flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-light">Project not found</h2>
        <Link to="/dashboard" className="text-emerald-600 hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f2ed]">
      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-black/50 mb-8">
          <Link to="/dashboard" className="hover:text-black flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-black font-medium">{project.title}</span>
        </div>

        {/* Project header */}
        <div className="bg-white rounded-3xl p-8 border border-black/5 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Home className="w-5 h-5 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-light tracking-tight">{project.title}</h1>
              </div>
              <p className="text-black/50">{project.location}</p>
            </div>
            <div className="text-right text-sm text-black/30">
              <p>Created</p>
              <p>{new Date(project.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-black/5">
            <div>
              <p className="text-xs text-black/40 uppercase tracking-widest mb-1">Plot Size</p>
              <p className="font-medium">{requirements?.plotSize || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-black/40 uppercase tracking-widest mb-1">Style</p>
              <p className="font-medium">{requirements?.style || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-black/40 uppercase tracking-widest mb-1">Versions</p>
              <p className="font-medium">{versions.length}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 border border-black/5 mb-6 w-fit">
          {(['requirements', 'versions'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${
                activeTab === tab ? 'bg-emerald-600 text-white shadow-sm' : 'text-black/50 hover:text-black'
              }`}
            >
              {tab === 'requirements' ? (
                <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Requirements</span>
              ) : (
                <span className="flex items-center gap-2"><Layers className="w-4 h-4" /> Versions ({versions.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Requirements Tab */}
        {activeTab === 'requirements' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <form onSubmit={handleSaveRequirements} className="bg-white rounded-3xl p-8 border border-black/5 space-y-6">
              <h2 className="text-xl font-medium">Project Requirements</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Plot Size</label>
                  <input
                    className="w-full border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. 30x40 ft or 1200 sqft"
                    value={plotSize}
                    onChange={(e) => setPlotSize(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Architecture Style</label>
                  <select
                    className="w-full border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                  >
                    <option value="">Select a style…</option>
                    {STYLE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Budget Range</label>
                  <input
                    className="w-full border border-black/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. ₹50L – ₹80L"
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="vastu"
                    checked={vastu}
                    onChange={(e) => setVastu(e.target.checked)}
                    className="w-5 h-5 accent-emerald-600 rounded"
                  />
                  <label htmlFor="vastu" className="text-sm font-medium cursor-pointer">Follow Vastu Shastra principles</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Rooms Required</label>
                <div className="flex flex-wrap gap-2">
                  {ROOM_OPTIONS.map((room) => (
                    <button
                      key={room}
                      type="button"
                      onClick={() => toggleRoom(room)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedRooms.includes(room)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      {selectedRooms.includes(room) ? '✓ ' : '+ '}{room}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={savingReqs}
                  className="bg-black text-white px-8 py-3 rounded-2xl font-semibold hover:bg-black/80 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {savingReqs ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  {savingReqs ? 'Saving…' : 'Save Requirements'}
                </button>
                {reqSaved && <span className="text-emerald-600 text-sm font-medium">✓ Saved</span>}
              </div>
            </form>

            {/* Quick generate */}
            {requirements && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mt-6 bg-emerald-900 rounded-3xl p-8 text-white"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-emerald-400" />
                  <h3 className="text-xl font-light">Generate Design Concept</h3>
                </div>
                <p className="text-white/60 text-sm mb-6">AI will create a floor plan, BOQ, and render prompt based on your requirements.</p>
                <form onSubmit={handleGenerate} className="flex gap-3">
                  <input
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    placeholder="Optional: any specific additions or notes…"
                    value={genPrompt}
                    onChange={(e) => setGenPrompt(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={generating}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-semibold transition-colors disabled:opacity-60"
                  >
                    {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    {generating ? 'Queuing…' : 'Generate'}
                  </button>
                </form>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Versions Tab */}
        {activeTab === 'versions' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Generate button */}
            <form onSubmit={handleGenerate} className="bg-white rounded-2xl p-4 border border-black/5 flex gap-3 items-center">
              <Plus className="w-5 h-5 text-black/40 shrink-0" />
              <input
                className="flex-1 text-sm focus:outline-none placeholder:text-black/30"
                placeholder="Optional prompt for next version… or leave blank to use requirements"
                value={genPrompt}
                onChange={(e) => setGenPrompt(e.target.value)}
              />
              <button
                type="submit"
                disabled={generating || !requirements}
                title={!requirements ? 'Save requirements first' : ''}
                className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                {generating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                {generating ? 'Queuing…' : 'Generate New Version'}
              </button>
            </form>

            {versions.length === 0 ? (
              <div className="text-center py-16 text-black/40">
                <Cpu className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No versions yet. Save requirements and generate your first design concept.</p>
              </div>
            ) : (
              versions.map((version, i) => (
                <VersionCard key={version.id} version={version} projectId={projectId} index={i} />
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function VersionCard({ version, projectId, index }: { key?: React.Key | null; version: Version; projectId: number; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const summary = version.summaryJson ? JSON.parse(version.summaryJson) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-white rounded-2xl border border-black/5 overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-6 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0 font-bold text-emerald-700">
          v{version.versionNo}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <StatusBadge status={version.status} />
            <span className="text-xs text-black/30">{new Date(version.createdAt).toLocaleString('en-IN')}</span>
          </div>
          {summary?.summary && (
            <p className="text-sm text-black/60 truncate">{summary.summary}</p>
          )}
          {version.prompt && (
            <p className="text-xs text-black/40 mt-0.5 italic truncate">"{version.prompt}"</p>
          )}
        </div>
        <ChevronRight className={`w-5 h-5 text-black/20 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && summary && version.status === 'completed' && (
        <div className="px-6 pb-6 border-t border-black/5 pt-4 space-y-6">
          {/* Floor Plan */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-black/40 mb-3">Floor Plan</h4>
            <div className="grid sm:grid-cols-2 gap-2">
              {summary.floorPlan?.rooms?.map((room: { name: string; area: string }) => (
                <div key={room.name} className="flex justify-between items-center bg-emerald-50/60 rounded-xl px-4 py-2.5">
                  <span className="text-sm font-medium">{room.name}</span>
                  <span className="text-xs text-black/50 font-mono">{room.area}</span>
                </div>
              ))}
            </div>
            {summary.floorPlan?.totalArea && (
              <p className="text-xs text-black/40 mt-2">Total built-up area: ~{summary.floorPlan.totalArea} sqft</p>
            )}
          </div>

          {/* BOQ */}
          {summary.boqItems?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-black/40 mb-3">Bill of Quantities (Estimate)</h4>
              <div className="rounded-xl overflow-hidden border border-black/5">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-black/50 text-xs uppercase tracking-wide">
                    <tr>
                      <th className="text-left px-4 py-2.5">Item</th>
                      <th className="text-right px-4 py-2.5">Qty</th>
                      <th className="text-right px-4 py-2.5">Est. Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.boqItems.map((item: { item: string; qty: number; unit: string; estimatedCost: string }, j: number) => (
                      <tr key={j} className="border-t border-black/5">
                        <td className="px-4 py-2.5">{item.item}</td>
                        <td className="px-4 py-2.5 text-right text-black/50">{item.qty} {item.unit}</td>
                        <td className="px-4 py-2.5 text-right font-medium">{item.estimatedCost}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-emerald-50">
                    <tr>
                      <td colSpan={2} className="px-4 py-2.5 text-sm font-bold">Total Estimate</td>
                      <td className="px-4 py-2.5 text-right font-bold text-emerald-700">{summary.estimatedCost}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Render Prompt */}
          {summary.renderPrompt && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-black/40 mb-2">Render Prompt</h4>
              <p className="text-sm text-black/60 bg-gray-50 rounded-xl p-4 italic leading-relaxed">{summary.renderPrompt}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Link
              to={`/projects/${projectId}/versions/${version.id}`}
              className="text-sm text-emerald-600 font-semibold hover:underline flex items-center gap-1"
            >
              View Full Details <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {expanded && version.status === 'failed' && (
        <div className="px-6 pb-6 border-t border-black/5 pt-4">
          <p className="text-sm text-red-600 bg-red-50 rounded-xl p-4">
            Generation failed: {summary?.error ?? 'Unknown error. Please try again.'}
          </p>
        </div>
      )}

      {expanded && (version.status === 'queued' || version.status === 'running') && (
        <div className="px-6 pb-6 border-t border-black/5 pt-4">
          <div className="flex items-center gap-3 text-sm text-black/50">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            AI is generating your design… (auto-refreshes)
          </div>
        </div>
      )}
    </motion.div>
  );
}
