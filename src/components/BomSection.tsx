import { useMemo, useState } from 'react';
import { Boxes, Download, Package, Wrench } from 'lucide-react';
import { BOM, METER_PARTS, type MeterPartId } from '../data/meter';

export default function BomSection() {
  const [filter, setFilter] = useState<MeterPartId | 'all'>('all');

  const rows = useMemo(
    () => (filter === 'all' ? BOM : BOM.filter((row) => row.part === filter)),
    [filter],
  );

  const totalItems = BOM.reduce((sum, row) => sum + row.qty, 0);
  const categories = new Set(BOM.map((row) => row.category)).size;

  const exportCsv = () => {
    const header = 'categoria,item,funcao,qtd,subsistema';
    const body = rows.map((row) =>
      [row.category, row.item, `"${row.role}"`, row.qty, row.part].join(','),
    );
    const blob = new Blob([[header, ...body].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wguard-lista-de-materiais.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="bom" className="relative border-t border-line bg-surface-2/40 px-4 py-20 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-[11px] font-bold tracking-wider text-brand-400 uppercase">
              <Package className="h-3.5 w-3.5" /> Lista de materiais
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold text-ink-strong md:text-4xl">
              O que compõe o protótipo
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Lista consolidada do projeto extensionista, com a função de cada item no dispositivo. Os custos de
              aquisição ainda não estão fechados — o TAP trabalha com um custo-alvo de R$ 600 por unidade.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 rounded-xl border border-line bg-panel px-3.5 py-2.5 text-[11px] font-bold text-ink hover:border-line-strong"
            >
              <Download className="h-3.5 w-3.5" /> Exportar CSV
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-12">
          <div className="overflow-hidden rounded-2xl border border-line bg-panel shadow-soft lg:col-span-8">
            <div className="hide-scrollbar flex items-center gap-1.5 overflow-x-auto border-b border-line px-3 py-2.5">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-colors ${
                  filter === 'all' ? 'bg-brand-500 text-white' : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                }`}
              >
                Todas as camadas
              </button>
              {METER_PARTS.map((part) => (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => setFilter(part.id)}
                  className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-colors ${
                    filter === part.id ? 'bg-brand-500 text-white' : 'text-ink-muted hover:bg-surface-2 hover:text-ink'
                  }`}
                >
                  {part.name}
                </button>
              ))}
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b border-line bg-surface-2/60 text-left text-[9px] tracking-wider text-ink-subtle uppercase">
                  <th className="px-4 py-3 font-semibold">Item</th>
                  <th className="hidden px-3 py-3 font-semibold md:table-cell">Função no projeto</th>
                  <th className="px-3 py-3 text-center font-semibold">Qtd</th>
                  <th className="hidden px-4 py-3 font-semibold sm:table-cell">Camada</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const part = METER_PARTS.find((item) => item.id === row.part);
                  return (
                    <tr key={row.item} className="border-b border-line-soft/70 last:border-0 hover:bg-surface-2/50">
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-ink-strong">{row.item}</p>
                        <p className="text-[9px] tracking-wide text-ink-subtle uppercase">{row.category}</p>
                      </td>
                      <td className="hidden px-3 py-3 text-[11px] leading-snug text-ink-muted md:table-cell">{row.role}</td>
                      <td className="px-3 py-3 text-center font-mono text-xs font-semibold text-ink-strong">{row.qty}</td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <span
                          className="rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-semibold"
                          style={{
                            borderColor: `${part?.accent ?? '#999'}44`,
                            backgroundColor: `${part?.accent ?? '#999'}18`,
                            color: `color-mix(in oklab, ${part?.accent} 55%, var(--ink-strong))`,
                          }}
                        >
                          {part?.name}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 lg:col-span-4">
            <div className="rounded-2xl border border-line bg-panel p-5 shadow-soft">
              <div className="flex items-center gap-2">
                <Boxes className="h-4 w-4 text-brand-400" />
                <h3 className="text-sm font-bold text-ink-strong">Resumo do kit</h3>
              </div>
              <dl className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <dt className="text-[11px] text-ink-subtle">Itens (unidades)</dt>
                  <dd className="font-mono text-lg font-bold text-ink-strong">{totalItems}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[11px] text-ink-subtle">Linhas de compra</dt>
                  <dd className="font-mono text-lg font-bold text-ink-strong">{BOM.length}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[11px] text-ink-subtle">Categorias</dt>
                  <dd className="font-mono text-lg font-bold text-ink-strong">{categories}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-line pt-3">
                  <dt className="text-[11px] text-ink-subtle">Custo-alvo / unidade</dt>
                  <dd className="font-mono text-lg font-bold text-brand-400">R$ 600</dd>
                </div>
              </dl>
              <p className="mt-3 text-[10px] leading-relaxed text-ink-subtle">
                Valor de referência do TAP para a estimativa de equipamentos do projeto.
              </p>
            </div>

            <div className="rounded-2xl border border-dashed border-line bg-panel/60 p-5">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-ink-subtle" />
                <h3 className="text-sm font-bold text-ink-strong">Notas de montagem</h3>
              </div>
              <ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-ink-muted">
                <li>• Duas células 18650 em paralelo exigem balanceamento prévio de tensão.</li>
                <li>• Eletrodos de inox devem ficar isolados do corpo do Tê, com vedação individual.</li>
                <li>• Antena com pigtail fora da caixa metálica — nunca dentro do corpo hidráulico.</li>
                <li>• Válvula de 12 V só é acionada durante o corte (MT3608 desligado em repouso).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
