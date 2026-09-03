import { useEffect, useState } from "react";
import { api, formatCurrency } from "../api";
import type { CustomerSummary, DefectOption, Repair } from "../types";
import { Chip, PrimaryButton } from "../components/ui";
import { WhatsAppComposer } from "../components/WhatsAppComposer";

const MODEL_SUGGESTIONS = ["iPhone 13", "iPhone 15", "Galaxy S23", "Galaxy A54", "Redmi Note 12", "Moto G84"];
const REPAIR_STATUSES = ["Recebido", "Em diagnóstico", "Aguardando aprovação", "Em andamento", "Aguardando peça", "Concluído", "Cancelado"];

export function Conserto() {
  const [defectOptions, setDefectOptions] = useState<DefectOption[]>([]);
  const [deadlines, setDeadlines] = useState<string[]>([]);
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);

  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [imei, setImei] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerMode, setCustomerMode] = useState<"existente" | "novo">("existente");
  const [deadlineLabel, setDeadlineLabel] = useState("");
  const [selectedDefects, setSelectedDefects] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getDefectOptions().then((d) => setDefectOptions(d));
    api.getCustomers().then(setCustomers);
    api.getRepairs().then(setRepairs);
    api.getRepairDeadlines().then((d) => {
      setDeadlines(d);
      setDeadlineLabel(d[1] ?? d[0]);
    });
  }, []);

  const chosenDefects = defectOptions.filter((d) => selectedDefects[d.id]);
  const budget = chosenDefects.reduce((s, d) => s + d.price, 0);
  const canSubmit = customerName.trim().length > 1 && model.trim().length > 0 && !!deadlineLabel && (customerMode === "existente" ? !!customerId : customerPhone.replace(/\D/g, "").length >= 10);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const repair = await api.createRepair({
        customerName,
        customerId: customerId || undefined,
        customerPhone: customerPhone || undefined,
        model,
        color: color || undefined,
        imei: imei || undefined,
        deadlineLabel,
        defects: chosenDefects,
        notes: notes || undefined,
      });
      setSuccess(true);
      setColor("");
      setImei("");
      setCustomerName("");
      setCustomerId("");
      setCustomerPhone("");
      setSelectedDefects({});
      setNotes("");
      setRepairs((current) => [repair, ...current]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao registrar aparelho");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 sm:px-8 sm:py-7 lg:px-11">
      <div>
        <div className="font-display text-xl font-bold">Receber aparelho para conserto</div>
        <div className="mt-0.5 text-[12.5px] text-cr-muted">Registre o modelo e os defeitos identificados no recebimento</div>
      </div>

      {success && (
        <div className="mt-4 rounded-xl border border-cr-accent bg-cr-bg px-4 py-3 text-[13px] font-semibold">
          Aparelho registrado com sucesso.
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[400px_1fr]">
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-3 rounded-2xl border border-cr-border bg-white p-[18px]">
            <div className="text-[13.5px] font-bold">Modelo do aparelho</div>
            <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Ex: Galaxy S23, iPhone 13, Redmi Note 12..." className="input" />
            <div className="flex flex-wrap gap-1.5">
              {MODEL_SUGGESTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModel(m)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    model === m ? "border-[1.4px] border-cr-accent bg-cr-accent text-white" : "border-[1.4px] border-cr-border bg-white text-cr-secondary"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <Field label="Cor">
              <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Ex: Meia-noite" className="input" />
            </Field>
            <Field label="IMEI / número de série">
              <input value={imei} onChange={(e) => setImei(e.target.value)} placeholder="000000000000000" className="input" />
            </Field>
            <div className="flex gap-2"><Chip selected={customerMode === "existente"} onClick={() => setCustomerMode("existente")}>Cliente cadastrado</Chip><Chip selected={customerMode === "novo"} onClick={() => { setCustomerMode("novo"); setCustomerId(""); setCustomerName(""); }}>Novo cliente</Chip></div>
            {customerMode === "existente" ? <Field label="Cliente"><select value={customerId} onChange={(e) => { const selected = customers.find((item) => item.id === e.target.value); setCustomerId(e.target.value); setCustomerName(selected?.name ?? ""); setCustomerPhone(selected?.phone ?? ""); }} className="input bg-white"><option value="">Selecione...</option>{customers.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.phone}</option>)}</select></Field> : <><Field label="Nome do cliente"><input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nome completo" className="input" /></Field><Field label="Telefone / WhatsApp"><input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="(11) 90000-0000" className="input" /></Field></>}
          </div>

          <div className="flex flex-col gap-2.5 rounded-2xl border border-cr-border bg-white p-[18px]">
            <div className="text-[13.5px] font-bold">Prazo estimado</div>
            <div className="flex flex-wrap gap-1.5">
              {deadlines.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDeadlineLabel(d)}
                  className={`rounded-[10px] px-3.5 py-2 text-[12.5px] font-semibold ${
                    deadlineLabel === d ? "border-[1.4px] border-cr-accent bg-cr-accent text-white" : "border-[1.4px] border-cr-border bg-white text-cr-secondary"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3.5">
          <div className="flex flex-col gap-3 rounded-2xl border border-cr-border bg-white p-[18px]">
            <div className="flex items-center justify-between">
              <div className="text-[13.5px] font-bold">Defeitos identificados</div>
              <span className="text-[11px] text-cr-muted">toque para marcar</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {defectOptions.map((d) => {
                const sel = !!selectedDefects[d.id];
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDefects((prev) => ({ ...prev, [d.id]: !sel }))}
                    className={`flex cursor-pointer items-center gap-2 rounded-[10px] px-2.5 py-2.5 text-xs font-semibold ${
                      sel ? "border-[1.4px] border-cr-accent bg-cr-bg" : "border-[1.4px] border-cr-border bg-white text-cr-secondary"
                    }`}
                  >
                    <div className={`h-3.5 w-3.5 flex-shrink-0 rounded-[4px] border-[1.4px] ${sel ? "border-cr-accent bg-cr-accent" : "border-cr-dot"}`} />
                    <span>{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-2xl border border-cr-border bg-white p-[18px]">
            <label className="text-[11.5px] font-semibold text-cr-muted">Observações do atendente</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: cliente relata queda recente, aparelho liga mas trava ao abrir a câmera..."
              className="h-16 resize-none rounded-[10px] border-[1.4px] border-cr-border px-3.5 py-2.5 text-[13px] outline-none focus:border-cr-accent"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between rounded-2xl bg-cr-accent p-[18px]">
            <div>
              <div className="text-[11.5px] font-semibold uppercase tracking-wide text-cr-sidebar-muted">Orçamento estimado</div>
              <div className="mt-0.5 font-display text-xl font-bold text-white">
                {chosenDefects.length ? formatCurrency(budget) : "A definir após diagnóstico"}
              </div>
            </div>
            <PrimaryButton disabled={!canSubmit || submitting} onClick={handleSubmit} className="bg-white text-cr-accent">
              {submitting ? "Registrando..." : "Registrar aparelho"}
            </PrimaryButton>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-cr-border pt-7">
        <div className="flex items-end justify-between"><div><div className="font-display text-xl font-bold">Acompanhamento de consertos</div><div className="mt-0.5 text-[12px] text-cr-muted">Atualize o status e avise o cliente em cada etapa</div></div><div className="text-[11.5px] font-semibold text-cr-muted">{repairs.filter((item) => !["Concluído", "Cancelado"].includes(item.status)).length} em aberto</div></div>
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {repairs.map((repair) => <RepairCard key={repair.id} repair={repair} onStatus={async (status) => { const updated = await api.updateRepairStatus(repair.id, status); setRepairs((items) => items.map((item) => item.id === repair.id ? { ...item, ...updated } : item)); }} />)}
          {repairs.length === 0 && <div className="col-span-2 rounded-2xl border border-dashed border-cr-border p-8 text-center text-sm text-cr-muted">Nenhum conserto registrado.</div>}
        </div>
      </div>
    </div>
  );
}

function RepairCard({ repair, onStatus }: { repair: Repair; onStatus: (status: string) => Promise<void> }) {
  const [updating, setUpdating] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const recommendedKey = repair.status === "Aguardando aprovação" ? "orcamento_conserto" : repair.status === "Concluído" ? "aparelho_pronto" : "status_conserto";
  return <div className="rounded-2xl border border-cr-border bg-white p-4">
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="truncate text-[13px] font-bold">{repair.customerName}</div><div className="mt-0.5 text-[11.5px] text-cr-muted">{repair.model}{repair.color ? ` · ${repair.color}` : ""}</div></div><div className="font-display text-[14px] font-bold">{formatCurrency(repair.estimatedBudget)}</div></div>
    <div className="mt-3 flex flex-wrap gap-1">{repair.defects.map((defect) => <span key={defect.id} className="rounded-full bg-cr-chip px-2 py-1 text-[9.5px] font-semibold text-cr-secondary">{defect.label}</span>)}</div>
    <div className="mt-3 flex items-center gap-2 border-t border-cr-border-light pt-3"><select value={repair.status} disabled={updating} onChange={async (e) => { setUpdating(true); await onStatus(e.target.value); setUpdating(false); }} className="input min-w-0 flex-1 bg-white py-2 text-[11.5px]">{REPAIR_STATUSES.map((status) => <option key={status}>{status}</option>)}</select>{repair.customerPhone && repair.customerId ? <button onClick={() => setShowWhatsApp(true)} className="rounded-lg bg-[#25D366] px-3 py-2.5 text-[10.5px] font-bold text-white">WhatsApp</button> : <span className="text-[9.5px] text-cr-muted">Sem telefone</span>}</div>
    {showWhatsApp && repair.customerPhone && repair.customerId && <WhatsAppComposer customerId={repair.customerId} customerName={repair.customerName} phone={repair.customerPhone} recommendedKey={recommendedKey} variables={{ modelo: repair.model, valor: formatCurrency(repair.estimatedBudget), status: repair.status }} onClose={() => setShowWhatsApp(false)} />}
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 pt-1">
      <label className="text-[11.5px] font-semibold text-cr-muted">{label}</label>
      {children}
    </div>
  );
}
