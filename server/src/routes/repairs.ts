import { Router } from "express";
import { prisma } from "../db";

export const repairsRouter = Router();

repairsRouter.get("/", async (_req, res) => {
  const repairs = await prisma.repair.findMany({ orderBy: { createdAt: "desc" }, include: { customer: true } });
  res.json(repairs.map((r) => ({ ...r, customerPhone: r.customer?.phone ?? null, defects: JSON.parse(r.defectsJson) })));
});

repairsRouter.post("/", async (req, res) => {
  const { customerName, customerId, customerPhone, model, color, imei, deadlineLabel, defects, notes } = req.body ?? {};

  if (!customerName || !model || !deadlineLabel) {
    return res.status(400).json({ error: "Cliente, modelo e prazo são obrigatórios" });
  }
  const defectList: { id: string; label: string; price: number }[] = Array.isArray(defects) ? defects : [];
  const estimatedBudget = defectList.reduce((s, d) => s + d.price, 0);

  let customer = customerId ? await prisma.customer.findUnique({ where: { id: customerId } }) : null;
  if (!customer) customer = await prisma.customer.findFirst({ where: { name: customerName } });
  if (!customer && customerPhone) {
    customer = await prisma.customer.create({ data: { name: customerName, phone: customerPhone } });
  }
  if (!customer) return res.status(400).json({ error: "Selecione um cliente cadastrado ou informe o telefone do novo cliente" });

  const repair = await prisma.repair.create({
    data: {
      customerId: customer.id,
      customerName: customer.name,
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
  const opportunity = await prisma.crmOpportunity.create({
    data: {
      customerId: customer.id,
      title: `${model} · ${defectList[0]?.label || "Diagnóstico"}`,
      pipeline: "assistencia",
      stage: "recebido",
      value: estimatedBudget,
      source: "Assistência técnica",
      notes: notes || `Prazo estimado: ${deadlineLabel}`,
    },
  });
  const linkedRepair = await prisma.repair.update({ where: { id: repair.id }, data: { crmOpportunityId: opportunity.id } });
  await prisma.crmInteraction.create({ data: { customerId: customer.id, type: "conserto", content: `Conserto de ${model} recebido e adicionado ao funil de assistência.` } });
  res.status(201).json({ ...linkedRepair, defects: defectList, crmOpportunityCreated: { id: opportunity.id, title: opportunity.title } });
});

repairsRouter.patch("/:id/status", async (req, res) => {
  const { status } = req.body ?? {};
  if (!status) return res.status(400).json({ error: "Status é obrigatório" });
  const current = await prisma.repair.findUnique({ where: { id: req.params.id } });
  if (!current) return res.status(404).json({ error: "Conserto não encontrado" });
  const repair = await prisma.repair.update({
    where: { id: req.params.id },
    data: { status, completedAt: status === "Concluído" ? new Date() : null },
  });
  if (repair.crmOpportunityId) {
    const stageByStatus: Record<string, string> = {
      "Recebido": "recebido",
      "Em diagnóstico": "diagnostico",
      "Em andamento": "em_reparo",
      "Aguardando peça": "em_reparo",
      "Aguardando aprovação": "aguardando_aprovacao",
      "Concluído": "servico_concluido",
      "Cancelado": "cancelado",
    };
    const crmStage = stageByStatus[status];
    if (crmStage) await prisma.crmOpportunity.update({ where: { id: repair.crmOpportunityId }, data: { stage: crmStage } });
    if (repair.customerId) {
      await prisma.crmInteraction.create({ data: { customerId: repair.customerId, type: "conserto", content: `Status do conserto de ${repair.model} atualizado para ${status}.` } });
    }
    if (status === "Concluído") {
      await prisma.crmTask.updateMany({ where: { opportunityId: repair.crmOpportunityId, completed: false }, data: { completed: true, completedAt: new Date() } });
    }
  }
  res.json({ ...repair, defects: JSON.parse(repair.defectsJson) });
});
