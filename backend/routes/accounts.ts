import { Router } from "express";
import type { Request, Response } from "express";
import pool from "../db";

const router = Router();

// Barcha hisoblarni olish
router.get("/", async (req: Request, res: Response) => {
  const { user_id } = req.query;
  if (!user_id) {
    res.status(400).json({ error: "user_id majburiy" });
    return;
  }
  try {
    const result = await pool.query(
      "SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_at",
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server xatolik" });
  }
});

// Yangi hisob qo'shish
router.post("/", async (req: Request, res: Response) => {
  const { user_id, name, balance, currency, icon } = req.body as {
    user_id: number;
    name: string;
    balance?: number;
    currency?: string;
    icon?: string;
  };
  if (!user_id || !name) {
    res.status(400).json({ error: "user_id va name majburiy" });
    return;
  }
  try {
    const result = await pool.query(
      `INSERT INTO accounts (user_id, name, balance, currency, icon)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user_id, name, balance ?? 0, currency ?? "UZS", icon ?? "💳"]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server xatolik" });
  }
});

// Hisobni yangilash
router.put("/:id", async (req: Request, res: Response) => {
  const { name, currency, icon } = req.body as {
    name?: string;
    currency?: string;
    icon?: string;
  };
  try {
    const result = await pool.query(
      `UPDATE accounts SET
        name = COALESCE($1, name),
        currency = COALESCE($2, currency),
        icon = COALESCE($3, icon)
       WHERE id = $4 RETURNING *`,
      [name, currency, icon, req.params["id"]]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Hisob topilmadi" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server xatolik" });
  }
});

// Hisobni o'chirish
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await pool.query("DELETE FROM accounts WHERE id = $1", [req.params["id"]]);
    res.json({ message: "Hisob o'chirildi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server xatolik" });
  }
});

export default router;
