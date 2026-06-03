import { Router } from "express";
import type { Request, Response } from "express";
import pool from "../db";

const router = Router();

// Foydalanuvchini ro'yxatdan o'tkazish yoki topish
router.post("/", async (req: Request, res: Response) => {
  const { id, first_name, last_name, username } = req.body as {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  };

  if (!id || !first_name) {
    res.status(400).json({ error: "id va first_name majburiy" });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO users (id, first_name, last_name, username)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE
       SET first_name = $2, last_name = $3, username = $4
       RETURNING *`,
      [id, first_name, last_name ?? null, username ?? null]
    );

    // Yangi foydalanuvchi uchun default kategoriyalar qo'shish
    const existing = await pool.query(
      "SELECT id FROM categories WHERE user_id = $1 LIMIT 1",
      [id]
    );

    if (existing.rows.length === 0) {
      await pool.query(
        `INSERT INTO categories (user_id, name, icon, type) VALUES
        ($1, 'Oylik', '💼', 'income'),
        ($1, 'Biznes', '📈', 'income'),
        ($1, 'Sovg''a', '🎁', 'income'),
        ($1, 'Oziq-ovqat', '🛒', 'expense'),
        ($1, 'Transport', '🚗', 'expense'),
        ($1, 'Uy-joy', '🏠', 'expense'),
        ($1, 'Kiyim', '👗', 'expense'),
        ($1, 'Sog''liq', '💊', 'expense'),
        ($1, 'O''yin-kulgi', '🎮', 'expense'),
        ($1, 'Ta''lim', '📚', 'expense')`,
        [id]
      );

      // Default hisob
      await pool.query(
        `INSERT INTO accounts (user_id, name, balance, currency, icon)
         VALUES ($1, 'Asosiy hisob', 0, 'UZS', '💳')`,
        [id]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server xatolik" });
  }
});

// Foydalanuvchi ma'lumotlarini olish
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      req.params["id"],
    ]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Foydalanuvchi topilmadi" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server xatolik" });
  }
});

export default router;
