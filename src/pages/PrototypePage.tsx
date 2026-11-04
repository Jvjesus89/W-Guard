import { useState } from 'react';
import {
  ArrowRight,
  BatteryCharging,
  Boxes,
  CircuitBoard,
  Cpu,
  Droplets,
  Gauge,
  Layers,
  Radio,
  Radar,
  ShieldCheck,
  Waves,
  Wind,
} from 'lucide-react';
import ExplodedSection from '../components/ExplodedSection';
import TelemetrySection from '../components/TelemetrySection';
import NetworkSection from '../components/NetworkSection';
import SpecsSection from '../components/SpecsSection';
import BomSection from '../components/BomSection';
import { METER_PARTS, type MeterPartId } from '../data/meter';
import type { PageId } from '../components/SiteHeader';
import type { Theme } from '../lib/theme';

type PrototypePageProps = {
  theme: Theme;
  onNavigate: (page: PageId, section?: string) => void;
};

const METRICS = [
  { value: '433', unit: 'MHz', label: 'LoRa ISM', hint: 'SX1278 · +20 dBm' },
  { value: '11', unit: 'bytes', label: 'Payload por uplink', hint: 'CRC-8 incluso' },
  { value: '≈25', unit: 'µA', label: 'Deep sleep', hint: 'alvo de firmware' },
  { value: '≥18', unit: 'meses', label: 'Autonomia estimada', hint: 'com harvesting' },
];

const PRINCIPLES = [
  {
    icon: Gauge,
    title: 'Vazão por pulsos',
    text: 'O YF-S201 gera um pulso a cada 2,2 mL que passa pela turbina. O ESP32 conta as interrupções e converte em L/min com média móvel.',
    tag: '~450 pulsos/L',
  },
  {
    icon: Wind,
    title: 'Ar por condutividade',
    text: 'Dois eletrodos de inox medem a condutividade da água. Quando o valor cai abaixo do limiar, o firmware marca a flags de ar — sem cobrar o que não é água.',
    tag: '10 kΩ pull-down',
  },
  {
    icon: BatteryCharging,
    title: 'Energia do próprio fluxo',
    text: 'Um minigerador F50-5V em série com a tubulação carrega duas células 18650 via TP4056. Sem fluxo, o sistema dorme e a bateria dura meses.',
    tag: '5 V · TP4056',
  },
  {
    icon: Radar,
    title: 'Enlace LoRa direto',
    text: 'O SX1278 transmite em 433 MHz com +20 dBm para um receptor dentro de casa. O alcance atravessa muros e dispensa internet no registro.',
    tag: 'P2P · 433 MHz',
  },
];

