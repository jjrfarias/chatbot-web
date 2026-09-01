import { useEffect, useState } from "react";
import { api, initials } from "../api";
import type { StaffUser } from "../types";
import { Toggle } from "../components/ui";

const PERMISSIONS: { key: keyof Pick<StaffUser, "vendas" | "conserto" | "clientes" | "financeiro" | "estoque" | "config">; label: string }[] = [
  { key: "vendas", label: "Vendas" },
  { key: "conserto", label: "Conserto" },
  { key: "clientes", label: "Clientes" },
  { key: "financeiro", label: "Financeiro" },
  { key: "estoque", label: "Estoque" },
  { key: "config", label: "Config." },
];

export function Usuarios() {
  const [staff, setStaff] = useState<StaffUser[]>([]);

  useEffect(() => {
    api.getStaff().then(setStaff);
  }, []);

  const owner = staff.find((s) => s.isOwner);
  const collaborators = staff.filter((s) => !s.isOwner);

  async function togglePermission(id: string, key: string, value: boolean) {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: value } : s)));
    try {
      await api.toggleStaffPermission(id, key, value);
    } catch {
      setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, [key]: !value } : s)));
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-11 py-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-display text-[22px] font-bold">Usuários e permissões</div>
          <div className="mt-0.5 text-[12.5px] text-cr-muted">Defina o que cada colaborador pode acessar no app</div>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-cr-ink px-[18px] py-2.5 text-[13px] font-bold text-white">
          + Adicionar colaborador
        </button>
      </div>

      {owner && (
        <div className="mt-4 flex items-center justify-between rounded-[14px] border border-cr-border bg-white px-[18px] py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-cr-ink font-display text-[13px] font-bold text-white">
              {initials(owner.name)}
            </div>
            <div>
              <div className="text-[13.5px] font-bold">{owner.name}</div>
              <div className="text-[11.5px] text-cr-muted">{owner.role}</div>
            </div>
          </div>
          <span className="rounded-full bg-cr-ink px-3 py-1.5 text-[11px] font-semibold text-white">Acesso total</span>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2">
        <div className="text-[13px] font-bold">Colaboradores</div>
        <div className="overflow-hidden rounded-[14px] border border-cr-border bg-white">
          <div className="flex items-center border-b border-cr-border px-[18px] py-2.5 text-[10.5px] font-bold uppercase text-cr-muted">
            <div className="flex-[1.8]">Colaborador</div>
            {PERMISSIONS.map((p) => (
              <div key={p.key} className="flex-1 text-center">
                {p.label}
              </div>
            ))}
          </div>
          {collaborators.map((c) => (
            <div key={c.id} className="flex items-center border-b border-cr-border-light px-[18px] py-3.5 last:border-0 hover:bg-cr-bg">
              <div className="flex flex-[1.8] items-center gap-2.5">
                <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-cr-chip font-display text-[11px] font-bold">
                  {initials(c.name)}
                </div>
                <div>
                  <div className="text-[12.5px] font-semibold">{c.name}</div>
                  <div className="text-[11px] text-cr-muted">{c.role}</div>
                </div>
              </div>
              {PERMISSIONS.map((p) => (
                <div key={p.key} className="flex flex-1 justify-center">
                  <Toggle checked={c[p.key]} onChange={(v) => togglePermission(c.id, p.key, v)} />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="text-[11.5px] text-cr-muted">Toque nos interruptores para liberar ou bloquear o acesso de cada colaborador a uma área do app.</div>
      </div>
    </div>
  );
}
