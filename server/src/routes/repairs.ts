import { Router } from "express";
import { prisma } from "../db";

export const repairsRouter = Router();

repairsRouter.get("/", async (_req, res) => {
  const repairs = await prisma.repair.findMany({ orderBy: { createdAt: "desc" } });
  res.json(repairs.map((r) => ({ ...r, defects: JSON.parse(r.defectsJson) })));
});

repairsRouter.post("/", async (req, res) => {
  const { customerName, customerId, model, color, imei, deadlineLabel, defects, notes } = req.body ?? {};

  if (!customerName || !model || !deadlineLabel) {
    return res.status(400).json({ error: "Cliente, modelo e prazo são obrigatórios" });
  }
  const defectList: { id: string; label: string; price: number }[] = Array.isArray(defects) ? defects : [];
  const estimatedBudget = defectList.reduce((s, d) => s + d.price, 0);

  const repair = await prisma.repair.create({
    data: {
      customerId: customerId || null,
      customerName,
      model,
      color: color || null,
      imei: imei || null,
      deadlineLabel,
      defectsJson: JSON.stringify(defectList),
      notes: notes || null,
      estimatedBudget,
      status: "Em andamento",
    },
  });
  res.status(201).json({ ...repair, defects: defectList });
});

repairsRouter.patch("/:id/status", async (req, res) => {
  const { status } = req.body ?? {};
  if (!status) return res.status(400).json({ error: "Status é obrigatório" });
  const repair = await prisma.repair.update({
    where: { id: req.params.id },
    data: { status, completedAt: status === "Concluído" ? new Date() : null },
  });
  res.json({ ...repair, defects: JSON.parse(repair.defectsJson) });
});
