import { Moon, Sun } from 'lucide-react';
import type { Theme } from '../lib/theme';

type ThemeToggleProps = {
  theme: Theme;
  onToggle: () => void;
  className?: string;
};

/** Segmented light/dark switch used on both pages. */
export default function ThemeToggle({ theme, onToggle, className = '' }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
      title={theme === 'light' ? 'Tema escuro' : 'Tema claro'}
      className={`group relative flex h-9 w-16 items-center rounded-full border border-line bg-panel-2 p-1 transition-colors hover:border-line-strong ${className}`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-1 left-1 flex h-7 w-7 items-center justify-center rounded-full bg-surface shadow-soft ring-1 ring-line transition-transform duration-300 ${
          theme === 'light' ? 'translate-x-7' : 'translate-x-0'
        }`}
      >
        {theme === 'light' ? (
          <Sun className="h-4 w-4 text-amber-400" />
        ) : (
          <Moon className="h-4 w-4 text-brand-400" />
        )}
      </span>
      <span className="pointer-events-none flex w-full items-center justify-between px-1.5 text-ink-subtle">
        <Moon className="h-3.5 w-3.5 opacity-60" />
        <Sun className="h-3.5 w-3.5 opacity-60" />
      </span>
    </button>
  );
}
