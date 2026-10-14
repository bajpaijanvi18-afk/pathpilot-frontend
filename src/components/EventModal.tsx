import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { InfoIcon, Trash2Icon } from 'lucide-react';
import type { CalendarEvent, EventType, ReminderPreference } from '../types';
import { useStore } from '../contexts/StoreContext';
import { Button, ConfirmDialog, Field, Modal } from './ui';
import { cn, inputCls } from '../utils/styles';

const TYPES: EventType[] = ['Deadline', 'Assessment', 'Interview', 'Follow-up', 'Offer', 'Reminder'];
const ZONES = ['Asia/Kolkata', 'UTC', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Asia/Singapore'];

type Draft = Omit<CalendarEvent, 'eventId'>;

export function EventModal({ open, onClose, event, defaultDate }: {open: boolean;onClose: () => void;event?: CalendarEvent;defaultDate?: string;}) {
  const { applications, saveEvent, deleteEvent, profile } = useStore();
  const [f, setF] = useState<Draft>({ title: '', eventType: 'Interview', date: '', timeZone: profile.timeZone, reminderPreference: profile.reminderLead });
  const [errors, setErrors] = useState<{title?: string;date?: string;lead?: string;}>({});
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setF(event ? { ...event } : { title: '', eventType: 'Interview', date: defaultDate ?? '', timeZone: profile.timeZone, reminderPreference: profile.reminderLead });
  }, [open, event, defaultDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof Draft,>(k: K, v: Draft[K]) => setF((p) => ({ ...p, [k]: v }));
  const save = () => {
    const e: typeof errors = {};
    if (!f.title.trim()) e.title = 'Add a title';
    if (!f.date) e.date = 'Choose a date';
    if (f.reminderPreference === 'custom' && !(f.customLeadHours && f.customLeadHours > 0)) e.lead = 'Enter hours before the event';
    setErrors(e);
    if (Object.keys(e).length) return;
    saveEvent({ ...f, title: f.title.trim(), applicationId: f.applicationId || undefined, startTime: f.startTime || undefined }, event?.eventId);
    toast.success(event ? 'Event updated' : 'Event added to calendar');
    onClose();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={event ? 'Edit event' : 'New event'}
        footer={
        <>
            {event && <Button variant="ghost" className="mr-auto text-rose-600 hover:text-rose-700" icon={<Trash2Icon className="h-4 w-4" />} onClick={() => setConfirm(true)}>Delete</Button>}
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={save}>{event ? 'Save Changes' : 'Add Event'}</Button>
          </>
        }>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" htmlFor="ev-title" required error={errors.title} className="sm:col-span-2">
            <input id="ev-title" value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Technical Round" className={cn(inputCls, errors.title && 'border-rose-400')} />
          </Field>
          <Field label="Event type" htmlFor="ev-type">
            <select id="ev-type" value={f.eventType} onChange={(e) => set('eventType', e.target.value as EventType)} className={inputCls}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          </Field>
          <Field label="Related application" htmlFor="ev-app">
            <select id="ev-app" value={f.applicationId ?? ''} onChange={(e) => set('applicationId', e.target.value || undefined)} className={inputCls}>
              <option value="">None (personal)</option>
              {applications.map((a) => <option key={a.applicationId} value={a.applicationId}>{a.companyName} — {a.jobTitle}</option>)}
            </select>
          </Field>
          <Field label="Date" htmlFor="ev-date" required error={errors.date}>
            <input id="ev-date" type="date" value={f.date} onChange={(e) => set('date', e.target.value)} className={cn(inputCls, errors.date && 'border-rose-400')} />
          </Field>
          <Field label="Start time" htmlFor="ev-time" hint="Optional">
            <input id="ev-time" type="time" value={f.startTime ?? ''} onChange={(e) => set('startTime', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Time zone" htmlFor="ev-tz">
            <select id="ev-tz" value={f.timeZone} onChange={(e) => set('timeZone', e.target.value)} className={inputCls}>{ZONES.map((z) => <option key={z}>{z}</option>)}</select>
          </Field>
          <Field label="Reminder" htmlFor="ev-rem" error={errors.lead}>
            <div className="flex gap-2">
              <select id="ev-rem" value={f.reminderPreference} onChange={(e) => set('reminderPreference', e.target.value as ReminderPreference)} className={inputCls}>
                <option value="none">No reminder</option>
                <option value="same-day">On the event date</option>
                <option value="1-day">One day before</option>
                <option value="custom">Custom lead time</option>
              </select>
              {f.reminderPreference === 'custom' && <input type="number" min={1} value={f.customLeadHours ?? ''} onChange={(e) => set('customLeadHours', Number(e.target.value))} aria-label="Hours before" placeholder="hrs" className={cn(inputCls, 'w-20')} />}
            </div>
          </Field>
          <Field label="Notes" htmlFor="ev-notes" className="sm:col-span-2">
            <textarea id="ev-notes" rows={3} value={f.notes ?? ''} onChange={(e) => set('notes', e.target.value)} className={cn(inputCls, 'h-auto py-2.5')} />
          </Field>
          <p className="flex gap-2 text-xs text-muted sm:col-span-2"><InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> Reminder preferences are saved. Email or push delivery needs a notification service, which isn't connected in this demo.</p>
          {event?.applicationId && <Link to={`/app/applications/${event.applicationId}`} onClick={onClose} className="text-sm font-medium text-primary hover:underline dark:text-indigo-300 sm:col-span-2">Open linked application →</Link>}
        </div>
      </Modal>
      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} title="Delete this event?" message="It will be removed from your calendar and dashboard." onConfirm={() => {if (event) {deleteEvent(event.eventId);toast.success('Event deleted');onClose();}}} />
    </>);

}