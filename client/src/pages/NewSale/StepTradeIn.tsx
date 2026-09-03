import { useEffect, useState } from "react";
import { api, formatCurrency } from "../../api";
import type { TradeInModel } from "../../types";
import { Chip, PrimaryButton } from "../../components/ui";

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
      <h1 className="font-display text-xl font-bold">O cliente vai dar um aparelho na troca?</h1>

      <div className="mt-4 flex gap-2.5">
        <Chip selected={hasTradeIn === true} onClick={() => onSetHasTradeIn(true)}>
          ✓ Sim, vai dar um aparelho
        </Chip>
        <Chip selected={hasTradeIn === false} onClick={() => onSetHasTradeIn(false)}>
          ✕ Não, só a venda
        </Chip>
      </div>

      {hasTradeIn && (
        <div className="mt-6">
          <div className="mb-3 text-sm font-semibold text-cr-secondary">Qual o modelo do aparelho usado?</div>
          <div className="grid grid-cols-4 gap-4">
            {models.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelect(m)}
                className={`rounded-2xl bg-white p-[18px] text-left transition-shadow ${
                  selected?.id === m.id ? "border-[1.6px] border-cr-accent" : "border-[1.6px] border-cr-border"
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-cr-chip">
                  <PhoneGlyph />
                </div>
                <div className="mt-3 text-[14.5px] font-bold">{m.name}</div>
                <div className="text-xs text-cr-muted">até {formatCurrency(m.baseValue)}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 flex items-center justify-between border-t border-cr-border pt-[18px]">
        <p className="text-[12.5px] text-cr-muted">O valor final da troca é calculado na próxima etapa, de acordo com o estado do aparelho.</p>
        <PrimaryButton disabled={!canContinue} onClick={onContinue}>
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
