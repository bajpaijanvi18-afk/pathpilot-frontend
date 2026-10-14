import React, { useState } from 'react';
import { addMonths, addWeeks, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon, FlagIcon, PlusIcon } from 'lucide-react';
import type { CalendarEvent, EventType } from '../types';
import { useStore } from '../contexts/StoreContext';
import { Button, Card, PageHeader } from '../components/ui';
import { EventModal } from '../components/EventModal';
import { EventIcon } from '../components/EventIcon';
import { byDateTime, upcomingEvents } from '../utils/stats';
import { cn, eventStyles } from '../utils/styles';
import { daysUntil, fmtTime, relDay } from '../utils/format';

const LEGEND: [EventType, string][] = [['Deadline', 'Application deadlines'], ['Assessment', 'Assessments'], ['Interview', 'Interviews'], ['Follow-up', 'Follow-ups'], ['Offer', 'Offer-related']];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarPage() {
  const { events, applications } = useStore();
  const [view, setView] = useState<'month' | 'week'>('month');
  const [cursor, setCursor] = useState(new Date());
  const [modal, setModal] = useState<{open: boolean;event?: CalendarEvent;date?: string;}>({ open: false });
  const opts = { weekStartsOn: 1 as const };

  const days = view === 'month' ?
  eachDayOfInterval({ start: startOfWeek(startOfMonth(cursor), opts), end: endOfWeek(endOfMonth(cursor), opts) }) :
  eachDayOfInterval({ start: startOfWeek(cursor, opts), end: endOfWeek(cursor, opts) });
  const onDay = (d: Date) => events.filter((e) => e.date === format(d, 'yyyy-MM-dd')).sort(byDateTime);
  const company = (e: CalendarEvent) => applications.find((a) => a.applicationId === e.applicationId)?.companyName;
  const move = (n: number) => setCursor((c) => view === 'month' ? addMonths(c, n) : addWeeks(c, n));
  const title = view === 'month' ? format(cursor, 'MMMM yyyy') : `${format(days[0], 'd MMM')} – ${format(days[6], 'd MMM yyyy')}`;
  const deadlines = upcomingEvents(events, 14).filter((e) => e.eventType === 'Deadline');
  const upcoming = upcomingEvents(events).slice(0, 6);

  const Chip = ({ e }: {e: CalendarEvent;}) =>
  <button onClick={(ev) => {ev.stopPropagation();setModal({ open: true, event: e });}} className={cn('block w-full truncate rounded-md px-1.5 py-0.5 text-left text-[11px] font-medium transition hover:brightness-95', eventStyles[e.eventType].chip)}>
      {e.startTime && <span className="opacity-70">{fmtTime(e.startTime).replace(':00', '')} </span>}
      {company(e) ? `${company(e)} · ` : ''}{e.title}
    </button>;


  return (
    <div>
      <PageHeader title="Calendar & Deadlines" subtitle="Every deadline, assessment and interview in one place." actions={<Button icon={<PlusIcon className="h-4 w-4" />} onClick={() => setModal({ open: true })}>New Event</Button>} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" aria-label="Previous" onClick={() => move(-1)}><ChevronLeftIcon className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" aria-label="Next" onClick={() => move(1)}><ChevronRightIcon className="h-4 w-4" /></Button>
              <h2 className="ml-1 text-base font-semibold text-ink" aria-live="polite">{title}</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setCursor(new Date())}>Today</Button>
              <div className="flex rounded-lg border border-line p-0.5" role="group" aria-label="Calendar view">
                {(['month', 'week'] as const).map((v) =>
                <button key={v} onClick={() => setView(v)} aria-pressed={view === v} className={cn('h-7 rounded-md px-3 text-xs font-medium capitalize transition', view === v ? 'bg-primary text-white' : 'text-muted hover:text-ink')}>{v}</button>
                )}
              </div>
            </div>
          </div>

          {view === 'month' ?
          <div>
              <div className="grid grid-cols-7 border-b border-line">{WEEKDAYS.map((d) => <div key={d} className="py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted">{d}</div>)}</div>
              <div className="grid grid-cols-7">
                {days.map((d) => {
                const list = onDay(d);
                return (
                  <div key={d.toISOString()} onClick={() => setModal({ open: true, date: format(d, 'yyyy-MM-dd') })} className={cn('min-h-[64px] cursor-pointer border-b border-r border-line p-1 transition hover:bg-subtle/60 sm:min-h-[104px] sm:p-1.5 [&:nth-child(7n)]:border-r-0', !isSameMonth(d, cursor) && 'bg-subtle/40')}>
                      <span className={cn('mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs', isToday(d) ? 'bg-primary font-semibold text-white' : isSameMonth(d, cursor) ? 'text-ink' : 'text-muted/60')}>{format(d, 'd')}</span>
                      <div className="hidden space-y-0.5 sm:block">
                        {list.slice(0, 2).map((e) => <Chip key={e.eventId} e={e} />)}
                        {list.length > 2 && <p className="px-1 text-[11px] text-muted">+{list.length - 2} more</p>}
                      </div>
                      <div className="flex flex-wrap gap-0.5 sm:hidden">{list.map((e) => <span key={e.eventId} className="h-1.5 w-1.5 rounded-full" style={{ background: eventStyles[e.eventType].dot }} />)}</div>
                    </div>);

              })}
              </div>
            </div> :

          <div className="grid divide-y divide-line md:grid-cols-7 md:divide-x md:divide-y-0">
              {days.map((d) => {
              const list = onDay(d);
              return (
                <div key={d.toISOString()} className="min-h-[90px] p-3 md:min-h-[360px]">
                    <button onClick={() => setModal({ open: true, date: format(d, 'yyyy-MM-dd') })} className="mb-2 flex w-full items-center gap-2 text-left md:flex-col md:items-start md:gap-0" aria-label={`Add event on ${format(d, 'd MMMM')}`}>
                      <span className="text-[11px] font-semibold uppercase text-muted">{format(d, 'EEE')}</span>
                      <span className={cn('flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold', isToday(d) ? 'bg-primary text-white' : 'text-ink')}>{format(d, 'd')}</span>
                    </button>
                    <div className="space-y-1.5">
                      {list.map((e) =>
                    <button key={e.eventId} onClick={() => setModal({ open: true, event: e })} className={cn('block w-full rounded-lg p-2 text-left text-xs', eventStyles[e.eventType].chip)}>
                          <span className="block font-semibold">{company(e) ?? 'Personal'}</span>
                          <span className="block">{e.title}</span>
                          {e.startTime && <span className="block opacity-75">{fmtTime(e.startTime)}</span>}
                        </button>
                    )}
                      {!list.length && <p className="text-xs text-muted/70">—</p>}
                    </div>
                  </div>);

            })}
            </div>
          }
          <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-line p-4">
            {LEGEND.map(([t, l]) => <span key={t} className="flex items-center gap-1.5 text-xs text-muted"><span className="h-2 w-2 rounded-full" style={{ background: eventStyles[t].dot }} aria-hidden />{l}</span>)}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="mb-3 flex items-center gap-2 text-base font-semibold text-ink"><FlagIcon className="h-4 w-4 text-primary" aria-hidden /> Approaching deadlines</h2>
            {deadlines.length ?
            <ul className="space-y-2">
                {deadlines.map((e) => {
                const n = daysUntil(e.date);
                return (
                  <li key={e.eventId}>
                      <button onClick={() => setModal({ open: true, event: e })} className={cn('flex w-full items-center justify-between gap-3 rounded-xl border p-3 text-left', n <= 3 ? 'border-rose-200 bg-rose-50/70 dark:border-rose-500/30 dark:bg-rose-400/10' : 'border-line')}>
                        <span className="min-w-0"><span className="block truncate text-sm font-semibold text-ink">{company(e) ?? e.title}</span><span className="block text-xs text-muted">{relDay(e.date)}</span></span>
                        <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold', n <= 3 ? 'bg-rose-600 text-white' : 'bg-subtle text-ink')}>{n === 0 ? 'Today' : `${n}d left`}</span>
                      </button>
                    </li>);

              })}
              </ul> :
            <p className="text-sm text-muted">No deadlines in the next 14 days.</p>}
          </Card>
          <Card className="p-5">
            <h2 className="mb-3 text-base font-semibold text-ink">Upcoming</h2>
            <ul className="space-y-1">
              {upcoming.map((e) =>
              <li key={e.eventId}>
                  <button onClick={() => setModal({ open: true, event: e })} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-subtle">
                    <EventIcon type={e.eventType} />
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-ink">{company(e) ?? 'Personal'} · {e.title}</span><span className="block text-xs text-muted">{relDay(e.date)}{e.startTime ? ` · ${fmtTime(e.startTime)}` : ''} · {e.timeZone}</span></span>
                  </button>
                </li>
              )}
              {!upcoming.length && <li className="text-sm text-muted">Nothing upcoming.</li>}
            </ul>
          </Card>
        </div>
      </div>
      <EventModal open={modal.open} onClose={() => setModal({ open: false })} event={modal.event} defaultDate={modal.date} />
    </div>);

}