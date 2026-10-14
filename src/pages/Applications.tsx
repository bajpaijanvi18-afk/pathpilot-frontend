import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, KanbanIcon, ListIcon, PlusIcon, SearchIcon, SearchXIcon } from 'lucide-react';
import type { JobType, Status } from '../types';
import { useStore } from '../contexts/StoreContext';
import { Button, Card, EmptyState, PageHeader } from '../components/ui';
import { ApplicationTable } from '../components/ApplicationTable';
import { KanbanBoard } from '../components/KanbanBoard';
import { countByStatus } from '../utils/stats';
import { STATUSES, cn, inputCls, statusDot } from '../utils/styles';
import { exportApplicationsCsv } from '../utils/csv';

const PAGE_SIZE = 8;
type Sort = 'recent' | 'oldest' | 'company' | 'deadline';
const SUMMARY: (Status | 'all')[] = ['all', 'Applied', 'Assessment', 'Interviewing', 'Offer'];

export function Applications() {
  const { applications, resumes, profile, openAdd } = useStore();
  const [view, setView] = useState<'table' | 'kanban'>(profile.defaultView);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [type, setType] = useState<JobType | 'all'>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [sort, setSort] = useState<Sort>('recent');
  const [page, setPage] = useState(1);
  const counts = countByStatus(applications);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const key = (a: (typeof applications)[number]) => a.dateApplied || a.createdAt.slice(0, 10);
    return applications.
    filter((a) => (!t || `${a.companyName} ${a.jobTitle} ${a.location ?? ''}`.toLowerCase().includes(t)) && (status === 'all' || a.status === status) && (type === 'all' || a.jobType === type) && (!from || key(a) >= from) && (!to || key(a) <= to)).
    sort((a, b) => {
      if (sort === 'company') return a.companyName.localeCompare(b.companyName);
      if (sort === 'oldest') return key(a).localeCompare(key(b));
      if (sort === 'deadline') return (a.applicationDeadline || '9999').localeCompare(b.applicationDeadline || '9999');
      return key(b).localeCompare(key(a));
    });
  }, [applications, q, status, type, from, to, sort]);

  useEffect(() => setPage(1), [q, status, type, from, to, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const filtering = q || status !== 'all' || type !== 'all' || from || to;
  const clear = () => {setQ('');setStatus('all');setType('all');setFrom('');setTo('');};

  return (
    <div>
      <PageHeader
        title="My Applications"
        subtitle="Manage every opportunity from application to offer."
        actions={
        <>
            <div className="flex rounded-lg border border-line bg-card p-0.5" role="group" aria-label="Change view">
              {([['table', ListIcon, 'Table'], ['kanban', KanbanIcon, 'Board']] as const).map(([v, Icon, label]) =>
            <button key={v} onClick={() => setView(v)} aria-pressed={view === v} className={cn('flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition', view === v ? 'bg-primary text-white' : 'text-muted hover:text-ink')}>
                  <Icon className="h-4 w-4" aria-hidden /> {label}
                </button>
            )}
            </div>
            <Button variant="secondary" icon={<DownloadIcon className="h-4 w-4" />} disabled={!filtered.length} onClick={() => {exportApplicationsCsv(filtered, resumes);toast.success(`Exported ${filtered.length} applications to CSV`);}}>Export</Button>
            <Button icon={<PlusIcon className="h-4 w-4" />} onClick={() => openAdd()}>Add Application</Button>
          </>
        } />
      

      <div className="thin-scroll -mx-4 mb-5 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-5 sm:px-0">
        {SUMMARY.map((s) => {
          const on = status === s;
          return (
            <button key={s} onClick={() => setStatus(on && s !== 'all' ? 'all' : s)} aria-pressed={on} className={cn('min-w-[130px] rounded-2xl border bg-card p-4 text-left shadow-card transition hover:-translate-y-0.5', on ? 'border-primary ring-2 ring-[#A5B4FC]/60' : 'border-line')}>
              <span className="flex items-center gap-2 text-xs font-medium text-muted">
                {s !== 'all' && <span className="h-2 w-2 rounded-full" style={{ background: statusDot[s] }} aria-hidden />}
                {s === 'all' ? 'All Applications' : s === 'Assessment' ? 'Assessments' : s === 'Offer' ? 'Offers' : s}
              </span>
              <span className="mt-1 block text-2xl font-semibold text-ink">{s === 'all' ? applications.length : counts[s] || 0}</span>
            </button>);

        })}
      </div>

      <Card className="mb-5 p-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_repeat(5,auto)]">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search company, role or location" aria-label="Search applications" className={cn(inputCls, 'pl-9')} />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value as Status | 'all')} aria-label="Status" className={cn(inputCls, 'lg:w-36')}>
            <option value="all">All statuses</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value as JobType | 'all')} aria-label="Job type" className={cn(inputCls, 'lg:w-36')}>
            <option value="all">All job types</option>
            {['Internship', 'Full-time', 'Part-time', 'Contract', 'Other'].map((t) => <option key={t}>{t}</option>)}
          </select>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="Applied from" className={cn(inputCls, 'lg:w-40')} />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="Applied to" className={cn(inputCls, 'lg:w-40')} />
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort" className={cn(inputCls, 'lg:w-40')}>
            <option value="recent">Most recent</option>
            <option value="oldest">Oldest</option>
            <option value="company">Company name</option>
            <option value="deadline">Deadline</option>
          </select>
        </div>
        {filtering &&
        <p className="mt-3 text-xs text-muted">
            {filtered.length} result{filtered.length === 1 ? '' : 's'} ·{' '}
            <button onClick={clear} className="font-medium text-primary hover:underline dark:text-indigo-300">Clear filters</button>
          </p>
        }
      </Card>

      {!filtered.length ?
      <Card>
          <EmptyState icon={SearchXIcon} title={filtering ? 'No applications match your filters' : 'No applications yet'} text={filtering ? 'Try widening the date range or clearing filters.' : 'Upload a job description or enter one manually to get started.'} action={filtering ? <Button variant="secondary" size="sm" onClick={clear}>Clear filters</Button> : <Button size="sm" onClick={() => openAdd()}>Add Application</Button>} />
        </Card> :
      view === 'kanban' ?
      <KanbanBoard apps={filtered} /> :

      <Card className="overflow-hidden">
          <ApplicationTable apps={pageItems} />
          <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm text-muted">
            <span>
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" aria-label="Previous page" disabled={page === 1} onClick={() => setPage((p) => p - 1)}><ChevronLeftIcon className="h-4 w-4" /></Button>
              <span className="px-2 text-xs">Page {page} of {pages}</span>
              <Button variant="ghost" size="icon" aria-label="Next page" disabled={page === pages} onClick={() => setPage((p) => p + 1)}><ChevronRightIcon className="h-4 w-4" /></Button>
            </div>
          </div>
        </Card>
      }
    </div>);

}