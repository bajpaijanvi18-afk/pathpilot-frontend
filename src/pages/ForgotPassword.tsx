import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, KeyRoundIcon, MailIcon } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { Button, Field } from '../components/ui';
import { cn, inputCls } from '../utils/styles';
import { delay } from '../utils/format';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError('Enter a valid email address');
    setError('');
    setLoading(true);
    await delay(900);
    setLoading(false);
    setSent(true);
  };

  return (
    <AuthLayout>
      <div className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary dark:text-indigo-300">{sent ? <MailIcon className="h-5 w-5" aria-hidden /> : <KeyRoundIcon className="h-5 w-5" aria-hidden />}</span>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-ink">{sent ? 'Check your inbox' : 'Reset your password'}</h2>
        <p className="mt-1 text-sm text-muted">{sent ? `If an account exists for ${email}, you'll receive reset instructions shortly.` : "Enter the email you signed up with and we'll send reset instructions."}</p>
      </div>
      {sent ?
      <div className="mt-6 space-y-3">
          <p className="rounded-xl bg-subtle/70 p-3 text-xs text-muted">Demo mode: no email is sent because the authentication provider isn't connected.</p>
          <Button variant="secondary" className="h-11 w-full" onClick={() => setSent(false)}>Use a different email</Button>
        </div> :

      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
          <Field label="Registered email address" htmlFor="fp-email" error={error}>
            <input id="fp-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={cn(inputCls, 'h-11', error && 'border-rose-400')} />
          </Field>
          <Button type="submit" loading={loading} className="h-11 w-full">Send Reset Instructions</Button>
        </form>
      }
      <Link to="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-muted hover:text-ink"><ArrowLeftIcon className="h-4 w-4" aria-hidden /> Back to sign in</Link>
    </AuthLayout>);

}