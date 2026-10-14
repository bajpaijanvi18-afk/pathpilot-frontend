import type { JobType, WorkMode } from '../types';

/**
 * Lightweight on-device extractor used in the prototype. It only reads labelled lines,
 * dates, URLs and known skills from plain text — it never invents values.
 * In production this is replaced by the backend document-processing job.
 */
export type ExtractKey =
'companyName' |
'jobTitle' |
'jobType' |
'workMode' |
'location' |
'applicationDeadline' |
'datePosted' |
'salaryOrStipend' |
'qualifications' |
'education' |
'experience' |
'referenceId' |
'applicationUrl' |
'contact' |
'source' |
'jobDescription';

export type DateKind =
'Application deadline' |
'Posting date' |
'Joining date' |
'Interview / assessment' |
'Document submission' |
'Other date';

export interface DetectedDate {
  kind: DateKind;
  iso?: string;
  raw: string;
  line: string;
}

export interface Extraction {
  label: string;
  values: Partial<Record<ExtractKey, string>>;
  skills: string[];
  dates: DetectedDate[];
}

const LABELS: [ExtractKey | 'skillsLine' | 'jobTypeRaw' | 'workModeRaw', RegExp][] = [
['companyName', /^\s*(?:company(?: name)?|organi[sz]ation|employer)\s*[:\-–]\s*(.+)$/im],
['jobTitle', /^\s*(?:job title|position|role|designation)\s*[:\-–]\s*(.+)$/im],
['jobTypeRaw', /^\s*(?:job type|employment type)\s*[:\-–]\s*(.+)$/im],
['workModeRaw', /^\s*(?:work mode|work model|workplace|work type)\s*[:\-–]\s*(.+)$/im],
['location', /^\s*(?:job location|location|based in)\s*[:\-–]\s*(.+)$/im],
['salaryOrStipend', /^\s*(?:salary|stipend|ctc|compensation|pay)\s*[:\-–]\s*(.+)$/im],
['referenceId', /^\s*(?:job id|job reference|reference id|req(?:uisition)? id|ref(?:erence)?(?: no\.?)?)\s*[:#\-–]\s*(.+)$/im],
['contact', /^\s*(?:recruitment contact|hr contact|recruiter|contact)\s*[:\-–]\s*(.+)$/im],
['qualifications', /^\s*(?:minimum qualifications?|qualifications?|eligibility)\s*[:\-–]\s*(.+)$/im],
['education', /^\s*(?:education|degree)\s*[:\-–]\s*(.+)$/im],
['experience', /^\s*(?:experience)\s*[:\-–]\s*(.+)$/im],
['source', /^\s*(?:source|found via|referred by)\s*[:\-–]\s*(.+)$/im],
['skillsLine', /^\s*(?:skills|required skills|key skills|tech stack)\s*[:\-–]\s*(.+)$/im]];


const KNOWN_SKILLS = [
'Python', 'Java', 'JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'C++', 'AWS', 'Docker', 'Kubernetes',
'Git', 'Linux', 'Machine Learning', 'Deep Learning', 'Data Structures', 'Algorithms', 'Excel', 'Power BI',
'Tableau', 'Statistics', 'DBMS', 'OOP', 'Spring', 'HTML', 'CSS', 'Figma', 'REST', 'Communication', 'AutoCAD'];


const MONTHS = 'jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?';
const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const DATE_RE = new RegExp(
  `\\d{1,2}(?:st|nd|rd|th)?\\s+(?:${MONTHS})\\.?,?\\s+\\d{4}|(?:${MONTHS})\\.?\\s+\\d{1,2}(?:st|nd|rd|th)?,?\\s+\\d{4}|\\d{4}-\\d{2}-\\d{2}|\\d{1,2}[/.-]\\d{1,2}[/.-]\\d{4}`,
  'gi'
);

const pad = (s: string) => s.padStart(2, '0');

function toIso(raw: string): string | undefined {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const num = raw.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (num) return `${num[3]}-${pad(num[2])}-${pad(num[1])}`;
  const cleaned = raw.replace(/(\d)(st|nd|rd|th)/i, '$1');
  const day = cleaned.match(/\b(\d{1,2})\b/)?.[1];
  const year = cleaned.match(/\b(\d{4})\b/)?.[1];
  const mon = cleaned.match(new RegExp(MONTHS, 'i'))?.[0];
  if (!day || !year || !mon) return undefined;
  const idx = MONTH_KEYS.indexOf(mon.slice(0, 3).toLowerCase());
  return idx < 0 ? undefined : `${year}-${pad(String(idx + 1))}-${pad(day)}`;
}

function classify(line: string): DateKind {
  const l = line.toLowerCase();
  if (/deadline|apply by|last date|closes|closing|apply before/.test(l)) return 'Application deadline';
  if (/posted|published|date of posting/.test(l)) return 'Posting date';
  if (/join/.test(l)) return 'Joining date';
  if (/interview|assessment|test|drive/.test(l)) return 'Interview / assessment';
  if (/submi|document/.test(l)) return 'Document submission';
  return 'Other date';
}

function normalizeJobType(s: string): JobType | undefined {
  const l = s.toLowerCase();
  if (/intern/.test(l)) return 'Internship';
  if (/full[\s-]?time/.test(l)) return 'Full-time';
  if (/part[\s-]?time/.test(l)) return 'Part-time';
  if (/contract/.test(l)) return 'Contract';
  return undefined;
}

function normalizeWorkMode(s: string): WorkMode | undefined {
  const l = s.toLowerCase();
  if (/hybrid/.test(l)) return 'Hybrid';
  if (/remote|work from home/.test(l)) return 'Remote';
  if (/on[\s-]?site|in[\s-]office|office[\s-]based/.test(l)) return 'On-site';
  return undefined;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function extractOne(chunk: string): Extraction {
  const values: Partial<Record<ExtractKey, string>> = {};
  const raw: Record<string, string> = {};
  for (const [key, re] of LABELS) {
    const m = chunk.match(re);
    if (m && m[1].trim()) raw[key] = m[1].trim();
  }
  (['companyName', 'jobTitle', 'location', 'salaryOrStipend', 'referenceId', 'contact', 'qualifications', 'education', 'experience', 'source'] as ExtractKey[]).forEach(
    (k) => raw[k] && (values[k] = raw[k])
  );

  const jt = normalizeJobType(raw.jobTypeRaw || values.jobTitle || '') || (raw.jobTypeRaw ? undefined : normalizeJobType(/full[\s-]?time|part[\s-]?time|contract/i.exec(chunk)?.[0] || ''));
  if (jt) values.jobType = jt;
  const wm = normalizeWorkMode(raw.workModeRaw || chunk);
  if (wm) values.workMode = wm;

  const url = chunk.match(/https?:\/\/[^\s)>\]]+/i)?.[0];
  if (url) values.applicationUrl = url;
  if (!values.contact) {
    const email = chunk.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0];
    if (email) values.contact = email;
  }

  const dates: DetectedDate[] = [];
  chunk.split('\n').forEach((line) => {
    for (const m of line.matchAll(DATE_RE)) dates.push({ kind: classify(line), raw: m[0], iso: toIso(m[0]), line: line.trim() });
  });
  const deadline = dates.find((x) => x.kind === 'Application deadline' && x.iso);
  if (deadline) values.applicationDeadline = deadline.iso;
  const posted = dates.find((x) => x.kind === 'Posting date' && x.iso);
  if (posted) values.datePosted = posted.iso;

  const skills = new Set<string>();
  if (raw.skillsLine) raw.skillsLine.split(/[,;|•]/).map((s) => s.trim()).filter((s) => s && s.length < 40).forEach((s) => skills.add(s));
  KNOWN_SKILLS.forEach((s) => {
    if (new RegExp(`(^|[^a-z0-9+#.])${escapeRe(s)}($|[^a-z0-9+#])`, 'i').test(chunk) && ![...skills].some((x) => x.toLowerCase() === s.toLowerCase())) skills.add(s);
  });

  values.jobDescription = chunk.trim().slice(0, 4000);
  return {
    label: `${values.companyName || 'Unknown company'} — ${values.jobTitle || 'Untitled role'}`,
    values,
    skills: [...skills],
    dates
  };
}

