import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { CalendarClockIcon, GripVerticalIcon } from 'lucide-react';
import type { Application, Status } from '../types';
import { useStore } from '../contexts/StoreContext';
import { CompanyLogo } from './ui';
import { ApplicationActionsMenu } from './ApplicationActionsMenu';
import { nextEventFor } from '../utils/stats';
import { cn, statusDot } from '../utils/styles';
import { fmtDate, relDay } from '../utils/format';

const COLUMNS: Status[] = ['Saved', 'Applied', 'Assessment', 'Interviewing', 'Offer', 'Rejected'];

export function KanbanBoard({ apps }: {apps: Application[];}) {
  const { events, setStatus } = useStore();
  const [over, setOver] = useState<Status | null>(null);
  const withdrawn = apps.filter((a) => a.status === 'Withdrawn').length;

  const drop = (e: React.DragEvent, s: Status) => {
    e.preventDefault();
    setOver(null);
    const id = e.dataTransfer.getData('text/plain');
    const app = apps.find((a) => a.applicationId === id);
    if (app && app.status !== s) {
      setStatus(id, s);
      toast.success(`Moved to ${s}`, { description: `${app.companyName} — ${app.jobTitle}` });
    }
  };

  return (
    <div>
      <div className="thin-scroll -mx-4 flex gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
        {COLUMNS.map((s) => {
          const list = apps.filter((a) => a.status === s);
          return (
            <section key={s} aria-label={`${s} column`} onDragOver={(e) => {e.preventDefault();setOver(s);}} onDragLeave={() => setOver(null)} onDrop={(e) => drop(e, s)} className={cn('flex w-[270px] shrink-0 flex-col rounded-2xl border bg-subtle/60 p-2 transition', over === s ? 'border-primary bg-primary-soft/60' : 'border-transparent')}>
              <header className="flex items-center justify-between px-2 py-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <span className="h-2 w-2 rounded-full" style={{ background: statusDot[s] }} aria-hidden /> {s}
                </h3>
                <span className="rounded-full bg-card px-2 text-xs font-medium text-muted">{list.length}</span>
              </header>
              <ul className="flex min-h-[120px] flex-col gap-2">
                {list.map((a) => {
                  const ev = nextEventFor(a.applicationId, events);
                  return (
                    <li key={a.applicationId} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', a.applicationId)} className="group cursor-grab rounded-xl border border-line bg-card p-3 shadow-card transition hover:shadow-md active:cursor-grabbing">
                      <div className="flex items-start gap-2.5">
                        <CompanyLogo name={a.companyName} size="sm" />
                        <Link to={`/app/applications/${a.applicationId}`} className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink">{a.companyName}</p>
                          <p className="truncate text-xs text-muted">{a.jobTitle}</p>
                        </Link>
                        <ApplicationActionsMenu app={a} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
                        <span>{a.dateApplied ? `Applied ${fmtDate(a.dateApplied, 'd MMM')}` : 'Not applied'}</span>
                        {a.applicationDeadline && <span>Due {fmtDate(a.applicationDeadline, 'd MMM')}</span>}
                      </div>
                      {ev &&
                      <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-subtle px-2 py-1.5 text-[11px] font-medium text-ink">
                          <CalendarClockIcon className="h-3.5 w-3.5 text-primary" aria-hidden /> {ev.title} · {relDay(ev.date)}
                        </p>
                      }
                      <GripVerticalIcon className="sr-only" aria-hidden />
                    </li>);

                })}
                {!list.length && <li className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-line p-4 text-center text-xs text-muted">Drop applications here</li>}
              </ul>
            </section>);

        })}
      </div>
      <p className="mt-2 text-xs text-muted">Drag cards between columns, or use the ••• menu to change status.{withdrawn ? ` ${withdrawn} withdrawn application${withdrawn > 1 ? 's are' : ' is'} shown in Table view.` : ''}</p>
    </div>);

}