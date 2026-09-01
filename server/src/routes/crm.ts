import { Router } from "express";
import { prisma } from "../db";

export const crmRouter = Router();

export const CRM_STAGES = [
  { key: "novo_lead", label: "Novo lead" },
  { key: "em_atendimento", label: "Em atendimento" },
  { key: "aguardando_pagamento", label: "Aguardando pagamento" },
  { key: "negociacao", label: "Negociação" },
  { key: "venda_concluida", label: "Venda concluída" },
  { key: "perdido", label: "Perdido" },
] as const;

export const REPAIR_STAGES = [
  { key: "recebido", label: "Recebido" },
  { key: "diagnostico", label: "Diagnóstico" },
  { key: "aguardando_aprovacao", label: "Aguardando aprovação" },
  { key: "em_reparo", label: "Em reparo" },
  { key: "servico_concluido", label: "Conserto concluído" },
  { key: "cancelado", label: "Cancelado" },
] as const;

const stageKeys: string[] = [...CRM_STAGES, ...REPAIR_STAGES].map((stage) => stage.key);

const DEFAULT_TEMPLATES = [
  { key: "primeiro_contato", name: "Primeiro contato", category: "Vendas", order: 1, content: "Olá, {{nome}}! Tudo bem? Aqui é da loja. Como podemos ajudar?" },
  { key: "retorno_negociacao", name: "Retorno da negociação", category: "Vendas", order: 2, content: "Olá, {{nome}}! Estou retornando sobre o {{modelo}}. Ficou alguma dúvida para concluirmos sua compra?" },
  { key: "pagamento_pendente", name: "Pagamento pendente", category: "Vendas", order: 3, content: "Olá, {{nome}}! Seu {{modelo}} está reservado. Posso ajudar com a finalização do pagamento?" },
  { key: "orcamento_conserto", name: "Orçamento do conserto", category: "Assistência", order: 4, content: "Olá, {{nome}}! O orçamento do seu {{modelo}} ficou em {{valor}}. Podemos prosseguir com o reparo?" },
  { key: "status_conserto", name: "Atualização do conserto", category: "Assistência", order: 5, content: "Olá, {{nome}}! Atualização sobre seu {{modelo}}: o status atual é {{status}}." },
  { key: "aparelho_pronto", name: "Aparelho pronto", category: "Assistência", order: 6, content: "Olá, {{nome}}! Seu {{modelo}} está pronto para retirada." },
  { key: "pos_venda", name: "Pós-venda", category: "Relacionamento", order: 7, content: "Olá, {{nome}}! Passando para saber se está tudo certo com seu {{modelo}}." },
];

async function ensureTemplates(storeId: string) {
  await Promise.all(
    DEFAULT_TEMPLATES.map((item) =>
      prisma.crmMessageTemplate.upsert({
        where: { storeId_key: { storeId, key: item.key } },
        create: { ...item, storeId },
        update: {},
      }),
    ),
  );
}

async function generateAutomatedTasks(storeId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const staleLimit = new Date(now.getTime() - 3 * 86400000);
  const opportunities = await prisma.crmOpportunity.findMany({
    where: {
      storeId,
      OR: [
        { stage: { in: ["aguardando_pagamento", "aguardando_aprovacao"] } },
        { stage: { in: ["novo_lead", "em_atendimento", "negociacao", "recebido", "diagnostico", "em_reparo"] }, updatedAt: { lt: staleLimit } },
        { stage: "venda_concluida", sale: { is: { createdAt: { gte: thirtyDaysAgo } } } },
      ],
    },
    include: { sale: true },
  });
  for (const opportunity of opportunities) {
    let kind = "retorno";
    let title = `Retornar contato: ${opportunity.title}`;
    let dueAt = opportunity.nextActionAt ?? now;
    if (opportunity.stage === "aguardando_pagamento") { kind = "pagamento"; title = `Cobrar pagamento: ${opportunity.title}`; }
    if (opportunity.stage === "aguardando_aprovacao") { kind = "aprovacao"; title = `Confirmar orçamento: ${opportunity.title}`; }
    if (opportunity.stage === "venda_concluida" && opportunity.sale) { kind = "pos_venda"; title = `Pós-venda: ${opportunity.title}`; dueAt = new Date(opportunity.sale.createdAt.getTime() + 3 * 86400000); }
    await prisma.crmTask.upsert({
      where: { automationKey: `${kind}:${opportunity.id}` },
      create: { storeId, automationKey: `${kind}:${opportunity.id}`, customerId: opportunity.customerId, opportunityId: opportunity.id, assignedToId: opportunity.assignedToId, title, dueAt },
      update: {},
    });
  }
}

