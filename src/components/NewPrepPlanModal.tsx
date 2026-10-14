import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { RoundType } from '../types';
import { useStore } from '../contexts/StoreContext';
import { Button, Field, Modal } from './ui';
import { defaultChecklist } from '../data/sampleData';
import { inputCls } from '../utils/styles';
import { nowIso, uid } from '../utils/format';
import { nextEventFor } from '../utils/stats';

export const ROUND_TYPES: RoundType[] = ['Online Assessment', 'Technical Round', 'Coding Round', 'System Design', 'HR Round', 'Managerial Round', 'Other'];

export function NewPrepPlanModal({ open, onClose, presetAppId, onCreated }: {open: boolean;onClose: () => void;presetAppId?: string;onCreated: (id: string) => void;}) {
  const { applications, events, savePrep } = useStore();
  const [appId, setAppId] = useState('');
  const [round, setRound] = useState<RoundType>('Technical Round');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const id = presetAppId ?? '';
    setAppId(id);
    setDate(id ? nextEventFor(id, events)?.date ?? '' : '');
    setError('');
  }, [open, presetAppId]); // eslint-disable-line react-hooks/exhaustive-deps

  const create = () => {
    if (!appId) return setError('Choose the application this plan is for');
    const id = uid('prep');
    savePrep({ preparationId: id, applicationId: appId, roundType: round, interviewDate: date || undefined, topics: [], notes: '', checklist: defaultChecklist.map((text, i) => ({ id: `c${i}`, text, done: false })), resources: [], updatedAt: nowIso() });
    toast.success('Preparation plan created');
    onCreated(id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New preparation plan" description="Link a plan to an application and interview round." size="sm" footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={create}>Create Plan</Button></>}>
      <div className="space-y-4">
        <Field label="Application" htmlFor="np-app" required error={error}>
          <select id="np-app" value={appId} onChange={(e) => {setAppId(e.target.value);setError('');if (e.target.value) setDate(nextEventFor(e.target.value, events)?.date ?? date);}} className={inputCls}>
            <option value="">Select an application</option>
            {applications.map((a) => <option key={a.applicationId} value={a.applicationId}>{a.companyName} — {a.jobTitle}</option>)}
          </select>
        </Field>
        <Field label="Interview round" htmlFor="np-round">
          <select id="np-round" value={round} onChange={(e) => setRound(e.target.value as RoundType)} className={inputCls}>
            {ROUND_TYPES.map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="Interview date" htmlFor="np-date" hint="Optional — prefilled from the next scheduled event when available.">
          <input id="np-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </Field>
      </div>
    </Modal>);

}