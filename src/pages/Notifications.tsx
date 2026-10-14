import React, { useState } from 'react';
import { BellOffIcon, CheckCheckIcon } from 'lucide-react';
import type { NotificationType } from '../types';
import { useStore } from '../contexts/StoreContext';
import { Button, Card, EmptyState, PageHeader, Tabs } from '../components/ui';
import { NotificationItem } from '../components/NotificationItem';

type Filter = 'all' | 'unread' | 'interviews' | 'deadlines' | 'updates' | 'documents';
const GROUPS: Record<Exclude<Filter, 'all' | 'unread'>, NotificationType[]> = {
  interviews: ['interview', 'assessment'],
  deadlines: ['deadline', 'follow-up'],
  updates: ['status'],
  documents: ['processing-complete', 'processing-failed']
};

export function Notifications() {
  const { notifications, markAllRead } = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const unread = notifications.filter((n) => !n.read).length;
  const list = notifications.filter((n) => filter === 'all' ? true : filter === 'unread' ? !n.read : GROUPS[filter].includes(n.type));

  return (
    <div className="max-w-3xl">
      <PageHeader title="Notifications" subtitle="Sample notifications for demonstration. Delivery by email or push isn't connected." actions={<Button variant="secondary" icon={<CheckCheckIcon className="h-4 w-4" />} disabled={!unread} onClick={markAllRead}>Mark all as read</Button>} />
      <Tabs className="mb-4" value={filter} onChange={setFilter} tabs={[{ id: 'all', label: 'All', count: notifications.length }, { id: 'unread', label: 'Unread', count: unread }, { id: 'interviews', label: 'Interviews & assessments' }, { id: 'deadlines', label: 'Deadlines & follow-ups' }, { id: 'updates', label: 'Status updates' }, { id: 'documents', label: 'Documents' }]} />
      <Card className="p-2">
        {list.length ? <div className="space-y-0.5">{list.map((n) => <NotificationItem key={n.id} n={n} />)}</div> : <EmptyState icon={BellOffIcon} title="You're all caught up" text="No notifications in this view." />}
      </Card>
    </div>);

}