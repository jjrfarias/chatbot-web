import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, formatCurrency, formatDate, initials, maskCpf } from "../api";
import type { CustomerDetail } from "../types";
import { Badge } from "../components/ui";
import { WhatsAppComposer } from "../components/WhatsAppComposer";

export function ClientePerfil() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const load = useCallback(() => { if (id) api.getCustomer(id).then(setCustomer); }, [id]);
  useEffect(load, [load]);

  if (!customer) return <div className="px-5 py-6 text-sm text-cr-muted sm:px-8 lg:px-11">Carregando...</div>;

  return (
    <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8 sm:py-7 lg:px-11">
      <Link to="/clientes" className="flex items-center gap-2.5 text-[12.5px] font-semibold text-cr-muted hover:text-cr-secondary">
        <BackIcon className="h-4 w-4" /> Voltar para clientes
      </Link>

      <div className="mt-4 flex flex-col gap-5 lg:flex-row">
        <div className="flex w-full flex-col gap-3.5 lg:w-80 lg:flex-shrink-0">
          <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-cr-border bg-white p-[22px] text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cr-accent font-display text-[22px] font-bold text-white">
              {initials(customer.name)}
            </div>
            <div>
              <div className="font-display text-lg font-bold">{customer.name}</div>
              <div className="mt-0.5 text-xs text-cr-muted">
                Cliente desde {new Date(customer.createdAt).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
              </div>
            </div>
            {customer.status !== "Ativo" && <Badge tone={customer.status === "VIP" ? "dark" : "muted"}>Cliente {customer.status}</Badge>}
            <div className="mt-1 flex w-full flex-col gap-2 border-t border-cr-border-light pt-2">
              <div className="flex items-center gap-2.5 text-[12.5px] text-cr-secondary">
                <PhoneIcon className="h-[15px] w-[15px] text-cr-muted" /> {customer.phone}
              </div>
              <div className="flex items-center gap-2.5 text-[12.5px] text-cr-secondary">
                <CpfIcon className="h-[15px] w-[15px] text-cr-muted" /> CPF {maskCpf(customer.cpf)}
              </div>
            </div>
          </div>

          <div className="flex gap-2.5">
            <MiniStat label="Total gasto" value={formatCurrency(customer.totalSpent)} />
            <MiniStat label="Vendas" value={String(customer.salesCount)} />
            <MiniStat label="Consertos" value={String(customer.repairsCount)} />
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => setShowWhatsApp(true)}
              className="rounded-xl bg-[#25D366] py-3 text-center text-[13px] font-bold text-white"
            >
              Conversar no WhatsApp
            </button>
            <button
              onClick={() => navigate("/nova-venda", { state: { customerId: customer.id } })}
              className="rounded-xl bg-cr-accent py-3 text-center text-[13px] font-bold text-white"
            >
              Nova venda para este cliente
            </button>
            <button
              onClick={() => setShowEdit(true)}
              className="rounded-xl border-[1.6px] border-cr-accent py-3 text-center text-[13px] font-bold text-cr-accent"
            >
              Editar dados
            </button>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <CrmPanel customer={customer} reload={load} />
          <div className="text-sm font-bold">Histórico de atendimentos</div>
          <div className="overflow-hidden rounded-2xl border border-cr-border bg-white">
            {customer.history.length === 0 ? (
              <p className="p-5 text-sm text-cr-muted">Nenhum atendimento registrado ainda.</p>
            ) : (
              customer.history.map((h, i) => (
                <div key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-cr-border-light px-[18px] py-3.5 last:border-0 hover:bg-cr-bg">
                  <Badge>{h.type}</Badge>
                  <div className="min-w-0 flex-[2.4] truncate text-[13px] font-semibold">{h.detail}</div>
                  <div className="hidden flex-[1.6] text-[12.5px] text-cr-secondary sm:block">{formatDate(h.date)}</div>
                  <div className="text-[13px] font-semibold">{formatCurrency(h.value)}</div>
                  <div className="ml-auto">
                    <Badge tone={h.status.includes("concluíd") ? "dark" : "light"}>{h.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>

          {customer.notes && (
            <div className="flex flex-col gap-1.5 rounded-2xl border border-cr-border bg-white px-[18px] py-4">
              <div className="text-[11.5px] font-semibold uppercase tracking-wide text-cr-muted">Observações</div>
              <div className="text-[13px] leading-relaxed text-cr-secondary">{customer.notes}</div>
            </div>
          )}
        </div>
      </div>
      {showWhatsApp && <WhatsAppComposer customerId={customer.id} customerName={customer.name} phone={customer.phone} recommendedKey="primeiro_contato" onClose={() => setShowWhatsApp(false)} onSent={load} />}
      {showEdit && (
        <EditCustomerModal
          customer={customer}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            setShowEdit(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function EditCustomerModal({
  customer,
  onClose,
  onSaved,
}: {
  customer: CustomerDetail;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [cpf, setCpf] = useState(customer.cpf ?? "");
  const [notes, setNotes] = useState(customer.notes ?? "");
  const [vip, setVip] = useState(customer.vip);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.updateCustomer(customer.id, {
        name: name.trim(),
        phone: phone.trim(),
        cpf: cpf.trim() || null,
        notes: notes.trim() || null,
        vip,
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao salvar dados do cliente");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="m-0 font-display text-lg font-bold">Editar dados</h2>
          <button type="button" onClick={onClose} className="text-xl text-cr-muted">
            ×
          </button>
        </div>

        <label className="mt-4 block text-xs font-semibold text-cr-muted">
          Nome completo
          <input required value={name} onChange={(e) => setName(e.target.value)} className="input mt-1" />
        </label>
        <label className="mt-3 block text-xs font-semibold text-cr-muted">
          Telefone
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} className="input mt-1" />
        </label>
        <label className="mt-3 block text-xs font-semibold text-cr-muted">
          CPF
          <input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" className="input mt-1" />
        </label>
        <label className="mt-3 block text-xs font-semibold text-cr-muted">
          Observações
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input mt-1 min-h-20 resize-none" />
        </label>
        <label className="mt-3 flex items-center gap-2 text-xs font-semibold text-cr-muted">
          <input type="checkbox" checked={vip} onChange={(e) => setVip(e.target.checked)} /> Cliente VIP
        </label>

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-cr-border px-4 py-2.5 text-xs font-bold">
            Cancelar
          </button>
          <button disabled={saving} className="rounded-xl bg-cr-accent px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex-1 rounded-[14px] border border-cr-border bg-white p-3.5">
      <div className="truncate text-[10.5px] font-semibold uppercase text-cr-muted">{label}</div>
      <div className="truncate font-display text-[19px] font-bold">{value}</div>
    </div>
  );
}

function CrmPanel({ customer, reload }: { customer: CustomerDetail; reload: () => void }) {
  const [interaction, setInteraction] = useState("");
  const [interactionType, setInteractionType] = useState("whatsapp");
  const [taskTitle, setTaskTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [tag, setTag] = useState("");

  async function saveInteraction(event: FormEvent) {
    event.preventDefault();
    await api.createInteraction({ customerId: customer.id, type: interactionType, content: interaction });
    setInteraction(""); reload();
  }
  async function saveTask(event: FormEvent) {
    event.preventDefault();
    await api.createCrmTask({ customerId: customer.id, title: taskTitle, dueAt });
    setTaskTitle(""); setDueAt(""); reload();
  }
  async function saveTag(event: FormEvent) {
    event.preventDefault();
    await api.addCustomerTag(customer.id, tag);
    setTag(""); reload();
  }

  return <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
    <div className="sm:col-span-2 rounded-2xl border border-cr-border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><div className="text-sm font-bold">Relacionamento</div><div className="flex flex-wrap justify-end gap-1.5">{customer.tags.map((item) => <span key={item.id} className="rounded-full bg-cr-chip px-2.5 py-1 text-[10.5px] font-semibold">{item.name}</span>)}</div></div>
      <form onSubmit={saveTag} className="mt-3 flex gap-2"><input value={tag} onChange={(e) => setTag(e.target.value)} required className="input" placeholder="Nova etiqueta" /><button className="rounded-lg border border-cr-border px-3 text-xs font-bold">Adicionar</button></form>
    </div>
    <form onSubmit={saveInteraction} className="rounded-2xl border border-cr-border bg-white p-4">
      <div className="text-[12px] font-bold">Registrar contato</div>
      <select value={interactionType} onChange={(e) => setInteractionType(e.target.value)} className="input mt-3 bg-white"><option value="whatsapp">WhatsApp</option><option value="ligacao">Ligação</option><option value="loja">Atendimento na loja</option><option value="nota">Observação</option></select>
      <textarea value={interaction} onChange={(e) => setInteraction(e.target.value)} required className="input mt-2 min-h-20 resize-none" placeholder="O que foi conversado?" />
      <button className="mt-2 rounded-lg bg-cr-accent px-3 py-2 text-[11px] font-bold text-white">Salvar contato</button>
    </form>
    <form onSubmit={saveTask} className="rounded-2xl border border-cr-border bg-white p-4">
      <div className="text-[12px] font-bold">Agendar próxima ação</div>
      <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required className="input mt-3" placeholder="Ex.: Retornar orçamento" />
      <input value={dueAt} onChange={(e) => setDueAt(e.target.value)} required type="datetime-local" className="input mt-2" />
      <button className="mt-2 rounded-lg bg-cr-accent px-3 py-2 text-[11px] font-bold text-white">Criar tarefa</button>
    </form>
    {(customer.tasks.length > 0 || customer.interactions.length > 0) && <div className="sm:col-span-2 rounded-2xl border border-cr-border bg-white">
      <div className="border-b border-cr-border px-4 py-3 text-[12px] font-bold">Atividades recentes</div>
      {customer.tasks.filter((item) => !item.completed).slice(0, 3).map((item) => <div key={item.id} className="flex items-center gap-2 border-b border-cr-border-light px-4 py-2.5 text-[11.5px]"><button onClick={async () => { await api.updateCrmTask(item.id, true); reload(); }} className="h-4 w-4 rounded border border-cr-muted" /><span className="flex-1 font-semibold">{item.title}</span><span className="text-cr-muted">{formatDate(item.dueAt)}</span></div>)}
      {customer.interactions.slice(0, 4).map((item) => <div key={item.id} className="border-b border-cr-border-light px-4 py-2.5 last:border-0"><div className="flex justify-between text-[10px] uppercase text-cr-muted"><span>{item.type}</span><span>{formatDate(item.createdAt)}</span></div><div className="mt-1 text-[11.5px] text-cr-secondary">{item.content}</div></div>)}
    </div>}
  </div>;
}

function BackIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 4 6 10l6 6" />
    </svg>
  );
}
function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 4h3l1.5 4-2 1.3a11 11 0 0 0 5.2 5.2l1.3-2 4 1.5v3a1 1 0 0 1-1.1 1C9.5 17.4 2.6 10.5 3 4.1 3 3.5 3.4 4 4 4Z" />
    </svg>
  );
}
function CpfIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="14" height="12" rx="2" />
      <path d="M6 8h4M6 11h6" />
    </svg>
  );
}
