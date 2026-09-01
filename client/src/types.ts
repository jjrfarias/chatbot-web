export interface Device {
  id: string;
  name: string;
  storage: string;
  price: number;
  active: boolean;
}

export interface TradeInModel {
  id: string;
  name: string;
  baseValue: number;
  active: boolean;
}

export interface ChecklistOption {
  id: string;
  categoryId: string;
  label: string;
  deduction: number;
  order: number;
}

export interface ChecklistCategory {
  id: string;
  key: string;
  label: string;
  order: number;
  options: ChecklistOption[];
}

export interface SaleAnswer {
  id: string;
  categoryId: string;
  categoryLabel: string;
  optionId: string;
  optionLabel: string;
  deduction: number;
}

export interface Sale {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  deviceId: string;
  deviceName: string;
  devicePrice: number;
  hasTradeIn: boolean;
  tradeInModelId: string | null;
  tradeInModelName: string | null;
  tradeInBaseValue: number | null;
  tradeInDeductions: number;
  tradeInFinalValue: number;
  paymentMethod: string;
  installments: number;
  totalToPay: number;
  answers: SaleAnswer[];
}

export interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  salesThisMonth: number;
  revenueThisMonth: number;
}
