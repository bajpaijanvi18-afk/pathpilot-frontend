import type { AppNotification, Application, CalendarEvent, PrepPlan, PrepQuestion, Profile, Resume, TimelineEntry } from '../types';
import { ago, d } from '../utils/format';

/* All records below are fictional demonstration data. Dates are generated relative to the first visit. */

const tl = (id: string, offset: number, label: string, kind: TimelineEntry['kind'] = 'system'): TimelineEntry => ({ id, date: d(offset), label, kind });
const ts = (offset: number) => `${d(offset)}T09:00:00.000Z`;

export const defaultChecklist = [
'Review the job description',
'Research the company',
'Revise data structures and algorithms',
'Prepare project explanations',
'Practice technical questions',
'Prepare behavioral answers',
'Prepare questions for the interviewer'];


export const resumeCategories = ['Software Development', 'AI/ML', 'Data Analytics', 'Electronics/Embedded', 'General'];

export const sampleResumes: Resume[] = [
{ resumeId: 'res_swe', displayName: 'Software Engineer Resume v2', originalFileName: 'Software_Engineer_Resume_v2.pdf', category: 'Software Development', fileType: 'PDF', fileSize: 186368, uploadedAt: d(-45), updatedAt: d(-12) },
{ resumeId: 'res_da', displayName: 'Data Analyst Resume', originalFileName: 'Data_Analyst_Resume.pdf', category: 'Data Analytics', fileType: 'PDF', fileSize: 142336, uploadedAt: d(-38) },
{ resumeId: 'res_gen', displayName: 'General Resume', originalFileName: 'General_Resume.pdf', category: 'General', fileType: 'PDF', fileSize: 121856, uploadedAt: d(-60), updatedAt: d(-20) },
{ resumeId: 'res_ml', displayName: 'ML Internship Resume', originalFileName: 'ML_Internship_Resume.docx', category: 'AI/ML', fileType: 'DOCX', fileSize: 98304, uploadedAt: d(-9) }];


