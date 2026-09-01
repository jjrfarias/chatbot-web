import { Router } from "express";
import { prisma } from "../db";

export const customersRouter = Router();

customersRouter.get("/", async (req, res) => {
  const q = (req.query.q as string | undefined)?.toLowerCase();
  const customers = await prisma.customer.findMany({
    where: { storeId: req.storeId },
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
  const customer = await prisma.customer.findFirst({
    where: { id: req.params.id, storeId: req.storeId },
    include: {
      sales: true,
      repairs: true,
      opportunities: { include: { assignedTo: true }, orderBy: { updatedAt: "desc" } },
      interactions: { include: { staff: true }, orderBy: { createdAt: "desc" } },
      tasks: { include: { assignedTo: true }, orderBy: { dueAt: "asc" } },
      tags: { include: { tag: true } },
    },
  });
  if (!customer) return res.status(404).json({ error: "Cliente não encontrado" });

  const { sales, repairs, tags, ...customerFields } = customer;

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
      status: "Venda concluída",
    })),
    ...repairs.map((r) => ({
      type: "Conserto" as const,
      detail: r.model,
      date: r.createdAt,
      value: r.estimatedBudget,
      status: r.status === "Concluído" ? "Conserto concluído" : r.status,
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
    tags: tags.map((item) => item.tag),
    history,
  });
});

customersRouter.patch("/:id", async (req, res) => {
  const { name, phone, cpf, notes, vip } = req.body ?? {};
  if (name !== undefined && !String(name).trim()) return res.status(400).json({ error: "Nome não pode ficar vazio" });
  if (phone !== undefined && !String(phone).trim()) return res.status(400).json({ error: "Telefone não pode ficar vazio" });

  const existing = await prisma.customer.findFirst({ where: { id: req.params.id, storeId: req.storeId } });
  if (!existing) return res.status(404).json({ error: "Cliente não encontrado" });

  const customer = await prisma.customer.update({
    where: { id: req.params.id },
    data: {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(phone !== undefined && { phone: String(phone).trim() }),
      ...(cpf !== undefined && { cpf: cpf || null }),
      ...(notes !== undefined && { notes: notes || null }),
      ...(vip !== undefined && { vip: Boolean(vip) }),
    },
  });
  res.json(customer);
});

customersRouter.post("/", async (req, res) => {
  const { name, phone, cpf } = req.body ?? {};
  if (!name || !phone) return res.status(400).json({ error: "Nome e telefone são obrigatórios" });
  const customer = await prisma.customer.create({ data: { storeId: req.storeId, name, phone, cpf: cpf || null } });
  res.status(201).json(customer);
});
