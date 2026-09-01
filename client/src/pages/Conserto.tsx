import { useEffect, useState } from "react";
import { api, formatCurrency } from "../api";
import type { DefectOption } from "../types";
import { PrimaryButton } from "../components/ui";

const MODELS = ["iPhone 12", "iPhone 13", "iPhone 14", "iPhone 14 Pro", "iPhone 15", "iPhone 15 Pro"];

export function Conserto() {
  const [defectOptions, setDefectOptions] = useState<DefectOption[]>([]);
  const [deadlines, setDeadlines] = useState<string[]>([]);

  const [model, setModel] = useState(MODELS[0]);
  const [color, setColor] = useState("");
  const [imei, setImei] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [deadlineLabel, setDeadlineLabel] = useState("");
  const [selectedDefects, setSelectedDefects] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getDefectOptions().then((d) => setDefectOptions(d));
    api.getRepairDeadlines().then((d) => {
      setDeadlines(d);
      setDeadlineLabel(d[1] ?? d[0]);
    });
  }, []);

  const chosenDefects = defectOptions.filter((d) => selectedDefects[d.id]);
  const budget = chosenDefects.reduce((s, d) => s + d.price, 0);
  const canSubmit = customerName.trim().length > 1 && !!deadlineLabel;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await api.createRepair({
        customerName,
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
      setSelectedDefects({});
      setNotes("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao registrar aparelho");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-11 py-7">
      <div>
        <div className="font-display text-xl font-bold">Receber aparelho para conserto</div>
        <div className="mt-0.5 text-[12.5px] text-cr-muted">Registre o modelo e os defeitos identificados no recebimento</div>
      </div>

      {success && (
        <div className="mt-4 rounded-xl border border-cr-ink bg-cr-bg px-4 py-3 text-[13px] font-semibold">
          Aparelho registrado com sucesso.
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[400px_1fr]">
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-3 rounded-2xl border border-cr-border bg-white p-[18px]">
            <div className="text-[13.5px] font-bold">Modelo do aparelho</div>
            <div className="flex flex-wrap gap-1.5">
              {MODELS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModel(m)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    model === m ? "border-[1.4px] border-cr-ink bg-cr-ink text-white" : "border-[1.4px] border-cr-border bg-white text-cr-secondary"
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
            <Field label="Nome do cliente">
              <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Nome completo" className="input" />
            </Field>
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
                    deadlineLabel === d ? "border-[1.4px] border-cr-ink bg-cr-ink text-white" : "border-[1.4px] border-cr-border bg-white text-cr-secondary"
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
            <div className="grid grid-cols-3 gap-2">
              {defectOptions.map((d) => {
                const sel = !!selectedDefects[d.id];
                return (
                  <div
                    key={d.id}
                    onClick={() => setSelectedDefects((prev) => ({ ...prev, [d.id]: !sel }))}
                    className={`flex cursor-pointer items-center gap-2 rounded-[10px] px-2.5 py-2.5 text-xs font-semibold ${
                      sel ? "border-[1.4px] border-cr-ink bg-cr-bg" : "border-[1.4px] border-cr-border bg-white text-cr-secondary"
                    }`}
                  >
                    <div className={`h-3.5 w-3.5 flex-shrink-0 rounded-[4px] border-[1.4px] ${sel ? "border-cr-ink bg-cr-ink" : "border-cr-dot"}`} />
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
              className="h-16 resize-none rounded-[10px] border-[1.4px] border-cr-border px-3.5 py-2.5 text-[13px] outline-none focus:border-cr-ink"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-between rounded-2xl bg-cr-ink p-[18px]">
            <div>
              <div className="text-[11.5px] font-semibold uppercase tracking-wide text-cr-sidebar-muted">Orçamento estimado</div>
              <div className="mt-0.5 font-display text-xl font-bold text-white">
                {chosenDefects.length ? formatCurrency(budget) : "A definir após diagnóstico"}
              </div>
            </div>
            <PrimaryButton disabled={!canSubmit || submitting} onClick={handleSubmit} className="bg-white text-cr-ink">
              {submitting ? "Registrando..." : "Registrar aparelho"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 pt-1">
      <label className="text-[11.5px] font-semibold text-cr-muted">{label}</label>
      {children}
    </div>
  );
}
