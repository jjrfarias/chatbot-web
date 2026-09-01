import { useEffect, useState } from "react";
import { api, formatCurrency } from "../../api";
import type { Device, PaymentFee, TradeInModel, WarrantyOption } from "../../types";
import { PrimaryButton } from "../../components/ui";

export interface PaymentInfo {
  paymentMethod: string;
  warrantyKey: string;
}

interface Props {
  device: Device;
  tradeInModel: TradeInModel | null;
  tradeInValue: number;
  info: PaymentInfo;
  onChange: (info: PaymentInfo) => void;
  onContinue: (totals: { feePercent: number; feeValue: number; finalTotal: number }) => void;
}

export function StepPayment({ device, tradeInModel, tradeInValue, info, onChange, onContinue }: Props) {
  const [fees, setFees] = useState<PaymentFee[]>([]);
  const [warrantyOptions, setWarrantyOptions] = useState<WarrantyOption[]>([]);

  useEffect(() => {
    api.getPaymentFees().then(setFees);
    api.getWarrantyOptions().then(setWarrantyOptions);
  }, []);

  const diff = Math.max(0, device.price - tradeInValue);
  const warranty = warrantyOptions.find((w) => w.key === info.warrantyKey) ?? warrantyOptions[0];
  const warrantyPrice = warranty?.price ?? 0;
  const base = diff + warrantyPrice;

  const isParcelado = /^credito\d+x$/.test(info.paymentMethod);
  const currentFee = fees.find((f) => f.key === info.paymentMethod);
  const feePercent = currentFee?.feePercent ?? 0;
  const feeValue = base * (feePercent / 100);
  const finalTotal = base + feeValue;

  const installmentFees = fees
    .filter((f) => /^credito\d+x$/.test(f.key))
    .sort((a, b) => Number(a.key.replace(/\D/g, "")) - Number(b.key.replace(/\D/g, "")));

  const mainMethods = [
    { key: "pix", label: "Pix", sub: "à vista · sem taxa" },
    { key: "debito", label: "Débito", sub: `taxa de ${fees.find((f) => f.key === "debito")?.feePercent ?? 0}%` },
    { key: "creditoVista", label: "Crédito à vista", sub: `taxa de ${fees.find((f) => f.key === "creditoVista")?.feePercent ?? 0}%` },
    { key: "creditoParcelado", label: "Crédito parcelado", sub: "taxa por parcela" },
  ];

  const canContinue = !!info.paymentMethod && !!warranty;

  return (
    <div>
      <h1 className="font-display text-xl font-bold">Pagamento e garantia</h1>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-3 rounded-2xl border border-cr-border bg-white p-[18px]">
            <div className="text-sm font-bold">Forma de pagamento</div>
            <div className="grid grid-cols-2 gap-2.5">
              {mainMethods.map((m) => {
                const sel = m.key === "creditoParcelado" ? isParcelado : info.paymentMethod === m.key;
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...info,
                        paymentMethod: m.key === "creditoParcelado" ? (isParcelado ? info.paymentMethod : "credito2x") : m.key,
                      })
                    }
                    className={`rounded-xl p-3 text-left ${sel ? "border-[1.6px] border-cr-ink bg-cr-ink text-white" : "border-[1.6px] border-cr-border bg-white text-cr-ink"}`}
                  >
                    <div className="text-[13px] font-bold">{m.label}</div>
                    <div className="text-[11px] opacity-70">{m.sub}</div>
                  </button>
                );
              })}
            </div>

            {isParcelado && (
              <div className="flex flex-wrap gap-2 border-t border-cr-border-light pt-1">
                {installmentFees.map((f) => {
                  const n = Number(f.key.replace(/\D/g, ""));
                  const parcelValue = (base * (1 + f.feePercent / 100)) / n;
                  const sel = info.paymentMethod === f.key;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => onChange({ ...info, paymentMethod: f.key })}
                      className={`rounded-[10px] px-3 py-2 ${sel ? "border-[1.4px] border-cr-ink bg-cr-ink text-white" : "border-[1.4px] border-cr-border bg-white text-cr-ink"}`}
                    >
                      <div className="text-xs font-bold">{n}x</div>
                      <div className="text-[10.5px] opacity-70">{formatCurrency(parcelValue)}/mês</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2.5 rounded-2xl border border-cr-border bg-white p-[18px]">
            <div className="text-sm font-bold">Garantia</div>
            {warrantyOptions.map((w) => {
              const sel = info.warrantyKey === w.key;
              return (
                <div
                  key={w.key}
                  onClick={() => onChange({ ...info, warrantyKey: w.key })}
                  className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 ${sel ? "border-[1.4px] border-cr-ink bg-cr-bg" : "border-[1.4px] border-cr-border bg-white"}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`h-[15px] w-[15px] flex-shrink-0 rounded-full border-[1.6px] ${sel ? "border-cr-ink bg-cr-ink" : "border-cr-dot"}`} />
                    <div>
                      <div className="text-[13px] font-bold">{w.label}</div>
                      <div className="text-[11.5px] text-cr-muted">{w.description}</div>
                    </div>
                  </div>
                  <div className="text-[13px] font-bold">{w.price === 0 ? "Grátis" : formatCurrency(w.price)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="flex h-fit flex-col gap-2.5 rounded-2xl border border-cr-border bg-white p-[18px]">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-cr-muted">Resumo</div>
          <Row label={`${device.name} ${device.storage}`} value={formatCurrency(device.price)} />
          {tradeInModel && <Row label={`Troca · ${tradeInModel.name}`} value={`− ${formatCurrency(tradeInValue)}`} />}
          <div className="border-t border-cr-border-light pt-2">
            <Row label="Diferença" value={formatCurrency(diff)} />
          </div>
          <Row label="Garantia" value={warrantyPrice === 0 ? "Grátis" : formatCurrency(warrantyPrice)} />
          <Row label={currentFee ? `${currentFee.label} · taxa` : "Forma de pagamento"} value={feeValue === 0 ? "Sem taxa" : `+ ${formatCurrency(feeValue)}`} />
          <div className="mt-1 flex items-center justify-between border-t border-cr-ink pt-2.5">
            <span className="text-sm font-bold">Total a cobrar</span>
            <span className="font-display text-xl font-bold">{formatCurrency(finalTotal)}</span>
          </div>
          <PrimaryButton disabled={!canContinue} onClick={() => onContinue({ feePercent, feeValue, finalTotal })} className="mt-1 w-full">
            Continuar
          </PrimaryButton>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[12.5px]">
      <span className="text-cr-secondary">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
