import { useEffect, useMemo, useState } from "react";
import { api, formatCurrency } from "../../api";
import type { ChecklistCategory, ChecklistOption, TradeInModel } from "../../types";
import { PrimaryButton } from "../../components/ui";

interface Props {
  tradeInModel: TradeInModel;
  answers: Record<string, ChecklistOption>;
  onAnswer: (categoryId: string, option: ChecklistOption) => void;
  onContinue: (finalValue: number) => void;
}

export function StepEvaluation({ tradeInModel, answers, onAnswer, onContinue }: Props) {
  const [categories, setCategories] = useState<ChecklistCategory[]>([]);

  useEffect(() => {
    api.getChecklist().then(setCategories);
  }, []);

  const totalDeductions = useMemo(
    () => Object.values(answers).reduce((sum, o) => sum + o.deduction, 0),
    [answers],
  );
  const finalValue = Math.max(0, tradeInModel.baseValue - totalDeductions);
  const allAnswered = categories.length > 0 && categories.every((c) => answers[c.id]);

  return (
    <div>
      <h1 className="font-display text-xl font-bold">Checklist de avaliação do aparelho</h1>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => {
            const selected = answers[category.id];
            return (
              <div key={category.id} className="flex flex-col gap-2 rounded-[14px] border border-cr-border bg-white p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] font-bold">{category.label}</span>
                  <span className={`text-[11px] font-bold ${selected?.deduction ? "text-cr-ink" : "text-cr-muted"}`}>
                    {selected && selected.deduction > 0 ? `-${formatCurrency(selected.deduction)}` : ""}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {category.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onAnswer(category.id, option)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                        selected?.id === option.id
                          ? "border-[1.3px] border-cr-accent bg-cr-accent text-white"
                          : "border-[1.3px] border-cr-border bg-white text-cr-secondary"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <aside className="flex h-fit flex-col gap-3 rounded-2xl border border-cr-border bg-white p-[18px]">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-cr-muted">Aparelho avaliado</div>
            <div className="mt-0.5 text-[14.5px] font-bold">{tradeInModel.name}</div>
            <div className="text-[11.5px] text-cr-muted">Valor base: {formatCurrency(tradeInModel.baseValue)}</div>
          </div>

          <div className="flex flex-col border-t border-cr-border-light">
            {categories.map((category) => {
              const selected = answers[category.id];
              return (
                <div key={category.id} className="flex justify-between border-b border-cr-border-light py-[7px] text-[11.5px]">
                  <span className="text-cr-secondary">{category.label}</span>
                  <span className={selected?.deduction ? "font-bold" : "font-medium text-cr-muted"}>
                    {selected ? (selected.deduction > 0 ? `-${formatCurrency(selected.deduction)}` : "—") : "—"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-1 pt-0.5">
            <div className="flex justify-between text-xs text-cr-muted">
              <span>Total de descontos</span>
              <span className="font-bold text-cr-ink">-{formatCurrency(totalDeductions)}</span>
            </div>
            <div className="mt-1.5 flex items-center justify-between border-t border-cr-accent pt-1.5">
              <span className="text-[13.5px] font-bold">Valor da troca</span>
              <span className="font-display text-xl font-bold">{formatCurrency(finalValue)}</span>
            </div>
          </div>

          <PrimaryButton disabled={!allAnswered} onClick={() => onContinue(finalValue)} className="mt-1 w-full">
            Continuar
          </PrimaryButton>
        </aside>
      </div>
    </div>
  );
}
