import { formatCurrency } from "../../api";
import type { Device, TradeInModel } from "../../types";

export interface PaymentInfo {
  customerName: string;
  customerPhone: string;
  paymentMethod: string;
  installments: number;
}

interface Props {
  device: Device;
  tradeInModel: TradeInModel | null;
  tradeInValue: number;
  info: PaymentInfo;
  onChange: (info: PaymentInfo) => void;
  onContinue: () => void;
}

const METHODS = [
  { id: "pix", label: "Pix" },
  { id: "dinheiro", label: "Dinheiro" },
  { id: "debito", label: "Cartão de débito" },
  { id: "credito", label: "Cartão de crédito" },
];

export function StepPayment({ device, tradeInModel, tradeInValue, info, onChange, onContinue }: Props) {
  const totalToPay = Math.max(0, device.price - tradeInValue);
  const canContinue =
    info.customerName.trim().length > 1 && info.customerPhone.trim().length >= 8 && !!info.paymentMethod;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-black">Dados do cliente e forma de pagamento</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="mb-4 text-sm font-medium text-black">Dados do cliente</div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-sm text-stone-600">
                Nome completo
                <input
                  value={info.customerName}
                  onChange={(e) => onChange({ ...info, customerName: e.target.value })}
                  placeholder="Nome do cliente"
                  className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-black outline-none focus:border-black"
                />
              </label>
              <label className="text-sm text-stone-600">
                Telefone
                <input
                  value={info.customerPhone}
                  onChange={(e) => onChange({ ...info, customerPhone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-black outline-none focus:border-black"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <div className="mb-4 text-sm font-medium text-black">Forma de pagamento</div>
            <div className="flex flex-wrap gap-2">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChange({ ...info, paymentMethod: m.id, installments: 1 })}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    info.paymentMethod === m.id
                      ? "bg-black text-white"
                      : "border border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {info.paymentMethod === "credito" && (
              <label className="mt-4 block text-sm text-stone-600">
                Parcelas
                <select
                  value={info.installments}
                  onChange={(e) => onChange({ ...info, installments: Number(e.target.value) })}
                  className="mt-1 w-40 rounded-lg border border-stone-200 px-3 py-2 text-sm text-black outline-none focus:border-black"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}x de {formatCurrency(totalToPay / n)}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-stone-400">Resumo</div>
          <div className="mt-3 space-y-2 text-sm text-stone-600">
            <div className="flex justify-between">
              <span>{device.name} {device.storage}</span>
              <span>{formatCurrency(device.price)}</span>
            </div>
            {tradeInModel && (
              <div className="flex justify-between text-stone-600">
                <span>Troca ({tradeInModel.name})</span>
                <span>-{formatCurrency(tradeInValue)}</span>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
            <span className="text-sm font-medium text-black">Total a pagar</span>
            <span className="text-xl font-semibold text-black">{formatCurrency(totalToPay)}</span>
          </div>

          <button
            type="button"
            disabled={!canContinue}
            onClick={onContinue}
            className="mt-5 w-full rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            Continuar
          </button>
        </aside>
      </div>
    </div>
  );
}
