import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppNotification, Application, CalendarEvent, PrepPlan, PrepQuestion, Profile, Resume, Status, TimelineEntry } from '../types';
import { sampleApplications, sampleEvents, sampleNotifications, samplePrepPlans, sampleProfile, sampleQuestions, sampleResumes } from '../data/sampleData';
import { delay, nowIso, todayIso, uid } from '../utils/format';

/**
 * Prototype data layer. Every mutation goes through this provider so it can later be
 * swapped for API Gateway/Lambda calls authorised by Cognito tokens. Data lives in localStorage only.
 */
interface DataState {
  applications: Application[];
  resumes: Resume[];
  events: CalendarEvent[];
  notifications: AppNotification[];
  prepPlans: PrepPlan[];
  questions: PrepQuestion[];
  profile: Profile;
}

export type AppInput = Omit<Application, 'applicationId' | 'timeline' | 'createdAt' | 'updatedAt'>;
interface AddModalState {open: boolean;editId?: string;resumeId?: string;}

interface StoreValue extends DataState {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
  signedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string) => Promise<void>;
  enterDemo: () => void;
  signOut: () => void;
  saveApplication: (input: AppInput, id?: string) => Application;
  updateApplication: (id: string, patch: Partial<Application>) => void;
  deleteApplication: (id: string) => void;
  duplicateApplication: (id: string) => Application | undefined;
  setStatus: (id: string, status: Status) => void;
  addTimelineNote: (id: string, label: string) => void;
  addResume: (r: Omit<Resume, 'resumeId' | 'uploadedAt'>) => Resume;
  updateResume: (id: string, patch: Partial<Resume>) => void;
  deleteResume: (id: string) => void;
  saveEvent: (ev: Omit<CalendarEvent, 'eventId'>, id?: string) => void;
  deleteEvent: (id: string) => void;
  savePrep: (plan: PrepPlan) => void;
  deletePrep: (id: string) => void;
  addQuestion: (q: Omit<PrepQuestion, 'id'>) => void;
  deleteQuestion: (id: string) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  updateProfile: (p: Partial<Profile>) => void;
  resetDemo: () => void;
  addModal: AddModalState;
  openAdd: (opts?: {editId?: string;resumeId?: string;}) => void;
  closeAdd: () => void;
}

const DATA_KEY = 'pathpilot.demo.v1';
const THEME_KEY = 'pathpilot.theme';
const SESSION_KEY = 'pathpilot.session';

const seed = (): DataState =>
JSON.parse(JSON.stringify({ applications: sampleApplications, resumes: sampleResumes, events: sampleEvents, notifications: sampleNotifications, prepPlans: samplePrepPlans, questions: sampleQuestions, profile: sampleProfile }));

function loadData(): DataState {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (raw) return { ...seed(), ...JSON.parse(raw) };
  } catch {

    /* ignore corrupt storage */}
  return seed();
}

