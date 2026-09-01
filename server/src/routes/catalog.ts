import { Router } from "express";
import { prisma } from "../db";

export const catalogRouter = Router();

catalogRouter.get("/devices", async (_req, res) => {
  const devices = await prisma.device.findMany({
    where: { active: true },
    orderBy: { price: "desc" },
  });
  res.json(devices);
});

catalogRouter.get("/trade-in-models", async (_req, res) => {
  const models = await prisma.tradeInModel.findMany({
    where: { active: true },
    orderBy: { baseValue: "desc" },
  });
  res.json(models);
});

catalogRouter.get("/checklist", async (_req, res) => {
  const categories = await prisma.checklistCategory.findMany({
    orderBy: { order: "asc" },
    include: { options: { orderBy: { order: "asc" } } },
  });
  res.json(categories);
});
