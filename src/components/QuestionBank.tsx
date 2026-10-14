import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronDownIcon, InfoIcon, PlusIcon, SearchIcon, Trash2Icon } from 'lucide-react';
import type { QuestionTopic } from '../types';
import { useStore } from '../contexts/StoreContext';
import { Button, Card, EmptyState, Field } from './ui';
import { cn, inputCls } from '../utils/styles';

const TOPICS: QuestionTopic[] = ['DSA', 'OOP', 'DBMS', 'Operating Systems', 'Computer Networks', 'Projects', 'Behavioral', 'Domain-Specific'];

export function QuestionBank() {
  const { questions, applications, addQuestion, deleteQuestion } = useStore();
  const [q, setQ] = useState('');
  const [topic, setTopic] = useState<QuestionTopic | 'all'>('all');
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [form, setForm] = useState({ topic: 'DSA' as QuestionTopic, question: '', answer: '', applicationId: '' });
  const t = q.trim().toLowerCase();
  const list = questions.filter((x) => (topic === 'all' || x.topic === topic) && (!t || `${x.question} ${x.answer ?? ''}`.toLowerCase().includes(t)));

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">Question Bank</h2>
          <p className="flex items-center gap-1.5 text-xs text-muted"><InfoIcon className="h-3.5 w-3.5" aria-hidden /> Your personal practice list — not verified as asked by any company.</p>
        </div>
        <Button variant="secondary" icon={<PlusIcon className="h-4 w-4" />} onClick={() => setAdding((a) => !a)}>Add Question</Button>
      </div>

      {adding &&
      <form className="mb-5 grid gap-3 rounded-xl border border-line bg-subtle/40 p-4 sm:grid-cols-2" onSubmit={(e) => {e.preventDefault();if (!form.question.trim()) return;addQuestion({ topic: form.topic, question: form.question.trim(), answer: form.answer.trim() || undefined, applicationId: form.applicationId || undefined });setForm({ ...form, question: '', answer: '' });setAdding(false);toast.success('Question added');}}>
          <Field label="Topic" htmlFor="qb-topic"><select id="qb-topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value as QuestionTopic })} className={inputCls}>{TOPICS.map((x) => <option key={x}>{x}</option>)}</select></Field>
          <Field label="Related application" htmlFor="qb-app"><select id="qb-app" value={form.applicationId} onChange={(e) => setForm({ ...form, applicationId: e.target.value })} className={inputCls}><option value="">None</option>{applications.map((a) => <option key={a.applicationId} value={a.applicationId}>{a.companyName} — {a.jobTitle}</option>)}</select></Field>
          <Field label="Question" htmlFor="qb-q" required className="sm:col-span-2"><input id="qb-q" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className={inputCls} /></Field>
          <Field label="Your answer / notes" htmlFor="qb-a" className="sm:col-span-2"><textarea id="qb-a" rows={3} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} className={cn(inputCls, 'h-auto py-2.5')} /></Field>
          <div className="flex justify-end gap-2 sm:col-span-2"><Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button><Button type="submit" disabled={!form.question.trim()}>Save Question</Button></div>
        </form>
      }

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-72">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search questions" aria-label="Search questions" className={cn(inputCls, 'pl-9')} />
        </div>
        <div className="thin-scroll flex gap-2 overflow-x-auto pb-1">
          {(['all', ...TOPICS] as const).map((x) =>
          <button key={x} onClick={() => setTopic(x)} aria-pressed={topic === x} className={cn('whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition', topic === x ? 'border-primary bg-primary text-white' : 'border-line bg-card text-muted hover:text-ink')}>{x === 'all' ? 'All topics' : x}</button>
          )}
        </div>
      </div>

      {!list.length ?
      <EmptyState icon={SearchIcon} title="No questions found" text="Try another topic, or add your own practice question." /> :

      <ul className="divide-y divide-line rounded-xl border border-line">
          {list.map((x) => {
          const app = applications.find((a) => a.applicationId === x.applicationId);
          const isOpen = open === x.id;
          return (
            <li key={x.id}>
                <button onClick={() => setOpen(isOpen ? null : x.id)} aria-expanded={isOpen} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-subtle/60">
                  <span className="mt-0.5 shrink-0 rounded-md bg-subtle px-2 py-0.5 text-[11px] font-medium text-muted">{x.topic}</span>
                  <span className="flex-1 text-sm font-medium text-ink">{x.question}</span>
                  <ChevronDownIcon className={cn('mt-0.5 h-4 w-4 shrink-0 text-muted transition', isOpen && 'rotate-180')} aria-hidden />
                </button>
                {isOpen &&
              <div className="px-4 pb-4 pl-4 sm:pl-[92px]">
                    <p className="whitespace-pre-wrap text-sm text-muted">{x.answer || 'No answer written yet.'}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs">
                      {app && <Link to={`/app/applications/${app.applicationId}`} className="font-medium text-primary hover:underline dark:text-indigo-300">{app.companyName} — {app.jobTitle}</Link>}
                      <button onClick={() => {deleteQuestion(x.id);toast.success('Question removed');}} className="flex items-center gap-1 text-muted hover:text-rose-600"><Trash2Icon className="h-3.5 w-3.5" aria-hidden /> Delete</button>
                    </div>
                  </div>
              }
              </li>);

        })}
        </ul>
      }
    </Card>);

}