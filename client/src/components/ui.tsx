import type { ReactNode } from "react";

export function StatCard({ label, value, dark }: { label: string; value: ReactNode; dark?: boolean }) {
  return (
    <div
      className={`flex-1 rounded-[14px] border px-[18px] py-4 ${
        dark ? "border-cr-ink bg-cr-ink text-white" : "border-cr-border bg-white text-cr-ink"
      }`}
    >
      <div className={`text-[11.5px] font-semibold uppercase tracking-wide ${dark ? "text-cr-sidebar-muted" : "text-cr-muted"}`}>
        {label}
      </div>
      <div className="mt-1 font-display text-[26px] font-bold">{value}</div>
    </div>
  );
}

export function Badge({ children, tone = "light" }: { children: ReactNode; tone?: "dark" | "light" | "muted" }) {
  const styles =
    tone === "dark"
      ? "bg-cr-ink text-white"
      : tone === "muted"
        ? "bg-cr-chip text-cr-muted"
        : "bg-cr-chip text-cr-secondary";
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles}`}>{children}</span>;
}

export function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-colors ${
        selected ? "border border-cr-ink bg-cr-ink text-white" : "border border-cr-border bg-white text-cr-secondary hover:border-cr-dot"
      }`}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-xl bg-cr-ink px-6 py-3 text-[13.5px] font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-30 ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border-[1.6px] border-cr-ink px-6 py-3 text-[13.5px] font-bold text-cr-ink ${className}`}
    >
      {children}
    </button>
  );
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-[34px] cursor-pointer rounded-full transition-colors ${checked ? "bg-cr-ink" : "bg-cr-border"}`}
    >
      <div
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${checked ? "left-4" : "left-0.5"}`}
      />
    </div>
  );
}
