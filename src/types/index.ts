export type Status = 'Saved' | 'Applied' | 'Assessment' | 'Interviewing' | 'Offer' | 'Rejected' | 'Withdrawn';
export type JobType = 'Internship' | 'Full-time' | 'Part-time' | 'Contract' | 'Other';
export type WorkMode = 'On-site' | 'Hybrid' | 'Remote';
export type EventType = 'Deadline' | 'Assessment' | 'Interview' | 'Follow-up' | 'Offer' | 'Reminder';
export type RoundType =
'Online Assessment' |
'Technical Round' |
'Coding Round' |
'System Design' |
'HR Round' |
'Managerial Round' |
'Other';
export type ReminderPreference = 'none' | 'same-day' | '1-day' | 'custom';
export type QuestionTopic =
'DSA' |
'OOP' |
'DBMS' |
'Operating Systems' |
'Computer Networks' |
'Projects' |
'Behavioral' |
'Domain-Specific';
export type NotificationType =
'interview' |
'deadline' |
'assessment' |
'status' |
'follow-up' |
'processing-complete' |
'processing-failed';

export interface TimelineEntry {
  id: string;
  date: string;
  label: string;
  kind: 'system' | 'user';
}

export interface SourceDocument {
  name: string;
  kind: 'file' | 'text';
  addedAt: string;
}

export interface Application {
  applicationId: string;
  companyName: string;
  jobTitle: string;
  jobDescription?: string;
  applicationUrl?: string;
  jobType?: JobType;
  workMode?: WorkMode;
  location?: string;
  status: Status;
  datePosted?: string;
  dateApplied?: string;
  applicationDeadline?: string;
  salaryOrStipend?: string;
  requiredSkills: string[];
  qualifications?: string;
  education?: string;
  experience?: string;
  referenceId?: string;
  contact?: string;
  source?: string;
  resumeId?: string;
  notes?: string;
  isDraft?: boolean;
  needsReview?: boolean;
  sourceDocument?: SourceDocument;
  timeline: TimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  resumeId: string;
  displayName: string;
  originalFileName: string;
  category: string;
  fileType: 'PDF' | 'DOCX';
  fileSize: number;
  uploadedAt: string;
  updatedAt?: string;
}

export interface CalendarEvent {
  eventId: string;
  applicationId?: string;
  title: string;
  eventType: EventType;
  date: string;
  startTime?: string;
  timeZone: string;
  reminderPreference: ReminderPreference;
  customLeadHours?: number;
  notes?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface PrepPlan {
  preparationId: string;
  applicationId: string;
  roundType: RoundType;
  interviewDate?: string;
  topics: string[];
  notes: string;
  checklist: ChecklistItem[];
  resources: string[];
  updatedAt: string;
}

export interface PrepQuestion {
  id: string;
  topic: QuestionTopic;
  question: string;
  answer?: string;
  applicationId?: string;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  applicationId?: string;
}

export interface Profile {
  fullName: string;
  email: string;
  phone?: string;
  university?: string;
  degree?: string;
  graduationYear?: string;
  preferredRoles: string;
  preferredLocations: string;
  preferredJobType: JobType | '';
  defaultView: 'table' | 'kanban';
  reminderLead: ReminderPreference;
  timeZone: string;
  notifyInApp: boolean;
  notifyDigest: boolean;
}