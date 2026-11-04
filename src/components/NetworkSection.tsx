import { Fragment, useState } from 'react';
import { ChevronRight, CircuitBoard, Cpu, Database, Gauge, Globe, Radio, Router, Server, Smartphone, Wifi } from 'lucide-react';

type NodeId = 'node' | 'gateway' | 'server' | 'api' | 'app';

type NodeDef = {
  id: NodeId;
  title: string;
  subtitle: string;
  icon: typeof Cpu;
  protocol: string;
  detail: string;
  specs: { label: string; value: string }[];
};

const NODES: NodeDef[] = [
  {
    id: 'node',
    title: 'Hidrômetro',
    subtitle: 'ESP32 + SX1278',
    icon: Gauge,
    protocol: 'LoRa P2P · 433 MHz',
    detail:
      'Conta pulsos do YF-S201, mede a condutividade dos eletrodos de ar e dorme em deep sleep. Acorda pelo timer, monta o pacote de 11 bytes e transmite com +20 dBm.',
    specs: [
      { label: 'Consumo em sleep', value: '≈ 25 µA' },
      { label: 'Airtime', value: '≈ 66 ms' },
      { label: 'Payload', value: '11 bytes' },
      { label: 'Periodicidade', value: '60 s (padrão)' },
    ],
  },
  {
    id: 'gateway',
    title: 'Receptor',
    subtitle: 'ESP32 + SX1278 + Wi-Fi',
    icon: Router,
    protocol: 'Wi-Fi 2,4 GHz',
    detail:
      'Fica dentro de casa, ligado à tomada. Recebe o quadro LoRa, valida o CRC, publica em MQTT e mantém o último estado em memória para consultas rápidas.',
    specs: [
      { label: 'Enlace de campo', value: 'LoRa 433 MHz' },
      { label: 'Backhaul', value: 'Wi-Fi / Ethernet' },
      { label: 'Buffer offline', value: '512 pacotes' },
      { label: 'Consumo', value: '≈ 0,9 W' },
    ],
  },
  {
    id: 'server',
    title: 'Servidor de rede',
    subtitle: 'Node-RED · InfluxDB',
    icon: Server,
    protocol: 'MQTT sobre TLS',
    detail:
      'Decodifica o payload, aplica as regras de alerta (ar, fluxo reverso, vazamento contínuo) e grava a série temporal. Na versão LoRaWAN, este papel é do ChirpStack/TTN.',
    specs: [
      { label: 'Broker', value: 'Mosquitto' },
      { label: 'Série temporal', value: 'InfluxDB' },
      { label: 'Alertas', value: '3 regras ativas' },
      { label: 'Retenção', value: '90 dias' },
    ],
  },
  {
    id: 'api',
    title: 'API',
    subtitle: 'REST + webhook',
    icon: Database,
    protocol: 'HTTPS / JSON',
    detail:
      'Expõe leituras, comandos de válvula e histórico agregado. O app e o painel público consomem os mesmos endpoints, com autenticação por token.',
    specs: [
      { label: 'Endpoints', value: '/readings · /valve' },
      { label: 'Formato', value: 'JSON' },
      { label: 'Latência alvo', value: '< 400 ms' },
      { label: 'Autenticação', value: 'Bearer token' },
    ],
  },
  {
    id: 'app',
    title: 'App & painel',
    subtitle: 'Consumidor e prefeitura',
    icon: Smartphone,
    protocol: 'WebSocket / push',
    detail:
      'O morador acompanha consumo, recebe alerta de ar e fecha o registro pelo celular. A prefeitura usa o mesmo dado para priorizar manutenção da rede.',
    specs: [
      { label: 'Atualização', value: 'Tempo real (WS)' },
      { label: 'Notificações', value: 'Push + e-mail' },
      { label: 'Comandos', value: 'Abrir / fechar' },
      { label: 'Perfis', value: 'Morador · gestor' },
    ],
  },
];

function DashLine({ vertical = false }: { vertical?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={vertical ? 'h-3 w-px' : 'h-px w-full'}
      style={{
        backgroundImage: vertical
          ? 'repeating-linear-gradient(to bottom, var(--line) 0 4px, transparent 4px 8px)'
          : 'repeating-linear-gradient(to right, var(--line) 0 4px, transparent 4px 8px)',
      }}
    />
  );
}

