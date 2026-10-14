import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightIcon, CalendarCheckIcon } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { Card, EmptyState } from './ui';
import { EventIcon } from './EventIcon';
import { upcomingEvents } from '../utils/stats';
import { fmtTime, relDay } from '../utils/format';

export function UpcomingEvents({ limit = 4 }: {limit?: number;}) {
  const { events, applications } = useStore();
  const list = upcomingEvents(events).slice(0, limit);
  return (
    <Card>
      <div className="flex items-center justify-between px-5 pb-2 pt-5">
        <h2 className="text-base font-semibold text-ink">Upcoming Events</h2>
        <Link to="/app/calendar" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline dark:text-indigo-300">
          View Calendar <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
      {list.length === 0 ?
      <EmptyState icon={CalendarCheckIcon} title="Nothing scheduled" text="Interviews, assessments and deadlines you add will appear here." /> :

      <ul className="px-3 pb-3">
          {list.map((e) => {
          const app = applications.find((a) => a.applicationId === e.applicationId);
          const body =
          <>
                <EventIcon type={e.eventType} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">{app?.companyName ?? 'Personal reminder'}</span>
                  <span className="block truncate text-sm text-muted">{e.title}</span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-xs font-semibold text-ink">{relDay(e.date)}</span>
                  {e.startTime && <span className="block text-xs text-muted">{fmtTime(e.startTime)}</span>}
                </span>
              </>;

          return (
            <li key={e.eventId}>
                <Link to={app ? `/app/applications/${app.applicationId}` : '/app/calendar'} className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-subtle">
                  {body}
                </Link>
              </li>);

        })}
        </ul>
      }
    </Card>);

}