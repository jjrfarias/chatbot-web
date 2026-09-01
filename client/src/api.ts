import type { ChecklistCategory, Device, Sale, SalesStats, TradeInModel } from "./types";

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
  getChecklist: () => request<ChecklistCategory[]>("/checklist"),
  getSales: () => request<Sale[]>("/sales"),
  getSale: (id: string) => request<Sale>(`/sales/${id}`),
  getStats: () => request<SalesStats>("/sales/stats"),
  createSale: (payload: {
    customerName: string;
    customerPhone: string;
    deviceId: string;
    hasTradeIn: boolean;
    tradeInModelId?: string;
    checklistAnswers?: string[];
    paymentMethod: string;
    installments?: number;
  }) =>
    request<Sale>("/sales", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
