import { FeaturesSection } from '../components/landing/FeaturesSection';
import { Footer } from '../components/landing/Footer';
import { HeroSection } from '../components/landing/HeroSection';
import { WorkflowSection } from '../components/landing/WorkflowSection';

export function LandingPage() {
  return (
    <>
      <main className="max-w-7xl mx-auto px-8 py-20">
        <HeroSection />
        <FeaturesSection />
        <WorkflowSection />
      </main>
      <Footer />
    </>
  );
}
