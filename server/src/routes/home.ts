import { Router } from "express";
import { prisma } from "../db";

export const homeRouter = Router();

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

homeRouter.get("/summary", async (_req, res) => {
  const today = startOfDay(new Date());
  const [allSales, allRepairs] = await Promise.all([
    prisma.sale.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.repair.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const vendasHoje = allSales.filter((s) => s.createdAt >= today).length;
  const consertosAndamento = allRepairs.filter((r) => r.status !== "Concluído").length;
  const ticketMedio = allSales.length ? allSales.reduce((s, x) => s + x.totalToPay, 0) / allSales.length : 0;

  const recentes = [
    ...allSales.map((s) => ({
      date: s.createdAt,
      name: s.customerName,
      type: "Venda" as const,
      detail: s.deviceName,
      value: s.totalToPay,
      status: "Venda concluída",
    })),
    ...allRepairs.map((r) => ({
      date: r.createdAt,
      name: r.customerName,
      type: "Conserto" as const,
      detail: r.model,
      value: r.estimatedBudget,
      status: r.status === "Concluído" ? "Conserto concluído" : r.status,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 6);

  res.json({ vendasHoje, consertosAndamento, ticketMedio, recentes });
});
