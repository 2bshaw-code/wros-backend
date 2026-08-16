const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

let pool;

const getPool = () => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured");
  if (!pool) pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.AUTH_DB_POOL_SIZE || 5),
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  });
  return pool;
};

const query = (text, params = []) => getPool().query(text, params);
const migrate = () => getPool().query(fs.readFileSync(path.join(__dirname, "migrations", "001_users.sql"), "utf8"));
const close = async () => { if (pool) await pool.end(); pool = undefined; };

module.exports = { getPool, query, migrate, close };