const sys = (label: string, kind: TimelineEntry['kind'] = 'system'): TimelineEntry => ({ id: uid('tl'), date: todayIso(), label, kind });

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: {children: React.ReactNode;}) {
  const [data, setData] = useState<DataState>(loadData);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => localStorage.getItem(THEME_KEY) as 'light' | 'dark' || 'light');
  const [signedIn, setSignedIn] = useState(() => localStorage.getItem(SESSION_KEY) === '1');
  const [addModal, setAddModal] = useState<AddModalState>({ open: false });

  useEffect(() => localStorage.setItem(DATA_KEY, JSON.stringify(data)), [data]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const patch = (fn: (s: DataState) => Partial<DataState>) => setData((s) => ({ ...s, ...fn(s) }));
  const startSession = () => {
    localStorage.setItem(SESSION_KEY, '1');
    setSignedIn(true);
  };

  const saveApplication = (input: AppInput, id?: string): Application => {
    const now = nowIso();
    const existing = id ? data.applications.find((a) => a.applicationId === id) : undefined;
    let saved: Application;
    if (existing) {
      const timeline = [...existing.timeline];
      if (existing.status !== input.status) timeline.push(sys(`Status changed from ${existing.status} to ${input.status}`));
      if (existing.isDraft && !input.isDraft) timeline.push(sys('Draft reviewed and saved'));
      saved = { ...existing, ...input, timeline, updatedAt: now };
    } else {
      const timeline: TimelineEntry[] = [];
      if (input.sourceDocument) timeline.push(sys(input.needsReview ? 'Details extracted from a document — review pending' : 'Details extracted from a document and reviewed'));
      timeline.push(sys(input.isDraft ? 'Saved as draft' : input.status === 'Saved' ? 'Job saved' : `Added with status ${input.status}`));
      saved = { ...input, applicationId: uid('app'), timeline, createdAt: now, updatedAt: now };
    }
    let events = data.events;
    const dl = events.find((e) => e.applicationId === saved.applicationId && e.eventType === 'Deadline');
    if (saved.applicationDeadline) {
      events = dl ?
      events.map((e) => e === dl ? { ...e, date: saved.applicationDeadline as string } : e) :
      [...events, { eventId: uid('evt'), applicationId: saved.applicationId, title: 'Application deadline', eventType: 'Deadline', date: saved.applicationDeadline, timeZone: data.profile.timeZone, reminderPreference: data.profile.reminderLead }];
    } else if (dl) events = events.filter((e) => e !== dl);
    setData((s) => ({
      ...s,
      events,
      applications: existing ? s.applications.map((a) => a.applicationId === id ? saved : a) : [saved, ...s.applications]
    }));
    return saved;
  };

  const value: StoreValue = {
    ...data,
    theme,
    setTheme,
    signedIn,
    signIn: async (_email, password) => {
      await delay(900);
      if (password === 'wrongpassword') throw new Error('Incorrect email or password. Check your details and try again.');
      startSession();
    },
    register: async (_name, email) => {
      await delay(1000);
      if (email.toLowerCase().startsWith('taken@')) throw new Error("We couldn't create an account with these details. Try signing in, or use a different email address.");
    },
    enterDemo: startSession,
    signOut: () => {
      localStorage.removeItem(SESSION_KEY);
      setSignedIn(false);
    },
    saveApplication,
    updateApplication: (id, p) => patch((s) => ({ applications: s.applications.map((a) => a.applicationId === id ? { ...a, ...p, updatedAt: nowIso() } : a) })),
    deleteApplication: (id) =>
    patch((s) => ({
      applications: s.applications.filter((a) => a.applicationId !== id),
      events: s.events.filter((e) => e.applicationId !== id),
      prepPlans: s.prepPlans.filter((p) => p.applicationId !== id)
    })),
    duplicateApplication: (id) => {
      const src = data.applications.find((a) => a.applicationId === id);
      if (!src) return undefined;
      const copy: Application = { ...src, applicationId: uid('app'), jobTitle: `${src.jobTitle} (copy)`, status: 'Saved', dateApplied: undefined, timeline: [sys(`Duplicated from ${src.companyName} — ${src.jobTitle}`)], createdAt: nowIso(), updatedAt: nowIso() };
      patch((s) => ({ applications: [copy, ...s.applications] }));
      return copy;
    },
    setStatus: (id, status) =>
    patch((s) => ({
      applications: s.applications.map((a) =>
      a.applicationId === id && a.status !== status ?
      { ...a, status, dateApplied: a.dateApplied || (status !== 'Saved' && status !== 'Withdrawn' ? todayIso() : undefined), timeline: [...a.timeline, sys(`Status changed from ${a.status} to ${status}`)], updatedAt: nowIso() } :
      a
      )
    })),
    addTimelineNote: (id, label) => patch((s) => ({ applications: s.applications.map((a) => a.applicationId === id ? { ...a, timeline: [...a.timeline, sys(label, 'user')] } : a) })),
    addResume: (r) => {
      const resume: Resume = { ...r, resumeId: uid('res'), uploadedAt: todayIso() };
      patch((s) => ({ resumes: [resume, ...s.resumes] }));
      return resume;
    },
    updateResume: (id, p) => patch((s) => ({ resumes: s.resumes.map((r) => r.resumeId === id ? { ...r, ...p, updatedAt: todayIso() } : r) })),
    deleteResume: (id) =>
    patch((s) => ({
      resumes: s.resumes.filter((r) => r.resumeId !== id),
      applications: s.applications.map((a) => a.resumeId === id ? { ...a, resumeId: undefined } : a)
    })),
    saveEvent: (ev, id) =>
    patch((s) => ({ events: id ? s.events.map((e) => e.eventId === id ? { ...ev, eventId: id } : e) : [...s.events, { ...ev, eventId: uid('evt') }] })),
    deleteEvent: (id) => patch((s) => ({ events: s.events.filter((e) => e.eventId !== id) })),
    savePrep: (plan) =>
    patch((s) => ({
      prepPlans: s.prepPlans.some((p) => p.preparationId === plan.preparationId) ?
      s.prepPlans.map((p) => p.preparationId === plan.preparationId ? { ...plan, updatedAt: nowIso() } : p) :
      [{ ...plan, updatedAt: nowIso() }, ...s.prepPlans]
    })),
    deletePrep: (id) => patch((s) => ({ prepPlans: s.prepPlans.filter((p) => p.preparationId !== id) })),
    addQuestion: (q) => patch((s) => ({ questions: [{ ...q, id: uid('q') }, ...s.questions] })),
    deleteQuestion: (id) => patch((s) => ({ questions: s.questions.filter((q) => q.id !== id) })),
    markRead: (id) => patch((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) })),
    markAllRead: () => patch((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
    updateProfile: (p) => patch((s) => ({ profile: { ...s.profile, ...p } })),
    resetDemo: () => setData(seed()),
    addModal,
    openAdd: (opts) => setAddModal({ open: true, ...opts }),
    closeAdd: () => setAddModal({ open: false })
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}