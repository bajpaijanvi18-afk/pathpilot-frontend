import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleAlertIcon, EllipsisIcon, EyeIcon, EyeOffIcon, LoaderCircleIcon, XIcon } from 'lucide-react';
import type { Status } from '../types';
import { cn, inputCls, statusDot, statusStyles } from '../utils/styles';
import { initials } from '../utils/format';

/* ---------- Button ---------- */
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'icon';
  loading?: boolean;
  icon?: React.ReactNode;
};
export function Button({ variant = 'primary', size = 'md', loading, icon, className, children, disabled, type = 'button', ...rest }: ButtonProps) {
  const v = {
    primary: 'bg-primary text-white hover:bg-primary-2 shadow-sm shadow-primary/25',
    secondary: 'bg-card text-ink border border-line hover:bg-subtle',
    ghost: 'text-muted hover:text-ink hover:bg-subtle',
    danger: 'bg-rose-600 text-white hover:bg-rose-700'
  }[variant];
  const s = { sm: 'h-8 px-3 text-xs', md: 'h-10 px-4 text-sm', icon: 'h-9 w-9' }[size];
  return (
    <button
      type={type}
      {...rest}
      disabled={disabled || loading}
      className={cn('inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50', v, s, className)}>
      
      {loading ? <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>);

}

/* ---------- Form field ---------- */
export function Field({ label, htmlFor, error, hint, required, adornment, children, className }: {label: string;htmlFor?: string;error?: string;hint?: string;required?: boolean;adornment?: React.ReactNode;children: React.ReactNode;className?: string;}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
          {label}
          {required && <span className="text-rose-500"> *</span>}
        </label>
        {adornment}
      </div>
      {children}
      {error ?
      <p className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400" role="alert">
          <CircleAlertIcon className="h-3.5 w-3.5" aria-hidden />
          {error}
        </p> :
      hint ?
      <p className="text-xs text-muted">{hint}</p> :
      null}
    </div>);

}

export function PasswordInput({ id, value, onChange, invalid, autoComplete, placeholder }: {id: string;value: string;onChange: (v: string) => void;invalid?: boolean;autoComplete?: string;placeholder?: string;}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input id={id} type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} placeholder={placeholder} aria-invalid={invalid} className={cn(inputCls, 'h-11 pr-11', invalid && 'border-rose-400')} />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-subtle hover:text-ink">
        {show ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
      </button>
    </div>);

}

/* ---------- Display ---------- */
export function StatusBadge({ status, className }: {status: Status;className?: string;}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium', statusStyles[status], className)}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: statusDot[status] }} aria-hidden />
      {status}
    </span>);

}

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('rounded-2xl border border-line bg-card shadow-card', className)} {...rest}>
      {children}
    </div>);

}

const LOGO_COLORS = ['#4F46E5', '#0EA5E9', '#14B8A6', '#F59E0B', '#EC4899', '#8B5CF6', '#10B981', '#EF4444', '#14234B'];
export function CompanyLogo({ name, size = 'md' }: {name: string;size?: 'sm' | 'md' | 'lg';}) {
  const hash = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const s = { sm: 'h-8 w-8 text-[11px] rounded-lg', md: 'h-9 w-9 text-xs rounded-lg', lg: 'h-14 w-14 text-lg rounded-2xl' }[size];
  return (
    <span className={cn('inline-flex shrink-0 items-center justify-center font-semibold text-white', s)} style={{ background: LOGO_COLORS[hash % LOGO_COLORS.length] }} aria-hidden>
      {initials(name) || '?'}
    </span>);

}

export function LogoMark({ className }: {className?: string;}) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-8 w-8', className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#4F46E5" />
      <path d="M7.5 16.2 24.5 8.5l-4.6 16.4-4.9-5.6-7.5-3.1Z" fill="#fff" />
      <path d="m15 19.3 9.5-10.8" stroke="#4F46E5" strokeWidth="1.6" />
      <path d="M6 23.5c2.5-.6 4.6-1.6 6.2-3" stroke="#A5B4FC" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    </svg>);

}

export function Logo({ tagline = true, light = false }: {tagline?: boolean;light?: boolean;}) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className="leading-tight">
        <span className={cn('block text-[15px] font-semibold tracking-tight', light ? 'text-white' : 'text-ink')}>PathPilot</span>
        {tagline && <span className={cn('block text-[11px]', light ? 'text-indigo-200' : 'text-muted')}>Track. Prepare. Get Hired.</span>}
      </span>
    </span>);

}

export function PageHeader({ title, subtitle, actions }: {title: string;subtitle?: string;actions?: React.ReactNode;}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>);

}

export function EmptyState({ icon: Icon, title, text, action }: {icon: React.ElementType;title: string;text: string;action?: React.ReactNode;}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary dark:text-indigo-300">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>);

}

export function Toggle({ checked, onChange, label, description }: {checked: boolean;onChange: (v: boolean) => void;label: string;description?: string;}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3">
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description && <span className="block text-xs text-muted">{description}</span>}
      </span>
      <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={cn('relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-200', checked ? 'bg-primary' : 'bg-line')}>
        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-200', checked ? 'left-[22px]' : 'left-0.5')} />
      </button>
    </label>);

}

