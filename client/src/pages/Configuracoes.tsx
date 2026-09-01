import { useEffect, useState } from "react";
import { api } from "../api";
import type { CrmMessageTemplate, PaymentFee, TradeInModel } from "../types";
import { PrimaryButton } from "../components/ui";

export function Configuracoes() {
  const [fees, setFees] = useState<PaymentFee[]>([]);
  const [models, setModels] = useState<TradeInModel[]>([]);
  const [templates, setTemplates] = useState<CrmMessageTemplate[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getPaymentFees().then(setFees);
    api.getTradeInModels().then(setModels);
    api.getMessageTemplates().then(setTemplates);
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await Promise.all([
        api.updatePaymentFees(fees.map((f) => ({ id: f.id, feePercent: f.feePercent }))),
        api.updateTradeInModels(models.map((m) => ({ id: m.id, baseValue: m.baseValue }))),
        api.updateMessageTemplates(templates.map((item) => ({ id: item.id, content: item.content, active: item.active }))),
      ]);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-11 py-7">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-xl font-bold">Configurações</div>
          <div className="mt-0.5 text-[12.5px] text-cr-muted">Taxas, valores de troca e mensagens de atendimento</div>
        </div>
        <PrimaryButton onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : "Salvar alterações"}
        </PrimaryButton>
      </div>

      {saved && <div className="mt-3 text-[13px] font-semibold text-cr-ink">Alterações salvas.</div>}

      <div className="mt-5 grid grid-cols-2 gap-5">
        <div className="flex flex-col gap-1 rounded-2xl border border-cr-border bg-white p-[18px]">
          <div className="mb-2 text-sm font-bold">Taxas das maquininhas</div>
          {fees.map((f) => (
            <div key={f.id} className="flex items-center justify-between border-b border-cr-border-light py-2.5 last:border-0">
              <span className="text-[13px] text-cr-secondary">{f.label}</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={f.feePercent}
                  step={0.1}
                  onChange={(e) =>
                    setFees((prev) => prev.map((x) => (x.id === f.id ? { ...x, feePercent: Number(e.target.value) } : x)))
                  }
                  className="w-14 rounded-lg border-[1.4px] border-cr-border px-2 py-1.5 text-right text-[13px] outline-none focus:border-cr-ink"
                />
                <span className="text-[12.5px] text-cr-muted">%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1 rounded-2xl border border-cr-border bg-white p-[18px]">
          <div className="mb-2 text-sm font-bold">Valores base de troca</div>
          {models.map((m) => (
            <div key={m.id} className="flex items-center justify-between border-b border-cr-border-light py-2.5 last:border-0">
              <span className="text-[13px] text-cr-secondary">{m.name}</span>
              <div className="flex items-center gap-1">
                <span className="text-[12.5px] text-cr-muted">R$</span>
                <input
                  type="number"
                  value={m.baseValue}
                  onChange={(e) =>
                    setModels((prev) => prev.map((x) => (x.id === m.id ? { ...x, baseValue: Number(e.target.value) } : x)))
                  }
                  className="w-[72px] rounded-lg border-[1.4px] border-cr-border px-2 py-1.5 text-right text-[13px] outline-none focus:border-cr-ink"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-cr-border bg-white p-[18px]">
        <div className="text-sm font-bold">Modelos de mensagem do WhatsApp</div>
        <div className="mt-1 text-[10.5px] text-cr-muted">Use {`{{nome}}, {{modelo}}, {{valor}} e {{status}}`} para preencher dados automaticamente.</div>
        <div className="mt-4 grid grid-cols-2 gap-3">{templates.map((item) => <div key={item.id} className="rounded-xl border border-cr-border-light p-3"><div className="flex items-center justify-between"><div><div className="text-[12px] font-bold">{item.name}</div><div className="text-[9.5px] uppercase text-cr-muted">{item.category}</div></div><label className="flex items-center gap-1.5 text-[10.5px] text-cr-muted"><input type="checkbox" checked={item.active} onChange={(e) => setTemplates((current) => current.map((template) => template.id === item.id ? { ...template, active: e.target.checked } : template))} /> Ativo</label></div><textarea value={item.content} onChange={(e) => setTemplates((current) => current.map((template) => template.id === item.id ? { ...template, content: e.target.value } : template))} className="input mt-2 min-h-24 resize-none text-[11.5px] leading-relaxed" /></div>)}</div>
      </div>
    </div>
  );
}
