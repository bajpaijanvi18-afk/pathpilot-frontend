import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BriefcaseIcon, CalendarDaysIcon, FileTextIcon, SearchIcon, StickyNoteIcon } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { cn } from '../utils/styles';
import { fmtDate } from '../utils/format';

type Group = 'Applications' | 'Resumes' | 'Events' | 'Notes';
interface Result {group: Group;title: string;sub: string;to: string;}
const GROUP_ICONS: Record<Group, React.ElementType> = { Applications: BriefcaseIcon, Resumes: FileTextIcon, Events: CalendarDaysIcon, Notes: StickyNoteIcon };

export function GlobalSearch() {
  const { applications, resumes, events, prepPlans } = useStore();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const nav = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        input.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  const results = useMemo<Result[]>(() => {
    const t = q.trim().toLowerCase();
    if (t.length < 2) return [];
    const has = (...v: (string | undefined)[]) => v.some((x) => x?.toLowerCase().includes(t));
    const appName = (id?: string) => applications.find((a) => a.applicationId === id);
    const r: Result[] = [];
    applications.filter((a) => has(a.companyName, a.jobTitle, a.jobDescription, a.location)).slice(0, 5).
    forEach((a) => r.push({ group: 'Applications', title: `${a.companyName} — ${a.jobTitle}`, sub: a.status, to: `/app/applications/${a.applicationId}` }));
    resumes.filter((x) => has(x.displayName, x.originalFileName, x.category)).slice(0, 3).
    forEach((x) => r.push({ group: 'Resumes', title: x.displayName, sub: x.originalFileName, to: '/app/resumes' }));
    events.filter((e) => has(e.title, appName(e.applicationId)?.companyName)).slice(0, 4).
    forEach((e) => r.push({ group: 'Events', title: `${appName(e.applicationId)?.companyName ?? 'Personal'} · ${e.title}`, sub: fmtDate(e.date), to: e.applicationId ? `/app/applications/${e.applicationId}` : '/app/calendar' }));
    applications.filter((a) => has(a.notes)).slice(0, 3).
    forEach((a) => r.push({ group: 'Notes', title: `${a.companyName} notes`, sub: a.notes?.slice(0, 60) ?? '', to: `/app/applications/${a.applicationId}?tab=notes` }));
    prepPlans.filter((p) => has(p.notes, ...p.topics)).slice(0, 3).
    forEach((p) => r.push({ group: 'Notes', title: `${appName(p.applicationId)?.companyName ?? 'Prep'} · ${p.roundType}`, sub: p.notes.slice(0, 60) || p.topics.join(', '), to: `/app/prep?plan=${p.preparationId}` }));
    return r;
  }, [q, applications, resumes, events, prepPlans]);

  const go = (r: Result) => {
    nav(r.to);
    setOpen(false);
    setQ('');
    input.current?.blur();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') setActive((a) => Math.min(a + 1, results.length - 1)), e.preventDefault();
    if (e.key === 'ArrowUp') setActive((a) => Math.max(a - 1, 0)), e.preventDefault();
    if (e.key === 'Enter' && results[active]) go(results[active]);
    if (e.key === 'Escape') setOpen(false), input.current?.blur();
  };

  const groups = [...new Set(results.map((r) => r.group))];
  return (
    <div ref={wrap} className="relative min-w-0 flex-1 sm:max-w-md">
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
      <input
        ref={input}
        value={q}
        onChange={(e) => {setQ(e.target.value);setOpen(true);setActive(0);}}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search companies, roles..."
        aria-label="Global search"
        role="combobox"
        aria-expanded={open && q.length > 1}
        aria-controls="global-search-results"
        className="h-10 w-full rounded-lg border border-line bg-card pl-9 pr-12 text-sm text-ink placeholder:text-muted/80 transition focus:border-primary-2 focus:outline-none focus:ring-2 focus:ring-[#A5B4FC]" />
      
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-line bg-subtle px-1.5 py-0.5 text-[10px] font-medium text-muted sm:block">⌘K</kbd>
      {open && q.trim().length > 1 &&
      <div id="global-search-results" role="listbox" className="fixed left-4 right-4 top-16 z-50 max-h-[70vh] overflow-y-auto rounded-xl border border-line bg-card p-2 shadow-pop sm:absolute sm:left-0 sm:right-0 sm:top-full sm:mt-2">
          {results.length === 0 ?
        <p className="px-3 py-6 text-center text-sm text-muted">No matches for “{q}”. Try a company, role or resume name.</p> :

        groups.map((g) => {
          const Icon = GROUP_ICONS[g];
          return (
            <div key={g} className="mb-1">
                  <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">{g}</p>
                  {results.map((r, i) =>
              r.group !== g ? null :
              <button key={`${r.to}-${i}`} role="option" aria-selected={i === active} onMouseEnter={() => setActive(i)} onClick={() => go(r)} className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left', i === active ? 'bg-subtle' : '')}>
                        <Icon className="h-4 w-4 shrink-0 text-muted" aria-hidden />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-ink">{r.title}</span>
                          <span className="block truncate text-xs text-muted">{r.sub}</span>
                        </span>
                      </button>

              )}
                </div>);

        })
        }
        </div>
      }
    </div>);

}