import React from 'react';
import { FileTextIcon, FlagIcon, VideoIcon } from 'lucide-react';
import type { Status } from '../types';
import { CompanyLogo, LogoMark, StatusBadge } from './ui';

const ROWS: [string, string, Status][] = [
['Google', 'Software Engineer', 'Interviewing'],
['Microsoft', 'Software Development Intern', 'Applied'],
['L&T', 'Graduate Engineer Trainee', 'Offer'],
['IQVIA', 'Data Analyst', 'Rejected']];


/** Static illustration of the dashboard used on the landing page (sample data). */
export function ProductPreview() {
  return (
    <div role="img" aria-label="Preview of the PathPilot dashboard with application statuses, upcoming interviews and resume vault" className="overflow-hidden rounded-2xl border border-line bg-card shadow-pop">
      <div className="flex items-center gap-1.5 border-b border-line bg-subtle/60 px-4 py-2.5">
        {['#F87171', '#FBBF24', '#34D399'].map((c) => <span key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />)}
      </div>
      <div className="flex">
        <div className="hidden w-40 shrink-0 flex-col gap-1.5 bg-navy p-3 sm:flex">
          <div className="mb-3 flex items-center gap-2"><LogoMark className="h-6 w-6" /><span className="text-xs font-semibold text-white">PathPilot</span></div>
          {['Dashboard', 'Applications', 'Resume Vault', 'Interview Prep', 'Calendar'].map((l, i) =>
          <span key={l} className={i === 0 ? 'rounded-md bg-primary px-2 py-1.5 text-[11px] font-medium text-white' : 'px-2 py-1.5 text-[11px] text-slate-300'}>{l}</span>
          )}
        </div>
        <div className="min-w-0 flex-1 bg-canvas p-4">
          <p className="text-sm font-semibold text-ink">Welcome back, Janvi!</p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[['12', 'Applications'], ['3', 'Interviews'], ['1', 'Offer'], ['2', 'Deadlines']].map(([n, l]) =>
            <div key={l} className="rounded-lg border border-line bg-card p-2"><p className="text-base font-semibold text-ink">{n}</p><p className="truncate text-[10px] text-muted">{l}</p></div>
            )}
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_150px]">
            <div className="rounded-lg border border-line bg-card">
              {ROWS.map(([c, t, s]) =>
              <div key={c} className="flex items-center gap-2 border-b border-line px-2.5 py-2 last:border-0">
                  <CompanyLogo name={c} size="sm" />
                  <span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-semibold text-ink">{c}</span><span className="block truncate text-[10px] text-muted">{t}</span></span>
                  <StatusBadge status={s} className="px-2 text-[10px]" />
                </div>
              )}
            </div>
            <div className="hidden space-y-2 md:block">
              <div className="rounded-lg border border-line bg-card p-2.5">
                <p className="mb-1.5 text-[10px] font-semibold text-ink">Upcoming</p>
                <p className="flex items-center gap-1.5 text-[10px] text-muted"><VideoIcon className="h-3 w-3 text-amber-500" />Google · Technical</p>
                <p className="mt-1 flex items-center gap-1.5 text-[10px] text-muted"><FlagIcon className="h-3 w-3 text-primary" />Infosys · Deadline</p>
              </div>
              <div className="rounded-lg border border-line bg-card p-2.5">
                <p className="mb-1.5 text-[10px] font-semibold text-ink">Resume Vault</p>
                {['SWE_Resume_v2.pdf', 'Data_Analyst.pdf'].map((f) => <p key={f} className="mt-1 flex items-center gap-1.5 truncate text-[10px] text-muted"><FileTextIcon className="h-3 w-3 shrink-0 text-rose-500" />{f}</p>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}