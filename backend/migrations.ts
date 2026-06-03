import pool from "./db";

export async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT PRIMARY KEY,           -- Telegram user_id
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        username VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        icon VARCHAR(50) DEFAULT '💰',
        type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS accounts (
        id SERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        balance DECIMAL(15,2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'UZS',
        icon VARCHAR(50) DEFAULT '💳',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
        account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
        amount DECIMAL(15,2) NOT NULL,
        note TEXT,
        date TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Migrations bajarildi ✅");
  } catch (err) {
    console.error("Migration xatolik:", err);
  } finally {
    client.release();
  }
}
