import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckIcon, CircleAlertIcon, CircleCheckIcon, CircleIcon, InfoIcon, MailCheckIcon, UserPlusIcon } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { AuthLayout } from '../components/AuthLayout';
import { Button, Field, PasswordInput } from '../components/ui';
import { cn, inputCls } from '../utils/styles';
import { delay } from '../utils/format';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Mirrors a typical Cognito password policy; keep in sync with the configured provider. */
const RULES: [string, (p: string) => boolean][] = [
['At least 8 characters', (p) => p.length >= 8],
['One uppercase letter', (p) => /[A-Z]/.test(p)],
['One lowercase letter', (p) => /[a-z]/.test(p)],
['One number', (p) => /\d/.test(p)],
['One special character', (p) => /[^A-Za-z0-9]/.test(p)]];


type Errors = Partial<Record<'name' | 'email' | 'password' | 'confirm' | 'terms' | 'code', string>>;

export function Register() {
  const { register, enterDemo } = useStore();
  const nav = useNavigate();
  const [stage, setStage] = useState<'form' | 'verify' | 'done'>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [terms, setTerms] = useState(false);
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [failure, setFailure] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const errs: Errors = {};
    if (!name.trim()) errs.name = 'Enter your full name';
    if (!EMAIL_RE.test(email.trim())) errs.email = 'Enter a valid email address';
    if (!RULES.every(([, f]) => f(password))) errs.password = 'Password doesn’t meet all requirements';
    if (!confirm) errs.confirm = 'Confirm your password';else
    if (confirm !== password) errs.confirm = 'Passwords don’t match';
    if (!terms) errs.terms = 'Please accept the Terms and Privacy Policy';
    setErrors(errs);
    setFailure('');
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await register(name.trim(), email.trim());
      setStage('verify');
      setCooldown(30);
    } catch (err) {
      setFailure(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) return setErrors({ code: 'Enter the 6-digit code from your email' });
    setErrors({});
    setLoading(true);
    await delay(800);
    setLoading(false);
    setStage('done');
  };

  if (stage === 'done')
  return (
    <AuthLayout>
        <div className="py-4 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-400/15 dark:text-green-300"><CircleCheckIcon className="h-6 w-6" aria-hidden /></span>
          <h2 className="mt-4 text-2xl font-semibold text-ink">You're all set, {name.split(' ')[0]}!</h2>
          <p className="mt-1 text-sm text-muted">Your demo account is ready. Let's add your first application.</p>
          <Button className="mt-6 h-11 w-full" onClick={() => {enterDemo();nav('/app');}}>Go to Dashboard</Button>
        </div>
      </AuthLayout>);


  if (stage === 'verify')
  return (
    <AuthLayout>
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary dark:text-indigo-300"><MailCheckIcon className="h-5 w-5" aria-hidden /></span>
          <h2 className="mt-4 text-2xl font-semibold text-ink">Verify your email</h2>
          <p className="mt-1 text-sm text-muted">We'd send a 6-digit code to <span className="font-medium text-ink">{email}</span>.</p>
        </div>
        <form onSubmit={verify} noValidate className="mt-6 space-y-4">
          <Field label="Verification code" htmlFor="code" error={errors.code}>
            <input id="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" className={cn(inputCls, 'h-12 text-center text-lg tracking-[0.5em]', errors.code && 'border-rose-400')} />
          </Field>
          <Button type="submit" loading={loading} className="h-11 w-full">Verify Email</Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted">
          Didn't get it?{' '}
          <button disabled={cooldown > 0} onClick={() => setCooldown(30)} className="font-medium text-primary hover:underline disabled:text-muted disabled:no-underline dark:text-indigo-300">{cooldown ? `Resend in ${cooldown}s` : 'Resend code'}</button>
        </p>
        <p className="mt-6 flex gap-2 rounded-xl bg-subtle/70 p-3 text-xs text-muted"><InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />Demo mode: no email is actually sent. Enter any 6 digits to continue.</p>
      </AuthLayout>);


  return (
    <AuthLayout>
      <div className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary dark:text-indigo-300"><UserPlusIcon className="h-5 w-5" aria-hidden /></span>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">Create your account</h2>
        <p className="mt-1 text-sm text-muted">Start organizing your job search in minutes.</p>
      </div>
      {failure && <p className="mt-6 flex gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-400/10 dark:text-rose-300" role="alert"><CircleAlertIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{failure}</p>}
      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        <Field label="Full name" htmlFor="r-name" error={errors.name}>
          <input id="r-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={cn(inputCls, 'h-11', errors.name && 'border-rose-400')} />
        </Field>
        <Field label="Email address" htmlFor="r-email" error={errors.email}>
          <input id="r-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={cn(inputCls, 'h-11', errors.email && 'border-rose-400')} />
        </Field>
        <Field label="Password" htmlFor="r-pass" error={errors.password}>
          <PasswordInput id="r-pass" value={password} onChange={setPassword} invalid={!!errors.password} autoComplete="new-password" />
        </Field>
        <ul className="grid grid-cols-2 gap-x-3 gap-y-1" aria-label="Password requirements">
          {RULES.map(([label, f]) => {
            const ok = f(password);
            return <li key={label} className={cn('flex items-center gap-1.5 text-xs transition', ok ? 'text-green-600 dark:text-green-400' : 'text-muted')}>{ok ? <CheckIcon className="h-3.5 w-3.5" aria-hidden /> : <CircleIcon className="h-3 w-3" aria-hidden />}{label}</li>;
          })}
        </ul>
        <Field label="Confirm password" htmlFor="r-confirm" error={errors.confirm}>
          <PasswordInput id="r-confirm" value={confirm} onChange={setConfirm} invalid={!!errors.confirm} autoComplete="new-password" />
        </Field>
        <div>
          <label className="flex items-start gap-2 text-sm text-muted">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-4 w-4 rounded accent-[#4F46E5]" />
            <span>I accept the <a href="/#security" className="font-medium text-primary hover:underline dark:text-indigo-300">Terms</a> and <a href="/#security" className="font-medium text-primary hover:underline dark:text-indigo-300">Privacy Policy</a></span>
          </label>
          {errors.terms && <p className="mt-1 text-xs text-rose-600" role="alert">{errors.terms}</p>}
        </div>
        <Button type="submit" loading={loading} className="h-11 w-full">{loading ? 'Creating account…' : 'Create My Account'}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">Already have an account? <Link to="/login" className="font-medium text-primary hover:underline dark:text-indigo-300">Sign in</Link></p>
    </AuthLayout>);

}