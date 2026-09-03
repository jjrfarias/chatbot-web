import { useEffect, useState } from "react";
import { api, initials } from "../../api";
import type { CustomerSummary } from "../../types";
import { Chip, PrimaryButton } from "../../components/ui";

export interface CustomerSelection {
  mode: "existente" | "novo";
  customerId: string | null;
  name: string;
  phone: string;
  cpf: string;
}

interface Props {
  value: CustomerSelection;
  onChange: (value: CustomerSelection) => void;
  onContinue: () => void;
}

export function StepCliente({ value, onChange, onContinue }: Props) {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getCustomers().then(setCustomers);
  }, []);

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search),
  );

  const selectedCustomer = customers.find((c) => c.id === value.customerId);
  const canContinue =
    value.mode === "existente" ? !!value.customerId : value.name.trim().length > 1 && value.phone.trim().length >= 8;

  const selectedLabel =
    value.mode === "novo"
      ? "Preencher dados do novo cliente"
      : selectedCustomer
        ? `${selectedCustomer.name} · ${selectedCustomer.phone}`
        : "Nenhum cliente selecionado";

  return (
    <div>
      <h1 className="font-display text-xl font-bold">Quem é o cliente desta venda?</h1>

      <div className="mt-4 flex gap-2.5">
        <Chip selected={value.mode === "existente"} onClick={() => onChange({ ...value, mode: "existente" })}>
          Cliente já cadastrado
        </Chip>
        <Chip selected={value.mode === "novo"} onClick={() => onChange({ mode: "novo", customerId: null, name: "", phone: "", cpf: "" })}>
          Novo cliente
        </Chip>
      </div>

      {value.mode === "existente" ? (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex w-full items-center gap-2.5 rounded-full border border-cr-border bg-white px-[18px] py-[11px] sm:w-[360px]">
            <SearchIcon className="h-[15px] w-[15px] text-cr-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou telefone"
              className="w-full bg-transparent text-[13px] outline-none placeholder:text-cr-placeholder"
            />
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => onChange({ ...value, customerId: c.id, name: c.name, phone: c.phone, cpf: c.cpf ?? "" })}
                className={`flex cursor-pointer items-center gap-2.5 rounded-2xl bg-white p-2.5 ${
                  value.customerId === c.id ? "border-[1.6px] border-cr-accent" : "border-[1.6px] border-cr-border"
                }`}
              >
                <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full bg-cr-chip font-display text-[13px] font-bold">
                  {initials(c.name)}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-bold">{c.name}</div>
                  <div className="text-[11.5px] text-cr-muted">{c.phone}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 flex w-[460px] flex-col gap-3.5 rounded-2xl border border-cr-border bg-white p-[22px]">
          <Field label="Nome completo">
            <input
              value={value.name}
              onChange={(e) => onChange({ ...value, name: e.target.value })}
              placeholder="Ex: Bruno Cardoso"
              className="w-full rounded-[10px] border-[1.4px] border-cr-border px-3.5 py-2.5 text-[13.5px] outline-none focus:border-cr-accent"
            />
          </Field>
          <Field label="Telefone">
            <input
              value={value.phone}
              onChange={(e) => onChange({ ...value, phone: e.target.value })}
              placeholder="(11) 90000-0000"
              className="w-full rounded-[10px] border-[1.4px] border-cr-border px-3.5 py-2.5 text-[13.5px] outline-none focus:border-cr-accent"
            />
          </Field>
          <Field label="CPF" hint="(opcional, para nota fiscal)">
            <input
              value={value.cpf}
              onChange={(e) => onChange({ ...value, cpf: e.target.value })}
              placeholder="000.000.000-00"
              className="w-full rounded-[10px] border-[1.4px] border-cr-border px-3.5 py-2.5 text-[13.5px] outline-none focus:border-cr-accent"
            />
          </Field>
        </div>
      )}

      <div className="mt-10 flex items-center justify-between border-t border-cr-border pt-[18px]">
        <div>
          <div className="text-[11.5px] font-semibold uppercase tracking-wide text-cr-muted">Cliente selecionado</div>
          <div className="mt-0.5 font-display text-lg font-bold">{selectedLabel}</div>
        </div>
        <PrimaryButton disabled={!canContinue} onClick={onContinue}>
          Continuar →
        </PrimaryButton>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11.5px] font-semibold text-cr-muted">
        {label} {hint && <span className="font-medium text-cr-placeholder">{hint}</span>}
      </label>
      {children}
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
