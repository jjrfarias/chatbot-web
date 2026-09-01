const STEPS = ["Cliente", "Modelo", "Troca", "Avaliação", "Pagamento", "Confirmação"];

export function WizardStepper({ current }: { current: number }) {
  return (
    <div className="flex items-center">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-[26px] w-[26px] items-center justify-center rounded-full text-xs font-bold ${
                  done || active ? "bg-cr-ink text-white" : "border-[1.5px] border-cr-dot text-cr-muted"
                }`}
              >
                {done ? <CheckIcon className="h-3.5 w-3.5" /> : step}
              </div>
              <span className={`text-[12.5px] ${active ? "font-bold text-cr-ink" : done ? "font-semibold text-cr-ink" : "font-medium text-cr-muted"}`}>
                {label}
              </span>
            </div>
            {step < STEPS.length && (
              <div className={`mx-2.5 h-px w-10 ${done ? "bg-cr-ink" : "bg-cr-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 10.5 8 14l8-9" />
    </svg>
  );
}
