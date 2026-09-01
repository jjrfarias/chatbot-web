import { Router } from "express";
import { prisma } from "../db";

export const inventoryRouter = Router();

function statusFor(quantity: number, minQuantity: number) {
  if (quantity === 0) return "Esgotado";
  if (quantity <= minQuantity) return "Estoque baixo";
  return "Disponível";
}

inventoryRouter.get("/devices", async (_req, res) => {
  const devices = await prisma.inventoryDevice.findMany({ orderBy: { createdAt: "asc" } });
  res.json(devices.map((d) => ({ ...d, status: statusFor(d.quantity, d.minQuantity) })));
});

inventoryRouter.post("/devices", async (req, res) => {
  const { name, storage, color, condition, quantity, minQuantity, costPrice, salePrice } = req.body ?? {};
  if (!name || !storage || !condition) return res.status(400).json({ error: "Dados incompletos" });
  const device = await prisma.inventoryDevice.create({
    data: {
      name,
      storage,
      color: color || "",
      condition,
      quantity: Number(quantity) || 0,
      minQuantity: Number(minQuantity) || 3,
      costPrice: Number(costPrice) || 0,
      salePrice: Number(salePrice) || 0,
    },
  });
  res.status(201).json({ ...device, status: statusFor(device.quantity, device.minQuantity) });
});

inventoryRouter.get("/parts", async (_req, res) => {
  const parts = await prisma.inventoryPart.findMany({ orderBy: { createdAt: "asc" } });
  res.json(parts.map((p) => ({ ...p, status: statusFor(p.quantity, p.minQuantity) })));
});

inventoryRouter.post("/parts", async (req, res) => {
  const { name, compatible, quantity, minQuantity, supplier, costPrice } = req.body ?? {};
  if (!name || !compatible) return res.status(400).json({ error: "Dados incompletos" });
  const part = await prisma.inventoryPart.create({
    data: {
      name,
      compatible,
      quantity: Number(quantity) || 0,
      minQuantity: Number(minQuantity) || 4,
      supplier: supplier || "",
      costPrice: Number(costPrice) || 0,
    },
  });
  res.status(201).json({ ...part, status: statusFor(part.quantity, part.minQuantity) });
});
