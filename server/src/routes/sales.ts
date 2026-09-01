import { Router } from "express";
import { prisma } from "../db";
import { WARRANTY_OPTIONS } from "../constants";

export const salesRouter = Router();

salesRouter.get("/", async (_req, res) => {
  const sales = await prisma.sale.findMany({
    orderBy: { createdAt: "desc" },
    include: { answers: true },
  });
  res.json(sales);
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
  const { customer, deviceId, hasTradeIn, tradeInModelId, checklistAnswers, warrantyKey, paymentMethod } =
    req.body ?? {};

  if (!customer?.name || !customer?.phone) {
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

  const fee = await prisma.paymentFee.findUnique({ where: { key: paymentMethod } });
  if (!fee) return res.status(400).json({ error: "Forma de pagamento inválida" });

  const warranty = WARRANTY_OPTIONS.find((w) => w.key === warrantyKey) ?? WARRANTY_OPTIONS[0];

  let customerRow;
  if (customer.id) {
    customerRow = await prisma.customer.findUnique({ where: { id: customer.id } });
    if (!customerRow) return res.status(404).json({ error: "Cliente não encontrado" });
  } else {
    customerRow = await prisma.customer.create({
      data: { name: customer.name, phone: customer.phone, cpf: customer.cpf || null },
    });
  }

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

  const installmentsMatch = /^credito(\d+)x$/.exec(paymentMethod);
  const installments = installmentsMatch ? Number(installmentsMatch[1]) : 1;

  const diff = Math.max(0, device.price - tradeInFinalValue);
  const base = diff + warranty.price;
  const feeValue = base * (fee.feePercent / 100);
  const totalToPay = base + feeValue;

  const salesCount = await prisma.sale.count();
  const orderNumber = "CR-" + String(8421 + salesCount).padStart(5, "0");

  const sale = await prisma.sale.create({
    data: {
      orderNumber,
      customerId: customerRow.id,
      customerName: customerRow.name,
      customerPhone: customerRow.phone,
      deviceId: device.id,
      deviceName: device.name,
      deviceColor: device.color,
      devicePrice: device.price,
      hasTradeIn: Boolean(hasTradeIn),
      tradeInModelId: tradeInModel?.id,
      tradeInModelName: tradeInModel?.name,
      tradeInBaseValue: tradeInModel?.baseValue,
      tradeInDeductions,
      tradeInFinalValue,
      warrantyKey: warranty.key,
      warrantyLabel: warranty.label,
      warrantyPrice: warranty.price,
      paymentMethod: fee.key,
      paymentLabel: fee.label,
      installments,
      feePercent: fee.feePercent,
      feeValue,
      totalToPay,
      answers: {
        create: answerRecords,
      },
    },
    include: { answers: true },
  });

  res.status(201).json(sale);
});
