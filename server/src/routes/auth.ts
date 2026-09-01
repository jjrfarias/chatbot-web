import { Router } from "express";
import { prisma } from "../db";
import { comparePassword, cookieOptions, SESSION_COOKIE, signSession } from "../auth";
import { requireAuth } from "../middleware/requireAuth";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
  }

  const staff = await prisma.staffUser.findUnique({
    where: { email: String(email).toLowerCase().trim() },
    include: { store: true },
  });
  if (!staff) return res.status(401).json({ error: "E-mail ou senha inválidos" });

  const valid = await comparePassword(password, staff.passwordHash);
  if (!valid) return res.status(401).json({ error: "E-mail ou senha inválidos" });

  const token = signSession({ userId: staff.id, storeId: staff.storeId });
  res.cookie(SESSION_COOKIE, token, cookieOptions);

  const { passwordHash, store, ...user } = staff;
  res.json({ user, store });
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE, { ...cookieOptions, maxAge: undefined });
  res.json({ ok: true });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const staff = await prisma.staffUser.findUnique({
    where: { id: req.userId },
    include: { store: true },
  });
  if (!staff) return res.status(401).json({ error: "Não autenticado" });

  const { passwordHash, store, ...user } = staff;
  res.json({ user, store });
});
