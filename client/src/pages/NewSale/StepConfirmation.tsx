import { formatCurrency, formatDate } from "../../api";
import type { ChecklistOption, CrmOpportunity, Device, PaymentFee, Sale, TradeInModel, WarrantyOption } from "../../types";
import type { CustomerSelection } from "./StepCliente";
import { PrimaryButton, SecondaryButton } from "../../components/ui";

interface Props {
  customer: CustomerSelection;
  device: Device;
  tradeInModel: TradeInModel | null;
  tradeInValue: number;
  answers: Record<string, ChecklistOption>;
  paymentMethod: string;
  warranty: WarrantyOption | undefined;
  fee: PaymentFee | undefined;
  finalTotal: number;
  submitting: boolean;
  error: string | null;
  result: Sale | null;
  linkedOpportunity: CrmOpportunity | null;
  onFinalize: () => void;
  onStartNewSale: () => void;
}

export function StepConfirmation({
  customer,
  device,
  tradeInModel,
  tradeInValue,
  answers,
  warranty,
  fee,
  finalTotal,
  submitting,
  error,
  result,
  linkedOpportunity,
  onFinalize,
  onStartNewSale,
}: Props) {
  const clientName = customer.name || "Cliente";

  if (result) {
    return (
      <div className="flex justify-center">
        <div className="w-[480px] rounded-[20px] border border-cr-border bg-white p-8">
          <div className="flex flex-col items-center gap-2.5 text-center">
            <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-cr-accent">
              <CheckIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-display text-xl font-bold">Venda concluída</div>
              <div className="mt-0.5 text-[12.5px] text-cr-muted">
                Pedido #{result.orderNumber} · {formatDate(result.createdAt)}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col border-t border-cr-border-light">
            <ReceiptRow label="Cliente" value={result.customerName} />
            <ReceiptRow label="iPhone vendido" value={result.deviceName} />
            {result.hasTradeIn && (
              <ReceiptRow label="Aparelho na troca" value={`${result.tradeInModelName} · ${formatCurrency(result.tradeInFinalValue)}`} />
            )}
            <ReceiptRow label="Forma de pagamento" value={result.paymentLabel} />
            <ReceiptRow label="Garantia" value={result.warrantyLabel} />
            <div className="flex items-center justify-between pt-3.5">
              <span className="text-[14.5px] font-bold">Total pago</span>
              <span className="font-display text-2xl font-bold">{formatCurrency(result.totalToPay)}</span>
            </div>
          </div>

          {result.crmOpportunityClosed && <div className="mt-4 rounded-xl bg-cr-bg px-4 py-3 text-[11.5px] text-cr-secondary"><span className="font-bold">CRM atualizado:</span> “{result.crmOpportunityClosed.title}” foi movida para Venda concluída.</div>}

          <div className="mt-5 flex gap-2.5">
            <SecondaryButton className="flex-1 print:hidden" onClick={() => window.print()}>
              Imprimir comprovante
            </SecondaryButton>
            <PrimaryButton onClick={onStartNewSale} className="flex-1 print:hidden">
              Nova venda
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-display text-xl font-bold">Confirme os dados da venda</h1>

      <div className="mt-5 rounded-2xl border border-cr-border bg-white p-[18px]">
        <ReceiptRow label="Cliente" value={clientName} />
        <ReceiptRow label="Aparelho vendido" value={`${device.name} ${device.storage}`} />
        <ReceiptRow label="Valor do aparelho" value={formatCurrency(device.price)} />
        {tradeInModel && (
          <>
            <ReceiptRow label="Aparelho na troca" value={tradeInModel.name} />
            <ReceiptRow label="Valor da troca" value={`-${formatCurrency(tradeInValue)}`} />
            <ReceiptRow label="Avaliação" value={Object.values(answers).map((a) => a.label).join(", ")} small />
          </>
        )}
        {warranty && <ReceiptRow label="Garantia" value={warranty.label} />}
        {fee && <ReceiptRow label="Pagamento" value={fee.label} />}
        <div className="mt-1 flex items-center justify-between border-t border-cr-border-light pt-3">
          <span className="text-sm font-bold">Total a pagar</span>
          <span className="font-display text-xl font-bold">{formatCurrency(finalTotal)}</span>
        </div>
      </div>

      {linkedOpportunity && <div className="mt-3 flex items-center gap-3 rounded-xl border border-cr-border bg-white px-4 py-3"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cr-accent text-sm text-white">✓</div><div><div className="text-[11.5px] font-bold">Oportunidade vinculada</div><div className="text-[11px] text-cr-muted">“{linkedOpportunity.title}” será marcada como Venda concluída.</div></div></div>}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex justify-end">
        <PrimaryButton disabled={submitting} onClick={onFinalize}>
          {submitting ? "Finalizando..." : "Finalizar venda"}
        </PrimaryButton>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-cr-border-light py-2.5 last:border-0">
      <span className="text-[13px] text-cr-muted">{label}</span>
      <span className={`text-right font-semibold ${small ? "text-xs text-cr-muted" : "text-[13px]"}`}>{value || "—"}</span>
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 10.5 8 14l8-9" />
    </svg>
  );
}
