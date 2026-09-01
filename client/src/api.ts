import type {
  ChecklistCategory,
  CrmBoard,
  CrmActions,
  CrmInteraction,
  CrmMessageTemplate,
  CrmOpportunity,
  CrmTag,
  CrmTask,
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
    opportunityId?: string;
  }) => request<Sale>("/sales", { method: "POST", body: JSON.stringify(payload) }),

  getCustomers: (q?: string) => request<CustomerSummary[]>(`/customers${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  getCustomer: (id: string) => request<CustomerDetail>(`/customers/${id}`),
  createCustomer: (payload: { name: string; phone: string; cpf?: string }) =>
    request<CustomerSummary>("/customers", { method: "POST", body: JSON.stringify(payload) }),
  updateCustomer: (id: string, payload: Record<string, unknown>) =>
    request<CustomerSummary>(`/customers/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),

  getCrmBoard: (pipeline: "vendas" | "assistencia" = "vendas") => request<CrmBoard>(`/crm/board?pipeline=${pipeline}`),
  createOpportunity: (payload: Record<string, unknown>) =>
    request<CrmOpportunity>("/crm/opportunities", { method: "POST", body: JSON.stringify(payload) }),
  updateOpportunity: (id: string, payload: Record<string, unknown>) =>
    request<CrmOpportunity>(`/crm/opportunities/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  createInteraction: (payload: { customerId: string; type: string; content: string; staffId?: string }) =>
    request<CrmInteraction>("/crm/interactions", { method: "POST", body: JSON.stringify(payload) }),
  createCrmTask: (payload: Record<string, unknown>) =>
    request<CrmTask>("/crm/tasks", { method: "POST", body: JSON.stringify(payload) }),
  updateCrmTask: (id: string, completed: boolean) =>
    request<CrmTask>(`/crm/tasks/${id}`, { method: "PATCH", body: JSON.stringify({ completed }) }),
  getCrmActions: () => request<CrmActions>("/crm/actions/today"),
  addCustomerTag: (customerId: string, name: string, color?: string) =>
    request<CrmTag>(`/crm/customers/${customerId}/tags`, { method: "POST", body: JSON.stringify({ name, color }) }),
  getMessageTemplates: () => request<CrmMessageTemplate[]>("/crm/message-templates"),
  updateMessageTemplates: (templates: { id: string; content: string; active: boolean }[]) =>
    request<CrmMessageTemplate[]>("/crm/message-templates", { method: "PUT", body: JSON.stringify({ templates }) }),
  openWhatsApp: (payload: { customerId: string; phone: string; message: string; templateName?: string }) =>
    request<{ url: string }>("/crm/whatsapp/open", { method: "POST", body: JSON.stringify(payload) }),

  getRepairs: () => request<Repair[]>("/repairs"),
  updateRepairStatus: (id: string, status: string) =>
    request<Repair>(`/repairs/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  createRepair: (payload: {
    customerName: string;
    customerId?: string;
    customerPhone?: string;
    model: string;
    color?: string;
    imei?: string;
    deadlineLabel: string;
    defects: DefectOption[];
    notes?: string;
  }) => request<Repair>("/repairs", { method: "POST", body: JSON.stringify(payload) }),

  getInventoryDevices: () => request<InventoryDevice[]>("/inventory/devices"),
  createInventoryDevice: (payload: {
    name: string;
    storage: string;
    color?: string;
    condition: string;
    quantity: number;
    minQuantity?: number;
    costPrice: number;
    salePrice: number;
  }) => request<InventoryDevice>("/inventory/devices", { method: "POST", body: JSON.stringify(payload) }),
  getInventoryParts: () => request<InventoryPart[]>("/inventory/parts"),
  createInventoryPart: (payload: {
    name: string;
    compatible: string;
    quantity: number;
    minQuantity?: number;
    supplier?: string;
    costPrice: number;
  }) => request<InventoryPart>("/inventory/parts", { method: "POST", body: JSON.stringify(payload) }),

  getStaff: () => request<StaffUser[]>("/staff"),
  createStaff: (payload: { name: string; role: string }) =>
    request<StaffUser>("/staff", { method: "POST", body: JSON.stringify(payload) }),
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
