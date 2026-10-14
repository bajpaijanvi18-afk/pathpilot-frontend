import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowRightIcon, AwardIcon, BriefcaseIcon, FileTextIcon, FlagIcon, PlusIcon, SearchIcon, SearchXIcon, UploadIcon, VideoIcon } from 'lucide-react';
import type { Status } from '../types';
import { useStore } from '../contexts/StoreContext';
import { Button, Card, EmptyState } from '../components/ui';
import { ApplicationTable } from '../components/ApplicationTable';
import { UpcomingEvents } from '../components/UpcomingEvents';
import { countByStatus, getStats, upcomingEvents } from '../utils/stats';
import { STATUSES, cn, inputCls, statusDot } from '../utils/styles';
import { daysUntil, fmtDate, relDay } from '../utils/format';

type Sort = 'recent' | 'oldest' | 'company' | 'deadline';

function StatCard({ icon: Icon, label, value, sub, tone }: {icon: React.ElementType;label: string;value: number;sub: string;tone: string;}) {
  return (
    <Card className="p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl', tone)}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-ink">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-ink">{label}</p>
      <p className="mt-1 truncate text-xs text-muted">{sub}</p>
    </Card>);

}

export function Dashboard() {
  const { applications, events, resumes, profile, openAdd } = useStore();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [range, setRange] = useState('any');
  const [sort, setSort] = useState<Sort>('recent');

  const stats = getStats(applications, events);
  const counts = countByStatus(applications);
  const nextInterview = upcomingEvents(events).find((e) => e.eventType === 'Interview');
  const nextDeadline = upcomingEvents(events, 14).find((e) => e.eventType === 'Deadline');
  const active = applications.filter((a) => !['Rejected', 'Withdrawn', 'Offer'].includes(a.status)).length;

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    const list = applications.filter((a) => {
      if (t && !`${a.companyName} ${a.jobTitle}`.toLowerCase().includes(t)) return false;
      if (status !== 'all' && a.status !== status) return false;
      if (range !== 'any') {
        if (!a.dateApplied) return false;
        if (-daysUntil(a.dateApplied) > Number(range)) return false;
      }
      return true;
    });
    const key = (a: (typeof list)[number]) => a.dateApplied || a.createdAt.slice(0, 10);
    return [...list].sort((a, b) => {
      if (sort === 'company') return a.companyName.localeCompare(b.companyName);
      if (sort === 'oldest') return key(a).localeCompare(key(b));
      if (sort === 'deadline') return (a.applicationDeadline || '9999').localeCompare(b.applicationDeadline || '9999');
      return key(b).localeCompare(key(a));
    });
  }, [applications, q, status, range, sort]);

  const recentResumes = [...resumes].sort((a, b) => (b.updatedAt || b.uploadedAt).localeCompare(a.updatedAt || a.uploadedAt)).slice(0, 3);
  const firstName = profile.fullName.split(' ')[0];
  const filtering = q || status !== 'all' || range !== 'any';

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{format(new Date(), 'EEEE, d MMMM')}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-[28px]">Welcome back, {firstName}!</h1>
          <p className="mt-1 text-sm text-muted">Keep going! Your next opportunity is closer than you think.</p>
        </div>
        <Button onClick={() => openAdd()} icon={<PlusIcon className="h-4 w-4" />} className="self-start sm:self-auto">Add Application</Button>
      </section>

      <section aria-label="Summary" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon={BriefcaseIcon} label="Total Applications" value={stats.total} sub={`${active} active in your pipeline`} tone="bg-primary-soft text-primary dark:text-indigo-300" />
        <StatCard icon={VideoIcon} label="Interviews Scheduled" value={stats.interviews} sub={nextInterview ? `Next: ${relDay(nextInterview.date)}` : 'None scheduled'} tone="bg-amber-50 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300" />
        <StatCard icon={AwardIcon} label="Offers Received" value={stats.offers} sub={stats.offers ? 'Review and respond on time' : 'Keep applying'} tone="bg-green-50 text-green-600 dark:bg-green-400/15 dark:text-green-300" />
        <StatCard icon={FlagIcon} label="Upcoming Deadlines" value={stats.deadlines} sub={nextDeadline ? `Next closes ${relDay(nextDeadline.date).toLowerCase()}` : 'Next 14 days'} tone="bg-rose-50 text-rose-600 dark:bg-rose-400/15 dark:text-rose-300" />
      </section>

      <Card className="p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-ink">Application pipeline</h2>
          <Link to="/app/applications" className="text-xs font-medium text-primary hover:underline dark:text-indigo-300">Open board</Link>
        </div>
        <div className="flex h-2.5 overflow-hidden rounded-full bg-subtle" role="img" aria-label={STATUSES.map((s) => `${s}: ${counts[s] || 0}`).join(', ')}>
          {STATUSES.map((s) => counts[s] ? <div key={s} style={{ width: `${(counts[s] || 0) / Math.max(1, applications.length) * 100}%`, background: statusDot[s] }} className="h-full border-r-2 border-card last:border-0" /> : null)}
        </div>
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
          {STATUSES.map((s) =>
          <li key={s} className="flex items-center gap-1.5 text-xs text-muted">
              <span className="h-2 w-2 rounded-full" style={{ background: statusDot[s] }} aria-hidden /> {s} <span className="font-semibold text-ink">{counts[s] || 0}</span>
            </li>
          )}
        </ul>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="min-w-0 overflow-hidden">
          <div className="flex flex-col gap-4 p-5 pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink">Recent Applications</h2>
              <Link to="/app/applications" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline dark:text-indigo-300">View all <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden /></Link>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_repeat(3,auto)]">
              <div className="relative sm:col-span-2 lg:col-span-1">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search company or role" aria-label="Search applications" className={cn(inputCls, 'pl-9')} />
              </div>
              <select value={status} onChange={(e) => setStatus(e.target.value as Status | 'all')} aria-label="Filter by status" className={cn(inputCls, 'lg:w-36')}>
                <option value="all">All statuses</option>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <select value={range} onChange={(e) => setRange(e.target.value)} aria-label="Filter by application date" className={cn(inputCls, 'lg:w-36')}>
                <option value="any">Any date</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort applications" className={cn(inputCls, 'lg:w-40')}>
                <option value="recent">Most recent</option>
                <option value="oldest">Oldest</option>
                <option value="company">Company name</option>
                <option value="deadline">Deadline</option>
              </select>
            </div>
          </div>
          {filtered.length ?
          <div className="border-t border-line">
              <ApplicationTable apps={filtered.slice(0, 6)} variant="compact" />
            </div> :

          <EmptyState icon={SearchXIcon} title={filtering ? 'No applications match' : 'No applications yet'} text={filtering ? 'Try a different search or clear the filters.' : 'Add your first opportunity to start tracking it.'} action={filtering ? <Button variant="secondary" size="sm" onClick={() => {setQ('');setStatus('all');setRange('any');}}>Clear filters</Button> : <Button size="sm" onClick={() => openAdd()}>Add Application</Button>} />
          }
          {filtered.length > 6 && <p className="border-t border-line px-5 py-3 text-xs text-muted">Showing 6 of {filtered.length}. <Link to="/app/applications" className="font-medium text-primary dark:text-indigo-300">See all</Link></p>}
        </Card>

        <div className="space-y-6">
          <UpcomingEvents />
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-ink">Resume Vault</h2>
                <p className="text-sm text-muted">{resumes.length} saved resume{resumes.length === 1 ? '' : 's'}</p>
              </div>
              <Link to="/app/resumes" className="text-sm font-medium text-primary hover:underline dark:text-indigo-300">Manage Resumes</Link>
            </div>
            <ul className="mt-4 space-y-2">
              {recentResumes.map((r) =>
              <li key={r.resumeId} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5">
                  <FileTextIcon className={cn('h-4 w-4 shrink-0', r.fileType === 'PDF' ? 'text-rose-500' : 'text-sky-500')} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{r.originalFileName}</span>
                    <span className="block text-xs text-muted">{r.category} · {fmtDate(r.updatedAt || r.uploadedAt, 'd MMM')}</span>
                  </span>
                </li>
              )}
            </ul>
            <Link to="/app/resumes?upload=1" className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-line text-sm font-medium text-ink transition hover:bg-subtle">
              <UploadIcon className="h-4 w-4" aria-hidden /> Upload Resume
            </Link>
          </Card>
        </div>
      </div>
    </div>);

}