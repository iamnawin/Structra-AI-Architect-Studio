import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { api, Version } from '../lib/api';
import { StatusBadge } from '../components/ui/Badge';

export function VersionDetail() {
  const { id, versionId } = useParams<{ id: string; versionId: string }>();
  const [version, setVersion] = useState<Version | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await api.versions.get(Number(id), Number(versionId));
      setVersion(data.version);
    } finally {
      setLoading(false);
    }
  }, [id, versionId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="min-h-screen bg-[#f5f2ed] flex items-center justify-center text-black/40 animate-pulse">Loading…</div>;
  if (!version) return (
    <div className="min-h-screen bg-[#f5f2ed] flex flex-col items-center justify-center gap-4">
      <p>Version not found</p>
      <Link to={`/projects/${id}`} className="text-emerald-600 hover:underline">Back to project</Link>
    </div>
  );

  const summary = version.summary ?? (version.summaryJson ? JSON.parse(version.summaryJson) : null);

  return (
    <div className="min-h-screen bg-[#f5f2ed]">
      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="flex items-center gap-2 text-sm text-black/50 mb-8">
          <Link to="/dashboard" className="hover:text-black transition-colors">Dashboard</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/projects/${id}`} className="hover:text-black flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Project
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-black font-medium">Version {version.versionNo}</span>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-black/5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center font-bold text-emerald-700 text-lg">
              v{version.versionNo}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-light">Design Version {version.versionNo}</h1>
                <StatusBadge status={version.status} />
              </div>
              <p className="text-black/40 text-sm mt-1">
                {new Date(version.createdAt).toLocaleString('en-IN')} · via {version.provider}
              </p>
            </div>
          </div>

          {summary && version.status === 'completed' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-black/40 mb-2">Design Summary</h3>
                <p className="text-black/80 leading-relaxed">{summary.summary}</p>
              </div>
              {summary.renderPrompt && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-black/40 mb-2">Render Prompt</h3>
                  <p className="text-sm italic text-black/60 bg-gray-50 p-4 rounded-xl leading-relaxed">{summary.renderPrompt}</p>
                </div>
              )}
            </div>
          )}

          {version.status === 'queued' || version.status === 'running' ? (
            <p className="text-black/50 text-sm">Generation in progress… please refresh in a moment.</p>
          ) : null}

          {version.status === 'failed' && summary?.error && (
            <p className="text-red-600 text-sm bg-red-50 rounded-xl p-4">{summary.error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
