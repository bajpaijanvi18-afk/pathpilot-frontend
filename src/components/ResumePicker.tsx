import React, { useRef } from 'react';
import { toast } from 'sonner';
import { CircleCheckIcon, FileTextIcon, PlusIcon } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { cn } from '../utils/styles';
import { fmtDate } from '../utils/format';

const MAX = 5 * 1024 * 1024;

export function ResumePicker({ value, onChange }: {value: string;onChange: (id: string) => void;}) {
  const { resumes, addResume } = useStore();
  const input = useRef<HTMLInputElement>(null);

  const upload = (f?: File) => {
    if (!f) return;
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') return toast.error('Unsupported file', { description: 'Resumes must be PDF or DOCX.' });
    if (f.size > MAX) return toast.error('File too large', { description: 'Resumes must be 5 MB or smaller.' });
    const r = addResume({ displayName: f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '), originalFileName: f.name, category: 'General', fileType: ext === 'pdf' ? 'PDF' : 'DOCX', fileSize: f.size });
    onChange(r.resumeId);
    toast.success('Resume added to your vault', { description: 'Details saved in this browser. Cloud file storage is not connected.' });
  };

  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink">Choose a Resume</legend>
      <p className="mb-3 text-xs text-muted">The application links to the resume in your vault — the file isn't copied.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => onChange('')} aria-pressed={!value} className={cn('flex items-center gap-3 rounded-xl border p-3 text-left text-sm transition', !value ? 'border-primary bg-primary-soft/60' : 'border-line hover:bg-subtle')}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-subtle text-muted">—</span>
          <span className="font-medium text-ink">No resume yet</span>
        </button>
        {resumes.map((r) => {
          const on = value === r.resumeId;
          return (
            <button key={r.resumeId} type="button" onClick={() => onChange(r.resumeId)} aria-pressed={on} className={cn('flex items-center gap-3 rounded-xl border p-3 text-left transition', on ? 'border-primary bg-primary-soft/60' : 'border-line hover:bg-subtle')}>
              <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', r.fileType === 'PDF' ? 'bg-rose-50 text-rose-600 dark:bg-rose-400/15 dark:text-rose-300' : 'bg-sky-50 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300')}>
                <FileTextIcon className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{r.originalFileName}</span>
                <span className="block truncate text-xs text-muted">{r.category} · {r.fileType} · {fmtDate(r.uploadedAt, 'd MMM')}</span>
              </span>
              {on && <CircleCheckIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden />}
            </button>);

        })}
        <button type="button" onClick={() => input.current?.click()} className="flex items-center gap-3 rounded-xl border border-dashed border-line p-3 text-left text-sm font-medium text-primary transition hover:bg-subtle dark:text-indigo-300">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft"><PlusIcon className="h-4 w-4" aria-hidden /></span>
          Upload New Resume
        </button>
        <input ref={input} type="file" accept=".pdf,.docx" className="sr-only" onChange={(e) => {upload(e.target.files?.[0]);e.target.value = '';}} aria-label="Upload new resume" />
      </div>
    </fieldset>);

}