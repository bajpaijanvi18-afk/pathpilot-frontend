import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClockIcon, CircleCheckIcon, ClipboardListIcon, FileWarningIcon, FlagIcon, MailIcon, RefreshCwIcon, VideoIcon } from 'lucide-react';
import type { AppNotification, NotificationType } from '../types';
import { useStore } from '../contexts/StoreContext';
import { cn } from '../utils/styles';
import { timeAgo } from '../utils/format';

export const notificationMeta: Record<NotificationType, {label: string;icon: React.ElementType;cls: string;}> = {
  interview: { label: 'Interview', icon: VideoIcon, cls: 'bg-amber-50 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300' },
  deadline: { label: 'Deadline', icon: FlagIcon, cls: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300' },
  assessment: { label: 'Assessment', icon: ClipboardListIcon, cls: 'bg-purple-50 text-purple-700 dark:bg-purple-400/15 dark:text-purple-300' },
  status: { label: 'Status update', icon: RefreshCwIcon, cls: 'bg-sky-50 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300' },
  'follow-up': { label: 'Follow-up', icon: MailIcon, cls: 'bg-sky-50 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300' },
  'processing-complete': { label: 'Document processed', icon: CircleCheckIcon, cls: 'bg-green-50 text-green-700 dark:bg-green-400/15 dark:text-green-300' },
  'processing-failed': { label: 'Processing failed', icon: FileWarningIcon, cls: 'bg-rose-50 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300' }
};

export function NotificationItem({ n, compact, onOpen }: {n: AppNotification;compact?: boolean;onOpen?: () => void;}) {
  const { markRead, applications } = useStore();
  const nav = useNavigate();
  const meta = notificationMeta[n.type];
  const app = applications.find((a) => a.applicationId === n.applicationId);
  return (
    <div className={cn('group relative flex gap-3 rounded-xl p-3 transition hover:bg-subtle', !n.read && 'bg-primary-soft/50')}>
      <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', meta.cls)} aria-hidden>
        <meta.icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm text-ink', !n.read ? 'font-semibold' : 'font-medium')}>{n.title}</p>
          {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
        </div>
        <p className={cn('mt-0.5 text-sm text-muted', compact && 'line-clamp-2')}>{n.description}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span>{meta.label}</span>
          <span aria-hidden>·</span>
          <time dateTime={n.timestamp}>{timeAgo(n.timestamp)}</time>
          {app &&
          <button className="font-medium text-primary hover:underline dark:text-indigo-300" onClick={() => {markRead(n.id);onOpen?.();nav(`/app/applications/${app.applicationId}`);}}>
              Open {app.companyName}
            </button>
          }
          {!n.read &&
          <button className="font-medium text-muted hover:text-ink" onClick={() => markRead(n.id)}>
              Mark as read
            </button>
          }
          {!app && n.type === 'deadline' && <CalendarClockIcon className="h-3.5 w-3.5" aria-hidden />}
        </div>
      </div>
    </div>);

}