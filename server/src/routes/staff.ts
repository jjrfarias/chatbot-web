import { Router } from "express";
import { prisma } from "../db";

export const staffRouter = Router();

const PERMISSION_KEYS = ["vendas", "conserto", "clientes", "financeiro", "estoque", "config"] as const;

staffRouter.get("/", async (_req, res) => {
  const staff = await prisma.staffUser.findMany({ orderBy: [{ isOwner: "desc" }, { name: "asc" }] });
  res.json(staff);
});

staffRouter.patch("/:id/permissions", async (req, res) => {
  const key = req.body?.key as (typeof PERMISSION_KEYS)[number];
  const value = Boolean(req.body?.value);
  if (!PERMISSION_KEYS.includes(key)) return res.status(400).json({ error: "Permissão inválida" });

  const staff = await prisma.staffUser.findUnique({ where: { id: req.params.id } });
  if (!staff) return res.status(404).json({ error: "Colaborador não encontrado" });
  if (staff.isOwner) return res.status(400).json({ error: "Não é possível alterar o acesso do dono da loja" });

  const updated = await prisma.staffUser.update({ where: { id: req.params.id }, data: { [key]: value } });
  res.json(updated);
});

staffRouter.post("/", async (req, res) => {
  const { name, role } = req.body ?? {};
  if (!name || !role) return res.status(400).json({ error: "Nome e cargo são obrigatórios" });
  const staff = await prisma.staffUser.create({ data: { name, role } });
  res.status(201).json(staff);
});
