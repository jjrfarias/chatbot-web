import { useState } from "react";
import { Link } from "react-router-dom";
import { api, formatCurrency } from "../../api";
import type { ChecklistOption, Device, Sale, TradeInModel } from "../../types";
import { WizardStepper } from "../../components/WizardStepper";
import { StepModel } from "./StepModel";
import { StepTradeIn } from "./StepTradeIn";
import { StepEvaluation } from "./StepEvaluation";
import { StepPayment, type PaymentInfo } from "./StepPayment";
import { StepConfirmation } from "./StepConfirmation";

const emptyPayment: PaymentInfo = {
  customerName: "",
  customerPhone: "",
  paymentMethod: "",
  installments: 1,
};

export function NewSaleWizard() {
  const [step, setStep] = useState(1);

  const [device, setDevice] = useState<Device | null>(null);
  const [hasTradeIn, setHasTradeIn] = useState<boolean | null>(null);
  const [tradeInModel, setTradeInModel] = useState<TradeInModel | null>(null);
  const [answers, setAnswers] = useState<Record<string, ChecklistOption>>({});
  const [tradeInValue, setTradeInValue] = useState(0);
  const [payment, setPayment] = useState<PaymentInfo>(emptyPayment);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Sale | null>(null);

  function resetAll() {
    setStep(1);
    setDevice(null);
    setHasTradeIn(null);
    setTradeInModel(null);
    setAnswers({});
    setTradeInValue(0);
    setPayment(emptyPayment);
    setError(null);
    setResult(null);
  }

  async function handleFinalize() {
    if (!device) return;
    setSubmitting(true);
    setError(null);
    try {
      const sale = await api.createSale({
        customerName: payment.customerName,
        customerPhone: payment.customerPhone,
        deviceId: device.id,
        hasTradeIn: !!hasTradeIn,
        tradeInModelId: tradeInModel?.id,
        checklistAnswers: Object.values(answers).map((a) => a.id),
        paymentMethod: payment.paymentMethod,
        installments: payment.installments,
      });
      setResult(sale);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao finalizar a venda");
    } finally {
      setSubmitting(false);
    }
  }

  const breadcrumb = device ? `${device.name} ${device.storage} · ${formatCurrency(device.price)}` : "Nova venda";

  return (
    <div className="mx-auto max-w-5xl px-8 py-8">
      <div className="mb-6 flex items-center gap-2 text-sm text-stone-400">
        {step > 1 ? (
          <button type="button" onClick={() => setStep((s) => Math.max(1, s - 1))} className="hover:text-stone-600">
            ← {breadcrumb}
          </button>
        ) : (
          <Link to="/" className="hover:text-stone-600">
            ← Voltar
          </Link>
        )}
      </div>

      <div className="mb-8">
        <WizardStepper current={step} />
      </div>

      {step === 1 && (
        <StepModel selected={device} onSelect={setDevice} onContinue={() => setStep(2)} />
      )}

      {step === 2 && (
        <StepTradeIn
          hasTradeIn={hasTradeIn}
          onSetHasTradeIn={(v) => {
            setHasTradeIn(v);
            if (!v) {
              setTradeInModel(null);
              setAnswers({});
              setTradeInValue(0);
            }
          }}
          selected={tradeInModel}
          onSelect={setTradeInModel}
          onContinue={() => setStep(hasTradeIn ? 3 : 4)}
        />
      )}

      {step === 3 && tradeInModel && (
        <StepEvaluation
          tradeInModel={tradeInModel}
          answers={answers}
          onAnswer={(categoryId, option) => setAnswers((prev) => ({ ...prev, [categoryId]: option }))}
          onContinue={(finalValue) => {
            setTradeInValue(finalValue);
            setStep(4);
          }}
        />
      )}

      {step === 4 && device && (
        <StepPayment
          device={device}
          tradeInModel={hasTradeIn ? tradeInModel : null}
          tradeInValue={hasTradeIn ? tradeInValue : 0}
          info={payment}
          onChange={setPayment}
          onContinue={() => setStep(5)}
        />
      )}

      {step === 5 && device && (
        <StepConfirmation
          device={device}
          tradeInModel={hasTradeIn ? tradeInModel : null}
          tradeInValue={hasTradeIn ? tradeInValue : 0}
          answers={answers}
          payment={payment}
          submitting={submitting}
          error={error}
          result={result}
          onFinalize={handleFinalize}
          onStartNewSale={resetAll}
        />
      )}
    </div>
  );
}