export const sampleApplications: Application[] = [
{
  applicationId: 'app_google', companyName: 'Google', jobTitle: 'Software Engineer', jobType: 'Full-time', workMode: 'Hybrid', location: 'Bengaluru, India',
  status: 'Interviewing', datePosted: d(-30), dateApplied: d(-21), requiredSkills: ['Java', 'Python', 'Data Structures', 'Algorithms', 'Distributed Systems'],
  qualifications: "Bachelor's degree in Computer Science or equivalent practical experience.", education: 'B.Tech / B.E. in Computer Science or related field',
  source: 'Company careers site', resumeId: 'res_swe', applicationUrl: 'https://careers.google.com/',
  jobDescription: 'Design, develop, test and maintain software for large-scale systems. Collaborate with peers on design reviews, write high-quality code, and contribute to the reliability of production services.',
  notes: 'Recruiter mentioned two technical rounds followed by a team-matching conversation.',
  timeline: [tl('t1', -30, 'Job saved'), tl('t2', -21, 'Application submitted'), tl('t3', -12, 'Online assessment completed'), tl('t4', -7, 'Status changed from Assessment to Interviewing'), tl('t5', -7, 'Recruiter confirmed the technical round by email', 'user')],
  createdAt: ts(-30), updatedAt: ts(-7)
},
{
  applicationId: 'app_microsoft', companyName: 'Microsoft', jobTitle: 'Software Development Intern', jobType: 'Internship', workMode: 'Hybrid', location: 'Hyderabad, India',
  status: 'Applied', dateApplied: d(-8), requiredSkills: ['C++', 'Data Structures', 'OOP'], resumeId: 'res_swe', source: 'University placement cell',
  jobDescription: 'Work with a product team on real engineering problems during a 12-week summer internship.',
  timeline: [tl('t1', -8, 'Application submitted'), tl('t2', -2, 'Online assessment scheduled')], createdAt: ts(-8), updatedAt: ts(-2)
},
{
  applicationId: 'app_tcs', companyName: 'TCS', jobTitle: 'System Engineer', jobType: 'Full-time', workMode: 'On-site', location: 'Pune, India',
  status: 'Applied', dateApplied: d(-14), applicationDeadline: d(-12), requiredSkills: ['Java', 'SQL', 'Communication'], resumeId: 'res_gen', source: 'TCS NextStep portal',
  timeline: [tl('t1', -14, 'Application submitted')], createdAt: ts(-14), updatedAt: ts(-14)
},
{
  applicationId: 'app_lt', companyName: 'L&T', jobTitle: 'Graduate Engineer Trainee', jobType: 'Full-time', workMode: 'On-site', location: 'Mumbai, India',
  status: 'Offer', dateApplied: d(-42), requiredSkills: ['AutoCAD', 'Project Management', 'Communication'], resumeId: 'res_gen', source: 'Campus drive',
  salaryOrStipend: 'Not disclosed in posting',
  timeline: [tl('t1', -42, 'Application submitted'), tl('t2', -28, 'Aptitude test completed'), tl('t3', -15, 'Technical interview completed'), tl('t4', -3, 'Status changed from Interviewing to Offer'), tl('t5', -3, 'Offer letter received via campus placement office', 'user')],
  createdAt: ts(-42), updatedAt: ts(-3)
},
{
  applicationId: 'app_iqvia', companyName: 'IQVIA', jobTitle: 'Data Analyst', jobType: 'Full-time', workMode: 'Remote', location: 'Remote (India)',
  status: 'Rejected', dateApplied: d(-35), requiredSkills: ['SQL', 'Excel', 'Power BI', 'Statistics'], resumeId: 'res_da', source: 'LinkedIn',
  timeline: [tl('t1', -35, 'Application submitted'), tl('t2', -18, 'Technical interview completed'), tl('t3', -10, 'Status changed from Interviewing to Rejected')], createdAt: ts(-35), updatedAt: ts(-10)
},
{
  applicationId: 'app_amazon', companyName: 'Amazon', jobTitle: 'SDE Intern', jobType: 'Internship', workMode: 'On-site', location: 'Bengaluru, India',
  status: 'Assessment', dateApplied: d(-5), requiredSkills: ['Data Structures', 'Algorithms', 'Java'], resumeId: 'res_swe', source: 'Amazon Jobs',
  timeline: [tl('t1', -5, 'Application submitted'), tl('t2', -1, 'Status changed from Applied to Assessment')], createdAt: ts(-5), updatedAt: ts(-1)
},
{
  applicationId: 'app_infosys', companyName: 'Infosys', jobTitle: 'Specialist Programmer', jobType: 'Full-time', location: 'Multiple locations',
  status: 'Saved', applicationDeadline: d(2), requiredSkills: ['Python', 'Data Structures'], source: 'HackWithInfy announcement',
  timeline: [tl('t1', -4, 'Job saved')], createdAt: ts(-4), updatedAt: ts(-4)
},
{
  applicationId: 'app_flipkart', companyName: 'Flipkart', jobTitle: 'Data Science Intern', jobType: 'Internship', workMode: 'Hybrid', location: 'Bengaluru, India',
  status: 'Saved', applicationDeadline: d(9), requiredSkills: ['Python', 'Machine Learning', 'SQL'], resumeId: 'res_ml',
  timeline: [tl('t1', -2, 'Job saved')], createdAt: ts(-2), updatedAt: ts(-2)
},
{
  applicationId: 'app_adobe', companyName: 'Adobe', jobTitle: 'Product Engineering Intern', jobType: 'Internship', workMode: 'Hybrid', location: 'Noida, India',
  status: 'Interviewing', dateApplied: d(-16), requiredSkills: ['JavaScript', 'React', 'Data Structures'], resumeId: 'res_swe', source: 'Referral',
  timeline: [tl('t1', -16, 'Application submitted'), tl('t2', -4, 'Status changed from Applied to Interviewing')], createdAt: ts(-16), updatedAt: ts(-4)
},
{
  applicationId: 'app_wipro', companyName: 'Wipro', jobTitle: 'Project Engineer', jobType: 'Full-time', location: 'Chennai, India',
  status: 'Withdrawn', dateApplied: d(-50), requiredSkills: [], resumeId: 'res_gen',
  timeline: [tl('t1', -50, 'Application submitted'), tl('t2', -20, 'Status changed from Applied to Withdrawn')], createdAt: ts(-50), updatedAt: ts(-20)
},
{
  applicationId: 'app_accenture', companyName: 'Accenture', jobTitle: 'Associate Software Engineer', status: 'Applied', dateApplied: d(-3), requiredSkills: [],
  timeline: [tl('t1', -3, 'Application submitted')], createdAt: ts(-3), updatedAt: ts(-3)
},
{
  applicationId: 'app_zoho', companyName: 'Zoho', jobTitle: 'Member Technical Staff', jobType: 'Full-time', workMode: 'On-site', location: 'Chennai, India',
  status: 'Applied', dateApplied: d(-1), requiredSkills: ['Java', 'DBMS', 'OOP'], resumeId: 'res_swe',
  timeline: [tl('t1', -1, 'Application submitted')], createdAt: ts(-1), updatedAt: ts(-1)
}];


