import { Router } from "express";
import type { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { prisma } from "../db";

export const storeRouter = Router();

const uploadsDir = path.join(__dirname, "..", "..", "uploads", "logos");
fs.mkdirSync(uploadsDir, { recursive: true });

const ALLOWED_MIME: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
      const ext = ALLOWED_MIME[file.mimetype] || path.extname(file.originalname);
      cb(null, `${req.storeId}-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME[file.mimetype]) {
      cb(new Error("Formato de imagem não suportado. Use PNG, JPG, WEBP ou SVG."));
      return;
    }
    cb(null, true);
  },
});

async function requireOwner(req: Request, res: Response) {
  const staff = await prisma.staffUser.findUnique({ where: { id: req.userId } });
  if (!staff?.isOwner) {
    res.status(403).json({ error: "Apenas o dono da loja pode alterar essas configurações" });
    return null;
  }
  return staff;
}

storeRouter.get("/", async (req, res) => {
  const store = await prisma.store.findUnique({ where: { id: req.storeId } });
  if (!store) return res.status(404).json({ error: "Loja não encontrada" });
  res.json(store);
});

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

storeRouter.patch("/", async (req, res) => {
  if (!(await requireOwner(req, res))) return;
  const { name, tagline, primaryColor, logoBackgroundColor } = req.body ?? {};

  if (name !== undefined && !String(name).trim()) {
    return res.status(400).json({ error: "Nome da loja não pode ficar vazio" });
  }
  if (primaryColor !== undefined && primaryColor !== null && !HEX_COLOR.test(primaryColor)) {
    return res.status(400).json({ error: "Cor de tema inválida" });
  }
  if (logoBackgroundColor !== undefined && logoBackgroundColor !== null && !HEX_COLOR.test(logoBackgroundColor)) {
    return res.status(400).json({ error: "Cor de fundo da logo inválida" });
  }

  const store = await prisma.store.update({
    where: { id: req.storeId },
    data: {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(tagline !== undefined && { tagline: tagline || null }),
      ...(primaryColor !== undefined && { primaryColor: primaryColor || null }),
      ...(logoBackgroundColor !== undefined && { logoBackgroundColor: logoBackgroundColor || null }),
    },
  });
  res.json(store);
});

storeRouter.post("/logo", (req, res) => {
  upload.single("logo")(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message || "Erro ao enviar imagem" });
    if (!(await requireOwner(req, res))) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return;
    }
    if (!req.file) return res.status(400).json({ error: "Nenhuma imagem enviada" });

    const previous = await prisma.store.findUnique({ where: { id: req.storeId } });
    const store = await prisma.store.update({
      where: { id: req.storeId },
      data: { logoUrl: `/uploads/logos/${req.file.filename}` },
    });

    if (previous?.logoUrl) {
      const previousPath = path.join(__dirname, "..", "..", previous.logoUrl);
      fs.unlink(previousPath, () => {});
    }

    res.status(201).json(store);
  });
});

storeRouter.delete("/logo", async (req, res) => {
  if (!(await requireOwner(req, res))) return;
  const store = await prisma.store.findUnique({ where: { id: req.storeId } });
  if (store?.logoUrl) {
    fs.unlink(path.join(__dirname, "..", "..", store.logoUrl), () => {});
  }
  const updated = await prisma.store.update({ where: { id: req.storeId }, data: { logoUrl: null } });
  res.json(updated);
});