export function Tabs<T extends string>({ tabs, value, onChange, className }: {tabs: {id: T;label: string;count?: number;}[];value: T;onChange: (v: T) => void;className?: string;}) {
  return (
    <div role="tablist" className={cn('thin-scroll flex gap-1 overflow-x-auto border-b border-line', className)}>
      {tabs.map((t) =>
      <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)} className={cn('-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors', value === t.id ? 'border-primary text-primary dark:text-indigo-300' : 'border-transparent text-muted hover:text-ink')}>
          {t.label}
          {t.count !== undefined && <span className="rounded-full bg-subtle px-1.5 text-xs text-muted">{t.count}</span>}
        </button>
      )}
    </div>);

}

/* ---------- Modal ---------- */
export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: {open: boolean;onClose: () => void;title: string;description?: string;children: React.ReactNode;footer?: React.ReactNode;size?: 'sm' | 'md' | 'lg';}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current();
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll<HTMLElement>('button:not([disabled]),input,select,textarea,a[href]');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) last.focus(), e.preventDefault();else
        if (!e.shiftKey && document.activeElement === last) first.focus(), e.preventDefault();
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => ref.current?.querySelector<HTMLElement>('input,select,textarea,[data-autofocus]')?.focus(), 60);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      prevFocus?.focus?.();
    };
  }, [open]);
  const w = { sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'sm:max-w-3xl' }[size];
  return createPortal(
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
          <motion.div className="absolute inset-0 bg-slate-950/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.98 }} transition={{ duration: 0.18 }} className={cn('relative flex h-full w-full flex-col bg-card text-ink shadow-pop sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:border sm:border-line', w)}>
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div>
                <h2 id={titleId} className="text-base font-semibold">{title}</h2>
                {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
              </div>
              <button onClick={onClose} aria-label="Close dialog" className="-mr-1 flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-subtle hover:text-ink">
                <XIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
            {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
          </motion.div>
        </div>
      }
    </AnimatePresence>,
    document.body
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete' }: {open: boolean;onClose: () => void;onConfirm: () => void;title: string;message: React.ReactNode;confirmLabel?: string;}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm" footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="danger" onClick={() => {onConfirm();onClose();}}>{confirmLabel}</Button></>}>
      <div className="text-sm text-muted">{message}</div>
    </Modal>);

}

/* ---------- Menu (portal, so it never clips inside scroll containers) ---------- */
export interface MenuItem {label: string;icon?: React.ElementType;onClick: () => void;danger?: boolean;disabled?: boolean;}
export function Menu({ items, label = 'More actions' }: {items: MenuItem[];label?: string;}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<React.CSSProperties>({});
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!open || !btn.current) return;
    const r = btn.current.getBoundingClientRect();
    const up = r.bottom + 48 * items.length + 16 > window.innerHeight;
    setPos({ right: Math.max(8, window.innerWidth - r.right), ...(up ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }) });
  }, [open, items.length]);
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      if (e.type === 'mousedown' && (menu.current?.contains(e.target as Node) || btn.current?.contains(e.target as Node))) return;
      setOpen(false);
    };
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    window.addEventListener('scroll', close, true);
    document.addEventListener('keydown', key);
    setTimeout(() => menu.current?.querySelector<HTMLElement>('button')?.focus(), 20);
    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', close, true);
      document.removeEventListener('keydown', key);
    };
  }, [open]);
  return (
    <>
      <button ref={btn} type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={(e) => {e.stopPropagation();setOpen((o) => !o);}} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-subtle hover:text-ink">
        <EllipsisIcon className="h-4 w-4" />
      </button>
      {open &&
      createPortal(
        <motion.div ref={menu} role="menu" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.12 }} style={pos} className="fixed z-[70] w-52 rounded-xl border border-line bg-card p-1 text-ink shadow-pop"
        onKeyDown={(e) => {
          const btns = [...(menu.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? [])];
          const i = btns.indexOf(document.activeElement as HTMLButtonElement);
          if (e.key === 'ArrowDown') btns[(i + 1) % btns.length]?.focus(), e.preventDefault();
          if (e.key === 'ArrowUp') btns[(i - 1 + btns.length) % btns.length]?.focus(), e.preventDefault();
        }}>
            {items.map((it) =>
          <button key={it.label} role="menuitem" disabled={it.disabled} onClick={(e) => {e.stopPropagation();setOpen(false);it.onClick();}} className={cn('flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition hover:bg-subtle focus:bg-subtle focus:outline-none disabled:opacity-50', it.danger ? 'text-rose-600 dark:text-rose-400' : 'text-ink')}>
                {it.icon && <it.icon className="h-4 w-4 opacity-80" aria-hidden />}
                {it.label}
              </button>
          )}
          </motion.div>,
        document.body
      )}
    </>);

}

export function Skeleton({ className }: {className?: string;}) {
  return <div className={cn('animate-pulse rounded-lg bg-subtle', className)} />;
}