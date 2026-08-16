const bcrypt = require("bcrypt");
const AdminUser = require("../models/AdminUser");

const DEFAULT_EMAIL = "bobby@founder.master";

const seedFounderMaster = async () => {
  if (process.env.FOUNDER_MASTER_SEED_ENABLED !== "true") return { seeded: false, reason: "disabled" };

  const email = String(process.env.FOUNDER_MASTER_EMAIL || DEFAULT_EMAIL).trim().toLowerCase();
  const password = process.env.FOUNDER_MASTER_PASSWORD;
  if (!password || password.length < 12) throw new Error("FOUNDER_MASTER_PASSWORD must contain at least 12 characters");

  const existing = await AdminUser.findOne({ email });
  const passwordHash = existing && await bcrypt.compare(password, existing.passwordHash)
    ? existing.passwordHash
    : await bcrypt.hash(password, 12);

  const user = await AdminUser.findOneAndUpdate(
    { email },
    { $set: { passwordHash, role: "founder_master", founder: true, refreshTokenHash: "", refreshTokenId: "" } },
    { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true }
  );

  console.info("Founder master account synchronized", { email: user.email, role: user.role });
  return { seeded: true, email: user.email, role: user.role };
};

module.exports = { DEFAULT_EMAIL, seedFounderMaster };