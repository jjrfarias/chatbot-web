export interface Device {
  id: string;
  name: string;
  color: string;
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

export interface WarrantyOption {
  key: string;
  label: string;
  description: string;
  price: number;
}

export interface DefectOption {
  id: string;
  label: string;
  price: number;
}

export interface PaymentFee {
  id: string;
  key: string;
  label: string;
  feePercent: number;
  order: number;
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
  orderNumber: string;
  createdAt: string;
  customerId: string | null;
  customerName: string;
  customerPhone: string;
  deviceId: string;
  deviceName: string;
  deviceColor: string;
  devicePrice: number;
  hasTradeIn: boolean;
  tradeInModelId: string | null;
  tradeInModelName: string | null;
  tradeInBaseValue: number | null;
  tradeInDeductions: number;
  tradeInFinalValue: number;
  warrantyKey: string;
  warrantyLabel: string;
  warrantyPrice: number;
  paymentMethod: string;
  paymentLabel: string;
  installments: number;
  feePercent: number;
  feeValue: number;
  totalToPay: number;
  answers: SaleAnswer[];
}

export interface CustomerSummary {
  id: string;
  name: string;
  phone: string;
  cpf: string | null;
  vip: boolean;
  notes: string | null;
  createdAt: string;
  totalSpent: number;
  lastVisit: string | null;
  visits: number;
  status: "VIP" | "Ativo" | "Novo";
}

export interface CustomerHistoryItem {
  type: "Venda" | "Conserto";
  detail: string;
  date: string;
  value: number;
  status: string;
}

export interface CustomerDetail extends CustomerSummary {
  salesCount: number;
  repairsCount: number;
  history: CustomerHistoryItem[];
}

export interface Repair {
  id: string;
  createdAt: string;
  customerId: string | null;
  customerName: string;
  model: string;
  color: string | null;
  imei: string | null;
  deadlineLabel: string;
  defects: DefectOption[];
  notes: string | null;
  estimatedBudget: number;
  status: string;
  completedAt: string | null;
}

export interface InventoryDevice {
  id: string;
  name: string;
  storage: string;
  color: string;
  condition: string;
  quantity: number;
  minQuantity: number;
  costPrice: number;
  salePrice: number;
  status: "Disponível" | "Estoque baixo" | "Esgotado";
}

export interface InventoryPart {
  id: string;
  name: string;
  compatible: string;
  quantity: number;
  minQuantity: number;
  supplier: string;
  costPrice: number;
  status: "Disponível" | "Estoque baixo" | "Esgotado";
}

export interface StaffUser {
  id: string;
  name: string;
  role: string;
  isOwner: boolean;
  vendas: boolean;
  conserto: boolean;
  clientes: boolean;
  financeiro: boolean;
  estoque: boolean;
  config: boolean;
}

export interface FinanceChartDay {
  label: string;
  entrada: number;
  saida: number;
  isToday: boolean;
}

export interface FinanceLedgerEntry {
  date: string;
  type: "Venda" | "Conserto" | "Despesa";
  description: string;
  paymentMethod: string;
  value: number;
}

export interface FinanceSummary {
  entradas: number;
  saidas: number;
  saldo: number;
  vendas: number;
  vendasCount: number;
  consertos: number;
  consertosCount: number;
  chartDays: FinanceChartDay[];
  ledger: FinanceLedgerEntry[];
}

export interface HomeSummary {
  vendasHoje: number;
  consertosAndamento: number;
  ticketMedio: number;
  recentes: {
    date: string;
    name: string;
    type: "Venda" | "Conserto";
    detail: string;
    value: number;
    status: string;
  }[];
}
