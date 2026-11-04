import { ArrowRight, Droplet, Eye, FileText, Globe, Radio, Shield } from 'lucide-react';
import TAPViewer from '../components/TAPViewer';
import InteractiveSimulator from '../components/InteractiveSimulator';
import ProductFeatures from '../components/ProductFeatures';
import TeamSection from '../components/TeamSection';
import type { PageId } from '../components/SiteHeader';

type HomePageProps = {
  onNavigate: (page: PageId, section?: string) => void;
  onScrollTo: (section: string) => void;
};

export default function HomePage({ onNavigate, onScrollTo }: HomePageProps) {
  return (
    <main>
      {/* Hero Section */}
      <section className="page-glow relative overflow-hidden px-4 pt-10 pb-24 md:px-8">
        <div className="absolute inset-0 -z-10 grid-bg opacity-70" />
        <div className="absolute top-1/3 left-10 -z-10 h-96 w-96 rounded-full bg-brand-500/10 blur-[140px]" />
        <div className="absolute right-6 bottom-10 -z-10 h-96 w-96 rounded-full bg-blue-500/10 blur-[140px]" />

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-12">
          <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-[11px] font-bold tracking-wider text-brand-400 uppercase">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-400" />
              </span>
              IoT &amp; Cidades Inteligentes
            </span>
            <h1 className="mb-6 font-display text-4xl leading-[1.08] font-extrabold tracking-tight text-ink-strong sm:text-5xl">
              Saneamento inteligente e <br />
              <span className="text-gradient-cyan-blue">autossustentabilidade</span>
            </h1>
            <p className="mb-8 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
              O W-Guard é um ecossistema IoT modular projetado para proteger consumidores contra cobranças
              indevidas de ar na tubulação, detectar vazamentos em tempo real e atuar preventivamente em bueiros
              urbanos para evitar enchentes.
            </p>

            <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
              <button
                onClick={() => onScrollTo('simulator')}
                className="group flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-brand-500/25 transition-all duration-300 hover:bg-brand-600"
              >
                Simulador interativo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => onNavigate('prototype')}
                className="flex items-center justify-center gap-2 rounded-xl border border-line bg-panel px-6 py-4 text-sm font-semibold text-ink transition-all duration-300 hover:border-line-strong hover:text-ink-strong"
              >
                <Radio className="h-4 w-4 text-brand-400" />
                Protótipo LoRa 3D
              </button>
            </div>

            <div className="mt-16 grid w-full grid-cols-2 gap-6 border-t border-line pt-8 md:grid-cols-4">
              <div>
                <span className="block font-display text-2xl font-extrabold text-brand-400 md:text-3xl">100%</span>
                <span className="text-xs text-ink-subtle">Proteção de erro por ar</span>
              </div>
              <div>
                <span className="block font-display text-2xl font-extrabold text-blue-400 md:text-3xl">&gt;95%</span>
                <span className="text-xs text-ink-subtle">Precisão da medição</span>
              </div>
              <div>
                <span className="block font-display text-2xl font-extrabold text-teal-400 md:text-3xl">LoRa</span>
                <span className="text-xs text-ink-subtle">Até 500 m de alcance</span>
              </div>
              <div>
                <span className="block font-display text-2xl font-extrabold text-emerald-400 md:text-3xl">Clean</span>
                <span className="text-xs text-ink-subtle">Autonomia hidráulica</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center lg:col-span-5">
            <div className="relative flex h-80 w-80 animate-float items-center justify-center rounded-full border border-brand-500/20 bg-gradient-to-tr from-brand-500/20 to-blue-500/10 shadow-2xl shadow-brand-500/5 sm:h-96 sm:w-96">
              <div className="absolute inset-4 animate-[spin_40s_linear_infinite] rounded-full border border-dashed border-brand-500/30" />
              <div className="relative flex h-64 w-64 flex-col items-center justify-center overflow-hidden rounded-full border border-line bg-surface/85 p-6 text-center shadow-inner">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-500/5 to-transparent" />
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-brand-500/25 bg-brand-500/10 text-brand-400 shadow-lg shadow-brand-500/5">
                  <Droplet className="h-9 w-9 animate-pulse" />
                </div>
                <h3 className="font-display text-lg font-extrabold text-ink-strong">W-GUARD v1.0</h3>
                <p className="mt-1 font-mono text-[10px] font-bold tracking-widest text-brand-400 uppercase">
                  Smart IoT Node
                </p>
                <p className="mt-3 max-w-[180px] text-xs text-ink-muted">
                  Medição hídrica residencial e urbana autossustentável.
                </p>
                <div className="mt-4 flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[9px] font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-emerald-400" />
                  SISTEMA ONLINE
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ProductFeatures />
      <InteractiveSimulator />
      <TAPViewer />
      <TeamSection />

      {/* Prototype teaser */}
      <section className="px-4 py-16 md:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-line bg-panel shadow-card">
          <div className="relative grid gap-8 p-8 md:grid-cols-12 md:p-12">
            <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
            <div className="md:col-span-8">
              <span className="label-mono text-brand-400">Nova página · Engenharia de hardware</span>
              <h2 className="mt-3 font-display text-2xl font-bold text-ink-strong md:text-3xl">
                Conheça o hidrômetro inteligente LoRa em detalhe
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
                Vista explodida interativa de cada camada do protótipo, telemetria simulada dos pacotes LoRa,
                diagrama de conectividade e a lista completa de materiais do projeto extensionista.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => onNavigate('prototype')}
                  className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600"
                >
                  <Eye className="h-4 w-4" /> Abrir vista explodida
                </button>
                <button
                  onClick={() => onNavigate('prototype', 'bom')}
                  className="flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-5 py-3 text-xs font-semibold text-ink hover:border-line-strong"
                >
                  <FileText className="h-4 w-4 text-brand-400" /> Lista de materiais
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 md:col-span-4">
              {[
                { label: 'Rádio', value: 'SX1278' },
                { label: 'Frequência', value: '433 MHz' },
                { label: 'MCU', value: 'ESP32' },
                { label: 'Sensor', value: 'YF-S201' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-line bg-surface-2 p-3">
                  <span className="label-mono text-[9px] text-ink-subtle">{item.label}</span>
                  <p className="mt-1 font-mono text-sm font-semibold text-ink-strong">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Academic / Context Banner */}
      <section className="border-t border-line px-4 py-16 md:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-2xl border border-line bg-panel p-8 md:flex-row">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10 text-brand-400">
            <Globe className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-ink-strong">Iniciativa Cidades Inteligentes</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              O W-Guard alinha-se diretamente com os conceitos de <strong className="text-ink">Smart Cities</strong>,
              resolvendo problemas diários tanto no âmbito individual (bloqueando a tarifação injusta de ar na rede e
              detectando vazamentos residenciais) quanto no coletivo (permitindo o monitoramento de bueiros e redes
              pluviais urbanas para a mitigação de inundações).
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 pb-16 md:px-8">
        <Shield className="h-4 w-4 text-brand-400" />
        <p className="text-xs text-ink-subtle">
          Todos os dados de telemetria exibidos no site são simulações do firmware — nenhum dispositivo real está
          publicando na nuvem.
        </p>
      </div>
    </main>
  );
}
