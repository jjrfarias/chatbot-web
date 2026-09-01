const STEPS = ["Modelo", "Troca", "Avaliação", "Pagamento", "Confirmação"];

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
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  done || active
                    ? "bg-black text-white"
                    : "bg-stone-200 text-stone-400"
                }`}
              >
                {done ? <CheckIcon className="h-3.5 w-3.5" /> : step}
              </div>
              <span className={`text-sm ${active ? "font-medium text-black" : "text-stone-400"}`}>
                {label}
              </span>
            </div>
            {step < STEPS.length && (
              <div className={`mx-3 h-px w-10 ${done ? "bg-black" : "bg-stone-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} {...props}>
      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
