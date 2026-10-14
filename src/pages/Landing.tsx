import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightIcon, BellRingIcon, BookOpenIcon, BriefcaseIcon, CalendarDaysIcon, CloudIcon, FileSearchIcon, FileTextIcon, KeyRoundIcon, LockIcon, ServerIcon, ShieldCheckIcon, UploadIcon, UserCheckIcon } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { Button, Logo } from '../components/ui';
import { ThemeToggle } from '../components/ThemeToggle';
import { ProductPreview } from '../components/ProductPreview';

const FEATURES = [
{ icon: BriefcaseIcon, title: 'Smart Job Tracking', text: 'Track companies, job roles, application dates, recruitment stages and outcomes in one place.' },
{ icon: FileSearchIcon, title: 'Automatic Document Extraction', text: 'Upload job descriptions to pull out company, role, deadlines, location, eligibility and skills — then review before saving.' },
{ icon: FileTextIcon, title: 'Resume Vault', text: 'Store and reuse multiple resume versions, and see which applications used each one.' },
{ icon: BookOpenIcon, title: 'Interview Preparation', text: 'Keep notes, technical questions, checklists and round-specific details organized.' },
{ icon: CalendarDaysIcon, title: 'Deadlines and Reminders', text: 'See upcoming application deadlines, assessments and interviews in one calendar.' },
{ icon: CloudIcon, title: 'Cloud-Ready Document Management', text: 'A secure document experience designed for private cloud storage and authorised access.' }];


const STEPS = [
{ icon: UploadIcon, title: 'Upload or enter a job', text: 'Drop in a job description, or type the details manually.' },
{ icon: UserCheckIcon, title: 'Review and pick a resume', text: 'Check the extracted details, fix anything off, and link the right resume.' },
{ icon: BellRingIcon, title: 'Track and prepare', text: 'Follow progress, prepare for each round and never miss a deadline.' }];


const SECURITY = [
{ icon: LockIcon, title: 'Private by default', text: 'Your applications, resumes and notes are visible only to you.' },
{ icon: KeyRoundIcon, title: 'Secure sign-in', text: 'Designed for managed authentication with verified email sign-in.' },
{ icon: ServerIcon, title: 'Server-side authorisation', text: 'Every request is checked against your signed-in identity — never a user ID sent from the browser.' },
{ icon: ShieldCheckIcon, title: 'No public file links', text: 'Documents are meant to live in private storage, shared only through short-lived links.' }];


export function Landing() {
  const { enterDemo, signedIn } = useStore();
  const nav = useNavigate();
  const explore = () => {if (!signedIn) enterDemo();nav('/app');};

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link to="/" aria-label="PathPilot home"><Logo tagline={false} /></Link>
          <nav aria-label="Primary" className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
            <a href="#features" className="hover:text-ink">Features</a>
            <a href="#how" className="hover:text-ink">How It Works</a>
            <a href="#security" className="hover:text-ink">Security</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Link to="/login" className="hidden px-3 text-sm font-medium text-ink hover:text-primary sm:block">Sign In</Link>
            <Link to="/register"><Button size="sm">Get Started</Button></Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(99,102,241,0.14),transparent)]" aria-hidden />
          <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-xs font-medium text-muted shadow-card">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Track. Prepare. Get Hired.
              </span>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Your career journey, organized in one place.</h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">Track applications, extract job details automatically, organize resumes, and prepare for interviews — all from one intelligent career dashboard.</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/register"><Button className="h-11 w-full px-6 sm:w-auto" icon={<ArrowRightIcon className="h-4 w-4" />}>Get Started Free</Button></Link>
                <Button variant="secondary" className="h-11 px-6" onClick={explore}>Explore Dashboard</Button>
              </div>
            </div>
            <div className="mx-auto mt-14 max-w-5xl"><ProductPreview /></div>
            <p className="mt-3 text-center text-xs text-muted">Preview uses fictional sample data.</p>
          </div>
        </section>

        <section id="features" className="scroll-mt-20 border-t border-line bg-card py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-primary dark:text-indigo-300">Features</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Everything your job search needs, nothing it doesn't</h2>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) =>
              <div key={f.title} className="rounded-2xl border border-line bg-canvas p-6 transition hover:-translate-y-0.5 hover:shadow-card">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary dark:text-indigo-300"><f.icon className="h-5 w-5" aria-hidden /></span>
                  <h3 className="mt-5 text-base font-semibold text-ink">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="how" className="scroll-mt-20 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-center text-sm font-semibold text-primary dark:text-indigo-300">How it works</p>
            <h2 className="mt-2 text-center text-3xl font-semibold tracking-tight text-ink">From job description to offer in three steps</h2>
            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {STEPS.map((s, i) =>
              <li key={s.title} className="relative rounded-2xl border border-line bg-card p-6 shadow-card">
                  <span className="text-xs font-semibold text-muted">Step {i + 1}</span>
                  <span className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white"><s.icon className="h-5 w-5" aria-hidden /></span>
                  <h3 className="mt-4 text-base font-semibold text-ink">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{s.text}</p>
                </li>
              )}
            </ol>
          </div>
        </section>

        <section id="security" className="scroll-mt-20 bg-navy py-20 text-white">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <p className="text-sm font-semibold text-indigo-300">Security</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Built to keep your career data yours</h2>
              <p className="mt-4 text-slate-300">PathPilot is designed around private storage and per-user data isolation. This prototype stores sample data in your browser only.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {SECURITY.map((s) =>
              <div key={s.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                  <s.icon className="h-5 w-5 text-indigo-300" aria-hidden />
                  <h3 className="mt-3 text-sm font-semibold">{s.title}</h3>
                  <p className="mt-1 text-sm text-slate-300">{s.text}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-3xl font-semibold tracking-tight text-ink">Ready to organize your search?</h2>
            <p className="mt-3 text-muted">Create your free account and add your first application in under a minute.</p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/register"><Button className="h-11 w-full px-6 sm:w-auto">Get Started Free</Button></Link>
              <Button variant="secondary" className="h-11 px-6" onClick={explore}>Explore Dashboard</Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted">PathPilot helps students and job seekers manage applications, resumes, deadlines and interview prep in one place.</p>
          </div>
          <nav aria-label="Product" className="space-y-2 text-sm">
            <p className="font-semibold text-ink">Product</p>
            <a href="#features" className="block text-muted hover:text-ink">Features</a>
            <a href="#how" className="block text-muted hover:text-ink">How It Works</a>
            <a href="#security" className="block text-muted hover:text-ink">Security</a>
          </nav>
          <nav aria-label="Company" className="space-y-2 text-sm">
            <p className="font-semibold text-ink">About</p>
            <a href="#top" className="block text-muted hover:text-ink">About PathPilot</a>
            <a href="#security" className="block text-muted hover:text-ink">Privacy</a>
            <a href="mailto:hello@pathpilot.example" className="block text-muted hover:text-ink">Contact</a>
          </nav>
        </div>
        <p className="border-t border-line py-5 text-center text-xs text-muted">© {new Date().getFullYear()} PathPilot. Academic project prototype.</p>
      </footer>
    </div>);

}