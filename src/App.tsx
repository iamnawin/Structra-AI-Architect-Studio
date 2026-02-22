/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  Home, 
  Layers, 
  Box, 
  Glasses, 
  ArrowRight, 
  CheckCircle2, 
  FileText,
  Sparkles
} from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-[#f5f2ed] text-[#1a1a1a] font-sans selection:bg-emerald-100">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-black/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Home className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">ArchAI</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest opacity-60">
          <a href="#features" className="hover:opacity-100 transition-opacity">Features</a>
          <a href="#workflow" className="hover:opacity-100 transition-opacity">Workflow</a>
          <a href="#docs" className="hover:opacity-100 transition-opacity">Documentation</a>
        </div>
        <button className="bg-emerald-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
          Start Designing
        </button>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 py-20">
        <div className="grid lg:grid-template-columns-[1fr_1fr] gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3 h-3" />
              AI-Powered Architecture
            </div>
            <h1 className="text-7xl font-light leading-[0.9] tracking-tighter mb-8">
              Design your <br />
              <span className="font-serif italic text-emerald-900">dream home</span> <br />
              in minutes.
            </h1>
            <p className="text-lg text-black/60 max-w-md mb-10 leading-relaxed">
              From abstract ideas to professional 2D plans, photorealistic 3D renders, and immersive VR walkthroughs. Powered by Gemini 3.1 Pro.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-black text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
                Create New Project <ArrowRight className="w-5 h-5" />
              </button>
              <button className="border border-black/10 px-8 py-4 rounded-2xl font-bold hover:bg-white transition-all">
                View Sample Designs
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl"
          >
            <img 
              src="https://picsum.photos/seed/architecture/1200/1200" 
              alt="Modern Architecture" 
              className="object-cover w-full h-full"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-medium">Concept #03: Minimalist Villa</span>
                <span className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded uppercase">Final Render</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-1 bg-white/40 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 w-full" />
                </div>
                <div className="h-1 bg-white/40 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 w-full" />
                </div>
                <div className="h-1 bg-white/40 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 w-full" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <section id="features" className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light tracking-tight mb-4">Comprehensive AI Toolkit</h2>
            <p className="text-black/50">Everything you need from concept to construction.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Layers, title: "2D Plan Set", desc: "Auto-generated scaled floor plans and elevations." },
              { icon: Box, title: "3D Modeling", desc: "Instant glTF models ready for export or rendering." },
              { icon: Glasses, title: "VR Walkthrough", desc: "360° panoramas and WebXR immersive experiences." },
              { icon: FileText, title: "BOQ Estimates", desc: "Accurate bill of quantities for budget planning." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 bg-white rounded-3xl border border-black/5 shadow-sm"
              >
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="text-emerald-600 w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-black/50 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="mt-32 py-20 bg-emerald-900 rounded-[3rem] text-white px-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-800 rounded-full blur-[120px] -mr-48 -mt-48 opacity-50" />
          <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl font-light tracking-tight mb-8">The AI Architect Workflow</h2>
              <div className="space-y-8">
                {[
                  "Intake requirements via natural language",
                  "Upload existing blueprints for AI parsing",
                  "Generate 3 distinct concept options",
                  "Iterate and refine with conversational AI",
                  "Export high-fidelity assets and documentation"
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-lg font-light opacity-80">{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
              <div className="font-mono text-xs text-emerald-400 mb-4 uppercase tracking-widest">AI Pipeline Status</div>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-60">Spatial Reasoning</span>
                  <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">Completed</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-full" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-60">3D Geometry Synthesis</span>
                  <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">Completed</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-full" />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-60">Photorealistic Rendering</span>
                  <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded animate-pulse">Processing</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: ["30%", "70%", "60%"] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="h-full bg-amber-500" 
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 py-12 px-8 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-600 rounded flex items-center justify-center">
              <Home className="text-white w-4 h-4" />
            </div>
            <span className="font-bold tracking-tight">ArchAI</span>
          </div>
          <div className="text-sm text-black/40">
            © 2026 ArchAI. Conceptual designs generated by AI.
          </div>
          <div className="flex gap-6 text-sm font-medium opacity-60">
            <a href="#" className="hover:opacity-100">Privacy</a>
            <a href="#" className="hover:opacity-100">Terms</a>
            <a href="#" className="hover:opacity-100">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