export function splitOpportunities(text: string): string[] {
  const bySep = text.split(/\n\s*(?:-{3,}|={3,}|_{3,})\s*\n/).map((s) => s.trim()).filter((s) => s.length > 20);
  if (bySep.length > 1) return bySep;
  const titles = [...text.matchAll(/^\s*(?:job title|position|role)\s*[:\-–]/gim)].map((m) => m.index ?? 0);
  if (titles.length > 1) return titles.map((s, i) => text.slice(i === 0 ? 0 : s, titles[i + 1] ?? text.length).trim());
  return [text.trim()];
}

export const extractAll = (text: string) => splitOpportunities(text).map(extractOne);

export const SAMPLE_POSTING = `Northwind Labs — Campus Recruitment 2026
Company: Northwind Labs
Job Title: Cloud Engineering Intern
Job Type: Internship (6 months)
Work Mode: Hybrid
Location: Bengaluru, Karnataka
Stipend: ₹40,000 per month
Job ID: NWL-CE-2611
Posted on: 2 October 2026
Apply by: 30 October 2026
Expected joining date: 5 January 2027
Skills: Python, AWS, Linux, Docker, Git
Eligibility: B.E./B.Tech in CSE, IT or ECE graduating in 2027 with a minimum 7.0 CGPA
Contact: campus.hiring@northwind.example
Apply at: https://careers.northwind.example/jobs/NWL-CE-2611
-----
Company: Northwind Labs
Job Title: Associate Data Analyst
Job Type: Full-time
Location: Pune, Maharashtra
Skills: SQL, Excel, Power BI, Statistics
Eligibility: Any graduate with strong analytical and communication skills
Application deadline: 12 November 2026`;