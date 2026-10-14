import type { Application, Resume } from '../types';

const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportApplicationsCsv(apps: Application[], resumes: Resume[]) {
  const header = ['Company', 'Job Title', 'Job Type', 'Work Mode', 'Location', 'Status', 'Date Applied', 'Deadline', 'Resume', 'URL'];
  const rows = apps.map((a) => [
  a.companyName,
  a.jobTitle,
  a.jobType,
  a.workMode,
  a.location,
  a.status,
  a.dateApplied,
  a.applicationDeadline,
  resumes.find((r) => r.resumeId === a.resumeId)?.displayName,
  a.applicationUrl]
  );
  const csv = [header, ...rows].map((r) => r.map(esc).join(',')).join('\n');
  downloadFile('pathpilot-applications.csv', csv, 'text/csv');
}