import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, formatCurrency } from "../api";
import type { Sale, SalesStats } from "../types";

export function Home() {
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [recent, setRecent] = useState<Sale[]>([]);

  useEffect(() => {
    api.getStats().then(setStats);
    api.getSales().then((sales) => setRecent(sales.slice(0, 5)));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <h1 className="text-2xl font-semibold text-black">Início</h1>
      <p className="mt-1 text-sm text-stone-500">Visão geral da loja e ações rápidas.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Vendas (mês)" value={String(stats?.salesThisMonth ?? "—")} />
        <StatCard label="Faturamento (mês)" value={stats ? formatCurrency(stats.revenueThisMonth) : "—"} />
        <StatCard label="Vendas (total)" value={String(stats?.totalSales ?? "—")} />
        <StatCard label="Faturamento (total)" value={stats ? formatCurrency(stats.totalRevenue) : "—"} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          to="/nova-venda"
          className="rounded-2xl border border-stone-200 bg-white p-5 transition-shadow hover:shadow-sm"
        >
          <div className="font-medium text-black">Nova venda</div>
          <div className="mt-1 text-sm text-stone-500">Vender um aparelho novo, com ou sem troca.</div>
        </Link>
        <Link
          to="/conserto"
          className="rounded-2xl border border-stone-200 bg-white p-5 transition-shadow hover:shadow-sm"
        >
          <div className="font-medium text-black">Novo conserto</div>
          <div className="mt-1 text-sm text-stone-500">Abrir uma ordem de serviço de assistência técnica.</div>
        </Link>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-black">Vendas recentes</h2>
          <Link to="/historico" className="text-sm text-stone-500 hover:text-stone-800">
            Ver histórico →
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          {recent.length === 0 ? (
            <p className="p-5 text-sm text-stone-400">Nenhuma venda registrada ainda.</p>
          ) : (
            recent.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between border-b border-stone-100 px-5 py-3 last:border-0">
                <div>
                  <div className="text-sm font-medium text-black">{sale.customerName}</div>
                  <div className="text-xs text-stone-500">{sale.deviceName}</div>
                </div>
                <div className="text-sm font-medium text-black">{formatCurrency(sale.totalToPay)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4">
      <div className="text-xs text-stone-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-black">{value}</div>
    </div>
  );
}