const TZ = 'Asia/Kolkata';
export const sampleEvents: CalendarEvent[] = [
{ eventId: 'evt_g_tech', applicationId: 'app_google', title: 'Technical Round', eventType: 'Interview', date: d(1), startTime: '15:00', timeZone: TZ, reminderPreference: '1-day', notes: 'Video call — link in recruiter email.' },
{ eventId: 'evt_ms_oa', applicationId: 'app_microsoft', title: 'Online Assessment', eventType: 'Assessment', date: d(3), startTime: '11:00', timeZone: TZ, reminderPreference: '1-day' },
{ eventId: 'evt_lt_hr', applicationId: 'app_lt', title: 'HR Interview', eventType: 'Interview', date: d(5), startTime: '14:00', timeZone: TZ, reminderPreference: 'same-day' },
{ eventId: 'evt_amz_oa', applicationId: 'app_amazon', title: 'Online Assessment', eventType: 'Assessment', date: d(7), startTime: '10:00', timeZone: TZ, reminderPreference: '1-day' },
{ eventId: 'evt_adobe', applicationId: 'app_adobe', title: 'Coding Round', eventType: 'Interview', date: d(12), startTime: '16:30', timeZone: TZ, reminderPreference: '1-day' },
{ eventId: 'evt_inf_dl', applicationId: 'app_infosys', title: 'Application deadline', eventType: 'Deadline', date: d(2), timeZone: TZ, reminderPreference: '1-day' },
{ eventId: 'evt_fk_dl', applicationId: 'app_flipkart', title: 'Application deadline', eventType: 'Deadline', date: d(9), timeZone: TZ, reminderPreference: '1-day' },
{ eventId: 'evt_tcs_dl', applicationId: 'app_tcs', title: 'Application deadline', eventType: 'Deadline', date: d(-12), timeZone: TZ, reminderPreference: 'none' },
{ eventId: 'evt_tcs_fu', applicationId: 'app_tcs', title: 'Follow up on application status', eventType: 'Follow-up', date: d(4), startTime: '10:00', timeZone: TZ, reminderPreference: 'same-day' },
{ eventId: 'evt_lt_offer', applicationId: 'app_lt', title: 'Offer letter received', eventType: 'Offer', date: d(-3), timeZone: TZ, reminderPreference: 'none' },
{ eventId: 'evt_g_oa', applicationId: 'app_google', title: 'Online Assessment', eventType: 'Assessment', date: d(-12), startTime: '18:00', timeZone: TZ, reminderPreference: 'none' },
{ eventId: 'evt_iq_int', applicationId: 'app_iqvia', title: 'Technical Interview', eventType: 'Interview', date: d(-18), startTime: '12:00', timeZone: TZ, reminderPreference: 'none' },
{ eventId: 'evt_rem', title: 'Update resume with latest project', eventType: 'Reminder', date: d(6), timeZone: TZ, reminderPreference: 'same-day' }];


