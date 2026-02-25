import { motion } from 'motion/react';
import { FEATURE_CARDS } from '../../data/landingContent';

export function FeaturesSection() {
  return (
    <section id="features" className="mt-32">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-light tracking-tight mb-4">Comprehensive AI Toolkit</h2>
        <p className="text-black/50">Everything you need from concept to construction.</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {FEATURE_CARDS.map((feature) => (
          <motion.div key={feature.title} whileHover={{ y: -5 }} className="p-8 bg-white rounded-3xl border border-black/5 shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
              <feature.icon className="text-emerald-600 w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
            <p className="text-sm text-black/50 leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
