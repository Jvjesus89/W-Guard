import { useState } from 'react';
import { Braces, ChevronRight, Cpu } from 'lucide-react';
import { PAYLOAD_BYTES, SPEC_GROUPS, type SpecGroupId } from '../data/meter';

export default function SpecsSection() {
  const [group, setGroup] = useState<SpecGroupId>('radio');
  const active = SPEC_GROUPS.find((item) => item.id === group) ?? SPEC_GROUPS[0];

  return (
    <section id="specs" className="relative border-t border-line px-4 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-[11px] font-bold tracking-wider text-brand-400 uppercase">
              <Cpu className="h-3.5 w-3.5" /> Especificações técnicas
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold text-ink-strong md:text-4xl">
              Ficha técnica do protótipo
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Valores do hardware montado e do firmware em desenvolvimento. Itens marcados como estimativa ainda
              serão validados nos testes de campo do TAP.
            </p>
          </div>
          <div className="hide-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0">
            {SPEC_GROUPS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setGroup(item.id)}
                className={`shrink-0 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                  group === item.id
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                    : 'border border-line bg-panel text-ink-muted hover:text-ink-strong'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid items-start gap-4 lg:grid-cols-12">
          <div className="overflow-hidden rounded-2xl border border-line bg-panel shadow-soft lg:col-span-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line bg-surface-2/60 text-left text-[9px] tracking-wider text-ink-subtle uppercase">
                  <th className="px-5 py-3 font-semibold">Parâmetro</th>
                  <th className="px-3 py-3 font-semibold">Valor</th>
                  <th className="hidden px-5 py-3 font-semibold sm:table-cell">Observação</th>
                </tr>
              </thead>
              <tbody>
                {active.rows.map((row) => (
                  <tr
                    key={row.label}
                    className="group border-b border-line-soft/70 transition-colors last:border-0 hover:bg-surface-2/60"
                  >
                    <td className="px-5 py-3 text-xs font-medium text-ink-muted">{row.label}</td>
                    <td className="px-3 py-3 font-mono text-xs font-semibold text-ink-strong">{row.value}</td>
                    <td className="hidden px-5 py-3 text-[11px] text-ink-subtle sm:table-cell">{row.note ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-2xl border border-line bg-panel p-5 shadow-soft lg:col-span-4">
            <div className="flex items-center gap-2">
              <Braces className="h-4 w-4 text-brand-400" />
              <h3 className="text-sm font-bold text-ink-strong">Mapa do payload</h3>
            </div>
            <p className="mt-1 text-[11px] text-ink-subtle">11 bytes · little-endian no firmware</p>

            <div className="mt-4 flex gap-[2px]">
              {PAYLOAD_BYTES.map((field, index) => {
                const size = Number(field.range.split('–').pop()) - Number(field.range.split('–')[0]) + 1;
                const colors = ['bg-brand-500/70', 'bg-blue-500/70', 'bg-amber-500/70', 'bg-emerald-500/70', 'bg-violet-500/70', 'bg-rose-500/70'];
                return (
                  <div
                    key={field.name}
                    className={`h-2 rounded-sm ${colors[index % colors.length]}`}
                    style={{ flexGrow: size }}
                    title={`${field.name} (${field.range})`}
                  />
                );
              })}
            </div>

            <ul className="mt-4 space-y-2.5">
              {PAYLOAD_BYTES.map((field, index) => {
                const colors = ['text-brand-400', 'text-blue-400', 'text-amber-400', 'text-emerald-400', 'text-violet-400', 'text-rose-400'];
                return (
                  <li key={field.name} className="flex items-start gap-2.5">
                    <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-current ${colors[index % colors.length]}`} />
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <code className="font-mono text-[11px] font-semibold text-ink-strong">{field.name}</code>
                        <span className="font-mono text-[9px] text-ink-subtle">byte {field.range}</span>
                      </div>
                      <p className="text-[10px] leading-snug text-ink-muted">{field.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 rounded-lg border border-line-soft bg-surface-2 p-3">
              <p className="label-mono text-[8px] text-ink-subtle">Exemplo decodificado</p>
              <p className="mt-1 font-mono text-[10px] text-brand-400">A3 1F 02 45 1C 00 04 5E 03 FF 9C</p>
              <p className="mt-1 text-[10px] text-ink-muted">
                vazão 7,98 L/min · volume 148.764 L · flags 0x04 · bateria 94 %
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 flex items-center gap-1.5 text-[10px] text-ink-subtle">
          <ChevronRight className="h-3 w-3 text-brand-400" />
          Dados consolidados do Termo de Abertura (TAP) e da lista de materiais do projeto extensionista.
        </p>
      </div>
    </section>
  );
}
