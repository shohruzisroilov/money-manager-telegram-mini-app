import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { runMigrations } from "./migrations";
import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import accountsRouter from "./routes/accounts";
import categoriesRouter from "./routes/categories";
import transactionsRouter from "./routes/transactions";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/accounts", accountsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/transactions", transactionsRouter);

app.get("/", (_req, res) => {
  res.json({ status: "Money Manager API ishlayapti ✅" });
});

const PORT = process.env["PORT"] ?? 3000;

app.listen(PORT, async () => {
  console.log(`Server ${PORT} portda ishga tushdi 🚀`);
  await runMigrations();
});
