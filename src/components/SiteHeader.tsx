import { useEffect, useState } from 'react';
import { ArrowUpRight, Droplet, Menu, Shield, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import type { Theme } from '../lib/theme';

export type PageId = 'home' | 'prototype';

export type NavLink = { label: string; section: string };

type SiteHeaderProps = {
  page: PageId;
  links: NavLink[];
  theme: Theme;
  onToggleTheme: () => void;
  onNavigate: (page: PageId, section?: string) => void;
};

export default function SiteHeader({ page, links, theme, onToggleTheme, onNavigate }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (target: PageId, section?: string) => {
    setOpen(false);
    onNavigate(target, section);
  };

  const otherPage: PageId = page === 'home' ? 'prototype' : 'home';
  const otherLabel = page === 'home' ? 'Protótipo LoRa' : 'Visão geral';

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'border-line/80 bg-surface/85 backdrop-blur-xl'
          : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <button
          type="button"
          onClick={() => go('home')}
          className="flex items-center gap-2.5 text-left"
          aria-label="W-Guard — início"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-blue-500 text-white shadow-lg shadow-brand-500/25">
            <Shield className="h-[18px] w-[18px]" strokeWidth={2.4} />
            <span className="absolute -right-0.5 -bottom-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-surface bg-surface-2">
              <Droplet className="h-2.5 w-2.5 text-brand-400" strokeWidth={2.6} />
            </span>
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[15px] font-extrabold tracking-tight text-ink-strong">W-GUARD</span>
            <span className="mt-1 font-mono text-[8.5px] font-bold tracking-[0.22em] text-brand-400">SMART WATER IoT</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <button
              key={link.section}
              type="button"
              onClick={() => go(page, link.section)}
              className="rounded-lg px-3 py-2 text-[13px] font-semibold text-ink-muted transition-colors hover:bg-panel-2 hover:text-ink-strong"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => go(otherPage)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              page === 'home'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600'
                : 'border border-line bg-panel-2 text-ink hover:border-line-strong hover:text-ink-strong'
            }`}
          >
            {otherLabel}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-lg border border-line bg-panel-2 p-2 text-ink-muted"
            aria-expanded={open}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="animate-fade-in border-t border-line bg-surface/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-4">
            {links.map((link) => (
              <button
                key={link.section}
                type="button"
                onClick={() => go(page, link.section)}
                className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-ink-muted hover:bg-panel-2 hover:text-ink-strong"
              >
                {link.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => go(otherPage)}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-bold text-white"
            >
              {otherLabel}
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
