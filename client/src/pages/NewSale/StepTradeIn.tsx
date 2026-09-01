import { useEffect, useState } from "react";
import { api, formatCurrency } from "../../api";
import type { TradeInModel } from "../../types";

interface Props {
  hasTradeIn: boolean | null;
  onSetHasTradeIn: (value: boolean) => void;
  selected: TradeInModel | null;
  onSelect: (model: TradeInModel) => void;
  onContinue: () => void;
}

export function StepTradeIn({ hasTradeIn, onSetHasTradeIn, selected, onSelect, onContinue }: Props) {
  const [models, setModels] = useState<TradeInModel[]>([]);

  useEffect(() => {
    api.getTradeInModels().then(setModels);
  }, []);

  const canContinue = hasTradeIn === false || (hasTradeIn === true && !!selected);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-black">O cliente vai dar um iPhone na troca?</h1>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => onSetHasTradeIn(true)}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            hasTradeIn === true ? "bg-black text-white" : "border border-stone-200 bg-white text-stone-600"
          }`}
        >
          ✓ Sim, vai dar um aparelho
        </button>
        <button
          type="button"
          onClick={() => onSetHasTradeIn(false)}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            hasTradeIn === false ? "bg-black text-white" : "border border-stone-200 bg-white text-stone-600"
          }`}
        >
          ✕ Não, só a venda
        </button>
      </div>

      {hasTradeIn && (
        <div className="mt-8">
          <div className="mb-3 text-sm font-medium text-stone-600">Qual o modelo do aparelho usado?</div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {models.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelect(m)}
                className={`rounded-2xl border bg-white p-5 text-left transition-shadow hover:shadow-sm ${
                  selected?.id === m.id ? "border-black ring-1 ring-black" : "border-stone-200"
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-100">
                  <PhoneGlyph />
                </div>
                <div className="mt-3 font-medium text-black">{m.name}</div>
                <div className="text-sm text-stone-500">até {formatCurrency(m.baseValue)}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 flex items-center justify-between">
        <p className="text-sm text-stone-500">O valor final da troca é calculado na próxima etapa, de acordo com o estado do aparelho.</p>
        <button
          type="button"
          disabled={!canContinue}
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
