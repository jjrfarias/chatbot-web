import { useEffect, useState } from "react";
import { api, formatCurrency } from "../../api";
import type { Device } from "../../types";

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

  return (
    <div>
      <h1 className="text-2xl font-semibold text-black">Qual aparelho o cliente está comprando?</h1>

      {loading ? (
        <p className="mt-6 text-sm text-stone-500">Carregando catálogo...</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {devices.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => onSelect(d)}
              className={`rounded-2xl border bg-white p-5 text-left transition-shadow hover:shadow-sm ${
                selected?.id === d.id ? "border-black ring-1 ring-black" : "border-stone-200"
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100">
                <PhoneGlyph />
              </div>
              <div className="mt-3 font-medium text-black">{d.name}</div>
              <div className="text-sm text-stone-500">{d.storage}</div>
              <div className="mt-1 text-sm font-medium text-stone-700">{formatCurrency(d.price)}</div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-10 flex justify-end">
        <button
          type="button"
          disabled={!selected}
          onClick={onContinue}
          className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}

function PhoneGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4 text-stone-500">
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <path d="M11 18.5h2" strokeLinecap="round" />
    </svg>
  );
}
