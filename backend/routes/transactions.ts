import { Router } from "express";
import type { Request, Response } from "express";
import pool from "../db";

const router = Router();

// Tranzaksiyalarni olish (filtrlash bilan)
router.get("/", async (req: Request, res: Response) => {
  const { user_id, type, account_id, category_id, from, to, limit, offset } =
    req.query;

  if (!user_id) {
    res.status(400).json({ error: "user_id majburiy" });
    return;
  }

  try {
    let query = `
      SELECT t.*,
        a.name as account_name, a.currency,
        c.name as category_name, c.icon as category_icon
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
    `;
    const params: unknown[] = [user_id];
    let idx = 2;

    if (type) {
      query += ` AND t.type = $${idx++}`;
      params.push(type);
    }
    if (account_id) {
      query += ` AND t.account_id = $${idx++}`;
      params.push(account_id);
    }
    if (category_id) {
      query += ` AND t.category_id = $${idx++}`;
      params.push(category_id);
    }
    if (from) {
      query += ` AND t.date >= $${idx++}`;
      params.push(from);
    }
    if (to) {
      query += ` AND t.date <= $${idx++}`;
      params.push(to);
    }

    query += " ORDER BY t.date DESC";
    query += ` LIMIT $${idx++}`;
    params.push(limit ?? 50);
    query += ` OFFSET $${idx++}`;
    params.push(offset ?? 0);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server xatolik" });
  }
});

// Statistika (oylik kirim/chiqim)
router.get("/stats", async (req: Request, res: Response) => {
  const { user_id, year, month } = req.query;
  if (!user_id) {
    res.status(400).json({ error: "user_id majburiy" });
    return;
  }

  try {
    const now = new Date();
    const y = year ?? now.getFullYear();
    const m = month ?? now.getMonth() + 1;

    const result = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
        COUNT(*) as total_transactions
       FROM transactions
       WHERE user_id = $1
         AND EXTRACT(YEAR FROM date) = $2
         AND EXTRACT(MONTH FROM date) = $3`,
      [user_id, y, m]
    );

    const byCategory = await pool.query(
      `SELECT c.name, c.icon, SUM(t.amount) as total
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1
         AND t.type = 'expense'
         AND EXTRACT(YEAR FROM t.date) = $2
         AND EXTRACT(MONTH FROM t.date) = $3
       GROUP BY c.id, c.name, c.icon
       ORDER BY total DESC`,
      [user_id, y, m]
    );

    const trend = await pool.query(
      `SELECT
        EXTRACT(YEAR FROM date) as year,
        EXTRACT(MONTH FROM date) as month,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
       FROM transactions
       WHERE user_id = $1
         AND date >= NOW() - INTERVAL '6 months'
       GROUP BY year, month
       ORDER BY year, month`,
      [user_id]
    );

    res.json({
      summary: result.rows[0],
      by_category: byCategory.rows,
      trend: trend.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server xatolik" });
  }
});

// Yangi tranzaksiya qo'shish
router.post("/", async (req: Request, res: Response) => {
  const { user_id, account_id, category_id, type, amount, note, date } =
    req.body as {
      user_id: number;
      account_id: number;
      category_id?: number;
      type: "income" | "expense" | "transfer";
      amount: number;
      note?: string;
      date?: string;
    };

  if (!user_id || !account_id || !type || !amount) {
    res.status(400).json({ error: "user_id, account_id, type va amount majburiy" });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const txResult = await client.query(
      `INSERT INTO transactions (user_id, account_id, category_id, type, amount, note, date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        user_id,
        account_id,
        category_id ?? null,
        type,
        amount,
        note ?? null,
        date ?? new Date(),
      ]
    );

    if (type === "income") {
      await client.query(
        "UPDATE accounts SET balance = balance + $1 WHERE id = $2",
        [amount, account_id]
      );
    } else if (type === "expense") {
      await client.query(
        "UPDATE accounts SET balance = balance - $1 WHERE id = $2",
        [amount, account_id]
      );
    }

    await client.query("COMMIT");
    res.status(201).json(txResult.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Server xatolik" });
  } finally {
    client.release();
  }
});

// Tranzaksiyani o'chirish
router.delete("/:id", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const tx = await client.query(
      "SELECT * FROM transactions WHERE id = $1",
      [req.params["id"]]
    );
    if (tx.rows.length === 0) {
      res.status(404).json({ error: "Tranzaksiya topilmadi" });
      return;
    }

    const { type, amount, account_id } = tx.rows[0] as {
      type: string;
      amount: number;
      account_id: number;
    };

    if (type === "income") {
      await client.query(
        "UPDATE accounts SET balance = balance - $1 WHERE id = $2",
        [amount, account_id]
      );
    } else if (type === "expense") {
      await client.query(
        "UPDATE accounts SET balance = balance + $1 WHERE id = $2",
        [amount, account_id]
      );
    }

    await client.query("DELETE FROM transactions WHERE id = $1", [
      req.params["id"],
    ]);

    await client.query("COMMIT");
    res.json({ message: "Tranzaksiya o'chirildi" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Server xatolik" });
  } finally {
    client.release();
  }
});

export default router;
