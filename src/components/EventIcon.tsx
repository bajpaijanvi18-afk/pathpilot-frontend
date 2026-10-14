import React from 'react';
import { AwardIcon, BellIcon, ClipboardListIcon, FlagIcon, MailIcon, VideoIcon } from 'lucide-react';
import type { EventType } from '../types';
import { cn, eventStyles } from '../utils/styles';

const ICONS: Record<EventType, React.ElementType> = {
  Deadline: FlagIcon,
  Assessment: ClipboardListIcon,
  Interview: VideoIcon,
  'Follow-up': MailIcon,
  Offer: AwardIcon,
  Reminder: BellIcon
};

export function EventIcon({ type, className }: {type: EventType;className?: string;}) {
  const Icon = ICONS[type];
  return (
    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', eventStyles[type].chip, className)} aria-hidden>
      <Icon className="h-4 w-4" />
    </span>);

}