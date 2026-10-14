import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { BriefcaseIcon, DownloadIcon, EyeIcon, FileTextIcon, FolderIcon, LinkIcon, LoaderCircleIcon, PencilIcon, PlusIcon, SearchIcon, ShieldCheckIcon, Trash2Icon, UploadIcon } from 'lucide-react';
import type { Resume } from '../types';
import { useStore } from '../contexts/StoreContext';
import { Button, Card, ConfirmDialog, EmptyState, Field, Menu, Modal, PageHeader, StatusBadge } from '../components/ui';
import { FileDropzone } from '../components/FileDropzone';
import { resumeCategories } from '../data/sampleData';
import { cn, inputCls } from '../utils/styles';
import { delay, fmtDate, fmtSize } from '../utils/format';

const MAX = 5 * 1024 * 1024;
const CUSTOM = '__custom';

function CategorySelect({ value, onChange, categories, id }: {value: string;onChange: (v: string) => void;categories: string[];id: string;}) {
  const [custom, setCustom] = useState(!categories.includes(value) && !!value);
  return (
    <div className="space-y-2">
      <select id={id} value={custom ? CUSTOM : value} onChange={(e) => {if (e.target.value === CUSTOM) {setCustom(true);onChange('');} else {setCustom(false);onChange(e.target.value);}}} className={inputCls}>
        {categories.map((c) => <option key={c}>{c}</option>)}
        <option value={CUSTOM}>Custom category…</option>
      </select>
      {custom && <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="e.g. Product Management" aria-label="Custom category name" className={inputCls} />}
    </div>);

}

