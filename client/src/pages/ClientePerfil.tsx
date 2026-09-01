import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, formatCurrency, formatDate, initials, maskCpf } from "../api";
import type { CustomerDetail } from "../types";
import { Badge } from "../components/ui";

export function ClientePerfil() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);

  useEffect(() => {
    if (id) api.getCustomer(id).then(setCustomer);
  }, [id]);

  if (!customer) return <div className="px-11 py-8 text-sm text-cr-muted">Carregando...</div>;

  return (
    <div className="mx-auto max-w-6xl px-11 py-7">
      <Link to="/clientes" className="flex items-center gap-2.5 text-[12.5px] font-semibold text-cr-muted hover:text-cr-secondary">
        <BackIcon className="h-4 w-4" /> Voltar para clientes
      </Link>

      <div className="mt-4 flex gap-5">
        <div className="flex w-80 flex-shrink-0 flex-col gap-3.5">
          <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-cr-border bg-white p-[22px] text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cr-ink font-display text-[22px] font-bold text-white">
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
              onClick={() => navigate("/nova-venda", { state: { customerId: customer.id } })}
              className="rounded-xl bg-cr-ink py-3 text-center text-[13px] font-bold text-white"
            >
              Nova venda para este cliente
            </button>
            <button className="rounded-xl border-[1.6px] border-cr-ink py-3 text-center text-[13px] font-bold text-cr-ink">
              Editar dados
            </button>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <div className="text-sm font-bold">Histórico de atendimentos</div>
          <div className="overflow-hidden rounded-2xl border border-cr-border bg-white">
            {customer.history.length === 0 ? (
              <p className="p-5 text-sm text-cr-muted">Nenhum atendimento registrado ainda.</p>
            ) : (
              customer.history.map((h, i) => (
                <div key={i} className="flex items-center border-b border-cr-border-light px-[18px] py-3.5 last:border-0 hover:bg-cr-bg">
                  <div className="flex-1">
                    <Badge>{h.type}</Badge>
                  </div>
                  <div className="flex-[2.4] text-[13px] font-semibold">{h.detail}</div>
                  <div className="flex-[1.6] text-[12.5px] text-cr-secondary">{formatDate(h.date)}</div>
                  <div className="flex-1 text-[13px] font-semibold">{formatCurrency(h.value)}</div>
                  <div className="flex-1 text-right">
                    <Badge tone={h.status === "Concluído" ? "dark" : "light"}>{h.status}</Badge>
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
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-[14px] border border-cr-border bg-white p-3.5">
      <div className="text-[10.5px] font-semibold uppercase text-cr-muted">{label}</div>
      <div className="mt-0.5 font-display text-[19px] font-bold">{value}</div>
    </div>
  );
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
