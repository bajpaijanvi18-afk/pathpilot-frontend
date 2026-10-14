import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CircleAlertIcon, InfoIcon, LockIcon, ShieldCheckIcon } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { AuthLayout } from '../components/AuthLayout';
import { Button, Field, PasswordInput } from '../components/ui';
import { cn, inputCls } from '../utils/styles';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Login() {
  const { signIn } = useStore();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{email?: string;password?: string;}>({});
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const errs: typeof errors = {};
    if (!email.trim()) errs.email = 'Enter your email address';else
    if (!EMAIL_RE.test(email.trim())) errs.email = 'Enter a valid email address';
    if (!password) errs.password = 'Enter your password';
    setErrors(errs);
    setAuthError('');
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      nav('/app');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary dark:text-indigo-300"><LockIcon className="h-5 w-5" aria-hidden /></span>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">Welcome Back</h2>
        <p className="mt-1 text-sm text-muted">Sign in to continue your career journey.</p>
      </div>
      {authError &&
      <p className="mt-6 flex gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-400/10 dark:text-rose-300" role="alert"><CircleAlertIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{authError}</p>
      }
      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        <Field label="Email address" htmlFor="login-email" error={errors.email}>
          <input id="login-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-invalid={!!errors.email} className={cn(inputCls, 'h-11', errors.email && 'border-rose-400')} />
        </Field>
        <Field label="Password" htmlFor="login-password" error={errors.password} adornment={<Link to="/forgot-password" className="text-xs font-medium text-primary hover:underline dark:text-indigo-300">Forgot password?</Link>}>
          <PasswordInput id="login-password" value={password} onChange={setPassword} invalid={!!errors.password} autoComplete="current-password" />
        </Field>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded accent-[#4F46E5]" /> Remember me on this device
        </label>
        <Button type="submit" loading={loading} className="h-11 w-full" icon={<ShieldCheckIcon className="h-4 w-4" />}>{loading ? 'Signing in…' : 'Secure Sign In'}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">New to PathPilot? <Link to="/register" className="font-medium text-primary hover:underline dark:text-indigo-300">Create an account</Link></p>
      <p className="mt-6 flex gap-2 rounded-xl bg-subtle/70 p-3 text-xs text-muted"><InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />Demo mode: Amazon Cognito isn't connected, so any valid email and password opens the sample workspace. Use password “wrongpassword” to preview the error state.</p>
    </AuthLayout>);

}