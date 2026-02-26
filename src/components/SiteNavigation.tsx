import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2 } from 'lucide-react';

export function SiteNavigation() {
  const { pathname } = useLocation();
  const isLanding = pathname === '/';

  return (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-black/5 bg-[#f5f2ed]/80 backdrop-blur-sm sticky top-0 z-40">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
          <Building2 className="text-white w-4 h-4" />
        </div>
        <span className="font-bold text-xl tracking-tight">Structra AI</span>
      </Link>

      {/* Nav links (only on landing) */}
      {isLanding && (
        <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest text-black/50">
          <a href="#features" className="hover:text-black transition-colors">Features</a>
          <a href="#workflow" className="hover:text-black transition-colors">Workflow</a>
        </div>
      )}

      {/* CTA / Dashboard */}
      <div className="flex items-center gap-3">
        {!isLanding && (
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm font-medium text-black/60 hover:text-black transition-colors px-4 py-2 rounded-xl hover:bg-black/5"
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
        )}
        <Link
          to="/dashboard"
          className="bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
        >
          {isLanding ? 'Start Designing' : 'New Project'}
        </Link>
      </div>
    </nav>
  );
}
