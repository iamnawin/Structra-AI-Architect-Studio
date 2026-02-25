import { motion } from 'motion/react';
import { PIPELINE_STAGES, WORKFLOW_ICON, WORKFLOW_STEPS } from '../../data/landingContent';

export function WorkflowSection() {
  const WorkflowIcon = WORKFLOW_ICON;

  return (
    <section id="workflow" className="mt-32 py-20 bg-emerald-900 rounded-[3rem] text-white px-12 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-800 rounded-full blur-[120px] -mr-48 -mt-48 opacity-50" />
      <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-5xl font-light tracking-tight mb-8">The AI Architect Workflow</h2>
          <div className="space-y-8">
            {WORKFLOW_STEPS.map((step) => (
              <div key={step} className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-1">
                  <WorkflowIcon className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-lg font-light opacity-80">{step}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <div className="font-mono text-xs text-emerald-400 mb-4 uppercase tracking-widest">AI Pipeline Status</div>
          <div className="space-y-6">
            {PIPELINE_STAGES.map((stage) => (
              <div key={stage.name}>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-60">{stage.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      stage.tone === 'emerald'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400 animate-pulse'
                    }`}
                  >
                    {stage.status}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-3">
                  {stage.progressClass === 'animated' ? (
                    <motion.div
                      animate={{ width: ['30%', '70%', '60%'] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="h-full bg-amber-500"
                    />
                  ) : (
                    <div className="h-full bg-emerald-500 w-full" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
