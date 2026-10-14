import React from 'react';
import { NavLink } from 'react-router-dom';
import { BriefcaseIcon, CalendarDaysIcon, FileTextIcon, LayoutDashboardIcon, PlusIcon } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { cn } from '../utils/styles';

const items = [
{ to: '/app', label: 'Home', icon: LayoutDashboardIcon, end: true },
{ to: '/app/applications', label: 'Apps', icon: BriefcaseIcon },
null,
{ to: '/app/calendar', label: 'Calendar', icon: CalendarDaysIcon },
{ to: '/app/resumes', label: 'Resumes', icon: FileTextIcon }];


export function MobileNav() {
  const { openAdd } = useStore();
  return (
    <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {items.map((it, i) =>
        it ?
        <li key={it.to}>
              <NavLink to={it.to} end={it.end} className={({ isActive }) => cn('flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition', isActive ? 'text-primary dark:text-indigo-300' : 'text-muted')}>
                <it.icon className="h-5 w-5" aria-hidden />
                {it.label}
              </NavLink>
            </li> :

        <li key={i} className="flex items-center justify-center">
              <button onClick={() => openAdd()} aria-label="Add application" className="-mt-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 transition active:scale-95">
                <PlusIcon className="h-5 w-5" />
              </button>
            </li>

        )}
      </ul>
    </nav>);

}