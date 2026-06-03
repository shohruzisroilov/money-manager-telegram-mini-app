import { Router } from "express";
import type { Request, Response } from "express";
import pool from "../db";

const router = Router();

// Barcha kategoriyalarni olish
router.get("/", async (req: Request, res: Response) => {
  const { user_id, type } = req.query;
  if (!user_id) {
    res.status(400).json({ error: "user_id majburiy" });
    return;
  }
  try {
    let query = "SELECT * FROM categories WHERE user_id = $1";
    const params: unknown[] = [user_id];
    if (type) {
      query += " AND type = $2";
      params.push(type);
    }
    query += " ORDER BY name";
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server xatolik" });
  }
});

// Yangi kategoriya qo'shish
router.post("/", async (req: Request, res: Response) => {
  const { user_id, name, icon, type } = req.body as {
    user_id: number;
    name: string;
    icon?: string;
    type: "income" | "expense";
  };
  if (!user_id || !name || !type) {
    res.status(400).json({ error: "user_id, name va type majburiy" });
    return;
  }
  try {
    const result = await pool.query(
      `INSERT INTO categories (user_id, name, icon, type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, name, icon ?? "💰", type]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server xatolik" });
  }
});

// Kategoriyani yangilash
router.put("/:id", async (req: Request, res: Response) => {
  const { name, icon } = req.body as { name?: string; icon?: string };
  try {
    const result = await pool.query(
      `UPDATE categories SET
        name = COALESCE($1, name),
        icon = COALESCE($2, icon)
       WHERE id = $3 RETURNING *`,
      [name, icon, req.params["id"]]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Kategoriya topilmadi" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server xatolik" });
  }
});

// Kategoriyani o'chirish
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await pool.query("DELETE FROM categories WHERE id = $1", [
      req.params["id"],
    ]);
    res.json({ message: "Kategoriya o'chirildi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server xatolik" });
  }
});

export default router;
