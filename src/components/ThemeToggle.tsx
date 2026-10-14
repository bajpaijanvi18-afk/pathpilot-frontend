import React from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { cn } from '../utils/styles';

export function ThemeToggle({ className }: {className?: string;}) {
  const { theme, setTheme } = useStore();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light theme' : 'Dark theme'}
      className={cn('flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-subtle hover:text-ink', className)}>
      
      {dark ? <SunIcon className="h-[18px] w-[18px]" /> : <MoonIcon className="h-[18px] w-[18px]" />}
    </button>);

}