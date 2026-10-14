import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ExternalLinkIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react';
import type { PrepPlan, RoundType } from '../types';
import { useStore } from '../contexts/StoreContext';
import { Button, Card, CompanyLogo, ConfirmDialog } from './ui';
import { ROUND_TYPES } from './NewPrepPlanModal';
import { cn, inputCls } from '../utils/styles';
import { timeAgo, uid } from '../utils/format';

export function PrepWorkspace({ plan }: {plan: PrepPlan;}) {
  const { savePrep, deletePrep, applications } = useStore();
  const app = applications.find((a) => a.applicationId === plan.applicationId);
  const [notes, setNotes] = useState(plan.notes);
  const [topic, setTopic] = useState('');
  const [task, setTask] = useState('');
  const [res, setRes] = useState('');
  const [resErr, setResErr] = useState('');
  const [confirm, setConfirm] = useState(false);
  useEffect(() => setNotes(plan.notes), [plan.preparationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (p: Partial<PrepPlan>) => savePrep({ ...plan, ...p });
  const done = plan.checklist.filter((c) => c.done).length;
  const pct = plan.checklist.length ? Math.round(done / plan.checklist.length * 100) : 0;

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {app && <CompanyLogo name={app.companyName} size="lg" />}
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-ink">{app ? `${app.companyName} — ${app.jobTitle}` : 'Unlinked plan'}</h2>
          {app && <Link to={`/app/applications/${app.applicationId}`} className="text-sm font-medium text-primary hover:underline dark:text-indigo-300">View application</Link>}
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <select value={plan.roundType} onChange={(e) => update({ roundType: e.target.value as RoundType })} aria-label="Interview round" className={inputCls}>
              {ROUND_TYPES.map((r) => <option key={r}>{r}</option>)}
            </select>
            <input type="date" value={plan.interviewDate ?? ''} onChange={(e) => update({ interviewDate: e.target.value || undefined })} aria-label="Interview date" className={inputCls} />
          </div>
        </div>
        <Button variant="ghost" size="icon" aria-label="Delete plan" onClick={() => setConfirm(true)}><Trash2Icon className="h-4 w-4" /></Button>
      </div>

      <div className="mt-6">
        <div className="mb-1.5 flex justify-between text-xs"><span className="font-medium text-ink">Preparation progress</span><span className="text-muted">{done}/{plan.checklist.length} · {pct}%</span></div>
        <div className="h-2 overflow-hidden rounded-full bg-subtle" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} /></div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section>
          <h3 className="mb-2 text-sm font-semibold text-ink">Preparation checklist</h3>
          <ul className="space-y-1">
            {plan.checklist.map((c) =>
            <li key={c.id} className="group flex items-center gap-2 rounded-lg px-1 hover:bg-subtle">
                <input type="checkbox" checked={c.done} onChange={() => update({ checklist: plan.checklist.map((x) => x.id === c.id ? { ...x, done: !x.done } : x) })} aria-label={`Mark “${c.text}” as ${c.done ? 'not done' : 'done'}`} className="h-4 w-4 shrink-0 rounded accent-[#4F46E5]" />
                <input defaultValue={c.text} onBlur={(e) => e.target.value.trim() && e.target.value !== c.text && update({ checklist: plan.checklist.map((x) => x.id === c.id ? { ...x, text: e.target.value.trim() } : x) })} aria-label="Task text" className={cn('h-9 flex-1 rounded-md bg-transparent px-1 text-sm outline-none focus:bg-card focus:ring-2 focus:ring-[#A5B4FC]', c.done && 'text-muted line-through')} />
                <button onClick={() => update({ checklist: plan.checklist.filter((x) => x.id !== c.id) })} aria-label={`Remove ${c.text}`} className="text-muted opacity-0 transition hover:text-rose-600 focus:opacity-100 group-hover:opacity-100"><XIcon className="h-4 w-4" /></button>
              </li>
            )}
          </ul>
          <form className="mt-2 flex gap-2" onSubmit={(e) => {e.preventDefault();if (!task.trim()) return;update({ checklist: [...plan.checklist, { id: uid('c'), text: task.trim(), done: false }] });setTask('');}}>
            <input value={task} onChange={(e) => setTask(e.target.value)} placeholder="Add a task" aria-label="New task" className={inputCls} />
            <Button type="submit" variant="secondary" size="icon" aria-label="Add task" disabled={!task.trim()}><PlusIcon className="h-4 w-4" /></Button>
          </form>
        </section>

        <div className="space-y-6">
          <section>
            <h3 className="mb-2 text-sm font-semibold text-ink">Topics to prepare</h3>
            <div className="flex flex-wrap gap-2">
              {plan.topics.map((t) =>
              <span key={t} className="inline-flex items-center gap-1 rounded-lg bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary dark:text-indigo-300">
                  {t}<button onClick={() => update({ topics: plan.topics.filter((x) => x !== t) })} aria-label={`Remove ${t}`}><XIcon className="h-3 w-3" /></button>
                </span>
              )}
              {!plan.topics.length && <span className="text-sm text-muted">No topics yet.</span>}
            </div>
            <form className="mt-2 flex gap-2" onSubmit={(e) => {e.preventDefault();const v = topic.trim();if (v && !plan.topics.includes(v)) update({ topics: [...plan.topics, v] });setTopic('');}}>
              <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Dynamic programming" aria-label="New topic" className={inputCls} />
              <Button type="submit" variant="secondary" size="icon" aria-label="Add topic" disabled={!topic.trim()}><PlusIcon className="h-4 w-4" /></Button>
            </form>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-ink">Useful resources</h3>
            <ul className="space-y-1.5">
              {plan.resources.map((r) =>
              <li key={r} className="flex items-center gap-2 text-sm">
                  <a href={r} target="_blank" rel="noreferrer noopener" className="flex min-w-0 flex-1 items-center gap-1.5 truncate font-medium text-primary hover:underline dark:text-indigo-300"><ExternalLinkIcon className="h-3.5 w-3.5 shrink-0" aria-hidden /><span className="truncate">{r.replace(/^https?:\/\//, '')}</span></a>
                  <button onClick={() => update({ resources: plan.resources.filter((x) => x !== r) })} aria-label="Remove link" className="text-muted hover:text-rose-600"><XIcon className="h-4 w-4" /></button>
                </li>
              )}
            </ul>
            <form className="mt-2 flex gap-2" onSubmit={(e) => {e.preventDefault();if (!/^https?:\/\/\S+\.\S+/.test(res.trim())) return setResErr('Enter a valid link starting with https://');update({ resources: [...plan.resources, res.trim()] });setRes('');setResErr('');}}>
              <input value={res} onChange={(e) => {setRes(e.target.value);setResErr('');}} placeholder="https://" aria-label="Resource link" aria-invalid={!!resErr} className={inputCls} />
              <Button type="submit" variant="secondary" size="icon" aria-label="Add link" disabled={!res.trim()}><PlusIcon className="h-4 w-4" /></Button>
            </form>
            {resErr && <p className="mt-1 text-xs text-rose-600" role="alert">{resErr}</p>}
          </section>
        </div>
      </div>

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="prep-notes" className="text-sm font-semibold text-ink">Personal notes</label>
          <span className="text-xs text-muted">Updated {timeAgo(plan.updatedAt)}</span>
        </div>
        <textarea id="prep-notes" rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Questions & answers, things to mention, observations…" className={cn(inputCls, 'h-auto py-3 leading-relaxed')} />
        <div className="mt-2 flex justify-end">
          <Button disabled={notes === plan.notes} onClick={() => {update({ notes });toast.success('Notes saved');}}>Save Notes</Button>
        </div>
      </section>

      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} title="Delete preparation plan?" message="The checklist, topics, notes and links in this plan will be removed. The application is not affected." onConfirm={() => {deletePrep(plan.preparationId);toast.success('Plan deleted');}} />
    </Card>);

}