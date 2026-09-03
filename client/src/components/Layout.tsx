import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../auth/AuthContext";

export function Layout() {
  const [navOpen, setNavOpen] = useState(false);
  const { session } = useAuth();

  return (
    <div className="flex h-screen flex-col bg-cr-bg font-sans text-cr-ink lg:flex-row">
      <header className="flex flex-shrink-0 items-center gap-3 border-b border-cr-border-light bg-white px-4 py-3 print:hidden lg:hidden">
        <button
          onClick={() => setNavOpen(true)}
          aria-label="Abrir menu"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-cr-ink"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <span className="font-display text-[15px] font-bold">{session?.store.name ?? "UTI CEL"}</span>
      </header>

      {navOpen && (
        <div
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <Sidebar open={navOpen} onNavigate={() => setNavOpen(false)} />

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" className={className}>
      <path d="M3 5.5h14M3 10h14M3 14.5h14" />
    </svg>
  );
}
