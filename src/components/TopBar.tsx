import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BellIcon, ChevronDownIcon, LogOutIcon, MenuIcon, SettingsIcon, UserIcon } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { GlobalSearch } from './GlobalSearch';
import { ThemeToggle } from './ThemeToggle';
import { NotificationItem } from './NotificationItem';
import { LogoMark } from './ui';
import { initials } from '../utils/format';

function useOutside(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && close();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', h);
    document.addEventListener('keydown', k);
    return () => {
      document.removeEventListener('mousedown', h);
      document.removeEventListener('keydown', k);
    };
  }, [open, close]);
  return ref;
}

const pop = { initial: { opacity: 0, y: -6 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 }, transition: { duration: 0.15 } };

export function TopBar({ onMenu }: {onMenu: () => void;}) {
  const { notifications, markAllRead, profile, signOut } = useStore();
  const [bell, setBell] = useState(false);
  const [user, setUser] = useState(false);
  const bellRef = useOutside(bell, () => setBell(false));
  const userRef = useOutside(user, () => setUser(false));
  const nav = useNavigate();
  const unread = notifications.filter((n) => !n.read).length;
  const firstName = profile.fullName.split(' ')[0];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-line bg-canvas/85 px-4 backdrop-blur sm:gap-3 sm:px-6 lg:px-8">
      <button onClick={onMenu} aria-label="Open navigation" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-ink lg:hidden">
        <MenuIcon className="h-5 w-5" />
      </button>
      <Link to="/app" className="shrink-0 lg:hidden" aria-label="PathPilot dashboard">
        <LogoMark />
      </Link>
      <GlobalSearch />
      <div className="ml-auto flex items-center gap-1">
        <ThemeToggle />
        <div ref={bellRef} className="relative">
          <button onClick={() => setBell((b) => !b)} aria-label={`Notifications, ${unread} unread`} aria-expanded={bell} className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-subtle hover:text-ink">
            <BellIcon className="h-[18px] w-[18px]" />
            {unread > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white ring-2 ring-canvas">{unread}</span>}
          </button>
          <AnimatePresence>
            {bell &&
            <motion.div {...pop} className="fixed left-4 right-4 top-16 z-50 rounded-2xl border border-line bg-card shadow-pop sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96">
                <div className="flex items-center justify-between border-b border-line px-4 py-3">
                  <p className="text-sm font-semibold text-ink">Notifications <span className="ml-1 rounded-full bg-subtle px-1.5 py-0.5 text-[10px] font-medium text-muted">Sample</span></p>
                  <button disabled={!unread} onClick={markAllRead} className="text-xs font-medium text-primary hover:underline disabled:text-muted disabled:no-underline dark:text-indigo-300">Mark all as read</button>
                </div>
                <div className="max-h-96 space-y-0.5 overflow-y-auto p-2">
                  {notifications.slice(0, 5).map((n) => <NotificationItem key={n.id} n={n} compact onOpen={() => setBell(false)} />)}
                </div>
                <Link to="/app/notifications" onClick={() => setBell(false)} className="block border-t border-line px-4 py-3 text-center text-sm font-medium text-primary hover:bg-subtle dark:text-indigo-300">
                  View all notifications
                </Link>
              </motion.div>
            }
          </AnimatePresence>
        </div>
        <div ref={userRef} className="relative">
          <button onClick={() => setUser((u) => !u)} aria-expanded={user} aria-haspopup="menu" className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-1.5 transition hover:bg-subtle sm:pr-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">{initials(profile.fullName)}</span>
            <span className="hidden text-sm font-medium text-ink md:block">{firstName}</span>
            <ChevronDownIcon className="hidden h-4 w-4 text-muted md:block" aria-hidden />
          </button>
          <AnimatePresence>
            {user &&
            <motion.div {...pop} role="menu" className="absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-line bg-card p-1 shadow-pop">
                <div className="border-b border-line px-3 py-2.5">
                  <p className="text-sm font-semibold text-ink">{profile.fullName}</p>
                  <p className="truncate text-xs text-muted">{profile.email}</p>
                </div>
                {[
              { label: 'Profile', icon: UserIcon, to: '/app/settings' },
              { label: 'Settings', icon: SettingsIcon, to: '/app/settings?tab=preferences' }].
              map((i) =>
              <Link key={i.label} role="menuitem" to={i.to} onClick={() => setUser(false)} className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink hover:bg-subtle">
                    <i.icon className="h-4 w-4 text-muted" aria-hidden /> {i.label}
                  </Link>
              )}
                <button role="menuitem" onClick={() => {signOut();nav('/login');}} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-subtle dark:text-rose-400">
                  <LogOutIcon className="h-4 w-4" aria-hidden /> Logout
                </button>
              </motion.div>
            }
          </AnimatePresence>
        </div>
      </div>
    </header>);

}