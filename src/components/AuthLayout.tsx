import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDaysIcon, CircleCheckIcon, FileSearchIcon } from 'lucide-react';
import { Logo } from './ui';
import { ThemeToggle } from './ThemeToggle';

export function AuthLayout({ children }: {children: React.ReactNode;}) {
  return (
    <div className="grid min-h-screen w-full bg-canvas lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-navy p-10 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_10%,rgba(99,102,241,0.45),transparent),radial-gradient(60%_50%_at_90%_90%,rgba(79,70,229,0.35),transparent)]" aria-hidden />
        <svg className="pointer-events-none absolute bottom-0 left-0 w-full opacity-30" viewBox="0 0 600 220" fill="none" aria-hidden>
          <path d="M0 220 L140 90 L230 160 L360 40 L470 130 L600 60 V220 Z" fill="#6366F1" fillOpacity="0.35" />
          <path d="M0 220 L110 140 L210 190 L330 110 L450 180 L600 120 V220 Z" fill="#4F46E5" fillOpacity="0.5" />
          <path d="M40 200 C160 160 260 150 360 90 S520 40 580 30" stroke="#A5B4FC" strokeWidth="2" strokeDasharray="6 8" />
        </svg>
        <Link to="/" className="relative"><Logo light /></Link>
        <div className="relative my-auto max-w-md">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">Your next opportunity starts here.</h1>
          <p className="mt-4 text-lg text-indigo-100/80">Keep every application, deadline, and interview organized.</p>
          <ul className="mt-10 space-y-4 text-sm text-indigo-100/90">
            {[[FileSearchIcon, 'Pull key details out of job descriptions'], [CalendarDaysIcon, 'See every deadline and interview at a glance'], [CircleCheckIcon, 'Prepare round by round with checklists']].map(([Icon, t]) => {
              const I = Icon as React.ElementType;
              return <li key={t as string} className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10"><I className="h-4 w-4" aria-hidden /></span>{t as string}</li>;
            })}
          </ul>
        </div>
      </aside>
      <main className="flex flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="lg:invisible" aria-label="PathPilot home"><Logo tagline={false} /></Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-card sm:p-8">{children}</div>
        </div>
      </main>
    </div>);

}