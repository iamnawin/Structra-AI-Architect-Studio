/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FeaturesSection } from './components/landing/FeaturesSection';
import { Footer } from './components/landing/Footer';
import { HeroSection } from './components/landing/HeroSection';
import { Navigation } from './components/landing/Navigation';
import { MvpKickoffSection } from './components/landing/MvpKickoffSection';
import { WorkflowSection } from './components/landing/WorkflowSection';

export default function App() {
  return (
    <div className="min-h-screen bg-[#f5f2ed] text-[#1a1a1a] font-sans selection:bg-emerald-100">
      <Navigation />

      <main className="max-w-7xl mx-auto px-8 py-20">
        <HeroSection />
        <MvpKickoffSection />
        <FeaturesSection />
        <WorkflowSection />
      </main>

      <Footer />
    </div>
  );
}