export const sampleNotifications: AppNotification[] = [
{ id: 'n1', type: 'interview', title: 'Google technical round coming up', description: 'Technical Round is scheduled for 3:00 PM. Review your preparation plan.', timestamp: ago(2), read: false, applicationId: 'app_google' },
{ id: 'n2', type: 'deadline', title: 'Infosys application deadline approaching', description: 'Specialist Programmer closes soon and is still marked as Saved.', timestamp: ago(5), read: false, applicationId: 'app_infosys' },
{ id: 'n3', type: 'assessment', title: 'Amazon online assessment scheduled', description: 'SDE Intern assessment has been added to your calendar.', timestamp: ago(20), read: false, applicationId: 'app_amazon' },
{ id: 'n4', type: 'follow-up', title: 'Follow up with TCS', description: 'You planned to check in on your System Engineer application.', timestamp: ago(30), read: true, applicationId: 'app_tcs' },
{ id: 'n5', type: 'status', title: 'L&T status updated to Offer', description: 'Graduate Engineer Trainee moved from Interviewing to Offer.', timestamp: ago(72), read: true, applicationId: 'app_lt' },
{ id: 'n6', type: 'processing-complete', title: 'Job description processed', description: 'Flipkart Data Science Intern details are ready for review.', timestamp: ago(50), read: true, applicationId: 'app_flipkart' },
{ id: 'n7', type: 'processing-failed', title: "Couldn't read a scanned PDF", description: 'The file looked like an image-only scan. Paste the text or enter details manually.', timestamp: ago(120), read: true }];


const checklist = (doneCount: number) => defaultChecklist.map((text, i) => ({ id: `c${i}`, text, done: i < doneCount }));

export const samplePrepPlans: PrepPlan[] = [
{ preparationId: 'prep_google', applicationId: 'app_google', roundType: 'Technical Round', interviewDate: d(1), topics: ['Graphs', 'Dynamic programming', 'System design basics', 'Past projects'], notes: 'Focus on explaining trade-offs out loud. Revisit the caching project — expect follow-ups on scale.', checklist: checklist(4), resources: ['https://www.techinterviewhandbook.org/'], updatedAt: ago(6) },
{ preparationId: 'prep_lt', applicationId: 'app_lt', roundType: 'HR Round', interviewDate: d(5), topics: ['Relocation', 'Career goals', 'Offer questions'], notes: 'Ask about joining date flexibility and training location.', checklist: checklist(2), resources: [], updatedAt: ago(30) },
{ preparationId: 'prep_adobe', applicationId: 'app_adobe', roundType: 'Coding Round', interviewDate: d(12), topics: ['Arrays & strings', 'React fundamentals'], notes: '', checklist: checklist(1), resources: [], updatedAt: ago(80) }];


export const sampleQuestions: PrepQuestion[] = [
{ id: 'q1', topic: 'DSA', question: 'Find the shortest path in an unweighted grid with obstacles.', answer: 'BFS from source, track visited, return distance on reaching target. O(R·C).', applicationId: 'app_google' },
{ id: 'q2', topic: 'OOP', question: 'Explain the difference between composition and inheritance with an example.' },
{ id: 'q3', topic: 'DBMS', question: 'What are the differences between clustered and non-clustered indexes?' },
{ id: 'q4', topic: 'Operating Systems', question: 'How does a deadlock occur and how can it be prevented?' },
{ id: 'q5', topic: 'Computer Networks', question: 'What happens when you type a URL into the browser?' },
{ id: 'q6', topic: 'Projects', question: 'Walk through the architecture of your final-year project.', answer: 'Start with the problem, then data flow, then the hardest trade-off.' },
{ id: 'q7', topic: 'Behavioral', question: 'Tell me about a time you disagreed with a teammate.', applicationId: 'app_lt' },
{ id: 'q8', topic: 'Domain-Specific', question: 'How would you design a component library for a large product team?', applicationId: 'app_adobe' }];


export const sampleProfile: Profile = {
  fullName: 'Janvi Sharma',
  email: 'janvi.sharma@example.com',
  university: 'Example Institute of Technology',
  degree: 'B.Tech, Computer Science',
  graduationYear: '2027',
  preferredRoles: 'Software Engineer, Data Analyst',
  preferredLocations: 'Bengaluru, Hyderabad, Remote',
  preferredJobType: 'Internship',
  defaultView: 'table',
  reminderLead: '1-day',
  timeZone: 'Asia/Kolkata',
  notifyInApp: true,
  notifyDigest: false
};