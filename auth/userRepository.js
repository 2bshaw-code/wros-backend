const crypto = require("crypto");
const { query } = require("./db");

const mapUser = (row) => row && ({
  id: row.id,
  _id: row.id,
  email: row.email,
  passwordHash: row.password_hash,
  role: row.role,
  founder: row.founder,
  refreshTokenHash: row.refresh_token_hash,
  refreshTokenId: row.refresh_token_id,
});

const findByEmail = async (email) => mapUser((await query('SELECT * FROM users WHERE email=$1', [String(email || "").trim().toLowerCase()])).rows[0]);
const findById = async (id) => mapUser((await query('SELECT * FROM users WHERE id=$1', [id])).rows[0]);
const createUser = async ({ email, passwordHash, role = "merchant", founder = false }) => mapUser((await query('INSERT INTO users (id,email,password_hash,role,founder) VALUES ($1,$2,$3,$4,$5) RETURNING *', [crypto.randomUUID(), String(email).trim().toLowerCase(), passwordHash, role, founder])).rows[0]);
const updateSession = async (id, { refreshTokenHash, refreshTokenId }) => mapUser((await query('UPDATE users SET refresh_token_hash=$2,refresh_token_id=$3,updated_at=NOW() WHERE id=$1 RETURNING *', [id, refreshTokenHash, refreshTokenId])).rows[0]);
const upsertFounderMaster = async ({ email, passwordHash }) => mapUser((await query("INSERT INTO users (id,email,password_hash,role,founder,refresh_token_hash,refresh_token_id) VALUES ($1,$2,$3,'founder_master',TRUE,'','') ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash,role='founder_master',founder=TRUE,refresh_token_hash='',refresh_token_id='',updated_at=NOW() RETURNING *", [crypto.randomUUID(), String(email).trim().toLowerCase(), passwordHash])).rows[0]);
const upsertUser = async ({ email, passwordHash, role, founder = false }) => mapUser((await query('INSERT INTO users (id,email,password_hash,role,founder) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash,role=EXCLUDED.role,founder=EXCLUDED.founder,refresh_token_hash=\'\',refresh_token_id=\'\',updated_at=NOW() RETURNING *', [crypto.randomUUID(), String(email).trim().toLowerCase(), passwordHash, role, founder])).rows[0]);
const assignRole = async (email, role) => mapUser((await query('UPDATE users SET role=$2,founder=$3,refresh_token_hash=\'\',refresh_token_id=\'\',updated_at=NOW() WHERE email=$1 RETURNING *', [String(email).trim().toLowerCase(), role, role === "founder_admin" || role === "founder_master"])).rows[0]);

module.exports = { mapUser, findByEmail, findById, createUser, updateSession, upsertFounderMaster, upsertUser, assignRole };