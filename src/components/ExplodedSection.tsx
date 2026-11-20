import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { Box, ChevronRight, Layers, MousePointerClick, MoveVertical, Rotate3d, X } from 'lucide-react';
const MeterScene = lazy(() => import('./MeterScene'));
import { METER_PARTS, type MeterPartId } from '../data/meter';
import type { Theme } from '../lib/theme';

type ExplodedSectionProps = {
  theme: Theme;
  selected: MeterPartId | null;
  onSelect: (id: MeterPartId | null) => void;
};

export default function ExplodedSection({ theme, selected, onSelect }: ExplodedSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const [percent, setPercent] = useState(0);

  const part = METER_PARTS.find((item) => item.id === selected) ?? null;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, rect.height - window.innerHeight);
      const raw = Math.min(1, Math.max(0, -rect.top / distance));
      progressRef.current = raw;
      const next = Math.round(raw * 100);
      setPercent((current) => (current === next ? current : next));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const scrollToStage = useCallback((value: 0 | 1) => {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const distance = rect.height - window.innerHeight;
    window.scrollTo({ top: value === 0 ? top : top + distance, behavior: 'smooth' });
  }, []);

  return (
    <section
      id="exploded"
      ref={sectionRef}
      className="relative border-t border-line bg-surface-2/50"
      style={{ height: '260vh' }}
    >
      <div className="sticky top-16 h-[calc(100svh-4rem)] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 grid-bg-plain opacity-40" />
        <div className="relative mx-auto flex h-full max-w-[1500px] flex-col lg:grid lg:grid-cols-12">
          {/* ------------------------------------------------ palco 3D */}
          <div className="relative min-h-0 flex-1 lg:col-span-8 lg:h-full">
            <div className="absolute inset-0">
              <Suspense
                fallback={
                  <div className="flex h-full items-center justify-center">
                    <span className="font-mono text-[10px] tracking-widest text-ink-subtle uppercase">
                      carregando renders...
                    </span>
                  </div>
                }
              >
                <MeterScene theme={theme} selected={selected} onSelect={onSelect} progressRef={progressRef} />
              </Suspense>
            </div>

            {/* etiqueta superior */}
            <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 md:p-6">
              <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-line bg-panel/80 px-3 py-1.5 backdrop-blur">
                <Layers className="h-3.5 w-3.5 text-brand-400" />
                <span className="label-mono text-[9px] text-ink-muted">Vista explodida</span>
                <span className="font-mono text-[10px] font-semibold text-ink-strong tabular">{percent}%</span>
              </div>
              <div className="pointer-events-auto hidden items-center gap-1.5 rounded-full border border-line bg-panel/80 px-3 py-1.5 text-[10px] text-ink-subtle backdrop-blur md:flex">
                <MousePointerClick className="h-3.5 w-3.5" />
                clique numa peça
                <span className="mx-1 h-3 w-px bg-line" />
                <Rotate3d className="h-3.5 w-3.5" />
                arraste para girar
                <span className="mx-1 h-3 w-px bg-line" />
                <MoveVertical className="h-3.5 w-3.5" />
                role para explodir
              </div>
            </div>

            {/* controles */}
            <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 p-4 md:p-6">
              <div className="flex items-end justify-between gap-3">
                <div className="hide-scrollbar flex max-w-full items-center gap-1.5 overflow-x-auto rounded-2xl border border-line bg-panel/75 p-1.5 backdrop-blur">
                  {[...METER_PARTS].sort((a, b) => b.order - a.order).map((item) => {
                    const active = selected === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelect(item.id)}
                        className={`flex shrink-0 items-center gap-2 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold transition-all ${
                          active
                            ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                            : 'text-ink-muted hover:bg-panel-2 hover:text-ink-strong'
                        }`}
                      >
                        <span
                          className="flex h-4 w-4 items-center justify-center rounded-full font-mono text-[9px]"
                          style={{
                            backgroundColor: active ? 'rgba(255,255,255,0.22)' : `${item.accent}22`,
                            color: active ? '#fff' : `color-mix(in oklab, ${item.accent} 55%, var(--ink-strong))`,
                          }}
                        >
                          {item.order}
                        </span>
                        <span className="hidden sm:inline">{item.name}</span>
                        <span className="sm:hidden">{item.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="hidden shrink-0 items-center gap-1 rounded-xl border border-line bg-panel/75 p-1 backdrop-blur sm:flex">
                  <button
                    type="button"
                    onClick={() => scrollToStage(0)}
                    className="rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-ink-muted hover:bg-panel-2 hover:text-ink-strong"
                  >
                    Montar
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToStage(1)}
                    className="rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-brand-400 hover:bg-panel-2"
                  >
                    Explodir
                  </button>
                </div>
              </div>
            </div>

            {/* barra de progresso */}
            <div className="pointer-events-none absolute top-0 left-0 h-full w-1 bg-line/40">
              <div className="w-full bg-gradient-to-b from-brand-400 to-blue-500" style={{ height: `${percent}%` }} />
            </div>
          </div>

          {/* ------------------------------------------------ painel */}
          <aside className="relative flex h-[42%] min-h-0 shrink-0 flex-col border-t border-line bg-panel/85 backdrop-blur-xl lg:col-span-4 lg:h-full lg:border-t-0 lg:border-l">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div className="flex items-center gap-2">
                <Box className="h-4 w-4 text-brand-400" />
                <span className="label-mono text-[9px] text-ink-subtle">
                  {part ? `Camada ${String(part.order).padStart(2, '0')} / 06` : 'Detalhes da camada'}
                </span>
              </div>
              {part && (
                <button
                  type="button"
                  onClick={() => onSelect(null)}
                  className="rounded-md p-1.5 text-ink-subtle hover:bg-panel-2 hover:text-ink"
                  aria-label="Limpar seleção"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="hide-scrollbar flex-1 overflow-y-auto px-5 py-5">
              {part ? (
                <div key={part.id} className="animate-fade-in">
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-mono text-xs font-bold"
                      style={{ borderColor: `${part.accent}55`, backgroundColor: `${part.accent}18`, color: part.accent }}
                    >
                      {String(part.order).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-bold text-ink-strong">{part.name}</h3>
                      <p className="mt-0.5 text-[11px] font-semibold tracking-wide text-brand-400">{part.role}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-ink-muted">{part.description}</p>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {part.badges.map((badge) => (
                      <span
                        key={badge}
                        className="rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-[10px] font-semibold text-ink"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  <dl className="mt-6 divide-y divide-line-soft border-y border-line">
                    {part.specs.map((spec) => (
                      <div key={spec.label} className="flex items-baseline justify-between gap-4 py-2.5">
                        <dt className="text-[11px] text-ink-subtle">{spec.label}</dt>
                        <dd className="text-right font-mono text-[11px] font-medium text-ink-strong">{spec.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-6">
                    <h4 className="label-mono text-[9px] text-ink-subtle">Componentes desta camada</h4>
                    <ul className="mt-2 space-y-1.5">
                      {part.bom.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-[11px] text-ink-muted">
                          <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-brand-400" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col justify-center">
                  <div className="rounded-2xl border border-dashed border-line bg-surface-2/60 p-6 text-center">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-500/25 bg-brand-500/10 text-brand-400">
                      <MousePointerClick className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 font-display text-base font-bold text-ink-strong">
                      Clique em qualquer componente do modelo 3D
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                      Cada camada traz as especificações de hardware, o papel funcional e os itens da lista de
                      materiais que a compõem.
                    </p>
                  </div>
                  <div className="mt-6 space-y-1">
                    {METER_PARTS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelect(item.id)}
                        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-panel-2"
                      >
                        <span className="font-mono text-[10px] text-ink-subtle">{String(item.order).padStart(2, '0')}</span>
                        <span className="flex-1 text-xs font-medium text-ink">{item.name}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-ink-subtle" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-line px-5 py-3">
              <p className="font-mono text-[9px] leading-relaxed text-ink-subtle">
                Componentes e medidas conforme a lista de materiais do projeto extensionista. Imagens
                renderizadas no Blender.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
