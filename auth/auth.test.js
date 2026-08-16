const test = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcrypt");

process.env.DATABASE_URL ||= "postgresql://test:test@localhost/test";
process.env.MONGO_URI ||= "mongodb://localhost/test";
process.env.JWT_SECRET ||= "auth-test-jwt-secret-32-characters";
process.env.JWT_REFRESH_SECRET ||= "auth-test-refresh-secret-32-characters";
process.env.HOSTING_URL ||= "http://localhost:8080";
process.env.CONSOLE_URL ||= "http://localhost:5173";
process.env.API_URL ||= "http://localhost:8080/api";

const userRepository = require("./userRepository");

test("founder master login uses PostgreSQL repository and bcrypt", async () => {
  const password = "fixture-master-password";
  const user = { id: "master-id", email: "bobby@founder.master", passwordHash: await bcrypt.hash(password, 4), role: "founder_master", founder: true, refreshTokenHash: "", refreshTokenId: "" };
  const originalFind = userRepository.findByEmail;
  const originalUpdate = userRepository.updateSession;
  userRepository.findByEmail = async () => user;
  userRepository.updateSession = async () => user;
  try {
    const result = await require("../services/authService").loginAdmin({ email: user.email, password });
    assert.equal(result.user.role, "founder_master");
    assert.equal(result.user.founder, true);
    assert.equal(result.user.tenantId, undefined);
  } finally {
    userRepository.findByEmail = originalFind;
    userRepository.updateSession = originalUpdate;
  }
});

test("founder master upsert is duplicate-safe and bcrypt compatible", async () => {
  const originalFind = userRepository.findByEmail;
  const originalUpsert = userRepository.upsertFounderMaster;
  const password = "fixture-master-password";
  let captured;
  userRepository.findByEmail = async () => null;
  userRepository.upsertFounderMaster = async (payload) => { captured = payload; return { id: "master-id", email: payload.email, role: "founder_master", founder: true }; };
  process.env.FOUNDER_MASTER_SEED_ENABLED = "true";
  process.env.FOUNDER_MASTER_EMAIL = "bobby@founder.master";
  process.env.FOUNDER_MASTER_PASSWORD = password;
  try {
    const result = await require("../services/founderMasterService").seedFounderMaster();
    assert.equal(result.seeded, true);
    assert.equal(await bcrypt.compare(password, captured.passwordHash), true);
  } finally {
    userRepository.findByEmail = originalFind;
    userRepository.upsertFounderMaster = originalUpsert;
  }
});