crmRouter.get("/actions/today", async (req, res) => {
  await generateAutomatedTasks(req.storeId);
  const tasks = await prisma.crmTask.findMany({
    where: { storeId: req.storeId, completed: false },
    include: { customer: true, assignedTo: true, opportunity: true },
    orderBy: { dueAt: "asc" },
  });
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(); endOfToday.setHours(23, 59, 59, 999);
  const endOfWeek = new Date(endOfToday.getTime() + 7 * 86400000);
  res.json({
    overdue: tasks.filter((task) => task.dueAt < startOfToday),
    today: tasks.filter((task) => task.dueAt >= startOfToday && task.dueAt <= endOfToday),
    upcoming: tasks.filter((task) => task.dueAt > endOfToday && task.dueAt <= endOfWeek),
  });
});

crmRouter.get("/message-templates", async (req, res) => {
  await ensureTemplates(req.storeId);
  res.json(await prisma.crmMessageTemplate.findMany({ where: { storeId: req.storeId }, orderBy: { order: "asc" } }));
});

crmRouter.put("/message-templates", async (req, res) => {
  const templates = Array.isArray(req.body?.templates) ? req.body.templates : [];
  await prisma.$transaction(
    templates.map((item: { id: string; content: string; active: boolean }) =>
      prisma.crmMessageTemplate.updateMany({
        where: { id: item.id, storeId: req.storeId },
        data: { content: item.content, active: Boolean(item.active) },
      }),
    ),
  );
  res.json(await prisma.crmMessageTemplate.findMany({ where: { storeId: req.storeId }, orderBy: { order: "asc" } }));
});

crmRouter.post("/whatsapp/open", async (req, res) => {
  const { customerId, phone, message, templateName } = req.body ?? {};
  if (!customerId || !phone || !message?.trim()) return res.status(400).json({ error: "Cliente, telefone e mensagem são obrigatórios" });
  const customer = await prisma.customer.findFirst({ where: { id: customerId, storeId: req.storeId } });
  if (!customer) return res.status(404).json({ error: "Cliente não encontrado" });
  const digits = String(phone).replace(/\D/g, "").replace(/^55/, "");
  await prisma.crmInteraction.create({
    data: { storeId: req.storeId, customerId, type: "whatsapp", content: `${templateName ? `${templateName}: ` : ""}${message.trim()}` },
  });
  res.json({ url: `https://wa.me/55${digits}?text=${encodeURIComponent(message.trim())}` });
});

