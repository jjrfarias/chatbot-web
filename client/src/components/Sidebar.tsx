import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Início", icon: HomeIcon },
  { to: "/clientes", label: "Clientes", icon: ClientsIcon },
  { to: "/crm", label: "CRM", icon: CrmIcon },
  { to: "/acoes", label: "Ações de hoje", icon: ActionsIcon },
  { to: "/nova-venda", label: "Nova venda", icon: PhoneIcon },
  { to: "/conserto", label: "Conserto", icon: BoltIcon },
  { to: "/financeiro", label: "Financeiro", icon: FinanceIcon },
  { to: "/estoque", label: "Estoque", icon: StockIcon },
  { to: "/usuarios", label: "Usuários", icon: UsersIcon },
  { to: "/historico", label: "Histórico", icon: ClockIcon },
  { to: "/configuracoes", label: "Configurações", icon: GearIcon },
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-[220px] flex-shrink-0 flex-col justify-between bg-cr-sidebar px-[18px] py-7 print:hidden">
      <div className="flex flex-col gap-9">
        <div>
          <div className="font-display text-[21px] font-bold text-white">
            CR <span className="font-normal text-cr-sidebar-muted">SMART</span>
          </div>
          <div className="mt-[3px] text-[11px] text-[#6f6e68]">Vendas &amp; Assistência iPhone</div>
        </div>

        <nav className="flex flex-col gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-[10px] px-3 py-[11px] text-[13.5px] transition-colors hover:bg-cr-sidebar-hover ${
                  isActive ? "bg-cr-sidebar-hover font-semibold text-white" : "font-medium text-cr-sidebar-muted"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-[18px] w-[18px] flex-shrink-0" active={isActive} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2.5 border-t border-cr-sidebar-border px-2.5 py-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cr-sidebar-border font-display text-xs font-semibold text-white">
          MS
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[12.5px] font-semibold text-white">Marcos Silva</span>
          <span className="text-[11px] text-[#6f6e68]">Admin</span>
        </div>
      </div>
    </aside>
  );
}

type IconProps = { className?: string; active?: boolean };
const stroke = (active?: boolean) => (active ? "#ffffff" : "#9a998f");

function HomeIcon({ className, active }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke={stroke(active)} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9.5 10 3l7 6.5" />
      <path d="M5 8.5V17h10V8.5" />
    </svg>
  );
}

function ClientsIcon({ className, active }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke={stroke(active)} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="7" r="3" />
      <path d="M4 17c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  );
}

function CrmIcon({ className, active }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke={stroke(active)} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2.5" y="3" width="15" height="14" rx="2" />
      <path d="M7.5 3v14M12.5 3v14M4.5 7h1M9.5 10h1M14.5 6h1" />
    </svg>
  );
}

function ActionsIcon({ className, active }: IconProps) {
  return <svg viewBox="0 0 20 20" fill="none" stroke={stroke(active)} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 3.5h12v13H4z" /><path d="m7 8 1.3 1.3L11 6.5M7 13h6" /></svg>;
}

function PhoneIcon({ className, active }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke={stroke(active)} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="6" y="2.5" width="8" height="15" rx="1.6" />
      <path d="M9 15h2" />
    </svg>
  );
}

function BoltIcon({ className, active }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke={stroke(active)} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M11 2.5 5 11h4l-1 6.5 7-9.5h-4l0-5.5Z" />
    </svg>
  );
}

function FinanceIcon({ className, active }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke={stroke(active)} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h14M3 10h14M3 14h9" />
      <circle cx="15.5" cy="14.5" r="2.3" />
    </svg>
  );
}

function StockIcon({ className, active }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke={stroke(active)} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 7 10 3l7 4v7l-7 4-7-4Z" />
      <path d="M3 7l7 4 7-4M10 11v6" />
    </svg>
  );
}

function UsersIcon({ className, active }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke={stroke(active)} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="7" cy="7" r="3" />
      <path d="M2 17c0-2.8 2.2-5 5-5s5 2.2 5 5" />
      <circle cx="15" cy="8" r="2.3" />
      <path d="M13.3 11a4 4 0 0 1 4.7 4" />
    </svg>
  );
}

function ClockIcon({ className, active }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke={stroke(active)} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 6v4l3 2" />
    </svg>
  );
}

function GearIcon({ className, active }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke={stroke(active)} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="10" r="2.6" />
      <path d="M10 2.8v2.1M10 15.1v2.1M17.2 10h-2.1M4.9 10H2.8M15.1 4.9l-1.5 1.5M6.4 13.6l-1.5 1.5M15.1 15.1l-1.5-1.5M6.4 6.4 4.9 4.9" />
    </svg>
  );
}
