import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { DownloadIcon, InfoIcon, KeyRoundIcon, LogOutIcon, MonitorSmartphoneIcon, MoonIcon, RotateCcwIcon, ShieldCheckIcon, SunIcon, Trash2Icon } from 'lucide-react';
import type { JobType, Profile, ReminderPreference } from '../types';
import { useStore } from '../contexts/StoreContext';
import { Button, Card, ConfirmDialog, Field, PageHeader, Tabs, Toggle } from '../components/ui';
import { cn, inputCls } from '../utils/styles';
import { downloadFile } from '../utils/csv';
import { initials } from '../utils/format';

type Tab = 'profile' | 'preferences' | 'security' | 'privacy';

function Section({ title, text, children }: {title: string;text?: string;children: React.ReactNode;}) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {text && <p className="mt-0.5 text-sm text-muted">{text}</p>}
      <div className="mt-5">{children}</div>
    </Card>);

}

export function Settings() {
  const store = useStore();
  const { profile, updateProfile, theme, setTheme, signOut, resetDemo } = store;
  const [params, setParams] = useSearchParams();
  const nav = useNavigate();
  const tab = params.get('tab') as Tab || 'profile';
  const [p, setP] = useState<Profile>(profile);
  const [errors, setErrors] = useState<Partial<Record<keyof Profile, string>>>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const set = <K extends keyof Profile,>(k: K, v: Profile[K]) => setP((x) => ({ ...x, [k]: v }));

  const saveProfile = async () => {
    const e: typeof errors = {};
    if (!p.fullName.trim()) e.fullName = 'Full name is required';
    if (p.phone && !/^[+\d][\d\s-]{6,}$/.test(p.phone)) e.phone = 'Enter a valid phone number';
    if (p.graduationYear && !/^\d{4}$/.test(p.graduationYear)) e.graduationYear = 'Use a 4-digit year';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    updateProfile(p);
    setSaving(false);
    toast.success('Profile saved', { description: 'Stored in this browser (demo).' });
  };

  const pref = <K extends keyof Profile,>(k: K, v: Profile[K]) => {updateProfile({ [k]: v } as Partial<Profile>);setP((x) => ({ ...x, [k]: v }));toast.success('Preference updated');};
  const text = (k: keyof Profile, label: string, placeholder = '') =>
  <Field label={label} htmlFor={`p-${k}`} error={errors[k]}>
      <input id={`p-${k}`} value={p[k] as string ?? ''} onChange={(e) => set(k, e.target.value as never)} placeholder={placeholder} className={cn(inputCls, errors[k] && 'border-rose-400')} />
    </Field>;


  return (
    <div>
      <PageHeader title="Profile & Settings" subtitle="Manage your details, preferences and account." />
      <Tabs className="mb-6" value={tab} onChange={(t) => setParams(t === 'profile' ? {} : { tab: t }, { replace: true })} tabs={[{ id: 'profile', label: 'Profile' }, { id: 'preferences', label: 'Preferences' }, { id: 'security', label: 'Security' }, { id: 'privacy', label: 'Privacy & Data' }]} />

      <div className="max-w-3xl space-y-6">
        {tab === 'profile' &&
        <Section title="Profile" text="Used to personalise your dashboard.">
            <div className="mb-6 flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">{initials(p.fullName || '?')}</span>
              <div><p className="font-semibold text-ink">{profile.fullName}</p><p className="text-sm text-muted">{profile.email}</p></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {text('fullName', 'Full name')}
              <Field label="Email address" htmlFor="p-email" hint="Managed by your sign-in provider. Verification status appears once authentication is connected.">
                <input id="p-email" value={p.email} disabled className={inputCls} />
              </Field>
              {text('phone', 'Phone number (optional)', '+91 98765 43210')}
              {text('university', 'University (optional)')}
              {text('degree', 'Degree (optional)')}
              {text('graduationYear', 'Graduation year (optional)', '2027')}
              {text('preferredRoles', 'Preferred job roles', 'e.g. Software Engineer, Data Analyst')}
              {text('preferredLocations', 'Preferred work locations', 'e.g. Bengaluru, Remote')}
              <Field label="Preferred job type" htmlFor="p-type">
                <select id="p-type" value={p.preferredJobType} onChange={(e) => set('preferredJobType', e.target.value as JobType | '')} className={inputCls}>
                  <option value="">No preference</option>
                  {['Internship', 'Full-time', 'Part-time', 'Contract', 'Other'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => {setP(profile);setErrors({});}}>Discard</Button>
              <Button onClick={saveProfile} loading={saving}>Save Profile</Button>
            </div>
          </Section>
        }

        {tab === 'preferences' &&
        <>
            <Section title="Appearance">
              <div className="grid max-w-sm grid-cols-2 gap-3" role="radiogroup" aria-label="Theme">
                {([['light', SunIcon, 'Light'], ['dark', MoonIcon, 'Dark']] as const).map(([v, Icon, l]) =>
              <button key={v} role="radio" aria-checked={theme === v} onClick={() => setTheme(v)} className={cn('flex items-center gap-2 rounded-xl border p-3 text-sm font-medium transition', theme === v ? 'border-primary bg-primary-soft/60 text-ink' : 'border-line text-muted hover:bg-subtle')}>
                    <Icon className="h-4 w-4" aria-hidden /> {l}
                  </button>
              )}
              </div>
            </Section>
            <Section title="Workspace defaults">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Default application view" htmlFor="pr-view">
                  <select id="pr-view" value={p.defaultView} onChange={(e) => pref('defaultView', e.target.value as Profile['defaultView'])} className={inputCls}><option value="table">Table</option><option value="kanban">Kanban board</option></select>
                </Field>
                <Field label="Default reminder lead time" htmlFor="pr-lead">
                  <select id="pr-lead" value={p.reminderLead} onChange={(e) => pref('reminderLead', e.target.value as ReminderPreference)} className={inputCls}><option value="same-day">On the event date</option><option value="1-day">One day before</option><option value="none">No reminder</option></select>
                </Field>
                <Field label="Time zone" htmlFor="pr-tz">
                  <select id="pr-tz" value={p.timeZone} onChange={(e) => pref('timeZone', e.target.value)} className={inputCls}>{['Asia/Kolkata', 'UTC', 'Europe/London', 'America/New_York', 'Asia/Singapore'].map((z) => <option key={z}>{z}</option>)}</select>
                </Field>
              </div>
            </Section>
            <Section title="Notifications" text="In-app notifications work in this demo. Email delivery needs a notification service that isn't connected yet.">
              <div className="divide-y divide-line">
                <Toggle checked={p.notifyInApp} onChange={(v) => pref('notifyInApp', v)} label="In-app notifications" description="Deadlines, interviews and status updates in the bell menu." />
                <Toggle checked={p.notifyDigest} onChange={(v) => pref('notifyDigest', v)} label="Weekly email digest" description="Saved as a preference — not delivered until email is configured." />
              </div>
            </Section>
          </>
        }

        {tab === 'security' &&
        <>
            <Section title="Password" text="Password changes are handled by the authentication provider (Amazon Cognito), which isn't connected in this prototype.">
              <Button variant="secondary" disabled icon={<KeyRoundIcon className="h-4 w-4" />}>Change password — available after sign-in is connected</Button>
            </Section>
            <Section title="Sessions" text="Session management will list signed-in devices once authentication is connected.">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line p-4">
                <span className="flex items-center gap-3 text-sm"><MonitorSmartphoneIcon className="h-5 w-5 text-muted" aria-hidden /><span><span className="block font-medium text-ink">This browser</span><span className="text-muted">Demo session</span></span></span>
                <Button variant="secondary" icon={<LogOutIcon className="h-4 w-4" />} onClick={() => {signOut();nav('/login');}}>Sign out</Button>
              </div>
            </Section>
            <Section title="Delete account" text="Permanently removes your profile, applications, resumes, notes and events.">
              <Button variant="danger" icon={<Trash2Icon className="h-4 w-4" />} onClick={() => setConfirmDelete(true)}>Delete Account</Button>
            </Section>
          </>
        }

        {tab === 'privacy' &&
        <>
            <Section title="Your data stays private">
              <ul className="space-y-3 text-sm text-muted">
                {['Your resumes, applications, notes and events are visible only to you.', 'In production, documents are stored privately and shared only through short-lived authorised links — never public URLs.', 'Every request is checked against your signed-in identity on the server, so no one else can read your records.', 'In this demo, all data is stored locally in your browser and never leaves your device.'].map((t) =>
              <li key={t} className="flex gap-2"><ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden />{t}</li>
              )}
              </ul>
            </Section>
            <Section title="Export your data" text="Download everything PathPilot stores for you as a JSON file.">
              <Button variant="secondary" icon={<DownloadIcon className="h-4 w-4" />} onClick={() => {const { applications, resumes, events, prepPlans, questions, notifications } = store;downloadFile('pathpilot-export.json', JSON.stringify({ profile, applications, resumes, events, prepPlans, questions, notifications }, null, 2), 'application/json');toast.success('Export downloaded');}}>Export My Data</Button>
            </Section>
            <Section title="Demo data" text="Restore the original sample applications, resumes and events.">
              <Button variant="secondary" icon={<RotateCcwIcon className="h-4 w-4" />} onClick={() => setConfirmReset(true)}>Reset Demo Data</Button>
              <p className="mt-3 flex gap-2 text-xs text-muted"><InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> All sample companies and records are fictional demonstration content.</p>
            </Section>
          </>
        }
      </div>

      <ConfirmDialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete your account?" confirmLabel="Delete Account" message="All applications, resumes, notes, preparation plans and events will be permanently removed. This can't be undone. In this demo, it clears the data stored in your browser and signs you out." onConfirm={() => {resetDemo();signOut();nav('/');toast.success('Account data removed from this browser');}} />
      <ConfirmDialog open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset demo data?" confirmLabel="Reset" message="Your changes will be replaced with the original sample data." onConfirm={() => {resetDemo();toast.success('Demo data restored');}} />
    </div>);

}