import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api, formatCurrency, formatDate, initials } from "../api";
import type { CrmBoard, CrmOpportunity, CustomerSummary, StaffUser } from "../types";

export function Crm() {
  const navigate = useNavigate();
  const [board, setBoard] = useState<CrmBoard | null>(null);
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CrmOpportunity | null>(null);
  const [pendingLost, setPendingLost] = useState<CrmOpportunity | null>(null);
  const [moving, setMoving] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [staffFilter, setStaffFilter] = useState("");
  const [pipeline, setPipeline] = useState<"vendas" | "assistencia">("vendas");
  const load = () => api.getCrmBoard(pipeline).then(setBoard);

  useEffect(() => { Promise.all([api.getCrmBoard(pipeline), api.getCustomers(), api.getStaff()]).then(([b, c, s]) => { setBoard(b); setCustomers(c); setStaff(s); }); }, [pipeline]);
  const totalPipeline = useMemo(() => board?.opportunities.filter((o) => !["perdido", "venda_concluida", "cancelado", "servico_concluido"].includes(o.stage)).reduce((sum, o) => sum + o.value, 0) ?? 0, [board]);
  const overdue = board?.tasks.filter((task) => new Date(task.dueAt) < new Date()).length ?? 0;

  async function moveTo(opportunity: CrmOpportunity, stage: string, lostReason?: string) {
    if (stage === opportunity.stage) return;
    if (["perdido", "cancelado"].includes(stage) && !lostReason) { setPendingLost(opportunity); return; }
    setMoving(opportunity.id);
    await api.updateOpportunity(opportunity.id, { stage, lostReason: ["perdido", "cancelado"].includes(stage) ? lostReason : null });
    await load(); setMoving(null); setDragOver(null);
  }
  async function move(opportunity: CrmOpportunity, direction: number) {
    if (!board) return;
    const target = board.stages[board.stages.findIndex((stage) => stage.key === opportunity.stage) + direction];
    if (target) await moveTo(opportunity, target.key);
  }

  if (!board) return <div className="px-5 py-6 text-sm text-cr-muted sm:px-8 lg:px-11">Carregando CRM...</div>;
  const filtered = board.opportunities.filter((item) => {
    const term = search.trim().toLowerCase();
    const textMatch = !term || item.title.toLowerCase().includes(term) || item.customer?.name.toLowerCase().includes(term) || item.customer?.phone.includes(term);
    return textMatch && (!staffFilter || item.assignedTo?.id === staffFilter || (staffFilter === "sem_responsavel" && !item.assignedTo));
  });

  return <div className="min-w-0 px-5 py-6 sm:px-8 sm:py-7">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="m-0 font-display text-2xl font-bold">CRM</h1><p className="mt-1 text-[12.5px] text-cr-muted">Acompanhe vendas e serviços em um só lugar</p></div><button onClick={() => setShowForm(true)} className="rounded-xl bg-cr-accent px-5 py-3 text-[13px] font-bold text-white">+ Nova oportunidade</button></div>
    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3"><Metric label="Pipeline aberto" value={formatCurrency(totalPipeline)} /><Metric label="Oportunidades" value={String(board.opportunities.length)} /><Metric label="Tarefas atrasadas" value={String(overdue)} alert={overdue > 0} /></div>

    <div className="mt-5 inline-flex rounded-xl border border-cr-border bg-white p-1"><button onClick={() => setPipeline("vendas")} className={`rounded-lg px-4 py-2 text-[12px] font-bold ${pipeline === "vendas" ? "bg-cr-accent text-white" : "text-cr-muted"}`}>Vendas</button><button onClick={() => setPipeline("assistencia")} className={`rounded-lg px-4 py-2 text-[12px] font-bold ${pipeline === "assistencia" ? "bg-cr-accent text-white" : "text-cr-muted"}`}>Assistência técnica</button></div>

    {board.opportunities.length > 0 && <div className="mt-5 flex flex-wrap items-center gap-2.5"><input value={search} onChange={(e) => setSearch(e.target.value)} className="input max-w-sm flex-1 bg-white" placeholder="Buscar cliente, telefone ou oportunidade" /><select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)} className="input max-w-56 flex-1 bg-white"><option value="">Todos os responsáveis</option><option value="sem_responsavel">Sem responsável</option>{staff.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select>{(search || staffFilter) && <button onClick={() => { setSearch(""); setStaffFilter(""); }} className="px-2 text-[11.5px] font-semibold text-cr-muted">Limpar filtros</button>}<span className="text-[10.5px] text-cr-muted sm:ml-auto">Arraste os cartões para mudar de etapa</span></div>}

    <div className="mt-5 -mx-1 overflow-x-auto px-1 lg:overflow-visible">
    <div className="grid auto-cols-[220px] grid-flow-col gap-2.5 lg:auto-cols-fr lg:grid-flow-row lg:grid-cols-6">
      {board.stages.map((stage, stageIndex) => {
        const items = filtered.filter((item) => item.stage === stage.key);
        return <section key={stage.key} onDragOver={(e) => { e.preventDefault(); setDragOver(stage.key); }} onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null); }} onDrop={(e) => { e.preventDefault(); const item = board.opportunities.find((opportunity) => opportunity.id === e.dataTransfer.getData("text/opportunity")); if (item) moveTo(item, stage.key); }} className={`min-w-0 rounded-2xl border p-2.5 transition-colors ${dragOver === stage.key ? "border-cr-accent bg-[#e2dfd6]" : "border-[#e5e2da] bg-[#eeece6]"}`}>
          <div className="flex items-center justify-between px-1.5 pb-2.5 pt-1"><span className="truncate pr-1 text-[10px] font-bold uppercase tracking-wide text-cr-secondary">{stage.label}</span><span className="rounded-full bg-white px-2 py-0.5 text-[10.5px] font-bold text-cr-muted">{items.length}</span></div>
          <div className="flex flex-col gap-2">{items.map((opportunity) => <article key={opportunity.id} draggable onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/opportunity", opportunity.id); }} onDragEnd={() => setDragOver(null)} className={`cursor-grab rounded-xl border border-cr-border bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,.03)] active:cursor-grabbing ${moving === opportunity.id ? "opacity-50" : ""}`}>
            <button onClick={() => setEditing(opportunity)} className="w-full text-left"><div className="flex items-center gap-2"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cr-chip text-[10px] font-bold">{initials(opportunity.customer?.name ?? "")}</span><span className="truncate text-[11.5px] font-bold">{opportunity.customer?.name}</span></div><div className="mt-2 line-clamp-2 text-[12px] font-semibold text-cr-secondary">{opportunity.title}</div><div className="mt-2 font-display text-[14px] font-bold">{formatCurrency(opportunity.value)}</div>{opportunity.nextActionAt && <div className="mt-2 text-[10px] text-cr-muted">Próxima ação: {formatDate(opportunity.nextActionAt)}</div>}{opportunity.assignedTo && <div className="mt-1 truncate text-[10px] text-cr-muted">{opportunity.assignedTo.name}</div>}</button>
            <div className="mt-2.5 flex items-center justify-between border-t border-cr-border-light pt-2"><button disabled={stageIndex === 0 || moving === opportunity.id} onClick={() => move(opportunity, -1)} className="text-xs text-cr-muted disabled:opacity-20">←</button><button onClick={() => navigate(`/clientes/${opportunity.customerId}`)} className="text-[9.5px] font-semibold text-cr-muted hover:text-cr-ink">Ver cliente</button><button disabled={stageIndex === board.stages.length - 1 || moving === opportunity.id} onClick={() => move(opportunity, 1)} className="text-xs font-semibold text-cr-secondary disabled:opacity-20">Avançar →</button></div>
          </article>)}{items.length === 0 && <div className="flex min-h-20 items-center justify-center rounded-xl border border-dashed border-[#d5d2c8] px-2 text-center text-[10.5px] leading-relaxed text-cr-muted">Solte uma<br />oportunidade aqui</div>}</div>
        </section>;
      })}
    </div>
    </div>

    <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)]"><div className="rounded-2xl border border-cr-border bg-white"><div className="border-b border-cr-border px-4 py-3 text-sm font-bold">Próximas tarefas</div>{board.tasks.length === 0 ? <p className="px-4 py-5 text-xs text-cr-muted">Nenhuma tarefa pendente.</p> : board.tasks.map((task) => <div key={task.id} className="flex items-center gap-3 border-b border-cr-border-light px-4 py-3 last:border-0"><button onClick={async () => { await api.updateCrmTask(task.id, true); load(); }} className="h-4 w-4 rounded border border-cr-muted" /><div className="min-w-0 flex-1"><div className="truncate text-[12.5px] font-semibold">{task.title}</div><div className="text-[10.5px] text-cr-muted">{task.customer?.name}</div></div><span className={`text-[11px] ${new Date(task.dueAt) < new Date() ? "font-bold text-red-600" : "text-cr-muted"}`}>{formatDate(task.dueAt)}</span></div>)}</div><div className="rounded-2xl border border-cr-border bg-white p-4"><div className="text-sm font-bold">Visão rápida</div><div className="mt-4 flex flex-col gap-3"><QuickLine label={pipeline === "assistencia" ? "Em reparo" : "Em negociação"} value={String(board.opportunities.filter((i) => i.stage === (pipeline === "assistencia" ? "em_reparo" : "negociacao")).length)} /><QuickLine label={pipeline === "assistencia" ? "Serviços concluídos" : "Vendas concluídas"} value={String(board.opportunities.filter((i) => i.stage === (pipeline === "assistencia" ? "servico_concluido" : "venda_concluida")).length)} /><QuickLine label="Taxa de conclusão" value={`${conversionRate(board, pipeline)}%`} /></div></div></div>
    {showForm && <OpportunityModal pipeline={pipeline} customers={customers} staff={staff} stages={board.stages} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    {editing && <OpportunityModal opportunity={editing} customers={customers} staff={staff} stages={board.stages} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    {pendingLost && <LostModal opportunity={pendingLost} onClose={() => setPendingLost(null)} onConfirm={async (reason) => { await moveTo(pendingLost, pipeline === "assistencia" ? "cancelado" : "perdido", reason); setPendingLost(null); }} />}
  </div>;
}

function Metric({ label, value, alert }: { label: string; value: string; alert?: boolean }) { return <div className="rounded-2xl border border-cr-border bg-white p-4"><div className="text-[10.5px] font-bold uppercase text-cr-muted">{label}</div><div className={`mt-1 font-display text-xl font-bold ${alert ? "text-red-600" : ""}`}>{value}</div></div>; }
function QuickLine({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between border-b border-cr-border-light pb-3 last:border-0 last:pb-0"><span className="text-[11.5px] text-cr-muted">{label}</span><span className="font-display text-sm font-bold">{value}</span></div>; }
function conversionRate(board: CrmBoard, pipeline: "vendas" | "assistencia") { const won = pipeline === "assistencia" ? "servico_concluido" : "venda_concluida"; const lost = pipeline === "assistencia" ? "cancelado" : "perdido"; const decided = board.opportunities.filter((i) => [won, lost].includes(i.stage)).length; return decided ? Math.round(board.opportunities.filter((i) => i.stage === won).length / decided * 100) : 0; }
function localDate(value?: string | null) { if (!value) return ""; const date = new Date(value); return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }

function OpportunityModal({ opportunity, pipeline = "vendas", customers, staff, stages, onClose, onSaved }: { opportunity?: CrmOpportunity; pipeline?: "vendas" | "assistencia"; customers: CustomerSummary[]; staff: StaffUser[]; stages: { key: string; label: string }[]; onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); setSaving(true); const d = new FormData(e.currentTarget); const payload = { customerId: opportunity?.customerId ?? d.get("customerId"), pipeline, title: d.get("title"), value: d.get("value"), source: d.get("source"), notes: d.get("notes"), stage: d.get("stage"), nextActionAt: d.get("nextActionAt"), assignedToId: d.get("assignedToId") }; if (opportunity) await api.updateOpportunity(opportunity.id, payload); else await api.createOpportunity(payload); onSaved(); }
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}><form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl"><div className="flex items-center justify-between"><h2 className="m-0 font-display text-lg font-bold">{opportunity ? "Editar oportunidade" : "Nova oportunidade"}</h2><button type="button" onClick={onClose} className="text-xl text-cr-muted">×</button></div><div className="mt-4 grid grid-cols-2 gap-3">
    <label className="col-span-2 text-xs font-semibold">Cliente<select required disabled={!!opportunity} defaultValue={opportunity?.customerId ?? ""} name="customerId" className="input mt-1 bg-white disabled:bg-cr-bg"><option value="">Selecione...</option>{customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    <label className="col-span-2 text-xs font-semibold">Oportunidade<input required defaultValue={opportunity?.title} name="title" className="input mt-1" placeholder="Ex.: Galaxy S24 256 GB" /></label>
    <label className="text-xs font-semibold">Valor estimado<input defaultValue={opportunity?.value} name="value" type="number" min="0" step="0.01" className="input mt-1" /></label><label className="text-xs font-semibold">Etapa<select defaultValue={opportunity?.stage ?? "novo_lead"} name="stage" className="input mt-1 bg-white">{stages.filter((s) => s.key !== "perdido" || opportunity?.stage === "perdido").map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}</select></label>
    <label className="text-xs font-semibold">Origem<select defaultValue={opportunity?.source ?? (pipeline === "assistencia" ? "Assistência técnica" : "WhatsApp")} name="source" className="input mt-1 bg-white"><option>WhatsApp</option><option>Indicação</option><option>Instagram</option><option>Loja</option><option>Site</option><option>Assistência técnica</option></select></label><label className="text-xs font-semibold">Responsável<select defaultValue={opportunity?.assignedTo?.id ?? ""} name="assignedToId" className="input mt-1 bg-white"><option value="">Sem responsável</option>{staff.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
    <label className="col-span-2 text-xs font-semibold">Próximo contato<input defaultValue={localDate(opportunity?.nextActionAt)} name="nextActionAt" type="datetime-local" className="input mt-1" /></label><label className="col-span-2 text-xs font-semibold">Observações<textarea defaultValue={opportunity?.notes ?? ""} name="notes" className="input mt-1 min-h-20 resize-none" placeholder="Detalhes da negociação" /></label>
  </div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-xl border border-cr-border px-4 py-2.5 text-xs font-bold">Cancelar</button><button disabled={saving} className="rounded-xl bg-cr-accent px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">{saving ? "Salvando..." : opportunity ? "Salvar alterações" : "Criar oportunidade"}</button></div></form></div>;
}

function LostModal({ opportunity, onClose, onConfirm }: { opportunity: CrmOpportunity; onClose: () => void; onConfirm: (reason: string) => Promise<void> }) {
  const [reason, setReason] = useState(""); const [saving, setSaving] = useState(false);
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 p-4"><form onSubmit={async (e) => { e.preventDefault(); setSaving(true); await onConfirm(reason); }} className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"><h2 className="m-0 font-display text-lg font-bold">Marcar como perdida</h2><p className="mt-1 text-xs text-cr-muted">Informe por que “{opportunity.title}” não avançou.</p><label className="mt-4 block text-xs font-semibold">Motivo<textarea autoFocus required value={reason} onChange={(e) => setReason(e.target.value)} className="input mt-1 min-h-24 resize-none" placeholder="Ex.: cliente desistiu, preço, sem retorno..." /></label><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={onClose} className="rounded-xl border border-cr-border px-4 py-2.5 text-xs font-bold">Cancelar</button><button disabled={saving} className="rounded-xl bg-cr-accent px-4 py-2.5 text-xs font-bold text-white">Confirmar</button></div></form></div>;
}
