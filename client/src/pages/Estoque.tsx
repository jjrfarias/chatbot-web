import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, formatCurrency } from "../api";
import type { InventoryDevice, InventoryPart } from "../types";
import { Badge } from "../components/ui";

export function Estoque() {
  const [tab, setTab] = useState<"aparelhos" | "pecas">("aparelhos");
  const [devices, setDevices] = useState<InventoryDevice[]>([]);
  const [parts, setParts] = useState<InventoryPart[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    api.getInventoryDevices().then(setDevices);
    api.getInventoryParts().then(setParts);
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 lg:px-11">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="font-display text-[22px] font-bold">Estoque</div>
          <div className="mt-0.5 text-[12.5px] text-cr-muted">Aparelhos disponíveis e peças de reposição</div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-cr-accent px-[18px] py-2.5 text-[13px] font-bold text-white"
        >
          + Adicionar item
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setTab("aparelhos")}
          className={`rounded-[10px] px-[18px] py-2 text-[12.5px] font-bold ${tab === "aparelhos" ? "border-[1.4px] border-cr-accent bg-cr-accent text-white" : "border-[1.4px] border-cr-border bg-white text-cr-secondary"}`}
        >
          Aparelhos ({devices.length})
        </button>
        <button
          onClick={() => setTab("pecas")}
          className={`rounded-[10px] px-[18px] py-2 text-[12.5px] font-bold ${tab === "pecas" ? "border-[1.4px] border-cr-accent bg-cr-accent text-white" : "border-[1.4px] border-cr-border bg-white text-cr-secondary"}`}
        >
          Peças ({parts.length})
        </button>
      </div>

      {tab === "aparelhos" ? (
        <div className="mt-4 overflow-hidden rounded-[14px] border border-cr-border bg-white">
          <div className="flex items-center border-b border-cr-border px-4 py-2.5 text-[10.5px] font-bold uppercase text-cr-muted">
            <div className="flex-[2.2]">Modelo</div>
            <div className="hidden flex-[1.8] sm:block">Condição</div>
            <div className="flex-[0.8]">Qtd</div>
            <div className="hidden flex-[1.2] md:block">Custo</div>
            <div className="flex-[1.2]">Venda</div>
            <div className="flex-[1.2] text-right">Status</div>
          </div>
          {devices.length === 0 ? (
            <p className="p-5 text-sm text-cr-muted">Nenhum aparelho cadastrado.</p>
          ) : (
            devices.map((d) => (
              <div key={d.id} className="flex items-center border-b border-cr-border-light px-4 py-3 last:border-0 hover:bg-cr-bg">
                <div className="min-w-0 flex-[2.2] truncate text-[12.5px] font-semibold">
                  {d.name} · {d.storage} · {d.color}
                </div>
                <div className="hidden flex-[1.8] text-xs text-cr-secondary sm:block">{d.condition}</div>
                <div className="flex-[0.8] text-[12.5px] font-semibold">{d.quantity}</div>
                <div className="hidden flex-[1.2] text-xs text-cr-secondary md:block">{formatCurrency(d.costPrice)}</div>
                <div className="flex-[1.2] text-[12.5px] font-semibold">{formatCurrency(d.salePrice)}</div>
                <div className="flex-[1.2] text-right">
                  <Badge tone={d.status === "Disponível" ? "dark" : d.status === "Esgotado" ? "muted" : "light"}>{d.status}</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-[14px] border border-cr-border bg-white">
          <div className="flex items-center border-b border-cr-border px-4 py-2.5 text-[10.5px] font-bold uppercase text-cr-muted">
            <div className="flex-[1.6]">Peça</div>
            <div className="hidden flex-[1.4] sm:block">Compatível</div>
            <div className="flex-[0.8]">Qtd</div>
            <div className="hidden flex-[0.8] lg:block">Mínimo</div>
            <div className="hidden flex-[1.6] md:block">Fornecedor</div>
            <div className="hidden flex-1 md:block">Custo</div>
            <div className="flex-[1.2] text-right">Status</div>
          </div>
          {parts.length === 0 ? (
            <p className="p-5 text-sm text-cr-muted">Nenhuma peça cadastrada.</p>
          ) : (
            parts.map((p) => (
              <div key={p.id} className="flex items-center border-b border-cr-border-light px-4 py-3 last:border-0 hover:bg-cr-bg">
                <div className="min-w-0 flex-[1.6] truncate text-[12.5px] font-semibold">{p.name}</div>
                <div className="hidden flex-[1.4] text-xs text-cr-secondary sm:block">{p.compatible}</div>
                <div className="flex-[0.8] text-[12.5px] font-semibold">{p.quantity}</div>
                <div className="hidden flex-[0.8] text-xs text-cr-muted lg:block">{p.minQuantity}</div>
                <div className="hidden flex-[1.6] text-xs text-cr-secondary md:block">{p.supplier}</div>
                <div className="hidden flex-1 text-xs text-cr-secondary md:block">{formatCurrency(p.costPrice)}</div>
                <div className="flex-[1.2] text-right">
                  <Badge tone={p.status === "Disponível" ? "dark" : p.status === "Esgotado" ? "muted" : "light"}>{p.status}</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showAdd && (
        <AddItemModal
          initialKind={tab === "aparelhos" ? "device" : "part"}
          onClose={() => setShowAdd(false)}
          onSavedDevice={(device) => {
            setDevices((prev) => [...prev, device]);
            setShowAdd(false);
          }}
          onSavedPart={(part) => {
            setParts((prev) => [...prev, part]);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

function AddItemModal({
  initialKind,
  onClose,
  onSavedDevice,
  onSavedPart,
}: {
  initialKind: "device" | "part";
  onClose: () => void;
  onSavedDevice: (device: InventoryDevice) => void;
  onSavedPart: (part: InventoryPart) => void;
}) {
  const [kind, setKind] = useState<"device" | "part">(initialKind);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    try {
      if (kind === "device") {
        const device = await api.createInventoryDevice({
          name: String(data.get("name") || ""),
          storage: String(data.get("storage") || ""),
          color: String(data.get("color") || ""),
          condition: String(data.get("condition") || "Novo"),
          quantity: Number(data.get("quantity")) || 0,
          minQuantity: Number(data.get("minQuantity")) || 3,
          costPrice: Number(data.get("costPrice")) || 0,
          salePrice: Number(data.get("salePrice")) || 0,
        });
        onSavedDevice(device);
      } else {
        const part = await api.createInventoryPart({
          name: String(data.get("name") || ""),
          compatible: String(data.get("compatible") || ""),
          quantity: Number(data.get("quantity")) || 0,
          minQuantity: Number(data.get("minQuantity")) || 4,
          supplier: String(data.get("supplier") || ""),
          costPrice: Number(data.get("costPrice")) || 0,
        });
        onSavedPart(part);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao adicionar item");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="m-0 font-display text-lg font-bold">Adicionar item</h2>
          <button type="button" onClick={onClose} className="text-xl text-cr-muted">
            ×
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setKind("device")}
            className={`rounded-lg px-3.5 py-2 text-xs font-bold ${kind === "device" ? "bg-cr-accent text-white" : "border border-cr-border text-cr-secondary"}`}
          >
            Aparelho
          </button>
          <button
            type="button"
            onClick={() => setKind("part")}
            className={`rounded-lg px-3.5 py-2 text-xs font-bold ${kind === "part" ? "bg-cr-accent text-white" : "border border-cr-border text-cr-secondary"}`}
          >
            Peça
          </button>
        </div>

        {kind === "device" ? (
          <div key="device-fields" className="mt-4 grid grid-cols-2 gap-3">
            <label className="col-span-2 text-xs font-semibold text-cr-muted">
              Modelo
              <input required name="name" className="input mt-1" placeholder="Ex: Galaxy S24" />
            </label>
            <label className="text-xs font-semibold text-cr-muted">
              Armazenamento
              <input required name="storage" className="input mt-1" placeholder="128GB" />
            </label>
            <label className="text-xs font-semibold text-cr-muted">
              Cor
              <input name="color" className="input mt-1" placeholder="Meia-noite" />
            </label>
            <label className="col-span-2 text-xs font-semibold text-cr-muted">
              Condição
              <select name="condition" defaultValue="Novo" className="input mt-1 bg-white">
                <option>Novo</option>
                <option>Seminovo · Grade A</option>
                <option>Seminovo · Grade B</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-cr-muted">
              Quantidade
              <input required name="quantity" type="number" min="0" defaultValue={1} className="input mt-1" />
            </label>
            <label className="text-xs font-semibold text-cr-muted">
              Estoque mínimo
              <input name="minQuantity" type="number" min="0" defaultValue={3} className="input mt-1" />
            </label>
            <label className="text-xs font-semibold text-cr-muted">
              Custo (R$)
              <input required name="costPrice" type="number" min="0" step="0.01" className="input mt-1" />
            </label>
            <label className="text-xs font-semibold text-cr-muted">
              Venda (R$)
              <input required name="salePrice" type="number" min="0" step="0.01" className="input mt-1" />
            </label>
          </div>
        ) : (
          <div key="part-fields" className="mt-4 grid grid-cols-2 gap-3">
            <label className="col-span-2 text-xs font-semibold text-cr-muted">
              Peça
              <input required name="name" className="input mt-1" placeholder="Ex: Tela OLED" />
            </label>
            <label className="col-span-2 text-xs font-semibold text-cr-muted">
              Compatível com
              <input required name="compatible" className="input mt-1" placeholder="Ex: Galaxy S24" />
            </label>
            <label className="text-xs font-semibold text-cr-muted">
              Quantidade
              <input required name="quantity" type="number" min="0" defaultValue={1} className="input mt-1" />
            </label>
            <label className="text-xs font-semibold text-cr-muted">
              Estoque mínimo
              <input name="minQuantity" type="number" min="0" defaultValue={4} className="input mt-1" />
            </label>
            <label className="text-xs font-semibold text-cr-muted">
              Fornecedor
              <input name="supplier" className="input mt-1" placeholder="Ex: ABC Peças" />
            </label>
            <label className="text-xs font-semibold text-cr-muted">
              Custo (R$)
              <input required name="costPrice" type="number" min="0" step="0.01" className="input mt-1" />
            </label>
          </div>
        )}

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-cr-border px-4 py-2.5 text-xs font-bold">
            Cancelar
          </button>
          <button disabled={saving} className="rounded-xl bg-cr-accent px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
            {saving ? "Adicionando..." : "Adicionar"}
          </button>
        </div>
      </form>
    </div>
  );
}
