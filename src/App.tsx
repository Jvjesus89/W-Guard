import { useCallback, useEffect, useRef, useState } from 'react';
import SiteHeader, { type NavLink, type PageId } from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import HomePage from './pages/HomePage';
import PrototypePage from './pages/PrototypePage';
import { useTheme } from './lib/theme';

const NAV: Record<PageId, NavLink[]> = {
  home: [
    { label: 'Entregas', section: 'features' },
    { label: 'Simulador', section: 'simulator' },
    { label: 'Documento TAP', section: 'tap' },
    { label: 'Equipe', section: 'team' },
  ],
  prototype: [
    { label: 'Dispositivo', section: 'device' },
    { label: 'Vista explodida', section: 'exploded' },
    { label: 'Telemetria', section: 'telemetry' },
    { label: 'Rede', section: 'network' },
    { label: 'Especificações', section: 'specs' },
    { label: 'Materiais', section: 'bom' },
  ],
};

function pageFromHash(): PageId {
  return window.location.hash.startsWith('#/prototipo') ? 'prototype' : 'home';
}

export default function App() {
  const [page, setPage] = useState<PageId>(pageFromHash);
  const { theme, toggle } = useTheme();
  const pendingSection = useRef<string | null>(null);

  const scrollToSection = useCallback((section?: string) => {
    if (!section) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = document.getElementById(section);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 74;
    window.scrollTo({ top, behavior: 'smooth' });
  }, []);

  const navigate = useCallback(
    (target: PageId, section?: string) => {
      if (target === page) {
        scrollToSection(section);
        return;
      }
      pendingSection.current = section ?? null;
      window.location.hash = target === 'prototype' ? '/prototipo' : '/';
      setPage(target);
    },
    [page, scrollToSection],
  );

  useEffect(() => {
    const onHashChange = () => setPage(pageFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Scroll to the requested section once the new page has painted.
  useEffect(() => {
    if (pendingSection.current === null) return;
    const section = pendingSection.current;
    pendingSection.current = null;
    const id = window.setTimeout(() => scrollToSection(section), 80);
    return () => window.clearTimeout(id);
  }, [page, scrollToSection]);

  return (
    <div className="min-h-screen bg-surface font-sans text-ink">
      <SiteHeader
        page={page}
        links={NAV[page]}
        theme={theme}
        onToggleTheme={toggle}
        onNavigate={navigate}
      />
      {page === 'home' ? (
        <HomePage onNavigate={navigate} onScrollTo={scrollToSection} />
      ) : (
        <PrototypePage theme={theme} onNavigate={navigate} />
      )}
      <SiteFooter onNavigate={navigate} />
    </div>
  );
}
