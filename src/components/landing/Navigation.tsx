import { Home } from 'lucide-react';
import { NAV_LINKS } from '../../data/landingContent';

export function Navigation() {
  return (
    <nav className="flex items-center justify-between px-8 py-6 border-b border-black/5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
          <Home className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight">ArchAI</span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium uppercase tracking-widest opacity-60">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} className="hover:opacity-100 transition-opacity">
            {link.label}
          </a>
        ))}
      </div>
      <button className="bg-emerald-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">
        Start Designing
      </button>
    </nav>
  );
}
