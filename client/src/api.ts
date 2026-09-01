import type {
  ChecklistCategory,
  CustomerDetail,
  CustomerSummary,
  DefectOption,
  Device,
  FinanceSummary,
  HomeSummary,
  InventoryDevice,
  InventoryPart,
  PaymentFee,
  Repair,
  Sale,
  StaffUser,
  TradeInModel,
  WarrantyOption,
} from "./types";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Erro na requisição: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getDevices: () => request<Device[]>("/devices"),
  getTradeInModels: () => request<TradeInModel[]>("/trade-in-models"),
  updateTradeInModels: (models: { id: string; baseValue: number }[]) =>
    request<TradeInModel[]>("/trade-in-models", { method: "PUT", body: JSON.stringify({ models }) }),
  getChecklist: () => request<ChecklistCategory[]>("/checklist"),
  getWarrantyOptions: () => request<WarrantyOption[]>("/warranty-options"),
  getDefectOptions: () => request<DefectOption[]>("/defect-options"),
  getRepairDeadlines: () => request<string[]>("/repair-deadlines"),
  getPaymentFees: () => request<PaymentFee[]>("/payment-fees"),
  updatePaymentFees: (fees: { id: string; feePercent: number }[]) =>
    request<PaymentFee[]>("/payment-fees", { method: "PUT", body: JSON.stringify({ fees }) }),

  getSales: () => request<Sale[]>("/sales"),
  getSale: (id: string) => request<Sale>(`/sales/${id}`),
  createSale: (payload: {
    customer: { id?: string; name: string; phone: string; cpf?: string };
    deviceId: string;
    hasTradeIn: boolean;
    tradeInModelId?: string;
    checklistAnswers?: string[];
    warrantyKey: string;
    paymentMethod: string;
  }) => request<Sale>("/sales", { method: "POST", body: JSON.stringify(payload) }),

  getCustomers: (q?: string) => request<CustomerSummary[]>(`/customers${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  getCustomer: (id: string) => request<CustomerDetail>(`/customers/${id}`),
  createCustomer: (payload: { name: string; phone: string; cpf?: string }) =>
    request<CustomerSummary>("/customers", { method: "POST", body: JSON.stringify(payload) }),

  getRepairs: () => request<Repair[]>("/repairs"),
  createRepair: (payload: {
    customerName: string;
    customerId?: string;
    model: string;
    color?: string;
    imei?: string;
    deadlineLabel: string;
    defects: DefectOption[];
    notes?: string;
  }) => request<Repair>("/repairs", { method: "POST", body: JSON.stringify(payload) }),

  getInventoryDevices: () => request<InventoryDevice[]>("/inventory/devices"),
  getInventoryParts: () => request<InventoryPart[]>("/inventory/parts"),

  getStaff: () => request<StaffUser[]>("/staff"),
  toggleStaffPermission: (id: string, key: string, value: boolean) =>
    request<StaffUser>(`/staff/${id}/permissions`, { method: "PATCH", body: JSON.stringify({ key, value }) }),

  getFinanceSummary: (period: "hoje" | "semana" | "mes") => request<FinanceSummary>(`/finance/summary?period=${period}`),
  getHomeSummary: () => request<HomeSummary>("/home/summary"),
};

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString("pt-BR");
}

export function maskCpf(cpf: string | null): string {
  if (!cpf) return "— não informado";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length < 9) return cpf;
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
