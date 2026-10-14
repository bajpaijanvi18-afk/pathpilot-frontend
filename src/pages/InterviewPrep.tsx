import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpenIcon, ListChecksIcon, PlusIcon, StickyNoteIcon, VideoIcon } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { Button, Card, CompanyLogo, EmptyState, PageHeader } from '../components/ui';
import { PrepWorkspace } from '../components/PrepWorkspace';
import { QuestionBank } from '../components/QuestionBank';
import { NewPrepPlanModal } from '../components/NewPrepPlanModal';
import { upcomingEvents } from '../utils/stats';
import { cn } from '../utils/styles';
import { fmtDate, fmtTime, relDay, timeAgo } from '../utils/format';

export function InterviewPrep() {
  const { prepPlans, applications, events } = useStore();
  const [params, setParams] = useSearchParams();
  const [newOpen, setNewOpen] = useState(false);
  const [preset, setPreset] = useState<string>();
  const selectedId = params.get('plan') || prepPlans[0]?.preparationId;
  const selected = prepPlans.find((p) => p.preparationId === selectedId) ?? prepPlans[0];

  useEffect(() => {
    const n = params.get('new');
    if (n) {setPreset(n);setNewOpen(true);setParams({}, { replace: true });}
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  const appOf = (id?: string) => applications.find((a) => a.applicationId === id);
  const interviews = upcomingEvents(events).filter((e) => e.eventType === 'Interview' || e.eventType === 'Assessment');
  const openTasks = prepPlans.reduce((n, p) => n + p.checklist.filter((c) => !c.done).length, 0);
  const recent = [...prepPlans].filter((p) => p.notes).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 2);

  return (
    <div className="space-y-6">
      <PageHeader title="Interview Prep" subtitle="Plan every round, track what's left to revise, and keep your answers ready." actions={<Button icon={<PlusIcon className="h-4 w-4" />} onClick={() => {setPreset(undefined);setNewOpen(true);}}>New Plan</Button>} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink"><VideoIcon className="h-4 w-4 text-amber-500" aria-hidden /> Upcoming rounds</p>
          <ul className="mt-3 space-y-2">
            {interviews.slice(0, 3).map((e) =>
            <li key={e.eventId} className="flex justify-between gap-2 text-sm">
                <Link to={`/app/applications/${e.applicationId}`} className="truncate text-ink hover:underline">{appOf(e.applicationId)?.companyName} · {e.title}</Link>
                <span className="shrink-0 text-xs text-muted">{relDay(e.date)}{e.startTime ? `, ${fmtTime(e.startTime)}` : ''}</span>
              </li>
            )}
            {!interviews.length && <li className="text-sm text-muted">No rounds scheduled.</li>}
          </ul>
        </Card>
        <Card className="p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink"><ListChecksIcon className="h-4 w-4 text-primary" aria-hidden /> Preparation tasks</p>
          <p className="mt-3 text-3xl font-semibold text-ink">{openTasks}</p>
          <p className="text-sm text-muted">open across {prepPlans.length} plan{prepPlans.length === 1 ? '' : 's'}</p>
        </Card>
        <Card className="p-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink"><StickyNoteIcon className="h-4 w-4 text-sky-500" aria-hidden /> Recently updated notes</p>
          <ul className="mt-3 space-y-2">
            {recent.map((p) =>
            <li key={p.preparationId}>
                <button onClick={() => setParams({ plan: p.preparationId })} className="w-full text-left text-sm">
                  <span className="block truncate font-medium text-ink">{appOf(p.applicationId)?.companyName} · {p.roundType}</span>
                  <span className="block truncate text-xs text-muted">{timeAgo(p.updatedAt)} — {p.notes}</span>
                </button>
              </li>
            )}
            {!recent.length && <li className="text-sm text-muted">No notes yet.</li>}
          </ul>
        </Card>
      </div>

      {!prepPlans.length ?
      <Card><EmptyState icon={BookOpenIcon} title="No preparation plans yet" text="Create a plan for an upcoming round to track topics, tasks and notes." action={<Button size="sm" onClick={() => setNewOpen(true)}>New Plan</Button>} /></Card> :

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <nav aria-label="Preparation plans" className="space-y-2">
            {prepPlans.map((p) => {
            const app = appOf(p.applicationId);
            const done = p.checklist.filter((c) => c.done).length;
            const on = selected?.preparationId === p.preparationId;
            return (
              <button key={p.preparationId} onClick={() => setParams({ plan: p.preparationId })} aria-current={on} className={cn('flex w-full items-center gap-3 rounded-2xl border bg-card p-3.5 text-left shadow-card transition', on ? 'border-primary ring-2 ring-[#A5B4FC]/50' : 'border-line hover:bg-subtle')}>
                  {app && <CompanyLogo name={app.companyName} size="sm" />}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{app?.companyName ?? 'Unlinked'}</span>
                    <span className="block truncate text-xs text-muted">{p.roundType}{p.interviewDate ? ` · ${fmtDate(p.interviewDate, 'd MMM')}` : ''}</span>
                    <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-subtle"><span className="block h-full rounded-full bg-primary" style={{ width: `${p.checklist.length ? done / p.checklist.length * 100 : 0}%` }} /></span>
                  </span>
                </button>);

          })}
          </nav>
          {selected && <PrepWorkspace plan={selected} />}
        </div>
      }

      <QuestionBank />
      <NewPrepPlanModal open={newOpen} onClose={() => setNewOpen(false)} presetAppId={preset} onCreated={(id) => setParams({ plan: id })} />
    </div>);

}