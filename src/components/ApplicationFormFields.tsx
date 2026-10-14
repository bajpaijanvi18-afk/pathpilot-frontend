import React, { useState } from "react";
import { SparklesIcon, TriangleAlertIcon, XIcon, BoxIcon } from "lucide-react";
import { JobType, Status, WorkMode } from "../types";
import { AppForm, FieldMark, FormErrors, Marks } from "../utils/applicationForm";
import { Field } from "./ui";
import { STATUSES, cn, inputCls } from "../utils/styles";
import { todayIso } from "../utils/format";
type Setter = <K extends keyof AppForm>(k: K, v: AppForm[K]) => void;
const MARK: Record<FieldMark, {
  label: string;
  cls: string;
  icon: React.ElementType;
}> = {
  extracted: {
    label: 'Extracted',
    cls: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300',
    icon: SparklesIcon
  },
  review: {
    label: 'Verify',
    cls: 'bg-amber-50 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
    icon: TriangleAlertIcon
  },
  missing: {
    label: 'Not found',
    cls: 'bg-slate-100 text-slate-600 dark:bg-slate-400/15 dark:text-slate-300',
    icon: BoxIcon
  }
};
export function MarkChip({
  mark


}: {mark: FieldMark;}) {
  const m = MARK[mark];
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium', m.cls)}>
      <m.icon className="h-3 w-3" aria-hidden /> {m.label}
    </span>;
}
function Section({
  title,
  children



}: {title: string;children: React.ReactNode;}) {
  return <section className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>;
}
const JOB_TYPES: JobType[] = ['Internship', 'Full-time', 'Part-time', 'Contract', 'Other'];
const WORK_MODES: WorkMode[] = ['On-site', 'Hybrid', 'Remote'];
export function ApplicationFormFields({
  form,
  set,
  marks = {},
  errors = {}





}: {form: AppForm;set: Setter;marks?: Marks;errors?: FormErrors;}) {
  const [skill, setSkill] = useState('');
  const cls = (k: keyof AppForm, extra?: string) => cn(inputCls, extra, marks[k] === 'extracted' && 'border-indigo-300 bg-primary-soft/40 dark:border-indigo-500/50', marks[k] === 'review' && 'border-amber-300 bg-amber-50/60 dark:border-amber-500/50 dark:bg-amber-400/5', marks[k] === 'missing' && 'border-dashed', errors[k] && 'border-rose-400');
  const ph = (k: keyof AppForm, p = '') => marks[k] === 'missing' ? 'Not specified in document' : p;
  const adorn = (k: keyof AppForm) => marks[k] ? <MarkChip mark={marks[k] as FieldMark} /> : undefined;
  const text = (k: keyof AppForm, label: string, opts: {
    placeholder?: string;
    type?: string;
    required?: boolean;
    hint?: string;
  } = {}) => <Field label={label} htmlFor={`f-${k}`} required={opts.required} error={errors[k]} hint={opts.hint} adornment={adorn(k)}>
      <input id={`f-${k}`} type={opts.type ?? 'text'} value={form[k] as string} onChange={(e) => set(k, e.target.value as never)} placeholder={ph(k, opts.placeholder)} aria-invalid={!!errors[k]} className={cls(k)} />
    </Field>;
  const area = (k: keyof AppForm, label: string, rows = 3, placeholder = '') => <Field label={label} htmlFor={`f-${k}`} adornment={adorn(k)} className="sm:col-span-2">
      <textarea id={`f-${k}`} rows={rows} value={form[k] as string} onChange={(e) => set(k, e.target.value as never)} placeholder={ph(k, placeholder)} className={cls(k, 'h-auto py-2.5 leading-relaxed')} />
    </Field>;
  const addSkill = () => {
    const s = skill.trim().replace(/,$/, '');
    if (s && !form.requiredSkills.some((x) => x.toLowerCase() === s.toLowerCase())) set('requiredSkills', [...form.requiredSkills, s]);
    setSkill('');
  };
  return <div className="space-y-7">
      <Section title="Role">
        {text('companyName', 'Company Name', {
        required: true,
        placeholder: 'e.g. Google'
      })}
        {text('jobTitle', 'Job Title', {
        required: true,
        placeholder: 'e.g. Software Engineer'
      })}
        <Field label="Status" htmlFor="f-status" hint="Starts as Saved — change it once you've applied.">
          <select id="f-status" value={form.status} onChange={(e) => {
          const s = e.target.value as Status;
          set('status', s);
          if (!form.dateApplied && !['Saved', 'Withdrawn'].includes(s)) set('dateApplied', todayIso());
        }} className={inputCls}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Job Type" htmlFor="f-jobType" adornment={adorn('jobType')}>
          <select id="f-jobType" value={form.jobType} onChange={(e) => set('jobType', e.target.value as JobType | '')} className={cls('jobType')}>
            <option value="">{marks.jobType === 'missing' ? 'Not specified' : 'Select type'}</option>
            {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Work Mode" htmlFor="f-workMode" adornment={adorn('workMode')}>
          <select id="f-workMode" value={form.workMode} onChange={(e) => set('workMode', e.target.value as WorkMode | '')} className={cls('workMode')}>
            <option value="">{marks.workMode === 'missing' ? 'Not specified' : 'Select mode'}</option>
            {WORK_MODES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        {text('location', 'Location', {
        placeholder: 'City, country or Remote'
      })}
      </Section>

      <Section title="Dates">
        {text('applicationDeadline', 'Application Deadline', {
        type: 'date',
        hint: 'Only the last date to apply — not joining or interview dates.'
      })}
        {text('dateApplied', 'Date Applied', {
        type: 'date'
      })}
        {text('datePosted', 'Date Posted', {
        type: 'date'
      })}
      </Section>

      <Section title="Details">
        {text('salaryOrStipend', 'Salary or Stipend', {
        placeholder: 'e.g. ₹40,000 / month'
      })}
        {text('referenceId', 'Job Reference ID')}
        {text('applicationUrl', 'Application URL', {
        placeholder: 'https://'
      })}
        {text('source', 'Source of Opportunity', {
        placeholder: 'e.g. LinkedIn, referral, campus drive'
      })}
        {text('contact', 'Recruitment Contact', {
        placeholder: 'Name or email'
      })}
      </Section>

      <Section title="Requirements">
        <Field label="Required Skills" htmlFor="f-skills" adornment={adorn('requiredSkills')} className="sm:col-span-2" hint="Press Enter or comma to add a skill.">
          <div className={cn(cls('requiredSkills'), 'flex h-auto min-h-10 flex-wrap items-center gap-1.5 py-1.5')}>
            {form.requiredSkills.map((s) => <span key={s} className="inline-flex items-center gap-1 rounded-md bg-subtle px-2 py-0.5 text-xs font-medium text-ink">
                {s}
                <button type="button" onClick={() => set('requiredSkills', form.requiredSkills.filter((x) => x !== s))} aria-label={`Remove ${s}`} className="text-muted hover:text-ink"><XIcon className="h-3 w-3" /></button>
              </span>)}
            <input id="f-skills" value={skill} onChange={(e) => setSkill(e.target.value)} onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addSkill();
            }
            if (e.key === 'Backspace' && !skill && form.requiredSkills.length) set('requiredSkills', form.requiredSkills.slice(0, -1));
          }} onBlur={addSkill} placeholder={form.requiredSkills.length ? '' : ph('requiredSkills', 'e.g. Python, SQL')} className="min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted/70" />
          </div>
        </Field>
        {area('qualifications', 'Minimum Qualifications', 2)}
        {text('education', 'Education Requirements')}
        {text('experience', 'Experience Requirements')}
      </Section>

      <Section title="Description & notes">
        {area('jobDescription', 'Job Description', 5, 'Paste or summarise the job description')}
        {area('notes', 'Notes', 3, 'Anything you want to remember about this opportunity')}
      </Section>
    </div>;
}