crmRouter.get("/board", async (req, res) => {
  const pipeline = req.query.pipeline === "assistencia" ? "assistencia" : "vendas";
  const stages = pipeline === "assistencia" ? REPAIR_STAGES : CRM_STAGES;
  const [opportunities, tasks] = await Promise.all([
    prisma.crmOpportunity.findMany({
      where: { storeId: req.storeId, pipeline },
      include: { customer: { include: { tags: { include: { tag: true } } } }, assignedTo: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.crmTask.findMany({
      where: { storeId: req.storeId, completed: false },
      include: { customer: true, assignedTo: true },
      orderBy: { dueAt: "asc" },
      take: 8,
    }),
  ]);
  res.json({
    stages,
    opportunities: opportunities.map((opportunity) => ({
      ...opportunity,
      customer: {
        ...opportunity.customer,
        tags: opportunity.customer.tags.map((item) => item.tag),
      },
    })),
    tasks,
  });
});

crmRouter.post("/opportunities", async (req, res) => {
  const { customerId, title, stage, pipeline, value, source, notes, nextActionAt, assignedToId } = req.body ?? {};
  if (!customerId || !title) return res.status(400).json({ error: "Cliente e título são obrigatórios" });
  if (stage && !stageKeys.includes(stage)) return res.status(400).json({ error: "Etapa inválida" });

  const customer = await prisma.customer.findFirst({ where: { id: customerId, storeId: req.storeId } });
  if (!customer) return res.status(404).json({ error: "Cliente não encontrado" });

  const opportunity = await prisma.crmOpportunity.create({
    data: {
      storeId: req.storeId,
      customerId,
      title,
      stage: stage || "novo_lead",
      pipeline: pipeline === "assistencia" ? "assistencia" : "vendas",
      value: Number(value) || 0,
      source: source || null,
      notes: notes || null,
      nextActionAt: nextActionAt ? new Date(nextActionAt) : null,
      assignedToId: assignedToId || null,
    },
    include: { customer: true, assignedTo: true },
  });
  res.status(201).json(opportunity);
});

crmRouter.patch("/opportunities/:id", async (req, res) => {
  const { stage, title, value, source, notes, lostReason, nextActionAt, assignedToId } = req.body ?? {};
  if (stage && !stageKeys.includes(stage)) return res.status(400).json({ error: "Etapa inválida" });

  const existing = await prisma.crmOpportunity.findFirst({ where: { id: req.params.id, storeId: req.storeId } });
  if (!existing) return res.status(404).json({ error: "Oportunidade não encontrada" });

  const opportunity = await prisma.crmOpportunity.update({
    where: { id: req.params.id },
    data: {
      ...(stage !== undefined && { stage }),
      ...(title !== undefined && { title }),
      ...(value !== undefined && { value: Number(value) || 0 }),
      ...(source !== undefined && { source: source || null }),
      ...(notes !== undefined && { notes: notes || null }),
      ...(lostReason !== undefined && { lostReason: lostReason || null }),
      ...(nextActionAt !== undefined && { nextActionAt: nextActionAt ? new Date(nextActionAt) : null }),
      ...(assignedToId !== undefined && { assignedToId: assignedToId || null }),
    },
    include: { customer: true, assignedTo: true, repair: true },
  });
  if (stage && opportunity.pipeline === "assistencia" && opportunity.repair) {
    const repairStatusByStage: Record<string, string> = {
      recebido: "Recebido",
      diagnostico: "Em diagnóstico",
      aguardando_aprovacao: "Aguardando aprovação",
      em_reparo: "Em andamento",
      servico_concluido: "Concluído",
      cancelado: "Cancelado",
    };
    const repairStatus = repairStatusByStage[stage];
    if (repairStatus) {
      await prisma.repair.update({
        where: { id: opportunity.repair.id },
        data: { status: repairStatus, completedAt: stage === "servico_concluido" ? new Date() : null },
      });
      await prisma.crmInteraction.create({
        data: { storeId: req.storeId, customerId: opportunity.customerId, type: "conserto", content: `Status do conserto atualizado para ${repairStatus}.` },
      });
    }
  }
  res.json(opportunity);
});

crmRouter.post("/interactions", async (req, res) => {
  const { customerId, type, content, staffId } = req.body ?? {};
  if (!customerId || !type || !content?.trim()) return res.status(400).json({ error: "Cliente, tipo e conteúdo são obrigatórios" });

  const customer = await prisma.customer.findFirst({ where: { id: customerId, storeId: req.storeId } });
  if (!customer) return res.status(404).json({ error: "Cliente não encontrado" });

  const interaction = await prisma.crmInteraction.create({
    data: { storeId: req.storeId, customerId, type, content: content.trim(), staffId: staffId || null },
    include: { staff: true },
  });
  res.status(201).json(interaction);
});

crmRouter.post("/tasks", async (req, res) => {
  const { customerId, title, dueAt, opportunityId, assignedToId } = req.body ?? {};
  if (!customerId || !title?.trim() || !dueAt) return res.status(400).json({ error: "Cliente, tarefa e prazo são obrigatórios" });

  const customer = await prisma.customer.findFirst({ where: { id: customerId, storeId: req.storeId } });
  if (!customer) return res.status(404).json({ error: "Cliente não encontrado" });

  const task = await prisma.crmTask.create({
    data: { storeId: req.storeId, customerId, title: title.trim(), dueAt: new Date(dueAt), opportunityId: opportunityId || null, assignedToId: assignedToId || null },
    include: { assignedTo: true },
  });
  res.status(201).json(task);
});

crmRouter.patch("/tasks/:id", async (req, res) => {
  const completed = Boolean(req.body?.completed);
  const existing = await prisma.crmTask.findFirst({ where: { id: req.params.id, storeId: req.storeId } });
  if (!existing) return res.status(404).json({ error: "Tarefa não encontrada" });

  const task = await prisma.crmTask.update({
    where: { id: req.params.id },
    data: { completed, completedAt: completed ? new Date() : null },
  });
  res.json(task);
});

crmRouter.post("/customers/:customerId/tags", async (req, res) => {
  const name = String(req.body?.name || "").trim();
  if (!name) return res.status(400).json({ error: "Nome da etiqueta é obrigatório" });

  const customer = await prisma.customer.findFirst({ where: { id: req.params.customerId, storeId: req.storeId } });
  if (!customer) return res.status(404).json({ error: "Cliente não encontrado" });

  const color = req.body?.color || "#56554f";
  const tag = await prisma.crmTag.upsert({
    where: { storeId_name: { storeId: req.storeId, name } },
    create: { storeId: req.storeId, name, color },
    update: {},
  });
  await prisma.customerTag.upsert({
    where: { customerId_tagId: { customerId: req.params.customerId, tagId: tag.id } },
    create: { customerId: req.params.customerId, tagId: tag.id },
    update: {},
  });
  res.status(201).json(tag);
});
