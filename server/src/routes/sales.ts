import { Router } from "express";
import { prisma } from "../db";

export const salesRouter = Router();

salesRouter.get("/", async (_req, res) => {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    include: { answers: true },
  });
  res.json(sales);
});

salesRouter.get("/stats", async (_req, res) => {
  const [count, sales] = await Promise.all([
    prisma.sale.count(),
    prisma.sale.findMany({ select: { totalToPay: true, createdAt: true } }),
  ]);
  const revenue = sales.reduce((sum, s) => sum + s.totalToPay, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const salesThisMonth = sales.filter((s) => s.createdAt >= startOfMonth);
  res.json({
    totalSales: count,
    totalRevenue: revenue,
    salesThisMonth: salesThisMonth.length,
    revenueThisMonth: salesThisMonth.reduce((sum, s) => sum + s.totalToPay, 0),
  });
});

salesRouter.get("/:id", async (req, res) => {
  const sale = await prisma.sale.findUnique({
    where: { id: req.params.id },
    include: { answers: true },
  });
  if (!sale) return res.status(404).json({ error: "Venda não encontrada" });
  res.json(sale);
});

salesRouter.post("/", async (req, res) => {
  const {
    customerName,
    customerPhone,
    deviceId,
    hasTradeIn,
    tradeInModelId,
    checklistAnswers,
    paymentMethod,
    installments,
  } = req.body ?? {};

  if (!customerName || !customerPhone) {
    return res.status(400).json({ error: "Nome e telefone do cliente são obrigatórios" });
  }
  if (!deviceId) {
    return res.status(400).json({ error: "Aparelho vendido é obrigatório" });
  }
  if (!paymentMethod) {
    return res.status(400).json({ error: "Forma de pagamento é obrigatória" });
  }

  const device = await prisma.device.findUnique({ where: { id: deviceId } });
  if (!device) return res.status(404).json({ error: "Aparelho não encontrado" });

  let tradeInModel = null;
  let tradeInDeductions = 0;
  let tradeInFinalValue = 0;
  let answerRecords: { categoryId: string; categoryLabel: string; optionId: string; optionLabel: string; deduction: number }[] = [];

  if (hasTradeIn) {
    if (!tradeInModelId) {
      return res.status(400).json({ error: "Modelo do aparelho de troca é obrigatório" });
    }
    tradeInModel = await prisma.tradeInModel.findUnique({ where: { id: tradeInModelId } });
    if (!tradeInModel) return res.status(404).json({ error: "Modelo de troca não encontrado" });

    const optionIds: string[] = Array.isArray(checklistAnswers) ? checklistAnswers : [];
    const options = await prisma.checklistOption.findMany({
      where: { id: { in: optionIds } },
      include: { category: true },
    });
    if (options.length !== optionIds.length) {
      return res.status(400).json({ error: "Uma ou mais opções do checklist são inválidas" });
    }

    answerRecords = options.map((o) => ({
      categoryId: o.categoryId,
      categoryLabel: o.category.label,
      optionId: o.id,
      optionLabel: o.label,
      deduction: o.deduction,
    }));
    tradeInDeductions = options.reduce((sum, o) => sum + o.deduction, 0);
    tradeInFinalValue = Math.max(0, tradeInModel.baseValue - tradeInDeductions);
  }

  const totalToPay = Math.max(0, device.price - tradeInFinalValue);

  const sale = await prisma.sale.create({
    data: {
      customerName,
      customerPhone,
      deviceId: device.id,
      deviceName: `${device.name} ${device.storage}`,
      devicePrice: device.price,
      hasTradeIn: Boolean(hasTradeIn),
      tradeInModelId: tradeInModel?.id,
      tradeInModelName: tradeInModel?.name,
      tradeInBaseValue: tradeInModel?.baseValue,
      tradeInDeductions,
      tradeInFinalValue,
      paymentMethod,
      installments: installments && installments > 0 ? installments : 1,
      totalToPay,
      answers: {
        create: answerRecords,
      },
    },
    include: { answers: true },
  });

  res.status(201).json(sale);
});