export function ResumeVault() {
  const { resumes, applications, addResume, updateResume, deleteResume, openAdd } = useStore();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [stage, setStage] = useState<'pick' | 'checking' | 'details'>('pick');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [edit, setEdit] = useState<Resume | null>(null);
  const [linked, setLinked] = useState<Resume | null>(null);
  const [del, setDel] = useState<Resume | null>(null);

  const categories = [...new Set([...resumeCategories, ...resumes.map((r) => r.category)])];
  const linkedApps = (id: string) => applications.filter((a) => a.resumeId === id);
  const t = q.trim().toLowerCase();
  const list = resumes.filter((r) => (cat === 'all' || r.category === cat) && (!t || `${r.displayName} ${r.originalFileName} ${r.category}`.toLowerCase().includes(t)));

  const openUpload = () => {setFile(null);setFileError('');setStage('pick');setCategory('General');setUploadOpen(true);};
  useEffect(() => {
    if (params.get('upload') === '1') {openUpload();setParams({}, { replace: true });}
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  const check = async () => {
    if (!file) return;
    setStage('checking');
    await delay(600);
    setName(file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '));
    setStage('details');
  };

  const saveUpload = () => {
    if (!file || !name.trim() || !category.trim()) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    addResume({ displayName: name.trim(), originalFileName: file.name, category: category.trim(), fileType: ext === 'pdf' ? 'PDF' : 'DOCX', fileSize: file.size });
    setUploadOpen(false);
    toast.success('Resume added to your vault', { description: 'Details saved in this browser. Private cloud storage is not connected in this demo.' });
  };

  return (
    <div>
      <PageHeader title="Resume Vault" subtitle="One organized library for every version of your resume." actions={<Button icon={<UploadIcon className="h-4 w-4" />} onClick={openUpload}>Upload Resume</Button>} />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-80">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search resumes" aria-label="Search resumes" className={cn(inputCls, 'pl-9')} />
        </div>
        <div className="thin-scroll flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by category">
          {['all', ...categories].map((c) =>
          <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={cn('whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition', cat === c ? 'border-primary bg-primary text-white' : 'border-line bg-card text-muted hover:text-ink')}>
              {c === 'all' ? 'All' : c}
            </button>
          )}
        </div>
      </div>

      {!list.length ?
      <Card>
          <EmptyState icon={FileTextIcon} title={resumes.length ? 'No resumes match' : 'Your vault is empty'} text={resumes.length ? 'Try another search or category.' : 'Upload your first resume to reuse it across applications.'} action={<Button size="sm" onClick={openUpload}>Upload Resume</Button>} />
        </Card> :

      <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((r) => {
          const n = linkedApps(r.resumeId).length;
          return (
            <li key={r.resumeId}>
                <Card className="flex h-full flex-col p-5 transition hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl text-[11px] font-bold', r.fileType === 'PDF' ? 'bg-rose-50 text-rose-600 dark:bg-rose-400/15 dark:text-rose-300' : 'bg-sky-50 text-sky-600 dark:bg-sky-400/15 dark:text-sky-300')}>{r.fileType}</span>
                    <Menu
                    label={`Actions for ${r.displayName}`}
                    items={[
                    { label: 'Preview — needs storage', icon: EyeIcon, disabled: true, onClick: () => undefined },
                    { label: 'Download — needs storage', icon: DownloadIcon, disabled: true, onClick: () => undefined },
                    { label: 'Rename & categorize', icon: PencilIcon, onClick: () => setEdit({ ...r }) },
                    { label: 'View linked applications', icon: LinkIcon, onClick: () => setLinked(r) },
                    { label: 'Use for new application', icon: PlusIcon, onClick: () => openAdd({ resumeId: r.resumeId }) },
                    { label: 'Delete', icon: Trash2Icon, danger: true, onClick: () => setDel(r) }]
                    } />
                  
                  </div>
                  <h2 className="mt-4 truncate text-sm font-semibold text-ink">{r.displayName}</h2>
                  <p className="truncate text-xs text-muted">{r.originalFileName}</p>
                  <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-medium text-primary dark:text-indigo-300"><FolderIcon className="h-3 w-3" aria-hidden />{r.category}</span>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div><dt className="text-muted">Size</dt><dd className="font-medium text-ink">{fmtSize(r.fileSize)}</dd></div>
                    <div><dt className="text-muted">Format</dt><dd className="font-medium text-ink">{r.fileType}</dd></div>
                    <div><dt className="text-muted">Uploaded</dt><dd className="font-medium text-ink">{fmtDate(r.uploadedAt)}</dd></div>
                    <div><dt className="text-muted">Last updated</dt><dd className="font-medium text-ink">{r.updatedAt ? fmtDate(r.updatedAt) : '—'}</dd></div>
                  </dl>
                  <div className="flex-1" />
                  <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                    <button onClick={() => setLinked(r)} className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-ink"><BriefcaseIcon className="h-3.5 w-3.5" aria-hidden /> {n} linked application{n === 1 ? '' : 's'}</button>
                    <button onClick={() => openAdd({ resumeId: r.resumeId })} className="text-xs font-medium text-primary hover:underline dark:text-indigo-300">Use for application</button>
                  </div>
                </Card>
              </li>);

        })}
        </ul>
      }

      <p className="mt-6 flex items-center gap-2 text-xs text-muted"><ShieldCheckIcon className="h-4 w-4" aria-hidden /> Resumes are private to your account. In production, files are stored in private cloud storage and accessed only through short-lived authorised links.</p>

      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title="Upload Resume"
        description="PDF or DOCX, up to 5 MB."
        footer={
        stage === 'details' ?
        <><Button variant="secondary" onClick={() => setStage('pick')}>Back</Button><Button onClick={saveUpload} disabled={!name.trim() || !category.trim()}>Save to Vault</Button></> :

        <><Button variant="secondary" onClick={() => setUploadOpen(false)}>Cancel</Button><Button onClick={check} disabled={!file} loading={stage === 'checking'}>Continue</Button></>

        }>
        
        {stage === 'details' ?
        <div className="space-y-4">
            <Field label="Display name" htmlFor="rv-name" required><input id="rv-name" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Field>
            <Field label="Category" htmlFor="rv-cat"><CategorySelect id="rv-cat" value={category} onChange={setCategory} categories={categories} /></Field>
            <p className="text-xs text-muted">File: {file?.name} · {file && fmtSize(file.size)}</p>
          </div> :
        stage === 'checking' ?
        <div className="flex flex-col items-center py-10 text-center" role="status">
            <LoaderCircleIcon className="mb-3 h-7 w-7 animate-spin text-primary" aria-hidden />
            <p className="text-sm font-medium text-ink">Checking file type and size…</p>
          </div> :

        <FileDropzone accept={['pdf', 'docx']} maxBytes={MAX} file={file} onFile={setFile} error={fileError} onError={setFileError} label="Drag and drop your resume" />
        }
      </Modal>

      <Modal open={!!edit} onClose={() => setEdit(null)} title="Rename & categorize" size="sm" footer={<><Button variant="secondary" onClick={() => setEdit(null)}>Cancel</Button><Button disabled={!edit?.displayName.trim() || !edit?.category.trim()} onClick={() => {if (edit) {updateResume(edit.resumeId, { displayName: edit.displayName.trim(), category: edit.category.trim() });toast.success('Resume updated');setEdit(null);}}}>Save</Button></>}>
        {edit &&
        <div className="space-y-4">
            <Field label="Display name" htmlFor="ed-name" required><input id="ed-name" value={edit.displayName} onChange={(e) => setEdit({ ...edit, displayName: e.target.value })} className={inputCls} /></Field>
            <Field label="Category" htmlFor="ed-cat"><CategorySelect id="ed-cat" value={edit.category} onChange={(v) => setEdit({ ...edit, category: v })} categories={categories} /></Field>
          </div>
        }
      </Modal>

      <Modal open={!!linked} onClose={() => setLinked(null)} title="Linked applications" description={linked?.displayName} size="sm">
        {linked && (linkedApps(linked.resumeId).length ?
        <ul className="space-y-2">
            {linkedApps(linked.resumeId).map((a) =>
          <li key={a.applicationId}><Link to={`/app/applications/${a.applicationId}`} onClick={() => setLinked(null)} className="flex items-center justify-between gap-3 rounded-xl border border-line p-3 hover:bg-subtle"><span className="min-w-0 text-sm"><span className="block truncate font-medium text-ink">{a.companyName}</span><span className="block truncate text-muted">{a.jobTitle}</span></span><StatusBadge status={a.status} /></Link></li>
          )}
          </ul> :
        <p className="text-sm text-muted">This resume isn't linked to any applications yet.</p>)}
      </Modal>

      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        title="Delete this resume?"
        message={del && (linkedApps(del.resumeId).length ? <><strong className="text-ink">{del.displayName}</strong> is linked to {linkedApps(del.resumeId).length} application(s). Deleting it removes the link from those applications — they'll show “No resume linked”. The applications themselves are kept.</> : <><strong className="text-ink">{del.displayName}</strong> will be permanently removed from your vault.</>)}
        onConfirm={() => {if (del) {deleteResume(del.resumeId);toast.success('Resume deleted');}}} />
      
    </div>);

}