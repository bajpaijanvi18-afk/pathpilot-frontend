import { addDays, differenceInCalendarDays, format, isValid, parseISO } from 'date-fns';

export const d = (offset: number) => format(addDays(new Date(), offset), 'yyyy-MM-dd');
export const ago = (hours: number) => new Date(Date.now() - hours * 3600_000).toISOString();
export const todayIso = () => format(new Date(), 'yyyy-MM-dd');
export const nowIso = () => new Date().toISOString();
export const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function fmtDate(iso?: string, pattern = 'd MMM yyyy') {
  if (!iso) return '';
  const dt = parseISO(iso);
  return isValid(dt) ? format(dt, pattern) : iso;
}

export function fmtTime(t?: string) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const dt = new Date();
  dt.setHours(h, m || 0);
  return format(dt, 'h:mm a');
}

export const daysUntil = (iso: string) => differenceInCalendarDays(parseISO(iso), new Date());

export function relDay(iso: string) {
  const n = daysUntil(iso);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return 'Yesterday';
  return fmtDate(iso, n > 1 && n < 7 ? 'EEEE, d MMM' : 'd MMMM');
}

export function fmtSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  return days === 1 ? 'Yesterday' : `${days}d ago`;
}

export function initials(name: string) {
  return name.
  replace(/[^a-zA-Z0-9& ]/g, ' ').
  split(/\s+/).
  filter(Boolean).
  slice(0, 2).
  map((w) => w[0]).
  join('').
  toUpperCase();
}