import { Link } from "react-router-dom";
import { formatCurrency } from "../../api";
import type { ChecklistOption, Device, Sale, TradeInModel } from "../../types";
import type { PaymentInfo } from "./StepPayment";

const PAYMENT_LABELS: Record<string, string> = {
  pix: "Pix",
  dinheiro: "Dinheiro",
  debito: "Cartão de débito",
  credito: "Cartão de crédito",
};

interface Props {
  device: Device;
  tradeInModel: TradeInModel | null;
  tradeInValue: number;
  answers: Record<string, ChecklistOption>;
  payment: PaymentInfo;
  submitting: boolean;
  error: string | null;
  result: Sale | null;
  onFinalize: () => void;
  onStartNewSale: () => void;
}

export function StepConfirmation({
  device,
  tradeInModel,
  tradeInValue,
  answers,
  payment,
  submitting,
  error,
  result,
  onFinalize,
  onStartNewSale,
}: Props) {
  const totalToPay = Math.max(0, device.price - tradeInValue);

  if (result) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-black text-white">
          <CheckIcon className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-black">Venda concluída!</h1>
        <p className="mt-1 text-sm text-stone-500">
          {result.deviceName} vendido para {result.customerName} por {formatCurrency(result.totalToPay)}.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={onStartNewSale}
            className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white"
          >
            Nova venda
          </button>
          <Link
            to="/historico"
            className="rounded-lg border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-700"
          >
            Ver histórico
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold text-black">Confirme os dados da venda</h1>

      <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-5">
        <Row label="Cliente" value={payment.customerName} />
        <Row label="Telefone" value={payment.customerPhone} />
        <Row label="Aparelho vendido" value={`${device.name} ${device.storage}`} />
        <Row label="Valor do aparelho" value={formatCurrency(device.price)} />
        {tradeInModel && (
          <>
            <Row label="Aparelho na troca" value={tradeInModel.name} />
            <Row label="Valor da troca" value={`-${formatCurrency(tradeInValue)}`} />
            <Row
              label="Avaliação"
              value={Object.values(answers)
                .map((a) => a.label)
                .join(", ")}
              small
            />
          </>
        )}
        <Row
          label="Pagamento"
          value={
            payment.paymentMethod === "credito"
              ? `${PAYMENT_LABELS[payment.paymentMethod]} · ${payment.installments}x`
              : PAYMENT_LABELS[payment.paymentMethod]
          }
        />
        <div className="mt-3 flex items-center justify-between border-t border-stone-100 pt-3">
          <span className="text-sm font-medium text-black">Total a pagar</span>
          <span className="text-xl font-semibold text-black">{formatCurrency(totalToPay)}</span>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          disabled={submitting}
          onClick={onFinalize}
          className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Finalizando..." : "Finalizar venda"}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-stone-100 py-2.5 last:border-0">
      <span className="text-sm text-stone-500">{label}</span>
      <span className={`text-right font-medium text-black ${small ? "text-xs text-stone-500" : "text-sm"}`}>
        {value || "—"}
      </span>
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} {...props}>
      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
