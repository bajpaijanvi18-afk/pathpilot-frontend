import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeftIcon, CalendarSearchIcon, CircleAlertIcon, ClipboardPasteIcon, FileSearchIcon, LayersIcon, PencilLineIcon, RotateCcwIcon, SparklesIcon, TriangleAlertIcon, UploadIcon } from 'lucide-react';
import type { SourceDocument } from '../types';
import { useStore } from '../contexts/StoreContext';
import { Button, Modal, Tabs } from './ui';
import { FileDropzone } from './FileDropzone';
import { ResumePicker } from './ResumePicker';
import { ApplicationFormFields, MarkChip } from './ApplicationFormFields';
import { AppForm, FormErrors, Marks, appFromForm, emptyForm, formFromApp } from '../utils/applicationForm';
import { DetectedDate, ExtractKey, Extraction, SAMPLE_POSTING, extractAll } from '../utils/extract';
import { cn } from '../utils/styles';
import { delay, fmtDate, nowIso } from '../utils/format';

type Step = 'choose' | 'upload' | 'processing' | 'failed' | 'select' | 'form';
type Failure = 'unavailable' | 'empty' | 'read';

/** Configurable upload limits — should mirror the backend validation policy. */
const ACCEPT = ['pdf', 'docx', 'txt'];
const MAX_BYTES = 5 * 1024 * 1024;
const EXTRACT_KEYS: ExtractKey[] = ['companyName', 'jobTitle', 'jobType', 'workMode', 'location', 'applicationDeadline', 'datePosted', 'salaryOrStipend', 'qualifications', 'education', 'experience', 'referenceId', 'applicationUrl', 'contact', 'source', 'jobDescription'];

const FAILURES: Record<Failure, {title: string;text: string;}> = {
  unavailable: { title: "PDF and DOCX processing isn't connected", text: "Reading PDF and DOCX files needs the PathPilot processing service, which isn't connected in this prototype. Your file hasn't been uploaded anywhere. Paste the text instead, or enter the details manually." },
  empty: { title: 'Not enough text to analyze', text: "We couldn't find enough readable text. Paste the full job description or enter the details manually." },
  read: { title: "Couldn't read this file", text: 'The file may be damaged or use an unsupported encoding. Try again, paste the text, or enter details manually.' }
};

