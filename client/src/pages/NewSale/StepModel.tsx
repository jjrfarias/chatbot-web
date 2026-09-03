import { useEffect, useState } from "react";
import { api, formatCurrency } from "../../api";
import type { Device } from "../../types";
import { PrimaryButton } from "../../components/ui";

interface Props {
  selected: Device | null;
  onSelect: (device: Device) => void;
  onContinue: () => void;
}

export function StepModel({ selected, onSelect, onContinue }: Props) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getDevices()
      .then(setDevices)
      .finally(() => setLoading(false));
  }, []);

  const grouped = Object.values(
    devices.reduce<Record<string, Device[]>>((acc, d) => {
      const key = `${d.name}__${d.color}`;
      (acc[key] ??= []).push(d);
      return acc;
    }, {}),
  );

  return (
    <div>
      <h1 className="font-display text-xl font-bold">Qual aparelho o cliente deseja levar?</h1>

      {loading ? (
        <p className="mt-6 text-sm text-cr-muted">Carregando catálogo...</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {grouped.map((variants) => {
            const first = variants[0];
            const isGroupSelected = selected && selected.name === first.name && selected.color === first.color;
            const active = isGroupSelected ? selected! : first;
            const cheapest = [...variants].sort((a, b) => a.price - b.price)[0];
            return (
              <div
                key={`${first.name}-${first.color}`}
                className={`flex flex-col gap-3 rounded-2xl bg-white p-[18px] ${
                  isGroupSelected ? "border-[1.6px] border-cr-accent" : "border-[1.6px] border-cr-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-cr-chip">
                    <PhoneGlyph />
                  </div>
                  <div
                    className={`h-4 w-4 rounded-full border-[1.6px] ${isGroupSelected ? "border-cr-accent bg-cr-accent" : "border-cr-dot"}`}
                  />
                </div>
                <div>
                  <div className="text-[14.5px] font-bold">{first.name}</div>
                  <div className="mt-0.5 text-xs text-cr-muted">{first.color}</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => onSelect(v)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        selected?.id === v.id
                          ? "border-[1.4px] border-cr-accent bg-cr-accent text-white"
                          : "border-[1.4px] border-cr-border bg-white text-cr-secondary"
                      }`}
                    >
                      {v.storage}
                    </button>
                  ))}
                </div>
                <div className="break-words font-display text-[17px] font-bold">
                  {isGroupSelected ? formatCurrency(active.price) : `a partir de ${formatCurrency(cheapest.price)}`}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-10 flex items-center justify-between border-t border-cr-border pt-[18px]">
        <div>
          <div className="text-[11.5px] font-semibold uppercase tracking-wide text-cr-muted">Selecionado</div>
          <div className="mt-0.5 font-display text-lg font-bold">
            {selected ? `${selected.name} · ${selected.storage} — ${formatCurrency(selected.price)}` : "Nenhum aparelho selecionado"}
          </div>
        </div>
        <PrimaryButton disabled={!selected} onClick={onContinue}>
          Continuar →
        </PrimaryButton>
      </div>
    </div>
  );
}

function PhoneGlyph() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="#121210" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="6" y="2" width="8" height="16" rx="1.8" />
      <path d="M9 15.2h2" />
    </svg>
  );
}
