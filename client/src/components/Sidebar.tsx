import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Início", icon: HomeIcon },
  { to: "/nova-venda", label: "Nova venda", icon: PhoneIcon },
  { to: "/conserto", label: "Conserto", icon: BoltIcon },
  { to: "/historico", label: "Histórico", icon: ClockIcon },
  { to: "/configuracoes", label: "Configurações", icon: GearIcon },
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-56 flex-shrink-0 flex-col bg-black text-stone-300">
      <div className="px-5 pt-6 pb-5">
        <div className="text-lg font-semibold text-white">
          CR <span className="text-stone-400">SMART</span>
        </div>
        <div className="mt-0.5 text-xs text-stone-500">Vendas &amp; Assistência iPhone</div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-white/10 font-medium text-white"
                  : "text-stone-400 hover:bg-white/5 hover:text-stone-200"
              }`
            }
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-3 border-t border-white/10 px-4 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-700 text-xs font-semibold text-white">
          AT
        </div>
        <div>
          <div className="text-sm font-medium text-white">Atendente</div>
          <div className="text-xs text-stone-500">Loja</div>
        </div>
      </div>
    </aside>
  );
}

function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <rect x="7" y="2.5" width="10" height="19" rx="2" />
      <path d="M11 18.5h2" strokeLinecap="round" />
    </svg>
  );
}

function BoltIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GearIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} {...props}>
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 13.5c.1-.5.1-1 0-1.5l1.6-1.2-1.5-2.6-1.9.6a7.6 7.6 0 0 0-1.3-.8l-.3-2H10l-.3 2a7.6 7.6 0 0 0-1.3.8l-1.9-.6-1.5 2.6L6.6 12c-.1.5-.1 1 0 1.5L5 14.7l1.5 2.6 1.9-.6c.4.3.8.6 1.3.8l.3 2h4l.3-2c.5-.2.9-.5 1.3-.8l1.9.6 1.5-2.6-1.6-1.2Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
