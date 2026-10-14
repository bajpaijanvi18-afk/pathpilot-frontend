import React, { useRef, useState } from 'react';
import { CircleAlertIcon, CloudUploadIcon, FileTextIcon, XIcon } from 'lucide-react';
import { Button } from './ui';
import { cn } from '../utils/styles';
import { fmtSize } from '../utils/format';

interface Props {
  accept: string[];
  maxBytes: number;
  file: File | null;
  onFile: (f: File | null) => void;
  error?: string;
  onError: (msg: string) => void;
  label?: string;
}

export function FileDropzone({ accept, maxBytes, file, onFile, error, onError, label = 'Drag and drop your file here' }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const validate = (f?: File) => {
    if (!f) return;
    const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
    if (!accept.includes(ext)) return onError(`Unsupported file type (.${ext}). Upload ${accept.map((a) => a.toUpperCase()).join(', ')}.`);
    if (f.size === 0) return onError('This file is empty.');
    if (f.size > maxBytes) return onError(`This file is ${fmtSize(f.size)}. The maximum size is ${fmtSize(maxBytes)}.`);
    onError('');
    onFile(f);
  };

  if (file)
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-subtle/50 p-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary dark:text-indigo-300">
          <FileTextIcon className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{file.name}</p>
          <p className="text-xs text-muted">{fmtSize(file.size)} · Ready</p>
        </div>
        <button onClick={() => onFile(null)} aria-label={`Remove ${file.name}`} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-card hover:text-ink">
          <XIcon className="h-4 w-4" />
        </button>
      </div>);


  return (
    <div>
      <div
        onDragOver={(e) => {e.preventDefault();setOver(true);}}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {e.preventDefault();setOver(false);validate(e.dataTransfer.files[0]);}}
        className={cn('flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-9 text-center transition', over ? 'border-primary bg-primary-soft/60' : error ? 'border-rose-300' : 'border-line hover:border-primary-2/60')}>
        
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary dark:text-indigo-300">
          <CloudUploadIcon className="h-5 w-5" aria-hidden />
        </span>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="mb-3 mt-1 text-xs text-muted">or</p>
        <Button variant="secondary" size="sm" onClick={() => input.current?.click()}>Browse Files</Button>
        <p className="mt-3 text-xs text-muted">{accept.map((a) => a.toUpperCase()).join(', ')} · up to {fmtSize(maxBytes)}</p>
        <input ref={input} type="file" className="sr-only" accept={accept.map((a) => `.${a}`).join(',')} onChange={(e) => {validate(e.target.files?.[0]);e.target.value = '';}} aria-label="Choose file" />
      </div>
      {error &&
      <p className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400" role="alert">
          <CircleAlertIcon className="h-3.5 w-3.5" aria-hidden /> {error}
        </p>
      }
    </div>);

}