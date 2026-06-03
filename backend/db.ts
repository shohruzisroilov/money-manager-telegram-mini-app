import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool
  .connect()
  .then(() => console.log("PostgreSQL ulandi ✅"))
  .catch((err: Error) => console.error("DB xatolik:", err.message));

export default pool;
