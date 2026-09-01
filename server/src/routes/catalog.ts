import { Router } from "express";
import { prisma } from "../db";
import { DEFECT_OPTIONS, REPAIR_DEADLINES, WARRANTY_OPTIONS } from "../constants";

export const catalogRouter = Router();

catalogRouter.get("/warranty-options", (_req, res) => res.json(WARRANTY_OPTIONS));
catalogRouter.get("/defect-options", (_req, res) => res.json(DEFECT_OPTIONS));
catalogRouter.get("/repair-deadlines", (_req, res) => res.json(REPAIR_DEADLINES));

catalogRouter.get("/payment-fees", async (req, res) => {
  const fees = await prisma.paymentFee.findMany({ where: { storeId: req.storeId }, orderBy: { order: "asc" } });
  res.json(fees);
});

catalogRouter.put("/payment-fees", async (req, res) => {
  const updates: { id: string; feePercent: number }[] = req.body?.fees ?? [];
  await Promise.all(
    updates.map((u) =>
      prisma.paymentFee.updateMany({
        where: { id: u.id, storeId: req.storeId },
        data: { feePercent: u.feePercent },
      }),
    ),
  );
  const fees = await prisma.paymentFee.findMany({ where: { storeId: req.storeId }, orderBy: { order: "asc" } });
  res.json(fees);
});

catalogRouter.put("/trade-in-models", async (req, res) => {
  const updates: { id: string; baseValue: number }[] = req.body?.models ?? [];
  await Promise.all(
    updates.map((u) =>
      prisma.tradeInModel.updateMany({
        where: { id: u.id, storeId: req.storeId },
        data: { baseValue: u.baseValue },
      }),
    ),
  );
  const models = await prisma.tradeInModel.findMany({
    where: { storeId: req.storeId, active: true },
    orderBy: { baseValue: "desc" },
  });
  res.json(models);
});

catalogRouter.get("/devices", async (req, res) => {
  const devices = await prisma.device.findMany({
    where: { storeId: req.storeId, active: true },
    orderBy: { price: "desc" },
  });
  res.json(devices);
});

catalogRouter.get("/trade-in-models", async (req, res) => {
  const models = await prisma.tradeInModel.findMany({
    where: { storeId: req.storeId, active: true },
    orderBy: { baseValue: "desc" },
  });
  res.json(models);
});

catalogRouter.get("/checklist", async (req, res) => {
  const categories = await prisma.checklistCategory.findMany({
    where: { storeId: req.storeId },
    orderBy: { order: "asc" },
    include: { options: { orderBy: { order: "asc" } } },
  });
  res.json(categories);
});
