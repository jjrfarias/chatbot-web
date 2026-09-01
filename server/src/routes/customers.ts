import { Router } from "express";
import { prisma } from "../db";

export const customersRouter = Router();

customersRouter.get("/", async (req, res) => {
  const q = (req.query.q as string | undefined)?.toLowerCase();
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { sales: true, repairs: true },
  });

  const withStats = customers
    .map((c) => {
      const totalSpent =
        c.sales.reduce((s, sale) => s + sale.totalToPay, 0) +
        c.repairs.reduce((s, r) => s + r.estimatedBudget, 0);
      const lastVisitDates = [...c.sales.map((s) => s.createdAt), ...c.repairs.map((r) => r.createdAt)];
      const lastVisit = lastVisitDates.length ? new Date(Math.max(...lastVisitDates.map((d) => d.getTime()))) : null;
      const visits = c.sales.length + c.repairs.length;
      const status = c.vip ? "VIP" : visits === 0 ? "Novo" : "Ativo";
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        cpf: c.cpf,
        vip: c.vip,
        notes: c.notes,
        createdAt: c.createdAt,
        totalSpent,
        lastVisit,
        visits,
        status,
      };
    })
    .filter((c) => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.cpf ?? "").includes(q));

  res.json(withStats);
});

customersRouter.get("/:id", async (req, res) => {
  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
    include: { sales: true, repairs: true },
  });
  if (!customer) return res.status(404).json({ error: "Cliente não encontrado" });

  const { sales, repairs, ...customerFields } = customer;

  const totalSpent =
    sales.reduce((s, sale) => s + sale.totalToPay, 0) + repairs.reduce((s, r) => s + r.estimatedBudget, 0);
  const lastVisitDates = [...sales.map((s) => s.createdAt), ...repairs.map((r) => r.createdAt)];
  const lastVisit = lastVisitDates.length ? new Date(Math.max(...lastVisitDates.map((d) => d.getTime()))) : null;
  const visits = sales.length + repairs.length;
  const status = customer.vip ? "VIP" : visits === 0 ? "Novo" : "Ativo";

  const history = [
    ...sales.map((s) => ({
      type: "Venda" as const,
      detail: s.deviceName,
      date: s.createdAt,
      value: s.totalToPay,
      status: "Concluído",
    })),
    ...repairs.map((r) => ({
      type: "Conserto" as const,
      detail: r.model,
      date: r.createdAt,
      value: r.estimatedBudget,
      status: r.status,
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  res.json({
    ...customerFields,
    totalSpent,
    lastVisit,
    visits,
    status,
    salesCount: sales.length,
    repairsCount: repairs.length,
    history,
  });
});

customersRouter.post("/", async (req, res) => {
  const { name, phone, cpf } = req.body ?? {};
  if (!name || !phone) return res.status(400).json({ error: "Nome e telefone são obrigatórios" });
  const customer = await prisma.customer.create({ data: { name, phone, cpf: cpf || null } });
  res.status(201).json(customer);
});
