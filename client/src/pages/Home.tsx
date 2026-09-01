import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, formatCurrency } from "../api";
import { useAuth } from "../auth/AuthContext";
import type { HomeSummary } from "../types";
import { Badge, StatCard } from "../components/ui";

const WEEKDAYS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
const MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export function Home() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const firstName = session?.user.name.split(" ")[0] ?? "";
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getHomeSummary().then(setSummary);
  }, []);

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    if (search.trim()) navigate(`/clientes?q=${encodeURIComponent(search.trim())}`);
  }

  const now = new Date();
  const dateLabel = `${WEEKDAYS[now.getDay()]}, ${now.getDate()} de ${MONTHS[now.getMonth()]}`;

  return (
    <div className="mx-auto max-w-5xl px-11 py-9">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-2xl font-bold">Bom dia, {firstName}</div>
          <div className="mt-0.5 text-[13px] capitalize text-cr-muted">{dateLabel}</div>
        </div>
        <form
          onSubmit={submitSearch}
          className="flex w-[260px] items-center gap-2.5 rounded-full border border-cr-border bg-white px-4 py-2.5"
        >
          <SearchIcon className="h-[15px] w-[15px] flex-shrink-0 text-cr-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente por nome ou telefone"
            className="w-full bg-transparent text-[13px] outline-none placeholder:text-cr-muted"
          />
        </form>
      </div>

      <div className="mt-6 flex gap-5">
        <Link
          to="/nova-venda"
          className="flex flex-1 flex-col gap-3.5 rounded-2xl border border-cr-border bg-white p-[22px] transition-shadow hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cr-ink">
              <PhoneIcon className="h-5 w-5 text-white" />
            </div>
            <ArrowIcon className="h-[18px] w-[18px] text-cr-muted" />
          </div>
          <div>
            <div className="font-display text-[17px] font-bold">Nova venda</div>
            <div className="mt-0.5 text-[12.5px] text-cr-muted">Venda de iPhone, com ou sem troca de aparelho</div>
          </div>
        </Link>
        <Link
          to="/conserto"
          className="flex flex-1 flex-col gap-3.5 rounded-2xl border border-cr-border bg-white p-[22px] transition-shadow hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cr-ink">
              <BoltIcon className="h-5 w-5 text-white" />
            </div>
            <ArrowIcon className="h-[18px] w-[18px] text-cr-muted" />
          </div>
          <div>
            <div className="font-display text-[17px] font-bold">Novo conserto</div>
            <div className="mt-0.5 text-[12.5px] text-cr-muted">Receber aparelho e registrar defeitos</div>
          </div>
        </Link>
      </div>

      {summary && (
        <>
          <div className="mt-5 flex gap-5">
            <StatCard label="Vendas hoje" value={summary.vendasHoje} />
            <StatCard label="Consertos em andamento" value={summary.consertosAndamento} />
            <StatCard label="Ticket médio" value={formatCurrency(summary.ticketMedio)} />
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <div className="text-sm font-bold">Atendimentos recentes</div>
            <div className="overflow-hidden rounded-[14px] border border-cr-border bg-white">
              {summary.recentes.length === 0 ? (
                <p className="p-5 text-sm text-cr-muted">Nenhum atendimento registrado ainda.</p>
              ) : (
                summary.recentes.map((r, i) => (
                  <div key={i} className="flex items-center border-b border-cr-border-light px-[18px] py-3.5 last:border-0 hover:bg-cr-bg">
                    <div className="flex-[2] text-[13px] font-semibold">{r.name}</div>
                    <div className="flex-1">
                      <Badge>{r.type}</Badge>
                    </div>
                    <div className="flex-[2] text-[13px] text-cr-secondary">{r.detail}</div>
                    <div className="flex-1 text-[13px] font-semibold">{formatCurrency(r.value)}</div>
                    <div className="flex-1 text-right">
                      <Badge tone={r.status.includes("concluíd") ? "dark" : "light"}>{r.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
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
function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="6" y="2" width="8" height="16" rx="1.8" />
      <path d="M9 15.2h2" />
    </svg>
  );
}
function BoltIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M11 2.5 5 11h4l-1 6.5 7-9.5h-4l0-5.5Z" />
    </svg>
  );
}
function ArrowIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 5l5 5-5 5" />
    </svg>
  );
}
