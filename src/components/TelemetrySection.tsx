import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownUp,
  ArrowUpRight,
  BatteryMedium,
  Download,
  Droplets,
  Gauge,
  Radio,
  RefreshCw,
  Signal,
  Waves,
} from 'lucide-react';

type Packet = {
  id: number;
  time: string;
  payload: string;
  rssi: number;
  snr: number;
  airtime: string;
  volume: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function crc8(bytes: number[]) {
  let crc = 0;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x80 ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
    }
  }
  return crc;
}

function buildPayload(flow: number, volume: number, flags: number, battery: number, seq: number) {
  const flowRaw = Math.round(Math.abs(flow) * 100) & 0xffff;
  const volumeRaw = Math.round(volume) >>> 0;
  const bytes = [
    (flowRaw >> 8) & 0xff,
    flowRaw & 0xff,
    (volumeRaw >>> 24) & 0xff,
    (volumeRaw >>> 16) & 0xff,
    (volumeRaw >>> 8) & 0xff,
    volumeRaw & 0xff,
    flags,
    battery,
    (seq >> 8) & 0xff,
    seq & 0xff,
  ];
  bytes.push(crc8(bytes));
  return bytes.map((byte) => byte.toString(16).padStart(2, '0').toUpperCase()).join(' ');
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function TelemetrySection() {
  const [flow, setFlow] = useState(7.4);
  const [volume, setVolume] = useState(128_420);
  const [battery, setBattery] = useState(94);
  const [rssi, setRssi] = useState(-95);
  const [snr, setSnr] = useState(8.5);
  const [leak, setLeak] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [uplink, setUplink] = useState(30);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [seq, setSeq] = useState(1024);
  const [history, setHistory] = useState<number[]>(() =>
    Array.from({ length: 48 }, (_, index) => Number((5.4 + Math.sin(index / 6) * 2.1 + Math.random() * 1.6).toFixed(2))),
  );

  const seqRef = useRef(seq);
  seqRef.current = seq;
  const metrics = useRef({ flow, volume, battery, rssi, snr, leak, reverse });
  metrics.current = { flow, volume, battery, rssi, snr, leak, reverse };

  // amostragem: 1 Hz
  useEffect(() => {
    const id = window.setInterval(() => {
      setHistory((current) => {
        const last = current[current.length - 1] ?? 5;
        const base = metrics.current.leak
          ? 8.4
          : reverse
            ? 3.1
            : 6 + Math.sin(Date.now() / 9000) * 2.6;
        const next = clamp(last * 0.68 + base * 0.32 + (Math.random() - 0.5) * 2.6, 0, 18);
        return [...current.slice(1), next];
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [reverse]);

  // estado contínuo
  useEffect(() => {
    const id = window.setInterval(() => {
      const current = metrics.current;
      const nextFlow = current.leak
        ? 8.2 + Math.random() * 0.8
        : current.reverse
          ? -(2.8 + Math.random() * 0.9)
          : Math.max(0, current.flow * 0.75 + (Math.random() * 9 + 1.4) * 0.25 + (Math.random() - 0.5) * 1.2);
      setFlow(nextFlow);
      setVolume((value) => value + Math.abs(nextFlow) / 60);
      setBattery((value) => clamp(value + (Math.abs(nextFlow) > 0.4 ? 0.004 : -0.006), 42, 100));
      setRssi((value) => Math.round(clamp(value + (Math.random() - 0.5) * 3, -112, -78)));
      setSnr((value) => Number(clamp(value + (Math.random() - 0.5) * 0.8, 4, 11).toFixed(1)));
    }, 1400);
    return () => window.clearInterval(id);
  }, []);

  // uplink
  useEffect(() => {
    const push = () => {
      const m = metrics.current;
      const flags = (m.leak ? 0b100 : 0) | (m.reverse ? 0b10 : 0) | (0 << 3);
      const nextSeq = (seqRef.current + 1) % 65535;
      setSeq(nextSeq);
      const packet: Packet = {
        id: nextSeq,
        time: formatTime(new Date()),
        payload: buildPayload(m.flow, m.volume, flags, Math.round(m.battery), nextSeq),
        rssi: m.rssi,
        snr: m.snr,
        airtime: `${(61 + Math.random() * 9).toFixed(0)} ms`,
        volume: m.volume,
      };
      setPackets((current) => [packet, ...current].slice(0, 8));
    };

    const m0 = metrics.current;
    const seeded: Packet[] = Array.from({ length: 5 }, (_, index) => {
      const at = new Date(Date.now() - (index + 1) * uplink * 1000);
      const seqValue = Math.max(1, seqRef.current - index - 1);
      return {
        id: seqValue,
        time: formatTime(at),
        payload: buildPayload(m0.flow, m0.volume - index * 4.2, 0, Math.round(m0.battery), seqValue),
        rssi: m0.rssi,
        snr: m0.snr,
        airtime: `${(61 + Math.random() * 9).toFixed(0)} ms`,
        volume: m0.volume - index * 4.2,
      };
    });
    setPackets(seeded);
    push();
    const id = window.setInterval(push, uplink * 1000);
    return () => window.clearInterval(id);
  }, [uplink]);

  const alerts = (leak ? 1 : 0) + (reverse ? 1 : 0);
  const path = useMemo(() => {
    const max = 18;
    return history
      .map((value, index) => `${(index / (history.length - 1)) * 100},${40 - (value / max) * 38}`)
      .join(' L ');
  }, [history]);

  const areaPath = useMemo(() => `M 0,40 L ${path} L 100,40 Z`, [path]);

  const exportCsv = () => {
    const header = 'seq,horario,payload,volume_l,rssi_dbm,snr_db,airtime';
    const rows = packets.map((packet) =>
      [packet.id, packet.time, `"${packet.payload}"`, packet.volume.toFixed(2), packet.rssi, packet.snr, packet.airtime].join(','),
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wguard-telemetria.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const signalQuality = rssi > -90 ? 'Ótimo' : rssi > -105 ? 'Bom' : 'Marginal';

  return (
    <section id="telemetry" className="relative border-t border-line px-4 py-20 md:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 dot-bg opacity-40" />
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-[11px] font-bold tracking-wider text-brand-400 uppercase">
              <Activity className="h-3.5 w-3.5" /> Telemetria simulada
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold text-ink-strong md:text-4xl">
              O que o servidor recebe a cada uplink
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Simulação do firmware: pulsos do YF-S201, eletrodos de ar e o pacote de 11 bytes enviado pelo SX1278.
              Os valores são gerados no navegador — nenhum dispositivo real está publicando.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setLeak((value) => !value)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-bold transition-colors ${
                leak
                  ? 'border-amber-500/40 bg-amber-500/15 text-amber-400'
                  : 'border-line bg-panel text-ink-muted hover:border-line-strong hover:text-ink'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {leak ? 'Vazamento ativo' : 'Simular vazamento'}
            </button>
            <button
              onClick={() => setReverse((value) => !value)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-bold transition-colors ${
                reverse
                  ? 'border-blue-500/40 bg-blue-500/15 text-blue-400'
                  : 'border-line bg-panel text-ink-muted hover:border-line-strong hover:text-ink'
              }`}
            >
              <ArrowDownUp className="h-3.5 w-3.5" />
              Fluxo reverso
            </button>
            <label className="flex items-center gap-1.5 rounded-xl border border-line bg-panel px-3 py-2 text-[11px] font-semibold text-ink-muted">
              <RefreshCw className="h-3.5 w-3.5" />
              Uplink
              <select
                value={uplink}
                onChange={(event) => setUplink(Number(event.target.value))}
                className="bg-transparent font-mono text-[11px] font-bold text-ink-strong outline-none"
              >
                <option value={10}>10 s</option>
                <option value={30}>30 s</option>
                <option value={60}>60 s</option>
              </select>
            </label>
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 rounded-xl border border-line bg-panel px-3 py-2 text-[11px] font-bold text-ink hover:border-line-strong"
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
          </div>
        </header>

        {/* KPIs */}
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <div className="rounded-2xl border border-line bg-panel p-4 shadow-soft">
            <div className="flex items-center justify-between text-ink-subtle">
              <span className="label-mono text-[9px]">Volume acumulado</span>
              <Droplets className="h-4 w-4 text-blue-400" />
            </div>
            <p className="mt-3 font-mono text-2xl font-bold text-ink-strong tabular">
              {(volume / 1000).toFixed(3)}
              <span className="ml-1 text-xs font-normal text-ink-subtle">m³</span>
            </p>
            <p className="mt-1 text-[10px] text-ink-subtle">
              {volume.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} L desde a instalação
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-panel p-4 shadow-soft">
            <div className="flex items-center justify-between text-ink-subtle">
              <span className="label-mono text-[9px]">Vazão atual</span>
              <Gauge className="h-4 w-4 text-brand-400" />
            </div>
            <p className={`mt-3 font-mono text-2xl font-bold tabular ${reverse ? 'text-blue-400' : 'text-ink-strong'}`}>
              {flow.toFixed(2)}
              <span className="ml-1 text-xs font-normal text-ink-subtle">L/min</span>
            </p>
            <p className="mt-1 text-[10px] text-ink-subtle">
              {reverse ? 'Sentido invertido detectado' : `${(flow * 60).toFixed(0)} L/h equivalentes`}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-panel p-4 shadow-soft">
            <div className="flex items-center justify-between text-ink-subtle">
              <span className="label-mono text-[9px]">Sinal LoRa</span>
              <Signal className="h-4 w-4 text-teal-400" />
            </div>
            <p className="mt-3 font-mono text-2xl font-bold text-ink-strong tabular">
              {rssi}
              <span className="ml-1 text-xs font-normal text-ink-subtle">dBm</span>
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex h-1.5 flex-1 gap-0.5">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((bar) => (
                  <span
                    key={bar}
                    className={`h-full flex-1 rounded-sm ${bar < Math.round(((rssi + 120) / 40) * 8) ? 'bg-teal-400' : 'bg-line'}`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-semibold text-ink-subtle">{signalQuality}</span>
            </div>
            <p className="mt-1 text-[10px] text-ink-subtle">SNR {snr.toFixed(1)} dB</p>
          </div>

          <div className="rounded-2xl border border-line bg-panel p-4 shadow-soft">
            <div className="flex items-center justify-between text-ink-subtle">
              <span className="label-mono text-[9px]">Bateria</span>
              <BatteryMedium className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="mt-3 font-mono text-2xl font-bold text-ink-strong tabular">
              {battery.toFixed(0)}
              <span className="ml-1 text-xs font-normal text-ink-subtle">%</span>
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${battery}%` }} />
            </div>
            <p className="mt-1 text-[10px] text-ink-subtle">2× 18650 · 3,7 V</p>
          </div>

          <div
            className={`col-span-2 rounded-2xl border p-4 shadow-soft lg:col-span-1 ${
              alerts > 0 ? 'border-amber-500/40 bg-amber-500/10' : 'border-line bg-panel'
            }`}
          >
            <div className="flex items-center justify-between text-ink-subtle">
              <span className="label-mono text-[9px]">Alertas ativos</span>
              <AlertTriangle className={`h-4 w-4 ${alerts > 0 ? 'text-amber-400' : 'text-ink-subtle'}`} />
            </div>
            <p className={`mt-3 font-mono text-2xl font-bold ${alerts > 0 ? 'text-amber-400' : 'text-ink-strong'}`}>
              {alerts.toString().padStart(2, '0')}
            </p>
            <p className="mt-1 text-[10px] text-ink-subtle">
              {alerts > 0 ? 'Vazamento contínuo / fluxo reverso' : 'Nenhuma anomalia no período'}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-12">
          {/* gráfico */}
          <div className="rounded-2xl border border-line bg-panel p-5 shadow-soft lg:col-span-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-ink-strong">Vazão instantânea · janela de 48 s</h3>
                <p className="text-[11px] text-ink-subtle">Amostragem de 1 Hz — média móvel do sinal de pulsos</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-ink-subtle">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-brand-400" /> L/min
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-4 rounded-full bg-line" /> 18 L/min
                </span>
              </div>
            </div>
            <div className="relative mt-4 h-44 w-full pr-7">
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-full w-full">
                <defs>
                  <linearGradient id="flowArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[8, 16, 24, 32].map((y) => (
                  <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="var(--line)" strokeWidth="0.2" vectorEffect="non-scaling-stroke" />
                ))}
                <path d={areaPath} fill="url(#flowArea)" />
                <path
                  d={`M ${path}`}
                  fill="none"
                  stroke={reverse ? '#60a5fa' : '#2dd4bf'}
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex flex-col justify-between py-1 font-mono text-[9px] text-ink-subtle">
                <span>18</span>
                <span>9</span>
                <span>0</span>
              </div>
            </div>
          </div>

          {/* enlace */}
          <div className="rounded-2xl border border-line bg-panel p-5 shadow-soft lg:col-span-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-ink-strong">Estado do enlace</h3>
              <Radio className="h-4 w-4 text-brand-400" />
            </div>
            <dl className="mt-4 space-y-3">
              {[
                { icon: Waves, label: 'Frequência', value: '433,0 MHz' },
                { icon: ArrowUpRight, label: 'Potência TX', value: '+20 dBm' },
                { icon: Signal, label: 'SF / BW', value: 'SF9 · 125 kHz' },
                { icon: RefreshCw, label: 'Airtime', value: '~66 ms' },
                { icon: Activity, label: 'Contador de pacotes', value: seq.toString().padStart(5, '0') },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-[11px] text-ink-subtle">
                    <row.icon className="h-3.5 w-3.5 text-ink-subtle" />
                    {row.label}
                  </dt>
                  <dd className="font-mono text-[11px] font-semibold text-ink-strong">{row.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 rounded-xl border border-line bg-surface-2 p-3">
              <p className="label-mono text-[9px] text-ink-subtle">Último pacote</p>
              <p className="mt-1.5 font-mono text-[10px] leading-relaxed break-all text-brand-400">
                {packets[0]?.payload ?? '—'}
              </p>
            </div>
          </div>
        </div>

        {/* tabela de pacotes */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-panel shadow-soft">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h3 className="text-sm font-bold text-ink-strong">Últimos uplinks recebidos</h3>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-ink-subtle">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              recebendo a cada {uplink} s
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-line-soft bg-surface-2/60 text-[9px] tracking-wider text-ink-subtle uppercase">
                  <th className="px-5 py-2.5 font-semibold">Horário</th>
                  <th className="px-3 py-2.5 font-semibold">Seq</th>
                  <th className="px-3 py-2.5 font-semibold">Payload (11 bytes)</th>
                  <th className="px-3 py-2.5 font-semibold">RSSI</th>
                  <th className="px-3 py-2.5 font-semibold">SNR</th>
                  <th className="px-3 py-2.5 font-semibold">Airtime</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[11px]">
                {packets.map((packet) => (
                  <tr key={`${packet.id}-${packet.time}`} className="border-b border-line-soft/60 last:border-0 hover:bg-surface-2/50">
                    <td className="px-5 py-2.5 text-ink-muted tabular">{packet.time}</td>
                    <td className="px-3 py-2.5 text-ink-subtle tabular">{packet.id}</td>
                    <td className="px-3 py-2.5 text-brand-400">{packet.payload}</td>
                    <td className="px-3 py-2.5 text-ink-muted tabular">{packet.rssi} dBm</td>
                    <td className="px-3 py-2.5 text-ink-muted tabular">{packet.snr} dB</td>
                    <td className="px-3 py-2.5 text-ink-subtle tabular">{packet.airtime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
