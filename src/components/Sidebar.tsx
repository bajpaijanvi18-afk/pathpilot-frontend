import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpenIcon, BriefcaseIcon, CalendarDaysIcon, FileTextIcon, LayoutDashboardIcon, LifeBuoyIcon, LogOutIcon, SettingsIcon, DatabaseIcon } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { Logo } from './ui';
import { cn } from '../utils/styles';

export const NAV_ITEMS = [
{ to: '/app', label: 'Dashboard', icon: LayoutDashboardIcon, end: true },
{ to: '/app/applications', label: 'Applications', icon: BriefcaseIcon },
{ to: '/app/resumes', label: 'Resume Vault', icon: FileTextIcon },
{ to: '/app/prep', label: 'Interview Prep', icon: BookOpenIcon },
{ to: '/app/calendar', label: 'Calendar', icon: CalendarDaysIcon },
{ to: '/app/settings', label: 'Profile & Settings', icon: SettingsIcon }];


const itemCls = 'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition duration-150';

export function Sidebar({ onNavigate }: {onNavigate?: () => void;}) {
  const { signOut } = useStore();
  const nav = useNavigate();
  return (
    <nav aria-label="Main navigation" className="flex h-full flex-col bg-navy px-3 pb-4 pt-5 text-white">
      <NavLink to="/app" onClick={onNavigate} className="mb-8 rounded-lg px-2">
        <Logo light />
      </NavLink>
      <ul className="space-y-1">
        {NAV_ITEMS.map((n) =>
        <li key={n.to}>
            <NavLink to={n.to} end={n.end} onClick={onNavigate} className={({ isActive }) => cn(itemCls, isActive ? 'bg-primary text-white shadow-lg shadow-black/20' : 'text-slate-300 hover:bg-white/[0.06] hover:text-white')}>
              <n.icon className="h-[18px] w-[18px]" aria-hidden />
              {n.label}
            </NavLink>
          </li>
        )}
      </ul>
      <div className="mt-auto space-y-1 pt-6">
        <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
          <p className="flex items-center gap-2 text-xs font-semibold text-indigo-200">
            <DatabaseIcon className="h-3.5 w-3.5" aria-hidden /> Demo workspace
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">Sample data, saved in this browser only. No cloud backend connected.</p>
        </div>
        <a href="mailto:support@pathpilot.example" className={cn(itemCls, 'text-slate-300 hover:bg-white/[0.06] hover:text-white')}>
          <LifeBuoyIcon className="h-[18px] w-[18px]" aria-hidden /> Help & Support
        </a>
        <button onClick={() => {signOut();nav('/login');}} className={cn(itemCls, 'text-slate-300 hover:bg-white/[0.06] hover:text-white')}>
          <LogOutIcon className="h-[18px] w-[18px]" aria-hidden /> Logout
        </button>
      </div>
    </nav>);

}