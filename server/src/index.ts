import express from "express";
import cors from "cors";
import { catalogRouter } from "./routes/catalog";
import { salesRouter } from "./routes/sales";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3333;

app.use(cors());
app.use(express.json());

app.use("/api", catalogRouter);
app.use("/api/sales", salesRouter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`CR Smart API rodando em http://localhost:${PORT}`);
});
