import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

export function HeroSection() {
  return (
    <div className="grid lg:grid-template-columns-[1fr_1fr] gap-16 items-center">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
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
          From abstract ideas to professional 2D plans, photorealistic 3D renders, and immersive VR walkthroughs.
          Powered by Gemini 3.1 Pro.
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
            {[1, 2, 3].map((segment) => (
              <div key={segment} className="h-1 bg-white/40 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-full" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
