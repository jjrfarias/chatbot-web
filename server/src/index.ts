import "dotenv/config";
import path from "path";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRouter } from "./routes/auth";
import { storeRouter } from "./routes/store";
import { catalogRouter } from "./routes/catalog";
import { salesRouter } from "./routes/sales";
import { customersRouter } from "./routes/customers";
import { repairsRouter } from "./routes/repairs";
import { inventoryRouter } from "./routes/inventory";
import { staffRouter } from "./routes/staff";
import { financeRouter } from "./routes/finance";
import { homeRouter } from "./routes/home";
import { crmRouter } from "./routes/crm";
import { requireAuth } from "./middleware/requireAuth";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3333;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.use("/api", requireAuth, catalogRouter);
app.use("/api/store", requireAuth, storeRouter);
app.use("/api/sales", requireAuth, salesRouter);
app.use("/api/customers", requireAuth, customersRouter);
app.use("/api/repairs", requireAuth, repairsRouter);
app.use("/api/inventory", requireAuth, inventoryRouter);
app.use("/api/staff", requireAuth, staffRouter);
app.use("/api/finance", requireAuth, financeRouter);
app.use("/api/home", requireAuth, homeRouter);
app.use("/api/crm", requireAuth, crmRouter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const clientDist = path.join(__dirname, "..", "..", "client", "dist");
app.use(express.static(clientDist));
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(PORT, () => {
  console.log(`CR Smart API rodando em http://localhost:${PORT}`);
});
