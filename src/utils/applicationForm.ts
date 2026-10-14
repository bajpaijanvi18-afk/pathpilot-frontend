import type { Application, JobType, Status, WorkMode } from '../types';

export interface AppForm {
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  applicationUrl: string;
  jobType: JobType | '';
  workMode: WorkMode | '';
  location: string;
  applicationDeadline: string;
  dateApplied: string;
  datePosted: string;
  salaryOrStipend: string;
  requiredSkills: string[];
  qualifications: string;
  education: string;
  experience: string;
  referenceId: string;
  contact: string;
  source: string;
  notes: string;
  status: Status;
  resumeId: string;
}

export type FieldMark = 'extracted' | 'missing' | 'review';
export type Marks = Partial<Record<keyof AppForm, FieldMark>>;
export type FormErrors = Partial<Record<keyof AppForm, string>>;

export const emptyForm = (): AppForm => ({
  companyName: '', jobTitle: '', jobDescription: '', applicationUrl: '', jobType: '', workMode: '', location: '',
  applicationDeadline: '', dateApplied: '', datePosted: '', salaryOrStipend: '', requiredSkills: [], qualifications: '',
  education: '', experience: '', referenceId: '', contact: '', source: '', notes: '', status: 'Saved', resumeId: ''
});

export function formFromApp(a: Application): AppForm {
  const f = emptyForm();
  (Object.keys(f) as (keyof AppForm)[]).forEach((k) => {
    const v = a[k as keyof Application];
    if (v !== undefined && v !== null) (f as unknown as Record<string, unknown>)[k] = v;
  });
  return f;
}

const opt = (s: string) => s.trim() ? s.trim() : undefined;

export function appFromForm(f: AppForm) {
  return {
    companyName: f.companyName.trim(),
    jobTitle: f.jobTitle.trim(),
    jobDescription: opt(f.jobDescription),
    applicationUrl: opt(f.applicationUrl),
    jobType: f.jobType || undefined,
    workMode: f.workMode || undefined,
    location: opt(f.location),
    status: f.status,
    applicationDeadline: opt(f.applicationDeadline),
    dateApplied: opt(f.dateApplied),
    datePosted: opt(f.datePosted),
    salaryOrStipend: opt(f.salaryOrStipend),
    requiredSkills: f.requiredSkills,
    qualifications: opt(f.qualifications),
    education: opt(f.education),
    experience: opt(f.experience),
    referenceId: opt(f.referenceId),
    contact: opt(f.contact),
    source: opt(f.source),
    notes: opt(f.notes),
    resumeId: f.resumeId || undefined
  };
}