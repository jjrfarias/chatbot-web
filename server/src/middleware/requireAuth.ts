import type { NextFunction, Request, Response } from "express";
import { SESSION_COOKIE, verifySession } from "../auth";

declare global {
  namespace Express {
    interface Request {
      storeId: string;
      userId: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[SESSION_COOKIE];
  const session = token ? verifySession(token) : null;
  if (!session) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  req.userId = session.userId;
  req.storeId = session.storeId;
  next();
}
