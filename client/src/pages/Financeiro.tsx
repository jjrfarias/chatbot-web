import { useEffect, useState } from "react";
import { api, formatCurrency, formatDate } from "../api";
import type { FinanceSummary } from "../types";
import { Badge, StatCard } from "../components/ui";

const PERIODS: { key: "hoje" | "semana" | "mes"; label: string }[] = [
  { key: "hoje", label: "Hoje" },
  { key: "semana", label: "Semana" },
  { key: "mes", label: "Mês" },
];

export function Financeiro() {
  const [period, setPeriod] = useState<"hoje" | "semana" | "mes">("hoje");
  const [data, setData] = useState<FinanceSummary | null>(null);

  useEffect(() => {
    api.getFinanceSummary(period).then(setData);
  }, [period]);

  const maxVal = data ? Math.max(8000, ...data.chartDays.flatMap((d) => [d.entrada, d.saida])) : 8000;

  return (
    <div className="mx-auto max-w-5xl px-11 py-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-[22px] font-bold">Financeiro</div>
          <div className="mt-0.5 text-[12.5px] text-cr-muted">Entradas e saídas de vendas e consertos</div>
        </div>
        <div className="flex gap-1.5">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`rounded-[10px] px-4 py-2 text-[12.5px] font-bold ${
                period === p.key ? "border-[1.4px] border-cr-accent bg-cr-accent text-white" : "border-[1.4px] border-cr-border bg-white text-cr-secondary"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {data && (
        <>
          <div className="mt-3.5 flex gap-3.5">
            <StatCard label="Entradas" value={formatCurrency(data.entradas)} />
            <StatCard label="Saídas" value={`− ${formatCurrency(data.saidas)}`} />
            <StatCard label="Saldo do período" value={formatCurrency(data.saldo)} dark />
          </div>

          <div className="mt-3.5 flex gap-3.5">
            <div className="flex flex-1 items-center justify-between rounded-[14px] border border-cr-border bg-white px-4 py-3">
              <div>
                <div className="text-[11px] font-semibold text-cr-muted">Vendas</div>
                <div className="mt-0.5 text-[15px] font-bold">{formatCurrency(data.vendas)}</div>
              </div>
              <div className="text-[11.5px] text-cr-muted">
                {data.vendasCount} {data.vendasCount === 1 ? "venda" : "vendas"}
              </div>
            </div>
            <div className="flex flex-1 items-center justify-between rounded-[14px] border border-cr-border bg-white px-4 py-3">
              <div>
                <div className="text-[11px] font-semibold text-cr-muted">Consertos</div>
                <div className="mt-0.5 text-[15px] font-bold">{formatCurrency(data.consertos)}</div>
              </div>
              <div className="text-[11.5px] text-cr-muted">{data.consertosCount} consertos</div>
            </div>
          </div>

          <div className="mt-3.5 flex flex-col gap-2.5 rounded-[14px] border border-cr-border bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-bold">Entradas x saídas — últimos 7 dias</div>
              <div className="flex items-center gap-3.5 text-[11px] text-cr-secondary">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm bg-cr-accent" /> Entradas
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm border-[1.4px] border-cr-placeholder bg-white" /> Saídas
                </span>
              </div>
            </div>
            <div className="flex h-[110px] items-end gap-3.5 px-1">
              {data.chartDays.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex h-[100px] items-end gap-[3px]">
                    <div
                      className="w-3 rounded-t-[3px] bg-cr-accent"
                      style={{ height: `${Math.round((d.entrada / maxVal) * 96) + 4}px` }}
                      title={formatCurrency(d.entrada)}
                    />
                    <div
                      className="w-3 rounded-t-[3px] border-[1.4px] border-cr-placeholder bg-white"
                      style={{ height: `${Math.round((d.saida / maxVal) * 96) + 4}px` }}
                      title={formatCurrency(d.saida)}
                    />
                  </div>
                  <span className="text-[10.5px] font-semibold text-cr-muted">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3.5 flex flex-col gap-2">
            <div className="text-[13px] font-bold">Últimos lançamentos</div>
            <div className="overflow-hidden rounded-[14px] border border-cr-border bg-white">
              <div className="flex items-center border-b border-cr-border px-4 py-2.5 text-[10.5px] font-bold uppercase text-cr-muted">
                <div className="flex-1">Data</div>
                <div className="flex-1">Tipo</div>
                <div className="flex-[2.4]">Descrição</div>
                <div className="flex-[1.4]">Forma</div>
                <div className="flex-1 text-right">Valor</div>
              </div>
              {data.ledger.length === 0 ? (
                <p className="p-4 text-sm text-cr-muted">Nenhum lançamento no período.</p>
              ) : (
                data.ledger.map((l, i) => (
                  <div key={i} className="flex items-center border-b border-cr-border-light px-4 py-2.5 last:border-0 hover:bg-cr-bg">
                    <div className="flex-1 text-xs text-cr-secondary">{formatDate(l.date)}</div>
                    <div className="flex-1">
                      <Badge tone={l.type === "Despesa" ? "muted" : "light"}>{l.type}</Badge>
                    </div>
                    <div className="flex-[2.4] text-[12.5px] font-semibold">{l.description}</div>
                    <div className="flex-[1.4] text-xs text-cr-secondary">{l.paymentMethod}</div>
                    <div className="flex-1 text-right text-[12.5px] font-bold">
                      {l.value < 0 ? `− ${formatCurrency(Math.abs(l.value))}` : formatCurrency(l.value)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
