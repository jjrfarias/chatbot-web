import "dotenv/config";
import path from "path";
import express from "express";
import cors from "cors";
import { catalogRouter } from "./routes/catalog";
import { salesRouter } from "./routes/sales";
import { customersRouter } from "./routes/customers";
import { repairsRouter } from "./routes/repairs";
import { inventoryRouter } from "./routes/inventory";
import { staffRouter } from "./routes/staff";
import { financeRouter } from "./routes/finance";
import { homeRouter } from "./routes/home";
import { crmRouter } from "./routes/crm";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3333;

app.use(cors());
app.use(express.json());

app.use("/api", catalogRouter);
app.use("/api/sales", salesRouter);
app.use("/api/customers", customersRouter);
app.use("/api/repairs", repairsRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/staff", staffRouter);
app.use("/api/finance", financeRouter);
app.use("/api/home", homeRouter);
app.use("/api/crm", crmRouter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const clientDist = path.join(__dirname, "..", "..", "client", "dist");
app.use(express.static(clientDist));
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(PORT, () => {
  console.log(`CR Smart API rodando em http://localhost:${PORT}`);
});