export default function NetworkSection() {
  const [active, setActive] = useState<NodeId>('node');
  const node = NODES.find((item) => item.id === active) ?? NODES[0];

  return (
    <section id="network" className="relative border-t border-line px-4 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-[11px] font-bold tracking-wider text-brand-400 uppercase">
            <Globe className="h-3.5 w-3.5" /> Conectividade
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-ink-strong md:text-4xl">
            Do registro à nuvem em cinco saltos
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            O protótipo usa um enlace LoRa ponto-a-ponto entre o hidrômetro e um receptor dentro de casa. A versão
            LoRaWAN substitui o receptor por um gateway e move a decodificação para o servidor de rede.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-0 lg:flex-row lg:items-stretch">
          {NODES.map((item, index) => {
            const selected = item.id === active;
            return (
              <Fragment key={item.id}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(item.id)}
                  onFocus={() => setActive(item.id)}
                  onClick={() => setActive(item.id)}
                  className={`group relative flex flex-1 flex-col rounded-2xl border p-4 text-left transition-all duration-300 ${
                    selected
                      ? 'border-brand-500/45 bg-brand-500/[0.07] shadow-soft'
                      : 'border-line bg-panel hover:border-line-strong'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                        selected
                          ? 'border-brand-500/40 bg-brand-500/15 text-brand-400'
                          : 'border-line bg-surface-2 text-ink-muted'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span className="font-mono text-[9px] text-ink-subtle">0{index + 1}</span>
                  </div>
                  <h3 className="mt-3 text-[13px] font-bold text-ink-strong">{item.title}</h3>
                  <p className="text-[10px] text-ink-subtle">{item.subtitle}</p>
                  <p className="mt-2 flex items-center gap-1 font-mono text-[9px] leading-tight font-semibold text-brand-400">
                    <Radio className="h-2.5 w-2.5 shrink-0" />
                    {item.protocol}
                  </p>
                </button>

                {index < NODES.length - 1 && (
                  <div className="flex w-full shrink-0 flex-col items-center justify-center py-1 lg:w-9 lg:py-0">
                    <span className="flex h-3 items-center lg:hidden">
                      <DashLine vertical />
                    </span>
                    <span className="hidden w-full items-center lg:flex">
                      <DashLine />
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 rotate-90 text-ink-subtle lg:rotate-0" />
                    <span className="flex h-3 items-center lg:hidden">
                      <DashLine vertical />
                    </span>
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>

        <div className="mt-4 grid items-start gap-4 lg:grid-cols-12">
          <div className="rounded-2xl border border-line bg-panel p-6 shadow-soft lg:col-span-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-500/10 text-brand-400">
                <node.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-ink-strong">{node.title}</h3>
                <p className="text-[11px] text-ink-subtle">{node.subtitle}</p>
              </div>
              <span className="ml-auto rounded-lg border border-line bg-surface-2 px-2.5 py-1 font-mono text-[10px] text-ink-muted">
                {node.protocol}
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">{node.detail}</p>
            <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {node.specs.map((spec) => (
                <div key={spec.label} className="rounded-xl border border-line-soft bg-surface-2/60 p-3">
                  <dt className="text-[9px] tracking-wide text-ink-subtle uppercase">{spec.label}</dt>
                  <dd className="mt-1 font-mono text-[11px] font-semibold text-ink-strong">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-2xl border border-dashed border-line bg-panel/60 p-6 lg:col-span-4">
            <div className="flex items-center gap-2">
              <CircuitBoard className="h-4 w-4 text-ink-subtle" />
              <h3 className="text-sm font-bold text-ink-strong">Caminho LoRaWAN (v2)</h3>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">
              Troca o enlace P2P por LoRaWAN Classe A na faixa AU915 (902–928 MHz), com gateway e servidor de rede
              (ChirpStack ou TTN).
            </p>
            <ol className="mt-4 space-y-2 text-[11px] text-ink-muted">
              {[
                { icon: Radio, label: 'Nó Classe A · AU915' },
                { icon: Wifi, label: 'Gateway LoRaWAN' },
                { icon: Server, label: 'Network Server' },
                { icon: Globe, label: 'Integração MQTT/HTTP' },
              ].map((step) => (
                <li key={step.label} className="flex items-center gap-2">
                  <step.icon className="h-3.5 w-3.5 text-brand-400" />
                  {step.label}
                </li>
              ))}
            </ol>
            <p className="mt-4 border-t border-line-soft pt-3 font-mono text-[9px] leading-relaxed text-ink-subtle">
              Benefícios: ADR, join seguro (OTAA), duty cycle regulado e roaming entre operadoras.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
