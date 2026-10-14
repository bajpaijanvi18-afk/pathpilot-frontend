import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarClockIcon, FileTextIcon } from 'lucide-react';
import type { Application } from '../types';
import { useStore } from '../contexts/StoreContext';
import { CompanyLogo, StatusBadge } from './ui';
import { ApplicationActionsMenu } from './ApplicationActionsMenu';
import { nextEventFor } from '../utils/stats';
import { fmtDate, fmtTime, relDay } from '../utils/format';

const th = 'px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted whitespace-nowrap';
const td = 'px-4 py-3.5 text-sm whitespace-nowrap';

export function ApplicationTable({ apps, variant = 'full' }: {apps: Application[];variant?: 'compact' | 'full';}) {
  const { events, resumes } = useStore();
  const full = variant === 'full';
  const resumeName = (id?: string) => resumes.find((r) => r.resumeId === id)?.displayName;

  const NextEvent = ({ app }: {app: Application;}) => {
    const e = nextEventFor(app.applicationId, events);
    if (!e) return <span className="text-muted">—</span>;
    return (
      <span className="flex flex-col">
        <span className="font-medium text-ink">{e.title}</span>
        <span className="text-xs text-muted">{relDay(e.date)}{e.startTime ? ` · ${fmtTime(e.startTime)}` : ''}</span>
      </span>);

  };

  const Company = ({ app }: {app: Application;}) =>
  <Link to={`/app/applications/${app.applicationId}`} className="group flex items-center gap-3">
      <CompanyLogo name={app.companyName} />
      <span className="min-w-0">
        <span className="block font-medium text-ink group-hover:text-primary dark:group-hover:text-indigo-300">{app.companyName}</span>
        {app.isDraft && <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Draft{app.needsReview ? ' · needs review' : ''}</span>}
      </span>
    </Link>;


  return (
    <>
      <div className="thin-scroll hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px]">
          <thead className="border-b border-line bg-subtle/50">
            <tr>
              <th className={th}>Company</th>
              <th className={th}>{full ? 'Job Role' : 'Job Title'}</th>
              {full && <th className={th}>Job Type</th>}
              {full && <th className={th}>Location</th>}
              <th className={th}>Date Applied</th>
              {full && <th className={th}>Deadline</th>}
              <th className={th}>Status</th>
              {full && <th className={th}>Resume Used</th>}
              <th className={th}>Next Event</th>
              <th className={`${th} text-right`}><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {apps.map((a) =>
            <tr key={a.applicationId} className="transition-colors hover:bg-subtle/60">
                <td className={td}><Company app={a} /></td>
                <td className={`${td} text-ink`}>{a.jobTitle}</td>
                {full && <td className={`${td} text-muted`}>{a.jobType ?? '—'}</td>}
                {full && <td className={`${td} text-muted`}>{a.location ?? '—'}</td>}
                <td className={`${td} text-muted`}>{a.dateApplied ? fmtDate(a.dateApplied) : 'Not applied'}</td>
                {full && <td className={`${td} text-muted`}>{a.applicationDeadline ? fmtDate(a.applicationDeadline) : '—'}</td>}
                <td className={td}><StatusBadge status={a.status} /></td>
                {full && <td className={`${td} text-muted`}>{resumeName(a.resumeId) ?? '—'}</td>}
                <td className={td}><NextEvent app={a} /></td>
                <td className={`${td} text-right`}><ApplicationActionsMenu app={a} /></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-line md:hidden">
        {apps.map((a) => {
          const e = nextEventFor(a.applicationId, events);
          return (
            <li key={a.applicationId} className="flex gap-3 p-4">
              <CompanyLogo name={a.companyName} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/app/applications/${a.applicationId}`} className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{a.companyName}</p>
                    <p className="truncate text-sm text-muted">{a.jobTitle}</p>
                  </Link>
                  <ApplicationActionsMenu app={a} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <StatusBadge status={a.status} />
                  <span>{a.dateApplied ? `Applied ${fmtDate(a.dateApplied, 'd MMM')}` : 'Not applied yet'}</span>
                  {full && resumeName(a.resumeId) && <span className="flex items-center gap-1"><FileTextIcon className="h-3 w-3" aria-hidden />{resumeName(a.resumeId)}</span>}
                </div>
                {e &&
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-ink">
                    <CalendarClockIcon className="h-3.5 w-3.5 text-primary" aria-hidden />
                    {e.title} · {relDay(e.date)}{e.startTime ? `, ${fmtTime(e.startTime)}` : ''}
                  </p>
                }
              </div>
            </li>);

        })}
      </ul>
    </>);

}