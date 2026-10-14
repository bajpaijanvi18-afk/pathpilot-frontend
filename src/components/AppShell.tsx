import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { AddApplicationModal } from './AddApplicationModal';

export function AppShell() {
  const { signedIn } = useStore();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  if (!signedIn) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-canvas">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-card focus:px-3 focus:py-2">Skip to content</a>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <Sidebar />
      </aside>
      <AnimatePresence>
        {open &&
        <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 bg-slate-950/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }} transition={{ duration: 0.22, ease: 'easeOut' }} className="relative h-full w-72">
              <Sidebar onNavigate={() => setOpen(false)} />
              <button onClick={() => setOpen(false)} aria-label="Close navigation" className="absolute right-3 top-5 flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10">
                <XIcon className="h-4 w-4" />
              </button>
            </motion.aside>
          </div>
        }
      </AnimatePresence>
      <div className="lg:pl-64">
        <TopBar onMenu={() => setOpen(true)} />
        <main id="main" className="mx-auto max-w-[1400px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <AddApplicationModal />
    </div>);

}