import { useEffect, useState } from "react";
import { api, formatCurrency, formatDate } from "../api";
import type { Sale } from "../types";

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
    <div className="mx-auto max-w-5xl px-11 py-7">
      <div className="font-display text-xl font-bold">Histórico de vendas</div>
      <div className="mt-0.5 text-[12.5px] text-cr-muted">Todas as vendas registradas na loja</div>

      <div className="mt-5 overflow-hidden rounded-[14px] border border-cr-border bg-white">
        {loading ? (
          <p className="p-5 text-sm text-cr-muted">Carregando...</p>
        ) : sales.length === 0 ? (
          <p className="p-5 text-sm text-cr-muted">Nenhuma venda registrada ainda.</p>
        ) : (
          <>
            <div className="flex items-center border-b border-cr-border px-[18px] py-2.5 text-[10.5px] font-bold uppercase text-cr-muted">
              <div className="flex-1">Pedido</div>
              <div className="flex-1">Data</div>
              <div className="flex-[1.4]">Cliente</div>
              <div className="flex-[1.8]">Aparelho</div>
              <div className="flex-[1.6]">Troca</div>
              <div className="flex-[1.2]">Pagamento</div>
              <div className="flex-1 text-right">Total</div>
            </div>
            {sales.map((sale) => (
              <div key={sale.id} className="flex items-center border-b border-cr-border-light px-[18px] py-3 last:border-0 hover:bg-cr-bg">
                <div className="flex-1 text-xs text-cr-muted">{sale.orderNumber}</div>
                <div className="flex-1 text-xs text-cr-secondary">{formatDate(sale.createdAt)}</div>
                <div className="flex-[1.4] text-[12.5px] font-semibold">{sale.customerName}</div>
                <div className="flex-[1.8] text-[12.5px] text-cr-secondary">
                  {sale.deviceName} · {sale.deviceColor}
                </div>
                <div className="flex-[1.6] text-[12.5px] text-cr-secondary">
                  {sale.hasTradeIn ? `${sale.tradeInModelName} (${formatCurrency(sale.tradeInFinalValue)})` : "—"}
                </div>
                <div className="flex-[1.2] text-[12.5px] text-cr-secondary">{sale.paymentLabel}</div>
                <div className="flex-1 text-right text-[12.5px] font-bold">{formatCurrency(sale.totalToPay)}</div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
