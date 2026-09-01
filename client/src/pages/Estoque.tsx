import { useEffect, useState } from "react";
import { api, formatCurrency } from "../api";
import type { InventoryDevice, InventoryPart } from "../types";
import { Badge } from "../components/ui";

export function Estoque() {
  const [tab, setTab] = useState<"iphones" | "pecas">("iphones");
  const [devices, setDevices] = useState<InventoryDevice[]>([]);
  const [parts, setParts] = useState<InventoryPart[]>([]);

  useEffect(() => {
    api.getInventoryDevices().then(setDevices);
    api.getInventoryParts().then(setParts);
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-11 py-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-[22px] font-bold">Estoque</div>
          <div className="mt-0.5 text-[12.5px] text-cr-muted">Aparelhos disponíveis e peças de reposição</div>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-cr-ink px-[18px] py-2.5 text-[13px] font-bold text-white">
          + Adicionar item
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setTab("iphones")}
          className={`rounded-[10px] px-[18px] py-2 text-[12.5px] font-bold ${tab === "iphones" ? "border-[1.4px] border-cr-ink bg-cr-ink text-white" : "border-[1.4px] border-cr-border bg-white text-cr-secondary"}`}
        >
          iPhones ({devices.length})
        </button>
        <button
          onClick={() => setTab("pecas")}
          className={`rounded-[10px] px-[18px] py-2 text-[12.5px] font-bold ${tab === "pecas" ? "border-[1.4px] border-cr-ink bg-cr-ink text-white" : "border-[1.4px] border-cr-border bg-white text-cr-secondary"}`}
        >
          Peças ({parts.length})
        </button>
      </div>

      {tab === "iphones" ? (
        <div className="mt-4 overflow-hidden rounded-[14px] border border-cr-border bg-white">
          <div className="flex items-center border-b border-cr-border px-4 py-2.5 text-[10.5px] font-bold uppercase text-cr-muted">
            <div className="flex-[2.2]">Modelo</div>
            <div className="flex-[1.8]">Condição</div>
            <div className="flex-[0.8]">Qtd</div>
            <div className="flex-[1.2]">Custo</div>
            <div className="flex-[1.2]">Venda</div>
            <div className="flex-[1.2] text-right">Status</div>
          </div>
          {devices.map((d) => (
            <div key={d.id} className="flex items-center border-b border-cr-border-light px-4 py-3 last:border-0 hover:bg-cr-bg">
              <div className="flex-[2.2] text-[12.5px] font-semibold">
                {d.name} · {d.storage} · {d.color}
              </div>
              <div className="flex-[1.8] text-xs text-cr-secondary">{d.condition}</div>
              <div className="flex-[0.8] text-[12.5px] font-semibold">{d.quantity}</div>
              <div className="flex-[1.2] text-xs text-cr-secondary">{formatCurrency(d.costPrice)}</div>
              <div className="flex-[1.2] text-[12.5px] font-semibold">{formatCurrency(d.salePrice)}</div>
              <div className="flex-[1.2] text-right">
                <Badge tone={d.status === "Disponível" ? "dark" : d.status === "Esgotado" ? "muted" : "light"}>{d.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-[14px] border border-cr-border bg-white">
          <div className="flex items-center border-b border-cr-border px-4 py-2.5 text-[10.5px] font-bold uppercase text-cr-muted">
            <div className="flex-[1.6]">Peça</div>
            <div className="flex-[1.4]">Compatível</div>
            <div className="flex-[0.8]">Qtd</div>
            <div className="flex-[0.8]">Mínimo</div>
            <div className="flex-[1.6]">Fornecedor</div>
            <div className="flex-1">Custo</div>
            <div className="flex-[1.2] text-right">Status</div>
          </div>
          {parts.map((p) => (
            <div key={p.id} className="flex items-center border-b border-cr-border-light px-4 py-3 last:border-0 hover:bg-cr-bg">
              <div className="flex-[1.6] text-[12.5px] font-semibold">{p.name}</div>
              <div className="flex-[1.4] text-xs text-cr-secondary">{p.compatible}</div>
              <div className="flex-[0.8] text-[12.5px] font-semibold">{p.quantity}</div>
              <div className="flex-[0.8] text-xs text-cr-muted">{p.minQuantity}</div>
              <div className="flex-[1.6] text-xs text-cr-secondary">{p.supplier}</div>
              <div className="flex-1 text-xs text-cr-secondary">{formatCurrency(p.costPrice)}</div>
              <div className="flex-[1.2] text-right">
                <Badge tone={p.status === "Disponível" ? "dark" : p.status === "Esgotado" ? "muted" : "light"}>{p.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
