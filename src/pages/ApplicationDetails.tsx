import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeftIcon, BookOpenIcon, CalendarClockIcon, ExternalLinkIcon, FileTextIcon, FileSearchIcon, PlusIcon, SearchXIcon, SquarePenIcon, TriangleAlertIcon } from 'lucide-react';
import type { Status } from '../types';
import { useStore } from '../contexts/StoreContext';
import { Button, Card, CompanyLogo, EmptyState, StatusBadge, Tabs } from '../components/ui';
import { ApplicationActionsMenu } from '../components/ApplicationActionsMenu';
import { EventIcon } from '../components/EventIcon';
import { nextEventFor } from '../utils/stats';
import { STATUSES, cn, inputCls } from '../utils/styles';
import { daysUntil, fmtDate, fmtTime, relDay } from '../utils/format';

type Tab = 'overview' | 'description' | 'notes' | 'timeline' | 'documents';

function Fact({ label, value }: {label: string;value?: React.ReactNode;}) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className={cn('mt-0.5 text-sm', value ? 'text-ink' : 'text-muted')}>{value || 'Not specified'}</dd>
    </div>);

}

export function ApplicationDetails() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const { applications, events, resumes, prepPlans, openAdd, setStatus, updateApplication, addTimelineNote } = useStore();
  const app = applications.find((a) => a.applicationId === id);
  const [notes, setNotes] = useState(app?.notes ?? '');
  const [entry, setEntry] = useState('');
  useEffect(() => setNotes(app?.notes ?? ''), [app?.applicationId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!app)
  return (
    <Card>
        <EmptyState icon={SearchXIcon} title="Application not found" text="It may have been deleted, or the link is incorrect." action={<Link to="/app/applications" className="text-sm font-medium text-primary dark:text-indigo-300">Back to Applications</Link>} />
      </Card>);


  const tab = params.get('tab') as Tab || 'overview';
  const setTab = (t: Tab) => setParams(t === 'overview' ? {} : { tab: t }, { replace: true });
  const resume = resumes.find((r) => r.resumeId === app.resumeId);
  const next = nextEventFor(app.applicationId, events);
  const appEvents = events.filter((e) => e.applicationId === app.applicationId).sort((a, b) => a.date.localeCompare(b.date));
  const plans = prepPlans.filter((p) => p.applicationId === app.applicationId);
  const dirty = notes !== (app.notes ?? '');
  const dl = app.applicationDeadline ? daysUntil(app.applicationDeadline) : undefined;

  return (
    <div>
      <Link to="/app/applications" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" aria-hidden /> Applications
      </Link>

      <Card className="mb-6 p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <CompanyLogo name={app.companyName} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">{app.jobTitle}</h1>
              <StatusBadge status={app.status} />
              {app.isDraft && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">Draft</span>}
            </div>
            <p className="mt-1 text-sm text-muted">
              {app.companyName}
              {app.location ? ` · ${app.location}` : ''} · {app.dateApplied ? `Applied ${fmtDate(app.dateApplied)}` : 'Not applied yet'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={<SquarePenIcon className="h-4 w-4" />} onClick={() => openAdd({ editId: app.applicationId })}>Edit</Button>
            <ApplicationActionsMenu app={app} onDeleted={() => nav('/app/applications')} />
          </div>
        </div>
        {app.needsReview &&
        <div className="mt-5 flex flex-col gap-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-400/10 dark:text-amber-200 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex gap-2"><TriangleAlertIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> These details came from document extraction and haven't been reviewed yet.</span>
            <Button size="sm" variant="secondary" onClick={() => openAdd({ editId: app.applicationId })}>Review now</Button>
          </div>
        }
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <Tabs
            className="mb-5"
            value={tab}
            onChange={setTab}
            tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'description', label: 'Job Description' },
            { id: 'notes', label: 'Notes & Preparation' },
            { id: 'timeline', label: 'Timeline', count: app.timeline.length },
            { id: 'documents', label: 'Documents' }]
            } />
          

          {tab === 'overview' &&
          <div className="space-y-5">
              <Card className="p-5">
                <h2 className="mb-4 text-sm font-semibold text-ink">Overview</h2>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                  <Fact label="Job type" value={app.jobType} />
                  <Fact label="Work mode" value={app.workMode} />
                  <Fact label="Location" value={app.location} />
                  <Fact label="Salary / stipend" value={app.salaryOrStipend} />
                  <Fact label="Date posted" value={fmtDate(app.datePosted)} />
                  <Fact label="Source" value={app.source} />
                  <Fact label="Reference ID" value={app.referenceId} />
                  <Fact label="Recruitment contact" value={app.contact} />
                </dl>
              </Card>
              <Card className="p-5">
                <h2 className="mb-3 text-sm font-semibold text-ink">Required Skills</h2>
                {app.requiredSkills.length ?
              <ul className="flex flex-wrap gap-2">{app.requiredSkills.map((s) => <li key={s} className="rounded-lg bg-subtle px-2.5 py-1 text-xs font-medium text-ink">{s}</li>)}</ul> :
              <p className="text-sm text-muted">No skills recorded.</p>}
              </Card>
              <Card className="p-5">
                <h2 className="mb-3 text-sm font-semibold text-ink">Qualifications</h2>
                <dl className="space-y-3">
                  <Fact label="Minimum qualifications" value={app.qualifications} />
                  <Fact label="Education" value={app.education} />
                  <Fact label="Experience" value={app.experience} />
                </dl>
              </Card>
              <Card className="p-5">
                <h2 className="mb-3 text-sm font-semibold text-ink">Events</h2>
                {appEvents.length ?
              <ul className="space-y-2">
                    {appEvents.map((e) =>
                <li key={e.eventId} className={cn('flex items-center gap-3', daysUntil(e.date) < 0 && 'opacity-60')}>
                        <EventIcon type={e.eventType} />
                        <span className="flex-1 text-sm"><span className="font-medium text-ink">{e.title}</span><span className="block text-xs text-muted">{fmtDate(e.date, 'EEE, d MMM yyyy')}{e.startTime ? ` · ${fmtTime(e.startTime)}` : ''}{daysUntil(e.date) < 0 ? ' · Past' : ''}</span></span>
                      </li>
                )}
                  </ul> :
              <p className="text-sm text-muted">No events yet. Add interviews or assessments from the <Link to="/app/calendar" className="font-medium text-primary dark:text-indigo-300">calendar</Link>.</p>}
              </Card>
            </div>
          }

          {tab === 'description' &&
          <Card className="p-5">
              {app.jobDescription ? <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{app.jobDescription}</p> : <EmptyState icon={FileTextIcon} title="No job description saved" text="Add the description so you can refer back to it before interviews." action={<Button size="sm" variant="secondary" onClick={() => openAdd({ editId: app.applicationId })}>Add description</Button>} />}
            </Card>
          }

          {tab === 'notes' &&
          <div className="space-y-5">
              <Card className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <label htmlFor="app-notes" className="text-sm font-semibold text-ink">Application notes</label>
                  <span className="text-xs text-muted">{dirty ? 'Unsaved changes' : 'All changes saved'}</span>
                </div>
                <textarea id="app-notes" rows={10} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={'Interview questions, topics to revise, recruiter details, follow-up reminders, observations…'} className={cn(inputCls, 'h-auto py-3 leading-relaxed')} />
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="ghost" disabled={!dirty} onClick={() => setNotes(app.notes ?? '')}>Discard</Button>
                  <Button disabled={!dirty} onClick={() => {updateApplication(app.applicationId, { notes });toast.success('Notes saved');}}>Save Notes</Button>
                </div>
              </Card>
              <Card className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-ink">Preparation plans</h2>
                  <Link to={`/app/prep?new=${app.applicationId}`} className="flex items-center gap-1 text-sm font-medium text-primary dark:text-indigo-300"><PlusIcon className="h-4 w-4" aria-hidden /> New plan</Link>
                </div>
                {plans.length ?
              <ul className="space-y-2">
                    {plans.map((p) => {
                  const done = p.checklist.filter((c) => c.done).length;
                  return (
                    <li key={p.preparationId}>
                          <Link to={`/app/prep?plan=${p.preparationId}`} className="flex items-center gap-3 rounded-xl border border-line p-3 hover:bg-subtle">
                            <BookOpenIcon className="h-4 w-4 text-primary" aria-hidden />
                            <span className="flex-1 text-sm font-medium text-ink">{p.roundType}</span>
                            <span className="text-xs text-muted">{done}/{p.checklist.length} tasks</span>
                          </Link>
                        </li>);

                })}
                  </ul> :
              <p className="text-sm text-muted">No preparation plan for this application yet.</p>}
              </Card>
            </div>
          }

          {tab === 'timeline' &&
          <Card className="p-5">
              <ol className="relative space-y-5 border-l border-line pl-6">
                {[...app.timeline].sort((a, b) => a.date.localeCompare(b.date)).map((t) =>
              <li key={t.id} className="relative">
                    <span className={cn('absolute -left-[31px] top-1 h-3 w-3 rounded-full ring-4 ring-card', t.kind === 'system' ? 'bg-primary' : 'bg-amber-500')} aria-hidden />
                    <p className="text-sm font-medium text-ink">{t.label}</p>
                    <p className="text-xs text-muted">{fmtDate(t.date, 'd MMM yyyy')} · {t.kind === 'system' ? 'Activity' : 'Your note'}</p>
                  </li>
              )}
              </ol>
              <form className="mt-6 flex gap-2 border-t border-line pt-5" onSubmit={(e) => {e.preventDefault();if (!entry.trim()) return;addTimelineNote(app.applicationId, entry.trim());setEntry('');toast.success('Added to timeline');}}>
                <input value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="Add a note to the timeline, e.g. “Recruiter called”" aria-label="Timeline note" className={inputCls} />
                <Button type="submit" disabled={!entry.trim()}>Add</Button>
              </form>
            </Card>
          }

          {tab === 'documents' &&
          <div className="space-y-5">
              <Card className="p-5">
                <h2 className="mb-3 text-sm font-semibold text-ink">Resume used</h2>
                <select value={app.resumeId ?? ''} onChange={(e) => {updateApplication(app.applicationId, { resumeId: e.target.value || undefined });toast.success('Resume link updated');}} aria-label="Resume used" className={inputCls}>
                  <option value="">No resume linked</option>
                  {resumes.map((r) => <option key={r.resumeId} value={r.resumeId}>{r.originalFileName}</option>)}
                </select>
              </Card>
              <Card className="p-5">
                <h2 className="mb-3 text-sm font-semibold text-ink">Source document</h2>
                {app.sourceDocument ?
              <div className="flex items-center gap-3 rounded-xl border border-line p-3">
                    <FileSearchIcon className="h-5 w-5 text-primary" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{app.sourceDocument.name}</span>
                      <span className="block text-xs text-muted">Added {fmtDate(app.sourceDocument.addedAt.slice(0, 10))} · original file storage not connected in demo</span>
                    </span>
                    {app.jobDescription && <Button size="sm" variant="secondary" onClick={() => setTab('description')}>View text</Button>}
                  </div> :
              <p className="text-sm text-muted">This application was entered manually.</p>}
              </Card>
            </div>
          }
        </div>

        <aside className="space-y-5">
          <Card className="p-5">
            <label htmlFor="side-status" className="text-xs font-medium text-muted">Application status</label>
            <select id="side-status" value={app.status} onChange={(e) => {setStatus(app.applicationId, e.target.value as Status);toast.success(`Status updated to ${e.target.value}`);}} className={cn(inputCls, 'mt-1.5')}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
            <dl className="mt-5 space-y-4">
              <Fact label="Deadline" value={app.applicationDeadline && <span>{fmtDate(app.applicationDeadline)} {dl !== undefined && <span className={cn('ml-1 text-xs', dl < 0 ? 'text-muted' : dl <= 3 ? 'font-medium text-rose-600 dark:text-rose-400' : 'text-muted')}>{dl < 0 ? '(passed)' : dl === 0 ? '(today)' : `(${dl} days left)`}</span>}</span>} />
              <Fact label="Location" value={app.location} />
              <Fact label="Job type" value={app.jobType} />
              <Fact label="Resume used" value={resume && <Link to="/app/resumes" className="font-medium text-primary hover:underline dark:text-indigo-300">{resume.originalFileName}</Link>} />
              <Fact label="Application URL" value={app.applicationUrl && <a href={app.applicationUrl} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 break-all font-medium text-primary hover:underline dark:text-indigo-300">Open posting <ExternalLinkIcon className="h-3.5 w-3.5" aria-hidden /></a>} />
            </dl>
          </Card>
          <Card className="p-5">
            <h2 className="mb-3 text-xs font-medium text-muted">Next scheduled event</h2>
            {next ?
            <div className="flex items-center gap-3">
                <EventIcon type={next.eventType} />
                <div>
                  <p className="text-sm font-semibold text-ink">{next.title}</p>
                  <p className="text-xs text-muted">{relDay(next.date)}{next.startTime ? ` · ${fmtTime(next.startTime)}` : ''}</p>
                </div>
              </div> :

            <p className="flex items-center gap-2 text-sm text-muted"><CalendarClockIcon className="h-4 w-4" aria-hidden /> Nothing scheduled</p>
            }
          </Card>
        </aside>
      </div>
    </div>);

}