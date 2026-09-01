import { useEffect, useMemo, useState } from "react";
import { api, formatCurrency } from "../../api";
import type { ChecklistCategory, ChecklistOption, TradeInModel } from "../../types";

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
      <h1 className="text-2xl font-semibold text-black">Checklist de avaliação do aparelho</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {categories.map((category) => {
            const selected = answers[category.id];
            return (
              <div key={category.id} className="rounded-2xl border border-stone-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-black">{category.label}</span>
                  <span className="text-sm text-stone-400">
                    {selected && selected.deduction > 0 ? `-${formatCurrency(selected.deduction)}` : ""}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.options.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => onAnswer(category.id, option)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        selected?.id === option.id
                          ? "bg-black text-white"
                          : "border border-stone-200 bg-white text-stone-600 hover:border-stone-300"
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

        <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-stone-400">Aparelho avaliado</div>
          <div className="mt-1 font-medium text-black">{tradeInModel.name}</div>
          <div className="text-sm text-stone-500">Valor base: {formatCurrency(tradeInModel.baseValue)}</div>

          <div className="mt-4 space-y-2 border-t border-stone-100 pt-4 text-sm">
            {categories.map((category) => {
              const selected = answers[category.id];
              return (
                <div key={category.id} className="flex justify-between text-stone-600">
                  <span>{category.label}</span>
                  <span className={selected?.deduction ? "text-black" : "text-stone-300"}>
                    {selected ? (selected.deduction > 0 ? `-${formatCurrency(selected.deduction)}` : "—") : "—"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-between border-t border-stone-100 pt-4 text-sm text-stone-600">
            <span>Total de descontos</span>
            <span>-{formatCurrency(totalDeductions)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-medium text-black">Valor da troca</span>
            <span className="text-xl font-semibold text-black">{formatCurrency(finalValue)}</span>
          </div>

          <button
            type="button"
            disabled={!allAnswered}
            onClick={() => onContinue(finalValue)}
            className="mt-5 w-full rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            Continuar
          </button>
        </aside>
      </div>
    </div>
  );
}