export default function PrototypePage({ theme, onNavigate }: PrototypePageProps) {
  const [selected, setSelected] = useState<MeterPartId | null>('pcb');

  const focusPart = (id: MeterPartId) => {
    setSelected(id);
    const target = document.getElementById('exploded');
    if (!target) return;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY + 10, behavior: 'smooth' });
  };

  return (
    <main>
      {/* ------------------------------------------------------------ hero */}
      <section className="relative overflow-hidden px-4 pt-12 pb-16 md:px-8">
        <div className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-80" />
        <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-brand-500/10 blur-[140px]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-[10px] font-bold tracking-wider text-brand-400 uppercase">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-400" />
                </span>
                PoC v1.0 · fase de testes
              </span>
              <span className="rounded-full border border-line bg-panel px-3 py-1 font-mono text-[10px] text-ink-muted">
                hardware aberto
              </span>
            </div>

            <h1 className="mt-6 font-display text-4xl leading-[1.05] font-extrabold tracking-tight text-ink-strong sm:text-5xl lg:text-[3.9rem]">
              Hidrômetro inteligente <span className="text-gradient-cyan-blue">LoRa</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted">
              Mede a vazão, identifica ar na tubulação e transmite telemetria por rádio de 433 MHz — alimentado pela
              própria água que passa. Uma vista explodida de cada camada, do Tê de PVC ao pacote de energia.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => focusPart('pcb')}
                className="group flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-600"
              >
                <Layers className="h-4 w-4" />
                Explorar vista explodida
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => onNavigate('prototype', 'telemetry')}
                className="flex items-center gap-2 rounded-xl border border-line bg-panel px-5 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-line-strong"
              >
                <Waves className="h-4 w-4 text-brand-400" />
                Ver telemetria
              </button>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-2 gap-6 border-t border-line pt-6 sm:grid-cols-4">
              {METRICS.map((metric) => (
                <div key={metric.label}>
                  <p className="font-display text-2xl font-extrabold text-ink-strong">
                    {metric.value}
                    <span className="ml-1 text-[11px] font-semibold text-brand-400">{metric.unit}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-ink">{metric.label}</p>
                  <p className="text-[10px] text-ink-subtle">{metric.hint}</p>
                </div>
              ))}
            </div>
          </div>

          {/* pilha de camadas */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl border border-line bg-panel/80 p-5 shadow-card backdrop-blur">
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/50 to-transparent" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-brand-400" />
                  <span className="label-mono text-[9px] text-ink-muted">Camadas do dispositivo</span>
                </div>
                <span className="font-mono text-[10px] text-ink-subtle">05</span>
              </div>

              <div className="mt-4 space-y-2">
                {[...METER_PARTS].sort((a, b) => b.order - a.order).map((part) => (
                  <button
                    key={part.id}
                    type="button"
                    onClick={() => focusPart(part.id)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-line bg-surface-2/70 p-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-line-strong"
                  >
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border font-mono text-[10px] font-bold"
                      style={{ borderColor: `${part.accent}55`, backgroundColor: `${part.accent}16`, color: `color-mix(in oklab, ${part.accent} 55%, var(--ink-strong))` }}
                    >
                      0{part.order}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-ink-strong">{part.name}</span>
                      <span className="block truncate text-[10px] text-ink-subtle">{part.role}</span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-brand-400" />
                  </button>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-surface-2/50 px-3 py-2">
                <span className="flex items-center gap-1.5 font-mono text-[9px] text-ink-subtle">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" /> IP65 · 1/2" BSP
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[9px] text-ink-subtle">
                  <CircuitBoard className="h-3 w-3 text-brand-400" /> ESP32 + SX1278
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- princípios */}
      <section id="device" className="relative border-t border-line px-4 py-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="label-mono text-brand-400">Como funciona</span>
              <h2 className="mt-2 font-display text-2xl font-bold text-ink-strong md:text-3xl">
                Quatro decisões de engenharia
              </h2>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-ink-muted">
              O protótipo evita componentes caros: um sensor de fluxo de R$ 40, dois eletrodos e um gerador de
              passagem resolvem medição, detecção de ar e energia.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map((item, index) => (
              <article
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border border-line bg-panel p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-line-strong"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/10 text-brand-400">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-[10px] text-ink-subtle">0{index + 1}</span>
                </div>
                <h3 className="mt-4 text-sm font-bold text-ink-strong">{item.title}</h3>
                <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">{item.text}</p>
                <span className="mt-4 inline-block rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-[9px] text-ink">
                  {item.tag}
                </span>
              </article>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-panel px-5 py-4">
            <span className="flex items-center gap-2 text-[11px] text-ink-muted">
              <Droplets className="h-4 w-4 text-blue-400" /> 1/2" BSP
            </span>
            <span className="h-3 w-px bg-line" />
            <span className="flex items-center gap-2 text-[11px] text-ink-muted">
              <Cpu className="h-4 w-4 text-brand-400" /> ESP32 dual-core
            </span>
            <span className="h-3 w-px bg-line" />
            <span className="flex items-center gap-2 text-[11px] text-ink-muted">
              <Radio className="h-4 w-4 text-teal-400" /> SX1278 433 MHz
            </span>
            <span className="h-3 w-px bg-line" />
            <span className="flex items-center gap-2 text-[11px] text-ink-muted">
              <BatteryCharging className="h-4 w-4 text-amber-400" /> 2× 18650
            </span>
            <span className="ml-auto font-mono text-[9px] text-ink-subtle">protótipo funcional · bancada</span>
          </div>
        </div>
      </section>

      <ExplodedSection theme={theme} selected={selected} onSelect={setSelected} />
      <TelemetrySection />
      <NetworkSection />
      <SpecsSection />
      <BomSection />
    </main>
  );
}
