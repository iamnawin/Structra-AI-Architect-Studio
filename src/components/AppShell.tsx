import { Outlet } from 'react-router-dom';
import { SiteNavigation } from './SiteNavigation';

export function AppShell() {
  return (
    <div className="min-h-screen bg-[#f5f2ed] text-[#1a1a1a] font-sans selection:bg-emerald-100">
      <SiteNavigation />
      <Outlet />
    </div>
  );
}
