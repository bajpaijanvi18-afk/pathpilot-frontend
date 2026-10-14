import { twMerge } from 'tailwind-merge';
import type { EventType, Status } from '../types';

export const cn = (...c: (string | false | undefined | null)[]) => twMerge(c.filter(Boolean).join(' '));

export const STATUSES: Status[] = ['Saved', 'Applied', 'Assessment', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn'];

export const statusStyles: Record<Status, string> = {
  Applied: 'bg-[#E0F2FE] text-[#0369A1] dark:bg-sky-400/15 dark:text-sky-300',
  Assessment: 'bg-[#F3E8FF] text-[#7E22CE] dark:bg-purple-400/15 dark:text-purple-300',
  Interviewing: 'bg-[#FEF3C7] text-[#B45309] dark:bg-amber-400/15 dark:text-amber-300',
  Offer: 'bg-[#DCFCE7] text-[#15803D] dark:bg-green-400/15 dark:text-green-300',
  Rejected: 'bg-[#FFE4E6] text-[#BE123C] dark:bg-rose-400/15 dark:text-rose-300',
  Withdrawn: 'bg-[#F1F5F9] text-[#475569] dark:bg-slate-400/15 dark:text-slate-300',
  Saved: 'bg-[#E0E7FF] text-[#3730A3] dark:bg-indigo-400/15 dark:text-indigo-300'
};

export const statusDot: Record<Status, string> = {
  Applied: '#0EA5E9',
  Assessment: '#A855F7',
  Interviewing: '#F59E0B',
  Offer: '#22C55E',
  Rejected: '#F43F5E',
  Withdrawn: '#94A3B8',
  Saved: '#6366F1'
};

export const eventStyles: Record<EventType, {chip: string;dot: string;}> = {
  Deadline: { chip: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300', dot: '#4F46E5' },
  Assessment: { chip: 'bg-purple-50 text-purple-700 dark:bg-purple-400/15 dark:text-purple-300', dot: '#A855F7' },
  Interview: { chip: 'bg-amber-50 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300', dot: '#F59E0B' },
  'Follow-up': { chip: 'bg-sky-50 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300', dot: '#0EA5E9' },
  Offer: { chip: 'bg-green-50 text-green-700 dark:bg-green-400/15 dark:text-green-300', dot: '#22C55E' },
  Reminder: { chip: 'bg-slate-100 text-slate-700 dark:bg-slate-400/15 dark:text-slate-300', dot: '#64748B' }
};

export const inputCls =
'w-full h-10 rounded-lg border border-line bg-card px-3 text-sm text-ink placeholder:text-muted/70 transition duration-150 focus:outline-none focus:ring-2 focus:ring-[#A5B4FC] focus:border-primary-2 disabled:opacity-60 disabled:cursor-not-allowed';