import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api, formatCurrency } from "../../api";
import type { ChecklistOption, CrmOpportunity, Device, PaymentFee, Sale, TradeInModel, WarrantyOption } from "../../types";
import { WizardStepper } from "../../components/WizardStepper";
import { StepCliente, type CustomerSelection } from "./StepCliente";
import { StepModel } from "./StepModel";
import { StepTradeIn } from "./StepTradeIn";
import { StepEvaluation } from "./StepEvaluation";
import { StepPayment, type PaymentInfo } from "./StepPayment";
import { StepConfirmation } from "./StepConfirmation";

const emptyCustomer: CustomerSelection = { mode: "existente", customerId: null, name: "", phone: "", cpf: "" };
const emptyPayment: PaymentInfo = { paymentMethod: "", warrantyKey: "padrao" };

export function NewSaleWizard() {
  const location = useLocation();
  const preselectedCustomerId = (location.state as { customerId?: string } | null)?.customerId;

  const [step, setStep] = useState(1);
  const [customer, setCustomer] = useState<CustomerSelection>(
    preselectedCustomerId ? { ...emptyCustomer, customerId: preselectedCustomerId } : emptyCustomer,
  );
  const [device, setDevice] = useState<Device | null>(null);
  const [hasTradeIn, setHasTradeIn] = useState<boolean | null>(null);
  const [tradeInModel, setTradeInModel] = useState<TradeInModel | null>(null);
  const [answers, setAnswers] = useState<Record<string, ChecklistOption>>({});
  const [tradeInValue, setTradeInValue] = useState(0);
  const [payment, setPayment] = useState<PaymentInfo>(emptyPayment);
  const [totals, setTotals] = useState({ feePercent: 0, feeValue: 0, finalTotal: 0 });
  const [fees, setFees] = useState<PaymentFee[]>([]);
  const [warrantyOptions, setWarrantyOptions] = useState<WarrantyOption[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Sale | null>(null);
  const [linkedOpportunity, setLinkedOpportunity] = useState<CrmOpportunity | null>(null);

  useEffect(() => {
    api.getPaymentFees().then(setFees);
    api.getWarrantyOptions().then(setWarrantyOptions);
  }, []);

  useEffect(() => {
    if (!customer.customerId) { Promise.resolve().then(() => setLinkedOpportunity(null)); return; }
    api.getCustomer(customer.customerId).then((detail) => {
      setLinkedOpportunity(detail.opportunities.find((item) => !["venda_concluida", "perdido"].includes(item.stage)) ?? null);
    });
  }, [customer.customerId]);

  function resetAll() {
    setStep(1);
    setCustomer(emptyCustomer);
    setDevice(null);
    setHasTradeIn(null);
    setTradeInModel(null);
    setAnswers({});
    setTradeInValue(0);
    setPayment(emptyPayment);
    setError(null);
    setResult(null);
    setLinkedOpportunity(null);
  }

  async function handleFinalize() {
    if (!device) return;
    setSubmitting(true);
    setError(null);
    try {
      const sale = await api.createSale({
        customer: customer.customerId
          ? { id: customer.customerId, name: customer.name, phone: customer.phone }
          : { name: customer.name, phone: customer.phone, cpf: customer.cpf || undefined },
        deviceId: device.id,
        hasTradeIn: !!hasTradeIn,
        tradeInModelId: tradeInModel?.id,
        checklistAnswers: Object.values(answers).map((a) => a.id),
        warrantyKey: payment.warrantyKey,
        paymentMethod: payment.paymentMethod,
        opportunityId: linkedOpportunity?.id,
      });
      setResult(sale);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao finalizar a venda");
    } finally {
      setSubmitting(false);
    }
  }

  const breadcrumb =
    step === 1
      ? "Voltar ao início"
      : step === 2
        ? `Cliente: ${customer.name || "—"}`
        : device
          ? `${device.name} ${device.storage} · ${formatCurrency(device.price)}`
          : "Nova venda";

  return (
    <div className="mx-auto max-w-5xl px-11 py-8">
      <div className="mb-6 flex items-center gap-2 text-[12.5px] font-semibold text-cr-muted">
        {step > 1 ? (
          <button type="button" onClick={() => setStep((s) => Math.max(1, s - 1))} className="hover:text-cr-secondary">
            ← {breadcrumb}
          </button>
        ) : (
          <Link to="/" className="hover:text-cr-secondary">
            ← {breadcrumb}
          </Link>
        )}
      </div>

      <div className="mb-8">
        <WizardStepper current={step} />
      </div>

      {step === 1 && <StepCliente value={customer} onChange={setCustomer} onContinue={() => setStep(2)} />}

      {step === 2 && <StepModel selected={device} onSelect={setDevice} onContinue={() => setStep(3)} />}

      {step === 3 && (
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
          onContinue={() => setStep(hasTradeIn ? 4 : 5)}
        />
      )}

      {step === 4 && tradeInModel && (
        <StepEvaluation
          tradeInModel={tradeInModel}
          answers={answers}
          onAnswer={(categoryId, option) => setAnswers((prev) => ({ ...prev, [categoryId]: option }))}
          onContinue={(finalValue) => {
            setTradeInValue(finalValue);
            setStep(5);
          }}
        />
      )}

      {step === 5 && device && (
        <StepPayment
          device={device}
          tradeInModel={hasTradeIn ? tradeInModel : null}
          tradeInValue={hasTradeIn ? tradeInValue : 0}
          info={payment}
          onChange={setPayment}
          onContinue={(t) => {
            setTotals(t);
            setStep(6);
          }}
        />
      )}

      {step === 6 && device && (
        <StepConfirmation
          customer={customer}
          device={device}
          tradeInModel={hasTradeIn ? tradeInModel : null}
          tradeInValue={hasTradeIn ? tradeInValue : 0}
          answers={answers}
          paymentMethod={payment.paymentMethod}
          warranty={warrantyOptions.find((w) => w.key === payment.warrantyKey)}
          fee={fees.find((f) => f.key === payment.paymentMethod)}
          finalTotal={totals.finalTotal}
          submitting={submitting}
          error={error}
          result={result}
          linkedOpportunity={linkedOpportunity}
          onFinalize={handleFinalize}
          onStartNewSale={resetAll}
        />
      )}
    </div>
  );
}
