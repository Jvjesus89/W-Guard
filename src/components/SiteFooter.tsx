import { ArrowUpRight, GitBranch, Mail, Shield } from 'lucide-react';
import type { PageId } from './SiteHeader';

type SiteFooterProps = {
  onNavigate: (page: PageId, section?: string) => void;
};

export default function SiteFooter({ onNavigate }: SiteFooterProps) {
  return (
    <footer className="border-t border-line bg-surface-2/60">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-brand-600 to-blue-500 text-white">
                <Shield className="h-4 w-4" strokeWidth={2.4} />
              </span>
              <span className="font-display text-sm font-extrabold tracking-wide text-ink-strong">W-GUARD</span>
            </div>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-ink-muted">
              Ecossistema IoT de monitoramento hídrico autossustentável. Medição de vazão, detecção de ar na
              tubulação e telemetria LoRa — do registro residencial ao painel de gestão urbana.
            </p>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-subtle">
              Projeto extensionista · Engenharia de Software
            </p>
          </div>

          <div className="md:col-span-3">
            <h4 className="label-mono text-ink-subtle">Navegar</h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="text-ink-muted transition-colors hover:text-brand-400">
                  Visão geral do ecossistema
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('prototype')} className="text-ink-muted transition-colors hover:text-brand-400">
                  Protótipo do hidrômetro LoRa
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home', 'tap')} className="text-ink-muted transition-colors hover:text-brand-400">
                  Termo de Abertura (TAP)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('prototype', 'bom')} className="text-ink-muted transition-colors hover:text-brand-400">
                  Lista de materiais
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="label-mono text-ink-subtle">Documentação</h4>
            <div className="mt-4 space-y-2">
              <a
                href="https://github.com/Jvjesus89/W-Guard"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-panel px-3 py-2.5 text-xs text-ink transition-colors hover:border-line-strong"
              >
                <span className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-ink-muted" />
                  Repositório do projeto
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-ink-subtle" />
              </a>
              <a
                href="mailto:joaovitor@wguard.dev"
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-panel px-3 py-2.5 text-xs text-ink transition-colors hover:border-line-strong"
              >
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-ink-muted" />
                  Contato do gerente do projeto
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-ink-subtle" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-[11px] text-ink-subtle md:flex-row md:items-center md:justify-between">
          <p>© 2026 W-Guard Project · João Vitor de Jesus Souza · Orientação: Prof. André Saraiva</p>
          <p className="font-mono">React 19 · TypeScript · Tailwind CSS v4 · Three.js</p>
        </div>
      </div>
    </footer>
  );
}
