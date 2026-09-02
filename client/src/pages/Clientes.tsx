import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, formatCurrency, formatDate, initials, maskCpf } from "../api";
import type { CustomerSummary } from "../types";
import { Badge, StatCard } from "../components/ui";

export function Clientes() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = () =>
    api
      .getCustomers()
      .then(setCustomers)
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.cpf ?? "").includes(q),
    );
  }, [customers, search]);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const newThisMonth = customers.filter((c) => new Date(c.createdAt) >= startOfMonth).length;
  const avgTicket = customers.length ? customers.reduce((s, c) => s + c.totalSpent, 0) / customers.length : 0;

  return (
    <div className="mx-auto max-w-6xl px-11 py-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-2xl font-bold">Clientes</div>
          <div className="mt-0.5 text-[12.5px] text-cr-muted">Toque em um cliente para ver o perfil completo</div>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-xl bg-cr-accent px-5 py-3 text-[13px] font-bold text-white"
        >
          + Novo cliente
        </button>
      </div>

      <div className="mt-5 flex gap-5">
        <StatCard label="Total de clientes" value={customers.length} />
        <StatCard label="Novos este mês" value={newThisMonth} />
        <StatCard label="Ticket médio por cliente" value={formatCurrency(avgTicket)} />
      </div>

      <div className="mt-5 flex w-[360px] items-center gap-2.5 rounded-full border border-cr-border bg-white px-[18px] py-[11px]">
        <SearchIcon className="h-[15px] w-[15px] text-cr-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, telefone ou CPF"
          className="w-full bg-transparent text-[13px] outline-none placeholder:text-cr-placeholder"
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-[14px] border border-cr-border bg-white">
        <div className="flex items-center border-b border-cr-border px-[18px] py-[11px] text-[11px] font-bold uppercase tracking-wide text-cr-muted">
          <div className="flex-[2]">Cliente</div>
          <div className="flex-[1.4]">Telefone</div>
          <div className="flex-[1.4]">CPF</div>
          <div className="flex-[1.2]">Total gasto</div>
          <div className="flex-[1.2]">Última visita</div>
          <div className="flex-[0.9] text-right">Status</div>
        </div>
        {loading ? (
          <p className="p-5 text-sm text-cr-muted">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="p-5 text-sm text-cr-muted">Nenhum cliente encontrado.</p>
        ) : (
          filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => navigate(`/clientes/${c.id}`)}
              className="flex cursor-pointer items-center border-b border-cr-border-light px-[18px] py-3.5 last:border-0 hover:bg-cr-bg"
            >
              <div className="flex flex-[2] items-center gap-2.5">
                <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-cr-chip font-display text-[11.5px] font-bold">
                  {initials(c.name)}
                </div>
                <span className="text-[13px] font-semibold">{c.name}</span>
              </div>
              <div className="flex-[1.4] text-[12.5px] text-cr-secondary">{c.phone}</div>
              <div className="flex-[1.4] text-[12.5px] text-cr-secondary">{maskCpf(c.cpf)}</div>
              <div className="flex-[1.2] text-[12.5px] font-semibold">{formatCurrency(c.totalSpent)}</div>
              <div className="flex-[1.2] text-[12.5px] text-cr-secondary">
                {c.lastVisit ? formatDate(c.lastVisit) : "—"}
              </div>
              <div className="flex-[0.9] text-right">
                <Badge tone={c.status === "VIP" ? "dark" : c.status === "Novo" ? "muted" : "light"}>{c.status}</Badge>
              </div>
            </div>
          ))
        )}
      </div>

      {showAdd && (
        <AddCustomerModal
          onClose={() => setShowAdd(false)}
          onSaved={(customer) => {
            setShowAdd(false);
            load();
            navigate(`/clientes/${customer.id}`);
          }}
        />
      )}
    </div>
  );
}

function AddCustomerModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (customer: CustomerSummary) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    try {
      const customer = await api.createCustomer({
        name: String(data.get("name") || "").trim(),
        phone: String(data.get("phone") || "").trim(),
        cpf: String(data.get("cpf") || "").trim() || undefined,
      });
      onSaved(customer);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar cliente");
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
          <h2 className="m-0 font-display text-lg font-bold">Novo cliente</h2>
          <button type="button" onClick={onClose} className="text-xl text-cr-muted">
            ×
          </button>
        </div>

        <label className="mt-4 block text-xs font-semibold text-cr-muted">
          Nome completo
          <input autoFocus required name="name" placeholder="Ex: Bruno Cardoso" className="input mt-1" />
        </label>
        <label className="mt-3 block text-xs font-semibold text-cr-muted">
          Telefone
          <input required name="phone" placeholder="(11) 90000-0000" className="input mt-1" />
        </label>
        <label className="mt-3 block text-xs font-semibold text-cr-muted">
          CPF <span className="font-medium text-cr-placeholder">(opcional)</span>
          <input name="cpf" placeholder="000.000.000-00" className="input mt-1" />
        </label>

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-cr-border px-4 py-2.5 text-xs font-bold">
            Cancelar
          </button>
          <button disabled={saving} className="rounded-xl bg-cr-accent px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
            {saving ? "Criando..." : "Criar cliente"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" {...props}>
      <circle cx="9" cy="9" r="6" />
      <path d="m17 17-4-4" />
    </svg>
  );
}
