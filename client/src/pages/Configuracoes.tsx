import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";
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
          <div className="mt-0.5 text-[12.5px] text-cr-muted">Marca da loja, taxas, valores de troca e mensagens de atendimento</div>
        </div>
        <PrimaryButton onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : "Salvar alterações"}
        </PrimaryButton>
      </div>

      {saved && <div className="mt-3 text-[13px] font-semibold text-cr-ink">Alterações salvas.</div>}

      <BrandSection />

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

function BrandSection() {
  const { session, updateStore } = useAuth();
  const store = session?.store;
  const isOwner = session?.user.isOwner;
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!store) return null;

  function pickFile() {
    fileRef.current?.click();
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError(null);
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function confirmUpload() {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);
    try {
      const updated = await api.uploadStoreLogo(selectedFile);
      updateStore(updated);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao enviar a logo");
    } finally {
      setUploading(false);
    }
  }

  function cancelPreview() {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  }

  async function removeLogo() {
    setUploading(true);
    setError(null);
    try {
      const updated = await api.removeStoreLogo();
      updateStore(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao remover a logo");
    } finally {
      setUploading(false);
    }
  }

  const displayLogoUrl = previewUrl ?? store.logoUrl;

  return (
    <div className="mt-5 rounded-2xl border border-cr-border bg-white p-[18px]">
      <div className="text-sm font-bold">Marca da loja</div>
      <div className="mt-1 text-[10.5px] text-cr-muted">
        Envie a logo da sua loja. Ela aparece no menu lateral exatamente como no preview abaixo.
      </div>

      <div className="mt-4 flex items-center gap-5">
        <div className="flex h-24 w-52 flex-shrink-0 items-center rounded-xl bg-cr-sidebar px-4">
          {displayLogoUrl ? (
            <div className="inline-block rounded-xl bg-white p-2">
              <img src={displayLogoUrl} alt={store.name} className="h-9 max-w-[150px] object-contain" />
            </div>
          ) : (
            <div className="font-display text-lg font-bold text-white">{store.name}</div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {isOwner ? (
            <>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={onFileChange} />

              {selectedFile ? (
                <div className="flex gap-2">
                  <button
                    onClick={confirmUpload}
                    disabled={uploading}
                    className="rounded-lg bg-cr-ink px-3.5 py-2 text-xs font-bold text-white disabled:opacity-50"
                  >
                    {uploading ? "Enviando..." : "Confirmar e usar essa logo"}
                  </button>
                  <button onClick={cancelPreview} className="rounded-lg border border-cr-border px-3.5 py-2 text-xs font-bold">
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={pickFile} className="rounded-lg bg-cr-ink px-3.5 py-2 text-xs font-bold text-white">
                    {store.logoUrl ? "Trocar logo" : "Enviar logo"}
                  </button>
                  {store.logoUrl && (
                    <button
                      onClick={removeLogo}
                      disabled={uploading}
                      className="rounded-lg border border-cr-border px-3.5 py-2 text-xs font-bold text-cr-secondary disabled:opacity-50"
                    >
                      Remover
                    </button>
                  )}
                </div>
              )}
              <div className="text-[10.5px] text-cr-muted">PNG, JPG, WEBP ou SVG · até 3MB</div>
              {error && <div className="text-[11px] font-semibold text-red-600">{error}</div>}
            </>
          ) : (
            <div className="text-[10.5px] font-semibold text-cr-secondary">Apenas o dono da loja pode alterar a marca.</div>
          )}
        </div>
      </div>
    </div>
  );
}
