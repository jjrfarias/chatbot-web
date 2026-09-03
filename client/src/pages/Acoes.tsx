import { useEffect, useState } from "react";
import { api, formatDate } from "../api";
import type { CrmActions, CrmTask } from "../types";
import { WhatsAppComposer } from "../components/WhatsAppComposer";

export function Acoes() {
  const [actions, setActions] = useState<CrmActions | null>(null);
  const [contact, setContact] = useState<CrmTask | null>(null);
  const load = () => api.getCrmActions().then(setActions);
  useEffect(() => { load(); }, []);
  if (!actions) return <div className="px-5 py-6 text-sm text-cr-muted sm:px-8 lg:px-11">Preparando ações...</div>;
  const total = actions.overdue.length + actions.today.length;
  return <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8 sm:py-7 lg:px-11">
    <div><h1 className="m-0 font-display text-2xl font-bold">Ações de hoje</h1><p className="mt-1 text-[12.5px] text-cr-muted">Retornos e acompanhamentos gerados automaticamente</p></div>
    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3"><Metric label="Prioridades" value={total} dark={total > 0} /><Metric label="Atrasadas" value={actions.overdue.length} /><Metric label="Próximos 7 dias" value={actions.upcoming.length} /></div>
    <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3"><ActionColumn title="Atrasadas" tasks={actions.overdue} tone="danger" onComplete={async (task) => { await api.updateCrmTask(task.id, true); load(); }} onContact={setContact} /><ActionColumn title="Hoje" tasks={actions.today} tone="dark" onComplete={async (task) => { await api.updateCrmTask(task.id, true); load(); }} onContact={setContact} /><ActionColumn title="Próximos dias" tasks={actions.upcoming} onComplete={async (task) => { await api.updateCrmTask(task.id, true); load(); }} onContact={setContact} /></div>
    {contact?.customer && <WhatsAppComposer customerId={contact.customer.id} customerName={contact.customer.name} phone={contact.customer.phone} recommendedKey={templateFor(contact)} variables={{ modelo: contact.opportunity?.title ?? "", valor: contact.opportunity ? contact.opportunity.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "", status: contact.opportunity?.stage.replaceAll("_", " ") ?? "" }} onClose={() => setContact(null)} onSent={load} />}
  </div>;
}

function ActionColumn({ title, tasks, tone, onComplete, onContact }: { title: string; tasks: CrmTask[]; tone?: "danger" | "dark"; onComplete: (task: CrmTask) => void; onContact: (task: CrmTask) => void }) {
  return <section className="rounded-2xl border border-cr-border bg-white"><div className="flex items-center justify-between border-b border-cr-border px-4 py-3"><span className="text-[12px] font-bold">{title}</span><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tone === "danger" ? "bg-red-50 text-red-600" : tone === "dark" ? "bg-cr-accent text-white" : "bg-cr-chip text-cr-muted"}`}>{tasks.length}</span></div><div className="p-2.5">{tasks.map((task) => <div key={task.id} className="mb-2 rounded-xl border border-cr-border-light p-3 last:mb-0"><div className="text-[12px] font-bold">{task.title}</div><div className="mt-1 text-[10.5px] text-cr-muted">{task.customer?.name} · {formatDate(task.dueAt)}</div><div className="mt-3 flex gap-2"><button onClick={() => onComplete(task)} className="rounded-lg border border-cr-border px-2.5 py-1.5 text-[10.5px] font-bold">Concluir</button>{task.customer?.phone && <button onClick={() => onContact(task)} className="rounded-lg bg-[#25D366] px-2.5 py-1.5 text-[10.5px] font-bold text-white">WhatsApp</button>}</div></div>)}{tasks.length === 0 && <div className="px-2 py-8 text-center text-[11px] text-cr-muted">Nenhuma ação</div>}</div></section>;
}
function Metric({ label, value, dark }: { label: string; value: number; dark?: boolean }) { return <div className={`rounded-2xl border p-4 ${dark ? "border-cr-accent bg-cr-accent text-white" : "border-cr-border bg-white"}`}><div className={`text-[10.5px] font-bold uppercase ${dark ? "text-cr-sidebar-muted" : "text-cr-muted"}`}>{label}</div><div className="mt-1 font-display text-xl font-bold">{value}</div></div>; }
function templateFor(task: CrmTask) { if (task.automationKey?.startsWith("pagamento")) return "pagamento_pendente"; if (task.automationKey?.startsWith("aprovacao")) return "orcamento_conserto"; if (task.automationKey?.startsWith("pos_venda")) return "pos_venda"; return "retorno_negociacao"; }
