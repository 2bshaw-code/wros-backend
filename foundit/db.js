const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

let pool;

const getPool = () => {
  const connectionString = process.env.FOUND_IT_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  if (!pool) {
    pool = new Pool({
      connectionString,
      max: Number(process.env.FOUND_IT_DB_POOL_SIZE || 5),
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
};

const query = (text, params = []) => getPool().query(text, params);

const migrate = async () => {
  const sql = fs.readFileSync(path.join(__dirname, "migrations", "001_found_it.sql"), "utf8");
  await getPool().query(sql);
};

const close = async () => {
  if (pool) await pool.end();
  pool = undefined;
};

module.exports = { getPool, query, migrate, close };