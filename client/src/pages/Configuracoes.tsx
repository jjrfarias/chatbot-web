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
                  className="w-14 rounded-lg border-[1.4px] border-cr-border px-2 py-1.5 text-right text-[13px] outline-none focus:border-cr-accent"
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
                  className="w-[72px] rounded-lg border-[1.4px] border-cr-border px-2 py-1.5 text-right text-[13px] outline-none focus:border-cr-accent"
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

const LOGO_BG_PRESETS = ["#ffffff", "#121210", "#f6f5f2", "#0d0d0c"];
const ACCENT_PRESETS = ["#121210", "#1d4ed8", "#059669", "#b91c1c", "#7c3aed", "#c2410c", "#0f766e", "#a21caf"];

function BrandSection() {
  const { session, updateStore } = useAuth();
  const store = session?.store;
  const isOwner = session?.user.isOwner;
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [logoBg, setLogoBg] = useState(store?.logoBackgroundColor || "#ffffff");
  const [accent, setAccent] = useState(store?.primaryColor || "#121210");
  const [logoSize, setLogoSize] = useState(store?.logoSize || 1);
  const [savingColors, setSavingColors] = useState(false);
  const [colorsSaved, setColorsSaved] = useState(false);
  const [colorsError, setColorsError] = useState<string | null>(null);

  useEffect(() => {
    if (store) {
      setLogoBg(store.logoBackgroundColor || "#ffffff");
      setAccent(store.primaryColor || "#121210");
      setLogoSize(store.logoSize || 1);
    }
  }, [store?.logoBackgroundColor, store?.primaryColor, store?.logoSize]);

  if (!store) return null;

  const colorsChanged =
    logoBg !== (store.logoBackgroundColor || "#ffffff") ||
    accent !== (store.primaryColor || "#121210") ||
    logoSize !== (store.logoSize || 1);

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

  async function saveColors() {
    setSavingColors(true);
    setColorsSaved(false);
    setColorsError(null);
    try {
      const updated = await api.updateStore({ logoBackgroundColor: logoBg, primaryColor: accent, logoSize });
      updateStore(updated);
      setColorsSaved(true);
    } catch (e) {
      setColorsError(e instanceof Error ? e.message : "Erro ao salvar as cores");
    } finally {
      setSavingColors(false);
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
        <div className="flex h-24 w-52 flex-shrink-0 items-center justify-center rounded-xl bg-cr-sidebar px-4">
          {displayLogoUrl ? (
            <div className="rounded-xl p-2" style={{ backgroundColor: logoBg }}>
              <img
                src={displayLogoUrl}
                alt={store.name}
                className="object-contain"
                style={{ height: `${36 * logoSize}px`, maxWidth: `${Math.min(150 * logoSize, 180)}px` }}
              />
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
                    className="rounded-lg bg-cr-accent px-3.5 py-2 text-xs font-bold text-white disabled:opacity-50"
                  >
                    {uploading ? "Enviando..." : "Confirmar e usar essa logo"}
                  </button>
                  <button onClick={cancelPreview} className="rounded-lg border border-cr-border px-3.5 py-2 text-xs font-bold">
                    Cancelar
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={pickFile} className="rounded-lg bg-cr-accent px-3.5 py-2 text-xs font-bold text-white">
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

      {isOwner && (
        <div className="mt-5 grid grid-cols-2 gap-5 border-t border-cr-border-light pt-5">
          <div>
            <div className="text-[12px] font-bold">Cor de fundo da logo</div>
            <div className="mt-0.5 text-[10.5px] text-cr-muted">O quadro atrás da sua logo no menu.</div>
            <ColorPicker presets={LOGO_BG_PRESETS} value={logoBg} onChange={setLogoBg} />

            <div className="mt-4 text-[12px] font-bold">Tamanho da logo</div>
            <div className="mt-0.5 text-[10.5px] text-cr-muted">Deixe a logo maior ou menor no menu.</div>
            <div className="mt-2.5 flex items-center gap-2.5">
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.1}
                value={logoSize}
                onChange={(e) => setLogoSize(Number(e.target.value))}
                className="w-40"
              />
              <span className="text-[11px] font-mono text-cr-muted">{Math.round(logoSize * 100)}%</span>
            </div>
          </div>
          <div>
            <div className="text-[12px] font-bold">Cor de destaque do sistema</div>
            <div className="mt-0.5 text-[10.5px] text-cr-muted">Usada em botões e destaques em todo o app.</div>
            <ColorPicker presets={ACCENT_PRESETS} value={accent} onChange={setAccent} />
            <button
              type="button"
              style={{ backgroundColor: accent }}
              className="mt-2.5 rounded-lg px-3.5 py-2 text-xs font-bold text-white"
            >
              Botão de exemplo
            </button>
          </div>

          {colorsChanged && (
            <div className="col-span-2 flex items-center gap-2.5">
              <button
                onClick={saveColors}
                disabled={savingColors}
                className="rounded-lg bg-cr-accent px-3.5 py-2 text-xs font-bold text-white disabled:opacity-50"
              >
                {savingColors ? "Salvando..." : "Salvar marca"}
              </button>
              <button
                onClick={() => {
                  setLogoBg(store.logoBackgroundColor || "#ffffff");
                  setAccent(store.primaryColor || "#121210");
                  setLogoSize(store.logoSize || 1);
                  setColorsError(null);
                }}
                className="rounded-lg border border-cr-border px-3.5 py-2 text-xs font-bold"
              >
                Cancelar
              </button>
            </div>
          )}
          {colorsSaved && !colorsChanged && <div className="col-span-2 text-[11px] font-semibold text-cr-ink">Marca salva.</div>}
          {colorsError && <div className="col-span-2 text-[11px] font-semibold text-red-600">{colorsError}</div>}
        </div>
      )}
    </div>
  );
}

function ColorPicker({ presets, value, onChange }: { presets: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mt-2.5 flex flex-wrap items-center gap-2">
      {presets.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          title={color}
          style={{ backgroundColor: color }}
          className={`h-7 w-7 rounded-full border-2 ${value.toLowerCase() === color.toLowerCase() ? "border-cr-accent" : "border-cr-border"}`}
        />
      ))}
      <label className="relative flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-cr-border">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <span className="pointer-events-none text-[13px]">🎨</span>
      </label>
      <span className="text-[11px] font-mono uppercase text-cr-muted">{value}</span>
    </div>
  );
}
