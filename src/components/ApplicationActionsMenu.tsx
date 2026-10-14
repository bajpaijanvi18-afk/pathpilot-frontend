import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CheckIcon, CopyIcon, EyeIcon, RefreshCwIcon, SquarePenIcon, StickyNoteIcon, Trash2Icon } from 'lucide-react';
import type { Application } from '../types';
import { useStore } from '../contexts/StoreContext';
import { ConfirmDialog, Menu, Modal, StatusBadge } from './ui';
import { STATUSES, cn } from '../utils/styles';

export function ApplicationActionsMenu({ app, onDeleted }: {app: Application;onDeleted?: () => void;}) {
  const { openAdd, deleteApplication, setStatus, duplicateApplication } = useStore();
  const nav = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const id = app.applicationId;

  return (
    <>
      <Menu
        label={`Actions for ${app.companyName} ${app.jobTitle}`}
        items={[
        { label: 'View Details', icon: EyeIcon, onClick: () => nav(`/app/applications/${id}`) },
        { label: 'Edit Application', icon: SquarePenIcon, onClick: () => openAdd({ editId: id }) },
        { label: 'Update Status', icon: RefreshCwIcon, onClick: () => setStatusOpen(true) },
        { label: 'Add Notes', icon: StickyNoteIcon, onClick: () => nav(`/app/applications/${id}?tab=notes`) },
        {
          label: 'Duplicate',
          icon: CopyIcon,
          onClick: () => {
            const c = duplicateApplication(id);
            if (c) toast.success('Application duplicated', { description: `${c.companyName} — ${c.jobTitle}` });
          }
        },
        { label: 'Delete Application', icon: Trash2Icon, danger: true, onClick: () => setConfirm(true) }]
        } />
      
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Delete this application?"
        message={<>This permanently removes <strong className="text-ink">{app.companyName} — {app.jobTitle}</strong>, along with its linked events and preparation plans. Your resumes are not affected.</>}
        onConfirm={() => {
          deleteApplication(id);
          toast.success('Application deleted');
          onDeleted?.();
        }} />
      
      <Modal open={statusOpen} onClose={() => setStatusOpen(false)} title="Update status" description={`${app.companyName} — ${app.jobTitle}`} size="sm">
        <div className="space-y-1.5" role="radiogroup" aria-label="Application status">
          {STATUSES.map((s) =>
          <button
            key={s}
            role="radio"
            aria-checked={app.status === s}
            data-autofocus={app.status === s ? true : undefined}
            onClick={() => {
              setStatus(id, s);
              setStatusOpen(false);
              if (s !== app.status) toast.success(`Status updated to ${s}`);
            }}
            className={cn('flex w-full items-center justify-between rounded-xl border px-3 py-2.5 transition hover:bg-subtle', app.status === s ? 'border-primary bg-primary-soft/60' : 'border-line')}>
            
              <StatusBadge status={s} />
              {app.status === s && <CheckIcon className="h-4 w-4 text-primary" aria-hidden />}
            </button>
          )}
        </div>
      </Modal>
    </>);

}