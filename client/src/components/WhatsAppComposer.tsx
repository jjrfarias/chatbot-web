import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api";
import type { CrmMessageTemplate } from "../types";

type Variables = Record<string, string>;
const EMPTY_VARIABLES: Variables = {};

export function WhatsAppComposer({ customerId, customerName, phone, variables = EMPTY_VARIABLES, recommendedKey, onClose, onSent }: { customerId: string; customerName: string; phone: string; variables?: Variables; recommendedKey?: string; onClose: () => void; onSent?: () => void }) {
  const [templates, setTemplates] = useState<CrmMessageTemplate[]>([]);
  const [selectedKey, setSelectedKey] = useState(recommendedKey ?? "");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const values = useMemo<Record<string, string>>(() => ({ nome: customerName.split(" ")[0], ...variables }), [customerName, variables]);
  const render = useCallback((content: string) => content.replace(/\{\{(\w+)\}\}/g, (_, key: string) => values[key] ?? `{{${key}}}`), [values]);

  useEffect(() => { api.getMessageTemplates().then((items) => { const active = items.filter((item) => item.active); setTemplates(active); const chosen = active.find((item) => item.key === recommendedKey) ?? active[0]; if (chosen) { setSelectedKey(chosen.key); setMessage(render(chosen.content)); } }); }, [recommendedKey, render]);
  function select(key: string) { setSelectedKey(key); const template = templates.find((item) => item.key === key); if (template) setMessage(render(template.content)); }
  async function send() { setSending(true); const template = templates.find((item) => item.key === selectedKey); const popup = window.open("", "_blank"); try { const result = await api.openWhatsApp({ customerId, phone, message, templateName: template?.name }); if (popup) popup.location.href = result.url; else window.location.href = result.url; onSent?.(); onClose(); } catch (error) { popup?.close(); setSending(false); throw error; } }

  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/35 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl"><div className="flex items-center justify-between"><div><div className="font-display text-lg font-bold">Mensagem para {customerName}</div><div className="text-[11px] text-cr-muted">O contato será registrado no histórico</div></div><button onClick={onClose} className="text-xl text-cr-muted">×</button></div><label className="mt-4 block text-xs font-semibold">Modelo<select value={selectedKey} onChange={(event) => select(event.target.value)} className="input mt-1 bg-white">{templates.map((item) => <option key={item.id} value={item.key}>{item.category} · {item.name}</option>)}</select></label><label className="mt-3 block text-xs font-semibold">Mensagem<textarea value={message} onChange={(event) => setMessage(event.target.value)} className="input mt-1 min-h-36 resize-none leading-relaxed" /></label><div className="mt-2 text-[10.5px] text-cr-muted">Variáveis disponíveis: {`{{nome}}, {{modelo}}, {{valor}}, {{status}}`}</div><div className="mt-5 flex justify-end gap-2"><button onClick={onClose} className="rounded-xl border border-cr-border px-4 py-2.5 text-xs font-bold">Cancelar</button><button disabled={!message.trim() || sending} onClick={send} className="rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">{sending ? "Abrindo..." : "Abrir WhatsApp"}</button></div></div></div>;
}
