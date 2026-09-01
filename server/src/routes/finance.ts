import { Router } from "express";
import { prisma } from "../db";

export const financeRouter = Router();

const WEEKDAY_LABELS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function rangeStart(period: string) {
  const now = new Date();
  if (period === "semana") {
    const d = startOfDay(now);
    d.setDate(d.getDate() - 6);
    return d;
  }
  if (period === "mes") {
    const d = startOfDay(now);
    d.setDate(1);
    return d;
  }
  return startOfDay(now);
}

financeRouter.get("/summary", async (req, res) => {
  const period = (req.query.period as string) || "hoje";
  const start = rangeStart(period);

  const storeId = req.storeId;
  const [sales, repairs, expenses] = await Promise.all([
    prisma.sale.findMany({ where: { storeId, createdAt: { gte: start } } }),
    prisma.repair.findMany({ where: { storeId, createdAt: { gte: start } } }),
    prisma.expense.findMany({ where: { storeId, date: { gte: start } } }),
  ]);

  const vendas = sales.reduce((s, x) => s + x.totalToPay, 0);
  const consertos = repairs.reduce((s, x) => s + x.estimatedBudget, 0);
  const saidas = expenses.reduce((s, x) => s + x.amount, 0);
  const entradas = vendas + consertos;

  const chartStart = startOfDay(new Date());
  chartStart.setDate(chartStart.getDate() - 6);
  const [chartSales, chartRepairs, chartExpenses] = await Promise.all([
    prisma.sale.findMany({ where: { storeId, createdAt: { gte: chartStart } } }),
    prisma.repair.findMany({ where: { storeId, createdAt: { gte: chartStart } } }),
    prisma.expense.findMany({ where: { storeId, date: { gte: chartStart } } }),
  ]);

  const chartDays = Array.from({ length: 7 }, (_, i) => {
    const day = startOfDay(new Date());
    day.setDate(day.getDate() - (6 - i));
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);
    const inDay = (d: Date) => d >= day && d < nextDay;
    const entrada =
      chartSales.filter((s) => inDay(s.createdAt)).reduce((s, x) => s + x.totalToPay, 0) +
      chartRepairs.filter((r) => inDay(r.createdAt)).reduce((s, x) => s + x.estimatedBudget, 0);
    const saida = chartExpenses.filter((e) => inDay(e.date)).reduce((s, x) => s + x.amount, 0);
    return { label: WEEKDAY_LABELS[day.getDay()], entrada, saida, isToday: i === 6 };
  });

  const ledger = [
    ...sales.map((s) => ({
      date: s.createdAt,
      type: "Venda" as const,
      description: `${s.deviceName} · ${s.customerName}`,
      paymentMethod: s.paymentLabel,
      value: s.totalToPay,
    })),
    ...repairs.map((r) => ({
      date: r.createdAt,
      type: "Conserto" as const,
      description: `${r.model} · ${r.customerName}`,
      paymentMethod: "—",
      value: r.estimatedBudget,
    })),
    ...expenses.map((e) => ({
      date: e.date,
      type: "Despesa" as const,
      description: e.description,
      paymentMethod: e.paymentMethod,
      value: -e.amount,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  res.json({
    entradas,
    saidas,
    saldo: entradas - saidas,
    vendas,
    vendasCount: sales.length,
    consertos,
    consertosCount: repairs.length,
    chartDays,
    ledger,
  });
});
