import { useEffect, useState } from "react";
import { api, formatCurrency } from "../api";
import type { Sale } from "../types";

const PAYMENT_LABELS: Record<string, string> = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  debito: "Cartão de débito",
  credito: "Cartão de crédito",
};

export function History() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getSales()
      .then(setSales)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <h1 className="text-2xl font-semibold text-black">Histórico de vendas</h1>
      <p className="mt-1 text-sm text-stone-500">Todas as vendas registradas na loja.</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white">
        {loading ? (
          <p className="p-5 text-sm text-stone-400">Carregando...</p>
        ) : sales.length === 0 ? (
          <p className="p-5 text-sm text-stone-400">Nenhuma venda registrada ainda.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-xs uppercase tracking-wide text-stone-400">
                <th className="px-5 py-3 font-medium">Data</th>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Aparelho</th>
                <th className="px-5 py-3 font-medium">Troca</th>
                <th className="px-5 py-3 font-medium">Pagamento</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b border-stone-50 last:border-0">
                  <td className="px-5 py-3 text-stone-500">
                    {new Date(sale.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-5 py-3 font-medium text-black">{sale.customerName}</td>
                  <td className="px-5 py-3 text-stone-600">{sale.deviceName}</td>
                  <td className="px-5 py-3 text-stone-600">
                    {sale.hasTradeIn ? `${sale.tradeInModelName} (${formatCurrency(sale.tradeInFinalValue)})` : "—"}
                  </td>
                  <td className="px-5 py-3 text-stone-600">
                    {PAYMENT_LABELS[sale.paymentMethod] ?? sale.paymentMethod}
                    {sale.paymentMethod === "credito" ? ` · ${sale.installments}x` : ""}
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-black">{formatCurrency(sale.totalToPay)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
