import type { Application, CalendarEvent, Status } from '../types';
import { daysUntil } from './format';

export const byDateTime = (a: CalendarEvent, b: CalendarEvent) =>
(a.date + (a.startTime || '00:00')).localeCompare(b.date + (b.startTime || '00:00'));

export function upcomingEvents(events: CalendarEvent[], withinDays?: number) {
  return events.
  filter((e) => {
    const n = daysUntil(e.date);
    return n >= 0 && (withinDays === undefined || n <= withinDays);
  }).
  sort(byDateTime);
}

/** Counting rules: interviews = upcoming Interview events; deadlines = Deadline events in the next 14 days. */
export function getStats(apps: Application[], events: CalendarEvent[]) {
  return {
    total: apps.length,
    interviews: upcomingEvents(events).filter((e) => e.eventType === 'Interview').length,
    offers: apps.filter((a) => a.status === 'Offer').length,
    deadlines: upcomingEvents(events, 14).filter((e) => e.eventType === 'Deadline').length
  };
}

export function countByStatus(apps: Application[]) {
  return apps.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {}) as Partial<Record<Status, number>>;
}

export const nextEventFor = (appId: string, events: CalendarEvent[]) =>
upcomingEvents(events).find((e) => e.applicationId === appId);