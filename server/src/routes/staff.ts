import { Router } from "express";
import { prisma } from "../db";
import { hashPassword } from "../auth";

export const staffRouter = Router();

const PERMISSION_KEYS = ["vendas", "conserto", "clientes", "financeiro", "estoque", "config"] as const;

staffRouter.get("/", async (req, res) => {
  const staff = await prisma.staffUser.findMany({
    where: { storeId: req.storeId },
    orderBy: [{ isOwner: "desc" }, { name: "asc" }],
  });
  res.json(staff.map(({ passwordHash, ...s }) => s));
});

staffRouter.patch("/:id/permissions", async (req, res) => {
  const key = req.body?.key as (typeof PERMISSION_KEYS)[number];
  const value = Boolean(req.body?.value);
  if (!PERMISSION_KEYS.includes(key)) return res.status(400).json({ error: "Permissão inválida" });

  const staff = await prisma.staffUser.findFirst({ where: { id: req.params.id, storeId: req.storeId } });
  if (!staff) return res.status(404).json({ error: "Colaborador não encontrado" });
  if (staff.isOwner) return res.status(400).json({ error: "Não é possível alterar o acesso do dono da loja" });

  const updated = await prisma.staffUser.update({ where: { id: req.params.id }, data: { [key]: value } });
  const { passwordHash, ...rest } = updated;
  res.json(rest);
});

staffRouter.post("/", async (req, res) => {
  const { name, role, email, password } = req.body ?? {};
  if (!name || !role || !email || !password) {
    return res.status(400).json({ error: "Nome, cargo, e-mail e senha são obrigatórios" });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: "A senha deve ter pelo menos 6 caracteres" });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const existing = await prisma.staffUser.findUnique({ where: { email: normalizedEmail } });
  if (existing) return res.status(409).json({ error: "Já existe um usuário com esse e-mail" });

  const passwordHash = await hashPassword(password);
  const staff = await prisma.staffUser.create({
    data: { storeId: req.storeId, name, role, email: normalizedEmail, passwordHash },
  });
  const { passwordHash: _omit, ...rest } = staff;
  res.status(201).json(rest);
});
