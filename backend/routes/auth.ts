import { Router } from "express";
import type { Request, Response } from "express";
import pool from "../db";
import { verifyTelegramInitData } from "../telegram";

const router = Router();

/**
 * POST /api/auth/telegram
 * Body: { initData: string }
 * Telegram WebApp dan kelgan initData ni verify qilib, user qaytaradi
 */
router.post("/telegram", async (req: Request, res: Response) => {
  const { initData } = req.body as { initData?: string };

  if (!initData) {
    res.status(400).json({ error: "initData majburiy" });
    return;
  }

  const tgUser = verifyTelegramInitData(initData);

  if (!tgUser) {
    res.status(401).json({ error: "Telegram ma'lumotlari noto'g'ri yoki muddati o'tgan" });
    return;
  }

  try {
    // Foydalanuvchini bazaga saqlash yoki yangilash
    const result = await pool.query(
      `INSERT INTO users (id, first_name, last_name, username)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE
       SET first_name = $2, last_name = $3, username = $4
       RETURNING *`,
      [tgUser.id, tgUser.first_name, tgUser.last_name ?? null, tgUser.username ?? null]
    );

    // Yangi foydalanuvchi uchun default kategoriya va hisob
    const existing = await pool.query(
      "SELECT id FROM categories WHERE user_id = $1 LIMIT 1",
      [tgUser.id]
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
        [tgUser.id]
      );

      await pool.query(
        `INSERT INTO accounts (user_id, name, balance, currency, icon)
         VALUES ($1, 'Asosiy hisob', 0, 'UZS', '💳')`,
        [tgUser.id]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server xatolik" });
  }
});

export default router;