export function AddApplicationModal() {
  const store = useStore();
  const { addModal, closeAdd, applications } = store;
  const nav = useNavigate();
  const editing = addModal.editId ? applications.find((a) => a.applicationId === addModal.editId) : undefined;

  const [step, setStep] = useState<Step>('choose');
  const [mode, setMode] = useState<'file' | 'text'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [text, setText] = useState('');
  const [failure, setFailure] = useState<Failure>('empty');
  const [results, setResults] = useState<Extraction[]>([]);
  const [picked, setPicked] = useState(0);
  const [form, setForm] = useState<AppForm>(emptyForm);
  const [marks, setMarks] = useState<Marks>({});
  const [dates, setDates] = useState<DetectedDate[]>([]);
  const [origin, setOrigin] = useState<'manual' | 'extracted'>('manual');
  const [sourceDoc, setSourceDoc] = useState<SourceDocument>();
  const [reviewed, setReviewed] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState<false | 'draft' | 'save'>(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!addModal.open) return;
    setFile(null);setFileError('');setText('');setResults([]);setMarks({});setDates([]);setErrors({});setSaveError('');setReviewed(false);setSourceDoc(undefined);setMode('file');
    if (editing) {
      setForm(formFromApp(editing));
      setOrigin(editing.needsReview ? 'extracted' : 'manual');
      setStep('form');
    } else {
      setForm({ ...emptyForm(), resumeId: addModal.resumeId ?? '' });
      setOrigin('manual');
      setStep('choose');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addModal.open, addModal.editId]);

  const set = useCallback(<K extends keyof AppForm,>(k: K, v: AppForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setMarks((m) => {if (!m[k]) return m;const n = { ...m };delete n[k];return n;});
    setErrors((e) => e[k] ? { ...e, [k]: undefined } : e);
  }, []);

  const applyExtraction = (ex: Extraction) => {
    const f = { ...emptyForm(), resumeId: addModal.resumeId ?? '' };
    const m: Marks = {};
    EXTRACT_KEYS.forEach((k) => {
      const v = ex.values[k];
      if (v) {
        (f as unknown as Record<string, string>)[k] = v;
        m[k] = k === 'applicationDeadline' || k === 'datePosted' ? 'review' : 'extracted';
      } else m[k] = 'missing';
    });
    f.requiredSkills = ex.skills;
    m.requiredSkills = ex.skills.length ? 'extracted' : 'missing';
    setForm(f);setMarks(m);setDates(ex.dates);setOrigin('extracted');setReviewed(false);setStep('form');
  };

  const analyze = async () => {
    setStep('processing');
    try {
      let content = text;
      if (mode === 'file') {
        if (!file) throw new Error('no file');
        if (file.name.split('.').pop()?.toLowerCase() !== 'txt') {
          await delay(900);
          setFailure('unavailable');setStep('failed');
          return;
        }
        content = await file.text();
      }
      await delay(1200);
      if (content.trim().length < 40) {setFailure('empty');setStep('failed');return;}
      const res = extractAll(content);
      setResults(res);
      setSourceDoc({ name: mode === 'file' && file ? file.name : 'Pasted job description', kind: mode === 'file' ? 'file' : 'text', addedAt: nowIso() });
      if (res.length > 1) {setPicked(0);setStep('select');} else applyExtraction(res[0]);
    } catch {
      setFailure('read');setStep('failed');
    }
  };

  const save = async (draft: boolean) => {
    const errs: FormErrors = {};
    if (!form.companyName.trim()) errs.companyName = 'Company name is required';
    if (!form.jobTitle.trim()) errs.jobTitle = 'Job title is required';
    if (form.applicationUrl && !/^https?:\/\//i.test(form.applicationUrl)) errs.applicationUrl = 'Enter a full URL starting with https://';
    if (form.applicationDeadline && form.datePosted && form.applicationDeadline < form.datePosted) errs.applicationDeadline = 'This is before the posting date — please verify';
    setErrors(errs);
    if (Object.keys(errs).length) return setSaveError('Fix the highlighted fields to continue.');
    if (!draft && origin === 'extracted' && !reviewed) return setSaveError("Confirm you've reviewed the extracted details, or save as a draft.");
    setSaveError('');
    setSaving(draft ? 'draft' : 'save');
    try {
      await delay(500);
      const app = store.saveApplication({ ...appFromForm(form), isDraft: draft, needsReview: origin === 'extracted' && !reviewed, sourceDocument: editing?.sourceDocument ?? sourceDoc }, editing?.applicationId);
      toast.success(draft ? 'Draft saved' : editing ? 'Application updated' : 'Application saved', {
        description: `${app.companyName} — ${app.jobTitle}. Saved in this browser (demo).`,
        action: { label: 'View', onClick: () => nav(`/app/applications/${app.applicationId}`) }
      });
      closeAdd();
    } catch {
      setSaveError("Couldn't save right now. Your entries are kept — please try again.");
    } finally {
      setSaving(false);
    }
  };

  const titles: Record<Step, [string, string]> = {
    choose: ['Add Application', 'How would you like to add this opportunity?'],
    upload: ['Upload Job Description', 'We’ll pull out the key details for you to review.'],
    processing: ['Analyzing', 'Hang tight — this only takes a moment.'],
    failed: ['Processing problem', 'Nothing has been saved yet.'],
    select: ['Choose an opportunity', 'This document contains more than one role.'],
    form: editing ? ['Edit Application', `${editing.companyName} — ${editing.jobTitle}`] : origin === 'extracted' ? ['Review Extracted Details', 'Check every highlighted field before saving.'] : ['Enter Details Manually', 'Only company and job title are required.']
  };

  const back = (to: Step) => <Button variant="ghost" onClick={() => setStep(to)} icon={<ArrowLeftIcon className="h-4 w-4" />} className="mr-auto">Back</Button>;

  const footer: Partial<Record<Step, React.ReactNode>> = {
    upload: <>{back('choose')}<Button variant="secondary" onClick={closeAdd}>Cancel</Button><Button onClick={analyze} disabled={mode === 'file' ? !file : text.trim().length === 0} icon={<SparklesIcon className="h-4 w-4" />}>Analyze Document</Button></>,
    failed: <>{back('upload')}<Button variant="secondary" onClick={() => {setOrigin('manual');setStep('form');}}>Enter Manually</Button><Button onClick={failure === 'unavailable' ? () => {setMode('text');setStep('upload');} : analyze} icon={failure === 'unavailable' ? <ClipboardPasteIcon className="h-4 w-4" /> : <RotateCcwIcon className="h-4 w-4" />}>{failure === 'unavailable' ? 'Paste Text Instead' : 'Retry Processing'}</Button></>,
    select: <>{back('upload')}<Button onClick={() => applyExtraction(results[picked])}>Continue with Selected</Button></>,
    form:
    <>
        {!editing && back(origin === 'extracted' ? results.length > 1 ? 'select' : 'upload' : 'choose')}
        <Button variant="secondary" onClick={closeAdd} disabled={!!saving}>Cancel</Button>
        <Button variant="secondary" onClick={() => save(true)} loading={saving === 'draft'} disabled={saving === 'save'}>Save as Draft</Button>
        <Button onClick={() => save(false)} loading={saving === 'save'} disabled={saving === 'draft'}>{editing ? 'Save Changes' : 'Save Application'}</Button>
      </>

  };

  return (
    <Modal open={addModal.open} onClose={closeAdd} title={titles[step][0]} description={titles[step][1]} size="lg" footer={footer[step]}>
      {step === 'choose' &&
      <div className="grid gap-3 sm:grid-cols-2">
          {[
        { k: 'upload' as const, icon: UploadIcon, title: 'Upload Job Description', text: 'Add a PDF, DOCX or TXT file, or paste text. Key details are pulled out for you to review and correct.', badge: 'Recommended' },
        { k: 'form' as const, icon: PencilLineIcon, title: 'Enter Details Manually', text: 'Type in the company, role and any details you have. Only two fields are required.' }].
        map((o) =>
        <button key={o.k} data-autofocus={o.k === 'upload' ? true : undefined} onClick={() => {setOrigin('manual');setStep(o.k);}} className="group relative rounded-2xl border border-line p-5 text-left transition hover:-translate-y-0.5 hover:border-primary-2 hover:shadow-card">
              {o.badge && <span className="absolute right-4 top-4 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary dark:text-indigo-300">{o.badge}</span>}
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary transition group-hover:bg-primary group-hover:text-white dark:text-indigo-300"><o.icon className="h-5 w-5" aria-hidden /></span>
              <span className="block text-sm font-semibold text-ink">{o.title}</span>
              <span className="mt-1 block text-sm text-muted">{o.text}</span>
            </button>
        )}
        </div>
      }

      {step === 'upload' &&
      <div className="space-y-4">
          <Tabs tabs={[{ id: 'file', label: 'Upload file' }, { id: 'text', label: 'Paste text' }]} value={mode} onChange={setMode} />
          {mode === 'file' ?
        <FileDropzone accept={ACCEPT} maxBytes={MAX_BYTES} file={file} onFile={setFile} error={fileError} onError={setFileError} label="Drag and drop a job description" /> :

        <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="jd-text" className="text-sm font-medium text-ink">Job description text</label>
                <button onClick={() => setText(SAMPLE_POSTING)} className="text-xs font-medium text-primary hover:underline dark:text-indigo-300">Use a sample posting</button>
              </div>
              <textarea id="jd-text" rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the full job description or recruitment announcement…" className="w-full rounded-lg border border-line bg-card px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-muted/70 focus:border-primary-2 focus:outline-none focus:ring-2 focus:ring-[#A5B4FC]" />
              <p className="mt-1 text-right text-xs text-muted">{text.length.toLocaleString()} characters</p>
            </div>
        }
          <p className="flex gap-2 rounded-xl bg-subtle/70 p-3 text-xs leading-relaxed text-muted">
            <CircleAlertIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            Demo mode: pasted text and TXT files are analyzed on this device by a basic extractor. PDF/DOCX extraction needs the cloud processing service, which isn't connected yet. AI-assisted extraction can make mistakes — you'll review everything before saving.
          </p>
        </div>
      }

      {step === 'processing' &&
      <div className="flex flex-col items-center py-12 text-center" role="status" aria-live="polite">
          <span className="relative mb-5 flex h-16 w-16 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-2xl bg-primary/20" />
            <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white"><FileSearchIcon className="h-7 w-7" aria-hidden /></span>
          </span>
          <p className="text-base font-semibold text-ink">Analyzing your job description...</p>
          <p className="mt-1 max-w-sm text-sm text-muted">Reading the text, identifying job fields and separating deadlines from other dates.</p>
        </div>
      }

      {step === 'failed' &&
      <div className="flex flex-col items-center py-10 text-center" role="alert">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-400/15 dark:text-rose-300"><TriangleAlertIcon className="h-6 w-6" aria-hidden /></span>
          <p className="text-base font-semibold text-ink">{FAILURES[failure].title}</p>
          <p className="mt-1 max-w-md text-sm text-muted">{FAILURES[failure].text}</p>
        </div>
      }

      {step === 'select' &&
      <div className="space-y-3">
          <p className="flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
            <LayersIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            We found {results.length} possible opportunities. Pick the one you want to track — you can process the document again for the others.
          </p>
          <div role="radiogroup" className="space-y-2">
            {results.map((r, i) =>
          <button key={i} role="radio" aria-checked={picked === i} onClick={() => setPicked(i)} className={cn('w-full rounded-xl border p-4 text-left transition', picked === i ? 'border-primary bg-primary-soft/60' : 'border-line hover:bg-subtle')}>
                <span className="flex items-center gap-2">
                  <span className={cn('flex h-4 w-4 items-center justify-center rounded-full border-2', picked === i ? 'border-primary' : 'border-line')}>{picked === i && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}</span>
                  <span className="text-sm font-semibold text-ink">{r.label}</span>
                </span>
                <span className="mt-1.5 block pl-6 text-xs text-muted">
                  {[r.values.jobType, r.values.location, r.values.applicationDeadline ? `Apply by ${fmtDate(r.values.applicationDeadline)}` : 'No deadline found', `${r.skills.length} skills`].filter(Boolean).join(' · ')}
                </span>
              </button>
          )}
          </div>
        </div>
      }

      {step === 'form' &&
      <div className="space-y-7">
          {origin === 'extracted' &&
        <div className="space-y-3">
              <div className="rounded-xl border border-indigo-200 bg-primary-soft/50 p-4 dark:border-indigo-500/30">
                <p className="flex items-center gap-2 text-sm font-semibold text-ink"><SparklesIcon className="h-4 w-4 text-primary dark:text-indigo-300" aria-hidden /> Review before saving</p>
                <p className="mt-1 text-sm text-muted">
                  Extracted from <span className="font-medium text-ink">{editing?.sourceDocument?.name ?? sourceDoc?.name}</span>. Extraction is assistance, not a guarantee — correct anything that looks wrong.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
                  <MarkChip mark="extracted" /> <MarkChip mark="review" /> <MarkChip mark="missing" />
                </div>
              </div>
              {(!form.companyName || !form.jobTitle) &&
          <p className="flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
                  <TriangleAlertIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Partial extraction — company or job title wasn't found. Please fill them in.
                </p>
          }
              {dates.length > 0 &&
          <div className="rounded-xl border border-line p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink"><CalendarSearchIcon className="h-4 w-4 text-muted" aria-hidden /> Dates found in the document</p>
                  <ul className="space-y-2">
                    {dates.map((dt, i) =>
              <li key={i} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span className="min-w-0">
                          <span className="font-medium text-ink">{dt.iso ? fmtDate(dt.iso) : dt.raw}</span>
                          <span className="ml-2 rounded-full bg-subtle px-2 py-0.5 text-[11px] font-medium text-muted">{dt.kind}</span>
                          <span className="block truncate text-xs text-muted">“{dt.line}”</span>
                        </span>
                        {dt.iso && form.applicationDeadline !== dt.iso &&
                <button onClick={() => set('applicationDeadline', dt.iso as string)} className="text-xs font-medium text-primary hover:underline dark:text-indigo-300">Use as deadline</button>
                }
                      </li>
              )}
                  </ul>
                </div>
          }
            </div>
        }
          <ApplicationFormFields form={form} set={set} marks={marks} errors={errors} />
          <div className="border-t border-line pt-6">
            <ResumePicker value={form.resumeId} onChange={(id) => set('resumeId', id)} />
          </div>
          {origin === 'extracted' &&
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4">
              <input type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-line accent-[#4F46E5]" />
              <span className="text-sm">
                <span className="font-medium text-ink">I've reviewed these details and they're correct</span>
                <span className="block text-muted">Unreviewed extractions can only be saved as drafts.</span>
              </span>
            </label>
        }
          {saveError &&
        <p className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-400/10 dark:text-rose-300" role="alert">
              <CircleAlertIcon className="h-4 w-4 shrink-0" aria-hidden /> {saveError}
            </p>
        }
        </div>
      }
    </Modal>);

}