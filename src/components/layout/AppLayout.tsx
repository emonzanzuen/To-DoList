import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { MobileNav } from './MobileNav';
import { useLenis } from '../../animations/lenis/useLenis';

export function AppLayout() {
  // Inisialisasi smooth scroll satu kali di level layout
  useLenis();

  return (
    <div className="min-h-screen bg-background text-ink transition-colors duration-300">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Header */}
      <MobileHeader />

      {/* Main Content Area */}
      <main className="md:pl-64">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 pb-24 md:px-8 md:py-10 md:pb-16">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}